import Link from "next/link";
import { Container, Section, Eyebrow } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeCheck, ClipboardCopy, ArrowRight } from "lucide-react";
import { BadgeSnippet } from "@/components/marketing/badge-snippet";

export const metadata = { title: "Trust Badge for sellers" };

export default function BadgePage() {
  return (
    <>
      <Section className="bg-paper">
        <Container size="lg">
          <Eyebrow>Trust Badge</Eyebrow>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-4 tracking-tight max-w-3xl">
            Show buyers you&rsquo;re the real deal &mdash; in your bio.
          </h1>
          <p className="mt-4 text-lg text-[var(--muted)] max-w-2xl">
            Embed the SBBS Trust Badge on your Instagram bio, your linktree,
            your WhatsApp catalogue. It updates automatically as you complete
            more protected deals and receive reviews.
          </p>

          <Card className="mt-10 p-6 sm:p-8 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] font-semibold text-[var(--muted)]">
                Your live badge
              </p>
              <div className="mt-4 inline-block rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/api/badge/demo"
                  alt="SBBS Trust Badge for demo"
                  width={320}
                  height={92}
                />
              </div>
              <p className="mt-4 text-xs text-[var(--muted)]">
                Replace <code className="font-mono">demo</code> with your SBBS
                handle once you sign up.
              </p>
              <Link href="/sell" className="mt-6 inline-block">
                <Button>
                  Become a verified seller <ArrowRight size={16} />
                </Button>
              </Link>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.14em] font-semibold text-[var(--muted)]">
                Embed snippet
              </p>
              <BadgeSnippet />
              <p className="mt-3 text-xs text-[var(--muted)] flex items-start gap-1.5">
                <ClipboardCopy size={12} className="mt-0.5" />
                Paste this anywhere HTML is allowed: linktree custom block,
                Wix/Shopify storefront, your seller landing page.
              </p>
            </div>
          </Card>
        </Container>
      </Section>

      <Section className="pt-0">
        <Container size="lg">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                title: "Auto-updating",
                body: "Your badge always shows your latest delivery count and average rating.",
              },
              {
                title: "Free for verified sellers",
                body: "Complete KYC and you're in. Premium analytics tier coming soon.",
              },
              {
                title: "Click-through to your profile",
                body: "Buyers tap the badge and land on your public SBBS profile.",
              },
            ].map((c) => (
              <Card key={c.title} className="p-6">
                <BadgeCheck size={20} className="text-[var(--primary)]" />
                <h3 className="font-display font-semibold mt-3">{c.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted)]">{c.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
