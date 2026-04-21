"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  transactions,
  payments,
  payouts,
  transactionEvents,
  alerts,
  profiles,
} from "@/lib/db/schema";
import { env, isDbLive } from "@/lib/env";
import { audit } from "@/lib/audit/log";
import { calculateFees, getPsp } from "@/lib/payments";
import {
  formatGhs,
  generateDeliveryCode,
  generateRef,
  normalizeGhPhone,
} from "@/lib/utils";
import { assertTransition, type TxnState } from "@/lib/state/transaction";
import { getCurrentProfile, isAdminRole } from "@/lib/auth/session";
import { sendSms, sendOpsAlert, SmsTemplates } from "@/lib/sms";
import {
  dispatchedEmail,
  paymentReceivedEmail,
  payoutSentEmail,
  releasedEmail,
  sendEmail,
} from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { evaluateSellerPayoutRisk, recordFlags } from "@/lib/fraud/rules";
import { idempotent } from "@/lib/idempotency";
import { namesAreSimilar } from "@/lib/payments/name-match";

const createSchema = z.object({
  initiatedBy: z.enum(["buyer", "seller"]),
  buyerName: z.string().min(2),
  buyerPhone: z.string().min(7),
  buyerEmail: z.string().email().optional().or(z.literal("")),
  sellerName: z.string().min(2),
  sellerPhone: z.string().min(7),
  sellerHandle: z.string().optional(),
  itemDescription: z.string().min(2),
  itemLink: z.string().url().optional().or(z.literal("")),
  deliveryAddress: z.string().min(3),
  deliveryCity: z.string().min(2),
  productCedis: z.coerce.number().min(1),
  deliveryCedis: z.coerce.number().min(0).default(0),
  idempotencyKey: z.string().optional(),
});

export type CreateTxnInput = z.infer<typeof createSchema>;

export async function createTransaction(
  input: CreateTxnInput,
): Promise<
  | { ok: true; ref: string; authorizationUrl: string; transactionId: string }
  | { ok: false; error: string }
> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (!isDbLive) {
    return {
      ok: false,
      error: "Database is not configured. Add DATABASE_URL to enable transactions.",
    };
  }

  const settings = await getSettings();
  if (settings.pause_new_transactions) {
    return { ok: false, error: "SBBS has temporarily paused new transactions. Try again shortly." };
  }

  const data = parsed.data;
  const buyerPhone = normalizeGhPhone(data.buyerPhone);
  const sellerPhone = normalizeGhPhone(data.sellerPhone);
  if (!buyerPhone || !sellerPhone) {
    return { ok: false, error: "Phone numbers must be valid Ghana numbers" };
  }

  const productAmount = Math.round(data.productCedis * 100);
  const deliveryAmount = Math.round(data.deliveryCedis * 100);
  if (productAmount > settings.txn_cap_pesewas) {
    return {
      ok: false,
      error: `Transaction exceeds the current cap of ${formatGhs(settings.txn_cap_pesewas)}`,
    };
  }

  const fees = calculateFees({
    productAmount,
    deliveryAmount,
    buyerFeeBps: settings.buyer_fee_bps,
    sellerFeeBps: settings.seller_fee_bps,
    riderReleaseFee: settings.rider_release_fee_pesewas,
  });

  const profile = await getCurrentProfile().catch(() => null);
  const idemKey = data.idempotencyKey
    ? `txn:create:${data.idempotencyKey}`
    : `txn:create:${profile?.id ?? "anon"}:${data.buyerPhone}:${data.sellerPhone}:${productAmount}:${deliveryAmount}:${data.itemDescription.slice(0, 60)}`;

  return idempotent(idemKey, async () => {
    const ref = generateRef();
    const db = getDb();
    const [txn] = await db
      .insert(transactions)
      .values({
        ref,
        initiatedBy: data.initiatedBy,
        buyerId: data.initiatedBy === "buyer" ? profile?.id ?? null : null,
        sellerId: data.initiatedBy === "seller" ? profile?.id ?? null : null,
        buyerName: data.buyerName,
        buyerPhone,
        sellerName: data.sellerName,
        sellerPhone,
        itemDescription: data.itemDescription,
        itemLink: data.itemLink || null,
        deliveryAddress: data.deliveryAddress,
        deliveryCity: data.deliveryCity,
        productAmount,
        deliveryAmount,
        buyerFee: fees.buyerFee,
        sellerFee: fees.sellerFee,
        riderReleaseFee: fees.riderReleaseFee,
        totalCharged: fees.totalCharged,
        sellerPayoutAmount: fees.sellerPayout,
        riderPayoutAmount: fees.riderPayout,
        state: "awaiting_payment",
        metadata: {
          sellerHandle: data.sellerHandle ?? null,
          buyerEmail: data.buyerEmail || null,
        },
      })
      .returning();

    if (!txn) return { ok: false as const, error: "Failed to create transaction" };

    await db.insert(transactionEvents).values({
      transactionId: txn.id,
      fromState: "created",
      toState: "awaiting_payment",
      actorId: profile?.id ?? null,
      actorRole: profile?.role ?? data.initiatedBy,
      note: "Transaction created",
    });

    await audit({
      action: "txn.create",
      targetType: "transaction",
      targetId: txn.id,
      payload: {
        ref,
        initiatedBy: data.initiatedBy,
        productAmount,
        deliveryAmount,
        totalCharged: fees.totalCharged,
      },
    });

    const psp = getPsp();
    const callbackUrl = `${env.NEXT_PUBLIC_APP_URL}/buy/return?ref=${encodeURIComponent(ref)}`;
    let init;
    try {
      init = await psp.initCharge({
        reference: ref,
        amount: fees.totalCharged,
        email:
          data.buyerEmail ||
          profile?.email ||
          `${ref.toLowerCase()}@buyers.sbbs.gh`,
        phone: buyerPhone,
        callbackUrl,
        metadata: { ref, transactionId: txn.id },
      });
    } catch (err) {
      return { ok: false as const, error: (err as Error).message };
    }

    await db.insert(payments).values({
      transactionId: txn.id,
      psp: psp.provider,
      pspReference: init.reference,
      pspAccessCode: init.accessCode,
      authorizationUrl: init.authorizationUrl,
      amount: fees.totalCharged,
      state: "initialized",
      raw: init.raw as Record<string, unknown>,
    });

    // Notify both parties right after creation — the seller so they know a
    // protected order was opened in their name, the buyer with the pay-now
    // link in case they lose the browser tab.
    if (data.initiatedBy === "buyer") {
      await sendSms({
        to: sellerPhone,
        body: SmsTemplates.orderCreatedSeller(
          data.sellerName.split(" ")[0],
          ref,
          formatGhs(fees.totalCharged),
          `${env.NEXT_PUBLIC_APP_URL}/t/${ref}`,
        ),
        ref,
        kind: "txn.created",
        targetType: "transaction",
        targetId: txn.id,
      });
    } else {
      await sendSms({
        to: buyerPhone,
        body: SmsTemplates.orderCreatedBuyer(
          data.buyerName.split(" ")[0],
          ref,
          formatGhs(fees.totalCharged),
          init.authorizationUrl,
        ),
        ref,
        kind: "txn.created",
        targetType: "transaction",
        targetId: txn.id,
      });
    }

    return {
      ok: true as const,
      ref,
      authorizationUrl: init.authorizationUrl,
      transactionId: txn.id,
    };
  });
}

