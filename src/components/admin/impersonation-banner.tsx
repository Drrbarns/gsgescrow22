import { getActiveImpersonation, stopImpersonation } from "@/lib/actions/admin-users";
import { Eye } from "lucide-react";

async function endImpersonationAction() {
  "use server";
  await stopImpersonation();
}

export async function ImpersonationBanner() {
  const imp = await getActiveImpersonation();
  if (!imp) return null;

  return (
    <form action={endImpersonationAction}>
      <div className="bg-[var(--danger)] text-white px-4 py-2 flex items-center justify-center gap-3 text-sm">
        <Eye size={14} />
        <span>
          Impersonating <strong>{imp.targetEmail}</strong> as {imp.actorEmail} — {imp.reason}
        </span>
        <button
          type="submit"
          className="ml-2 rounded-md bg-white/20 hover:bg-white/30 px-2.5 py-1 text-[12px] font-semibold"
        >
          End impersonation
        </button>
      </div>
    </form>
  );
}
