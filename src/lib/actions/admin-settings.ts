"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { audit } from "@/lib/audit/log";
import { getCurrentProfile, isAdminRole } from "@/lib/auth/session";
import { describeSetting, getSettings, updateSetting, type PlatformConfig } from "@/lib/settings";

const numericKinds = new Set(["number", "pesewas", "bps"]);

const schema = z.object({
  updates: z.record(z.string(), z.unknown()),
  reason: z.string().min(4),
});

export async function saveSettings(input: z.infer<typeof schema>) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };
  const actor = await getCurrentProfile();
  if (!actor || !isAdminRole(actor.role)) return { ok: false as const, error: "Not authorized" };

  const current = await getSettings();
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  for (const [rawKey, rawValue] of Object.entries(parsed.data.updates)) {
    const key = rawKey as keyof PlatformConfig;
    if (!(key in current)) continue;
    const meta = describeSetting(key);
    let value: unknown = rawValue;
    if (numericKinds.has(meta.kind)) value = Number(rawValue);
    if (meta.kind === "boolean") value = Boolean(rawValue);
    if (meta.kind === "string") value = rawValue === "" ? null : String(rawValue);
    if (meta.kind === "emails") {
      value = Array.isArray(rawValue)
        ? rawValue
            .map((s) => String(s).trim().toLowerCase())
            .filter((s) => s.length > 0 && s.includes("@"))
        : [];
    }
    if (JSON.stringify(current[key]) === JSON.stringify(value)) continue;
    await updateSetting(key, value as PlatformConfig[typeof key], actor.id);
    diff[rawKey] = { from: current[key], to: value };
  }

  if (Object.keys(diff).length === 0) {
    return { ok: true as const, noop: true };
  }

  await audit({
    action: "settings.update",
    targetType: "platform_settings",
    targetId: Object.keys(diff).join(","),
    reason: parsed.data.reason,
    payload: diff,
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin");
  return { ok: true as const };
}
