import Image from "next/image";
import { ShieldCheck, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=2400&q=80";

export function MarketplaceHero() {
  return (
    <section className="relative overflow-hidden min-h-[420px] lg:min-h-[520px] flex items-center">
      <Image
        src={HERO_IMAGE}
        alt="Verified sellers across Ghana"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[70%_center]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,17,48,0.96)_0%,rgba(24,17,48,0.86)_40%,rgba(24,17,48,0.58)_70%,rgba(24,17,48,0.28)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,17,48,0.5)_0%,transparent_30%,transparent_70%,rgba(24,17,48,0.85)_100%)]"
      />
      <div
        aria-hidden
        className="absolute -top-32 -left-20 h-[480px] w-[480px] rounded-full blur-3xl opacity-60"
        style={{ background: "radial-gradient(closest-side, rgba(124,58,237,0.5), transparent 70%)" }}
      />

      <Container size="wide" className="relative z-10 py-20 sm:py-24 pb-28 sm:pb-32">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 backdrop-blur-md px-3 py-1.5 text-[12.5px] font-medium text-white/95">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#A78BFA]/90 text-[#1a1033]">
              <ShieldCheck size={12} strokeWidth={3} />
            </span>
            Secure Payment Marketplace
          </span>
          <h1 className="mt-6 font-display text-[44px] sm:text-[64px] lg:text-[76px] leading-[1.02] font-bold tracking-[-0.02em] text-white text-balance">
            Products &amp; Services
          </h1>
          <p className="mt-5 text-[17px] sm:text-lg text-white/75 max-w-xl leading-relaxed">
            Discover verified seller listings and purchase through our secure
            payment protection flow. Your money is protected until delivery is
            confirmed.
          </p>
          <div className="mt-8 flex items-center gap-5 text-xs text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#A78BFA]" /> KYC&rsquo;d sellers
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#A78BFA]" /> Protected checkout on every buy
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
