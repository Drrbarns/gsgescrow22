"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env, isAuthLive } from "../env";

let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowser() {
  if (!isAuthLive) return null;
  if (_client) return _client;
  _client = createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return _client;
}
