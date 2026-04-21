import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppTopbar } from "@/components/app-shell/topbar";
import { isDbLive } from "@/lib/env";
import { getSessionUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { disputes, transactions } from "@/lib/db/schema";
import { desc, eq, or } from "drizzle-orm";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your disputes" };

const STATE_TONE: Record<string, "info" | "success" | "warning" | "danger" | "neutral"> = {
  open: "danger",
  in_review: "warning",
  resolved_buyer: "success",
  resolved_seller: "neutral",
  partial: "info",
  withdrawn: "neutral",
};

export default async function HubDisputesPage() {
  const user = await getSessionUser();
  let rows: Array<{ id: string; reason: string; state: string; createdAt: Date; ref: string; item: string }> = [];

  if (isDbLive && user) {
    const db = getDb();
    const data = await db
      .select({
        id: disputes.id,
        reason: disputes.reason,
        state: disputes.state,
        createdAt: disputes.createdAt,
        ref: transactions.ref,
        item: transactions.itemDescription,
      })
      .from(disputes)
      .innerJoin(transactions, eq(disputes.transactionId, transactions.id))
      .where(or(eq(transactions.buyerId, user.id), eq(transactions.sellerId, user.id)))
      .orderBy(desc(disputes.createdAt))
      .limit(50);
    rows = data;
  }

  return (
    <>
      <AppTopbar title="Your disputes" subtitle="Open evidence-based reviews and their resolutions" />
      <main className="flex-1">
        <Container size="wide" className="py-8">
          {rows.length === 0 ? (
            <Card className="p-14 text-center">
              <h3 className="font-display text-xl font-semibold">No disputes yet</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">Hopefully it stays that way.</p>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y divide-[var(--border)]">
                {rows.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/hub/transactions/${r.ref}`}
                      className="grid grid-cols-12 items-center gap-4 px-6 py-4 hover:bg-[var(--surface-muted)]/40"
                    >
                      <div className="col-span-5">
                        <p className="font-medium truncate">{r.item}</p>
                        <p className="text-xs text-[var(--muted)] mt-0.5 font-mono">{r.ref}</p>
                      </div>
                      <div className="col-span-4 text-sm text-[var(--muted)] truncate">{r.reason}</div>
                      <div className="col-span-2">
                        <Badge tone={STATE_TONE[r.state] ?? "neutral"} dot>
                          {r.state.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="col-span-1 text-xs text-[var(--muted)] text-right">
                        {relativeTime(r.createdAt)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </Container>
      </main>
    </>
  );
}
