"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/products-services", label: "Products & Services" },
  { href: "/hub", label: "Transaction Hub" },
  { href: "/track", label: "Track Order" },
  { href: "/calculator", label: "Fee Calculator" },
  { href: "/reviews", label: "Reviews" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 backdrop-blur-xl transition-all duration-300 border-b",
        scrolled
          ? "bg-[color-mix(in_srgb,var(--background)_85%,transparent)] border-[var(--border)] shadow-[0_1px_0_#00000006,0_10px_30px_-16px_rgba(26,20,36,0.08)]"
          : "bg-[color-mix(in_srgb,var(--background)_80%,transparent)] border-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
        <Logo />
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative px-3 py-2 text-sm font-medium text-[var(--foreground)]/80 rounded-md hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]/70 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/buy">
            <Button size="sm" className="group">
              Start a protected purchase
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>
        <button
          className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-[var(--surface-muted)]"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <div
        className={cn(
          "md:hidden border-t border-[var(--border)] overflow-hidden transition-[max-height] duration-300",
          open ? "max-h-[520px]" : "max-h-0",
        )}
      >
        <div className="px-5 py-4 flex flex-col gap-1 bg-[var(--surface)]">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="px-3 py-3 text-[15px] font-medium rounded-md hover:bg-[var(--surface-muted)]"
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-[var(--border)] my-2" />
          <Link href="/login" onClick={() => setOpen(false)}>
            <Button variant="secondary" className="w-full">
              Log in
            </Button>
          </Link>
          <Link href="/buy" onClick={() => setOpen(false)}>
            <Button className="w-full">Start a protected purchase</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
