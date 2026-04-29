"use client";

import { getSupabaseBrowser } from "@/lib/auth/supabase-browser";

export function LogoutButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="block w-full text-left"
      onClick={async () => {
        try {
          const sb = getSupabaseBrowser();
          if (sb) await sb.auth.signOut();
        } finally {
          window.location.assign("/");
        }
      }}
    >
      {children}
    </button>
  );
}
