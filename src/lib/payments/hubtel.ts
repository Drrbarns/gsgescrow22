import crypto from "node:crypto";
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

/**
 * Hubtel adapter is a Phase-5 failover surface. Wire HUBTEL_MERCHANT_ID and
 * HUBTEL_API_KEY in the environment to enable a real implementation.
 * Today this returns deterministic stubs that compose with the same
 * PspAdapter interface as Paystack so routing logic in `getPsp()` is testable.
 */
export const hubtelPsp: PspAdapter = {
  provider: "hubtel",
  async initCharge(input: InitChargeInput): Promise<InitChargeResult> {
    return {
      authorizationUrl: `${input.callbackUrl}?reference=${input.reference}&via=hubtel`,
      accessCode: `hubtel_${input.reference}`,
      reference: input.reference,
      raw: { provider: "hubtel", note: "stubbed adapter" },
    };
  },
  async verifyCharge(reference: string): Promise<VerifyChargeResult> {
    return {
      reference,
      status: "succeeded",
      amount: 0,
      channel: "mobile_money",
      paidAt: new Date(),
      raw: { provider: "hubtel" },
    };
  },
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!signature) return false;
    const hmac = crypto.createHash("sha256").update(rawBody).digest("hex");
    return signature === hmac;
  },
  parseWebhookEvent(rawBody: string) {
    const parsed = JSON.parse(rawBody);
    return { event: parsed.Type ?? parsed.event ?? "hubtel.event", data: parsed.Data ?? parsed.data ?? parsed };
  },
  async createRecipient(input: CreateRecipientInput): Promise<CreateRecipientResult> {
    return { recipientCode: `HBTL_${input.phone.slice(-4)}`, raw: { provider: "hubtel" } };
  },
  async initTransfer(input: InitTransferInput): Promise<InitTransferResult> {
    return {
      transferCode: `HBTLTRF_${input.reference}`,
      status: "succeeded",
      raw: { provider: "hubtel" },
    };
  },
  async refund(input: RefundInput): Promise<RefundResult> {
    return {
      refundReference: `HBTLREF_${input.paymentReference}`,
      status: "succeeded",
      raw: { provider: "hubtel" },
    };
  },
};
