"use server";

import { z } from "zod";
import { audit } from "@/lib/audit/log";
import { getCurrentProfile, isAdminRole } from "@/lib/auth/session";
import { sendSms } from "@/lib/sms";

const schema = z.object({
  to: z.string().min(7),
  body: z.string().min(1).max(480),
});

/**
 * Admin-only ad-hoc SMS send. Used for ops outreach, nudges, password resets.
 * Every send is audit-logged with who, to, and (truncated) body.
 */
export async function adminSendSms(input: z.infer<typeof schema>) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };
  const actor = await getCurrentProfile();
  if (!actor || !isAdminRole(actor.role)) return { ok: false as const, error: "Not authorized" };

  const result = await sendSms({
    to: parsed.data.to,
    body: parsed.data.body,
    kind: "admin.test",
    targetType: "manual_send",
  });

  await audit({
    action: "settings.update",
    targetType: "sms_send",
    targetId: parsed.data.to,
    payload: {
      actorEmail: actor.email,
      provider: result.provider,
      providerMessageId: result.providerMessageId,
      ok: result.ok,
      bodyPreview: parsed.data.body.slice(0, 80),
    },
  });

  return result.ok
    ? ({ ok: true as const, providerMessageId: result.providerMessageId ?? null })
    : { ok: false as const, error: result.error ?? "Send failed" };
}
