import * as React from "react";
import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
  size = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "default" | "lg" | "wide";
}) {
  const max =
    size === "sm"
      ? "max-w-3xl"
      : size === "lg"
        ? "max-w-6xl"
        : size === "wide"
          ? "max-w-7xl"
          : "max-w-5xl";
  return (
    <div className={cn("w-full mx-auto px-5 sm:px-8", max, className)} {...props}>
      {children}
    </div>
  );
}

export function Section({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("py-16 sm:py-24", className)} {...props}>
      {children}
    </section>
  );
}

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
      {children}
    </div>
  );
}
