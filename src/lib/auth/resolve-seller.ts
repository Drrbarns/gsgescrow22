import { eq, or, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { profiles } from "@/lib/db/schema";
import { normalizeGhPhone } from "@/lib/utils";

export interface ResolveSellerInput {
  email?: string | null;
  phone: string;
  handle?: string | null;
}

export interface ResolvedSeller {
  /** Matching profile id, if any of the identifiers hit a row. */
  profileId: string | null;
  /** The email we actually matched on (or the caller-supplied one). */
  email: string | null;
  /** Normalized Ghana phone (+233…). */
  phone: string;
  /** Normalized handle (without @). */
  handle: string | null;
  /** How the profile was matched — useful for audit + debug. */
  matchedBy: "handle" | "email" | "phone" | "none";
}

function normEmail(s: string | null | undefined): string | null {
  if (!s) return null;
  const t = s.trim().toLowerCase();
  if (!t || !t.includes("@")) return null;
  return t;
}

function normHandle(s: string | null | undefined): string | null {
  if (!s) return null;
  const t = s.trim().replace(/^@/, "").toLowerCase();
  return t.length >= 2 ? t : null;
}

/**
 * Resolve a seller by handle → email → phone (in that order).
 * Returns a canonical contact block that callers can safely persist
 * and use for notifications, even when no profile exists yet.
 */
export async function resolveSeller(input: ResolveSellerInput): Promise<ResolvedSeller> {
  const email = normEmail(input.email);
  const handle = normHandle(input.handle);
  const phone = normalizeGhPhone(input.phone) ?? input.phone;

  const base: ResolvedSeller = {
    profileId: null,
    email,
    phone,
    handle,
    matchedBy: "none",
  };

  const db = getDb();
  // Handle is the strongest identifier — unique index on profiles.handle.
  if (handle) {
    const [row] = await db
      .select()
      .from(profiles)
      .where(eq(sql`lower(${profiles.handle})`, handle))
      .limit(1);
    if (row) {
      return {
        profileId: row.id,
        email: email ?? row.email ?? null,
        phone: row.phone ?? phone,
        handle,
        matchedBy: "handle",
      };
    }
  }

  if (email) {
    const [row] = await db
      .select()
      .from(profiles)
      .where(eq(sql`lower(${profiles.email})`, email))
      .limit(1);
    if (row) {
      return {
        profileId: row.id,
        email,
        phone: row.phone ?? phone,
        handle: handle ?? row.handle ?? null,
        matchedBy: "email",
      };
    }
  }

  if (phone) {
    const [row] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.phone, phone))
      .limit(1);
    if (row) {
      return {
        profileId: row.id,
        email: email ?? row.email ?? null,
        phone,
        handle: handle ?? row.handle ?? null,
        matchedBy: "phone",
      };
    }
  }

  return base;
}

/**
 * Given a profile, find every transaction where the seller is currently
 * unlinked but at least one contact identifier matches. Used on first
 * sign-in to attach every past order to the new account.
 */
export async function findUnclaimedSellerTransactions(profile: {
  id: string;
  email: string | null;
  phone: string | null;
  handle: string | null;
}): Promise<string[]> {
  const db = getDb();
  const email = normEmail(profile.email);
  const handle = normHandle(profile.handle);
  const phone = profile.phone ? normalizeGhPhone(profile.phone) ?? profile.phone : null;

  const identifiers: string[] = [];
  if (email) identifiers.push(email);
  if (phone) identifiers.push(phone);
  if (handle) identifiers.push(handle);
  if (identifiers.length === 0) return [];

  // We match against transactions.sellerPhone directly, and metadata blobs
  // for email/handle. The buyer-initiated path writes both.
  const { transactions } = await import("@/lib/db/schema");

  const rows = await db
    .select({ id: transactions.id, ref: transactions.ref })
    .from(transactions)
    .where(
      or(
        phone ? eq(transactions.sellerPhone, phone) : undefined,
        email
          ? sql`lower(${transactions.metadata} ->> 'sellerEmail') = ${email}`
          : undefined,
        handle
          ? sql`lower(${transactions.metadata} ->> 'sellerHandle') = ${handle}`
          : undefined,
      ),
    );
  // Filter to the truly unclaimed ones in JS — drizzle's `isNull` on a
  // foreign key can be noisy with older Postgres clients.
  const ids = rows.map((r) => r.id);
  if (ids.length === 0) return [];
  const unclaimed = await db
    .select({ id: transactions.id })
    .from(transactions)
    .where(sql`${transactions.id} = ANY(${ids}) AND ${transactions.sellerId} IS NULL`);
  return unclaimed.map((r) => r.id);
}
