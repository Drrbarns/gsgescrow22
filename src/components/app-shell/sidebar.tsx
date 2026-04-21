import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  badge?: number | string | null;
};

export function AppSidebar({
  items,
  active,
  footer,
  brandSubtitle,
}: {
  items: NavItem[];
  active?: string;
  footer?: React.ReactNode;
  brandSubtitle?: string;
}) {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 border-r border-[var(--border)] bg-[var(--surface)] flex-col">
      <div className="px-6 py-5 border-b border-[var(--border)]">
        <Logo />
        {brandSubtitle && (
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-semibold mt-2">
            {brandSubtitle}
          </p>
        )}
      </div>
      <nav className="p-3 flex-1 space-y-0.5 overflow-y-auto">
        {items.map((item) => {
          const isActive = active === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
              )}
            >
              <Icon size={16} className={isActive ? "text-[var(--primary)]" : "text-[var(--muted)]"} />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge !== null && item.badge !== 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold",
                    isActive
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "bg-[var(--surface-muted)] text-[var(--muted)] border border-[var(--border-strong)]",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      {footer && (
        <div className="p-3 border-t border-[var(--border)]">{footer}</div>
      )}
    </aside>
  );
}
