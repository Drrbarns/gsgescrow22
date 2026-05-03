import crypto from "node:crypto";
import { env } from "../env";
import type {
  CreateRecipientInput,
  CreateRecipientResult,
  InitChargeInput,
  InitChargeResult,
  InitTransferInput,
  InitTransferResult,
  PspAdapter,
  RefundInput,
  RefundResult,
  VerifyChargeResult,
} from "./types";

const BASE = "https://api.paystack.co";

async function ps<T>(path: string, init?: RequestInit): Promise<T> {
  const key = env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error("Paystack is not configured. Set PAYSTACK_SECRET_KEY.");
  }
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || (json && json.status === false)) {
    const msg = (json && (json.message || json.error)) || res.statusText;
    throw new Error(`Paystack ${path} failed: ${msg}`);
  }
  return json as T;
}

export const paystack: PspAdapter = {
  provider: "paystack",

  async initCharge(input: InitChargeInput): Promise<InitChargeResult> {
    const body: Record<string, unknown> = {
      reference: input.reference,
      amount: input.amount,
      email: input.email,
      currency: "GHS",
      callback_url: input.callbackUrl,
      metadata: input.metadata ?? {},
    };
    if (input.channels?.length) {
      body.channels = input.channels;
    } else {
      body.channels = ["card", "mobile_money", "bank_transfer"];
    }
    const json = await ps<{
      data: { authorization_url: string; access_code: string; reference: string };
    }>("/transaction/initialize", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return {
      authorizationUrl: json.data.authorization_url,
      accessCode: json.data.access_code,
      reference: json.data.reference,
      raw: json,
    };
  },

  async verifyCharge(reference: string): Promise<VerifyChargeResult> {
    const json = await ps<{
      data: {
        status: string;
        amount: number;
        channel: string;
        paid_at?: string;
        reference: string;
      };
    }>(`/transaction/verify/${encodeURIComponent(reference)}`);
    const map: Record<string, "succeeded" | "pending" | "failed"> = {
      success: "succeeded",
      pending: "pending",
      failed: "failed",
      abandoned: "failed",
      reversed: "failed",
    };
    return {
      reference: json.data.reference,
      status: map[json.data.status] ?? "failed",
      amount: json.data.amount,
      channel: json.data.channel,
      paidAt: json.data.paid_at ? new Date(json.data.paid_at) : undefined,
      raw: json,
    };
  },

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const key = env.PAYSTACK_SECRET_KEY ?? env.PAYSTACK_WEBHOOK_SECRET;
    if (!key || !signature) return false;
    const hash = crypto.createHmac("sha512", key).update(rawBody).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  },

  parseWebhookEvent(rawBody: string) {
    const parsed = JSON.parse(rawBody) as { event: string; data: unknown };
    return { event: parsed.event, data: parsed.data };
  },

  async createRecipient(input: CreateRecipientInput): Promise<CreateRecipientResult> {
    const bankCode =
      input.network === "MTN" ? "MTN" : input.network === "VOD" ? "VOD" : "ATL";
    const json = await ps<{ data: { recipient_code: string } }>(
      "/transferrecipient",
      {
        method: "POST",
        body: JSON.stringify({
          type: "mobile_money",
          name: input.name,
          account_number: input.phone,
          bank_code: bankCode,
          currency: "GHS",
        }),
      },
    );
    return { recipientCode: json.data.recipient_code, raw: json };
  },

  async initTransfer(input: InitTransferInput): Promise<InitTransferResult> {
    const json = await ps<{ data: { transfer_code: string; status: string } }>(
      "/transfer",
      {
        method: "POST",
        body: JSON.stringify({
          source: "balance",
          reason: input.reason ?? "SBBS payout",
          amount: input.amount,
          recipient: input.recipientCode,
          reference: input.reference,
          currency: "GHS",
        }),
      },
    );
    const map: Record<string, "pending" | "succeeded" | "failed"> = {
      success: "succeeded",
      pending: "pending",
      otp: "pending",
      reversed: "failed",
      failed: "failed",
    };
    return {
      transferCode: json.data.transfer_code,
      status: map[json.data.status] ?? "pending",
      raw: json,
    };
  },

  async refund(input: RefundInput): Promise<RefundResult> {
    const json = await ps<{ data: { id: number; status: string } }>(`/refund`, {
      method: "POST",
      body: JSON.stringify({
        transaction: input.paymentReference,
        amount: input.amount,
        merchant_note: input.reason ?? "SBBS dispute refund",
      }),
    });
    const map: Record<string, "pending" | "succeeded" | "failed"> = {
      pending: "pending",
      processed: "succeeded",
      processing: "pending",
      failed: "failed",
    };
    return {
      refundReference: String(json.data.id),
      status: map[json.data.status] ?? "pending",
      raw: json,
    };
  },
};
