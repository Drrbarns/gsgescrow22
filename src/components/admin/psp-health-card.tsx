"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Zap, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { runPspHealthCheck } from "@/lib/actions/admin-psp-health";
import type { HealthCheckResult } from "@/lib/payments/types";

export function PspHealthCard({
  provider,
  initial,
}: {
  provider: string;
  initial?: HealthCheckResult;
}) {
  const [result, setResult] = useState<HealthCheckResult | null>(initial ?? null);
  const [isPending, startTransition] = useTransition();

  function run() {
    startTransition(async () => {
      const r = await runPspHealthCheck();
      if (!r.ok || !r.result) {
        toast.error(r.error ?? "Failed");
        return;
      }
      setResult(r.result);
      toast.success(r.result.ok ? "All checks passing" : "Health check reported issues");
    });
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-[var(--primary)]" />
          <h2 className="font-display text-lg font-semibold">PSP live health</h2>
          <Badge tone="neutral" className="capitalize">
            {provider}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          {result && (
            <Badge tone={result.ok ? "success" : "danger"} dot>
              {result.ok ? "Healthy" : "Degraded"}
            </Badge>
          )}
          <Button size="sm" variant="secondary" loading={isPending} onClick={run}>
            <RefreshCw size={14} /> Run check
          </Button>
        </div>
      </div>

      {!result ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          Click <span className="font-medium">Run check</span> to exercise the PSP&rsquo;s auth, name-validate and
          status endpoints with benign probes. No charges, no transfers.
        </p>
      ) : (
        <>
          <div className="mt-5 grid sm:grid-cols-3 gap-3">
            {result.checks.map((c) => (
              <div
                key={c.name}
                className="rounded-md border border-[var(--border)] p-3 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[var(--muted)]">
                    {c.name}
                  </span>
                  {c.ok ? (
                    <CheckCircle2 size={14} className="text-[var(--primary)]" />
                  ) : (
                    <XCircle size={14} className="text-[var(--danger)]" />
                  )}
                </div>
                <p className="font-mono text-sm">{c.latencyMs}ms</p>
                {c.detail && (
                  <p className="text-[11px] text-[var(--muted)] leading-snug line-clamp-3">
                    {c.detail}
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-[var(--muted)]">
            Total round-trip {result.latencyMs}ms · checked {new Date(result.checkedAt).toLocaleString()}
          </p>
        </>
      )}
    </Card>
  );
}
