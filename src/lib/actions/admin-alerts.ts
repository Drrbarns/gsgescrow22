"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { alerts } from "@/lib/db/schema";
import { isDbLive } from "@/lib/env";
import { audit } from "@/lib/audit/log";
import { getCurrentProfile, isAdminRole } from "@/lib/auth/session";

export async function acknowledgeAlert(alertId: string) {
  if (!isDbLive) return { ok: false as const, error: "DB not configured" };
  const actor = await getCurrentProfile();
  if (!actor || !isAdminRole(actor.role)) return { ok: false as const, error: "Not authorized" };

  const db = getDb();
  const [row] = await db.select().from(alerts).where(eq(alerts.id, alertId)).limit(1);
  if (!row) return { ok: false as const, error: "Not found" };

  await db
    .update(alerts)
    .set({ acknowledgedBy: actor.id, acknowledgedAt: new Date() })
    .where(eq(alerts.id, alertId));

  await audit({
    action: "alert.acknowledge",
    targetType: "alert",
    targetId: alertId,
    payload: { title: row.title, severity: row.severity },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/fraud");
  return { ok: true as const };
}
