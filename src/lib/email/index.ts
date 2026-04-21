import { Resend } from "resend";
import { env, isEmailLive } from "@/lib/env";
import { formatGhs } from "@/lib/utils";
import type { TxnState } from "@/lib/state/transaction";
import { stateLabel } from "@/lib/state/transaction";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!isEmailLive) return null;
  if (_resend) return _resend;
  _resend = new Resend(env.RESEND_API_KEY);
  return _resend;
}

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
  tags?: { name: string; value: string }[];
}

export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; id?: string; error?: string }> {
  const r = getResend();
  if (!r) {
    console.log(`[email:stub] -> ${args.to}: ${args.subject}`);
    return { ok: true, id: `stub_${Date.now()}` };
  }
  try {
    const res = await r.emails.send({
      from: env.RESEND_FROM,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text ?? htmlToText(args.html),
      tags: args.tags,
    });
    if ("error" in res && res.error) {
      return { ok: false, error: res.error.message };
    }
    return { ok: true, id: res.data?.id };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+\n/g, "\n")
    .trim();
}

const baseStyle = `
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,sans-serif;line-height:1.55;color:#0c1410;background:#fbfaf6;margin:0;padding:0}
  .wrap{max-width:560px;margin:0 auto;padding:32px 20px}
  .card{background:#fff;border:1px solid #e6e2d7;border-radius:16px;padding:32px;box-shadow:0 1px 0 #00000008,0 12px 40px -24px #0c14102a}
  .brand{display:inline-flex;align-items:center;gap:10px;font-weight:800;font-size:14px;color:#0F5132;letter-spacing:.04em}
  .brand .mark{width:28px;height:28px;border-radius:8px;background:#0F5132;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;position:relative}
  .brand .mark::after{content:"";position:absolute;top:-3px;right:-3px;width:10px;height:10px;border-radius:50%;background:#C89A3A;border:2px solid #fff}
  h1{font-size:26px;line-height:1.15;margin:20px 0 8px;font-weight:800;letter-spacing:-.01em}
  .muted{color:#6b7367;font-size:14px}
  .ref{display:inline-block;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:#f3f1ea;padding:4px 10px;border-radius:6px;font-size:13px;margin-top:8px}
  table{width:100%;margin:20px 0;border-collapse:collapse}
  td{padding:8px 0;border-bottom:1px dashed #e6e2d7;font-size:14px;vertical-align:top}
  td.l{color:#6b7367}
  td.r{text-align:right;font-weight:600}
  .total td{border-top:1px solid #d8d2c2;border-bottom:0;padding-top:14px;font-size:16px;font-weight:800}
  .btn{display:inline-block;background:#0F5132;color:#fff!important;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;margin-top:12px}
  .btn.accent{background:#C89A3A;color:#1a1407!important}
  .pill{display:inline-block;background:#e6f1ea;color:#0F5132;padding:4px 10px;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.14em}
  .pill.warn{background:#fbf2dd;color:#7a5410}
  .pill.danger{background:#fbe5e3;color:#b3241f}
  .footer{color:#6b7367;font-size:12px;text-align:center;margin-top:24px;line-height:1.7}
  .footer a{color:#6b7367;text-decoration:underline}
  .divider{height:1px;background:#e6e2d7;margin:20px 0}
</style>
`;

