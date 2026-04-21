"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { RefreshCw, FileText, Mail, ClipboardCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { runReconOnDemand } from "@/lib/actions/admin-recon";
import type { ReconReport } from "@/lib/recon/daily";
import { relativeTime } from "@/lib/utils";

const SEV_TONE: Record<string, "info" | "warning" | "danger"> = {
  info: "info",
  warning: "warning",
  critical: "danger",
};

export function ReconCard({ initial }: { initial: ReconReport | null }) {
  const [report, setReport] = useState<ReconReport | null>(initial);
  const [isPending, startTransition] = useTransition();

  function run(email: boolean) {
    startTransition(async () => {
      const r = await runReconOnDemand({ email });
      if (!r.ok || !r.report) {
        toast.error(r.error ?? "Recon failed");
        return;
      }
      setReport(r.report);
      toast.success(
        r.report.findings.length === 0
          ? "All clean — no findings"
          : `Recon done · ${r.report.findings.length} finding${r.report.findings.length === 1 ? "" : "s"}`,
      );
    });
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-[var(--primary)]">
          <ClipboardCheck size={18} />
          <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
            Daily reconciliation
          </h2>
          {report?.summary.critical && report.summary.critical > 0 ? (
            <Badge tone="danger" dot>
              {report.summary.critical} critical
            </Badge>
          ) : report ? (
            <Badge tone="success" dot>
              Clean
            </Badge>
          ) : (
            <Badge tone="neutral">Not yet run</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" loading={isPending} onClick={() => run(true)}>
            <Mail size={14} /> Run &amp; email
          </Button>
          <Button size="sm" variant="secondary" loading={isPending} onClick={() => run(false)}>
            <RefreshCw size={14} /> Run now
          </Button>
        </div>
      </div>

      {!report ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          The cron runs every morning at 06:00 GMT (<span className="font-mono">0 6 * * *</span>).
          It diffs the last 24 hours of transactions, payouts, and webhook logs against PSP
          ground-truth and emails the delta. Click <span className="font-medium">Run now</span> to trigger it on demand.
        </p>
      ) : (
        <>
          <div className="mt-5 grid sm:grid-cols-4 gap-3 text-sm">
            <Stat label="Critical" value={report.summary.critical} tone="danger" />
            <Stat label="Warnings" value={report.summary.warning} tone="warning" />
            <Stat label="Info" value={report.summary.info} tone="neutral" />
            <Stat
              label="Duration"
              value={`${report.durationMs}ms`}
              tone="neutral"
              text
            />
          </div>
          <p className="mt-3 text-xs text-[var(--muted)]">
            Covered {report.counts.transactionsScanned} transactions ·{" "}
            {report.counts.payoutsScanned} payouts · {report.counts.webhooksScanned} webhooks ·
            ran {relativeTime(report.ranAt)}
          </p>

          {report.findings.length > 0 && (
            <div className="mt-5 border-t border-[var(--border)] pt-4">
              <p className="text-xs uppercase tracking-[0.14em] font-semibold text-[var(--muted)] mb-2 flex items-center gap-1">
                <FileText size={12} /> Findings
              </p>
              <ul className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {report.findings.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-md border border-[var(--border)] p-2.5 text-sm"
                  >
                    <Badge tone={SEV_TONE[f.severity] ?? "neutral"} dot>
                      {f.severity}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs text-[var(--muted)]">{f.ref}</p>
                      <p className="mt-0.5 text-[13px] leading-snug">{f.message}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function Stat({
  label,
  value,
  tone,
  text,
}: {
  label: string;
  value: number | string;
  tone: "danger" | "warning" | "neutral";
  text?: boolean;
}) {
  const toneClass =
    tone === "danger"
      ? "text-[var(--danger)]"
      : tone === "warning"
        ? "text-[#7a5410]"
        : "text-[var(--foreground)]";
  return (
    <div className="rounded-md border border-[var(--border)] p-3">
      <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[var(--muted)]">
        {label}
      </p>
      <p className={`mt-1 font-display ${text ? "text-base font-semibold" : "text-2xl font-bold"} ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}
