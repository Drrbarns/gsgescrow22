import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { profiles, transactions, reviews } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { isDbLive } from "@/lib/env";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ handle: string }> },
) {
  const { handle } = await ctx.params;

  let stats = {
    name: handle,
    deliveries: 0,
    rating: 0,
    badge: false,
  };

  if (isDbLive) {
    try {
      const db = getDb();
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.handle, handle))
        .limit(1);
      if (profile) {
        const [d] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(transactions)
          .where(
            and(eq(transactions.sellerId, profile.id), eq(transactions.state, "completed")),
          );
        const [r] = await db
          .select({
            avg: sql<number>`coalesce(avg(${reviews.stars})::float, 0)`,
          })
          .from(reviews)
          .where(eq(reviews.revieweeId, profile.id));
        stats = {
          name: profile.displayName ?? handle,
          deliveries: Number(d?.count ?? 0),
          rating: Math.round(Number(r?.avg ?? 0) * 10) / 10,
          badge: profile.badgeEnabled,
        };
      }
    } catch {
      // fall through to defaults
    }
  }

  const svg = renderBadgeSvg(stats);
  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}

function renderBadgeSvg(stats: {
  name: string;
  deliveries: number;
  rating: number;
  badge: boolean;
}): string {
  const ratingStars = stats.rating > 0 ? `★ ${stats.rating.toFixed(1)}` : "★ New";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="92" viewBox="0 0 320 92" role="img" aria-label="SBBS verified seller">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#4F2BB8"/>
      <stop offset="50%" stop-color="#6D28D9"/>
      <stop offset="100%" stop-color="#4338CA"/>
    </linearGradient>
  </defs>
  <rect width="320" height="92" rx="14" fill="url(#bg)"/>
  <g transform="translate(16,16)">
    <rect width="36" height="36" rx="8" fill="#3A1F75" stroke="#C4B5FD" stroke-width="1.5"/>
    <text x="18" y="24" fill="#fff" font-family="system-ui,-apple-system,Segoe UI,sans-serif" font-size="13" font-weight="700" text-anchor="middle">SB</text>
  </g>
  <g fill="#fff" font-family="system-ui,-apple-system,Segoe UI,sans-serif">
    <text x="64" y="32" font-size="11" font-weight="600" letter-spacing="1.4" fill="#C4B5FD">SBBS VERIFIED</text>
    <text x="64" y="52" font-size="15" font-weight="700">${escapeXml(stats.name)}</text>
    <text x="64" y="72" font-size="11" fill="#DDD6FE">${stats.deliveries} protected ${stats.deliveries === 1 ? "deal" : "deals"} · ${ratingStars}</text>
  </g>
  <text x="304" y="84" font-family="system-ui,sans-serif" font-size="9" fill="#A5B4FC" text-anchor="end">sbbs.gh</text>
</svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    c === "<"
      ? "&lt;"
      : c === ">"
        ? "&gt;"
        : c === "&"
          ? "&amp;"
          : c === "'"
            ? "&apos;"
            : "&quot;",
  );
}
