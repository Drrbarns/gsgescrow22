import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppTopbar } from "@/components/app-shell/topbar";
import { isDbLive } from "@/lib/env";
import { getDb } from "@/lib/db/client";
import { payouts, transactions } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { formatGhs, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Payouts" };

const TONE: Record<string, "info" | "success" | "warning" | "danger" | "neutral"> = {
  pending_approval: "warning",
  approved: "info",
  rejected: "neutral",
  processing: "info",
  paid: "success",
  failed: "danger",
};

export default async function AdminPayoutsPage() {
  let rows: Array<{ id: string; amount: number; state: string; payeeName: string; createdAt: Date; ref: string; kind: string; riskFlags: string[] | null }> = [];
  if (isDbLive) {
    try {
      const db = getDb();
      rows = await db
        .select({
          id: payouts.id,
          amount: payouts.amount,
          state: payouts.state,
          payeeName: payouts.payeeName,
          createdAt: payouts.createdAt,
          kind: payouts.kind,
          riskFlags: payouts.riskFlags,
          ref: transactions.ref,
        })
        .from(payouts)
        .innerJoin(transactions, eq(payouts.transactionId, transactions.id))
        .orderBy(desc(payouts.createdAt))
        .limit(200);
    } catch {}
  }

  return (
    <>
      <AppTopbar
        title="Payouts"
        subtitle="All payouts across their lifecycle"
        actions={<Link href="/admin/payouts/approvals" className="text-sm text-[var(--primary)] font-medium">Approvals queue →</Link>}
      />
      <main className="flex-1">
        <Container size="wide" className="py-8">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] border-b border-[var(--border)] bg-[var(--surface-muted)]/40">
                    <th className="text-left px-6 py-3 font-semibold">Ref</th>
                    <th className="text-left px-4 py-3 font-semibold">Payee</th>
                    <th className="text-left px-4 py-3 font-semibold">Kind</th>
                    <th className="text-right px-4 py-3 font-semibold">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold">State</th>
                    <th className="text-left px-4 py-3 font-semibold">Risk</th>
                    <th className="text-right px-6 py-3 font-semibold">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {rows.length === 0 && <tr><td colSpan={7} className="px-6 py-8 text-center text-[var(--muted)]">No payouts</td></tr>}
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-[var(--surface-muted)]/40">
                      <td className="px-6 py-3 font-mono text-xs">
                        <Link href={`/admin/transactions/${r.ref}`} className="text-[var(--primary)] underline">{r.ref}</Link>
                      </td>
                      <td className="px-4 py-3">{r.payeeName}</td>
                      <td className="px-4 py-3 capitalize text-[var(--muted)]">{r.kind}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatGhs(r.amount)}</td>
                      <td className="px-4 py-3"><Badge tone={TONE[r.state] ?? "neutral"} dot>{r.state.replace("_", " ")}</Badge></td>
                      <td className="px-4 py-3">
                        {r.riskFlags && r.riskFlags.length > 0 ? (
                          <span className="inline-flex flex-wrap gap-1">
                            {r.riskFlags.map((f) => <Badge key={f} tone="warning">{f}</Badge>)}
                          </span>
                        ) : <span className="text-xs text-[var(--muted)]">—</span>}
                      </td>
                      <td className="px-6 py-3 text-right text-[var(--muted)]">{relativeTime(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Container>
      </main>
    </>
  );
}
