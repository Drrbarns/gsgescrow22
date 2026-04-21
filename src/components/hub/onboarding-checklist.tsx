import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Check, Circle, Sparkles, ShieldCheck, Wallet, BadgeCheck, User } from "lucide-react";
import type { Profile } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export function OnboardingChecklist({
  profile,
  hasActiveDeal,
  hasCompletedDeal,
}: {
  profile: Profile | null;
  hasActiveDeal: boolean;
  hasCompletedDeal: boolean;
}) {
  const steps = [
    {
      id: "profile",
      icon: User,
      title: "Set your display name",
      body: "Buyers see this on payment links and public tracking.",
      done: Boolean(profile?.displayName),
      href: "/hub/profile",
    },
    {
      id: "momo",
      icon: Wallet,
      title: "Save your MoMo payout number",
      body: "Where SBBS sends your money when orders release.",
      done: Boolean(profile?.momoNumber),
      href: "/hub/profile",
    },
    {
      id: "kyc",
      icon: ShieldCheck,
      title: "Complete KYC",
      body: "Required for payouts above the soft-launch cap and to earn the Trust Badge.",
      done: profile?.kycStatus === "approved",
      pending: profile?.kycStatus === "pending",
      href: "/hub/profile",
    },
    {
      id: "firstDeal",
      icon: Sparkles,
      title: "Start your first protected deal",
      body: "Send a payment link from the seller wizard or start a purchase.",
      done: hasActiveDeal || hasCompletedDeal,
      href: "/sell",
    },
    {
      id: "badge",
      icon: BadgeCheck,
      title: "Earn the Trust Badge",
      body: "Automatic after KYC approval. Embed on your Instagram bio.",
      done: Boolean(profile?.badgeEnabled),
      href: "/badge",
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  if (completed === steps.length) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Get set up</h2>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            {completed}/{steps.length} complete — a couple of minutes to unlock everything.
          </p>
        </div>
        <div className="w-40 h-1.5 rounded-full bg-[var(--surface-muted)] overflow-hidden">
          <div
            className="h-full bg-[var(--primary)]"
            style={{ width: `${(completed / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <ul className="mt-5 space-y-2">
        {steps.map((s) => (
          <li key={s.id}>
            <Link
              href={s.href}
              className={cn(
                "flex items-start gap-3 p-3 rounded-md border border-[var(--border)] hover:bg-[var(--surface-muted)]/40 transition-colors",
                s.done && "opacity-60",
              )}
            >
              <span
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-full shrink-0",
                  s.done
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : s.pending
                      ? "bg-[#fbf2dd] text-[#7a5410]"
                      : "bg-[var(--surface-muted)] text-[var(--muted)]",
                )}
              >
                {s.done ? <Check size={14} /> : s.pending ? <s.icon size={14} /> : <Circle size={14} />}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {s.title}
                  {s.pending && <span className="ml-2 text-xs text-[#7a5410] font-normal">Under review</span>}
                </p>
                <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">{s.body}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
