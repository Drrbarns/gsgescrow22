/**
 * scripts/diag-today.ts
 *
 * Prints every transaction created in the last 24 hours and explains why
 * each one would (or wouldn't) appear on the seller's dashboard.
 *
 * Usage:
 *   npx tsx scripts/diag-today.ts
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
    console.log("\n══════════════════════════════════════════════════════════════════════");
    console.log(" SBBS — last-24h transactions diagnostic");
    console.log("══════════════════════════════════════════════════════════════════════\n");

    // 1. List the actual profiles so we know what we're matching against.
    const profs = await sql<
      { id: string; email: string | null; phone: string | null; handle: string | null; role: string; display_name: string | null }[]
    >`
      select id, email, phone, handle, role, display_name
      from profiles
      order by role desc, created_at asc
    `;
    console.log("PROFILES on the platform:");
    console.table(
      profs.map((p) => ({
        id: p.id.slice(0, 8) + "…",
        role: p.role,
        name: p.display_name,
        email: p.email,
        phone: p.phone,
        handle: p.handle,
      })),
    );

    // 2. Find every transaction in the last 24h.
    const txns = await sql<
      Array<{
        id: string;
        ref: string;
        state: string;
        initiated_by: string;
        buyer_id: string | null;
        seller_id: string | null;
        buyer_name: string;
        buyer_phone: string;
        seller_name: string;
        seller_phone: string;
        item_description: string;
        total_charged: number;
        created_at: Date;
        metadata: Record<string, unknown> | null;
      }>
    >`
      select id, ref, state, initiated_by,
             buyer_id, seller_id, buyer_name, buyer_phone, seller_name, seller_phone,
             item_description, total_charged, created_at, metadata
      from transactions
      where created_at >= now() - interval '36 hours'
      order by created_at desc
    `;

    console.log(`\nFound ${txns.length} transaction(s) created in the last 36h.\n`);

    if (txns.length === 0) {
      console.log("No recent transactions in the database.");
      return;
    }

    for (const t of txns) {
      console.log("──────────────────────────────────────────────────────────────────────");
      console.log(`  ref:          ${t.ref}`);
      console.log(`  state:        ${t.state}`);
      console.log(`  created:      ${t.created_at.toISOString()}`);
      console.log(`  initiatedBy:  ${t.initiated_by}`);
      console.log(`  item:         ${t.item_description}  (₵${(t.total_charged / 100).toFixed(2)})`);
      console.log("");
      console.log(`  BUYER  side: ${t.buyer_name} | ${t.buyer_phone} | id=${t.buyer_id ?? "—"}`);
      console.log(`  SELLER side: ${t.seller_name} | ${t.seller_phone} | id=${t.seller_id ?? "—"}`);
      console.log(`  metadata:`);
      console.log(`     sellerEmail:     ${(t.metadata?.sellerEmail as string) ?? "—"}`);
      console.log(`     sellerHandle:    ${(t.metadata?.sellerHandle as string) ?? "—"}`);
      console.log(`     sellerMatchedBy: ${(t.metadata?.sellerMatchedBy as string) ?? "—"}`);
      console.log(`     buyerEmail:      ${(t.metadata?.buyerEmail as string) ?? "—"}`);
      console.log("");

      // Verdict: would this row show on the seller's hub?
      if (t.seller_id) {
        const owner = profs.find((p) => p.id === t.seller_id);
        if (owner) {
          console.log(
            `  ✅ DASHBOARD: yes — sellerId is set to "${owner.display_name ?? owner.email}" (${owner.email ?? owner.phone ?? owner.id.slice(0, 8)}). This order WILL appear on their /hub when they're logged in.`,
          );
        } else {
          console.log(
            `  ⚠ DASHBOARD: sellerId points to a profile that no longer exists (${t.seller_id.slice(0, 8)}…). Orphaned reference — would not appear anywhere.`,
          );
        }
      } else {
        console.log("  ❌ DASHBOARD: NO — sellerId is null.");
        console.log("     Reason: resolveSeller() did not match any existing profile at order-creation time.");
        console.log("     Sweep candidates (would attach on next sign-in if any of these match a profile):");

        const meta = t.metadata ?? {};
        const sellerEmail = (meta.sellerEmail as string | undefined) ?? null;
        const sellerHandle = (meta.sellerHandle as string | undefined) ?? null;

        const phoneMatch = profs.find((p) => p.phone && p.phone === t.seller_phone);
        const emailMatch = sellerEmail
          ? profs.find((p) => p.email && p.email.toLowerCase() === sellerEmail.toLowerCase())
          : null;
        const handleMatch = sellerHandle
          ? profs.find((p) => p.handle && p.handle.toLowerCase() === sellerHandle.toLowerCase())
          : null;

        console.log(`       by phone  (${t.seller_phone}):  ${phoneMatch ? `would attach → ${phoneMatch.email ?? phoneMatch.id.slice(0, 8)}` : "no match"}`);
        console.log(`       by email  (${sellerEmail ?? "—"}):  ${emailMatch ? `would attach → ${emailMatch.email ?? emailMatch.id.slice(0, 8)}` : "no match"}`);
        console.log(`       by handle (${sellerHandle ?? "—"}):  ${handleMatch ? `would attach → ${handleMatch.email ?? handleMatch.id.slice(0, 8)}` : "no match"}`);

        if (phoneMatch || emailMatch || handleMatch) {
          console.log("     ⇒ A profile EXISTS that should match. The sweep will attach it the next time that user hits /hub or signs in.");
        } else {
          console.log("     ⇒ NO profile on the platform has any of these identifiers. Order is orphaned until the seller signs up via the claim link.");
        }
      }

      // 3. Show the SMS log for this ref so we know what notifications fired.
      const smsRows = await sql<
        Array<{ recipient: string; body: string; status: string; error: string | null; created_at: Date }>
      >`
        select recipient, body, status, error, created_at
        from sms_log
        where ref = ${t.ref}
        order by created_at asc
      `;
      console.log("");
      if (smsRows.length === 0) {
        console.log("  📵 SMS log: NO sms records for this ref. Buyer/seller never received an SMS.");
      } else {
        console.log(`  📲 SMS log (${smsRows.length} entries):`);
        for (const s of smsRows) {
          const snippet = s.body.replace(/\s+/g, " ").slice(0, 80);
          console.log(`     [${s.status}${s.error ? " · err=" + s.error.slice(0, 40) : ""}] → ${s.recipient} : "${snippet}…"`);
        }
      }

      console.log("");
    }
  } finally {
    await sql.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
