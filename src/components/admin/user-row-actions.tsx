"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { MoreHorizontal, Shield, UserX, UserCheck, Eye } from "lucide-react";
import {
  changeUserRole,
  setUserSuspension,
  startImpersonation,
} from "@/lib/actions/admin-users";

type Role = "buyer" | "seller" | "rider" | "admin" | "superadmin" | "approver";

export function UserRowActions({
  userId,
  email,
  currentRole,
  suspended,
}: {
  userId: string;
  email: string | null;
  currentRole: string;
  suspended: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"role" | "suspend" | "impersonate" | null>(null);
  const [role, setRole] = useState<Role>(currentRole as Role);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setMode(null);
    setReason("");
  }

  return (
    <div className="relative inline-block text-left">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setOpen((v) => !v)}
        aria-label="Actions"
      >
        <MoreHorizontal size={16} />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={close} />
          <div className="absolute right-0 mt-2 w-72 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface)] shadow-[var(--shadow-pop)] z-30 overflow-hidden">
            {!mode && (
              <div className="py-1">
                <ActionRow
                  icon={Shield}
                  label="Change role"
                  onClick={() => setMode("role")}
                />
                <ActionRow
                  icon={suspended ? UserCheck : UserX}
                  label={suspended ? "Unsuspend" : "Suspend"}
                  tone={suspended ? "default" : "danger"}
                  onClick={() => setMode("suspend")}
                />
                <ActionRow
                  icon={Eye}
                  label="Impersonate"
                  onClick={() => setMode("impersonate")}
                />
                <div className="px-3 py-2 text-xs text-[var(--muted)] border-t border-[var(--border)]">
                  {email}
                </div>
              </div>
            )}

            {mode === "role" && (
              <div className="p-4">
                <p className="text-sm font-semibold mb-3">Change role</p>
                <Label>New role</Label>
                <select
                  className="h-10 w-full rounded-md border border-[var(--border-strong)] bg-[var(--surface)] px-2 text-sm"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  {(["buyer", "seller", "rider", "approver", "admin", "superadmin"] as Role[]).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <Label className="mt-3">Reason</Label>
                <Input
                  placeholder="Why"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <div className="mt-3 flex gap-2 justify-end">
                  <Button size="sm" variant="ghost" onClick={close}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    loading={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        const r = await changeUserRole({ userId, role, reason });
                        if (!r.ok) toast.error(r.error ?? "Failed");
                        else {
                          toast.success("Role updated");
                          close();
                          router.refresh();
                        }
                      })
                    }
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}

            {mode === "suspend" && (
              <div className="p-4">
                <p className="text-sm font-semibold mb-3">
                  {suspended ? "Unsuspend user" : "Suspend user"}
                </p>
                <Label>Reason (mandatory)</Label>
                <Input value={reason} onChange={(e) => setReason(e.target.value)} />
                <div className="mt-3 flex gap-2 justify-end">
                  <Button size="sm" variant="ghost" onClick={close}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant={suspended ? "primary" : "danger"}
                    loading={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        const r = await setUserSuspension({
                          userId,
                          suspend: !suspended,
                          reason,
                        });
                        if (!r.ok) toast.error(r.error ?? "Failed");
                        else {
                          toast.success(suspended ? "Unsuspended" : "Suspended");
                          close();
                          router.refresh();
                        }
                      })
                    }
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            )}

            {mode === "impersonate" && (
              <div className="p-4">
                <p className="text-sm font-semibold mb-1">Impersonate user</p>
                <p className="text-xs text-[var(--muted)] mb-3">
                  Every impersonation is audit-logged with your identity and reason.
                </p>
                <Label>Reason (mandatory)</Label>
                <Input
                  placeholder="e.g. Investigating ticket #124"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <div className="mt-3 flex gap-2 justify-end">
                  <Button size="sm" variant="ghost" onClick={close}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    loading={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        const r = await startImpersonation({ userId, reason });
                        if (!r.ok) toast.error(r.error ?? "Failed");
                        else {
                          toast.success("Impersonation started");
                          close();
                          router.push("/hub");
                        }
                      })
                    }
                  >
                    Start
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ActionRow({
  icon: Icon,
  label,
  onClick,
  tone = "default",
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex items-center gap-3 w-full px-3 py-2.5 text-sm hover:bg-[var(--surface-muted)] text-left " +
        (tone === "danger" ? "text-[var(--danger)]" : "")
      }
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
