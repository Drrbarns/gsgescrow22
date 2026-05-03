import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { payments } from "@/lib/db/schema";
import { isMoolreLive, isPaystackLive } from "@/lib/env";
import type { PspAdapter } from "./types";
import { moolrePsp } from "./moolre";
import { paystack } from "./paystack";
import { stubPsp } from "./stub";

function defaultChargeAdapter(): PspAdapter {
  if (isMoolreLive) return moolrePsp;
  if (isPaystackLive) return paystack;
  return stubPsp;
}

/** Resolve the PSP adapter used for a payment charge (not necessarily `getPsp()` payout routing). */
export function chargeAdapterForProvider(psp: string | null | undefined): PspAdapter {
  switch (psp) {
    case "paystack":
      return paystack;
    case "moolre":
      return moolrePsp;
    case "stub":
      return stubPsp;
    default:
      return defaultChargeAdapter();
  }
}

/** Latest payment row decides how return-page verification and ops tools should query the PSP. */
export async function getChargeAdapterForTxn(transactionId: string): Promise<PspAdapter> {
  const db = getDb();
  const [row] = await db
    .select({ psp: payments.psp })
    .from(payments)
    .where(eq(payments.transactionId, transactionId))
    .orderBy(desc(payments.createdAt))
    .limit(1);
  return chargeAdapterForProvider(row?.psp);
}
