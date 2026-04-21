import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatGhs(
  pesewas: number | string | null | undefined,
  opts: { withSymbol?: boolean } = { withSymbol: true },
): string {
  if (pesewas === null || pesewas === undefined) return opts.withSymbol ? "₵0.00" : "0.00";
  const n = typeof pesewas === "string" ? Number(pesewas) : pesewas;
  const cedis = (n || 0) / 100;
  const formatted = cedis.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return opts.withSymbol ? `₵${formatted}` : formatted;
}

export function ghsToPesewas(cedis: number | string): number {
  const n = typeof cedis === "string" ? Number(cedis) : cedis;
  return Math.round((n || 0) * 100);
}

export function redactPhone(phone?: string | null): string {
  if (!phone) return "***";
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.length < 4) return "***";
  return `***${cleaned.slice(-4)}`;
}

export function normalizeGhPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("233") && digits.length === 12) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `+233${digits.slice(1)}`;
  if (digits.length === 9) return `+233${digits}`;
  return null;
}

export function generateRef(prefix = "SB"): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

export function generateDeliveryCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function relativeTime(date: Date | string | number): string {
  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" });
}
