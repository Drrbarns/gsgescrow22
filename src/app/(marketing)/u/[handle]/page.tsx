import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BadgeCheck, ShieldCheck, Star } from "lucide-react";
import { getDb } from "@/lib/db/client";
import { profiles, transactions, reviews } from "@/lib/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { isDbLive } from "@/lib/env";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PublicSellerProfile({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;

  if (!isDbLive) notFound();

  let profile: { displayName: string | null; bio: string | null; location: string | null; badgeEnabled: boolean; trustScore: number; createdAt: Date } | null = null;
  let stats = { deliveries: 0, disputes: 0, rating: 0 };
  let recent: { id: string; stars: number; body: string | null; createdAt: Date }[] = [];

  try {
    const db = getDb();
    const [p] = await db.select().from(profiles).where(eq(profiles.handle, handle)).limit(1);
    if (p) {
      profile = {
        displayName: p.displayName,
        bio: p.bio,
        location: p.location,
        badgeEnabled: p.badgeEnabled,
        trustScore: p.trustScore,
        createdAt: p.createdAt,
      };
      const [d] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(transactions)
        .where(and(eq(transactions.sellerId, p.id), eq(transactions.state, "completed")));
      const [disp] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(transactions)
        .where(and(eq(transactions.sellerId, p.id), eq(transactions.state, "disputed")));
      const [r] = await db
        .select({ avg: sql<number>`coalesce(avg(${reviews.stars})::float, 0)` })
        .from(reviews)
        .where(eq(reviews.revieweeId, p.id));
      stats = {
        deliveries: Number(d?.count ?? 0),
        disputes: Number(disp?.count ?? 0),
        rating: Math.round(Number(r?.avg ?? 0) * 10) / 10,
      };
      const rev = await db
        .select({
          id: reviews.id,
          stars: reviews.stars,
          body: reviews.body,
          createdAt: reviews.createdAt,
        })
        .from(reviews)
        .where(and(eq(reviews.revieweeId, p.id), eq(reviews.isPublic, true)))
        .orderBy(desc(reviews.createdAt))
        .limit(12);
      recent = rev;
    }
  } catch {}

  if (!profile) notFound();

  return (
    <Section className="bg-paper">
      <Container size="lg">
        <Card className="p-8 lg:p-10 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-[var(--primary-soft)]/60" />
          <div className="relative grid md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-3 flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center font-display text-3xl font-bold shadow-[var(--shadow-pop)]">
                {(profile.displayName ?? handle).slice(0, 2).toUpperCase()}
              </div>
              {profile.badgeEnabled && (
                <Badge tone="success" className="mt-4">
                  <BadgeCheck size={12} /> Verified seller
                </Badge>
              )}
            </div>
            <div className="md:col-span-9">
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
                {profile.displayName ?? handle}
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)] font-mono">@{handle}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {profile.location ?? "Ghana"} · Joined {relativeTime(profile.createdAt)}
              </p>
              {profile.bio && (
                <p className="mt-5 text-[15px] leading-relaxed">{profile.bio}</p>
              )}
              <div className="mt-7 grid grid-cols-3 gap-4 max-w-md">
                <Stat n={stats.deliveries.toString()} label="Protected deliveries" />
                <Stat n={stats.disputes === 0 ? "0" : `${stats.disputes}`} label="Open disputes" />
                <Stat n={stats.rating > 0 ? stats.rating.toFixed(1) : "—"} label="Average rating" />
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-10 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-display text-xl font-semibold">Recent reviews</h2>
            {recent.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-sm text-[var(--muted)]">No public reviews yet.</p>
              </Card>
            ) : (
              recent.map((r) => (
                <Card key={r.id} className="p-5">
                  <div className="flex items-center gap-1 text-[var(--accent)]">
                    {Array.from({ length: r.stars }).map((_, i) => (
                      <Star key={i} size={13} fill="currentColor" />
                    ))}
                    <span className="ml-2 text-xs text-[var(--muted)]">
                      {relativeTime(r.createdAt)}
                    </span>
                  </div>
                  {r.body && <p className="mt-2 text-[15px] leading-relaxed">&ldquo;{r.body}&rdquo;</p>}
                </Card>
              ))
            )}
          </div>
          <Card className="p-6 h-fit lg:sticky lg:top-24">
            <ShieldCheck size={20} className="text-[var(--primary)]" />
            <h3 className="font-display font-semibold mt-3">Pay this seller safely</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Use SBBS to protect your purchase. The seller doesn&rsquo;t see
              the money until you confirm the goods arrived.
            </p>
            <Link href={`/buy?seller=${encodeURIComponent(handle)}`} className="mt-4 inline-block">
              <Button>Start a protected purchase</Button>
            </Link>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <p className="font-display text-2xl font-bold">{n}</p>
      <p className="text-xs uppercase tracking-[0.14em] font-semibold text-[var(--muted)] mt-0.5">
        {label}
      </p>
    </div>
  );
}
