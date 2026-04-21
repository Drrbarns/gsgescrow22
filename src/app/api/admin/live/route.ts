import { desc, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { alerts, payouts, transactions } from "@/lib/db/schema";
import { isDbLive } from "@/lib/env";
import { getCurrentProfile, isAdminRole } from "@/lib/auth/session";
import { isFeatureEnabled } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile || !isAdminRole(profile.role)) {
    return new Response("Not authorized", { status: 403 });
  }
  if (!(await isFeatureEnabled("sse_dashboard"))) {
    return new Response("Disabled", { status: 403 });
  }
  if (!isDbLive) {
    return new Response("DB not configured", { status: 503 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      let cursor = new Date();
      // initial snapshot
      send({ type: "hello", at: new Date().toISOString() });
      send(await snapshot());

      const id = setInterval(async () => {
        try {
          const since = cursor;
          cursor = new Date();
          const db = getDb();
          const newTxns = await db
            .select({
              id: transactions.id,
              ref: transactions.ref,
              state: transactions.state,
              item: transactions.itemDescription,
              total: transactions.totalCharged,
              at: transactions.createdAt,
            })
            .from(transactions)
            .where(sql`${transactions.updatedAt} > ${since}`)
            .orderBy(desc(transactions.updatedAt))
            .limit(10);
          const newAlerts = await db
            .select()
            .from(alerts)
            .where(sql`${alerts.createdAt} > ${since}`)
            .orderBy(desc(alerts.createdAt))
            .limit(10);

          if (newTxns.length) send({ type: "transactions", rows: newTxns });
          if (newAlerts.length) send({ type: "alerts", rows: newAlerts });
          send(await snapshot());
        } catch (err) {
          send({ type: "error", message: (err as Error).message });
        }
      }, 5000);

      const keepalive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(":keepalive\n\n"));
        } catch {
          // stream closed
        }
      }, 25000);

      const abort = () => {
        clearInterval(id);
        clearInterval(keepalive);
        try {
          controller.close();
        } catch {
          // ignore
        }
      };
      // close on client disconnect
      controller.error = abort as typeof controller.error;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

async function snapshot() {
  const db = getDb();
  const [t] = await db
    .select({
      active: sql<number>`count(*) filter (where ${transactions.state} in ('paid','dispatched','delivered','released','payout_pending','payout_approved'))::int`,
      disputed: sql<number>`count(*) filter (where ${transactions.state} = 'disputed')::int`,
      gmv: sql<number>`coalesce(sum(${transactions.totalCharged}) filter (where ${transactions.state} in ('paid','dispatched','delivered','released','payout_pending','payout_approved','completed')), 0)::bigint`,
    })
    .from(transactions);
  const [p] = await db
    .select({ pending: sql<number>`count(*) filter (where ${payouts.state} = 'pending_approval')::int` })
    .from(payouts);
  return {
    type: "snapshot",
    at: new Date().toISOString(),
    active: Number(t?.active ?? 0),
    disputed: Number(t?.disputed ?? 0),
    gmv: Number(t?.gmv ?? 0),
    pendingPayouts: Number(p?.pending ?? 0),
  };
}
