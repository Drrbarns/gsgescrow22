import { Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppTopbar } from "@/components/app-shell/topbar";
import { isDbLive } from "@/lib/env";
import { getDb } from "@/lib/db/client";
import { reviews } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Reviews" };

export default async function AdminReviewsPage() {
  let rows: Array<{ id: string; stars: number; body: string | null; revieweeName: string; isPublic: boolean; createdAt: Date }> = [];
  if (isDbLive) {
    try {
      rows = await getDb().select().from(reviews).orderBy(desc(reviews.createdAt)).limit(100);
    } catch {}
  }
  return (
    <>
      <AppTopbar title="Reviews" subtitle="Moderate the public reviews wall" />
      <main className="flex-1">
        <Container size="wide" className="py-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rows.length === 0 && (
              <Card className="p-8 text-center sm:col-span-2 lg:col-span-3">
                <p className="text-sm text-[var(--muted)]">No reviews yet</p>
              </Card>
            )}
            {rows.map((r) => (
              <Card key={r.id} className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[var(--accent)]">
                    {Array.from({ length: r.stars }).map((_, i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <Badge tone={r.isPublic ? "success" : "neutral"}>
                    {r.isPublic ? "Public" : "Hidden"}
                  </Badge>
                </div>
                <p className="mt-3 text-sm text-[var(--muted)] uppercase tracking-[0.14em] font-semibold text-xs">
                  About {r.revieweeName}
                </p>
                <p className="mt-2 text-[15px]">&ldquo;{r.body ?? "—"}&rdquo;</p>
                <p className="mt-3 text-xs text-[var(--muted)]">{relativeTime(r.createdAt)}</p>
              </Card>
            ))}
          </div>
        </Container>
      </main>
    </>
  );
}
