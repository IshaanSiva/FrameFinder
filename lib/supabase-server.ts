import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Server-side Supabase client — reads the session JWT from the request cookie
// and uses the anon key. Use this ONLY to get the authenticated user's ID.
// For database operations (inserts, queries with service role), continue to
// use createServiceClient() from lib/supabase.ts.
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll is called from Server Components where cookies are
            // read-only. Safe to ignore — middleware handles token refresh.
          }
        },
      },
    },
  );
}