export async function markPaid(ref: string): Promise<{ ok: boolean; error?: string }> {
  // Webhooks (no session) and admin callers are the only legit invokers.
  // A logged-in non-admin trying to forge payment must be rejected.
  const actor = await getCurrentProfile().catch(() => null);
  if (actor && !isAdminRole(actor.role)) {
    return { ok: false, error: "Not authorized" };
  }
  return idempotent(`txn:paid:${ref}`, async () => {
    const db = getDb();
    const [txn] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.ref, ref))
      .limit(1);
    if (!txn) return { ok: false, error: "Transaction not found" };
    if (txn.state !== "awaiting_payment") return { ok: true };

    try {
      assertTransition(txn.state as TxnState, "paid");
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }

    const code = generateDeliveryCode();
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");

    await db
      .update(transactions)
      .set({
        state: "paid",
        paidAt: new Date(),
        deliveryCodeHash: codeHash,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, txn.id));

    await db
      .update(payments)
      .set({ state: "succeeded", updatedAt: new Date() })
      .where(eq(payments.transactionId, txn.id));

    await db.insert(transactionEvents).values({
      transactionId: txn.id,
      fromState: txn.state,
      toState: "paid",
      note: "Payment captured by PSP",
    });

    await audit({
      action: "txn.pay",
      targetType: "transaction",
      targetId: txn.id,
      payload: { ref, totalCharged: txn.totalCharged },
    });

    await sendSms({
      to: txn.sellerPhone,
      body: SmsTemplates.paymentReceived(
        txn.sellerName.split(" ")[0],
        ref,
        formatGhs(txn.totalCharged),
      ),
      ref,
      kind: "txn.paid",
      targetType: "transaction",
      targetId: txn.id,
    });
    await sendSms({
      to: txn.buyerPhone,
      body: SmsTemplates.paymentHeldBuyer(
        txn.buyerName.split(" ")[0],
        ref,
        formatGhs(txn.totalCharged),
      ),
      ref,
      kind: "txn.paid",
      targetType: "transaction",
      targetId: txn.id,
    });

    const buyerEmail = (txn.metadata as { buyerEmail?: string } | null)?.buyerEmail;
    if (buyerEmail) {
      await sendEmail({
        to: buyerEmail,
        subject: `Payment held safely · ${ref}`,
        html: paymentReceivedEmail({
          ref,
          sellerName: txn.sellerName,
          itemDescription: txn.itemDescription,
          totalCharged: txn.totalCharged,
        }),
        tags: [{ name: "event", value: "txn.paid" }, { name: "ref", value: ref }],
      });
    }

    return { ok: true };
  });
}

export async function markDispatched(
  ref: string,
  opts?: { riderName?: string; riderPhone?: string },
): Promise<{ ok: boolean; error?: string; deliveryCode?: string }> {
  const db = getDb();
  const [txn] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.ref, ref))
    .limit(1);
  if (!txn) return { ok: false, error: "Transaction not found" };

  // Only the seller on this deal (or an admin/approver helping out) can
  // dispatch. Anonymous callers are blocked.
  const actor = await getCurrentProfile().catch(() => null);
  if (!actor) return { ok: false, error: "Sign in first" };
  const isSeller = actor.id === txn.sellerId;
  if (!isSeller && !isAdminRole(actor.role)) {
    return { ok: false, error: "Only the seller can mark this as dispatched." };
  }

  try {
    assertTransition(txn.state as TxnState, "dispatched");
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const settings = await getSettings();
  const code = generateDeliveryCode();
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  const autoReleaseAt = new Date(Date.now() + settings.auto_release_hours * 3_600_000);

  await db
    .update(transactions)
    .set({
      state: "dispatched",
      dispatchedAt: new Date(),
      deliveryCodeHash: codeHash,
      deliveryCodeShown: false,
      autoReleaseAt,
      metadata: {
        ...((txn.metadata as Record<string, unknown>) ?? {}),
        rider: opts?.riderName
          ? { name: opts.riderName, phone: opts.riderPhone ?? null }
          : null,
      },
      updatedAt: new Date(),
    })
    .where(eq(transactions.id, txn.id));

  await db.insert(transactionEvents).values({
    transactionId: txn.id,
    fromState: txn.state,
    toState: "dispatched",
    note: "Seller marked dispatched",
  });

  await audit({
    action: "txn.dispatch",
    targetType: "transaction",
    targetId: txn.id,
    payload: { ref, rider: opts ?? null },
  });

  await sendSms({
    to: txn.buyerPhone,
    body: SmsTemplates.dispatchedToBuyer(ref, code),
    ref,
    kind: "txn.dispatched",
    targetType: "transaction",
    targetId: txn.id,
  });
  await sendSms({
    to: txn.sellerPhone,
    body: SmsTemplates.dispatchedToSeller(ref),
    ref,
    kind: "txn.dispatched",
    targetType: "transaction",
    targetId: txn.id,
  });

  const buyerEmail = (txn.metadata as { buyerEmail?: string } | null)?.buyerEmail;
  if (buyerEmail) {
    await sendEmail({
      to: buyerEmail,
      subject: `Dispatched · ${ref}`,
      html: dispatchedEmail({
        ref,
        deliveryCode: code,
        itemDescription: txn.itemDescription,
        sellerName: txn.sellerName,
      }),
      tags: [{ name: "event", value: "txn.dispatched" }, { name: "ref", value: ref }],
    });
  }

  if (txn.riderPayoutAmount > 0 && opts?.riderPhone) {
    await db.insert(payouts).values({
      transactionId: txn.id,
      payeeId: null,
      payeeName: opts.riderName ?? "Rider",
      payeePhone: opts.riderPhone,
      payeeMomoNetwork: "MTN",
      kind: "rider",
      amount: txn.riderPayoutAmount,
      state: "pending_approval",
      riskFlags: [],
    });
    await audit({
      action: "payout.create",
      targetType: "transaction",
      targetId: txn.id,
      payload: { kind: "rider", amount: txn.riderPayoutAmount },
    });
  }

  revalidatePath("/hub");
  return { ok: true, deliveryCode: code };
}