function layout(inner: string, preheader?: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">${baseStyle}</head><body>
${preheader ? `<div style="display:none;opacity:0;height:0;overflow:hidden">${preheader}</div>` : ""}
<div class="wrap">
  <div class="brand"><span class="mark">SB</span>SELL-SAFE BUY-SAFE</div>
  <div class="card">${inner}</div>
  <p class="footer">SBBS · Built in Accra · Powered by Moolre<br>
  Funds are held by a licensed PSP and released only after verification. Dispute policy at <a href="${env.NEXT_PUBLIC_APP_URL}/disputes-policy">sbbs.gh/disputes-policy</a>.</p>
</div></body></html>`;
}

// --- Templates -----------------------------------------------------------

export function paymentReceivedEmail(args: { ref: string; sellerName: string; itemDescription: string; totalCharged: number }) {
  return layout(
    `<span class="pill">Held safely</span>
     <h1>Your payment is secured.</h1>
     <p class="muted">${args.sellerName} has been notified that funds are held. Once the item is dispatched you'll receive a delivery code.</p>
     <div class="ref">${args.ref}</div>
     <table>
       <tr><td class="l">Item</td><td class="r">${escape(args.itemDescription)}</td></tr>
       <tr class="total"><td class="l">Total held</td><td class="r">${formatGhs(args.totalCharged)}</td></tr>
     </table>
     <a class="btn" href="${env.NEXT_PUBLIC_APP_URL}/hub/transactions/${args.ref}">Open in Hub</a>`,
    `Payment for ${args.ref} held safely`,
  );
}

export function dispatchedEmail(args: { ref: string; deliveryCode: string; itemDescription: string; sellerName: string }) {
  return layout(
    `<span class="pill warn">Out for delivery</span>
     <h1>Your order is on the way.</h1>
     <p class="muted">${args.sellerName} has dispatched <strong>${escape(args.itemDescription)}</strong>. Inspect the goods first, then release the code below to the rider. Only release when you're satisfied.</p>
     <div style="font-family:ui-monospace,Menlo,monospace;font-size:36px;font-weight:800;letter-spacing:.3em;text-align:center;margin:24px 0;padding:16px;background:#f7ecd2;border-radius:12px;color:#7a5410">${args.deliveryCode}</div>
     <p class="muted">If something is wrong at the door, open a dispute from your Hub — don't hand over the code.</p>
     <a class="btn" href="${env.NEXT_PUBLIC_APP_URL}/hub/transactions/${args.ref}">Open in Hub</a>`,
    `Your SBBS order ${args.ref} has been dispatched`,
  );
}

export function releasedEmail(args: { ref: string; sellerName: string; amount: number }) {
  return layout(
    `<span class="pill">Released</span>
     <h1>${args.sellerName}, payout is queued.</h1>
     <p class="muted">The buyer has confirmed delivery. Your payout of <strong>${formatGhs(args.amount)}</strong> is now in our approval queue. You'll be notified again when funds hit your MoMo.</p>
     <div class="ref">${args.ref}</div>
     <a class="btn" href="${env.NEXT_PUBLIC_APP_URL}/hub/transactions/${args.ref}">Open in Hub</a>`,
    `Order ${args.ref} released — payout queued`,
  );
}

export function payoutSentEmail(args: { ref: string; amount: number; phone: string }) {
  return layout(
    `<span class="pill">Payout sent</span>
     <h1>Payout delivered to your MoMo.</h1>
     <p class="muted"><strong>${formatGhs(args.amount)}</strong> has been sent to <strong>${args.phone}</strong> for order ${args.ref}. It should reflect in your wallet within a few minutes.</p>
     <div class="ref">${args.ref}</div>
     <a class="btn" href="${env.NEXT_PUBLIC_APP_URL}/hub/transactions/${args.ref}">Download receipt</a>`,
    `Payout of ${formatGhs(args.amount)} sent`,
  );
}

export function disputeOpenedEmail(args: { ref: string; reason: string; slaDays: number; role: "buyer" | "seller" }) {
  return layout(
    `<span class="pill danger">Dispute opened</span>
     <h1>A dispute was opened on ${args.ref}.</h1>
     <p class="muted">The transaction is frozen. Reason: <strong>${escape(args.reason)}</strong>. Upload your evidence from your Hub. SBBS will review and decide within <strong>${args.slaDays} business days</strong>.</p>
     <a class="btn" href="${env.NEXT_PUBLIC_APP_URL}/hub/transactions/${args.ref}">Upload evidence</a>`,
    `Dispute opened on ${args.ref}`,
  );
}

export function refundIssuedEmail(args: { ref: string; amount: number }) {
  return layout(
    `<span class="pill">Refund issued</span>
     <h1>You've been refunded.</h1>
     <p class="muted">A refund of <strong>${formatGhs(args.amount)}</strong> for order ${args.ref} has been initiated to your original payment method. It will reach your MoMo/card within a few business days.</p>
     <div class="ref">${args.ref}</div>`,
    `Refund of ${formatGhs(args.amount)} issued`,
  );
}

export function stateChangeEmail(args: { ref: string; state: TxnState; itemDescription: string }) {
  return layout(
    `<span class="pill">${stateLabel(args.state)}</span>
     <h1>Order ${args.ref} update</h1>
     <p class="muted">${escape(args.itemDescription)} is now <strong>${stateLabel(args.state)}</strong>.</p>
     <a class="btn" href="${env.NEXT_PUBLIC_APP_URL}/hub/transactions/${args.ref}">Open in Hub</a>`,
    `Order ${args.ref} — ${stateLabel(args.state)}`,
  );
}

function escape(s: string): string {
  return s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]!));
}
