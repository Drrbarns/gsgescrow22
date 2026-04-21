"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveSettings } from "@/lib/actions/admin-settings";
import type { describeSetting } from "@/lib/settings";
import { formatGhs } from "@/lib/utils";

type Meta = ReturnType<typeof describeSetting>;

export function SettingsForm({
  keys,
  initial,
  meta,
}: {
  keys: string[];
  initial: Record<string, unknown>;
  meta: Record<string, Meta>;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(initial);
  const [reason, setReason] = useState("");
  const [showReason, setShowReason] = useState(false);
  const [isPending, startTransition] = useTransition();

  const dirty = keys.some((k) => JSON.stringify(values[k]) !== JSON.stringify(initial[k]));

  function set(k: string, v: unknown) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  function submit() {
    if (!dirty) return;
    if (!reason || reason.length < 4) {
      toast.error("Enter a reason for the audit log");
      setShowReason(true);
      return;
    }
    startTransition(async () => {
      const diff: Record<string, unknown> = {};
      for (const k of keys) {
        if (JSON.stringify(values[k]) !== JSON.stringify(initial[k])) diff[k] = values[k];
      }
      const r = await saveSettings({ updates: diff, reason });
      if (!r.ok) toast.error(r.error ?? "Failed");
      else toast.success("Saved");
    });
  }

  return (
    <div className="mt-5 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {keys.map((k) => (
          <Field
            key={k}
            name={k}
            meta={meta[k]}
            value={values[k]}
            onChange={(v) => set(k, v)}
          />
        ))}
      </div>

      {showReason && (
        <div>
          <Label>Reason (required for audit log)</Label>
          <Input
            placeholder="e.g. Raising cap after soft launch"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      )}

      {dirty && (
        <div className="flex items-center gap-3 pt-2">
          <Button loading={isPending} onClick={submit}>
            Save changes
          </Button>
          <Button variant="ghost" onClick={() => setValues(initial)}>
            Reset
          </Button>
          <span className="text-xs text-[var(--muted)]">Changes are audit-logged.</span>
        </div>
      )}
    </div>
  );
}

function Field({
  name,
  meta,
  value,
  onChange,
}: {
  name: string;
  meta: Meta;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (meta.kind === "boolean") {
    const on = Boolean(value);
    return (
      <label className="flex items-start justify-between gap-3 cursor-pointer rounded-md p-3 border border-[var(--border)] bg-[var(--surface-muted)]/40">
        <span>
          <span className="text-sm font-medium block">{meta.label}</span>
          {meta.hint && <span className="text-xs text-[var(--muted)] mt-0.5 block">{meta.hint}</span>}
        </span>
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 accent-[var(--primary)]"
          checked={on}
          onChange={(e) => onChange(e.target.checked)}
        />
      </label>
    );
  }

  if (meta.kind === "string") {
    return (
      <div className="sm:col-span-2">
        <Label>{meta.label}</Label>
        <Textarea
          rows={2}
          placeholder={meta.hint}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  if (meta.kind === "emails") {
    const list = (value as string[]) ?? [];
    const asText = list.join(", ");
    return (
      <div className="sm:col-span-2">
        <Label>{meta.label}</Label>
        <Textarea
          rows={2}
          placeholder="email@example.com, another@example.com"
          value={asText}
          onChange={(e) =>
            onChange(
              e.target.value
                .split(",")
                .map((s) => s.trim().toLowerCase())
                .filter((s) => s.length > 0 && s.includes("@")),
            )
          }
        />
        <p className="text-xs text-[var(--muted)] mt-1">
          {meta.hint}
          {list.length > 0 && (
            <>
              {" "}· Currently {list.length} email{list.length === 1 ? "" : "s"} active.
            </>
          )}
        </p>
      </div>
    );
  }

  if (meta.kind === "flags") {
    const flags = (value as Record<string, boolean>) ?? {};
    return (
      <div className="sm:col-span-2 grid sm:grid-cols-2 gap-2">
        {Object.keys(flags).map((f) => (
          <label
            key={f}
            className="flex items-center justify-between gap-3 cursor-pointer rounded-md px-3 py-2.5 border border-[var(--border)] bg-[var(--surface)]"
          >
            <span className="text-sm font-medium capitalize">{f.replace(/_/g, " ")}</span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-[var(--primary)]"
              checked={Boolean(flags[f])}
              onChange={(e) => onChange({ ...flags, [f]: e.target.checked })}
            />
          </label>
        ))}
      </div>
    );
  }

  // numeric / pesewas / bps
  const n = typeof value === "number" ? value : Number(value) || 0;
  return (
    <div>
      <Label>{meta.label}</Label>
      <Input
        inputMode="numeric"
        value={n.toString()}
        onChange={(e) => onChange(Number(e.target.value.replace(/[^0-9]/g, "")))}
      />
      <p className="text-xs text-[var(--muted)] mt-1">
        {meta.hint ? `${meta.hint} · ` : ""}
        {meta.kind === "pesewas"
          ? `= ${formatGhs(n)}`
          : meta.kind === "bps"
            ? `= ${(n / 100).toFixed(2)}%`
            : null}
      </p>
    </div>
  );
}
