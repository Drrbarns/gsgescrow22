import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppTopbar } from "@/components/app-shell/topbar";
import { isDbLive } from "@/lib/env";
import { getDb } from "@/lib/db/client";
import { riders, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Bike } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Riders" };

export default async function AdminRidersPage() {
  let rows: Array<{ id: string; serviceArea: string; vehicle: string | null; rating: number; completedDeliveries: number; available: boolean; name: string | null; phone: string | null }> = [];
  if (isDbLive) {
    try {
      rows = await getDb()
        .select({
          id: riders.id,
          serviceArea: riders.serviceArea,
          vehicle: riders.vehicle,
          rating: riders.rating,
          completedDeliveries: riders.completedDeliveries,
          available: riders.available,
          name: profiles.displayName,
          phone: profiles.phone,
        })
        .from(riders)
        .leftJoin(profiles, eq(riders.profileId, profiles.id));
    } catch {}
  }
  return (
    <>
      <AppTopbar title="Rider directory" subtitle="Independent dispatch riders available to brokered transactions" actions={<Button variant="secondary"><Bike size={14} /> Invite a rider</Button>} />
      <main className="flex-1">
        <Container size="wide" className="py-8">
          {rows.length === 0 ? (
            <Card className="p-14 text-center">
              <Bike className="mx-auto text-[var(--primary)]" size={28} />
              <h3 className="font-display text-xl font-semibold mt-3">Rider marketplace coming online in Phase 5</h3>
              <p className="mt-2 text-sm text-[var(--muted)] max-w-md mx-auto">
                Once enabled, any seller can book any verified rider through SBBS,
                with a separate payout bucket released on dispatch.
              </p>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rows.map((r) => (
                <Card key={r.id} className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-display font-semibold">{r.name ?? "Unknown"}</p>
                    <Badge tone={r.available ? "success" : "neutral"} dot>
                      {r.available ? "Available" : "Off"}
                    </Badge>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-1 font-mono">{r.phone}</p>
                  <p className="mt-3 text-sm">{r.serviceArea}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">{r.vehicle ?? "—"}</p>
                  <p className="text-xs text-[var(--muted)] mt-3">
                    {r.completedDeliveries} deliveries · ★ {r.rating.toFixed(1)}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </main>
    </>
  );
}
