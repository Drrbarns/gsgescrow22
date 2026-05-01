/**
 * scripts/add-seller-release-fee.ts
 *
 * Adds the new `seller_release_fee` column to the `transactions` table and
 * seeds the `seller_release_fee_pesewas` row in `platform_settings` if it
 * isn't already present. Safe to re-run.
 *
 * Usage:
 *   npx tsx scripts/add-seller-release-fee.ts
 */
import path from "node:path";
import { config as loadEnv } from "dotenv";
import postgres from "postgres";

loadEnv({ path: path.resolve(process.cwd(), ".env.local"), override: false });
loadEnv({ path: path.resolve(process.cwd(), ".env"), override: false });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("✗ DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = postgres(url, { max: 2, idle_timeout: 5, prepare: false });

  try {
    console.log("→ Adding column transactions.seller_release_fee (if missing)...");
    await sql`
      ALTER TABLE transactions
      ADD COLUMN IF NOT EXISTS seller_release_fee bigint NOT NULL DEFAULT 0
    `;
    console.log("✓ Column ready");

    console.log("→ Seeding platform_settings.seller_release_fee_pesewas (if missing)...");
    await sql`
      INSERT INTO platform_settings (key, value, description)
      VALUES (
        'seller_release_fee_pesewas',
        to_jsonb(200::int),
        'Flat seller release fee'
      )
      ON CONFLICT (key) DO NOTHING
    `;
    console.log("✓ Setting seeded (default ₵2 — change in /admin/settings)");

    console.log("\nDone.");
  } catch (err) {
    console.error("✗ Migration failed:", err);
    process.exit(1);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main();
