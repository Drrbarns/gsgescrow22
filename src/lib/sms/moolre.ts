import { env } from "../env";
import type { SmsAdapter, SmsBatchResult, SmsMessage, SmsResult } from "./types";

const ENDPOINT = "https://api.moolre.com/open/sms/send";

interface MoolreSmsEnvelope {
  status: number | string;
  code?: string;
  message?: string;
  data?: { messageid?: string; id?: string; ref?: string; results?: unknown[] } | null;
}

function normalize(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("233") && d.length === 12) return d;
  if (d.startsWith("0") && d.length === 10) return `233${d.slice(1)}`;
  if (d.length === 9) return `233${d}`;
  return d;
}

function mask(s: string | undefined): string {
  if (!s) return "(missing)";
  if (s.length <= 6) return "***";
  return `${s.slice(0, 3)}…${s.slice(-3)} (len=${s.length})`;
}

/**
 * Moolre requires a non-empty `ref` on every message, and it MUST be globally unique
 * per message (not per transaction), otherwise subsequent messages for the same
 * order will fail with ASMS05 "ref at (0) is not unique". We append a random suffix
 * to the transaction ref to ensure uniqueness.
 */
function ensureRef(ref: string | undefined): string {
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "")
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  const suffix = uuid.slice(0, 10);
  if (ref && ref.trim().length > 0) return `${ref.trim()}-${suffix}`;
  return `sbbs-${suffix}`;
}

/**
 * Moolre SMS uses ONLY X-API-VASKEY for auth (per the /open/sms/send docs).
 * No X-API-USER, no X-API-ACCOUNT, no X-API-KEY needed here — those belong
 * to the payments API. An AIN01 response means the VASKEY value itself is
 * invalid or the SMS VAS product isn't enabled on the Moolre account.
 */
async function call(body: unknown): Promise<MoolreSmsEnvelope> {
  const vaskey = env.MOOLRE_SMS_VASKEY;
  if (!vaskey) {
    throw new Error(
      "Moolre SMS not configured: MOOLRE_SMS_VASKEY missing. Register for the SMS VAS on moolre.com to obtain one.",
    );
  }

  const headers: Record<string, string> = {
    "X-API-VASKEY": vaskey,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (env.MOOLRE_SMS_SCENARIO) {
    headers["X-Scenario-Key"] = env.MOOLRE_SMS_SCENARIO;
  }

  console.log("[moolre-sms] POST", ENDPOINT, {
    vaskey: mask(vaskey),
    senderId: env.MOOLRE_SMS_SENDER_ID,
    scenario: env.MOOLRE_SMS_SCENARIO || "(none)",
  });

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const text = await res.text();
  let json: MoolreSmsEnvelope;
  try {
    json = text ? (JSON.parse(text) as MoolreSmsEnvelope) : { status: 0 };
  } catch {
    console.error("[moolre-sms] non-JSON response", res.status, text?.slice(0, 200));
    throw new Error(`Moolre SMS returned non-JSON: ${res.status} ${res.statusText}`);
  }
  const status = typeof json.status === "string" ? Number(json.status) : json.status;
  if (!res.ok || status !== 1) {
    console.error("[moolre-sms] API rejected", {
      httpStatus: res.status,
      code: json.code,
      message: json.message,
      data: json.data,
    });
    const code = json.code ?? res.status;
    const msg = json.message ?? res.statusText;
    const hint =
      code === "AIN01"
        ? " — the VASKEY is invalid or SMS VAS is not activated on your Moolre account"
        : "";
    throw new Error(`Moolre SMS failed (code=${code}): ${msg}${hint}`);
  }
  return json;
}

export const moolreSms: SmsAdapter = {
  provider: "moolre",

  async send(msg: SmsMessage): Promise<SmsResult> {
    try {
      const ref = ensureRef(msg.ref);
      const json = await call({
        type: 1,
        senderid: env.MOOLRE_SMS_SENDER_ID,
        messages: [
          {
            recipient: normalize(msg.to),
            message: msg.body,
            ref,
          },
        ],
      });
      return {
        ok: true,
        providerMessageId:
          json.data?.messageid ??
          json.data?.id ??
          json.data?.ref ??
          msg.ref,
        provider: "moolre",
      };
    } catch (err) {
      return { ok: false, error: (err as Error).message, provider: "moolre" };
    }
  },

  async sendBatch(msgs: SmsMessage[]): Promise<SmsBatchResult> {
    if (msgs.length === 0) return { ok: true, provider: "moolre", results: [] };
    try {
      // Moolre accepts an array of messages in a single call — cheaper + faster
      // than N round-trips when fanning out to both parties.
      const withRefs = msgs.map((m) => ({ ...m, ref: ensureRef(m.ref) }));
      const json = await call({
        type: 1,
        senderid: env.MOOLRE_SMS_SENDER_ID,
        messages: withRefs.map((m) => ({
          recipient: normalize(m.to),
          message: m.body,
          ref: m.ref,
        })),
      });
      // The docs don't fully specify per-message results; on status=1 we treat
      // every message as queued for delivery and assign the same message id
      // (or the individual ref) for tracking.
      const batchId = json.data?.messageid ?? json.data?.id ?? "";
      return {
        ok: true,
        provider: "moolre",
        results: withRefs.map((m) => ({
          ok: true,
          providerMessageId: batchId || m.ref,
          provider: "moolre",
        })),
      };
    } catch (err) {
      const msg = (err as Error).message;
      return {
        ok: false,
        provider: "moolre",
        error: msg,
        results: msgs.map(() => ({ ok: false, error: msg, provider: "moolre" })),
      };
    }
  },
};
