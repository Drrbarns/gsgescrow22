import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { auditLog, payouts, reviews, transactions } from "@/lib/db/schema";
import { isDbLive } from "@/lib/env";
import { getCurrentProfile, isAdminRole } from "@/lib/auth/session";
import { audit } from "@/lib/audit/log";
import { isFeatureEnabled } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KINDS = ["transactions", "payouts", "reviews", "audit"] as const;
type Kind = (typeof KINDS)[number];

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ kind: string }> },
) {
  const { kind } = await ctx.params;
  if (!KINDS.includes(kind as Kind)) {
    return NextResponse.json({ ok: false, error: "Unknown export" }, { status: 404 });
  }

  const profile = await getCurrentProfile();
  if (!profile || !isAdminRole(profile.role)) {
    return NextResponse.json({ ok: false, error: "Not authorized" }, { status: 403 });
  }
  if (!(await isFeatureEnabled("csv_exports"))) {
    return NextResponse.json({ ok: false, error: "Exports are disabled" }, { status: 403 });
  }
  if (!isDbLive) {
    return NextResponse.json({ ok: false, error: "DB not configured" }, { status: 503 });
  }

  const db = getDb();
  let rows: Record<string, unknown>[] = [];
  if (kind === "transactions") {
    rows = await db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(5000);
  } else if (kind === "payouts") {
    rows = await db.select().from(payouts).orderBy(desc(payouts.createdAt)).limit(5000);
  } else if (kind === "reviews") {
    rows = await db.select().from(reviews).orderBy(desc(reviews.createdAt)).limit(5000);
  } else if (kind === "audit") {
    rows = await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(5000);
  }

  await audit({
    action: "csv.export",
    targetType: "csv_export",
    targetId: kind,
    payload: { rows: rows.length },
  });

  const csv = toCsv(rows);
  const filename = `sbbs-${kind}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const keys = Array.from(
    rows.reduce<Set<string>>((acc, r) => {
      Object.keys(r).forEach((k) => acc.add(k));
      return acc;
    }, new Set()),
  );
  const header = keys.join(",");
  const body = rows.map((r) =>
    keys
      .map((k) => csvCell(r[k]))
      .join(","),
  );
  return [header, ...body].join("\n");
}

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  let s: string;
  if (v instanceof Date) s = v.toISOString();
  else if (typeof v === "object") s = JSON.stringify(v);
  else s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}
