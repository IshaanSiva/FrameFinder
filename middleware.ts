import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // IMPORTANT: Do not add any logic between createServerClient and
  // supabase.auth.getUser(). The cookie mutation pattern below is fragile
  // and must stay intact for token refresh to work correctly.
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Validates the session JWT with Supabase Auth server (not just reads cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Stripe webhook — no user session, skip all auth logic.
  if (pathname === "/api/stripe/webhook") {
    return supabaseResponse;
  }

  // Redirect signed-in users away from auth pages.
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/analyzer";
    return NextResponse.redirect(url);
  }

  // Protect /analyzer/* — redirect unauthenticated users to /login.
  if (!user && pathname.startsWith("/analyzer")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // IMPORTANT: always return supabaseResponse, never a bare NextResponse.next().
  // It carries the refreshed session cookie.
  return supabaseResponse;
}

export const config = {
  matcher: [
    // Run on all routes except Next.js internals and static files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
