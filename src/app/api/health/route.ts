import { NextResponse } from "next/server";
import { isAuthLive, isDbLive, isPaymentsLive, isSmsLive } from "@/lib/env";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    ok: true,
    name: "sbbs",
    version: "0.1.0",
    services: {
      db: isDbLive,
      auth: isAuthLive,
      payments: isPaymentsLive,
      sms: isSmsLive,
    },
    time: new Date().toISOString(),
  });
}
