import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { moolrePsp } from "@/lib/payments";
import { markPaid } from "@/lib/actions/transaction";
import { getDb } from "@/lib/db/client";
import { payouts, webhooksLog } from "@/lib/db/schema";
import { isDbLive } from "@/lib/env";
import { audit } from "@/lib/audit/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Moolre webhook entry point.
 *
 * Moolre posts to the `callback` URL we set on /embed/link (for collections)
 * and on /open/transact/transfer (for payouts). Signature verification uses
 * an HMAC-SHA256 of the raw body with MOOLRE_WEBHOOK_SECRET when configured.
 *
 * Status rule from Moolre docs: never assume failure unless txstatus === 2.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const hdrs = await headers();
  const sig =
    hdrs.get("x-moolre-signature") ??
    hdrs.get("x-signature") ??
    hdrs.get("x-moolre-webhook-signature") ??
    "";

  const sigOk = moolrePsp.verifyWebhookSignature(raw, sig);

  let event = "unknown";
  let data: Record<string, unknown> = {};
  try {
    const parsed = moolrePsp.parseWebhookEvent(raw);
    event = parsed.event;
    data = parsed.data as Record<string, unknown>;
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 400 },
    );
  }

  const externalRef =
    (data.externalref as string | undefined) ??
    (data.externalRef as string | undefined) ??
    "";
  const transactionId = (data.transactionid as string | undefined) ?? "";
  const idempotencyKey =
    (transactionId || externalRef || "").toString() || `moolre_${Date.now()}`;
  const txStatus = Number(data.txstatus ?? data.TxStatus ?? data.status ?? -1);

  if (isDbLive) {
    try {
      await getDb()
        .insert(webhooksLog)
        .values({
          provider: "moolre",
          event,
          signatureOk: sigOk,
          idempotencyKey,
          raw: { event, data, signatureProvided: Boolean(sig) } as Record<string, unknown>,
          processedAt: new Date(),
        })
        .onConflictDoNothing();
    } catch {
      // best effort
    }
  }

  if (!sigOk) {
    return NextResponse.json(
      { ok: false, error: "Invalid signature" },
      { status: 401 },
    );
  }

  await audit({
    action: "webhook.received",
    targetType: "moolre_event",
    targetId: idempotencyKey,
    payload: { event, txStatus, externalRef, transactionId },
  });

  // ---- Collection success: buyer paid into our Moolre wallet.
  if (
    externalRef &&
    (txStatus === 1 ||
      /POS(09|10)|SUCCESS|payment\.success/i.test(event) ||
      /success/i.test(String(data.message ?? "")))
  ) {
    const ref = externalRef;
    if (isDbLive) {
      const r = await markPaid(ref);
      if (!r.ok && r.error !== undefined) {
        // markPaid is a no-op if already paid; only surface real errors.
        if (!/already/i.test(r.error)) {
          return NextResponse.json({ ok: false, error: r.error }, { status: 500 });
        }
      }
    }
  }

  // ---- Transfer (payout) status update: settle the payout row.
  if (isDbLive && transactionId && /transfer|payout|OBGH/i.test(event + " " + (data.code ?? ""))) {
    try {
      const db = getDb();
      const [payout] = await db
        .select()
        .from(payouts)
        .where(eq(payouts.pspTransferRef, transactionId))
        .limit(1);
      if (payout) {
        if (txStatus === 1) {
          await db
            .update(payouts)
            .set({ state: "paid", paidAt: new Date(), updatedAt: new Date() })
            .where(eq(payouts.id, payout.id));
          await audit({
            action: "payout.paid",
            targetType: "payout",
            targetId: payout.id,
            payload: { transferCode: transactionId, via: "webhook" },
          });
        } else if (txStatus === 2) {
          await db
            .update(payouts)
            .set({
              state: "failed",
              failureReason: String(
                Array.isArray(data.message) ? data.message.join(" ") : data.message ?? "Moolre transfer failed",
              ),
              updatedAt: new Date(),
            })
            .where(eq(payouts.id, payout.id));
          await audit({
            action: "payout.failed",
            targetType: "payout",
            targetId: payout.id,
            payload: { transferCode: transactionId, data },
          });
        }
        // txstatus 0/3 → pending / unknown → leave as processing; sweep will reconcile.
      }
    } catch {
      // swallow; sweep retries.
    }
  }

  return NextResponse.json({ ok: true });
}
