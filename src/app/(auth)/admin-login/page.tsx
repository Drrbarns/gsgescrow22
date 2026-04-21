import { Lock } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { isAuthLive } from "@/lib/env";

export const metadata = { title: "Admin sign-in" };

export default function AdminLoginPage() {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
        <Lock size={12} /> Staff portal
      </div>
      <h1 className="font-display text-3xl font-bold tracking-tight mt-4">
        SBBS admin sign-in.
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Restricted to staff. Sign in with your SBBS phone number for an SMS
        code, or email + password. All actions on the admin control plane
        are audit-logged with your identity.
      </p>
      <div className="mt-8">
        <LoginForm next="/admin" authLive={isAuthLive} />
      </div>
    </div>
  );
}
