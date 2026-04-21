import * as React from "react";
import { cn } from "@/lib/utils";
import { stateLabel, stateTone, type TxnState } from "@/lib/state/transaction";

type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "accent";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-[var(--surface-muted)] text-[var(--foreground)] border-[var(--border-strong)]",
  info: "bg-[#e8f1f8] text-[#1f4a72] border-[#bcd6ea]",
  success: "bg-[var(--primary-soft)] text-[var(--primary)] border-[#bcd9c6]",
  warning: "bg-[#fbf2dd] text-[#7a5410] border-[#ecdba8]",
  danger: "bg-[#fbe5e3] text-[var(--danger)] border-[#f1bbb6]",
  accent: "bg-[var(--accent-soft)] text-[var(--accent-foreground)] border-[#e7d3a4]",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  dot,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone; dot?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {dot && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full bg-current"
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

export function StateBadge({ state, className }: { state: TxnState; className?: string }) {
  const tone = stateTone(state) as Tone;
  return (
    <Badge tone={tone} dot className={className}>
      {stateLabel(state)}
    </Badge>
  );
}
