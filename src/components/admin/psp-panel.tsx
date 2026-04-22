"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Check, ExternalLink, RefreshCw, Zap, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  reverifyPayment,
  reverifyPayout,
  forceMarkPaid,
  adminReleaseToPayout,
  adminDispatchQueuedPayout,
} from "@/lib/actions/admin-reverify";

interface Props {
  provider: string;
  txnRef: string;
  paymentPspRef: string | null;
  paymentAuthorizationUrl: string | null;
  paymentState: string | null;
  payout: {
    id: string;
    state: string;
    transferRef: string | null;
  } | null;
  paymentDashboardUrl: string | null;
  payoutDashboardUrl: string | null;
  currentState: string;
  isSuperadmin: boolean;
}

export function PspPanel({
  provider,
  txnRef,
  paymentPspRef,
  paymentAuthorizationUrl,
  paymentState,
  payout,
  paymentDashboardUrl,
  payoutDashboardUrl,
  currentState,
  isSuperadmin,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);
  const canForce = isSuperadmin && currentState === "awaiting_payment";
  const canInitiatePayout =
    isSuperadmin &&
    !payout &&
    ["paid", "dispatched", "delivered", "disputed"].includes(currentState);
  const canDispatchQueued =
    isSuperadmin &&
    !!payout &&
    ["pending_approval", "approved", "failed"].includes(payout.state);

  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
      toast.success("Copied");
    } catch {
      toast.error("Couldn't copy");
    }
  }

  return (
    <Card className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold">PSP cross-reference</h3>
          <p className="text-xs text-[var(--muted)] mt-0.5 capitalize">
            Primary gateway · {provider}
          </p>
        </div>
        <Badge tone="neutral">{provider}</Badge>
      </div>

      <div className="space-y-3">
        <RefRow
          label="Our reference"
          value={txnRef}
          mono
          onCopy={() => copy(txnRef, "ref")}
          copied={copied === "ref"}
        />
        {paymentPspRef && (
          <RefRow
            label="PSP payment reference"
            value={paymentPspRef}
            mono
            onCopy={() => copy(paymentPspRef, "psp")}
            copied={copied === "psp"}
            dashboardUrl={paymentDashboardUrl}
          />
        )}
        {payout?.transferRef && (
          <RefRow
            label="PSP transfer reference"
            value={payout.transferRef}
            mono
            onCopy={() => copy(payout.transferRef!, "transfer")}
            copied={copied === "transfer"}
            dashboardUrl={payoutDashboardUrl}
          />
        )}
        {paymentAuthorizationUrl && (
          <div className="text-xs">
            <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[var(--muted)]">
              Checkout URL
            </p>
            <a
              href={paymentAuthorizationUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-[var(--primary)] underline break-all"
            >
              {paymentAuthorizationUrl}
              <ExternalLink size={11} />
            </a>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-[var(--border)] space-y-2">
        <p className="text-xs uppercase tracking-[0.14em] font-semibold text-[var(--muted)]">
          Re-verify with PSP
        </p>
        <div className="flex flex-col gap-2">
          <Button
            size="sm"
            variant="secondary"
            loading={isPending}
            onClick={() =>
              startTransition(async () => {
                const r = await reverifyPayment(txnRef);
                if (!r.ok) toast.error(r.error ?? "Failed");
                else toast.success(r.message ?? `PSP status: ${r.status}`);
                router.refresh();
              })
            }
          >
            <RefreshCw size={12} /> Re-verify payment
          </Button>
          {payout?.transferRef && (
            <Button
              size="sm"
              variant="secondary"
              loading={isPending}
              onClick={() =>
                startTransition(async () => {
                  const r = await reverifyPayout(payout.id);
                  if (!r.ok) toast.error(r.error ?? "Failed");
                  else toast.success(r.message ?? `Payout status: ${r.status}`);
                  router.refresh();
                })
              }
            >
              <RefreshCw size={12} /> Re-verify payout
            </Button>
          )}
          {paymentState && (
            <p className="text-[11px] text-[var(--muted)]">
              Last known payment state: <span className="font-mono">{paymentState}</span>
            </p>
          )}
        </div>
      </div>

      {(canForce || canInitiatePayout || canDispatchQueued) && (
        <div className="pt-4 border-t border-[var(--border)] space-y-3">
          <p className="text-xs uppercase tracking-[0.14em] font-semibold text-amber-700">
            Break-glass · superadmin only
          </p>

          {canForce && (
            <div className="space-y-2">
              <p className="text-[11px] text-[var(--muted)]">
                Use ONLY when you&rsquo;ve confirmed the payment landed on Moolre&rsquo;s
                dashboard but their status API is unreachable. Audit-logged.
              </p>
              <Button
                size="sm"
                variant="secondary"
                loading={isPending}
                onClick={() => {
                  const reason = window.prompt(
                    "Reason for force-marking paid (min 5 chars). This is audit-logged.",
                    "Verified on Moolre dashboard — status API unreachable",
                  );
                  if (!reason || reason.trim().length < 5) return;
                  startTransition(async () => {
                    const r = await forceMarkPaid(txnRef, reason.trim());
                    if (!r.ok) toast.error(r.error ?? "Failed");
                    else toast.success(r.message ?? "Force-settled");
                    router.refresh();
                  });
                }}
              >
                <Zap size={12} /> Force mark paid
              </Button>
            </div>
          )}

          {canDispatchQueued && (
            <div className="space-y-2">
              <p className="text-[11px] text-[var(--muted)]">
                {payout!.state === "failed"
                  ? "The previous payout attempt failed at the PSP. Retry it via superadmin override — the network will be re-inferred from the payee's phone prefix."
                  : `A payout is already queued (${payout!.state.replace(
                      "_",
                      " ",
                    )}). Dispatch it to the PSP now, bypassing the two-approver queue.`}{" "}
                Audit-logged.
              </p>
              <Button
                size="sm"
                variant="secondary"
                loading={isPending}
                onClick={() => {
                  const reason = window.prompt(
                    payout!.state === "failed"
                      ? "Reason for retrying the failed payout (min 5 chars). Audit-logged."
                      : "Reason for dispatching queued payout without approver sign-off (min 5 chars). Audit-logged.",
                    payout!.state === "failed"
                      ? "Retry after PSP-side fix"
                      : "Approver queue unavailable — superadmin override",
                  );
                  if (!reason || reason.trim().length < 5) return;
                  if (
                    !window.confirm(
                      payout!.state === "failed"
                        ? "Retry the payout to PSP NOW?"
                        : "Dispatch payout to PSP NOW? This bypasses the two-approver rule.",
                    )
                  )
                    return;
                  startTransition(async () => {
                    const r = await adminDispatchQueuedPayout(
                      payout!.id,
                      reason.trim(),
                    );
                    if (!r.ok) toast.error(r.error ?? "Failed");
                    else toast.success(r.message ?? "Payout dispatched");
                    router.refresh();
                  });
                }}
              >
                <Send size={12} />{" "}
                {payout!.state === "failed"
                  ? "Retry payout"
                  : "Send queued payout now"}
              </Button>
            </div>
          )}

          {canInitiatePayout && (
            <div className="space-y-2">
              <p className="text-[11px] text-[var(--muted)]">
                Skip the buyer-confirm + approver queue and dispatch the payout
                to the seller immediately via the PSP. The superadmin is the
                sole approver of record. Fully audit-logged.
              </p>
              <Button
                size="sm"
                variant="secondary"
                loading={isPending}
                onClick={() => {
                  const reason = window.prompt(
                    "Reason for initiating payout without buyer confirmation or approver sign-off (min 5 chars). Audit-logged.",
                    "Buyer confirmed delivery out-of-band",
                  );
                  if (!reason || reason.trim().length < 5) return;
                  if (
                    !window.confirm(
                      "Release funds to the seller NOW? This bypasses buyer confirmation AND the two-approver rule.",
                    )
                  )
                    return;
                  startTransition(async () => {
                    const r = await adminReleaseToPayout(txnRef, reason.trim());
                    if (!r.ok) toast.error(r.error ?? "Failed");
                    else toast.success(r.message ?? "Payout dispatched");
                    router.refresh();
                  });
                }}
              >
                <Send size={12} /> Initiate & send payout
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function RefRow({
  label,
  value,
  mono,
  onCopy,
  copied,
  dashboardUrl,
}: {
  label: string;
  value: string;
  mono?: boolean;
  onCopy: () => void;
  copied: boolean;
  dashboardUrl?: string | null;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[var(--muted)]">
        {label}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <code
          className={
            "flex-1 truncate rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1.5 text-xs " +
            (mono ? "font-mono" : "")
          }
        >
          {value}
        </code>
        <button
          type="button"
          onClick={onCopy}
          className="h-8 w-8 rounded-md border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)] flex items-center justify-center"
          aria-label="Copy"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
        </button>
        {dashboardUrl && (
          <a
            href={dashboardUrl}
            target="_blank"
            rel="noreferrer"
            className="h-8 w-8 rounded-md border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)] flex items-center justify-center"
            aria-label="Open on PSP dashboard"
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
}
