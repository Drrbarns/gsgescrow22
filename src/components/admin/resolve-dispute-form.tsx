"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { resolveDispute } from "@/lib/actions/dispute";
import { ghsToPesewas, formatGhs } from "@/lib/utils";

export function ResolveDisputeForm({
  disputeId,
  totalCharged,
}: {
  disputeId: string;
  totalCharged: number;
}) {
  const [resolution, setResolution] = useState<"resolved_buyer" | "resolved_seller" | "partial">(
    "resolved_buyer",
  );
  const [refundCedis, setRefundCedis] = useState(((totalCharged / 100).toFixed(2)));
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const r = await resolveDispute({
            disputeId,
            resolution,
            refundAmount: resolution === "resolved_seller" ? undefined : ghsToPesewas(refundCedis),
            notes,
          });
          if (!r.ok) toast.error(r.error ?? "Failed");
          else toast.success("Resolved. Notifications sent.");
        });
      }}
      className="mt-4 space-y-3"
    >
      <div className="space-y-2 text-sm">
        {(["resolved_buyer", "partial", "resolved_seller"] as const).map((opt) => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="resolution"
              value={opt}
              checked={resolution === opt}
              onChange={() => setResolution(opt)}
            />
            <span>
              {opt === "resolved_buyer"
                ? "Refund buyer in full"
                : opt === "partial"
                  ? "Partial refund"
                  : "Release to seller"}
            </span>
          </label>
        ))}
      </div>
      {resolution !== "resolved_seller" && (
        <div>
          <Label>Refund amount</Label>
          <Input
            inputMode="decimal"
            leading="₵"
            value={refundCedis}
            onChange={(e) => setRefundCedis(e.target.value)}
          />
          <p className="text-xs text-[var(--muted)] mt-1">Total charged: {formatGhs(totalCharged)}</p>
        </div>
      )}
      <div>
        <Label>Internal notes</Label>
        <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <Button type="submit" loading={isPending} className="w-full">
        Resolve dispute
      </Button>
    </form>
  );
}
