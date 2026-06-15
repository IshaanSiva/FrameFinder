import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  const authClient = await createServerSupabaseClient();
  const { data: { user } } = await authClient.auth.getUser();
  const userId = user?.id ?? null;
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("analyses")
      .select("id, topic, source_type, word_count, created_at, used_mock_fallback")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;
    return Response.json({ analyses: data ?? [] });
  } catch (err) {
    console.error("[/api/analyses] fetch failed:", err);
    return Response.json({ error: "Failed to fetch analyses" }, { status: 500 });
  }
}
