import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppTopbar } from "@/components/app-shell/topbar";
import { isDbLive } from "@/lib/env";
import { getDb } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { relativeTime } from "@/lib/utils";
import { UserRowActions } from "@/components/admin/user-row-actions";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Users" };

const ROLE_TONE: Record<string, "info" | "success" | "warning" | "danger" | "neutral" | "accent"> = {
  buyer: "neutral",
  seller: "info",
  rider: "accent",
  admin: "danger",
  superadmin: "danger",
  approver: "warning",
};

const KYC_TONE: Record<string, "neutral" | "success" | "warning" | "danger"> = {
  none: "neutral",
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export default async function AdminUsersPage() {
  let users: Array<{ id: string; email: string | null; displayName: string | null; role: string; kycStatus: string; createdAt: Date; suspended: boolean; trustScore: number }> = [];
  if (isDbLive) {
    try {
      const db = getDb();
      users = await db.select().from(profiles).orderBy(desc(profiles.createdAt)).limit(100);
    } catch {}
  }

  return (
    <>
      <AppTopbar
        title="Users"
        subtitle={`${users.length} ${users.length === 1 ? "person" : "people"} in the system`}
        actions={
          <div className="flex gap-2">
            <Link href="/api/admin/export/audit"><Button variant="ghost" size="sm">Export audit</Button></Link>
            <Button variant="secondary" size="sm">Invite admin</Button>
          </div>
        }
      />
      <main className="flex-1">
        <Container size="wide" className="py-8">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] border-b border-[var(--border)] bg-[var(--surface-muted)]/40">
                    <th className="text-left px-6 py-3 font-semibold">User</th>
                    <th className="text-left px-4 py-3 font-semibold">Role</th>
                    <th className="text-left px-4 py-3 font-semibold">KYC</th>
                    <th className="text-right px-4 py-3 font-semibold">Trust</th>
                    <th className="text-left px-4 py-3 font-semibold">Status</th>
                    <th className="text-right px-6 py-3 font-semibold">Joined</th>
                    <th className="text-right px-6 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {users.length === 0 && (
                    <tr><td colSpan={7} className="px-6 py-8 text-center text-[var(--muted)]">No users yet</td></tr>
                  )}
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[var(--surface-muted)]/40">
                      <td className="px-6 py-3">
                        <div className="font-medium">{u.displayName ?? "—"}</div>
                        <div className="text-xs text-[var(--muted)]">{u.email}</div>
                      </td>
                      <td className="px-4 py-3"><Badge tone={ROLE_TONE[u.role] ?? "neutral"}>{u.role}</Badge></td>
                      <td className="px-4 py-3"><Badge tone={KYC_TONE[u.kycStatus] ?? "neutral"}>{u.kycStatus}</Badge></td>
                      <td className="px-4 py-3 text-right font-mono">{u.trustScore.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        {u.suspended ? <Badge tone="danger">Suspended</Badge> : <Badge tone="success" dot>Active</Badge>}
                      </td>
                      <td className="px-6 py-3 text-right text-[var(--muted)]">{relativeTime(u.createdAt)}</td>
                      <td className="px-6 py-3 text-right">
                        <UserRowActions
                          userId={u.id}
                          email={u.email}
                          currentRole={u.role}
                          suspended={u.suspended}
                        />
                      </td>
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