export async function confirmDelivery(
  ref: string,
  enteredCode?: string,
): Promise<{ ok: boolean; error?: string }> {
  const db = getDb();
  const [txn] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.ref, ref))
    .limit(1);
  if (!txn) return { ok: false, error: "Transaction not found" };

  // Two valid paths to release funds:
  //   1. Caller knows the 6-digit delivery code (passed hand-to-hand).
  //   2. Caller is the signed-in buyer on the deal — or an admin/approver.
  const actor = await getCurrentProfile().catch(() => null);
  if (enteredCode) {
    const hash = crypto.createHash("sha256").update(enteredCode).digest("hex");
    if (hash !== txn.deliveryCodeHash) {
      return { ok: false, error: "Delivery code does not match" };
    }
  } else {
    if (!actor) return { ok: false, error: "Sign in or enter the delivery code" };
    const isBuyer = actor.id === txn.buyerId;
    if (!isBuyer && !isAdminRole(actor.role)) {
      return { ok: false, error: "Only the buyer can confirm without a code." };
    }
  }
  try {
    assertTransition(txn.state as TxnState, "released");
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  await db
    .update(transactions)
    .set({
      state: "released",
      deliveredAt: txn.deliveredAt ?? new Date(),
      releasedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(transactions.id, txn.id));

  await db.insert(transactionEvents).values({
    transactionId: txn.id,
    fromState: txn.state,
    toState: "released",
    note: enteredCode ? "Buyer code released" : "Buyer confirmed in Hub",
  });

  await audit({
    action: "txn.release",
    targetType: "transaction",
    targetId: txn.id,
    payload: { ref, method: enteredCode ? "code" : "hub_confirm" },
  });

  await queueSellerPayout(txn.id);
  await sendSms({
    to: txn.sellerPhone,
    body: SmsTemplates.releasedToSeller(ref),
    ref,
    kind: "txn.released",
    targetType: "transaction",
    targetId: txn.id,
  });

  const sellerProfile = txn.sellerId
    ? (await db.select().from(profiles).where(eq(profiles.id, txn.sellerId)).limit(1))[0]
    : undefined;
  if (sellerProfile?.email) {
    await sendEmail({
      to: sellerProfile.email,
      subject: `Released — payout queued · ${ref}`,
      html: releasedEmail({
        ref,
        sellerName: txn.sellerName,
        amount: txn.sellerPayoutAmount,
      }),
      tags: [{ name: "event", value: "txn.released" }, { name: "ref", value: ref }],
    });
  }

  revalidatePath("/hub");
  return { ok: true };
}

async function queueSellerPayout(transactionId: string) {
  const db = getDb();
  const [txn] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, transactionId))
    .limit(1);
  if (!txn) return;

  const flags = await evaluateSellerPayoutRisk({
    transactionId: txn.id,
    amount: txn.sellerPayoutAmount,
    sellerId: txn.sellerId,
    sellerPhone: txn.sellerPhone,
  });

  const [payout] = await db
    .insert(payouts)
    .values({
      transactionId: txn.id,
      payeeId: txn.sellerId,
      payeeName: txn.sellerName,
      payeePhone: txn.sellerPhone,
      payeeMomoNetwork: "MTN",
      kind: "seller",
      amount: txn.sellerPayoutAmount,
      state: "pending_approval",
      riskFlags: flags.map((f) => f.code),
    })
    .returning();

  await db
    .update(transactions)
    .set({ state: "payout_pending", updatedAt: new Date() })
    .where(eq(transactions.id, txn.id));

  await db.insert(transactionEvents).values({
    transactionId: txn.id,
    fromState: txn.state,
    toState: "payout_pending",
    note: flags.length > 0 ? `Payout queued · flags: ${flags.map((f) => f.code).join(", ")}` : "Payout queued for approver",
  });

  if (payout && flags.length > 0) {
    await recordFlags(flags, { type: "payout", id: payout.id, ref: txn.ref });
  }
}

