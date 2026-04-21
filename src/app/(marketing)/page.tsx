import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ShieldCheck,
  Wallet,
  Truck,
  Gavel,
  Lock,
  Sparkles,
  BadgeCheck,
  MessageCircle,
  AtSign,
  Quote,
  UserCheck,
  Store,
} from "lucide-react";
import { Container, Section, Eyebrow } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LiveCounter } from "@/components/marketing/live-counter";
import { ReviewMarquee } from "@/components/marketing/review-marquee";
import { CaseStudy } from "@/components/marketing/case-study";
import { TickerStrip } from "@/components/marketing/ticker-strip";
import { Reveal, Stagger, StaggerItem } from "@/components/fx/reveal";
import { CountUp } from "@/components/fx/count-up";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TickerStrip />
      <CounterStrip />
      <HandlesStrip />
      <HowItWorks />
      <PromiseSection />
      <CaseStudies />
      <ForBuyersAndSellers />
      <Reviews />
      <FinalCta />
    </>
  );
}

function CounterStrip() {
  return (
    <section className="relative -mt-10 sm:-mt-14 z-10">
      <Container size="wide">
        <LiveCounter />
      </Container>
    </section>
  );
}

/**
 * Hero image. Drop a file at /public/hero.jpg and switch HERO_IMAGE to "/hero.jpg"
 * to use your own brand photo (recommended for launch).
 */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=2400&q=80";

function Hero() {
  return (
    <section className="relative overflow-hidden min-h-[680px] lg:min-h-[760px] flex items-center -mt-px">
      <Image
        src={HERO_IMAGE}
        alt="Ghanaian entrepreneur using SBBS on her phone"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[65%_center]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,12,22,0.92)_0%,rgba(10,12,22,0.78)_35%,rgba(10,12,22,0.45)_60%,rgba(10,12,22,0.2)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,12,22,0.55)_0%,transparent_30%,transparent_75%,rgba(10,12,22,0.65)_100%)]"
      />

      <Container size="wide" className="relative z-10 py-20 sm:py-28 lg:py-32">
        <div className="max-w-2xl">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-md px-3 py-1.5 text-[12.5px] font-medium text-white/95">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#4ADE80]/90 text-[#0b2a16]">
                <ShieldCheck size={12} strokeWidth={3} />
              </span>
              Licensed PSP-Powered Protection
            </span>
          </Reveal>

          <Reveal index={1}>
            <h1 className="mt-6 font-display text-[44px] sm:text-[60px] lg:text-[72px] leading-[1.02] font-bold tracking-[-0.02em] text-white text-balance">
              Secure Every Transaction.
              <br />
              Protect Every Deal.
            </h1>
          </Reveal>

          <Reveal index={2}>
            <p className="mt-6 text-[17px] sm:text-lg text-white/80 max-w-xl leading-relaxed">
              Buy and sell confidently across social media, websites, and
              digital channels. Funds stay protected until delivery is confirmed.
            </p>
          </Reveal>

          <Reveal index={3}>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link href="/buy">
                <Button size="lg" variant="violet" className="w-full sm:w-auto rounded-full px-7">
                  <UserCheck size={18} />
                  Start as Buyer
                </Button>
              </Link>
              <Link href="/sell">
                <Button size="lg" variant="violet-outline" className="w-full sm:w-auto rounded-full px-7">
                  <Store size={18} />
                  Start as Seller
                </Button>
              </Link>
            </div>
          </Reveal>

          <Reveal index={4}>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/70">
              <TrustPill icon={Lock} label="Funds held by Moolre" />
              <TrustPill icon={BadgeCheck} label="KYC'd sellers" />
              <TrustPill icon={Gavel} label="Real human dispute review" />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

function TrustPill({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-white/80">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white">
        <Icon size={13} />
      </span>
      <span className="font-medium text-white">{label}</span>
    </span>
  );
}

