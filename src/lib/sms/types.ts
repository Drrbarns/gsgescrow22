export interface SmsMessage {
  to: string;
  body: string;
  ref?: string;
  kind?: string;
  targetType?: string;
  targetId?: string;
}

export interface SmsResult {
  ok: boolean;
  providerMessageId?: string;
  error?: string;
  provider?: string;
}

export interface SmsBatchResult {
  ok: boolean;
  provider?: string;
  results: SmsResult[];
  error?: string;
}

export interface SmsAdapter {
  provider: "hubtel" | "moolre" | "arkesel" | "stub";
  send(msg: SmsMessage): Promise<SmsResult>;
  /** Optional batch send. Providers that don't support it fall back to N serial sends. */
  sendBatch?(msgs: SmsMessage[]): Promise<SmsBatchResult>;
}
