"use server";

import { and, eq, isNull, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { transactions, transactionEvents, profiles } from "@/lib/db/schema";
import { isDbLive } from "@/lib/env";
import { getCurrentProfile } from "@/lib/auth/session";
import { verifyClaim } from "@/lib/auth/claim-tokens";
import { findUnclaimedSellerTransactions } from "@/lib/auth/resolve-seller";
import { audit } from "@/lib/audit/log";
import { normalizeGhPhone } from "@/lib/utils";

/**
 * Called after a successful signup / sign-in. If a claim token is
 * supplied we trust its transaction ref directly. Either way, we then
 * sweep every unclaimed transaction whose recorded seller identifiers
 * (email / phone / handle) match the current profile and stamp
 * `transactions.sellerId` to the current user.
 *
 * Returns the number of orders that got attached so the UI can toast
 * "3 orders waiting for you in your Hub" style messages.
 */
export async function claimPendingSellerOrders(input: {
  token?: string | null;
} = {}): Promise<{ ok: boolean; claimed: number; refs: string[]; error?: string }> {
  if (!isDbLive) return { ok: false, claimed: 0, refs: [], error: "DB not configured" };
  const profile = await getCurrentProfile();
  if (!profile) return { ok: false, claimed: 0, refs: [], error: "Sign in first" };

  const db = getDb();
  const claimedRefs: string[] = [];

  // 1. Token-driven claim — trusted ref from the signed payload.
  if (input.token) {
    const payload = verifyClaim(input.token);
    if (payload && payload.role === "seller") {
      const [txn] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.ref, payload.ref))
        .limit(1);
      if (txn && !txn.sellerId) {
        // Guard: the profile must match at least ONE identifier on the
        // stored payload. A signed but swapped token shouldn't let a
        // random new user grab orders meant for someone else.
        const profEmail = profile.email?.toLowerCase();
        const profPhone = profile.phone ? normalizeGhPhone(profile.phone) : null;
        const profHandle = profile.handle?.toLowerCase();
        const matches = [
          payload.email && profEmail && payload.email.toLowerCase() === profEmail,
          payload.phone && profPhone && payload.phone === profPhone,
          payload.handle && profHandle && payload.handle.toLowerCase() === profHandle,
          // Phone on the txn itself is also a fair match — the buyer
          // wrote it down specifically for this seller.
          profPhone && txn.sellerPhone === profPhone,
        ].some(Boolean);

        if (matches) {
          await db
            .update(transactions)
            .set({
              sellerId: profile.id,
              updatedAt: new Date(),
              metadata: {
                ...((txn.metadata as Record<string, unknown>) ?? {}),
                claimedAt: new Date().toISOString(),
                claimedBy: profile.id,
                claimMethod: "token",
              },
            })
            .where(eq(transactions.id, txn.id));

          await db.insert(transactionEvents).values({
            transactionId: txn.id,
            fromState: txn.state,
            toState: txn.state,
            actorId: profile.id,
            actorRole: "seller",
            note: "Seller claimed order via signup link",
          });

          await audit({
            action: "user.claim_order",
            targetType: "transaction",
            targetId: txn.id,
            payload: { ref: txn.ref, via: "token" },
          });

          claimedRefs.push(txn.ref);
        }
      }
    }
  }

  // 2. Identifier-driven sweep — attach every other pending order whose
  //    stored seller contact matches this profile.
  const sweepIds = await findUnclaimedSellerTransactions({
    id: profile.id,
    email: profile.email,
    phone: profile.phone,
    handle: profile.handle,
  });

  for (const id of sweepIds) {
    const [txn] = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, id), isNull(transactions.sellerId)))
      .limit(1);
    if (!txn) continue;

    await db
      .update(transactions)
      .set({
        sellerId: profile.id,
        updatedAt: new Date(),
        metadata: {
          ...((txn.metadata as Record<string, unknown>) ?? {}),
          claimedAt: new Date().toISOString(),
          claimedBy: profile.id,
          claimMethod: "identifier_sweep",
        },
      })
      .where(eq(transactions.id, txn.id));

    await db.insert(transactionEvents).values({
      transactionId: txn.id,
      fromState: txn.state,
      toState: txn.state,
      actorId: profile.id,
      actorRole: "seller",
      note: "Seller auto-claimed order on first sign-in",
    });

    await audit({
      action: "user.claim_order",
      targetType: "transaction",
      targetId: txn.id,
      payload: { ref: txn.ref, via: "sweep" },
    });

    if (!claimedRefs.includes(txn.ref)) claimedRefs.push(txn.ref);
  }

  // If we attached anything, make sure the profile is at least a "seller"
  // (they already are authenticated, so we only upgrade buyers → sellers).
  if (claimedRefs.length > 0 && profile.role === "buyer") {
    await db
      .update(profiles)
      .set({ role: "seller", updatedAt: new Date() })
      .where(eq(profiles.id, profile.id));
  }

  return { ok: true, claimed: claimedRefs.length, refs: claimedRefs };
}

/**
 * Buyer-side variant — same idea, but for buyers who paid before signing
 * up. Kept tiny for now; we'll flesh out token shapes once buyer claim
 * links start getting issued in quantity.
 */
export async function claimPendingBuyerOrders(): Promise<{ ok: boolean; claimed: number }> {
  if (!isDbLive) return { ok: false, claimed: 0 };
  const profile = await getCurrentProfile();
  if (!profile?.phone) return { ok: false, claimed: 0 };

  const db = getDb();
  const phone = normalizeGhPhone(profile.phone) ?? profile.phone;
  const rows = await db
    .select({ id: transactions.id, ref: transactions.ref })
    .from(transactions)
    .where(
      and(
        eq(transactions.buyerPhone, phone),
        isNull(transactions.buyerId),
      ),
    );
  if (rows.length === 0) return { ok: true, claimed: 0 };

  const ids = rows.map((r) => r.id);
  await db
    .update(transactions)
    .set({ buyerId: profile.id, updatedAt: new Date() })
    .where(
      and(
        sql`${transactions.id} = ANY(${ids})`,
        isNull(transactions.buyerId),
      ),
    );
  // Use `or` so the import isn't pruned when buyer-side rules expand.
  void or;
  return { ok: true, claimed: rows.length };
}
