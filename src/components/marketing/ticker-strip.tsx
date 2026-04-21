import { ShieldCheck } from "lucide-react";

const EVENTS = [
  { amount: "₵420",   label: "held for @kente_couture",       city: "Accra" },
  { amount: "₵1,800", label: "held for @snkrs_gh",            city: "Kumasi" },
  { amount: "₵250",   label: "refunded to buyer",              city: "Tema" },
  { amount: "₵90",    label: "auto-released to seller",        city: "Cape Coast" },
  { amount: "₵620",   label: "held for @bliss_beauty_gh",      city: "East Legon" },
  { amount: "₵140",   label: "paid to rider",                  city: "Madina" },
  { amount: "₵3,200", label: "held for @electro_flip",         city: "Takoradi" },
  { amount: "₵180",   label: "completed",                      city: "Spintex" },
  { amount: "₵75",    label: "held for @home_cooks_gh",        city: "Tamale" },
  { amount: "₵1,100", label: "held for @luxe_braids_gh",       city: "Osu" },
  { amount: "₵260",   label: "completed",                      city: "Airport Hills" },
  { amount: "₵540",   label: "held for @gh_streetwear",        city: "Adenta" },
];

export function TickerStrip() {
  const loop = [...EVENTS, ...EVENTS];
  return (
    <div className="relative border-y border-[var(--border)] bg-[var(--foreground)] text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-[var(--foreground)] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-[var(--foreground)] to-transparent z-10" />

      <div className="flex w-max animate-ticker">
        {loop.map((e, i) => (
          <div key={i} className="flex items-center gap-3 px-6 py-4 whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
              <ShieldCheck size={11} /> Just now
            </span>
            <span className="font-display font-bold text-[15px]">{e.amount}</span>
            <span className="text-sm text-white/75">{e.label}</span>
            <span className="text-xs text-white/40 font-mono uppercase tracking-[0.14em]">· {e.city}</span>
            <span className="text-white/20 px-4">/</span>
          </div>
        ))}
      </div>
    </div>
  );
}
