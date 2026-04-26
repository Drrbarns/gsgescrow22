"use server";

import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { isDbLive } from "@/lib/env";
import { getSessionUser } from "@/lib/auth/session";
import { audit } from "@/lib/audit/log";
import { getSettings } from "@/lib/settings";
import { claimPendingSellerOrders, claimPendingBuyerOrders } from "@/lib/actions/claim-orders";

/**
 * Called right after a successful sign-in. If the user was created via a
 * Supabase trigger the profile row already exists; otherwise we insert one.
 * Optionally backfills the display_name captured at signup.
 *
 * Also auto-promotes the very first approved email in
 * `platform.bootstrap_admin_emails` to superadmin on first login.
 */
export async function ensureProfile(input: { displayName?: string }): Promise<
  { ok: true } | { ok: false; error: string }
> {
  if (!isDbLive) return { ok: false, error: "DB not configured" };
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Not signed in" };

  const db = getDb();
  const [existing] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);

  const settings = await getSettings().catch(() => null);
  const bootstrapEmails = new Set(
    (settings?.bootstrap_admin_emails ?? []).map((e) => e.toLowerCase()),
  );
  const shouldPromote = Boolean(
    user.email && bootstrapEmails.has(user.email.toLowerCase()),
  );

  if (!existing) {
    await db.insert(profiles).values({
      id: user.id,
      email: user.email ?? null,
      phone: user.phone ?? null,
      displayName: input.displayName || user.email?.split("@")[0] || "New user",
      role: shouldPromote ? "superadmin" : "buyer",
    });
    await audit({
      action: "user.profile_update",
      targetType: "profile",
      targetId: user.id,
      reason: "Profile created on first sign-in",
      payload: { email: user.email, phone: user.phone, promoted: shouldPromote },
    });
    return { ok: true };
  }

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  let dirty = false;
  if (input.displayName && !existing.displayName) {
    patch.displayName = input.displayName;
    dirty = true;
  }
  if (user.email && !existing.email) {
    patch.email = user.email;
    dirty = true;
  }
  if (user.phone && !existing.phone) {
    patch.phone = user.phone;
    dirty = true;
  }
  if (shouldPromote && existing.role !== "superadmin" && existing.role !== "admin") {
    patch.role = "superadmin";
    dirty = true;
  }

  if (dirty) {
    await db.update(profiles).set(patch).where(eq(profiles.id, user.id));
    await audit({
      action: "user.profile_update",
      targetType: "profile",
      targetId: user.id,
      reason: "Auto-backfill on sign-in",
      payload: patch,
    });
  }

  // Best-effort: attach any orders that were sent to this person's email
  // or phone while they were offline. Failures are logged but never
  // surface as a sign-in error.
  try {
    await claimPendingSellerOrders({});
    await claimPendingBuyerOrders();
  } catch (err) {
    console.warn("[ensureProfile] claim sweep failed:", err);
  }

  return { ok: true };
}
