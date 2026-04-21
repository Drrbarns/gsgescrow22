import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ShieldCheck } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface-muted)]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-4 flex flex-col gap-4">
          <Logo />
          <p className="text-sm text-[var(--muted)] max-w-xs">
            Ghana&rsquo;s trusted middleman for Instagram, WhatsApp, TikTok and
            informal commerce. Money held by a licensed PSP, never by SBBS.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--primary)] w-fit">
            <ShieldCheck size={14} />
            Funds held by Moolre — never by SBBS
          </div>
        </div>
        <FooterColumn
          title="Product"
          links={[
            { href: "/how-it-works", label: "How it works" },
            { href: "/buy", label: "Start a purchase" },
            { href: "/sell", label: "Create a payment link" },
            { href: "/calculator", label: "Fee calculator" },
            { href: "/track", label: "Track an order" },
          ]}
        />
        <FooterColumn
          title="Trust"
          links={[
            { href: "/reviews", label: "Reviews wall" },
            { href: "/badge", label: "Get a Trust Badge" },
            { href: "/disputes-policy", label: "Refund & Dispute policy" },
            { href: "/security", label: "Security" },
          ]}
        />
        <FooterColumn
          title="Company"
          links={[
            { href: "/about", label: "About" },
            { href: "/contact", label: "Contact" },
            { href: "/terms", label: "Terms" },
            { href: "/privacy", label: "Privacy" },
          ]}
        />
      </div>
      <div className="border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[var(--muted)]">
          <p>© {new Date().getFullYear()} GSG Brands. All rights reserved.</p>
          <p className="font-mono">
            Built in Accra · Powered by Moolre · DPC registration pending
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="md:col-span-2 lg:col-span-2 flex flex-col gap-3">
      <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--foreground)]">
        {title}
      </h4>
      <ul className="flex flex-col gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
