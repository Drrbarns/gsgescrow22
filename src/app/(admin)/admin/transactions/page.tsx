import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { StateBadge } from "@/components/ui/badge";
import { AppTopbar } from "@/components/app-shell/topbar";
import { isDbLive } from "@/lib/env";
import { getDb } from "@/lib/db/client";
import { transactions } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { formatGhs, relativeTime } from "@/lib/utils";
import type { TxnState } from "@/lib/state/transaction";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Transactions" };

export default async function AdminTxnsPage() {
  let rows: { ref: string; state: TxnState; itemDescription: string; buyerName: string; sellerName: string; totalCharged: number; createdAt: Date }[] = [];
  if (isDbLive) {
    try {
      const r = await getDb().select().from(transactions).orderBy(desc(transactions.createdAt)).limit(200);
      rows = r.map((t) => ({
        ref: t.ref,
        state: t.state as TxnState,
        itemDescription: t.itemDescription,
        buyerName: t.buyerName,
        sellerName: t.sellerName,
        totalCharged: t.totalCharged,
        createdAt: t.createdAt,
      }));
    } catch {}
  }

  return (
    <>
      <AppTopbar title="Transactions" subtitle="Every protected deal across SBBS" />
      <main className="flex-1">
        <Container size="wide" className="py-8">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] border-b border-[var(--border)] bg-[var(--surface-muted)]/40">
                    <th className="text-left px-6 py-3 font-semibold">Ref</th>
                    <th className="text-left px-4 py-3 font-semibold">Item</th>
                    <th className="text-left px-4 py-3 font-semibold">Buyer</th>
                    <th className="text-left px-4 py-3 font-semibold">Seller</th>
                    <th className="text-right px-4 py-3 font-semibold">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold">State</th>
                    <th className="text-right px-6 py-3 font-semibold">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {rows.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-[var(--muted)]">No transactions yet</td></tr>
                  )}
                  {rows.map((r) => (
                    <tr key={r.ref} className="hover:bg-[var(--surface-muted)]/40">
                      <td className="px-6 py-3 font-mono text-xs">
                        <Link href={`/admin/transactions/${r.ref}`} className="text-[var(--primary)] underline">{r.ref}</Link>
                      </td>
                      <td className="px-4 py-3 max-w-[260px] truncate">{r.itemDescription}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{r.buyerName}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{r.sellerName}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatGhs(r.totalCharged)}</td>
                      <td className="px-4 py-3"><StateBadge state={r.state} /></td>
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
