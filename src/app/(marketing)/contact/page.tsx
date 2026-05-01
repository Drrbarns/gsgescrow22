import { Container, Section, Eyebrow } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MessageCircle } from "lucide-react";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <Section className="bg-paper min-h-[80vh]">
      <Container size="lg">
        <Eyebrow>Get in touch</Eyebrow>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-4 tracking-tight">
          We&rsquo;re humans, in Accra.
        </h1>
        <p className="mt-4 text-lg text-[var(--muted)] max-w-2xl">
          Need help with a transaction? Open a dispute from your{" "}
          <a className="text-[var(--primary)] underline" href="/hub">Hub</a> &mdash; that&rsquo;s
          the fastest path. For everything else, reach out below.
        </p>
        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          <ContactCard
            icon={Mail}
            label="Email"
            value="hello@sbbs.gh"
            href="mailto:hello@sbbs.gh"
          />
          <ContactCard
            icon={MessageCircle}
            label="WhatsApp"
            value="+233 (0) 246 033 792"
            href="https://wa.me/233246033792"
          />
          <ContactCard
            icon={Phone}
            label="Phone (office hours)"
            value="+233 (0) 579 033 792"
            href="tel:+233579033792"
          />
        </div>

        <Card className="mt-10 p-6 sm:p-8">
          <h3 className="font-display text-lg font-semibold">For press & partnerships</h3>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Reach out at <a className="text-[var(--primary)] underline" href="mailto:partners@sbbs.gh">partners@sbbs.gh</a>.
            We respond within two business days.
          </p>
        </Card>
      </Container>
    </Section>
  );
}

function ContactCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const inner = (
    <Card className="p-6 hover:shadow-[var(--shadow-pop)] hover:-translate-y-0.5 transition-all">
      <div className="flex items-center gap-4">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
          <Icon size={20} />
        </span>
        <div>
          <p className="text-xs uppercase tracking-[0.14em] font-semibold text-[var(--muted)]">
            {label}
          </p>
          <p className="font-display font-semibold mt-1">{value}</p>
        </div>
      </div>
    </Card>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="block">
      {inner}
    </a>
  ) : (
    inner
  );
}
