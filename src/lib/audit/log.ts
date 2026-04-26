import { headers } from "next/headers";
import { getDb } from "../db/client";
import { auditLog } from "../db/schema";
import { isDbLive } from "../env";
import { getSessionUser, getCurrentProfile } from "../auth/session";

export type AuditAction =
  | "txn.create"
  | "txn.pay"
  | "txn.dispatch"
  | "txn.deliver"
  | "txn.release"
  | "txn.auto_release"
  | "txn.cancel"
  | "txn.dispute_open"
  | "txn.dispute_resolve"
  | "payout.create"
  | "payout.approve"
  | "payout.reject"
  | "payout.paid"
  | "payout.failed"
  | "refund.issue"
  | "kyc.submit"
  | "kyc.approve"
  | "kyc.reject"
  | "user.role_change"
  | "user.suspend"
  | "user.unsuspend"
  | "user.impersonate"
  | "user.profile_update"
  | "user.name_override"
  | "user.claim_order"
  | "settings.update"
  | "listing.upsert"
  | "listing.moderate"
  | "listing.archive"
  | "listing.feature"
  | "csv.export"
  | "review.create"
  | "alert.acknowledge"
  | "webhook.received"
  | "auth.login"
  | "auth.logout";

export interface AuditEntry {
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  reason?: string;
  payload?: Record<string, unknown>;
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
}

export async function audit(entry: AuditEntry): Promise<void> {
  if (!isDbLive) {
    console.log("[audit:dryrun]", entry);
    return;
  }
  let actorId = entry.actorId;
  let actorEmail = entry.actorEmail;
  let actorRole = entry.actorRole;
  if (!actorId) {
    try {
      const profile = await getCurrentProfile();
      const user = profile ? null : await getSessionUser();
      actorId = profile?.id ?? user?.id;
      actorEmail = profile?.email ?? user?.email ?? actorEmail;
      actorRole = profile?.role ?? actorRole;
    } catch {
      // Ignore - audit must never block the action
    }
  }
  let ip: string | undefined;
  let userAgent: string | undefined;
  try {
    const h = await headers();
    ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;
    userAgent = h.get("user-agent") ?? undefined;
  } catch {
    // headers() not available in some contexts
  }
  try {
    const db = getDb();
    await db.insert(auditLog).values({
      actorId: actorId ?? null,
      actorEmail: actorEmail ?? null,
      actorRole: actorRole ?? null,
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId ?? null,
      reason: entry.reason ?? null,
      ip: ip ?? null,
      userAgent: userAgent ?? null,
      payload: entry.payload ?? {},
    });
  } catch (err) {
    console.error("[audit] failed to write entry", err);
  }
}
