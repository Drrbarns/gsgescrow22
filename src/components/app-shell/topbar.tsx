import { Container } from "@/components/ui/container";

export function AppTopbar({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="border-b border-[var(--border)] bg-[var(--surface)]">
      <Container size="wide" className="py-4 sm:py-6 flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-[13px] sm:text-sm text-[var(--muted)]">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </Container>
    </div>
  );
}
