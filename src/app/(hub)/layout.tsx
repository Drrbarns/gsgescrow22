import { Home, Receipt, Bell, BadgeCheck, ShieldCheck, LogOut, Store, Shield } from "lucide-react";
import { AppSidebar } from "@/components/app-shell/sidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { ImpersonationBanner } from "@/components/admin/impersonation-banner";
import { getCurrentProfile, isAdminRole } from "@/lib/auth/session";
import { ensureProfile } from "@/lib/actions/ensure-profile";

export default async function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The proxy has already redirected anon users to /login. We only need the
  // profile for the admin banner + impersonation context.
  // Auto-create the profile row on first landing — this matters for users who
  // finished signup via a Supabase email confirmation link and skipped the
  // client-side ensureProfile() call. Safe no-op if DB isn't configured.
  await ensureProfile({}).catch(() => {});
  const profile = await getCurrentProfile().catch(() => null);
  const admin = profile && isAdminRole(profile.role);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <ImpersonationBanner />
      {admin && (
        <div className="bg-[var(--primary)] text-[var(--primary-foreground)] px-5 py-2 flex items-center justify-center gap-3 text-sm">
          <Shield size={14} />
          <span>
            You&rsquo;re signed in as{" "}
            <strong className="font-semibold">{profile.role}</strong> —{" "}
            <Link href="/admin" className="underline underline-offset-2 font-semibold">
              open the control room
            </Link>
          </span>
        </div>
      )}
      <div className="flex flex-1">
        <AppSidebar
          brandSubtitle="Your Hub"
          items={[
            { href: "/hub", label: "Dashboard", icon: Home },
            { href: "/hub/transactions", label: "Transactions", icon: Receipt },
            { href: "/hub/listings", label: "My listings", icon: Store },
            { href: "/hub/disputes", label: "Disputes", icon: ShieldCheck },
            { href: "/hub/notifications", label: "Notifications", icon: Bell },
            { href: "/hub/profile", label: "Profile & KYC", icon: BadgeCheck },
            ...(admin
              ? [{ href: "/admin", label: "Control room", icon: Shield }]
              : []),
          ]}
          footer={
            <div className="space-y-2">
              <Link href="/buy">
                <Button className="w-full" size="sm">
                  Start a purchase
                </Button>
              </Link>
              <LogoutButton>
                <span className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] px-3 py-2">
                  <LogOut size={14} /> Sign out
                </span>
              </LogoutButton>
            </div>
          }
        />
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </div>
  );
}
