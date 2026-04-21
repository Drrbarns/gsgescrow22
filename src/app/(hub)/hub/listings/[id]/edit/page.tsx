import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Container } from "@/components/ui/container";
import { AppTopbar } from "@/components/app-shell/topbar";
import { Badge } from "@/components/ui/badge";
import { ListingForm } from "@/components/hub/listing-form";
import { getDb } from "@/lib/db/client";
import { listings } from "@/lib/db/schema";
import { isDbLive } from "@/lib/env";
import { getSessionUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isDbLive) return notFound();
  const user = await getSessionUser();
  if (!user) return notFound();
  const db = getDb();
  const [row] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
  if (!row) return notFound();
  if (row.sellerId !== user.id) return notFound();

  const category = row.category as
    | "fashion"
    | "beauty"
    | "hair"
    | "sneakers"
    | "electronics"
    | "food"
    | "home"
    | "automotive"
    | "services"
    | "art"
    | "other";

  return (
    <>
      <AppTopbar
        title={row.title}
        subtitle="Edit your listing"
        actions={<Badge tone={row.state === "published" ? "success" : "warning"}>{row.state.replace("_", " ")}</Badge>}
      />
      <main className="flex-1">
        <Container size="wide" className="py-8">
          <ListingForm
            initial={{
              id: row.id,
              kind: row.kind as "product" | "service",
              title: row.title,
              tagline: row.tagline ?? "",
              description: row.description,
              category,
              priceCedis: (row.price / 100).toFixed(2),
              deliveryCedis: (row.deliveryFee / 100).toFixed(2),
              images: (row.images ?? []) as string[],
              city: row.city ?? "",
              deliveryAvailable: row.deliveryAvailable,
              stock: row.stock ? String(row.stock) : "",
              tags: (row.tags ?? []) as string[],
              state: row.state,
            }}
          />
        </Container>
      </main>
    </>
  );
}
