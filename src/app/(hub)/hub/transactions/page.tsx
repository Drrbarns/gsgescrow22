import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { StateBadge } from "@/components/ui/badge";
import { AppTopbar } from "@/components/app-shell/topbar";
import { isDbLive } from "@/lib/env";
import { getSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { transactions } from "@/lib/db/schema";
import { desc, eq, or } from "drizzle-orm";
import { formatGhs, relativeTime } from "@/lib/utils";
import type { TxnState } from "@/lib/state/transaction";

export const dynamic = "force-dynamic";

export default async function TransactionsListPage() {
  const user = await getSessionUser();
  let rows: { ref: string; state: TxnState; itemDescription: string; totalCharged: number; createdAt: Date; counterparty: string; role: "buyer" | "seller" }[] = [];

  if (isDbLive && user) {
    const db = getDb();
    const r = await db
      .select()
      .from(transactions)
      .where(or(eq(transactions.buyerId, user.id), eq(transactions.sellerId, user.id)))
      .orderBy(desc(transactions.createdAt))
      .limit(100);
    rows = r.map((row) => ({
      ref: row.ref,
      state: row.state as TxnState,
      itemDescription: row.itemDescription,
      totalCharged: row.totalCharged,
      createdAt: row.createdAt,
      counterparty: row.buyerId === user.id ? row.sellerName : row.buyerName,
      role: row.buyerId === user.id ? "buyer" : "seller",
    }));
  }

  return (
    <>
      <AppTopbar title="All transactions" subtitle={`${rows.length} ${rows.length === 1 ? "deal" : "deals"} in your portfolio`} />
      <main className="flex-1">
        <Container size="wide" className="py-8">
          {rows.length === 0 ? (
            <Card className="p-14 text-center">
              <h3 className="font-display text-xl font-semibold">Nothing to show yet</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">
                When you start or receive a protected deal it will appear here.
              </p>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] border-b border-[var(--border)] bg-[var(--surface-muted)]/40">
                      <th className="text-left px-6 py-3 font-semibold">Reference</th>
                      <th className="text-left px-4 py-3 font-semibold">Item</th>
                      <th className="text-left px-4 py-3 font-semibold">With</th>
                      <th className="text-left px-4 py-3 font-semibold">Role</th>
                      <th className="text-right px-4 py-3 font-semibold">Amount</th>
                      <th className="text-left px-4 py-3 font-semibold">Status</th>
                      <th className="text-right px-6 py-3 font-semibold">When</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {rows.map((r) => (
                      <tr key={r.ref} className="hover:bg-[var(--surface-muted)]/40">
                        <td className="px-6 py-3 font-mono text-xs">
                          <Link href={`/hub/transactions/${r.ref}`} className="text-[var(--primary)] underline">
                            {r.ref}
                          </Link>
                        </td>
                        <td className="px-4 py-3 max-w-[280px] truncate">{r.itemDescription}</td>
                        <td className="px-4 py-3 text-[var(--muted)]">{r.counterparty}</td>
                        <td className="px-4 py-3 capitalize text-[var(--muted)]">{r.role}</td>
                        <td className="px-4 py-3 text-right font-semibold">{formatGhs(r.totalCharged)}</td>
                        <td className="px-4 py-3"><StateBadge state={r.state} /></td>
                        <td className="px-6 py-3 text-right text-[var(--muted)]">{relativeTime(r.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </Container>
      </main>
    </>
  );
}