interface PayoutMetadata {
  nameOverride?: { by: string; reason: string; at: string };
  validatedAccountName?: string;
  pspValidatedOverlap?: number;
}

export async function approvePayout(
  payoutId: string,
  _legacyApproverId?: string,
): Promise<{
  ok: boolean;
  error?: string;
  needsSecondApprover?: boolean;
  needsNameOverride?: boolean;
  pspAccountName?: string;
  queuedName?: string;
}> {
  // Never trust a client-supplied approverId — read it from the session.
  const actor = await getCurrentProfile().catch(() => null);
  if (!actor) return { ok: false, error: "Sign in first" };
  if (!isAdminRole(actor.role) && actor.role !== "approver") {
    return { ok: false, error: "Only an approver can approve payouts." };
  }
  const approverId = actor.id;
  // Swallow the legacy arg if any caller still passes it; ignore mismatches.
  void _legacyApproverId;

  return idempotent(`payout:approve:${payoutId}:${approverId}`, async () => {
    const settings = await getSettings();
    if (settings.pause_payouts) return { ok: false, error: "Payouts are currently paused." };

    const db = getDb();
    const [payout] = await db.select().from(payouts).where(eq(payouts.id, payoutId)).limit(1);
    if (!payout) return { ok: false, error: "Payout not found" };
    if (payout.state !== "pending_approval" && payout.state !== "approved") {
      return { ok: false, error: `Payout is ${payout.state}, cannot approve` };
    }

    const flags = (payout.riskFlags ?? []) as string[];
    if (flags.includes("seller_suspended") || flags.includes("repeat_disputes") || flags.includes("kyc_missing")) {
      return { ok: false, error: `Payout blocked by risk rule: ${flags.join(", ")}. Review the seller first.` };
    }

    // PSP-side name validation — run BEFORE approval so the approver sees it.
    const meta = ((payout.raw as PayoutMetadata | null) ?? {}) as PayoutMetadata;
    const hasOverride = Boolean(meta.nameOverride);
    if (!hasOverride && !flags.includes("name_matched")) {
      const psp = getPsp();
      if (typeof psp.validateAccountName === "function") {
        const localPhone = payout.payeePhone.replace(/^\+233/, "0");
        const network = (payout.payeeMomoNetwork ?? "MTN") as "MTN" | "VOD" | "ATL";
        try {
          const v = await psp.validateAccountName({ phone: localPhone, network });
          if (v.ok && v.accountName) {
            const { ok: matches, overlap } = namesAreSimilar(v.accountName, payout.payeeName);
            if (!matches) {
              const nextFlags = Array.from(new Set([...flags, "name_mismatch"]));
              await db
                .update(payouts)
                .set({
                  riskFlags: nextFlags,
                  raw: {
                    ...meta,
                    validatedAccountName: v.accountName,
                    pspValidatedOverlap: overlap,
                  } as unknown as Record<string, unknown>,
                  updatedAt: new Date(),
                })
                .where(eq(payouts.id, payoutId));

              await db.insert(alerts).values({
                kind: "psp.name_mismatch",
                severity: "critical",
                title: `Name mismatch on payout to ${payout.payeePhone}`,
                message: `PSP reports "${v.accountName}", payout queued for "${payout.payeeName}". Blocked pending superadmin override.`,
                targetType: "payout",
                targetId: payout.id,
                payload: {
                  expected: payout.payeeName,
                  actual: v.accountName,
                  overlap,
                  phone: payout.payeePhone,
                } as unknown as Record<string, unknown>,
              });

              await audit({
                action: "payout.reject",
                targetType: "payout",
                targetId: payout.id,
                reason: "Name mismatch auto-blocked",
                payload: { expected: payout.payeeName, actual: v.accountName, overlap },
              });

              await sendOpsAlert(
                "Payout blocked — name mismatch",
                `PSP: ${v.accountName} · queued: ${payout.payeeName} · ${payout.payeePhone} · ${formatGhs(payout.amount)}`,
                { kind: "psp.name_mismatch", targetId: payout.id },
              );

              return {
                ok: false,
                error: `Name mismatch — PSP says "${v.accountName}", queued for "${payout.payeeName}". Requires superadmin override.`,
                needsNameOverride: true,
                pspAccountName: v.accountName,
                queuedName: payout.payeeName,
              };
            }
            // Match — stamp the flag so we don't re-validate on every retry.
            await db
              .update(payouts)
              .set({
                riskFlags: Array.from(new Set([...flags, "name_matched"])),
                raw: {
                  ...meta,
                  validatedAccountName: v.accountName,
                  pspValidatedOverlap: overlap,
                } as unknown as Record<string, unknown>,
                updatedAt: new Date(),
              })
              .where(eq(payouts.id, payoutId));
          }
        } catch {
          // Validation is best-effort — don't block on endpoint blips.
        }
      }
    }

    const needsTwo = payout.amount >= settings.two_approver_threshold_pesewas;
    const alreadyApprovedBy = payout.approvedBy;
    if (needsTwo && !alreadyApprovedBy) {
      await db
        .update(payouts)
        .set({
          state: "approved",
          approvedBy: approverId,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(payouts.id, payoutId));
      await audit({
        action: "payout.approve",
        targetType: "payout",
        targetId: payoutId,
        payload: { stage: "first", amount: payout.amount },
      });
      revalidatePath("/admin/payouts/approvals");
      return { ok: true, needsSecondApprover: true };
    }
    if (needsTwo && alreadyApprovedBy === approverId) {
      return { ok: false, error: "Second approver must be a different person." };
    }

    return executeTransfer(payout.id, approverId);
  });
}

/**
 * Superadmin-only override for a name-mismatched payout. Once set, the
 * approval flow sees `metadata.nameOverride` and skips the block.
 */
export async function overridePayoutNameMismatch(
  payoutId: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!reason || reason.length < 6) {
    return { ok: false, error: "Please enter a reason (6+ characters)." };
  }
  const actor = await getCurrentProfile();
  if (!actor || actor.role !== "superadmin") {
    return { ok: false, error: "Only a superadmin can override a name mismatch." };
  }
  const db = getDb();
  const [payout] = await db.select().from(payouts).where(eq(payouts.id, payoutId)).limit(1);
  if (!payout) return { ok: false, error: "Payout not found" };

  const meta = ((payout.raw as PayoutMetadata | null) ?? {}) as PayoutMetadata;
  const next: PayoutMetadata = {
    ...meta,
    nameOverride: {
      by: actor.id,
      reason,
      at: new Date().toISOString(),
    },
  };

  await db
    .update(payouts)
    .set({
      raw: next as unknown as Record<string, unknown>,
      updatedAt: new Date(),
    })
    .where(eq(payouts.id, payoutId));

  await audit({
    action: "user.name_override",
    targetType: "payout",
    targetId: payoutId,
    reason: `Name mismatch override: ${reason}`,
    payload: {
      actorEmail: actor.email,
      expected: payout.payeeName,
      actual: meta.validatedAccountName,
      overlap: meta.pspValidatedOverlap,
    },
  });

  revalidatePath("/admin/payouts/approvals");
  return { ok: true };
}

