"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, Check, CheckCheck, Lock, Heart, MessageCircle, Bookmark, Send } from "lucide-react";

type Msg = {
  id: string;
  side: "buyer" | "seller";
  kind?: "text" | "link";
  text: string;
  linkPreview?: { title: string; host: string; amount: string };
  delaySec: number;
};

const SCRIPT: Msg[] = [
  { id: "1", side: "buyer",  text: "Hi, I love the black kente dress in your last post. Still available?", delaySec: 0 },
  { id: "2", side: "seller", text: "Yes it is! ₵420. Size M. Do you want to buy?", delaySec: 2 },
  { id: "3", side: "buyer",  text: "Yes please 🙏 can you send your MoMo?", delaySec: 3.4 },
  {
    id: "4",
    side: "seller",
    kind: "link",
    text: "I only accept SBBS now. Pay here and the money is held safely until you confirm delivery 👇",
    linkPreview: {
      title: "Kente dress · Size M",
      host: "sbbs.gh/p/SB-KC-420",
      amount: "₵420.00",
    },
    delaySec: 5.2,
  },
  { id: "5", side: "buyer",  text: "Oh wow, love this. Paying now ❤️", delaySec: 7.6 },
];

const TOTAL_SEC = 10;

export function DmTheater() {
  const [visible, setVisible] = useState<string[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const startedAt = performance.now();
    let raf: number;
    const loop = (now: number) => {
      const t = ((now - startedAt) / 1000) % TOTAL_SEC;
      setTick(t);
      setVisible(
        SCRIPT.filter((m) => m.delaySec <= t + 0.05).map((m) => m.id),
      );
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="relative w-full max-w-[380px] mx-auto">
      <div className="absolute -top-6 -left-6 -bottom-6 -right-6 rounded-[40px] bg-gradient-to-br from-[var(--primary)]/15 via-[var(--accent)]/15 to-[var(--primary)]/5 blur-2xl" />
      <div className="relative rounded-[36px] bg-[var(--foreground)] p-3 shadow-[0_40px_80px_-20px_#00000055,0_10px_40px_-10px_#0f513260]">
        <div className="rounded-[28px] bg-[var(--background)] overflow-hidden border border-white/10">
          <InstaHeader seller="kente_couture" active={tick > 1.5 && tick < 4.5} />
          <div className="px-4 py-4 space-y-2 min-h-[460px] bg-gradient-to-b from-[var(--background)] to-[var(--surface-muted)]/60">
            <AnimatePresence initial={false}>
              {SCRIPT.map((m) =>
                visible.includes(m.id) ? (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 14, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.45, ease: [0.2, 0.9, 0.3, 1.05] }}
                    className={"flex " + (m.side === "buyer" ? "justify-end" : "justify-start")}
                  >
                    <Bubble msg={m} />
                  </motion.div>
                ) : null,
              )}
              {tick > 1.2 && tick < 2.0 && <TypingBubble key="t1" side="seller" />}
              {tick > 4.7 && tick < 5.2 && <TypingBubble key="t2" side="seller" />}
              {tick > 6.9 && tick < 7.5 && <TypingBubble key="t3" side="buyer" />}
            </AnimatePresence>
          </div>
          <InstaComposer progress={tick / TOTAL_SEC} />
        </div>
      </div>

      <FloatingBadge tick={tick} />
      <FloatingReceipt tick={tick} />
    </div>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isBuyer = msg.side === "buyer";
  if (msg.kind === "link" && msg.linkPreview) {
    return (
      <div className="max-w-[280px]">
        <div className={"rounded-[22px] px-4 py-2.5 text-[13.5px] " + (isBuyer
          ? "bg-[var(--primary)] text-[var(--primary-foreground)] rounded-br-sm"
          : "bg-white text-[var(--foreground)] border border-[var(--border)] rounded-bl-sm")}>
          {msg.text}
        </div>
        <div className="mt-1.5 rounded-2xl border border-[var(--border-strong)] bg-white overflow-hidden shadow-[var(--shadow-card)]">
          <div className="h-20 bg-gradient-to-br from-[var(--primary)] via-[#137a4b] to-[#0a3a23] relative">
            <div className="absolute inset-0 bg-grid-dots opacity-30" />
            <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur px-2 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase text-white">
              <Lock size={10} /> Protected
            </div>
            <div className="absolute right-3 bottom-3 font-display font-bold text-xl text-white">
              {msg.linkPreview.amount}
            </div>
          </div>
          <div className="p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-semibold">SBBS · Secure checkout</p>
            <p className="font-medium mt-0.5 text-[13px]">{msg.linkPreview.title}</p>
            <p className="text-xs text-[var(--muted)] font-mono mt-0.5">{msg.linkPreview.host}</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className={
        "max-w-[260px] px-4 py-2.5 text-[13.5px] leading-relaxed " +
        (isBuyer
          ? "bg-[var(--primary)] text-[var(--primary-foreground)] rounded-[22px] rounded-br-sm"
          : "bg-white text-[var(--foreground)] border border-[var(--border)] rounded-[22px] rounded-bl-sm")
      }
    >
      {msg.text}
    </div>
  );
}

function TypingBubble({ side }: { side: "buyer" | "seller" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={"flex " + (side === "buyer" ? "justify-end" : "justify-start")}
    >
      <div className="bg-white border border-[var(--border)] rounded-[22px] px-3.5 py-2 flex gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--muted)] animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--muted)] animate-bounce" style={{ animationDelay: "120ms" }} />
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--muted)] animate-bounce" style={{ animationDelay: "240ms" }} />
      </div>
    </motion.div>
  );
}

