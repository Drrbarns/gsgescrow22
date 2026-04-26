"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { getSupabaseBrowser } from "@/lib/auth/supabase-browser";
import { normalizeGhPhone } from "@/lib/utils";
import { Mail, KeyRound, Phone, Lock, User } from "lucide-react";
import { postLoginRedirect } from "@/lib/actions/post-login";
import { ensureProfile } from "@/lib/actions/ensure-profile";
import { claimPendingSellerOrders } from "@/lib/actions/claim-orders";

type Mode = "phone" | "password" | "email";

/**
 * Unified login / signup form.
 *
 *   - `mode="login"` (default): phone OTP, email+password sign-in, email OTP fallback.
 *   - `mode="signup"`: phone OTP (creates user), email+password sign-up (creates user),
 *     email OTP (creates user on first verify). Display-name capture is optional but
 *     stored on the profile on next server render.
 */
export function LoginForm({
  next,
  authLive,
  intent = "login",
  claimToken = null,
}: {
  next?: string;
  authLive: boolean;
  intent?: "login" | "signup";
  claimToken?: string | null;
}) {
  const [tab, setTab] = useState<Mode>("phone");
  const [step, setStep] = useState<"enter" | "code">("enter");

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [normalisedPhone, setNormalisedPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const isSignup = intent === "signup";

  function resetCode() {
    setStep("enter");
    setCode("");
  }

  async function finishAndRedirect() {
    // If the user arrived via a claim link, attach the order(s) BEFORE
    // redirecting so the Hub they land on already has the row.
    if (claimToken) {
      try {
        const res = await claimPendingSellerOrders({ token: claimToken });
        if (res.ok && res.claimed > 0) {
          toast.success(
            res.claimed === 1
              ? "Order claimed and added to your Hub"
              : `${res.claimed} orders added to your Hub`,
          );
        }
      } catch {
        // Best-effort. ensureProfile also runs a sweep, so nothing's lost.
      }
    }
    // Prefer going straight to the claimed transaction if we have one.
    if (claimToken) {
      try {
        const payload = JSON.parse(
          atob(claimToken.split(".")[0].replace(/-/g, "+").replace(/_/g, "/") + "=="),
        ) as { ref?: string };
        if (payload.ref) {
          window.location.assign(`/hub/transactions/${payload.ref}`);
          return;
        }
      } catch {
        // fall through to default redirect
      }
    }
    window.location.assign(await postLoginRedirect(next));
  }

  function requireSb() {
    if (!authLive) {
      toast.error(
        "Supabase env vars missing — check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
      );
      return null;
    }
    const sb = getSupabaseBrowser();
    if (!sb) {
      toast.error("Supabase client failed to initialise — check browser console");
      return null;
    }
    return sb;
  }

  async function handlePhoneStart() {
    const sb = requireSb();
    if (!sb) return;
    const norm = normalizeGhPhone(phone);
    if (!norm) {
      toast.error("Enter a valid Ghana phone (024xxxxxxx or +233…)");
      return;
    }
    setBusy(true);
    try {
      const { error } = await sb.auth.signInWithOtp({
        phone: norm,
        options: {
          shouldCreateUser: true,
          data: displayName ? { display_name: displayName } : undefined,
        },
      });
      if (error) throw error;
      setNormalisedPhone(norm);
      toast.success("Code sent — check your SMS");
      setStep("code");
    } catch (err) {
      toast.error((err as Error).message ?? "Couldn't send code");
    } finally {
      setBusy(false);
    }
  }

  async function handlePhoneVerify() {
    const sb = requireSb();
    if (!sb) return;
    if (code.length < 6) {
      toast.error("Enter the 6-digit code from your SMS");
      return;
    }
    setBusy(true);
    try {
      const { error } = await sb.auth.verifyOtp({
        phone: normalisedPhone,
        token: code,
        type: "sms",
      });
      if (error) throw error;
      // Backfill profile.display_name on first login if we have one.
      if (displayName) {
        await ensureProfile({ displayName }).catch(() => {});
      } else {
        await ensureProfile({}).catch(() => {});
      }
      toast.success(isSignup ? "Welcome to SBBS" : "Signed in");
      await finishAndRedirect();
    } catch (err) {
      toast.error((err as Error).message ?? "Invalid code");
    } finally {
      setBusy(false);
    }
  }

  async function handleEmailStart() {
    const sb = requireSb();
    if (!sb) return;
    if (!email) {
      toast.error("Enter your email");
      return;
    }
    setBusy(true);
    try {
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: displayName ? { display_name: displayName } : undefined,
        },
      });
      if (error) throw error;
      toast.success("Check your email for a 6-digit code");
      setStep("code");
    } catch (err) {
      toast.error((err as Error).message ?? "Couldn't send code");
    } finally {
      setBusy(false);
    }
  }

  async function handleEmailVerify() {
    const sb = requireSb();
    if (!sb) return;
    setBusy(true);
    try {
      const { error } = await sb.auth.verifyOtp({ email, token: code, type: "email" });
      if (error) throw error;
      await ensureProfile({ displayName: displayName || undefined }).catch(() => {});
      toast.success(isSignup ? "Welcome to SBBS" : "Signed in");
      await finishAndRedirect();
    } catch (err) {
      toast.error((err as Error).message ?? "Invalid code");
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordSubmit() {
    const sb = requireSb();
    if (!sb) return;
    if (!email || !password) {
      toast.error("Enter email and password");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setBusy(true);
    try {
      if (isSignup) {
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: {
            data: displayName ? { display_name: displayName } : undefined,
          },
        });
        if (error) throw error;
        // If email confirmation is disabled the user is signed in immediately.
        // Otherwise tell them to check their email.
        if (data.session) {
          await ensureProfile({ displayName: displayName || undefined }).catch(() => {});
          toast.success("Account created");
          await finishAndRedirect();
        } else {
          toast.success(
            "Check your email — confirm it to finish signing up, then come back here to log in.",
          );
        }
      } else {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await ensureProfile({}).catch(() => {});
        toast.success("Signed in");
        await finishAndRedirect();
      }
    } catch (err) {
      toast.error((err as Error).message ?? "Invalid credentials");
    } finally {
      setBusy(false);
    }
  }

  function onPrimaryClick() {
    if (step === "code") {
      if (tab === "phone") handlePhoneVerify();
      else handleEmailVerify();
      return;
    }
    if (tab === "phone") handlePhoneStart();
    else if (tab === "email") handleEmailStart();
    else handlePasswordSubmit();
  }

  const primaryCta = (() => {
    if (step === "code") return "Verify and continue";
    if (tab === "phone") return "Send SMS code";
    if (tab === "email") return "Send email code";
    return isSignup ? "Create account" : "Sign in";
  })();

  return (
    <div className="space-y-4">
      {step === "enter" && (
        <div className="flex items-center gap-1 rounded-full border border-[var(--border-strong)] bg-[var(--surface-muted)]/60 p-1 text-xs font-semibold">
          <TabButton active={tab === "phone"} onClick={() => setTab("phone")}>
            <Phone size={12} /> Phone
          </TabButton>
          <TabButton active={tab === "password"} onClick={() => setTab("password")}>
            <Lock size={12} /> Password
          </TabButton>
          <TabButton active={tab === "email"} onClick={() => setTab("email")}>
            <Mail size={12} /> Email code
          </TabButton>
        </div>
      )}

      {step === "enter" && isSignup && (
        <div>
          <Label htmlFor="displayName">Name (optional)</Label>
          <Input
            id="displayName"
            type="text"
            placeholder="Ama Asare"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            leading={<User size={14} />}
          />
          <p className="text-[11px] text-[var(--muted)] mt-1">
            Shown to buyers on your public profile. You can change it anytime.
          </p>
        </div>
      )}

      {step === "enter" && tab === "phone" && (
        <div>
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            placeholder="024 000 0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onPrimaryClick();
              }
            }}
            leading={<Phone size={14} />}
            autoFocus={!isSignup}
          />
          <p className="text-[11px] text-[var(--muted)] mt-1">
            We&rsquo;ll text you a 6-digit code. Ghana numbers only for now.
          </p>
        </div>
      )}

      {step === "enter" && tab === "email" && (
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onPrimaryClick();
              }
            }}
            leading={<Mail size={14} />}
            autoFocus={!isSignup}
          />
        </div>
      )}

      {step === "enter" && tab === "password" && (
        <>
          <div>
            <Label htmlFor="pw-email">Email</Label>
            <Input
              id="pw-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leading={<Mail size={14} />}
              autoFocus={!isSignup}
            />
          </div>
          <div>
            <Label htmlFor="pw">
              Password {isSignup && <span className="text-[var(--muted)] font-normal">(8+ characters)</span>}
            </Label>
            <Input
              id="pw"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onPrimaryClick();
                }
              }}
              leading={<Lock size={14} />}
            />
          </div>
        </>
      )}

      {step === "code" && (
        <>
          <div className="rounded-md bg-[var(--surface-muted)] text-sm text-[var(--muted)] p-3">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-[var(--foreground)]">
              {tab === "phone" ? normalisedPhone : email}
            </span>
          </div>
          <div>
            <Label htmlFor="code">6-digit code</Label>
            <Input
              id="code"
              inputMode="numeric"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onPrimaryClick();
                }
              }}
              leading={<KeyRound size={14} />}
              autoFocus
              className="font-mono tracking-[0.4em] text-center"
            />
          </div>
        </>
      )}

      <Button
        type="button"
        className="w-full"
        loading={busy}
        onClick={(e) => {
          e.preventDefault();
          onPrimaryClick();
        }}
      >
        {primaryCta}
      </Button>

      {step === "code" && (
        <button
          type="button"
          className="block w-full text-center text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
          onClick={resetCode}
        >
          Use a different {tab === "phone" ? "number" : "email"}
        </button>
      )}

      {!authLive && (
        <p className="text-center text-xs text-[var(--danger)]">
          Auth isn&rsquo;t configured. Add Supabase env vars and restart.
        </p>
      )}
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex-1 inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 transition-colors " +
        (active
          ? "bg-[var(--surface)] text-[var(--foreground)] shadow-[0_1px_0_#00000010]"
          : "text-[var(--muted)] hover:text-[var(--foreground)]")
      }
    >
      {children}
    </button>
  );
}
