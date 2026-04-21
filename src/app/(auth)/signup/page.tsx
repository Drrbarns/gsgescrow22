import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { isAuthLive } from "@/lib/env";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">
        Create your SBBS account.
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Pick how you want to sign up — phone gets an SMS code, email + password if you prefer a
        classic login, or email code if you don&rsquo;t want a password.
      </p>
      <div className="mt-8">
        <LoginForm authLive={isAuthLive} intent="signup" />
      </div>
      <p className="mt-6 text-sm text-[var(--muted)] text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--primary)] font-medium underline">
          Log in
        </Link>
      </p>
      <p className="mt-4 text-xs text-[var(--muted)] text-center">
        By signing up you agree to our{" "}
        <Link href="/terms" className="underline">Terms</Link> and{" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </div>
  );
}
