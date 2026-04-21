import Link from "next/link";
import { Container, Section } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Loader2 } from "lucide-react";
import { MarketingNav } from "@/components/marketing/nav";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { transactions } from "@/lib/db/schema";
import { isDbLive, isPaymentsLive } from "@/lib/env";
import { markPaid } from "@/lib/actions/transaction";
import { getPsp } from "@/lib/payments";
import { stateLabel, type TxnState } from "@/lib/state/transaction";
import { StateBadge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; reference?: string; trxref?: string; stub?: string }>;
}) {
  const sp = await searchParams;
  const ref = sp.ref || sp.reference || sp.trxref;
  let state: TxnState | null = null;
  let verified = false;

  if (ref && isDbLive) {
    if (sp.stub === "1" || !isPaymentsLive) {
      console.log(`[buy/return] ref=${ref} stub path → markPaid`);
      await markPaid(ref);
    } else {
      try {
        const v = await getPsp().verifyCharge(ref);
        console.log(`[buy/return] ref=${ref} verifyCharge=${v.status}`);
        if (v.status === "succeeded") {
          const r = await markPaid(ref);
          console.log(`[buy/return] ref=${ref} markPaid ok=${r.ok} error=${"error" in r ? r.error : ""}`);
        }
      } catch (err) {
        console.error(`[buy/return] ref=${ref} verifyCharge threw:`, (err as Error).message);
      }
    }
    const [t] = await getDb()
      .select()
      .from(transactions)
      .where(eq(transactions.ref, ref))
      .limit(1);
    if (t) {
      state = t.state as TxnState;
      verified = state === "paid" || state === "dispatched" || state === "delivered" || state === "released" || state === "completed" || state === "payout_pending" || state === "payout_approved";
    } else {
      console.warn(`[buy/return] ref=${ref} not found in transactions table`);
    }
  }

  return (
    <>
      <MarketingNav />
      <Section className="bg-paper min-h-[80vh]">
        <Container size="sm">
          <Card className="p-8 sm:p-10 text-center">
            {verified ? (
              <>
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-soft)] text-[var(--primary)] mx-auto">
                  <ShieldCheck size={28} />
                </div>
                <h1 className="font-display text-3xl font-bold mt-5 tracking-tight">
                  Payment held safely.
                </h1>
                <p className="mt-3 text-[var(--muted)]">
                  Your money is with Moolre. The seller has been notified by SMS.
                  We&rsquo;ll text you the moment it&rsquo;s dispatched.
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  {state && <StateBadge state={state} />}
                  <span className="font-mono text-sm text-[var(--muted)]">{ref}</span>
                </div>
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/hub">
                    <Button>Open my Hub</Button>
                  </Link>
                  <Link href={`/track/${ref}`}>
                    <Button variant="secondary">Public tracking</Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--muted)] mx-auto animate-pulse">
                  <Loader2 size={28} />
                </div>
                <h1 className="font-display text-3xl font-bold mt-5 tracking-tight">
                  Confirming payment&hellip;
                </h1>
                <p className="mt-3 text-[var(--muted)]">
                  Your payment is being verified with Moolre. This usually
                  takes a few seconds. You can refresh, or check your Hub.
                </p>
                <div className="mt-6 font-mono text-sm text-[var(--muted)]">{ref}</div>
                <div className="mt-8">
                  <Link href="/hub">
                    <Button>Go to Hub</Button>
                  </Link>
                </div>
              </>
            )}
          </Card>
          <p className="text-center text-xs text-[var(--muted)] mt-6">
            Status: {state ? stateLabel(state) : "Not found"}
          </p>
        </Container>
      </Section>
    </>
  );
}
