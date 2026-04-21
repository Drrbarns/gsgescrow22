import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

const REVIEWS = [
  { name: "Esi A.", role: "Buyer · Accra", stars: 5, body: "First time I bought something on Instagram without sweating. Released the code, sent the receipt to my mum." },
  { name: "Yaw M.", role: "Seller · Kumasi", stars: 5, body: "I added the badge to my bio and my close rate doubled in a week. Buyers stop arguing about MoMo upfront." },
  { name: "Akua O.", role: "Buyer · Tema", stars: 5, body: "Item came damaged. Opened a dispute, uploaded a photo, got refunded in 3 days. SBBS is the real one." },
  { name: "Kojo B.", role: "Seller · Takoradi", stars: 5, body: "Auto-release saved me. The buyer ghosted, 72 hours later the money landed in my MoMo. Game changer." },
  { name: "Adjoa N.", role: "Buyer · East Legon", stars: 5, body: "I refuse to pay any seller without an SBBS link now. My friends are catching on too." },
  { name: "Kwame F.", role: "Rider", stars: 5, body: "I get my delivery fee whether the buyer accepts or not. Finally a system that respects the dispatch." },
  { name: "Nana K.", role: "Seller · Madina", stars: 5, body: "Public profile with my reviews? It's basically free marketing. People DM saying 'I trust you because of SBBS.'" },
  { name: "Sandra L.", role: "Buyer · Spintex", stars: 5, body: "The tracking page lets my husband watch my order arrive. Felt premium for a ₵180 hair purchase." },
];

export function ReviewMarquee() {
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="flex gap-4 animate-[marquee_42s_linear_infinite] w-max">
        {[...REVIEWS, ...REVIEWS].map((r, i) => (
          <Card key={i} className="p-5 w-[320px] shrink-0">
            <div className="flex items-center gap-1 text-[var(--accent)]">
              {Array.from({ length: r.stars }).map((_, idx) => (
                <Star key={idx} size={14} fill="currentColor" />
              ))}
            </div>
            <p className="mt-3 text-sm text-[var(--foreground)] leading-relaxed">
              &ldquo;{r.body}&rdquo;
            </p>
            <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-sm font-semibold">{r.name}</span>
              <span className="text-xs text-[var(--muted)]">{r.role}</span>
            </div>
          </Card>
        ))}
      </div>
      <style>
        {`
          @keyframes marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}
      </style>
    </div>
  );
}
