import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { isAuthLive } from "@/lib/env";

export const metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; next?: string }>;
}) {
  const sp = await searchParams;
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Welcome back.
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Log in with your phone for an SMS code, or use email + password.
      </p>
      {sp.reason === "auth-not-configured" && (
        <div className="mt-5 rounded-md border border-[#ecdba8] bg-[#fbf2dd] text-[#7a5410] text-sm p-3">
          Auth is not configured yet. Plug in <code>NEXT_PUBLIC_SUPABASE_URL</code> and the keys to enable login.
        </div>
      )}
      {sp.reason === "forbidden" && (
        <div className="mt-5 rounded-md border border-[#f1bbb6] bg-[#fbe5e3] text-[var(--danger)] text-sm p-3">
          You don&rsquo;t have permission to access that page.
        </div>
      )}
      <div className="mt-8">
        <LoginForm next={sp.next} authLive={isAuthLive} />
      </div>
      <p className="mt-6 text-sm text-[var(--muted)] text-center">
        New to SBBS?{" "}
        <Link href="/signup" className="text-[var(--primary)] font-medium underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
