"use server";

import { getPsp } from "@/lib/payments";
import type { HealthCheckResult } from "@/lib/payments/types";
import { getCurrentProfile, isAdminRole } from "@/lib/auth/session";
import { audit } from "@/lib/audit/log";
import { revalidatePath } from "next/cache";

/**
 * Run the PSP's healthCheck() on demand. Admin-only; audit-logged.
 * Returns the raw HealthCheckResult plus the provider name so the UI can
 * render it without any additional lookups.
 */
export async function runPspHealthCheck(): Promise<{
  ok: boolean;
  provider: string;
  result?: HealthCheckResult;
  error?: string;
}> {
  const actor = await getCurrentProfile();
  if (!actor || !isAdminRole(actor.role)) {
    return { ok: false, provider: "unknown", error: "Not authorized" };
  }
  const psp = getPsp();
  if (typeof psp.healthCheck !== "function") {
    return {
      ok: false,
      provider: psp.provider,
      error: `${psp.provider} adapter doesn't implement healthCheck()`,
    };
  }
  try {
    const result = await psp.healthCheck();
    await audit({
      action: "webhook.received",
      targetType: "psp_health",
      targetId: psp.provider,
      reason: result.ok ? "healthy" : "degraded",
      payload: result as unknown as Record<string, unknown>,
    });
    revalidatePath("/admin/runbook");
    return { ok: true, provider: psp.provider, result };
  } catch (err) {
    return { ok: false, provider: psp.provider, error: (err as Error).message };
  }
}
