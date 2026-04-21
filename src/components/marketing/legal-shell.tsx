import { Container, Section, Eyebrow } from "@/components/ui/container";

export function LegalShell({
  eyebrow,
  title,
  effective,
  children,
}: {
  eyebrow: string;
  title: string;
  effective: string;
  children: React.ReactNode;
}) {
  return (
    <Section className="bg-paper">
      <Container size="sm">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-4 tracking-tight">
          {title}
        </h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Effective {effective} · Currently marked DRAFT pending legal review.
        </p>
        <div className="prose prose-neutral mt-10 max-w-none [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:font-display [&_h3]:font-semibold [&_h3]:mt-6 [&_p]:mt-3 [&_p]:text-[15px] [&_p]:leading-relaxed [&_p]:text-[var(--foreground)]/90 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5 [&_ul_li]:text-[15px] [&_a]:text-[var(--primary)] [&_a]:underline">
          {children}
        </div>
      </Container>
    </Section>
  );
}
