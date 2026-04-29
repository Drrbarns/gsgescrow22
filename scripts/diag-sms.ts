import path from "node:path";
import { config as loadEnv } from "dotenv";
import postgres from "postgres";

loadEnv({ path: path.resolve(process.cwd(), ".env.local"), override: false });

async function main() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const smsRows = await sql`
    select recipient, body, status, error, created_at
    from sms_log
    order by created_at desc
    limit 10
  `;
  for (const s of smsRows) {
    console.log(`[${s.status}] -> ${s.recipient} | Error: ${s.error}`);
  }
  await sql.end();
}
main();
