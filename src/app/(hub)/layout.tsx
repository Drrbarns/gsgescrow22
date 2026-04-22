import { Shield, LogOut } from "lucide-react";
import { AppSidebar, AppMobileNav, type NavItem } from "@/components/app-shell/sidebar";
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
  await ensureProfile({}).catch(() => {});
  const profile = await getCurrentProfile().catch(() => null);
  const admin = profile && isAdminRole(profile.role);

  const items: NavItem[] = [
    { href: "/hub", label: "Dashboard", icon: "home" },
    { href: "/hub/transactions", label: "Transactions", icon: "receipt" },
    { href: "/hub/listings", label: "My listings", icon: "store" },
    { href: "/hub/disputes", label: "Disputes", icon: "shieldCheck" },
    { href: "/hub/notifications", label: "Notifications", icon: "bell" },
    { href: "/hub/profile", label: "Profile & KYC", icon: "badgeCheck" },
    ...(admin
      ? [{ href: "/admin", label: "Control room", icon: "shield" as const }]
      : []),
  ];
  const footer = (
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
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <ImpersonationBanner />
      {admin && (
        <div className="bg-[var(--primary)] text-[var(--primary-foreground)] px-4 sm:px-5 py-2 flex items-center justify-center gap-2 sm:gap-3 text-[13px] sm:text-sm flex-wrap text-center">
          <Shield size={14} className="shrink-0" />
          <span>
            You&rsquo;re signed in as{" "}
            <strong className="font-semibold">{profile.role}</strong> —{" "}
            <Link href="/admin" className="underline underline-offset-2 font-semibold whitespace-nowrap">
              open the control room
            </Link>
          </span>
        </div>
      )}
      <AppMobileNav brandSubtitle="Your Hub" items={items} footer={footer} />
      <div className="flex flex-1 min-w-0">
        <AppSidebar brandSubtitle="Your Hub" items={items} footer={footer} />
        <div className="flex-1 min-w-0 flex flex-col">{children}</div>
      </div>
    </div>
  );
}