async function executeTransfer(payoutId: string, approverId: string): Promise<{ ok: boolean; error?: string }> {
  const db = getDb();
  const [payout] = await db.select().from(payouts).where(eq(payouts.id, payoutId)).limit(1);
  if (!payout) return { ok: false, error: "Payout not found" };

  const psp = getPsp();
  const localPhone = payout.payeePhone.replace(/^\+233/, "0");
  const network = (payout.payeeMomoNetwork ?? "MTN") as "MTN" | "VOD" | "ATL";

  let recipientCode: string;
  try {
    const r = await psp.createRecipient({
      name: payout.payeeName,
      phone: localPhone,
      network,
    });
    recipientCode = r.recipientCode;
  } catch (err) {
    await db
      .update(payouts)
      .set({ state: "failed", failureReason: (err as Error).message, updatedAt: new Date() })
      .where(eq(payouts.id, payoutId));
    return { ok: false, error: (err as Error).message };
  }

  let transferRef: string | null = null;
  let transferStatus: "pending" | "succeeded" | "failed" = "pending";
  try {
    const t = await psp.initTransfer({
      reference: `PAY-${payout.id}`,
      amount: payout.amount,
      recipientCode,
      phone: localPhone,
      network,
      reason: `SBBS payout for ${payout.transactionId}`,
    });
    transferRef = t.transferCode;
    transferStatus = t.status;
  } catch (err) {
    await db
      .update(payouts)
      .set({
        state: "failed",
        approvedBy: approverId,
        approvedAt: new Date(),
        failureReason: (err as Error).message,
        updatedAt: new Date(),
      })
      .where(eq(payouts.id, payoutId));
    await audit({
      action: "payout.failed",
      targetType: "payout",
      targetId: payoutId,
      payload: { error: (err as Error).message },
    });
    return { ok: false, error: (err as Error).message };
  }

  await db
    .update(payouts)
    .set({
      state: transferStatus === "succeeded" ? "paid" : "processing",
      approvedBy: approverId,
      approvedAt: new Date(),
      pspTransferRef: transferRef,
      paidAt: transferStatus === "succeeded" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(payouts.id, payoutId));

  const [txn] = await db.select().from(transactions).where(eq(transactions.id, payout.transactionId)).limit(1);
  if (txn) {
    await db
      .update(transactions)
      .set({
        state: transferStatus === "succeeded" ? "completed" : "payout_approved",
        completedAt: transferStatus === "succeeded" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, txn.id));

    await db.insert(transactionEvents).values({
      transactionId: txn.id,
      fromState: "payout_pending",
      toState: transferStatus === "succeeded" ? "completed" : "payout_approved",
      actorId: approverId,
      actorRole: "approver",
      note: "Payout approved and dispatched",
    });
  }

  await audit({
    action: transferStatus === "succeeded" ? "payout.paid" : "payout.approve",
    targetType: "payout",
    targetId: payoutId,
    payload: { transferRef, status: transferStatus, amount: payout.amount },
  });

  if (transferStatus === "succeeded") {
    await sendSms({
      to: payout.payeePhone,
      body: SmsTemplates.payoutSent(payout.transactionId.slice(0, 8), formatGhs(payout.amount)),
      kind: "payout.paid",
      targetType: "payout",
      targetId: payout.id,
    });
    if (payout.payeeId) {
      const [p] = await db.select().from(profiles).where(eq(profiles.id, payout.payeeId)).limit(1);
      if (p?.email && txn) {
        await sendEmail({
          to: p.email,
          subject: `Payout sent · ${formatGhs(payout.amount)}`,
          html: payoutSentEmail({ ref: txn.ref, amount: payout.amount, phone: payout.payeePhone }),
          tags: [{ name: "event", value: "payout.paid" }, { name: "ref", value: txn.ref }],
        });
      }
    }
  }

  revalidatePath("/admin/payouts");
  return { ok: true };
}

export async function rejectPayout(
  payoutId: string,
  reasonOrLegacyApproverId: string,
  maybeReason?: string,
): Promise<{ ok: boolean; error?: string }> {
  const actor = await getCurrentProfile().catch(() => null);
  if (!actor) return { ok: false, error: "Sign in first" };
  if (!isAdminRole(actor.role) && actor.role !== "approver") {
    return { ok: false, error: "Only an approver can reject payouts." };
  }
  const approverId = actor.id;
  // Two call shapes: new `rejectPayout(id, reason)` and legacy
  // `rejectPayout(id, approverId, reason)`. Pick whichever looks like prose.
  const reason = maybeReason ?? reasonOrLegacyApproverId;
  if (!reason || reason.length < 4) return { ok: false, error: "Reason required" };

  const db = getDb();
  const [payout] = await db
    .select()
    .from(payouts)
    .where(eq(payouts.id, payoutId))
    .limit(1);
  if (!payout) return { ok: false, error: "Payout not found" };
  await db
    .update(payouts)
    .set({
      state: "rejected",
      rejectedBy: approverId,
      rejectedAt: new Date(),
      rejectionReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(payouts.id, payoutId));

  await audit({
    action: "payout.reject",
    targetType: "payout",
    targetId: payoutId,
    reason,
    payload: { amount: payout.amount },
  });

  await sendSms({
    to: payout.payeePhone,
    body: SmsTemplates.payoutRejected(payout.transactionId.slice(0, 8), reason),
    kind: "payout.rejected",
    targetType: "payout",
    targetId: payout.id,
  });

  revalidatePath("/admin/payouts");
  return { ok: true };
}

export async function autoReleaseSweep(): Promise<{ released: number }> {
  const db = getDb();
  const now = new Date();
  const candidates = await db
    .select()
    .from(transactions);
  let count = 0;
  for (const t of candidates) {
    if (
      t.state === "dispatched" &&
      t.autoReleaseAt &&
      t.autoReleaseAt <= now
    ) {
      try {
        await db
          .update(transactions)
          .set({
            state: "released",
            deliveredAt: t.deliveredAt ?? now,
            releasedAt: now,
            updatedAt: now,
          })
          .where(eq(transactions.id, t.id));
        await db.insert(transactionEvents).values({
          transactionId: t.id,
          fromState: "dispatched",
          toState: "released",
          note: "Auto-released after timer",
        });
        await audit({
          action: "txn.auto_release",
          targetType: "transaction",
          targetId: t.id,
          payload: { ref: t.ref },
        });
        await queueSellerPayout(t.id);
        await sendSms({
          to: t.sellerPhone,
          body: SmsTemplates.autoReleasedSeller(t.ref),
          ref: t.ref,
          kind: "txn.auto_release",
          targetType: "transaction",
          targetId: t.id,
        });
        count += 1;
      } catch {
        // continue
      }
    }
  }
  return { released: count };
}

export async function cancelTransaction(
  ref: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  const db = getDb();
  const [txn] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.ref, ref))
    .limit(1);
  if (!txn) return { ok: false, error: "Not found" };

  const actor = await getCurrentProfile().catch(() => null);
  if (!actor) return { ok: false, error: "Sign in first" };
  const isParty = actor.id === txn.buyerId || actor.id === txn.sellerId;
  if (!isParty && !isAdminRole(actor.role)) {
    return { ok: false, error: "Only a party to this deal can cancel it." };
  }

  try {
    assertTransition(txn.state as TxnState, "cancelled");
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  await db
    .update(transactions)
    .set({ state: "cancelled", cancelledAt: new Date(), updatedAt: new Date() })
    .where(eq(transactions.id, txn.id));
  await db.insert(transactionEvents).values({
    transactionId: txn.id,
    fromState: txn.state,
    toState: "cancelled",
    note: reason,
  });
  await audit({
    action: "txn.cancel",
    targetType: "transaction",
    targetId: txn.id,
    reason,
  });

  await sendSms({
    to: txn.buyerPhone,
    body: SmsTemplates.cancelledBuyer(ref, reason),
    ref,
    kind: "txn.cancel",
    targetType: "transaction",
    targetId: txn.id,
  });
  await sendSms({
    to: txn.sellerPhone,
    body: SmsTemplates.cancelledSeller(ref, reason),
    ref,
    kind: "txn.cancel",
    targetType: "transaction",
    targetId: txn.id,
  });

  revalidatePath("/hub");
  return { ok: true };
}

/**
 * Reconciliation sweep — for every transaction in awaiting_payment or
 * processing payout, ask the PSP what it thinks the real status is and
 * converge. Run hourly via cron.
 */
export async function reconcileSweep(): Promise<{
  paymentsReconciled: number;
  payoutsReconciled: number;
}> {
  const db = getDb();
  const psp = getPsp();
  let paymentsReconciled = 0;
  let payoutsReconciled = 0;

  const pendingTxns = await db
    .select()
    .from(transactions)
    .where(eq(transactions.state, "awaiting_payment"));

  for (const t of pendingTxns) {
    try {
      const v = await psp.verifyCharge(t.ref);
      if (v.status === "succeeded") {
        await markPaid(t.ref);
        paymentsReconciled += 1;
      }
    } catch {
      // continue
    }
  }

  // For stuck payouts we rely on Moolre's webhook-driven settlement. The sweep
  // only flips them to "completed" once the webhook has already written paid.
  const stuckPayouts = await db
    .select()
    .from(payouts)
    .where(eq(payouts.state, "paid"));
  for (const p of stuckPayouts) {
    try {
      const [txn] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, p.transactionId))
        .limit(1);
      if (txn && txn.state !== "completed") {
        await db
          .update(transactions)
          .set({ state: "completed", completedAt: new Date(), updatedAt: new Date() })
          .where(eq(transactions.id, p.transactionId));
        payoutsReconciled += 1;
      }
    } catch {
      // continue
    }
  }

  return { paymentsReconciled, payoutsReconciled };
}