function InstaHeader({ seller, active }: { seller: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-white">
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="absolute inset-[-2px] rounded-full bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF]" />
          <div className="relative h-8 w-8 rounded-full bg-white p-[2px]">
            <div className="h-full w-full rounded-full bg-gradient-to-br from-[var(--primary)] to-[#0a3a23] flex items-center justify-center text-white text-[10px] font-bold">
              KC
            </div>
          </div>
          {active && (
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#3ccf6e] ring-2 ring-white" />
          )}
        </div>
        <div>
          <p className="text-[13px] font-semibold leading-none">{seller}</p>
          <p className="text-[10.5px] text-[var(--muted)] mt-0.5">{active ? "Active now" : "Active 2m ago"}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-[var(--muted)]">
        <Heart size={16} />
        <MessageCircle size={16} />
        <Bookmark size={16} />
      </div>
    </div>
  );
}

function InstaComposer({ progress }: { progress: number }) {
  return (
    <div className="px-3 py-2.5 bg-white border-t border-[var(--border)] flex items-center gap-2">
      <div className="flex-1 h-9 rounded-full border border-[var(--border-strong)] bg-[var(--surface-muted)]/60 px-3 flex items-center text-xs text-[var(--muted)]">
        Message&hellip;
      </div>
      <div className="h-9 w-9 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center">
        <Send size={14} />
      </div>
      <div className="absolute left-6 right-6 bottom-[60px] h-[2px] rounded-full bg-[var(--border)] overflow-hidden">
        <div className="h-full bg-[var(--primary)] transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}

function FloatingBadge({ tick }: { tick: number }) {
  const show = tick > 5.6 && tick < 9.9;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9, rotate: -6 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: -6 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          className="absolute -left-4 sm:-left-10 top-36 z-10"
        >
          <div className="rounded-2xl bg-[var(--foreground)] text-white px-4 py-3 shadow-[0_20px_40px_-20px_#00000070,0_6px_24px_-10px_#00000055] flex items-center gap-3 min-w-[220px]">
            <div className="h-9 w-9 rounded-lg bg-[var(--primary)] flex items-center justify-center">
              <ShieldCheck size={18} className="text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-white/60">Held safely</p>
              <p className="font-display font-bold leading-tight">₵420.00</p>
              <p className="text-[10px] text-white/60 mt-0.5 font-mono">SB-KC-420-P17A</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FloatingReceipt({ tick }: { tick: number }) {
  const show = tick > 7.4 && tick < 9.9;
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.9, rotate: 5 }}
          animate={{ opacity: 1, y: 0, scale: 1, rotate: 5 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="absolute -right-6 sm:-right-16 bottom-20 z-10"
        >
          <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border-strong)] px-4 py-3 shadow-[var(--shadow-pop)] flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
              <CheckCheck size={16} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[var(--muted)]">Seller SMS</p>
              <p className="text-[12.5px] font-medium leading-tight mt-0.5">Funds held · dispatch safely</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
