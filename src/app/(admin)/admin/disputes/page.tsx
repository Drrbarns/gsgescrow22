import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppTopbar } from "@/components/app-shell/topbar";
import { isDbLive } from "@/lib/env";
import { getDb } from "@/lib/db/client";
import { disputes, transactions } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { relativeTime, formatGhs } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Disputes" };

const TONE: Record<string, "info" | "success" | "warning" | "danger" | "neutral"> = {
  open: "danger",
  in_review: "warning",
  resolved_buyer: "success",
  resolved_seller: "neutral",
  partial: "info",
  withdrawn: "neutral",
};

export default async function AdminDisputesPage() {
  let rows: Array<{
    id: string;
    state: string;
    reason: string;
    createdAt: Date;
    slaDueAt: Date | null;
    ref: string;
    item: string;
    total: number;
    buyerName: string;
    sellerName: string;
  }> = [];
  if (isDbLive) {
    try {
      const db = getDb();
      rows = await db
        .select({
          id: disputes.id,
          state: disputes.state,
          reason: disputes.reason,
          createdAt: disputes.createdAt,
          slaDueAt: disputes.slaDueAt,
          ref: transactions.ref,
          item: transactions.itemDescription,
          total: transactions.totalCharged,
          buyerName: transactions.buyerName,
          sellerName: transactions.sellerName,
        })
        .from(disputes)
        .innerJoin(transactions, eq(disputes.transactionId, transactions.id))
        .orderBy(desc(disputes.createdAt))
        .limit(100);
    } catch {}
  }

  return (
    <>
      <AppTopbar title="Disputes" subtitle="Review evidence and resolve within SLA" />
      <main className="flex-1">
        <Container size="wide" className="py-8">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] border-b border-[var(--border)] bg-[var(--surface-muted)]/40">
                    <th className="text-left px-6 py-3 font-semibold">Ref</th>
                    <th className="text-left px-4 py-3 font-semibold">Reason</th>
                    <th className="text-left px-4 py-3 font-semibold">Parties</th>
                    <th className="text-right px-4 py-3 font-semibold">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold">State</th>
                    <th className="text-right px-4 py-3 font-semibold">Opened</th>
                    <th className="text-right px-6 py-3 font-semibold">SLA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {rows.length === 0 && <tr><td colSpan={7} className="px-6 py-8 text-center text-[var(--muted)]">No disputes</td></tr>}
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-[var(--surface-muted)]/40">
                      <td className="px-6 py-3 font-mono text-xs">
                        <Link href={`/admin/disputes/${r.id}`} className="text-[var(--primary)] underline">{r.ref}</Link>
                      </td>
                      <td className="px-4 py-3 max-w-[260px] truncate">{r.reason}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{r.buyerName} ⇄ {r.sellerName}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatGhs(r.total)}</td>
                      <td className="px-4 py-3"><Badge tone={TONE[r.state] ?? "neutral"} dot>{r.state.replace("_", " ")}</Badge></td>
                      <td className="px-4 py-3 text-right text-[var(--muted)]">{relativeTime(r.createdAt)}</td>
                      <td className="px-6 py-3 text-right text-[var(--muted)]">{r.slaDueAt ? relativeTime(r.slaDueAt) : "—"}</td>
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
