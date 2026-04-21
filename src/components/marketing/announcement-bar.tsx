import { Sparkles } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="relative bg-[var(--foreground)] text-white text-xs">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-2 flex items-center justify-center gap-2 flex-wrap text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          <Sparkles size={11} /> Live
        </span>
        <span className="text-white/80">
          SBBS is in <span className="text-white font-semibold">soft launch</span> — invited sellers getting free Trust Badge until caps are lifted.
        </span>
        <a href="/sell" className="text-[var(--accent)] font-semibold hover:underline ml-1">
          Get on the list →
        </a>
      </div>
    </div>
  );
}
