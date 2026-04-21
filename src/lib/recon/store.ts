import type { ReconReport } from "./daily";

declare global {
  var __sbbs_last_recon__: ReconReport | undefined;
}

/**
 * In-memory last-recon cache, shared across requests inside a single Vercel
 * serverless container. The cron writes here; the runbook reads it. When
 * the container is cold, the runbook simply shows "not yet run" which is
 * accurate — run the cron manually to refresh.
 */
export function getLastReconReport(): ReconReport | null {
  return global.__sbbs_last_recon__ ?? null;
}

export function setLastReconReport(report: ReconReport): void {
  global.__sbbs_last_recon__ = report;
}
