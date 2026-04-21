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

async function call(body: unknown): Promise<MoolreSmsEnvelope> {
  const user = env.MOOLRE_USERNAME;
  const vaskey = env.MOOLRE_SMS_VASKEY;
  const pubkey = env.MOOLRE_PUBLIC_KEY;
  const privkey = env.MOOLRE_API_KEY;
  const account = env.MOOLRE_ACCOUNT_NUMBER;

  if (!user) {
    throw new Error("Moolre SMS not configured: MOOLRE_USERNAME missing");
  }
  if (!vaskey && !pubkey && !privkey) {
    throw new Error(
      "Moolre SMS not configured: need MOOLRE_SMS_VASKEY (or MOOLRE_PUBLIC_KEY / MOOLRE_API_KEY)",
    );
  }

  const headers: Record<string, string> = {
    "X-API-USER": user,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  let keyKind = "none";
  if (vaskey) {
    headers["X-API-VASKEY"] = vaskey;
    keyKind = "VASKEY";
  } else if (privkey) {
    headers["X-API-KEY"] = privkey;
    keyKind = "KEY";
  } else if (pubkey) {
    headers["X-API-PUBKEY"] = pubkey;
    keyKind = "PUBKEY";
  }
  if (pubkey && !headers["X-API-PUBKEY"]) {
    headers["X-API-PUBKEY"] = pubkey;
  }
  if (account) {
    headers["X-API-ACCOUNT"] = account;
  }

  if (env.MOOLRE_SMS_SCENARIO) {
    headers["X-Scenario-Key"] = env.MOOLRE_SMS_SCENARIO;
  }

  console.log("[moolre-sms] POST", ENDPOINT, {
    user: mask(user),
    keyKind,
    key: mask(vaskey || privkey || pubkey),
    pubkey: mask(pubkey),
    account: mask(account),
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
    throw new Error(`Moolre SMS failed (code=${code}): ${msg} [using ${keyKind}]`);
  }
  return json;
}

export const moolreSms: SmsAdapter = {
  provider: "moolre",

  async send(msg: SmsMessage): Promise<SmsResult> {
    try {
      const json = await call({
        type: 1,
        senderid: env.MOOLRE_SMS_SENDER_ID,
        messages: [
          {
            recipient: normalize(msg.to),
            message: msg.body,
            ref: msg.ref ?? "",
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
      const json = await call({
        type: 1,
        senderid: env.MOOLRE_SMS_SENDER_ID,
        messages: msgs.map((m) => ({
          recipient: normalize(m.to),
          message: m.body,
          ref: m.ref ?? "",
        })),
      });
      // The docs don't fully specify per-message results; on status=1 we treat
      // every message as queued for delivery and assign the same message id
      // (or the individual ref) for tracking.
      const batchId = json.data?.messageid ?? json.data?.id ?? "";
      return {
        ok: true,
        provider: "moolre",
        results: msgs.map((m) => ({
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
