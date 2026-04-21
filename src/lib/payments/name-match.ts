/**
 * Fuzzy-match two human names where one is a "display" name entered by a
 * seller and the other is the PSP's registered account name. The real-world
 * test here: Moolre returns the MoMo registration name as seen by MTN/Telecel.
 * That frequently differs slightly from what a seller types on SBBS
 * (short names, middle names, ordering, punctuation). We want to catch
 * obvious fraud — not flag every formatting nuance.
 */
export function namesAreSimilar(a: string, b: string): { ok: boolean; overlap: number } {
  const ta = tokenize(a);
  const tb = tokenize(b);
  if (ta.size === 0 || tb.size === 0) return { ok: false, overlap: 0 };

  const shared = [...ta].filter((t) => tb.has(t)).length;
  const smaller = Math.min(ta.size, tb.size);
  const overlap = shared / smaller;

  // Treat as a match if >=50% of the smaller set's tokens also appear in the
  // other, OR if at least one token is 4+ chars and matches exactly.
  const hasStrongToken = [...ta].some((t) => t.length >= 4 && tb.has(t));
  return { ok: overlap >= 0.5 || hasStrongToken, overlap };
}

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 2 && !STOPWORDS.has(t)),
  );
}

const STOPWORDS = new Set([
  "mr",
  "mrs",
  "ms",
  "miss",
  "dr",
  "snr",
  "jnr",
  "jr",
  "sr",
  "mdm",
  "mister",
  "madam",
]);
