import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { transactions, profiles } from "@/lib/db/schema";
import { isDbLive } from "@/lib/env";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  if (!isDbLive) {
    return NextResponse.json({
      protectedAmount: 384200,
      protectedCount: 1247,
      sellersOnboarded: 312,
      live: false,
    });
  }

  try {
    const db = getDb();
    const [txnRow] = await db
      .select({
        total: sql<number>`coalesce(sum(${transactions.totalCharged}), 0)::bigint`,
        count: sql<number>`count(*)::int`,
      })
      .from(transactions)
      .where(sql`${transactions.state} in ('paid','dispatched','delivered','released','payout_pending','payout_approved','completed')`);

    const [sellerRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(profiles)
      .where(sql`${profiles.role} = 'seller' and ${profiles.kycStatus} = 'approved'`);

    const cedis = Math.round(Number(txnRow?.total ?? 0) / 100);
    return NextResponse.json({
      protectedAmount: cedis,
      protectedCount: Number(txnRow?.count ?? 0),
      sellersOnboarded: Number(sellerRow?.count ?? 0),
      live: true,
    });
  } catch (err) {
    return NextResponse.json({
      protectedAmount: 0,
      protectedCount: 0,
      sellersOnboarded: 0,
      live: false,
      error: (err as Error).message,
    });
  }
}
