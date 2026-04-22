import Link from "next/link";
import { ArrowRight, Wallet, Truck, ShieldCheck, BadgeCheck, Lock, Gavel, Clock } from "lucide-react";
import { Container, Section, Eyebrow } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = { title: "How it works" };

export default function HowItWorksPage() {
  return (
    <>
      <Section className="bg-paper">
        <Container size="lg">
          <Eyebrow>The flow</Eyebrow>
          <h1 className="font-display text-4xl sm:text-6xl font-bold mt-4 tracking-tight">
            Same buyer. Same seller.
            <br />
            <span className="text-[var(--primary)]">One safe step</span> in between.
          </h1>
          <p className="mt-6 text-lg text-[var(--muted)] max-w-2xl">
            SBBS doesn&rsquo;t change how you find each other. It only changes
            the order in which money moves.
          </p>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container size="lg">
          <div className="grid md:grid-cols-2 gap-4">
            <Comparison
              title="Before SBBS"
              tone="danger"
              rows={[
                "Buyer pays seller directly via MoMo.",
                "Seller dispatches… or doesn't.",
                "Buyer hopes the item arrives.",
                "Seller already has the money.",
                "If anything goes wrong, you're alone.",
              ]}
            />
            <Comparison
              title="With SBBS"
              tone="success"
              rows={[
                "Buyer pays SBBS through a licensed PSP.",
                "Seller is notified funds are safely held — then dispatches.",
                "Buyer inspects the item, then confirms with a code.",
                "Only after buyer confirms (or 72h auto-release) is seller paid.",
                "Open a dispute, upload evidence, a human at SBBS decides.",
              ]}
            />
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="lg">
          <div className="space-y-12">
            {STEPS.map((s, i) => (
              <div key={i} className="grid md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-1">
                  <span className="font-mono text-sm text-[var(--muted)]">
                    0{i + 1}
                  </span>
                </div>
                <div className="md:col-span-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                    <s.icon size={22} />
                  </div>
                  <h3 className="font-display text-xl font-bold mt-4">{s.title}</h3>
                </div>
                <div className="md:col-span-8">
                  <p className="text-[var(--foreground)] text-[17px] leading-relaxed">
                    {s.body}
                  </p>
                  {s.detail && (
                    <p className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
                      {s.detail}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-[var(--surface-muted)]/60">
        <Container size="lg">
          <div className="max-w-2xl">
            <Eyebrow>The unhappy paths</Eyebrow>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-4 tracking-tight">
              When things go sideways, here&rsquo;s the playbook.
            </h2>
          </div>
          <div className="mt-10 grid md:grid-cols-2 gap-4">
            {UNHAPPY.map((u) => (
              <Card key={u.title} className="p-6">
                <h3 className="font-display font-semibold">{u.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                  {u.body}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="lg" className="text-center">
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
            Ready to try a protected purchase?
          </h2>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/buy">
              <Button size="lg">
                Start a protected purchase <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/sell">
              <Button size="lg" variant="secondary">
                I&rsquo;m a seller
              </Button>
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}

const STEPS = [
  {
    icon: Wallet,
    title: "Order created",
    body: "Either party opens SBBS, fills in the basics — what's being bought, the other party's name and phone, the agreed price and delivery fee. A protected payment link is generated.",
    detail: "The order can be initiated by the buyer or by the seller; both flows feed into the same protected transaction.",
  },
  {
    icon: Lock,
    title: "Buyer pays SBBS",
    body: "Money is captured by Moolre and earmarked for this specific deal. SBBS never touches the funds. The seller receives an SMS that funds are secured.",
  },
  {
    icon: Truck,
    title: "Seller dispatches",
    body: "The seller marks the order as sent and shares the rider's contact. SBBS issues a unique six-digit delivery code visible only to the buyer.",
  },
  {
    icon: ShieldCheck,
    title: "Buyer inspects, releases code",
    body: "When the rider arrives, the buyer inspects the goods and gives the code to the rider, who relays it back to the seller. Or the buyer confirms directly in their Hub.",
  },
  {
    icon: Clock,
    title: "Auto-release safety net",
    body: "If the buyer goes silent, after 72 hours the system auto-confirms — protecting the seller from buyers who try to game the protection window.",
  },
  {
    icon: BadgeCheck,
    title: "Seller payout, approved",
    body: "The seller's payout enters a queue. An SBBS approver clicks Approve, Moolre transfers the money to the seller's saved MoMo instantly. Both parties can download a receipt.",
  },
  {
    icon: Gavel,
    title: "If something's wrong: dispute",
    body: "Either party can open a dispute from their Hub. The transaction freezes. Both upload evidence. SBBS admin reviews and decides within five business days. Refunds go back to the original payment method.",
  },
];

const UNHAPPY = [
  {
    title: "Item never arrived",
    body: "Buyer opens a dispute, uploads chat screenshots and tracking photos. SBBS reviews, refund issued.",
  },
  {
    title: "Item arrived damaged or wrong",
    body: "Same flow — dispute, evidence, admin decision. Outcome can be full refund, partial refund, or release if the seller is right.",
  },
  {
    title: "Seller can't fulfil after payment",
    body: "Seller cancels in their dashboard, an admin processes the refund.",
  },
  {
    title: "Buyer changes their mind at the door",
    body: "The rider has still been paid out of the delivery-fee bucket. Seller decides whether to re-list or also refund the product portion.",
  },
];

function Comparison({
  title,
  rows,
  tone,
}: {
  title: string;
  rows: string[];
  tone: "success" | "danger";
}) {
  const isGood = tone === "success";
  return (
    <Card
      className={
        isGood
          ? "p-6 lg:p-8 bg-[var(--primary-soft)] border-[var(--border-strong)]"
          : "p-6 lg:p-8"
      }
    >
      <h3
        className={
          "font-display text-lg font-bold " +
          (isGood ? "text-[var(--primary)]" : "text-[var(--muted)]")
        }
      >
        {title}
      </h3>
      <ul className="mt-4 space-y-3">
        {rows.map((r) => (
          <li key={r} className="flex items-start gap-3 text-sm">
            <span
              className={
                "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0 " +
                (isGood
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "bg-[var(--surface-muted)] text-[var(--muted)] border border-[var(--border-strong)]")
              }
            >
              {isGood ? "✓" : "·"}
            </span>
            <span>{r}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
