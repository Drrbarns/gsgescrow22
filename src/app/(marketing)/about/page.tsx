import Link from "next/link";
import { Container, Section, Eyebrow } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      <Section className="bg-paper">
        <Container size="lg">
          <Eyebrow>The story</Eyebrow>
          <h1 className="font-display text-4xl sm:text-6xl font-bold mt-4 tracking-tight max-w-3xl">
            Built in Accra to fix one specific problem.
          </h1>
          <p className="mt-6 text-lg text-[var(--muted)] max-w-3xl leading-relaxed">
            Almost no one in Ghana shops on Amazon. We shop on Instagram,
            WhatsApp, TikTok lives, Facebook Marketplace. Every transaction
            ends with &ldquo;send me MoMo to 024xxxxxxx&rdquo; and a wish.
            Buyers get scammed. Sellers can&rsquo;t scale because their buyers
            are scared. The whole market is throttled by the absence of a
            neutral middleman.
          </p>
          <p className="mt-4 text-lg text-[var(--muted)] max-w-3xl leading-relaxed">
            SBBS is that middleman. We hold the buyer&rsquo;s money safely
            until they confirm the goods arrived as promised &mdash; and only
            then do we release payment to the seller. That single shift is
            the entire product.
          </p>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container size="lg">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                stat: "72 hrs",
                label: "Auto-release window",
                body: "If the buyer goes silent after delivery, the seller is paid automatically.",
              },
              {
                stat: "5 days",
                label: "Dispute SLA",
                body: "Published, monitored, and we stand by it.",
              },
              {
                stat: "Zero",
                label: "Funds touched by SBBS",
                body: "Money lives at Moolre until release. We just decide when.",
              },
            ].map((c) => (
              <Card key={c.label} className="p-6">
                <p className="font-display text-3xl font-bold text-[var(--primary)]">
                  {c.stat}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] font-semibold text-[var(--muted)]">
                  {c.label}
                </p>
                <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">{c.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-[var(--surface-muted)]/60">
        <Container size="lg">
          <div className="max-w-2xl">
            <Eyebrow>The strategic bet</Eyebrow>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-4 tracking-tight">
              Whoever becomes the neutral middleman first, captures a tax on
              digital trade.
            </h2>
          </div>
          <ol className="mt-10 space-y-6 max-w-3xl">
            {[
              {
                t: "1. Default checkout for social commerce.",
                b: "When anyone says 'send me MoMo' on Instagram, the buyer's reflex should be 'use SBBS or I'm not paying'.",
              },
              {
                t: "2. Trust layer for sellers.",
                b: "Verified sellers get a Trust Badge they embed in their bios, linking to a public profile of their delivery count, dispute rate and reviews.",
              },
              {
                t: "3. Multi-sided marketplace.",
                b: "Once buyers, sellers and riders are under one roof, SBBS brokers dispatch and eventually pursues its own payments licence.",
              },
            ].map((p) => (
              <li key={p.t} className="border-l-2 border-[var(--primary)] pl-5">
                <h3 className="font-display font-semibold text-lg">{p.t}</h3>
                <p className="mt-2 text-[var(--muted)] leading-relaxed">{p.b}</p>
              </li>
            ))}
          </ol>
        </Container>
      </Section>

      <Section>
        <Container size="lg" className="text-center">
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
            Be early.
          </h2>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/buy">
              <Button size="lg">Start a protected purchase</Button>
            </Link>
            <Link href="/sell">
              <Button size="lg" variant="secondary">
                Get a Trust Badge
              </Button>
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
