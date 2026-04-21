"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, XCircle, Sparkles, ShieldCheck } from "lucide-react";
import { moderateListing, setFeatured } from "@/lib/actions/listings";

export function ModerateActions({
  id,
  state,
  featured,
}: {
  id: string;
  state: string;
  featured: boolean;
}) {
  const router = useRouter();
  const [showSuspend, setShowSuspend] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  if (showSuspend) {
    return (
      <div className="flex flex-col gap-2 w-full max-w-xs">
        <Input
          placeholder="Reason for suspension"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={() => setShowSuspend(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="danger"
            loading={isPending}
            onClick={() =>
              startTransition(async () => {
                if (!reason || reason.length < 4) {
                  toast.error("Reason required");
                  return;
                }
                const r = await moderateListing({ id, action: "suspend", reason });
                if (!r.ok) toast.error(r.error ?? "Failed");
                else {
                  toast.success("Suspended");
                  setShowSuspend(false);
                  router.refresh();
                }
              })
            }
          >
            Confirm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        size="sm"
        variant="ghost"
        loading={isPending}
        onClick={() =>
          startTransition(async () => {
            const r = await setFeatured(id, !featured);
            if (!r.ok) toast.error(r.error ?? "Failed");
            else {
              toast.success(featured ? "Unfeatured" : "Featured");
              router.refresh();
            }
          })
        }
        aria-label="Toggle featured"
      >
        <Sparkles size={14} className={featured ? "text-[var(--accent)]" : ""} />
      </Button>
      {state === "pending_review" && (
        <Button
          size="sm"
          loading={isPending}
          onClick={() =>
            startTransition(async () => {
              const r = await moderateListing({ id, action: "approve", reason: "Approved by admin" });
              if (!r.ok) toast.error(r.error ?? "Failed");
              else {
                toast.success("Approved");
                router.refresh();
              }
            })
          }
        >
          <CheckCircle2 size={14} /> Approve
        </Button>
      )}
      {state === "suspended" && (
        <Button
          size="sm"
          variant="secondary"
          loading={isPending}
          onClick={() =>
            startTransition(async () => {
              const r = await moderateListing({ id, action: "reinstate", reason: "Reinstated by admin" });
              if (!r.ok) toast.error(r.error ?? "Failed");
              else {
                toast.success("Reinstated");
                router.refresh();
              }
            })
          }
        >
          <ShieldCheck size={14} /> Reinstate
        </Button>
      )}
      {state !== "suspended" && state !== "archived" && (
        <Button size="sm" variant="ghost" onClick={() => setShowSuspend(true)}>
          <XCircle size={14} /> Suspend
        </Button>
      )}
    </div>
  );
}
