import { env } from "../env";
import type { SmsAdapter, SmsMessage, SmsResult } from "./types";

export const hubtelSms: SmsAdapter = {
  provider: "hubtel",
  async send(msg: SmsMessage): Promise<SmsResult> {
    if (!env.HUBTEL_CLIENT_ID || !env.HUBTEL_CLIENT_SECRET) {
      return { ok: false, error: "Hubtel not configured" };
    }
    const params = new URLSearchParams({
      clientid: env.HUBTEL_CLIENT_ID,
      clientsecret: env.HUBTEL_CLIENT_SECRET,
      from: env.HUBTEL_SENDER_ID,
      to: msg.to,
      content: msg.body,
    });
    try {
      const res = await fetch(`https://smsc.hubtel.com/v1/messages/send?${params}`, {
        method: "GET",
      });
      const json = (await res.json().catch(() => ({}))) as {
        MessageId?: string;
        Status?: number;
      };
      if (!res.ok || (json.Status !== undefined && json.Status !== 0)) {
        return { ok: false, error: `Hubtel responded ${res.status}` };
      }
      return { ok: true, providerMessageId: json.MessageId };
    } catch (err) {
      return { ok: false, error: (err as Error).message };
    }
  },
};
