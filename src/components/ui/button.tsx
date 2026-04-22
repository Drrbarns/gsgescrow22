import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] font-medium transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 active:translate-y-px select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--primary)] text-[var(--primary-foreground)] hover:brightness-110 shadow-[0_1px_0_#00000014,0_8px_24px_-12px_rgba(79,43,184,0.55)]",
        secondary:
          "bg-[var(--surface)] text-[var(--foreground)] border border-[var(--border-strong)] hover:bg-[var(--surface-muted)]",
        accent:
          "bg-[var(--accent)] text-[var(--accent-foreground)] hover:brightness-95",
        ghost:
          "bg-transparent text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
        link: "bg-transparent text-[var(--primary)] underline-offset-4 hover:underline px-0",
        danger:
          "bg-[var(--danger)] text-white hover:brightness-110",
        outline:
          "border border-[var(--border-strong)] text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
        violet:
          "bg-gradient-to-b from-[#8B5CF6] to-[#7C3AED] text-white hover:brightness-110 shadow-[0_1px_0_#ffffff18_inset,0_10px_30px_-10px_#7C3AED80]",
        "violet-outline":
          "bg-white/5 backdrop-blur text-white border border-white/30 hover:bg-white/15",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-[15px]",
        lg: "h-13 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
        )}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
