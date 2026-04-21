"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/auth/supabase-browser";

export function LogoutButton({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className="block w-full text-left"
      onClick={async () => {
        const sb = getSupabaseBrowser();
        if (sb) await sb.auth.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      {children}
    </button>
  );
}
