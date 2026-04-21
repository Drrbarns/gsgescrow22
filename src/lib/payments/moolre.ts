import crypto from "node:crypto";
import { env } from "../env";
import type {
  CreateRecipientInput,
  CreateRecipientResult,
  HealthCheckResult,
  InitChargeInput,
  InitChargeResult,
  InitTransferInput,
  InitTransferResult,
  MomoNetwork,
  PspAdapter,
  RefundInput,
  RefundResult,
  ValidateAccountNameInput,
  ValidateAccountNameResult,
  VerifyChargeResult,
} from "./types";

const BASE = "https://api.moolre.com";

type KeyType = "public" | "private";

interface MoolreEnvelope<T = unknown> {
  status: number | string;
  code?: string;
  message?: string | string[];
  data?: T;
}

async function moolre<T>(
  path: string,
  init: { method: "POST" | "GET"; body?: unknown; keyType: KeyType },
): Promise<MoolreEnvelope<T>> {
  const user = env.MOOLRE_USERNAME;
  if (!user) throw new Error("Moolre not configured: MOOLRE_USERNAME missing");

  const headers: Record<string, string> = {
    "X-API-USER": user,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (init.keyType === "private") {
    if (!env.MOOLRE_API_KEY) throw new Error("Moolre private API key missing");
    headers["X-API-KEY"] = env.MOOLRE_API_KEY;
  } else {
    if (!env.MOOLRE_PUBLIC_KEY) throw new Error("Moolre public key missing");
    headers["X-API-PUBKEY"] = env.MOOLRE_PUBLIC_KEY;
  }

  const res = await fetch(`${BASE}${path}`, {
    method: init.method,
    headers,
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  const text = await res.text();
  let json: MoolreEnvelope<T>;
  try {
    json = text ? (JSON.parse(text) as MoolreEnvelope<T>) : { status: 0 };
  } catch {
    throw new Error(`Moolre ${path} returned non-JSON: ${res.status} ${res.statusText}`);
  }

  const status = typeof json.status === "string" ? Number(json.status) : json.status;
  if (!res.ok || status === 0) {
    const msg = Array.isArray(json.message) ? json.message.join(" · ") : json.message;
    throw new Error(`Moolre ${path} failed (code=${json.code ?? res.status}): ${msg ?? res.statusText}`);
  }

  return json;
}

function toCedis(pesewas: number): string {
  return (pesewas / 100).toFixed(2);
}

function fromCedis(amount: string | number | undefined): number {
  if (amount === undefined || amount === null) return 0;
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}

/**
 * Moolre channel mapping.
 * 1 = MTN, 6 = Telecel (Vodafone), 7 = AT (AirtelTigo), 2 = Instant Bank Transfer.
 */
function channelFor(network: MomoNetwork | undefined): number {
  switch ((network ?? "MTN").toUpperCase()) {
    case "MTN":
      return 1;
    case "VOD":
    case "TELECEL":
    case "VODAFONE":
      return 6;
    case "ATL":
    case "AT":
    case "AIRTELTIGO":
      return 7;
    case "BANK":
    case "IBT":
      return 2;
    default:
      return 1;
  }
}

function normalizeLocal(phone: string): string {
  return phone.replace(/^\+233/, "0").replace(/\D/g, "");
}

/**
 * Moolre returns txstatus:
 *   1 = Successful
 *   0 = Pending
 *   2 = Failed
 *   3 = Unknown (treat as pending — NEVER assume failure unless 2)
 */
function mapTxStatus(n: number | string | undefined): "succeeded" | "pending" | "failed" {
  const s = typeof n === "string" ? Number(n) : n;
  if (s === 1) return "succeeded";
  if (s === 2) return "failed";
  return "pending";
}

export const moolrePsp: PspAdapter = {
  provider: "moolre",

  async initCharge(input: InitChargeInput): Promise<InitChargeResult> {
    if (!env.MOOLRE_ACCOUNT_NUMBER) throw new Error("MOOLRE_ACCOUNT_NUMBER missing");
    const webhookUrl = `${env.NEXT_PUBLIC_APP_URL}/api/webhooks/moolre`;
    const json = await moolre<{ authorization_url: string; reference: string }>(
      "/embed/link",
      {
        method: "POST",
        keyType: "public",
        body: {
          type: 1,
          amount: toCedis(input.amount),
          email: env.MOOLRE_BUSINESS_EMAIL || input.email,
          externalref: input.reference,
          callback: webhookUrl,
          redirect: input.callbackUrl,
          reusable: "0",
          currency: "GHS",
          accountnumber: env.MOOLRE_ACCOUNT_NUMBER,
          metadata: input.metadata ?? {},
        },
      },
    );

    const url = json.data?.authorization_url;
    const moolreRef = json.data?.reference ?? input.reference;
    if (!url) throw new Error("Moolre did not return an authorization_url");
    return {
      authorizationUrl: url,
      accessCode: moolreRef,
      reference: input.reference,
      raw: json,
    };
  },

  async verifyCharge(reference: string): Promise<VerifyChargeResult> {
    if (!env.MOOLRE_ACCOUNT_NUMBER) throw new Error("MOOLRE_ACCOUNT_NUMBER missing");
    try {
      const json = await moolre<{
        txstatus: number | string;
        amount?: string;
        transactionid?: string;
        externalref?: string;
        receivername?: string;
      }>("/open/transact/status", {
        method: "POST",
        keyType: "private",
        body: {
          type: 1,
          externalref: reference,
          accountnumber: env.MOOLRE_ACCOUNT_NUMBER,
        },
      });
      return {
        reference: json.data?.externalref ?? reference,
        status: mapTxStatus(json.data?.txstatus),
        amount: fromCedis(json.data?.amount),
        channel: "mobile_money",
        raw: json,
      };
    } catch {
      // Status endpoint may not exist in all plans; default to pending. Webhook
      // is the source of truth — the sweep will reconcile on the next tick.
      return { reference, status: "pending", amount: 0 };
    }
  },

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = env.MOOLRE_WEBHOOK_SECRET;
    // If no signing secret has been provisioned, accept webhooks but mark them
    // unverified so the webhook handler stores that fact and ops can audit.
    if (!secret) return true;
    if (!signature) return false;
    const hash = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    try {
      return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
    } catch {
      return false;
    }
  },

  parseWebhookEvent(rawBody: string) {
    const parsed = JSON.parse(rawBody) as {
      event?: string;
      code?: string;
      type?: string;
      data?: Record<string, unknown>;
      [k: string]: unknown;
    };
    const event =
      parsed.event ??
      parsed.type ??
      parsed.code ??
      "transaction.updated";
    const data = parsed.data ?? (parsed as Record<string, unknown>);
    return { event, data };
  },

  async createRecipient(input: CreateRecipientInput): Promise<CreateRecipientResult> {
    // Moolre transfers take the receiver phone directly — no pre-registration.
    // The recipientCode carries the local-format phone so executeTransfer can
    // reuse it verbatim.
    return {
      recipientCode: normalizeLocal(input.phone),
      raw: { moolreInline: true, network: input.network, phone: input.phone },
    };
  },

  async initTransfer(input: InitTransferInput): Promise<InitTransferResult> {
    if (!env.MOOLRE_ACCOUNT_NUMBER) throw new Error("MOOLRE_ACCOUNT_NUMBER missing");
    const receiver = normalizeLocal(input.phone ?? input.recipientCode);
    const channel = channelFor(input.network);

    const json = await moolre<{
      txstatus: number | string;
      transactionid: string;
      externalref: string;
      receiver: string;
      receivername: string;
      amount: string;
      fee?: string;
      networkfee?: string;
      amountfee?: string;
    }>("/open/transact/transfer", {
      method: "POST",
      keyType: "private",
      body: {
        type: 1,
        channel,
        currency: "GHS",
        amount: toCedis(input.amount),
        receiver,
        externalref: input.reference,
        reference: input.reason ?? `SBBS payout ${input.reference}`,
        accountnumber: env.MOOLRE_ACCOUNT_NUMBER,
      },
    });

    const status = mapTxStatus(json.data?.txstatus);
    return {
      transferCode: json.data?.transactionid ?? input.reference,
      status,
      raw: json,
    };
  },

  /**
   * Moolre does not ship a native refund endpoint (payments are terminal once
   * collected). We implement refunds as a reverse transfer back to the buyer's
   * MoMo/bank account — which is what actually happens in practice. The
   * dispute resolution action threads the buyer's phone + network through so
   * this works end-to-end.
   */
  async validateAccountName(input: ValidateAccountNameInput): Promise<ValidateAccountNameResult> {
    if (!env.MOOLRE_ACCOUNT_NUMBER) throw new Error("MOOLRE_ACCOUNT_NUMBER missing");
    try {
      const json = await moolre<{ accountname?: string; receivername?: string }>(
        "/open/transact/validate",
        {
          method: "POST",
          keyType: "private",
          body: {
            type: 1,
            channel: channelFor(input.network),
            currency: "GHS",
            accountnumber: env.MOOLRE_ACCOUNT_NUMBER,
            receiver: normalizeLocal(input.phone),
            sublistid: input.sublistId ?? "",
          },
        },
      );
      const name = json.data?.accountname ?? json.data?.receivername;
      return { ok: Boolean(name), accountName: name, raw: json };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  },

  async healthCheck(): Promise<HealthCheckResult> {
    const start = performance.now();
    const checkedAt = new Date().toISOString();
    const checks: HealthCheckResult["checks"] = [];

    // Env presence check — instant, no network.
    const envStart = performance.now();
    const envOk = Boolean(
      env.MOOLRE_USERNAME && env.MOOLRE_PUBLIC_KEY && env.MOOLRE_API_KEY && env.MOOLRE_ACCOUNT_NUMBER,
    );
    checks.push({
      name: "credentials",
      ok: envOk,
      latencyMs: Math.round(performance.now() - envStart),
      detail: envOk
        ? "All four Moolre credentials present"
        : "Missing one or more: MOOLRE_USERNAME / MOOLRE_PUBLIC_KEY / MOOLRE_API_KEY / MOOLRE_ACCOUNT_NUMBER",
    });

    // Validate probe — hits /open/transact/validate. Uses a benign number so
    // we don't trigger fraud systems. 400-shape responses still mean the
    // endpoint + auth is live; we only fail on network/auth errors.
    if (envOk) {
      const validateStart = performance.now();
      try {
        await moolre("/open/transact/validate", {
          method: "POST",
          keyType: "private",
          body: {
            type: 1,
            channel: 1,
            currency: "GHS",
            accountnumber: env.MOOLRE_ACCOUNT_NUMBER,
            receiver: "0200000000",
            sublistid: "",
          },
        });
        checks.push({
          name: "validate",
          ok: true,
          latencyMs: Math.round(performance.now() - validateStart),
          detail: "POST /open/transact/validate responding",
        });
      } catch (err) {
        const msg = (err as Error).message;
        const isAuthIssue = /401|unauthor|forbidden|api-key|api-user/i.test(msg);
        const isValidationErr = /invalid|account|receiver|channel|recipient/i.test(msg);
        checks.push({
          name: "validate",
          ok: !isAuthIssue && isValidationErr,
          latencyMs: Math.round(performance.now() - validateStart),
          detail: msg,
        });
      }

      // Status probe — hits /open/transact/status with a fake ref. A proper
      // "not found" style error means the endpoint is live and our private
      // key is good.
      const statusStart = performance.now();
      try {
        await moolre("/open/transact/status", {
          method: "POST",
          keyType: "private",
          body: {
            type: 1,
            externalref: `healthcheck-${Date.now()}`,
            accountnumber: env.MOOLRE_ACCOUNT_NUMBER,
          },
        });
        checks.push({
          name: "status",
          ok: true,
          latencyMs: Math.round(performance.now() - statusStart),
          detail: "POST /open/transact/status responding",
        });
      } catch (err) {
        const msg = (err as Error).message;
        const isAuthIssue = /401|unauthor|forbidden|api-key|api-user/i.test(msg);
        const isLookupMiss = /not found|no (record|transaction)|invalid (externalref|reference)/i.test(
          msg,
        );
        checks.push({
          name: "status",
          ok: !isAuthIssue && isLookupMiss,
          latencyMs: Math.round(performance.now() - statusStart),
          detail: msg,
        });
      }
    }

    const overallOk = checks.every((c) => c.ok);
    return {
      ok: overallOk,
      latencyMs: Math.round(performance.now() - start),
      checks,
      checkedAt,
    };
  },

  dashboardUrl({ kind, pspRef }) {
    const base = env.MOOLRE_DASHBOARD_BASE;
    if (!base) return null;
    const trimmed = base.replace(/\/$/, "");
    return kind === "charge"
      ? `${trimmed}/payments?ref=${encodeURIComponent(pspRef)}`
      : `${trimmed}/transfers?ref=${encodeURIComponent(pspRef)}`;
  },

  async refund(input: RefundInput): Promise<RefundResult> {
    if (!input.amount) {
      throw new Error("Moolre refunds require an explicit amount (pesewas).");
    }
    if (!input.buyerPhone) {
      throw new Error(
        "Moolre refunds require the buyer's phone + network — call psp.refund({ buyerPhone, buyerNetwork }) or handle manually.",
      );
    }
    const ref = `REF-${input.paymentReference}-${Math.random().toString(36).slice(2, 8)}`;
    const result = await moolrePsp.initTransfer({
      reference: ref,
      amount: input.amount,
      recipientCode: normalizeLocal(input.buyerPhone),
      phone: input.buyerPhone,
      network: input.buyerNetwork,
      reason: input.reason ?? `SBBS refund for ${input.paymentReference}`,
    });
    return {
      refundReference: result.transferCode,
      status: result.status,
      raw: result.raw,
    };
  },
};
