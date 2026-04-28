"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface in browser console for ops; the server side already audit-logs.
    console.error("[app/error]", error);
  }, [error]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-[-12%] h-96 w-96 rounded-full bg-[var(--danger)]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-[-12%] h-96 w-96 rounded-full bg-[var(--primary)]/12 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
        <Logo className="mb-10" />

        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--danger)]/10 text-[var(--danger)] shadow-[0_0_0_6px_var(--danger)/8%]">
          <AlertTriangle className="h-7 w-7" />
        </span>

        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Something went wrong on our end
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[var(--muted)]">
          We&rsquo;ve logged the issue and our team will review it. Your
          payments and escrow balances are safe — nothing was lost. Try the
          page again or head back home.
        </p>

        {error?.digest ? (
          <p className="mt-4 text-xs text-[var(--muted)]">
            Reference:{" "}
            <code className="rounded bg-[var(--primary-soft)] px-1.5 py-0.5 font-mono text-[11px] text-[var(--primary)]">
              {error.digest}
            </code>
          </p>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-[0_2px_0_#00000020,0_8px_22px_-12px_rgba(79,43,184,0.65)] transition hover:opacity-95 active:scale-[0.99]"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-3 text-sm font-semibold transition hover:border-[var(--primary)]/40"
          >
            Back to home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-10 text-xs text-[var(--muted)]">
          Need urgent help with a transaction?{" "}
          <Link
            href="/contact"
            className="font-semibold text-[var(--primary)] underline-offset-4 hover:underline"
          >
            Contact support
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
