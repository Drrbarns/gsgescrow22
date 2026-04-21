import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
          <EmptyState connected={isDbLive} q={q} />
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
  if (!isDbLive) return SEED;
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
    return SEED;
  }
}

const SEED = [
  {
    id: "seed-1",
    slug: "kente-a-line-dress",
    title: "Handmade Kente A-line dress",
    tagline: "Limited run · Sizes S, M, L",
    price: 42000,
    images: ["https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=900&q=70"],
    category: "fashion",
    kind: "product",
    city: "Accra",
    featured: true,
    sellerName: "Kente Couture",
    sellerHandle: "kente_couture",
    sellerBadge: true,
    sellerKyc: "approved",
  },
  {
    id: "seed-2",
    slug: "unisex-sneakers-og",
    title: "Vintage sneakers · OG colorway",
    tagline: "Imported UK 9 · Deadstock",
    price: 180000,
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=70"],
    category: "sneakers",
    kind: "product",
    city: "Kumasi",
    featured: true,
    sellerName: "Snkrs GH",
    sellerHandle: "snkrs_gh",
    sellerBadge: true,
    sellerKyc: "approved",
  },
  {
    id: "seed-3",
    slug: "luxury-braids-session",
    title: "Luxury knotless braids (full session)",
    tagline: "Home service · 3-4 hours",
    price: 60000,
    images: ["https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=900&q=70"],
    category: "hair",
    kind: "service",
    city: "East Legon",
    featured: true,
    sellerName: "Luxe Braids GH",
    sellerHandle: "luxe_braids_gh",
    sellerBadge: true,
    sellerKyc: "approved",
  },
  {
    id: "seed-4",
    slug: "afro-scented-candle",
    title: "Afro-scented soy candles",
    tagline: "200g · 3 scents available",
    price: 12000,
    images: ["https://images.unsplash.com/photo-1602874801007-bd36c375b0d3?auto=format&fit=crop&w=900&q=70"],
    category: "home",
    kind: "product",
    city: "Spintex",
    featured: false,
    sellerName: "Motherland Scents",
    sellerHandle: "motherland_scents",
    sellerBadge: true,
    sellerKyc: "approved",
  },
  {
    id: "seed-5",
    slug: "custom-ankara-suit",
    title: "Custom Ankara suit (made to measure)",
    tagline: "Choose your print · 7 day turnaround",
    price: 95000,
    images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=70"],
    category: "fashion",
    kind: "product",
    city: "Madina",
    featured: false,
    sellerName: "Ataa Studio",
    sellerHandle: "ataa_studio",
    sellerBadge: false,
    sellerKyc: "approved",
  },
  {
    id: "seed-6",
    slug: "skincare-starter-kit",
    title: "SPF + serum starter kit",
    tagline: "Cleanser + serum + SPF 50",
    price: 32000,
    images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=70"],
    category: "beauty",
    kind: "product",
    city: "Osu",
    featured: false,
    sellerName: "Bliss Beauty GH",
    sellerHandle: "bliss_beauty_gh",
    sellerBadge: true,
    sellerKyc: "approved",
  },
  {
    id: "seed-7",
    slug: "home-cooks-jollof-tray",
    title: "Sunday jollof tray (serves 6)",
    tagline: "Pickup or next-day delivery",
    price: 25000,
    images: ["https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=900&q=70"],
    category: "food",
    kind: "service",
    city: "Airport Hills",
    featured: false,
    sellerName: "Home Cooks GH",
    sellerHandle: "home_cooks_gh",
    sellerBadge: false,
    sellerKyc: "pending",
  },
  {
    id: "seed-8",
    slug: "iphone-14-pro-mint",
    title: "iPhone 14 Pro · 256GB · Mint",
    tagline: "Warranty + box included",
    price: 850000,
    images: ["https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=900&q=70"],
    category: "electronics",
    kind: "product",
    city: "Takoradi",
    featured: false,
    sellerName: "Electro Flip",
    sellerHandle: "electro_flip",
    sellerBadge: true,
    sellerKyc: "approved",
  },
];

function EmptyState({ connected, q }: { connected: boolean; q: string }) {
  return (
    <Card className="p-14 text-center">
      <h3 className="font-display text-2xl font-semibold">
        {q ? `No listings match "${q}"` : connected ? "No listings yet" : "Marketplace preview"}
      </h3>
      <p className="mt-2 text-sm text-[var(--muted)] max-w-md mx-auto">
        {connected
          ? "Be the first seller to list — SBBS-protected buyers are waiting."
          : "The marketplace will light up once the database is connected. For now, this is a preview of the layout."}
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <a href="/hub/listings/new" className="text-sm font-semibold text-[var(--primary)] underline">
          Start selling
        </a>
      </div>
    </Card>
  );
}
