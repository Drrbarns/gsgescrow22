"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/auth/supabase-browser";

export interface RealtimeEvent {
  table: string;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  row: Record<string, unknown>;
  oldRow?: Record<string, unknown>;
  receivedAt: string;
}

/**
 * Subscribes to Supabase Realtime for the tables the admin dashboard cares
 * about. Returns the latest event + a rolling buffer so the UI can animate
 * deltas without refetching. Falls back to null when the Supabase browser
 * client isn't configured.
 *
 * RLS + the "admin all" policies ensure subscribers only receive rows they
 * are allowed to read \u2014 no cross-tenant leaks.
 */
export function useAdminRealtime(opts: {
  tables?: Array<"transactions" | "payouts" | "alerts" | "transaction_events" | "listings" | "sms_log">;
  bufferSize?: number;
} = {}) {
  const tables = opts.tables ?? [
    "transactions",
    "payouts",
    "alerts",
    "transaction_events",
  ];
  const bufferSize = opts.bufferSize ?? 30;
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const sb = getSupabaseBrowser();
    if (!sb) return;

    const channel = sb.channel("admin-live");
    for (const table of tables) {
      (channel as unknown as { on: (...args: unknown[]) => typeof channel }).on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload: {
          eventType: "INSERT" | "UPDATE" | "DELETE";
          new: Record<string, unknown>;
          old: Record<string, unknown>;
        }) => {
          const evt: RealtimeEvent = {
            table,
            eventType: payload.eventType,
            row: payload.new ?? payload.old ?? {},
            oldRow: payload.old,
            receivedAt: new Date().toISOString(),
          };
          setEvents((prev) => [evt, ...prev].slice(0, bufferSize));
        },
      );
    }
    channel.subscribe((status: string) => {
      setConnected(status === "SUBSCRIBED");
    });

    return () => {
      sb.removeChannel(channel);
    };
  }, [JSON.stringify(tables), bufferSize]);

  return { events, connected };
}
