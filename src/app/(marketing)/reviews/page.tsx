import { Star, ShieldCheck } from "lucide-react";
import { Container, Section, Eyebrow } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDb } from "@/lib/db/client";
import { reviews } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { isDbLive } from "@/lib/env";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Reviews wall" };

export default async function ReviewsPage() {
  let live: { id: string; revieweeName: string; stars: number; body: string | null; createdAt: Date }[] = [];
  if (isDbLive) {
    try {
      const db = getDb();
      const rows = await db
        .select({
          id: reviews.id,
          revieweeName: reviews.revieweeName,
          stars: reviews.stars,
          body: reviews.body,
          createdAt: reviews.createdAt,
        })
        .from(reviews)
        .where(eq(reviews.isPublic, true))
        .orderBy(desc(reviews.createdAt))
        .limit(60);
      live = rows;
    } catch {
      live = [];
    }
  }

  return (
    <Section className="bg-paper">
      <Container size="wide">
        <Eyebrow>Reviews wall</Eyebrow>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-4 tracking-tight">
          Real Ghanaians, real receipts.
        </h1>
        <p className="mt-4 text-lg text-[var(--muted)] max-w-2xl">
          Every review is tied to a completed protected transaction. No fake
          reviews, no influencer scripts.
        </p>
        {live.length === 0 ? (
          <Card className="mt-12 p-14 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
              <ShieldCheck size={22} />
            </div>
            <h2 className="font-display text-2xl font-semibold mt-5">
              No reviews yet
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)] max-w-md mx-auto">
              Reviews from completed protected transactions will show up here as
              soon as buyers and sellers start releasing payments. We don&rsquo;t
              fill this page with fake testimonials.
            </p>
          </Card>
        ) : (
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {live.map((r) => (
              <Card key={r.id} className="p-6 hover:shadow-[var(--shadow-pop)] transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[var(--accent)]">
                    {Array.from({ length: r.stars }).map((_, idx) => (
                      <Star key={idx} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <Badge tone="neutral">{r.revieweeName}</Badge>
                </div>
                <p className="mt-3 text-[15px] leading-relaxed">&ldquo;{r.body ?? ""}&rdquo;</p>
                <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                  <span className="text-sm font-semibold">Verified buyer</span>
                  <span className="text-xs text-[var(--muted)]">{relativeTime(r.createdAt)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
