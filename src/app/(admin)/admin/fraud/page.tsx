import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppTopbar } from "@/components/app-shell/topbar";
import { isDbLive } from "@/lib/env";
import { getDb } from "@/lib/db/client";
import { alerts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { AlertRow } from "@/components/admin/alert-row";
import { getSettings } from "@/lib/settings";
import { formatGhs } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Fraud" };

export default async function AdminFraudPage() {
  const settings = await getSettings();
  let rows: Array<{ id: string; kind: string; severity: string; title: string; message: string | null; createdAt: Date; acknowledgedAt: Date | null }> = [];
  if (isDbLive) {
    try {
      rows = await getDb().select().from(alerts).orderBy(desc(alerts.createdAt)).limit(100);
    } catch {}
  }

  const RULES = [
    {
      name: "High-value alert",
      body: `Alert every payout that meets or exceeds ${formatGhs(settings.high_value_alert_pesewas)}.`,
      enabled: true,
      live: true,
    },
    {
      name: "New seller large payout",
      body: `Alert if a payout ≥ ${formatGhs(settings.new_seller_max_payout_pesewas)} is queued for a seller younger than ${settings.new_seller_days_threshold} days.`,
      enabled: true,
      live: true,
    },
    {
      name: "Velocity",
      body: "Alert if a single seller has more than 5 payouts queued in 24 hours.",
      enabled: true,
      live: true,
    },
    {
      name: "Mismatched MoMo",
      body: "Alert if the seller's payout MoMo differs from their recent payouts.",
      enabled: true,
      live: true,
    },
    {
      name: "Repeat disputes",
      body: "Block payout if the same seller has 3+ disputes in 30 days.",
      enabled: true,
      live: true,
    },
    {
      name: "Seller suspended",
      body: "Block payout if the seller account is suspended.",
      enabled: true,
      live: true,
    },
    {
      name: "KYC missing on large payout",
      body: `Block payout if seller isn't KYC-approved and payout ≥ ${formatGhs(settings.new_seller_max_payout_pesewas)}.`,
      enabled: true,
      live: true,
    },
    {
      name: "Two-approver threshold",
      body: `Above ${formatGhs(settings.two_approver_threshold_pesewas)}, payouts require two different approvers.`,
      enabled: true,
      live: true,
    },
  ];
  return (
    <>
      <AppTopbar title="Fraud & alerts" subtitle="Rules engine and the live alert feed" />
      <main className="flex-1">
        <Container size="wide" className="py-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-display text-lg font-semibold">Live alerts</h2>
            {rows.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-sm text-[var(--muted)]">All quiet.</p>
              </Card>
            ) : (
              rows.map((a) => (
                <AlertRow
                  key={a.id}
                  id={a.id}
                  severity={a.severity}
                  title={a.title}
                  message={a.message}
                  kind={a.kind}
                  createdAt={a.createdAt}
                  acknowledgedAt={a.acknowledgedAt}
                />
              ))
            )}
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold">Rules engine</h2>
            <div className="mt-3 space-y-3">
              {RULES.map((r) => (
                <Card key={r.name} className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm">{r.name}</p>
                    <div className="flex gap-1.5">
                      {r.live && <Badge tone="success">Live</Badge>}
                      <Badge tone={r.enabled ? "success" : "neutral"} dot>
                        {r.enabled ? "On" : "Off"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted)] mt-2 leading-relaxed">{r.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}
