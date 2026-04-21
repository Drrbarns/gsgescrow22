"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import { forceMarkPaid } from "@/lib/actions/admin-reverify";

interface Props {
  txnRef: string;
  canForce: boolean;
}

export function TxnRowActions({ txnRef, canForce }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (!canForce) return null;

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        const reason = window.prompt(
          `Reason for force-marking ${txnRef} as paid (min 5 chars). Audit-logged.`,
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
      className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
      title="Force mark paid (superadmin only)"
    >
      <Zap size={11} />
      {isPending ? "..." : "Force paid"}
    </button>
  );
}
