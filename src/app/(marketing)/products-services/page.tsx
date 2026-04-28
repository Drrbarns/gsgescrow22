import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { getDb } from "@/lib/db/client";
import { listings, profiles } from "@/lib/db/schema";
import { isDbLive } from "@/lib/env";
import { MarketplaceHero } from "@/components/marketing/marketplace-hero";
import { ListingCard } from "@/components/marketing/listing-card";
import { MarketplaceFilters } from "@/components/marketing/marketplace-filters";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products & Services" };

type Category =
  | "all"
  | "fashion"
  | "beauty"
  | "hair"
  | "electronics"
  | "food"
  | "home"
  | "services"
  | "automotive"
  | "sneakers"
  | "art"
  | "other";

type Kind = "all" | "product" | "service";
type Sort = "newest" | "popular" | "price_low" | "price_high";

export default async function ProductsServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; c?: string; k?: string; s?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const category = (sp.c ?? "all") as Category;
  const kind = (sp.k ?? "all") as Kind;
  const sort = (sp.s ?? "newest") as Sort;

  const items = await fetchListings({ q, category, kind, sort });

  const featured = items.filter((i) => i.featured).slice(0, 3);
  const regular = items.filter((i) => !featured.some((f) => f.id === i.id));
  const dbConnected = isDbLive;

  return (
    <>
      <MarketplaceHero />
      <Container size="wide" className="-mt-16 lg:-mt-20 relative z-10">
        <MarketplaceFilters
          q={q}
          category={category}
          kind={kind}
          sort={sort}
          total={items.length}
        />
      </Container>

      <Container size="wide" className="pt-10 pb-24">
        {items.length === 0 ? (
          <EmptyState connected={dbConnected} q={q} />
        ) : (
          <div className="space-y-12">
            {featured.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-[0.18em] font-semibold text-[var(--muted)] mb-4">
                  Featured this week
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {featured.map((item) => (
                    <ListingCard key={item.id} listing={item} featured />
                  ))}
                </div>
              </section>
            )}
            <section>
              <h2 className="text-xs uppercase tracking-[0.18em] font-semibold text-[var(--muted)] mb-4">
                {items.length} {items.length === 1 ? "listing" : "listings"}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {regular.map((item) => (
                  <ListingCard key={item.id} listing={item} />
                ))}
              </div>
            </section>
          </div>
        )}
      </Container>
    </>
  );
}

async function fetchListings({
  q,
  category,
  kind,
  sort,
}: {
  q: string;
  category: Category;
  kind: Kind;
  sort: Sort;
}): Promise<
  Array<{
    id: string;
    slug: string;
    title: string;
    tagline: string | null;
    price: number;
    images: string[];
    category: string;
    kind: string;
    city: string | null;
    featured: boolean;
    sellerName: string | null;
    sellerHandle: string | null;
    sellerBadge: boolean;
    sellerKyc: string;
  }>
> {
  if (!isDbLive) return [];
  try {
    const db = getDb();
    const conditions = [eq(listings.state, "published")];
    if (category !== "all") conditions.push(eq(listings.category, category));
    if (kind !== "all") conditions.push(eq(listings.kind, kind));
    if (q) {
      const pattern = `%${q}%`;
      conditions.push(
        or(
          ilike(listings.title, pattern),
          ilike(listings.description, pattern),
          ilike(listings.tagline, pattern),
        )!,
      );
    }
    const order =
      sort === "popular"
        ? [desc(listings.featured), desc(listings.purchases), desc(listings.views)]
        : sort === "price_low"
          ? [sql`${listings.price} asc`]
          : sort === "price_high"
            ? [desc(listings.price)]
            : [desc(listings.featured), desc(listings.publishedAt)];

    const rows = await db
      .select({
        id: listings.id,
        slug: listings.slug,
        title: listings.title,
        tagline: listings.tagline,
        price: listings.price,
        images: listings.images,
        category: listings.category,
        kind: listings.kind,
        city: listings.city,
        featured: listings.featured,
        sellerName: profiles.displayName,
        sellerHandle: profiles.handle,
        sellerBadge: profiles.badgeEnabled,
        sellerKyc: profiles.kycStatus,
      })
      .from(listings)
      .leftJoin(profiles, eq(listings.sellerId, profiles.id))
      .where(and(...conditions))
      .orderBy(...order)
      .limit(60);
    return rows.map((r) => ({
      ...r,
      images: (r.images ?? []) as string[],
      sellerName: r.sellerName ?? null,
      sellerHandle: r.sellerHandle ?? null,
      sellerBadge: r.sellerBadge ?? false,
      sellerKyc: r.sellerKyc ?? "none",
    }));
  } catch {
    return [];
  }
}

function EmptyState({ connected, q }: { connected: boolean; q: string }) {
  return (
    <Card className="p-14 text-center">
      <h3 className="font-display text-2xl font-semibold">
        {q
          ? `No listings match "${q}"`
          : connected
            ? "No listings yet"
            : "Marketplace coming soon"}
      </h3>
      <p className="mt-2 text-sm text-[var(--muted)] max-w-md mx-auto">
        {connected
          ? "Be the first seller to list — SBBS-protected buyers are waiting."
          : "Listings will appear here once sellers start publishing."}
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <a href="/hub/listings/new" className="text-sm font-semibold text-[var(--primary)] underline">
          Start selling
        </a>
      </div>
    </Card>
  );
}
