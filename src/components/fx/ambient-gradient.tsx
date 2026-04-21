"use client";

export function AmbientGradient({
  className = "",
  variant = "hero",
}: {
  className?: string;
  variant?: "hero" | "soft" | "dark";
}) {
  return (
    <div className={"pointer-events-none absolute inset-0 overflow-hidden " + className} aria-hidden>
      <div
        className="absolute -top-32 -left-24 h-[560px] w-[560px] rounded-full opacity-70 blur-3xl animate-aurora"
        style={{
          background:
            variant === "dark"
              ? "radial-gradient(closest-side, rgba(15,81,50,0.55), transparent 70%)"
              : "radial-gradient(closest-side, rgba(15,81,50,0.35), transparent 70%)",
        }}
      />
      <div
        className="absolute -top-24 right-[-10%] h-[620px] w-[620px] rounded-full opacity-80 blur-3xl animate-aurora"
        style={{
          animationDelay: "-8s",
          background:
            variant === "dark"
              ? "radial-gradient(closest-side, rgba(200,154,58,0.35), transparent 70%)"
              : "radial-gradient(closest-side, rgba(200,154,58,0.5), transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-20%] left-[20%] h-[520px] w-[520px] rounded-full opacity-60 blur-3xl animate-aurora"
        style={{
          animationDelay: "-14s",
          background:
            variant === "dark"
              ? "radial-gradient(closest-side, rgba(14, 150, 92, 0.3), transparent 70%)"
              : "radial-gradient(closest-side, rgba(14, 150, 92, 0.28), transparent 70%)",
        }}
      />
      <div className="absolute inset-0 bg-grid-dots opacity-60" />
    </div>
  );
}
