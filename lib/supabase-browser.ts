import { createBrowserClient } from "@supabase/ssr";

// Browser-side Supabase client — uses the anon key and manages auth state
// via cookies. Safe to call from "use client" components. Returns a singleton
// per URL+key pair, so multiple calls are cheap.
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
