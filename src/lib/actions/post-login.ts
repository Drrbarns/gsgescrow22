"use server";

import { getCurrentProfile, isAdminRole } from "@/lib/auth/session";

/**
 * Called immediately after a successful client-side sign-in. Returns the best
 * landing page for the current user:
 *   - admin/superadmin/approver → /admin control room
 *   - everyone else             → /hub
 * If the caller passed an explicit `next` (e.g. from a protected-page redirect),
 * honour that instead.
 */
export async function postLoginRedirect(next?: string): Promise<string> {
  if (next && next.startsWith("/") && !next.startsWith("/login")) return next;
  const profile = await getCurrentProfile();
  if (profile && isAdminRole(profile.role)) return "/admin";
  return "/hub";
}
