"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { reviewKyc } from "@/lib/actions/kyc";
import { CheckCircle2, X } from "lucide-react";

export function KycReviewActions({ submissionId }: { submissionId: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="secondary"
        loading={isPending}
        onClick={() =>
          startTransition(async () => {
            const r = await reviewKyc(submissionId, "rejected", "Manual rejection");
            if (!r.ok) toast.error(r.error ?? "Failed");
            else toast.success("Rejected");
          })
        }
      >
        <X size={14} /> Reject
      </Button>
      <Button
        size="sm"
        loading={isPending}
        onClick={() =>
          startTransition(async () => {
            const r = await reviewKyc(submissionId, "approved");
            if (!r.ok) toast.error(r.error ?? "Failed");
            else toast.success("Approved");
          })
        }
      >
        <CheckCircle2 size={14} /> Approve
      </Button>
    </div>
  );
}
