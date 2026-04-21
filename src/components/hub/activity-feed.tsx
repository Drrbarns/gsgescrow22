import Link from "next/link";
import { desc, or, eq, inArray } from "drizzle-orm";
import { Card } from "@/components/ui/card";
import { getDb } from "@/lib/db/client";
import { isDbLive } from "@/lib/env";
import { transactions, transactionEvents } from "@/lib/db/schema";
import { stateLabel, stateTone, type TxnState } from "@/lib/state/transaction";
import { relativeTime } from "@/lib/utils";
import { Activity } from "lucide-react";

export async function ActivityFeed({ userId }: { userId: string }) {
  if (!isDbLive) {
    return (
      <Card className="p-8 text-center">
        <Activity size={20} className="mx-auto text-[var(--muted)]" />
        <p className="text-sm text-[var(--muted)] mt-3">Activity appears here once the DB is connected.</p>
      </Card>
    );
  }
  const db = getDb();
  const mine = await db
    .select({ id: transactions.id })
    .from(transactions)
    .where(or(eq(transactions.buyerId, userId), eq(transactions.sellerId, userId)))
    .limit(50);
  const ids = mine.map((m) => m.id);
  if (ids.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Activity size={20} className="mx-auto text-[var(--muted)]" />
        <p className="text-sm text-[var(--muted)] mt-3">No activity yet. Your first deal will appear here.</p>
      </Card>
    );
  }

  const events = await db
    .select({
      id: transactionEvents.id,
      toState: transactionEvents.toState,
      note: transactionEvents.note,
      createdAt: transactionEvents.createdAt,
      ref: transactions.ref,
      item: transactions.itemDescription,
    })
    .from(transactionEvents)
    .innerJoin(transactions, eq(transactions.id, transactionEvents.transactionId))
    .where(inArray(transactionEvents.transactionId, ids))
    .orderBy(desc(transactionEvents.createdAt))
    .limit(30);

  if (events.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-[var(--muted)]">No events yet.</p>
      </Card>
    );
  }

  const toneClasses: Record<string, string> = {
    neutral: "bg-[var(--surface-muted)] text-[var(--muted)]",
    info: "bg-[#e8f1f8] text-[#1f4a72]",
    success: "bg-[var(--primary-soft)] text-[var(--primary)]",
    warning: "bg-[#fbf2dd] text-[#7a5410]",
    danger: "bg-[#fbe5e3] text-[var(--danger)]",
    accent: "bg-[var(--accent-soft)] text-[var(--accent-foreground)]",
  };

  return (
    <Card>
      <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Activity</h2>
        <span className="text-xs text-[var(--muted)]">Latest 30 events</span>
      </div>
      <ol className="divide-y divide-[var(--border)]">
        {events.map((e) => {
          const tone = stateTone(e.toState as TxnState);
          return (
            <li key={e.id}>
              <Link
                href={`/hub/transactions/${e.ref}`}
                className="flex items-start gap-3 px-5 py-3.5 hover:bg-[var(--surface-muted)]/40"
              >
                <span
                  className={
                    "mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold " +
                    (toneClasses[tone] ?? toneClasses.neutral)
                  }
                >
                  ●
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{stateLabel(e.toState as TxnState)}</span>
                    <span className="text-[var(--muted)]">
                      {" "}
                      · {e.item} <span className="font-mono text-[11px]">({e.ref})</span>
                    </span>
                  </p>
                  {e.note && <p className="text-xs text-[var(--muted)] mt-0.5">{e.note}</p>}
                </div>
                <span className="text-xs text-[var(--muted)] whitespace-nowrap">
                  {relativeTime(e.createdAt)}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
