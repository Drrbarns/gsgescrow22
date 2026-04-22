import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Quote } from "lucide-react";

export function CaseStudy({
  tag,
  title,
  body,
  persona,
  amount,
  tone = "neutral",
}: {
  tag: string;
  title: string;
  body: string;
  persona: string;
  amount: string;
  tone?: "neutral" | "accent" | "warning";
}) {
  const accentMap = {
    neutral:
      "bg-gradient-to-br from-[var(--primary)] via-purple-700 to-indigo-700 text-[var(--primary-foreground)]",
    accent:
      "bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] text-[var(--accent-foreground)]",
    warning: "bg-gradient-to-br from-violet-500 to-blue-600 text-white",
  } as const;

  const initial = persona
    .split(",")[0]
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 1)
    .join("")
    .toUpperCase();

  return (
    <Card className="p-6 lg:p-8 group hover:-translate-y-1 hover:shadow-[var(--shadow-pop)] transition-all duration-300 relative overflow-hidden h-full">
      <div
        className={cn(
          "absolute -top-24 -right-24 h-56 w-56 rounded-full opacity-0 group-hover:opacity-100 blur-3xl transition-opacity duration-500",
          tone === "accent" || tone === "warning"
            ? "bg-[var(--accent)]/30"
            : "bg-[var(--primary)]/25",
        )}
      />
      <div className="relative flex items-start justify-between gap-3">
        <Badge tone="neutral">{tag}</Badge>
        <span
          className={cn(
            "font-display font-bold text-xl px-4 py-1.5 rounded-xl shadow-[var(--shadow-card)] whitespace-nowrap",
            accentMap[tone],
          )}
        >
          {amount}
        </span>
      </div>
      <h3 className="relative font-display text-xl sm:text-2xl lg:text-[28px] font-bold mt-5 leading-[1.15] tracking-[-0.015em]">
        {title}
      </h3>
      <p className="relative mt-3.5 text-[var(--muted)] leading-relaxed text-[15px]">
        {body}
      </p>
      <div className="relative mt-6 pt-5 border-t border-[var(--border)] flex items-center gap-3">
        <div
          className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center font-display font-bold text-sm",
            tone === "accent" || tone === "warning"
              ? "bg-[var(--accent-soft)] text-[var(--accent-foreground)]"
              : "bg-[var(--primary-soft)] text-[var(--primary)]",
          )}
        >
          {initial || "◆"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-[0.14em] font-semibold text-[var(--foreground)]">
            {persona}
          </p>
          <p className="text-[11px] text-[var(--muted)] mt-0.5">Verified protected deal</p>
        </div>
        <Quote size={14} className="text-[var(--muted)]/40 shrink-0" />
      </div>
    </Card>
  );
}
