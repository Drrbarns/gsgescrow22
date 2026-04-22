import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  variant = "full",
}: {
  className?: string;
  variant?: "full" | "mark";
}) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5 group", className)}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_2px_0_#00000020,0_8px_22px_-12px_rgba(79,43,184,0.65)]">
        <span className="font-display text-[18px] font-bold leading-none">SB</span>
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[var(--accent)] ring-2 ring-[var(--background)]" />
      </span>
      {variant === "full" && (
        <span className="flex flex-col leading-tight min-w-0">
          <span className="font-display text-[14px] sm:text-[15px] font-bold tracking-tight text-[var(--foreground)] whitespace-nowrap">
            Sell-Safe Buy-Safe
          </span>
          <span className="hidden sm:block text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
            by GSG Brands
          </span>
        </span>
      )}
    </Link>
  );
}
