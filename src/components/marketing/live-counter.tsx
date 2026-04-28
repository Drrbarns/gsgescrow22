"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, TrendingUp, Users } from "lucide-react";
import { CountUp } from "@/components/fx/count-up";

interface Stats {
  protectedAmount: number;
  protectedCount: number;
  sellersOnboarded: number;
}

const FALLBACK: Stats = {
  protectedAmount: 0,
  protectedCount: 0,
  sellersOnboarded: 0,
};

export function LiveCounter() {
  const [stats, setStats] = useState<Stats>(FALLBACK);

  useEffect(() => {
    let mounted = true;
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data: Partial<Stats>) => {
        if (!mounted || !data) return;
        setStats({
          protectedAmount: data.protectedAmount ?? FALLBACK.protectedAmount,
          protectedCount: data.protectedCount ?? FALLBACK.protectedCount,
          sellersOnboarded: data.sellersOnboarded ?? FALLBACK.sellersOnboarded,
        });
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="relative">
      <div className="absolute inset-0 -m-1 rounded-[26px] bg-gradient-to-r from-[var(--primary)]/20 via-[var(--accent)]/20 to-[var(--primary)]/20 blur-xl" />
      <div className="relative grid sm:grid-cols-3 gap-px rounded-[var(--radius-xl)] border border-[var(--border-strong)] bg-[var(--border)] overflow-hidden shadow-[0_30px_80px_-40px_rgba(26,20,36,0.25),var(--shadow-card)]">
        <Stat
          icon={ShieldCheck}
          label="Total protected"
          to={stats.protectedAmount}
          format="currency-ghs"
          sub="held safely to date"
          tone="primary"
          showLive
        />
        <Stat
          icon={TrendingUp}
          label="Protected deals"
          to={stats.protectedCount}
          sub="completed end-to-end"
          tone="accent"
        />
        <Stat
          icon={Users}
          label="Verified sellers"
          to={stats.sellersOnboarded}
          sub="with KYC complete"
          tone="neutral"
        />
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  to,
  sub,
  format = "number",
  tone = "primary",
  showLive = false,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  to: number;
  sub: string;
  format?: "number" | "currency-ghs";
  tone?: "primary" | "accent" | "neutral";
  showLive?: boolean;
}) {
  const pill =
    tone === "primary"
      ? "bg-[var(--primary-soft)] text-[var(--primary)]"
      : tone === "accent"
        ? "bg-[var(--accent-soft)] text-[var(--accent-foreground)]"
        : "bg-[var(--surface-muted)] text-[var(--muted)]";
  return (
    <div className="bg-[var(--surface)] px-5 py-5 flex items-center gap-4 sm:gap-5 relative group">
      <div
        className={
          "inline-flex h-12 w-12 items-center justify-center rounded-xl shrink-0 " + pill
        }
      >
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          {label}
        </p>
        <p className="font-display text-3xl sm:text-[28px] lg:text-3xl font-bold mt-1 leading-none tracking-tight">
          <CountUp to={to} format={format} />
        </p>
        <p className="text-xs text-[var(--muted)] mt-1.5">{sub}</p>
      </div>
      {showLive ? (
        <span className="absolute top-3 right-4 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-70 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--primary)]" />
          </span>
          Live
        </span>
      ) : null}
    </div>
  );
}
