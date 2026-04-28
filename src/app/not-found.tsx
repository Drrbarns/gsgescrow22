import Link from "next/link";
import { ArrowRight, Compass, Home, Search, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export const metadata = {
  title: "Page not found",
  description:
    "The page you're looking for has moved or never existed. Use the links below to get back on track with Sell-Safe Buy-Safe.",
};

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* Atmospheric accents */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-12%] h-96 w-96 rounded-full bg-[var(--primary)]/12 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-[-12%] h-96 w-96 rounded-full bg-indigo-500/12 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <Logo className="mb-10" />

        <span className="font-display text-[10rem] leading-none font-bold tracking-tight bg-gradient-to-br from-[var(--primary)] via-violet-500 to-indigo-500 bg-clip-text text-transparent sm:text-[12rem]">
          404
        </span>

        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          We couldn&rsquo;t find that page
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">
          The link may be broken or the page may have moved. If you were sent
          here from a transaction SMS, double-check the reference and try the
          tracker.
        </p>

        <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-left transition hover:border-[var(--primary)]/40 hover:shadow-md"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                <Home className="h-4 w-4" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold">Back to home</span>
                <span className="text-xs text-[var(--muted)]">
                  How SBBS protects you
                </span>
              </span>
            </span>
            <ArrowRight className="h-4 w-4 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" />
          </Link>

          <Link
            href="/track"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-left transition hover:border-[var(--primary)]/40 hover:shadow-md"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                <Search className="h-4 w-4" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold">Track an order</span>
                <span className="text-xs text-[var(--muted)]">
                  Enter your SB-XXXXX-XXXX reference
                </span>
              </span>
            </span>
            <ArrowRight className="h-4 w-4 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" />
          </Link>

          <Link
            href="/how-it-works"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-left transition hover:border-[var(--primary)]/40 hover:shadow-md"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                <Compass className="h-4 w-4" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold">How it works</span>
                <span className="text-xs text-[var(--muted)]">
                  Buy or sell safely in 4 steps
                </span>
              </span>
            </span>
            <ArrowRight className="h-4 w-4 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" />
          </Link>

          <Link
            href="/contact"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 text-left transition hover:border-[var(--primary)]/40 hover:shadow-md"
          >
            <span className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold">Talk to support</span>
                <span className="text-xs text-[var(--muted)]">
                  We respond within one business day
                </span>
              </span>
            </span>
            <ArrowRight className="h-4 w-4 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" />
          </Link>
        </div>

        <p className="mt-10 text-xs text-[var(--muted)]">
          Looking for an order tracking link? Try{" "}
          <code className="rounded bg-[var(--primary-soft)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--primary)]">
            /track/SB-XXXXX-XXXX
          </code>
          .
        </p>
      </div>
    </main>
  );
}
