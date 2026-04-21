import { Container, Section, Eyebrow } from "@/components/ui/container";
import { TrackForm } from "@/components/marketing/track-form";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";

export const metadata = { title: "Track an order" };

export default function TrackPage() {
  return (
    <Section className="bg-paper min-h-[80vh]">
      <Container size="sm">
        <Eyebrow>Public tracking</Eyebrow>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-4 tracking-tight">
          Where is my order?
        </h1>
        <p className="mt-4 text-lg text-[var(--muted)]">
          Enter the SBBS reference (looks like <span className="font-mono">SB-XXXXX-XXXX</span>) to
          see its current status. Phone numbers are redacted on the public view.
        </p>
        <Card className="mt-8 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <Search size={18} />
            </span>
            <p className="font-display font-semibold">Look up an order</p>
          </div>
          <TrackForm />
        </Card>
        <p className="text-xs text-[var(--muted)] mt-6">
          Need to confirm delivery or open a dispute? Use the <a className="text-[var(--primary)] underline" href="/hub">Hub</a> instead — it has all your orders signed in.
        </p>
      </Container>
    </Section>
  );
}
