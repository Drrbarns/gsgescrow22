"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, X, AlertTriangle, ShieldCheck } from "lucide-react";
import {
  approvePayout,
  rejectPayout,
  overridePayoutNameMismatch,
} from "@/lib/actions/transaction";

export function ApprovePayoutButtons({
  payoutId,
  approverId,
  isSuperadmin = false,
}: {
  payoutId: string;
  approverId: string;
  isSuperadmin?: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [nameIssue, setNameIssue] = useState<{
    expected: string;
    actual: string;
  } | null>(null);
  const [overrideReason, setOverrideReason] = useState("");

  if (nameIssue) {
    return (
      <div className="flex flex-col gap-2 w-full max-w-sm rounded-md border border-[#f1bbb6] bg-[#fbe5e3] p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle size={14} className="text-[var(--danger)] mt-0.5 shrink-0" />
          <div className="text-xs">
            <p className="font-semibold text-[var(--danger)]">Name mismatch — blocked</p>
            <p className="mt-1 text-[var(--danger)]/80 leading-snug">
              PSP says <span className="font-semibold">{nameIssue.actual}</span> · queued for{" "}
              <span className="font-semibold">{nameIssue.expected}</span>
            </p>
          </div>
        </div>
        {isSuperadmin ? (
          <>
            <Input
              placeholder="Override reason (6+ chars)"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="mt-1"
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => setNameIssue(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                loading={isPending}
                onClick={() =>
                  startTransition(async () => {
                    const r = await overridePayoutNameMismatch(payoutId, overrideReason);
                    if (!r.ok) {
                      toast.error(r.error ?? "Override failed");
                      return;
                    }
                    toast.success("Override recorded — approving payout");
                    const r2 = await approvePayout(payoutId, approverId);
                    if (!r2.ok) {
                      toast.error(r2.error ?? "Approve failed after override");
                      return;
                    }
                    setNameIssue(null);
                    router.refresh();
                  })
                }
              >
                <ShieldCheck size={14} /> Override & approve
              </Button>
            </div>
          </>
        ) : (
          <p className="text-[11px] text-[var(--danger)]/80">
            Only a superadmin can override this block. Escalate.
          </p>
        )}
      </div>
    );
  }

  if (showReject) {
    return (
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <Input
          placeholder="Reason for rejection"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowReject(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="danger"
            loading={isPending}
            onClick={() =>
              startTransition(async () => {
                if (!reason) {
                  toast.error("Please give a reason");
                  return;
                }
                const r = await rejectPayout(payoutId, approverId, reason);
                if (!r.ok) toast.error(r.error ?? "Failed");
                else toast.success("Payout rejected");
                setShowReject(false);
              })
            }
          >
            Confirm reject
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setShowReject(true)}
      >
        <X size={14} /> Reject
      </Button>
      <Button
        size="sm"
        loading={isPending}
        onClick={() =>
          startTransition(async () => {
            const r = await approvePayout(payoutId, approverId);
            if (!r.ok) {
              if (r.needsNameOverride && r.pspAccountName && r.queuedName) {
                setNameIssue({ expected: r.queuedName, actual: r.pspAccountName });
                return;
              }
              toast.error(r.error ?? "Failed");
              return;
            }
            if (r.needsSecondApprover) {
              toast.success("First approval recorded — a second approver must confirm.");
            } else {
              toast.success("Payout approved and sent");
            }
            router.refresh();
          })
        }
      >
        <CheckCircle2 size={14} /> Approve
      </Button>
    </div>
  );
}
