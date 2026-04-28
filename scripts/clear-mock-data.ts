/**
 * scripts/clear-mock-data.ts
 *
 * Wipes test transactions / payouts / disputes / reviews / listings / SMS
 * logs / webhooks / alerts / audit logs from the live Postgres database.
 *
 * Keeps:
 *   - profiles (your real superadmin / seller / buyer accounts)
 *   - platform_settings (fees, caps, feature flags)
 *   - kyc_submissions / riders rows tied to real profiles
 *
 * Usage:
 *   npm run db:clear-mocks           # uses DATABASE_URL from .env.local
 *   FORCE=1 npm run db:clear-mocks   # skip the confirmation prompt
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { config as loadEnv } from "dotenv";
import postgres from "postgres";

// Load .env.local first (Next.js convention), then fall back to .env.
loadEnv({ path: path.resolve(process.cwd(), ".env.local"), override: false });
loadEnv({ path: path.resolve(process.cwd(), ".env"), override: false });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("✗ DATABASE_URL is not set. Aborting.");
    process.exit(1);
  }

  const force = process.env.FORCE === "1";
  if (!force) {
    const host = (() => {
      try {
        return new URL(url).host;
      } catch {
        return "(unparsable)";
      }
    })();
    console.log(`About to wipe transactional data on: ${host}`);
    console.log("Re-run with FORCE=1 to skip this prompt and confirm.\n");
    if (!process.stdin.isTTY) {
      console.error("✗ Refusing to run in non-interactive mode without FORCE=1.");
      process.exit(1);
    }
    process.stdout.write("Type the word 'wipe' to continue: ");
    const answer = await new Promise<string>((resolve) => {
      process.stdin.setEncoding("utf8");
      process.stdin.once("data", (d) => resolve(String(d).trim()));
    });
    if (answer !== "wipe") {
      console.log("✗ Cancelled.");
      process.exit(1);
    }
  }

  const sqlPath = path.resolve(process.cwd(), "scripts/clear-mock-data.sql");
  const sqlText = await readFile(sqlPath, "utf8");

  const sql = postgres(url, { prepare: false, max: 1 });
  try {
    console.log("→ Running scripts/clear-mock-data.sql ...");
    await sql.unsafe(sqlText);

    const counts = await sql/* sql */`
      SELECT 'transactions' AS t, count(*)::int AS n FROM transactions
      UNION ALL SELECT 'payments',         count(*)::int FROM payments
      UNION ALL SELECT 'payouts',          count(*)::int FROM payouts
      UNION ALL SELECT 'disputes',         count(*)::int FROM disputes
      UNION ALL SELECT 'reviews',          count(*)::int FROM reviews
      UNION ALL SELECT 'listings',         count(*)::int FROM listings
      UNION ALL SELECT 'sms_log',          count(*)::int FROM sms_log
      UNION ALL SELECT 'webhooks_log',     count(*)::int FROM webhooks_log
      UNION ALL SELECT 'audit_log',        count(*)::int FROM audit_log
      UNION ALL SELECT 'alerts',           count(*)::int FROM alerts
      UNION ALL SELECT 'transaction_events', count(*)::int FROM transaction_events
      UNION ALL SELECT 'evidence_files',   count(*)::int FROM evidence_files
      UNION ALL SELECT 'profiles (kept)',  count(*)::int FROM profiles
      UNION ALL SELECT 'platform_settings (kept)', count(*)::int FROM platform_settings
      ORDER BY 1;
    `;
    console.log("\n✓ Done. Post-cleanup row counts:");
    for (const row of counts) {
      console.log(`   ${String(row.t).padEnd(28)} ${row.n}`);
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error("✗ Failed:", err);
  process.exit(1);
});
