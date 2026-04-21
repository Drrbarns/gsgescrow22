"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({
  to,
  durationMs = 1800,
  prefix = "",
  suffix = "",
  format = "number",
  className,
}: {
  to: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
  format?: "number" | "currency-ghs" | "compact";
  className?: string;
}) {
  const [n, setN] = useState(to);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const run = () => {
      if (started.current) return;
      started.current = true;
      const start = performance.now();
      const from = 0;
      const delta = to - from;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / durationMs);
        const eased = 1 - Math.pow(1 - p, 3);
        setN(Math.round(from + delta * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      setN(0);
      requestAnimationFrame(tick);
    };

    // Run immediately; IntersectionObserver is a nice-to-have enhancement
    // but we guarantee the final value is shown even if it doesn't fire.
    if (typeof IntersectionObserver === "undefined") {
      run();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) run();
      },
      { threshold: 0.1 },
    );
    io.observe(el);

    // Fallback: force-run after a short delay in case IO doesn't fire
    const fallback = setTimeout(run, 400);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, [to, durationMs]);

  const formatted =
    format === "currency-ghs"
      ? `₵${n.toLocaleString("en-GH")}`
      : format === "compact"
        ? compact(n)
        : n.toLocaleString("en-GH");

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return n.toString();
}
