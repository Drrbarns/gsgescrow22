"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { payouts, transactions } from "@/lib/db/schema";
import { isDbLive } from "@/lib/env";
import { audit } from "@/lib/audit/log";
import { getCurrentProfile, isAdminRole } from "@/lib/auth/session";
import { getPsp } from "@/lib/payments";
import { markPaid } from "@/lib/actions/transaction";

/**
 * Force a re-verify of a payment against the active PSP. If the PSP reports
 * succeeded and our record still shows awaiting_payment, we run markPaid()
 * and the normal post-payment side effects fire (SMS + receipt email + state
 * machine progression).
 */
export async function reverifyPayment(
  ref: string,
): Promise<{ ok: boolean; status?: string; error?: string; message?: string }> {
  if (!isDbLive) return { ok: false, error: "DB not configured" };
  const actor = await getCurrentProfile();
  if (!actor || !isAdminRole(actor.role)) return { ok: false, error: "Not authorized" };

  const db = getDb();
  const [txn] = await db.select().from(transactions).where(eq(transactions.ref, ref)).limit(1);
  if (!txn) return { ok: false, error: "Transaction not found" };

  const psp = getPsp();
  try {
    const v = await psp.verifyCharge(ref);

    await audit({
      action: "webhook.received",
      targetType: "transaction",
      targetId: txn.id,
      reason: "Manual re-verify",
      payload: { pspStatus: v.status, pspAmount: v.amount, via: psp.provider, actor: actor.email },
    });

    if (v.status === "succeeded" && txn.state === "awaiting_payment") {
      const r = await markPaid(ref);
      if (!r.ok) return { ok: false, error: r.error ?? "markPaid failed" };
      revalidatePath(`/admin/transactions/${ref}`);
      return {
        ok: true,
        status: "succeeded",
        message: "PSP confirmed success — transaction moved to Paid.",
      };
    }

    revalidatePath(`/admin/transactions/${ref}`);
    return {
      ok: true,
      status: v.status,
      message:
        v.status === "succeeded"
          ? "PSP reports succeeded. Transaction is already past that state — no action taken."
          : v.status === "pending"
            ? "PSP still reports pending. Try again in a moment."
            : "PSP reports failed. If that's wrong, contact the PSP to investigate.",
    };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/**
 * Force a re-verify of a payout against the active PSP. Moolre's webhook is
 * the primary settlement path, but if a webhook was lost or delayed, ops can
 * poke this to reconcile immediately.
 */
export async function reverifyPayout(
  payoutId: string,
): Promise<{ ok: boolean; status?: string; error?: string; message?: string }> {
  if (!isDbLive) return { ok: false, error: "DB not configured" };
  const actor = await getCurrentProfile();
  if (!actor || !isAdminRole(actor.role)) return { ok: false, error: "Not authorized" };

  const db = getDb();
  const [payout] = await db.select().from(payouts).where(eq(payouts.id, payoutId)).limit(1);
  if (!payout) return { ok: false, error: "Payout not found" };
  if (!payout.pspTransferRef) {
    return { ok: false, error: "No PSP transfer reference on this payout yet." };
  }

  const psp = getPsp();
  try {
    // Use verifyCharge as a generic status lookup — adapters map their own
    // status endpoint for both payments and transfers.
    const v = await psp.verifyCharge(payout.pspTransferRef);

    await audit({
      action: "webhook.received",
      targetType: "payout",
      targetId: payout.id,
      reason: "Manual payout re-verify",
      payload: { pspStatus: v.status, via: psp.provider, actor: actor.email },
    });

    if (v.status === "succeeded" && payout.state !== "paid") {
      await db
        .update(payouts)
        .set({ state: "paid", paidAt: new Date(), updatedAt: new Date() })
        .where(eq(payouts.id, payout.id));
      await db
        .update(transactions)
        .set({ state: "completed", completedAt: new Date(), updatedAt: new Date() })
        .where(eq(transactions.id, payout.transactionId));
      await audit({
        action: "payout.paid",
        targetType: "payout",
        targetId: payout.id,
        payload: { via: "manual-reverify" },
      });
      revalidatePath("/admin/payouts");
      revalidatePath(`/admin/transactions`);
      return { ok: true, status: "paid", message: "Confirmed paid and transaction completed." };
    }

    if (v.status === "failed") {
      await db
        .update(payouts)
        .set({ state: "failed", failureReason: "Manual reverify reported failed", updatedAt: new Date() })
        .where(eq(payouts.id, payout.id));
      await audit({
        action: "payout.failed",
        targetType: "payout",
        targetId: payout.id,
        payload: { via: "manual-reverify" },
      });
      revalidatePath("/admin/payouts");
      return { ok: true, status: "failed", message: "PSP reports failed. Retry or reissue." };
    }

    return {
      ok: true,
      status: v.status,
      message: "Still pending at the PSP. Moolre's rule: never assume failure unless txstatus is explicitly 2.",
    };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
