import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppTopbar } from "@/components/app-shell/topbar";
import { Button } from "@/components/ui/button";
import { isDbLive } from "@/lib/env";
import { getDb } from "@/lib/db/client";
import { auditLog } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { relativeTime } from "@/lib/utils";
import { Download } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Audit log" };

const TONE: Record<string, "info" | "success" | "warning" | "danger" | "neutral" | "accent"> = {
  "txn.create": "info",
  "txn.pay": "info",
  "txn.dispatch": "accent",
  "txn.deliver": "accent",
  "txn.release": "success",
  "txn.auto_release": "success",
  "txn.cancel": "neutral",
  "txn.dispute_open": "danger",
  "txn.dispute_resolve": "warning",
  "payout.create": "info",
  "payout.approve": "info",
  "payout.reject": "danger",
  "payout.paid": "success",
  "payout.failed": "danger",
  "refund.issue": "warning",
  "kyc.submit": "info",
  "kyc.approve": "success",
  "kyc.reject": "danger",
  "user.role_change": "warning",
  "user.suspend": "danger",
  "user.unsuspend": "info",
  "user.impersonate": "danger",
  "settings.update": "warning",
  "review.create": "success",
  "alert.acknowledge": "info",
  "webhook.received": "neutral",
  "auth.login": "neutral",
  "auth.logout": "neutral",
};

export default async function AuditLogPage() {
  let rows: Array<{ id: string; actorEmail: string | null; actorRole: string | null; action: string; targetType: string | null; targetId: string | null; reason: string | null; ip: string | null; createdAt: Date; payload: unknown }> = [];
  if (isDbLive) {
    try {
      rows = await getDb().select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(200);
    } catch {}
  }
  return (
    <>
      <AppTopbar
        title="Audit log"
        subtitle="Every money-touching and security-sensitive action, with actor, reason, and IP."
        actions={
          <Link href="/api/admin/export/audit">
            <Button variant="secondary" size="sm"><Download size={14} /> Export CSV</Button>
          </Link>
        }
      />
      <main className="flex-1">
        <Container size="wide" className="py-8">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] border-b border-[var(--border)] bg-[var(--surface-muted)]/40">
                    <th className="text-left px-6 py-3 font-semibold">When</th>
                    <th className="text-left px-4 py-3 font-semibold">Actor</th>
                    <th className="text-left px-4 py-3 font-semibold">Action</th>
                    <th className="text-left px-4 py-3 font-semibold">Target</th>
                    <th className="text-left px-4 py-3 font-semibold">Reason</th>
                    <th className="text-left px-6 py-3 font-semibold">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {rows.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-[var(--muted)]">No audit entries yet</td></tr>}
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-[var(--surface-muted)]/40">
                      <td className="px-6 py-3 text-[var(--muted)] whitespace-nowrap">{relativeTime(r.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm">{r.actorEmail ?? "—"}</div>
                        <div className="text-[11px] text-[var(--muted)] capitalize">{r.actorRole ?? "—"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={TONE[r.action] ?? "neutral"}>{r.action}</Badge>
                      </td>
                      <td className="px-4 py-3 max-w-[220px] truncate font-mono text-xs">
                        {r.targetType ? `${r.targetType}/` : ""}{r.targetId ?? "—"}
                      </td>
                      <td className="px-4 py-3 max-w-[220px] truncate text-[var(--muted)]">{r.reason ?? "—"}</td>
                      <td className="px-6 py-3 text-[11px] font-mono text-[var(--muted)]">{r.ip ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Container>
      </main>
    </>
  );
}
