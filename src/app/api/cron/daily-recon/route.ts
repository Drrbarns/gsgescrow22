import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { env, isDbLive } from "@/lib/env";
import { emailReconReport, runDailyReconciliation } from "@/lib/recon/daily";
import { setLastReconReport } from "@/lib/recon/store";
import { audit } from "@/lib/audit/log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = (await headers()).get("authorization") ?? "";
  if (env.CRON_SECRET && auth !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!isDbLive) {
    return NextResponse.json({ ok: true, note: "DB not configured" });
  }

  const report = await runDailyReconciliation();
  setLastReconReport(report);

  await audit({
    action: "settings.update",
    targetType: "recon_report",
    targetId: report.ranAt,
    payload: {
      summary: report.summary,
      counts: report.counts,
      findings: report.findings.length,
    },
  });

  if (report.findings.length > 0 || report.summary.critical > 0) {
    await emailReconReport(report);
  }

  return NextResponse.json({
    ok: true,
    summary: report.summary,
    counts: report.counts,
    findings: report.findings,
    ranAt: report.ranAt,
    durationMs: report.durationMs,
  });
}
