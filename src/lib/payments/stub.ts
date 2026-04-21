import type { PspAdapter } from "./types";

export const stubPsp: PspAdapter = {
  provider: "stub",
  async initCharge(input) {
    const accessCode = `stub_${Math.random().toString(36).slice(2, 10)}`;
    return {
      authorizationUrl: `${input.callbackUrl}?reference=${input.reference}&stub=1`,
      accessCode,
      reference: input.reference,
      raw: { stub: true },
    };
  },
  async verifyCharge(reference) {
    return {
      reference,
      status: "succeeded",
      amount: 0,
      channel: "stub",
      paidAt: new Date(),
      raw: { stub: true },
    };
  },
  verifyWebhookSignature() {
    return true;
  },
  parseWebhookEvent(rawBody) {
    const parsed = JSON.parse(rawBody);
    return { event: parsed.event ?? "stub.event", data: parsed.data ?? parsed };
  },
  async createRecipient(input) {
    return {
      recipientCode: `RCP_stub_${input.phone.slice(-4)}`,
      raw: { stub: true },
    };
  },
  async initTransfer(input) {
    return {
      transferCode: `TRF_stub_${input.reference}`,
      status: "succeeded",
      raw: { stub: true },
    };
  },
  async refund(input) {
    return {
      refundReference: `REF_stub_${input.paymentReference}`,
      status: "succeeded",
      raw: { stub: true },
    };
  },
};
