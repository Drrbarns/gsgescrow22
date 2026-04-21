import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppTopbar } from "@/components/app-shell/topbar";
import { isDbLive } from "@/lib/env";
import { getDb } from "@/lib/db/client";
import { payouts, transactions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatGhs, relativeTime } from "@/lib/utils";
import { ApprovePayoutButtons } from "@/components/admin/approve-payout-buttons";
import { getCurrentProfile } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Payout Approvals" };

export default async function PayoutApprovalsPage() {
  let rows: Array<{ id: string; amount: number; payeeName: string; payeePhone: string; createdAt: Date; ref: string; riskFlags: string[] | null }> = [];
  if (isDbLive) {
    try {
      const db = getDb();
      rows = await db
        .select({
          id: payouts.id,
          amount: payouts.amount,
          payeeName: payouts.payeeName,
          payeePhone: payouts.payeePhone,
          createdAt: payouts.createdAt,
          ref: transactions.ref,
          riskFlags: payouts.riskFlags,
        })
        .from(payouts)
        .innerJoin(transactions, eq(payouts.transactionId, transactions.id))
        .where(eq(payouts.state, "pending_approval"))
        .orderBy(desc(payouts.createdAt))
        .limit(50);
    } catch {}
  }
  const profile = await getCurrentProfile();
  const approverId = profile?.id ?? "";
  const isSuperadmin = profile?.role === "superadmin";

  return (
    <>
      <AppTopbar
        title="Payout Approvals"
        subtitle={`${rows.length} ${rows.length === 1 ? "payout" : "payouts"} awaiting your click`}
      />
      <main className="flex-1">
        <Container size="wide" className="py-8 space-y-4">
          {rows.length === 0 ? (
            <Card className="p-14 text-center">
              <h3 className="font-display text-xl font-semibold">All clear</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">No payouts are waiting for approval right now.</p>
            </Card>
          ) : (
            rows.map((r) => (
              <Card key={r.id} className="p-6 grid lg:grid-cols-12 items-center gap-4">
                <div className="lg:col-span-3">
                  <p className="text-xs uppercase tracking-[0.14em] font-semibold text-[var(--muted)]">Ref</p>
                  <Link href={`/admin/transactions/${r.ref}`} className="font-mono text-sm text-[var(--primary)] underline">
                    {r.ref}
                  </Link>
                </div>
                <div className="lg:col-span-3">
                  <p className="text-xs uppercase tracking-[0.14em] font-semibold text-[var(--muted)]">Payee</p>
                  <p className="font-medium">{r.payeeName}</p>
                  <p className="text-xs text-[var(--muted)] font-mono">{r.payeePhone}</p>
                </div>
                <div className="lg:col-span-2">
                  <p className="text-xs uppercase tracking-[0.14em] font-semibold text-[var(--muted)]">Amount</p>
                  <p className="font-display text-xl font-bold">{formatGhs(r.amount)}</p>
                </div>
                <div className="lg:col-span-2">
                  {r.riskFlags && r.riskFlags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {r.riskFlags.map((f) => <Badge key={f} tone="warning">{f}</Badge>)}
                    </div>
                  ) : <Badge tone="success" dot>Clean</Badge>}
                  <p className="text-xs text-[var(--muted)] mt-2">Queued {relativeTime(r.createdAt)}</p>
                </div>
                <div className="lg:col-span-2 flex justify-end">
                  <ApprovePayoutButtons
                    payoutId={r.id}
                    approverId={approverId}
                    isSuperadmin={isSuperadmin}
                  />
                </div>
              </Card>
            ))
          )}
        </Container>
      </main>
    </>
  );
}
