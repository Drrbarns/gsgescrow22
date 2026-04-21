import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Supabase session proxy (formerly middleware.ts in Next.js 14/15).
 *
 * Responsibilities:
 *   1. Call `supabase.auth.getUser()` on every matched request so the
 *      rolling session cookie is refreshed before it expires — without this,
 *      users are silently logged out mid-session on Vercel.
 *   2. Edge-gate `/admin/*` and `/hub/*` — if there's no session, redirect
 *      to /login. Server components still do their own role checks inside.
 *
 * Public routes (marketing, track, badge, api/webhooks, api/cron) are not
 * touched — they must be anonymous-accessible.
 */
export async function proxy(req: NextRequest) {
  const res = NextResponse.next({ request: req });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured yet we cannot refresh anything — let the
  // request through so local dev without .env still works.
  if (!url || !anon) return res;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(toSet) {
        toSet.forEach(({ name, value }) => req.cookies.set(name, value));
        toSet.forEach(({ name, value, options }) =>
          res.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = req.nextUrl;
  const isHub = pathname.startsWith("/hub");
  const isAdmin = pathname.startsWith("/admin") && !pathname.startsWith("/admin-login");

  if ((isHub || isAdmin) && !user) {
    const redirect = req.nextUrl.clone();
    redirect.pathname = isAdmin ? "/admin-login" : "/login";
    redirect.search = "";
    redirect.searchParams.set("next", pathname + (search || ""));
    return NextResponse.redirect(redirect);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match everything except:
     *   - _next/static, _next/image (build assets)
     *   - favicon, icons, OpenGraph images
     *   - api/webhooks/* (external providers can't present a session cookie)
     *   - api/cron/*     (Vercel cron uses the CRON_SECRET bearer)
     *   - api/track/*    (public delivery-code lookup)
     *   - api/badge/*    (public trust badge)
     *   - api/health     (uptime monitor)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|opengraph-image|api/webhooks|api/cron|api/track|api/badge|api/health).*)",
  ],
};
