"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

const CTA_IMAGE = "/hero/cta-parallax.jpg";

export function ParallaxCtaBackground({
  targetRef,
}: {
  targetRef: React.RefObject<HTMLElement | null>;
}) {
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1.08, 1.15]);

  return (
    <motion.div
      aria-hidden
      style={{ y, scale }}
      className="absolute inset-0 will-change-transform"
    >
      <Image
        src={CTA_IMAGE}
        alt=""
        fill
        sizes="100vw"
        priority={false}
        className="object-cover object-[55%_center]"
      />
    </motion.div>
  );
}

/**
 * Client wrapper: owns the `ref` needed by `useScroll` and renders both the
 * parallax image and the 40% overlay. Children are expected to be the
 * section content and are rendered above the overlay.
 */
export function ParallaxCtaSection({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  return (
    <section
      ref={ref}
      className={
        "relative overflow-hidden bg-[var(--foreground)] text-white py-24 sm:py-36 " +
        className
      }
    >
      <ParallaxCtaBackground targetRef={ref} />
      <div
        aria-hidden
        className="absolute inset-0 bg-[var(--foreground)]/60"
      />
      <div aria-hidden className="absolute inset-0 bg-grid-dots opacity-10" />
      <div
        aria-hidden
        className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full opacity-40 blur-3xl animate-aurora"
        style={{
          background:
            "radial-gradient(closest-side, rgba(139,92,246,0.45), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute bottom-[-20%] right-[-10%] h-[700px] w-[700px] rounded-full opacity-50 blur-3xl animate-aurora"
        style={{
          animationDelay: "-12s",
          background:
            "radial-gradient(closest-side, rgba(79,43,184,0.8), transparent 70%)",
        }}
      />
      {children}
    </section>
  );
}
