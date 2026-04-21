import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { autoReleaseSweep } from "@/lib/actions/transaction";
import { env, isDbLive } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = (await headers()).get("authorization") ?? "";
  if (env.CRON_SECRET && auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!isDbLive) {
    return NextResponse.json({ ok: true, released: 0, note: "DB not configured" });
  }
  const result = await autoReleaseSweep();
  return NextResponse.json({ ok: true, ...result });
}
