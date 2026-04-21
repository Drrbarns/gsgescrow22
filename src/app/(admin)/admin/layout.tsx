import {
  Activity,
  Users,
  Receipt,
  ShieldAlert,
  Star,
  Wallet,
  CheckCircle2,
  BadgeCheck,
  Eye,
  BarChart3,
  Settings,
  LogOut,
  Bike,
  BookOpen,
  History,
  Store,
  Send,
} from "lucide-react";
import { AppSidebar } from "@/components/app-shell/sidebar";
import { LogoutButton } from "@/components/auth/logout-button";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { requireRole } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Edge middleware has already kicked anonymous users to /admin-login. Here
  // we gate by role so a seller who somehow reaches /admin gets bounced to
  // their hub instead of seeing the control room chrome at all.
  await requireRole(["admin", "superadmin", "approver"], "/admin-login");
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <ImpersonationBanner />
      <div className="flex flex-1"><AppSidebar
        brandSubtitle="Control room"
        items={[
          { href: "/admin", label: "Dashboard", icon: Activity },
          { href: "/admin/users", label: "Users", icon: Users },
          { href: "/admin/transactions", label: "Transactions", icon: Receipt },
          { href: "/admin/disputes", label: "Disputes", icon: ShieldAlert },
          { href: "/admin/reviews", label: "Reviews", icon: Star },
          { href: "/admin/payouts", label: "Payouts", icon: Wallet },
          { href: "/admin/payouts/approvals", label: "Payout Approvals", icon: CheckCircle2 },
          { href: "/admin/kyc", label: "KYC Verifications", icon: BadgeCheck },
          { href: "/admin/listings", label: "Listings", icon: Store },
          { href: "/admin/fraud", label: "Fraud", icon: Eye },
          { href: "/admin/riders", label: "Riders", icon: Bike },
          { href: "/admin/reports", label: "Reports", icon: BarChart3 },
          { href: "/admin/sms", label: "SMS log", icon: Send },
          { href: "/admin/activity", label: "Audit log", icon: History },
          { href: "/admin/runbook", label: "Runbook", icon: BookOpen },
          { href: "/admin/settings", label: "Platform Settings", icon: Settings },
        ]}
        footer={
          <LogoutButton>
            <span className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] px-3 py-2">
              <LogOut size={14} /> Sign out
            </span>
          </LogoutButton>
        }
      />
      <div className="flex-1 flex flex-col">{children}</div></div>
    </div>
  );
}
