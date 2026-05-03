import { isMoolreLive, isPaystackLive } from "../env";
import { paystack } from "./paystack";
import { moolrePsp } from "./moolre";
import { hubtelPsp } from "./hubtel";
import type { PspAdapter, PspProvider } from "./types";
import { stubPsp } from "./stub";

const ADAPTERS: Record<PspProvider, PspAdapter> = {
  moolre: moolrePsp,
  paystack,
  hubtel: hubtelPsp,
  flutterwave: stubPsp,
  stub: stubPsp,
};

/**
 * Resolve the active PSP adapter.
 *
 * Priority order:
 *   1. Caller-specified provider (routing by transaction).
 *   2. Moolre if fully configured — our primary gateway in production.
 *   3. Paystack if configured — failover.
 *   4. Stub (dev / preview) so every flow works end-to-end without keys.
 */
export function getPsp(provider?: PspProvider): PspAdapter {
  if (provider) return ADAPTERS[provider] ?? stubPsp;
  if (isMoolreLive) return moolrePsp;
  if (isPaystackLive) return paystack;
  return stubPsp;
}

export { moolrePsp, paystack, hubtelPsp };
/** Charge PSP helpers live in `./charge-adapter` — do not barrel-export here (client components import `calculateFees` from this file). */
export type * from "./types";

export function calculateFees(args: {
  productAmount: number;
  deliveryAmount: number;
  buyerFeeBps: number;
  sellerFeeBps: number;
  riderReleaseFee: number;
  sellerReleaseFee?: number;
}) {
  const buyerFee = Math.round((args.productAmount * args.buyerFeeBps) / 10000);
  const sellerFee = Math.round((args.productAmount * args.sellerFeeBps) / 10000);
  // Rider release fee only applies if there's an actual delivery leg.
  const riderReleaseFee = args.deliveryAmount > 0 ? args.riderReleaseFee : 0;
  // Seller release fee is unconditional — every order ultimately releases
  // funds to a seller, so we collect it on every transaction. Falls back to
  // 0 when callers (e.g. older clients) haven't been updated to pass it.
  const sellerReleaseFee = args.sellerReleaseFee ?? 0;
  const totalCharged =
    args.productAmount +
    args.deliveryAmount +
    buyerFee +
    riderReleaseFee +
    sellerReleaseFee;
  const sellerPayout = args.productAmount - sellerFee;
  const riderPayout = args.deliveryAmount;
  return {
    buyerFee,
    sellerFee,
    riderReleaseFee,
    sellerReleaseFee,
    totalCharged,
    sellerPayout,
    riderPayout,
  };
}
