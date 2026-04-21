import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 p-6 border-b border-[var(--border)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-display text-lg font-semibold text-[var(--foreground)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-[var(--muted)]", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-6 border-t border-[var(--border)] bg-[var(--surface-muted)]/40 rounded-b-[var(--radius-lg)]",
        className,
      )}
      {...props}
    />
  );
}