function HandlesStrip() {
  const handles = [
    "@kente_couture",
    "@snkrs_gh",
    "@bliss_beauty_gh",
    "@electro_flip",
    "@luxe_braids_gh",
    "@gh_streetwear",
    "@home_cooks_gh",
    "@lagos_to_accra",
    "@motherland_scents",
    "@jollof_supply",
    "@accra_vintage",
    "@ataa_studio",
  ];
  return (
    <section className="border-b border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <Container size="wide" className="py-10">
        <p className="text-center text-[11px] uppercase tracking-[0.22em] text-[var(--muted)] font-semibold">
          Used by sellers across&nbsp;
          <span className="text-[var(--foreground)]">Instagram · WhatsApp · TikTok · Twitter · Facebook</span>
        </p>
        <div className="relative mt-6 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="flex gap-8 animate-ticker w-max">
            {[...handles, ...handles].map((h, i) => (
              <div key={i} className="flex items-center gap-2.5 opacity-70 hover:opacity-100 transition-opacity">
                <AtSign size={15} className="text-[var(--muted)]" />
                <span className="font-display font-semibold text-[17px] text-[var(--foreground)] tracking-tight">
                  {h}
                </span>
                <BadgeCheck size={13} className="text-[var(--primary)]" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      icon: Wallet,
      title: "Buyer pays SBBS",
      body: "We capture payment via a licensed PSP. Money is earmarked for this deal. Seller gets an SMS the funds are safely held.",
      tone: "primary",
    },
    {
      n: "02",
      icon: Truck,
      title: "Seller dispatches",
      body: "Seller marks the order sent. SBBS issues a one-time delivery code to the buyer — the unlock key for payment.",
      tone: "accent",
    },
    {
      n: "03",
      icon: ShieldCheck,
      title: "Buyer inspects",
      body: "Buyer inspects the goods at delivery. Either releases the code, or files a dispute from their Hub.",
      tone: "primary",
    },
    {
      n: "04",
      icon: BadgeCheck,
      title: "Seller is paid",
      body: "An SBBS approver clicks Approve. Moolre transfers to the seller's MoMo instantly. 72-hour auto-release protects against ghosting.",
      tone: "accent",
    },
  ] as const;

  return (
    <Section>
      <Container size="wide">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>How it works</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold mt-4 tracking-[-0.025em] text-balance">
              Same DM. Same MoMo. One{" "}
              <span className="font-serif italic font-medium text-[var(--primary)]">safe step</span>{" "}
              in between.
            </h2>
          </Reveal>
          <Reveal index={2}>
            <p className="mt-5 text-lg text-[var(--muted)] leading-relaxed">
              Nothing about how you discover, negotiate or chat changes. SBBS
              slots in at the moment money would have moved.
            </p>
          </Reveal>
        </div>

        <Stagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-14">
          {steps.map((s) => (
            <StaggerItem key={s.n}>
              <Card className="p-6 group relative overflow-hidden h-full hover:shadow-[var(--shadow-pop)] hover:-translate-y-1 transition-all duration-300">
                <span className="font-mono text-xs text-[var(--muted)]">{s.n}</span>
                <div
                  className={
                    "mt-3 inline-flex h-11 w-11 items-center justify-center rounded-xl " +
                    (s.tone === "primary"
                      ? "bg-[var(--primary-soft)] text-[var(--primary)]"
                      : "bg-[var(--accent-soft)] text-[var(--accent-foreground)]")
                  }
                >
                  <s.icon size={20} />
                </div>
                <h3 className="font-display text-xl font-semibold mt-4 leading-tight">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                  {s.body}
                </p>
                <span
                  className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl"
                  style={{
                    background:
                      s.tone === "primary"
                        ? "radial-gradient(closest-side, rgba(15,81,50,0.25), transparent 70%)"
                        : "radial-gradient(closest-side, rgba(200,154,58,0.3), transparent 70%)",
                  }}
                />
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}

function PromiseSection() {
  return (
    <Section className="relative overflow-hidden bg-[var(--foreground)] text-white">
      <div className="absolute inset-0 bg-grid-dots opacity-20" />
      <div
        className="absolute top-0 right-[-10%] h-[600px] w-[600px] rounded-full opacity-25 blur-3xl animate-aurora"
        style={{ background: "radial-gradient(closest-side, rgba(200,154,58,0.7), transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full opacity-25 blur-3xl animate-aurora"
        style={{ animationDelay: "-10s", background: "radial-gradient(closest-side, rgba(15,81,50,0.9), transparent 70%)" }}
      />

      <Container size="wide" className="relative">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-glow" />
                The dispute promise
              </span>
            </Reveal>
            <Reveal index={1}>
              <h2 className="font-display text-4xl sm:text-6xl font-bold mt-5 tracking-[-0.02em] leading-[1.02] text-balance">
                If anything goes wrong,{" "}
                <span className="font-serif italic font-medium text-[var(--accent)]">you&rsquo;re not alone.</span>
              </h2>
            </Reveal>
            <Reveal index={2}>
              <p className="mt-6 text-lg text-white/75 leading-relaxed max-w-xl">
                Open a dispute from your Hub. The transaction freezes. Both
                sides upload evidence. A real human at SBBS reads it and
                decides within five business days. Refunds go back through
                the original payment method &mdash; never store credit.
              </p>
            </Reveal>

            <Stagger className="mt-10 space-y-4" staggerChildren={0.1}>
              {[
                "Funds sit with a licensed PSP — never with SBBS staff.",
                "You hold the unlock key — the seller can't be paid without it.",
                "Evidence uploaded to a private vault — reviewed by a human.",
                "Refunds hit your original payment method, not store credit.",
              ].map((b) => (
                <StaggerItem key={b}>
                  <div className="flex items-start gap-3 text-[15px] leading-relaxed">
                    <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] shrink-0 text-[11px] font-bold">
                      ✓
                    </span>
                    <span className="text-white/90">{b}</span>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <div className="lg:col-span-6 lg:pl-8">
            <Reveal index={2}>
              <div className="grid grid-cols-2 gap-4">
                <PromiseTile
                  big={<CountUp to={5} />}
                  unit="business days"
                  label="Published dispute SLA"
                />
                <PromiseTile
                  big={<CountUp to={72} />}
                  unit="hours"
                  label="Auto-release safety net"
                />
                <PromiseTile
                  big={<CountUp to={100} suffix="%" />}
                  unit="refunds"
                  label="To original payment method"
                />
                <PromiseTile
                  big={<CountUp to={0} />}
                  unit="funds touched"
                  label="By SBBS staff, ever"
                />
              </div>
            </Reveal>

            <Reveal index={3}>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <Quote size={20} className="text-[var(--accent)]" />
                <p className="mt-3 text-[17px] leading-relaxed text-white/90">
                  &ldquo;Bottle arrived half-empty. I opened a dispute, uploaded a
                  photo, got refunded in three days. SBBS is the real one.&rdquo;
                </p>
                <p className="mt-4 text-sm text-white/60">Akosua, 31 · Tema — real dispute outcome</p>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function PromiseTile({
  big,
  unit,
  label,
}: {
  big: React.ReactNode;
  unit: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
      <p className="font-display font-bold text-5xl leading-none tracking-tight">
        {big}
        <span className="text-[var(--accent)]">.</span>
      </p>
      <p className="mt-2 text-xs uppercase tracking-[0.18em] font-semibold text-white/60">
        {unit}
      </p>
      <p className="mt-3 text-sm text-white/80 leading-snug">{label}</p>
    </div>
  );
}

function CaseStudies() {
  return (
    <Section className="bg-[var(--surface-muted)]/60 relative overflow-hidden">
      <div
        className="absolute top-[-10%] right-[-5%] h-[400px] w-[400px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(15,81,50,0.25), transparent 70%)" }}
      />
      <Container size="wide" className="relative">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
          <div className="max-w-2xl">
            <Reveal>
              <Eyebrow>True-to-life stories</Eyebrow>
            </Reveal>
            <Reveal index={1}>
              <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold mt-4 tracking-[-0.025em]">
                Five everyday wins.
              </h2>
            </Reveal>
          </div>
          <Reveal index={2}>
            <Link
              href="/reviews"
              className="text-sm font-semibold text-[var(--primary)] inline-flex items-center gap-1.5 group"
            >
              See all reviews
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>

        <Stagger className="grid md:grid-cols-2 gap-6">
          <StaggerItem>
            <CaseStudy
              tag="Instagram boutique"
              title="The dress Ama almost didn&rsquo;t buy."
              body="A ₵420 kente dress on @kente_couture. Ama was tired of being ghosted. The seller dropped an SBBS link instead of a MoMo number. Money lands in the seller&rsquo;s MoMo within minutes of approver click."
              persona="Ama, 28 · Accra"
              amount="₵420"
            />
          </StaggerItem>
          <StaggerItem>
            <CaseStudy
              tag="TikTok resell"
              title="₵1,800 sneakers across regions."
              body="Kwame in Kumasi, buyer in Tamale. Pre-SBBS this sale never happened. With SBBS the buyer paid into escrow, the sneakers shipped via STC, the buyer collected and released the code."
              persona="Kwame, 34 · Kumasi"
              amount="₵1,800"
            />
          </StaggerItem>
          <StaggerItem>
            <CaseStudy
              tag="Dispute"
              title="Half-empty bottle, full refund."
              body="Akosua&rsquo;s hair product arrived clearly used. She opened a dispute from her Hub and uploaded a photo. SBBS reviewed within 48 hours and sided with her. Refund hit her MoMo, no fuss."
              persona="Akosua, 31 · Tema"
              amount="₵250"
              tone="warning"
            />
          </StaggerItem>
          <StaggerItem>
            <CaseStudy
              tag="Auto-release"
              title="The buyer who went silent."
              body="Mansa shipped a ₵90 phone case. The buyer disappeared after delivery. 72 hours later auto-release fired and Mansa got paid. The seller is no longer at the buyer&rsquo;s mercy."
              persona="Mansa, 26 · Cape Coast"
              amount="₵90"
              tone="accent"
            />
          </StaggerItem>
        </Stagger>
      </Container>
    </Section>
  );
}

function ForBuyersAndSellers() {
  return (
    <Section>
      <Container size="wide">
        <div className="grid md:grid-cols-2 gap-6">
          <Reveal>
            <Card className="p-8 lg:p-10 h-full relative overflow-hidden group">
              <Eyebrow>For buyers</Eyebrow>
              <h3 className="font-display text-2xl sm:text-4xl font-bold mt-5 leading-tight tracking-[-0.02em]">
                Stop paying strangers.
              </h3>
              <p className="mt-4 text-[var(--muted)] text-[15px] leading-relaxed">
                Pay SBBS, not the seller. We hold your money until you confirm
                the item arrived as promised.
              </p>
              <ul className="mt-7 space-y-3 text-sm">
                {[
                  "One Hub showing every deal you've ever done",
                  "Documented dispute path with real human review",
                  "Refunds back to the original payment method",
                  "Protected even after the rider walks away",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <ShieldCheck size={16} className="text-[var(--primary)] mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <Link href="/buy" className="mt-8 inline-block">
                <Button>
                  Start a protected purchase <ArrowRight size={16} />
                </Button>
              </Link>
              <span className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-[var(--primary-soft)] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Card>
          </Reveal>

          <Reveal index={1}>
            <Card className="p-8 lg:p-10 h-full bg-[var(--primary)] text-[var(--primary-foreground)] border-0 shadow-[var(--shadow-pop)] relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-dots opacity-15" />
              <div
                className="absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-60"
                style={{ background: "radial-gradient(closest-side, rgba(200,154,58,0.6), transparent 70%)" }}
              />
              <div className="relative">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> For sellers
                </span>
                <h3 className="font-display text-2xl sm:text-4xl font-bold mt-5 leading-tight tracking-[-0.02em]">
                  Convert more sales.
                  <br />
                  <span className="font-serif italic font-medium text-[var(--accent)]">Get burned less.</span>
                </h3>
                <p className="mt-4 text-white/80 text-[15px] leading-relaxed">
                  Show buyers an SBBS link and watch your close rate jump. The
                  order is pre-funded before you spend a cedi dispatching.
                </p>
                <ul className="mt-7 space-y-3 text-sm">
                  {[
                    "Pre-funded orders — never ship on hope",
                    "Trust Badge for your Instagram bio",
                    "Saved MoMo payout that prefills next time",
                    "Public profile that accumulates reputation",
                  ].map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <Sparkles size={16} className="text-[var(--accent)] mt-0.5 shrink-0" />
                      <span className="text-white/90">{b}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/sell" className="mt-8 inline-block">
                  <Button variant="accent">
                    Create a payment link <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </Card>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

function Reviews() {
  return (
    <Section className="overflow-hidden">
      <Container size="wide">
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow>Real Ghanaians</Eyebrow>
          </Reveal>
          <Reveal index={1}>
            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold mt-4 tracking-[-0.025em]">
              What people are <span className="font-serif italic font-medium text-[var(--primary)]">saying.</span>
            </h2>
          </Reveal>
        </div>
      </Container>
      <div className="mt-10">
        <ReviewMarquee />
      </div>
    </Section>
  );
}

function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-[var(--foreground)] text-white py-24 sm:py-36">
      <div className="absolute inset-0 bg-grid-dots opacity-10" />
      <div
        className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full opacity-40 blur-3xl animate-aurora"
        style={{ background: "radial-gradient(closest-side, rgba(200,154,58,0.45), transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] h-[700px] w-[700px] rounded-full opacity-50 blur-3xl animate-aurora"
        style={{ animationDelay: "-12s", background: "radial-gradient(closest-side, rgba(15,81,50,0.8), transparent 70%)" }}
      />

      <Container size="wide" className="relative">
        <div className="text-center max-w-5xl mx-auto">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
              <MessageCircle size={12} /> The new reflex
            </span>
          </Reveal>
          <Reveal index={1}>
            <h2 className="font-display text-[44px] sm:text-[88px] lg:text-[120px] font-bold tracking-[-0.035em] leading-[0.95] mt-7 text-balance">
              <span className="font-serif italic font-medium text-white/80">&ldquo;</span>
              Use SBBS or I&rsquo;m{" "}
              <span className="font-serif italic font-medium text-[var(--accent)]">not paying.</span>
              <span className="font-serif italic font-medium text-white/80">&rdquo;</span>
            </h2>
          </Reveal>
          <Reveal index={2}>
            <p className="mt-8 text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
              That&rsquo;s the reflex we&rsquo;re building across every
              Instagram DM, WhatsApp thread and TikTok comment. Be early.
            </p>
          </Reveal>
          <Reveal index={3}>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/buy">
                <Button size="lg" variant="accent">
                  Start a protected purchase <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/sell">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Get a Trust Badge
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
