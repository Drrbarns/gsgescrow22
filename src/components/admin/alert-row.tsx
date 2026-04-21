"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { acknowledgeAlert } from "@/lib/actions/admin-alerts";
import { relativeTime } from "@/lib/utils";

const TONE: Record<string, "info" | "warning" | "danger"> = {
  info: "info",
  warning: "warning",
  critical: "danger",
};

export function AlertRow({
  id,
  severity,
  title,
  message,
  kind,
  createdAt,
  acknowledgedAt,
}: {
  id: string;
  severity: string;
  title: string;
  message: string | null;
  kind: string;
  createdAt: Date;
  acknowledgedAt: Date | null;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <Card className="p-4 flex items-start gap-3 opacity-100">
      <Badge tone={TONE[severity] ?? "info"} dot>{severity}</Badge>
      <div className="flex-1 min-w-0">
        <p className="font-medium break-words">{title}</p>
        {message && <p className="text-sm text-[var(--muted)] mt-1">{message}</p>}
        <p className="text-xs text-[var(--muted)] mt-2">
          {kind} · {relativeTime(createdAt)}
          {acknowledgedAt && <span> · Acknowledged {relativeTime(acknowledgedAt)}</span>}
        </p>
      </div>
      {!acknowledgedAt && (
        <Button
          variant="ghost"
          size="sm"
          loading={isPending}
          onClick={() =>
            startTransition(async () => {
              const r = await acknowledgeAlert(id);
              if (!r.ok) toast.error(r.error ?? "Failed");
              else toast.success("Acknowledged");
            })
          }
        >
          <Check size={14} /> Ack
        </Button>
      )}
    </Card>
  );
}
