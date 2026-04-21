"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile, isAdminRole } from "@/lib/auth/session";
import { audit } from "@/lib/audit/log";
import { emailReconReport, runDailyReconciliation, type ReconReport } from "@/lib/recon/daily";
import { setLastReconReport } from "@/lib/recon/store";

export async function runReconOnDemand(opts: { email?: boolean } = {}): Promise<{
  ok: boolean;
  error?: string;
  report?: ReconReport;
}> {
  const actor = await getCurrentProfile();
  if (!actor || !isAdminRole(actor.role)) return { ok: false, error: "Not authorized" };

  const report = await runDailyReconciliation();
  setLastReconReport(report);

  await audit({
    action: "settings.update",
    targetType: "recon_report",
    targetId: report.ranAt,
    reason: "Manual run",
    payload: {
      summary: report.summary,
      counts: report.counts,
    },
  });

  if (opts.email && report.findings.length > 0) {
    await emailReconReport(report);
  }

  revalidatePath("/admin/runbook");
  return { ok: true, report };
}
