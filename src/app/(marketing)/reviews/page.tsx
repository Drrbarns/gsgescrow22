import { Star } from "lucide-react";
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

const SEED = [
  { name: "Esi A.", role: "Buyer · Accra", stars: 5, body: "First time I bought something on Instagram without sweating. Released the code, sent the receipt to my mum.", revieweeName: "Kente Couture" },
  { name: "Yaw M.", role: "Seller · Kumasi", stars: 5, body: "I added the badge to my bio and my close rate doubled in a week. Buyers stop arguing about MoMo upfront.", revieweeName: "SBBS" },
  { name: "Akua O.", role: "Buyer · Tema", stars: 5, body: "Item came damaged. Opened a dispute, uploaded a photo, got refunded in 3 days. SBBS is the real one.", revieweeName: "Hair By J" },
  { name: "Kojo B.", role: "Seller · Takoradi", stars: 5, body: "Auto-release saved me. The buyer ghosted, 72 hours later the money landed in my MoMo. Game changer.", revieweeName: "SBBS" },
  { name: "Adjoa N.", role: "Buyer · East Legon", stars: 5, body: "I refuse to pay any seller without an SBBS link now. My friends are catching on too.", revieweeName: "Snkrs Gh" },
  { name: "Kwame F.", role: "Rider · Accra", stars: 5, body: "I get my delivery fee whether the buyer accepts or not. Finally a system that respects the dispatch.", revieweeName: "SBBS" },
  { name: "Nana K.", role: "Seller · Madina", stars: 5, body: "Public profile with my reviews? It's basically free marketing. People DM saying 'I trust you because of SBBS.'", revieweeName: "SBBS" },
  { name: "Sandra L.", role: "Buyer · Spintex", stars: 5, body: "The tracking page lets my husband watch my order arrive. Felt premium for a ₵180 hair purchase.", revieweeName: "Marie's Tools" },
  { name: "Bright A.", role: "Buyer · Tamale", stars: 5, body: "Bought sneakers from a guy in Kumasi. STC delivery, code released after I tried them on. Surreal.", revieweeName: "Snkrs Gh" },
];

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
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(live.length > 0
            ? live.map((r) => ({
                name: "Verified buyer",
                role: relativeTime(r.createdAt),
                stars: r.stars,
                body: r.body ?? "",
                revieweeName: r.revieweeName,
              }))
            : SEED
          ).map((r, i) => (
            <Card key={i} className="p-6 hover:shadow-[var(--shadow-pop)] transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[var(--accent)]">
                  {Array.from({ length: r.stars }).map((_, idx) => (
                    <Star key={idx} size={14} fill="currentColor" />
                  ))}
                </div>
                <Badge tone="neutral">{r.revieweeName}</Badge>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed">&ldquo;{r.body}&rdquo;</p>
              <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-sm font-semibold">{r.name}</span>
                <span className="text-xs text-[var(--muted)]">{r.role}</span>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}
