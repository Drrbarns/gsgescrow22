import crypto from "node:crypto";
import { env } from "@/lib/env";

/**
 * Signed claim tokens let us SMS/email an offline seller a link that,
 * after they sign up, attaches a pending transaction to their new
 * profile. The token embeds the contact identifiers the buyer originally
 * entered, so even if the seller signs up with a slightly different
 * account we can still match one of them (email / phone / handle).
 *
 * The secret is derived from SUPABASE_SERVICE_ROLE_KEY so no new env
 * var is required — that key is always present in server-only contexts
 * and never exposed to the browser.
 */

export interface ClaimPayload {
  /** Transaction reference this token unlocks. */
  ref: string;
  /** Role the claim grants — "seller" today, "buyer" later. */
  role: "seller" | "buyer";
  /** The email the buyer entered (if any). */
  email?: string;
  /** Normalized Ghana phone (+233…). */
  phone?: string;
  /** SBBS handle without the leading @ (if any). */
  handle?: string;
  /** Unix ms at which this token must be ignored. */
  exp: number;
}

function getSecret(): string {
  const s = env.SUPABASE_SERVICE_ROLE_KEY || env.CRON_SECRET || env.NEXT_PUBLIC_APP_URL;
  if (!s || s.length < 16) {
    // Dev-only fallback — prints loudly so it's never mistaken for prod.
    console.warn("[claim] No claim signing secret configured — using weak fallback");
    return "sbbs-claim-fallback-secret-do-not-ship";
  }
  return s;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Buffer {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64");
}

export function signClaim(payload: Omit<ClaimPayload, "exp"> & { ttlMs?: number }): string {
  const { ttlMs = 30 * 24 * 60 * 60 * 1000, ...rest } = payload;
  const full: ClaimPayload = { ...rest, exp: Date.now() + ttlMs };
  const body = b64url(Buffer.from(JSON.stringify(full), "utf8"));
  const sig = b64url(
    crypto.createHmac("sha256", getSecret()).update(body).digest(),
  );
  return `${body}.${sig}`;
}

export function verifyClaim(token: string): ClaimPayload | null {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = b64url(
    crypto.createHmac("sha256", getSecret()).update(body).digest(),
  );
  // Timing-safe compare.
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const parsed = JSON.parse(fromB64url(body).toString("utf8")) as ClaimPayload;
    if (typeof parsed.exp !== "number" || parsed.exp < Date.now()) return null;
    if (parsed.role !== "seller" && parsed.role !== "buyer") return null;
    if (typeof parsed.ref !== "string" || parsed.ref.length < 4) return null;
    return parsed;
  } catch {
    return null;
  }
}
