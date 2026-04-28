import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  variant = "full",
}: {
  className?: string;
  variant?: "full" | "mark";
}) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5 group", className)}
      aria-label="Sell-Safe Buy-Safe by GSG Brands — back to home"
    >
      {/* GSG pill mark — intrinsic 931x470, ≈2:1. Rendered with width:auto
          so it scales to whatever Tailwind height we set without distortion. */}
      <Image
        src="/brand/gsg-logo.png"
        alt="GSG"
        width={931}
        height={470}
        priority
        className="h-7 w-auto sm:h-8 select-none"
      />
      {variant === "full" && (
        <span className="hidden sm:flex flex-col leading-tight min-w-0">
          <span className="font-display text-[14px] sm:text-[15px] font-bold tracking-tight text-[var(--foreground)] whitespace-nowrap">
            Sell-Safe Buy-Safe
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
            by GSG Brands
          </span>
        </span>
      )}
    </Link>
  );
}
