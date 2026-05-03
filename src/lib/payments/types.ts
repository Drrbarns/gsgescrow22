export type PspProvider = "paystack" | "moolre" | "hubtel" | "flutterwave" | "stub";

export interface InitChargeInput {
  reference: string;
  amount: number;
  email: string;
  phone?: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
  /** Paystack only: restrict checkout channels (e.g. `["card"]` for card-only). */
  channels?: string[];
}

export interface InitChargeResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
  raw?: unknown;
}

export interface VerifyChargeResult {
  reference: string;
  status: "succeeded" | "pending" | "failed";
  amount: number;
  channel?: string;
  paidAt?: Date;
  raw?: unknown;
}

export interface CreateRecipientInput {
  name: string;
  phone: string;
  network: "MTN" | "VOD" | "ATL" | string;
  email?: string;
}

export interface CreateRecipientResult {
  recipientCode: string;
  raw?: unknown;
}

export type MomoNetwork = "MTN" | "VOD" | "TELECEL" | "ATL" | "AT" | (string & {});

export interface InitTransferInput {
  reference: string;
  amount: number;
  recipientCode: string;
  /** Raw phone number — used by adapters that don't need pre-created recipients (e.g. Moolre). */
  phone?: string;
  /** Mobile money network — used by adapters that route by channel. */
  network?: MomoNetwork;
  reason?: string;
}

export interface InitTransferResult {
  transferCode: string;
  status: "pending" | "succeeded" | "failed";
  raw?: unknown;
}

export interface RefundInput {
  paymentReference: string;
  amount?: number;
  reason?: string;
  /** Buyer payout info — required by adapters that implement refunds as reverse transfers (Moolre). */
  buyerPhone?: string;
  buyerNetwork?: MomoNetwork;
  buyerName?: string;
}

export interface RefundResult {
  refundReference: string;
  status: "pending" | "succeeded" | "failed";
  raw?: unknown;
}

export interface ValidateAccountNameInput {
  phone: string;
  network?: MomoNetwork;
  /** Bank ID when channel is bank transfer. */
  sublistId?: string;
}

export interface ValidateAccountNameResult {
  ok: boolean;
  accountName?: string;
  error?: string;
  raw?: unknown;
}

export interface HealthCheckResult {
  ok: boolean;
  latencyMs: number;
  /** Per-capability detail: auth, validate (name lookup), status (charge status). */
  checks: Array<{
    name: string;
    ok: boolean;
    latencyMs: number;
    detail?: string;
  }>;
  checkedAt: string;
}

export interface PspAdapter {
  provider: PspProvider;
  initCharge(input: InitChargeInput): Promise<InitChargeResult>;
  verifyCharge(reference: string): Promise<VerifyChargeResult>;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
  parseWebhookEvent(rawBody: string): { event: string; data: unknown };
  createRecipient(input: CreateRecipientInput): Promise<CreateRecipientResult>;
  initTransfer(input: InitTransferInput): Promise<InitTransferResult>;
  refund(input: RefundInput): Promise<RefundResult>;
  /**
   * Optional: query the PSP for the real registered account name before we
   * initiate a transfer. Moolre explicitly recommends this. Adapters that
   * don't support name validation can omit it.
   */
  validateAccountName?(input: ValidateAccountNameInput): Promise<ValidateAccountNameResult>;
  /**
   * Optional: deep-link to the PSP dashboard for an operator to cross-check a
   * specific transaction. Return null if unsupported.
   */
  dashboardUrl?(opts: { kind: "charge" | "transfer"; pspRef: string }): string | null;
  /**
   * Optional: exercise the PSP's endpoints with benign requests to verify
   * auth + reachability. No side effects (no charges, no transfers).
   */
  healthCheck?(): Promise<HealthCheckResult>;
}
