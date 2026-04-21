"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { isDbLive } from "@/lib/env";
import { audit } from "@/lib/audit/log";
import { getCurrentProfile, isAdminRole } from "@/lib/auth/session";
import { isFeatureEnabled } from "@/lib/settings";
import { sendSms, SmsTemplates } from "@/lib/sms";

const IMPERSONATION_COOKIE = "sbbs_impersonate";

const roleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["buyer", "seller", "rider", "admin", "superadmin", "approver"]),
  reason: z.string().min(4),
});

export async function changeUserRole(input: z.infer<typeof roleSchema>) {
  const parsed = roleSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };
  if (!isDbLive) return { ok: false as const, error: "DB not configured" };

  const actor = await getCurrentProfile();
  if (!actor || !isAdminRole(actor.role)) return { ok: false as const, error: "Not authorized" };
  if (parsed.data.role === "superadmin" && actor.role !== "superadmin") {
    return { ok: false as const, error: "Only a superadmin can grant superadmin" };
  }

  const db = getDb();
  const [target] = await db.select().from(profiles).where(eq(profiles.id, parsed.data.userId)).limit(1);
  if (!target) return { ok: false as const, error: "User not found" };

  await db
    .update(profiles)
    .set({ role: parsed.data.role, updatedAt: new Date() })
    .where(eq(profiles.id, parsed.data.userId));

  await audit({
    action: "user.role_change",
    targetType: "profile",
    targetId: target.id,
    reason: parsed.data.reason,
    payload: { from: target.role, to: parsed.data.role, email: target.email },
  });

  if (target.phone && target.role !== parsed.data.role) {
    await sendSms({
      to: target.phone,
      body: SmsTemplates.roleChanged(parsed.data.role),
      kind: "user.role_change",
      targetType: "profile",
      targetId: target.id,
    });
  }

  revalidatePath("/admin/users");
  return { ok: true as const };
}

const suspendSchema = z.object({
  userId: z.string().uuid(),
  suspend: z.boolean(),
  reason: z.string().min(4),
});

export async function setUserSuspension(input: z.infer<typeof suspendSchema>) {
  const parsed = suspendSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };
  if (!isDbLive) return { ok: false as const, error: "DB not configured" };

  const actor = await getCurrentProfile();
  if (!actor || !isAdminRole(actor.role)) return { ok: false as const, error: "Not authorized" };

  const db = getDb();
  const [target] = await db.select().from(profiles).where(eq(profiles.id, parsed.data.userId)).limit(1);
  if (!target) return { ok: false as const, error: "User not found" };

  await db
    .update(profiles)
    .set({ suspended: parsed.data.suspend, updatedAt: new Date() })
    .where(eq(profiles.id, parsed.data.userId));

  await audit({
    action: parsed.data.suspend ? "user.suspend" : "user.unsuspend",
    targetType: "profile",
    targetId: target.id,
    reason: parsed.data.reason,
    payload: { email: target.email, role: target.role },
  });

  if (target.phone && parsed.data.suspend) {
    await sendSms({
      to: target.phone,
      body: SmsTemplates.suspendedAccount(parsed.data.reason),
      kind: "user.suspend",
      targetType: "profile",
      targetId: target.id,
    });
  }

  revalidatePath("/admin/users");
  return { ok: true as const };
}

const impersonateSchema = z.object({
  userId: z.string().uuid(),
  reason: z.string().min(4),
});

export async function startImpersonation(input: z.infer<typeof impersonateSchema>) {
  const parsed = impersonateSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };

  if (!(await isFeatureEnabled("impersonation"))) {
    return { ok: false as const, error: "Impersonation is disabled" };
  }

  const actor = await getCurrentProfile();
  if (!actor || !isAdminRole(actor.role)) return { ok: false as const, error: "Not authorized" };

  if (!isDbLive) return { ok: false as const, error: "DB not configured" };
  const db = getDb();
  const [target] = await db.select().from(profiles).where(eq(profiles.id, parsed.data.userId)).limit(1);
  if (!target) return { ok: false as const, error: "User not found" };

  const payload = {
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    targetId: target.id,
    targetEmail: target.email,
    reason: parsed.data.reason,
    startedAt: new Date().toISOString(),
  };

  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATION_COOKIE, JSON.stringify(payload), {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60,
    path: "/",
  });

  await audit({
    action: "user.impersonate",
    targetType: "profile",
    targetId: target.id,
    reason: parsed.data.reason,
    payload: { actorEmail: actor.email, targetEmail: target.email },
  });

  return { ok: true as const };
}

export async function stopImpersonation() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(IMPERSONATION_COOKIE)?.value;
  cookieStore.delete(IMPERSONATION_COOKIE);
  if (existing) {
    try {
      const payload = JSON.parse(existing) as { actorId?: string; targetId?: string };
      await audit({
        action: "auth.logout",
        targetType: "impersonation",
        targetId: payload.targetId,
        payload,
      });
    } catch {
      // ignore
    }
  }
  return { ok: true as const };
}

export async function getActiveImpersonation(): Promise<null | {
  actorId: string;
  actorEmail: string | null;
  targetId: string;
  targetEmail: string | null;
  reason: string;
  startedAt: string;
}> {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get(IMPERSONATION_COOKIE)?.value;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
