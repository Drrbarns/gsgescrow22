import { Container, Section, Eyebrow } from "@/components/ui/container";
import { CalculatorWidget } from "@/components/marketing/calculator-widget";

export const metadata = { title: "Fee calculator" };

export default function CalculatorPage() {
  return (
    <Section className="bg-paper min-h-[80vh]">
      <Container size="lg">
        <Eyebrow>Transparent fees</Eyebrow>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-4 tracking-tight">
          See exactly what you&rsquo;ll pay.
        </h1>
        <p className="mt-4 text-lg text-[var(--muted)] max-w-2xl">
          No hidden fees, no markup on Moolre rates. Two transparent
          platform fees, plus a flat rider release fee when there&rsquo;s a
          delivery component.
        </p>
        <div className="mt-10">
          <CalculatorWidget />
        </div>
      </Container>
    </Section>
  );
}
