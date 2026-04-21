import crypto from "node:crypto";

type Entry<T> = {
  expiresAt: number;
  inFlight?: Promise<T>;
  value?: T;
};

const store = new Map<string, Entry<unknown>>();

function sweep() {
  const now = Date.now();
  for (const [k, v] of store) {
    if (v.expiresAt < now) store.delete(k);
  }
}

export function hashKey(parts: unknown[]): string {
  return crypto.createHash("sha1").update(JSON.stringify(parts)).digest("hex").slice(0, 24);
}

/**
 * idempotent(key, fn, ttlMs) guarantees that two concurrent calls with the
 * same key share the same result and don't each execute fn.
 * In-memory cache scoped to the running serverless instance; for cross-instance
 * guarantees back with Redis/Upstash. Good enough for server-action
 * double-submit protection inside a single Vercel region invocation.
 */
export async function idempotent<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs = 30_000,
): Promise<T> {
  sweep();
  const existing = store.get(key) as Entry<T> | undefined;
  if (existing) {
    if (existing.value !== undefined) return existing.value;
    if (existing.inFlight) return existing.inFlight;
  }
  const entry: Entry<T> = { expiresAt: Date.now() + ttlMs };
  const promise = (async () => {
    try {
      const v = await fn();
      entry.value = v;
      return v;
    } finally {
      entry.expiresAt = Date.now() + ttlMs;
    }
  })();
  entry.inFlight = promise;
  store.set(key, entry);
  return promise;
}

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Token bucket rate limiter. Returns { ok, retryAfter }.
 * In-memory; fine for public endpoints and dev, swap for Upstash in prod.
 */
export function rateLimit(
  key: string,
  opts: { capacity: number; refillPerSec: number },
): { ok: boolean; retryAfterMs: number; remaining: number } {
  const now = Date.now();
  const b = buckets.get(key) ?? { tokens: opts.capacity, lastRefill: now };
  const elapsed = (now - b.lastRefill) / 1000;
  b.tokens = Math.min(opts.capacity, b.tokens + elapsed * opts.refillPerSec);
  b.lastRefill = now;
  if (b.tokens >= 1) {
    b.tokens -= 1;
    buckets.set(key, b);
    return { ok: true, retryAfterMs: 0, remaining: Math.floor(b.tokens) };
  }
  buckets.set(key, b);
  const retryAfterMs = Math.ceil(((1 - b.tokens) / opts.refillPerSec) * 1000);
  return { ok: false, retryAfterMs, remaining: 0 };
}

export function rateLimitHeaders(limit: { remaining: number; retryAfterMs: number }) {
  const h = new Headers();
  h.set("X-RateLimit-Remaining", String(limit.remaining));
  if (limit.retryAfterMs > 0) h.set("Retry-After", String(Math.ceil(limit.retryAfterMs / 1000)));
  return h;
}
