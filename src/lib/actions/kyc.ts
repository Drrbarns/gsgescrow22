"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { kycSubmissions, profiles } from "@/lib/db/schema";
import { isDbLive } from "@/lib/env";
import { audit } from "@/lib/audit/log";
import { getSessionUser, getCurrentProfile, isAdminRole } from "@/lib/auth/session";
import { sendSms, SmsTemplates } from "@/lib/sms";

const submitSchema = z.object({
  legalName: z.string().min(2),
  docType: z.enum(["ghana_card", "passport", "drivers_license", "voter_id", "selfie", "business_cert"]),
  docNumber: z.string().optional(),
  docFrontPath: z.string().optional(),
  docBackPath: z.string().optional(),
  selfiePath: z.string().optional(),
});

export async function submitKyc(input: z.infer<typeof submitSchema>) {
  if (!isDbLive) return { ok: false, error: "DB not configured" };
  const parsed = submitSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  const user = await getSessionUser();
  if (!user) return { ok: false, error: "Sign in first" };
  const db = getDb();
  await db.insert(kycSubmissions).values({
    profileId: user.id,
    legalName: parsed.data.legalName,
    docType: parsed.data.docType,
    docNumber: parsed.data.docNumber ?? null,
    docFrontPath: parsed.data.docFrontPath ?? null,
    docBackPath: parsed.data.docBackPath ?? null,
    selfiePath: parsed.data.selfiePath ?? null,
    state: "pending",
  });
  await db
    .update(profiles)
    .set({ kycStatus: "pending", updatedAt: new Date() })
    .where(eq(profiles.id, user.id));
  await audit({
    action: "kyc.submit",
    targetType: "profile",
    targetId: user.id,
    payload: { docType: parsed.data.docType },
  });
  if (user.phone) {
    await sendSms({
      to: user.phone,
      body: SmsTemplates.kycSubmitted(),
      kind: "kyc.submit",
      targetType: "profile",
      targetId: user.id,
    });
  }
  revalidatePath("/hub/profile");
  return { ok: true };
}

export async function reviewKyc(
  submissionId: string,
  decision: "approved" | "rejected",
  notes?: string,
) {
  if (!isDbLive) return { ok: false, error: "DB not configured" };
  const reviewer = await getCurrentProfile().catch(() => null);
  if (!reviewer || !isAdminRole(reviewer.role)) {
    return { ok: false, error: "Only an admin can review KYC" };
  }
  const db = getDb();
  const [sub] = await db.select().from(kycSubmissions).where(eq(kycSubmissions.id, submissionId)).limit(1);
  if (!sub) return { ok: false, error: "Not found" };
  await db
    .update(kycSubmissions)
    .set({
      state: decision,
      reviewerId: reviewer?.id ?? null,
      reviewedAt: new Date(),
      notes: notes ?? null,
    })
    .where(eq(kycSubmissions.id, submissionId));
  await db
    .update(profiles)
    .set({
      kycStatus: decision,
      badgeEnabled: decision === "approved",
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, sub.profileId));
  await audit({
    action: decision === "approved" ? "kyc.approve" : "kyc.reject",
    targetType: "kyc_submission",
    targetId: submissionId,
    reason: notes,
  });

  const [sellerProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, sub.profileId))
    .limit(1);
  if (sellerProfile?.phone) {
    await sendSms({
      to: sellerProfile.phone,
      body:
        decision === "approved"
          ? SmsTemplates.kycApproved()
          : SmsTemplates.kycRejected(notes ?? "See your Hub for details."),
      kind: decision === "approved" ? "kyc.approved" : "kyc.rejected",
      targetType: "profile",
      targetId: sellerProfile.id,
    });
  }

  revalidatePath("/admin/kyc");
  return { ok: true };
}
