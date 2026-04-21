import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leading, trailing, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 transition-shadow focus-within:ring-4 focus-within:ring-[var(--ring)] focus-within:border-[var(--primary)]",
          className,
        )}
      >
        {leading && <span className="text-sm text-[var(--muted)]">{leading}</span>}
        <input
          ref={ref}
          className="h-11 w-full bg-transparent text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none"
          {...props}
        />
        {trailing && <span className="text-sm text-[var(--muted)]">{trailing}</span>}
      </div>
    );
  },
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "block w-full rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-3 text-[15px] text-[var(--foreground)] placeholder:text-[var(--muted)] transition-shadow focus:outline-none focus:ring-4 focus:ring-[var(--ring)] focus:border-[var(--primary)]",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }
>(({ className, children, required, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "block text-sm font-medium text-[var(--foreground)] mb-1.5",
      className,
    )}
    {...props}
  >
    {children}
    {required && <span className="text-[var(--danger)] ml-1">*</span>}
  </label>
));
Label.displayName = "Label";

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-sm text-[var(--danger)]">{children}</p>;
}

export function FieldHint({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-sm text-[var(--muted)]">{children}</p>;
}
