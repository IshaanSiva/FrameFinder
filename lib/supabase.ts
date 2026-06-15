import "server-only";
import { createClient } from "@supabase/supabase-js";

// Validation is intentionally inside the function, not at module level.
// Module-level throws prevent the entire API route from loading, which turns
// any missing env var into a 500 on every request. Lazy validation means only
// the Supabase save fails; the analysis response still returns normally.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Missing env: NEXT_PUBLIC_SUPABASE_URL");
  if (!key) throw new Error("Missing env: SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}
