import Link from "next/link";
import {
  ShieldCheck,
  MessageCircle,
  Mail,
  MapPin,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-[var(--border)] bg-[var(--surface-muted)]">
      {/* Atmospheric accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)]/50 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-10%] h-72 w-72 rounded-full bg-[var(--primary)]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-[-8%] h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-10">
        {/* CTA strip */}
        <div className="mb-12 sm:mb-16 rounded-[24px] sm:rounded-[28px] border border-[var(--border)] bg-gradient-to-br from-white via-white to-[color-mix(in_oklch,var(--primary)_6%,white)] p-6 sm:p-8 shadow-[0_40px_90px_-50px_rgba(79,43,184,0.35)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                Escrow, without the tears
              </p>
              <h3 className="mt-2 font-display text-[26px] sm:text-[32px] leading-[1.08] tracking-[-0.02em] text-balance">
                Ready to send money the safe way?
              </h3>
              <p className="mt-2 text-sm sm:text-[15px] text-[var(--muted)] leading-relaxed">
                Funds sit with a licensed PSP until the buyer confirms delivery.
                No WhatsApp drama, no &ldquo;bro send first&rdquo; tension.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
              <Link
                href="/buy"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--primary)] text-white px-5 py-3 text-sm font-semibold shadow-[0_14px_30px_-14px_rgba(79,43,184,0.75)] hover:bg-[var(--primary-hover)] transition-all"
              >
                Start a protected purchase
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
              <Link
                href="/sell"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
              >
                Create a payment link
              </Link>
            </div>
          </div>
        </div>

        {/* Brand + link columns */}
        <div className="grid gap-10 md:gap-12 md:grid-cols-12">
          <div className="md:col-span-5 flex flex-col gap-5">
            <Logo />
            <p className="text-sm text-[var(--muted)] max-w-sm leading-relaxed">
              Ghana&rsquo;s trusted middleman for Instagram, WhatsApp, TikTok
              and informal commerce. Money held by a licensed PSP, never by
              SBBS.
            </p>

            <div className="flex flex-wrap gap-2">
              <TrustChip
                icon={<ShieldCheck size={13} />}
                label="Funds held by Moolre"
                emphasis
              />
              <TrustChip label="SMS audit trail" />
              <TrustChip label="Signed payouts" />
            </div>

            <div className="mt-1 flex flex-col gap-2.5">
              <ContactRow
                icon={<MessageCircle size={14} />}
                href="https://wa.me/233000000000"
                primary="WhatsApp us"
                secondary="Mon–Sat · 8am – 8pm GMT"
                external
              />
              <ContactRow
                icon={<Mail size={14} />}
                href="mailto:support@sbs.gsgbrands.com.gh"
                primary="support@sbs.gsgbrands.com.gh"
              />
              <ContactRow
                icon={<MapPin size={14} />}
                primary="Accra, Ghana"
              />
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10">
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
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative border-t border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[var(--muted)]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <p>© {year} GSG Brands. All rights reserved.</p>
            <span
              aria-hidden
              className="hidden sm:inline-block h-3 w-px bg-[var(--border-strong)]"
            />
            <Link
              href="/terms"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/security"
              className="hover:text-[var(--foreground)] transition-colors"
            >
              Security
            </Link>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-[11px]">
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              All systems operational
            </span>
            <span
              aria-hidden
              className="h-3 w-px bg-[var(--border-strong)]"
            />
            <span>Built in Accra · Powered by Moolre</span>
          </div>
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
    <div className="flex flex-col gap-3">
      <h4 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--foreground)]">
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--primary)]"
        />
        {title}
      </h4>
      <ul className="flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              {l.label}
              <ArrowRight
                size={12}
                className="opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-[var(--primary)]"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrustChip({
  icon,
  label,
  emphasis = false,
}: {
  icon?: React.ReactNode;
  label: string;
  emphasis?: boolean;
}) {
  return (
    <span
      className={
        emphasis
          ? "inline-flex items-center gap-1.5 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-medium text-[var(--primary)]"
          : "inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-medium text-[var(--muted)]"
      }
    >
      {icon}
      {label}
    </span>
  );
}

function ContactRow({
  icon,
  href,
  primary,
  secondary,
  external = false,
}: {
  icon: React.ReactNode;
  href?: string;
  primary: string;
  secondary?: string;
  external?: boolean;
}) {
  const content = (
    <>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--primary)]">
        {icon}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-medium text-[var(--foreground)]">
          {primary}
        </span>
        {secondary ? (
          <span className="text-[11px] text-[var(--muted)]">{secondary}</span>
        ) : null}
      </span>
    </>
  );

  if (!href) {
    return (
      <div className="inline-flex items-center gap-3 text-sm text-[var(--muted)]">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group inline-flex items-center gap-3 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors w-fit"
    >
      {content}
    </Link>
  );
}
