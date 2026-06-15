import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log(`[/api/analyses/${id}] GET start — id: ${id}`);

  const authClient = await createServerSupabaseClient();
  const { data: { user } } = await authClient.auth.getUser();
  const userId = user?.id ?? null;
  console.log(`[/api/analyses/${id}] userId exists: ${!!userId}`);

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();

    // --- Primary query: include input_text if the column exists ---
    console.log(`[/api/analyses/${id}] querying Supabase (with input_text)`);
    const { data, error } = await supabase
      .from("analyses")
      .select("id, topic, source_type, word_count, created_at, used_mock_fallback, report, input_text")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error(
        `[/api/analyses/${id}] Supabase error — code: ${error.code}, msg: ${error.message}`
      );
    }
    console.log(`[/api/analyses/${id}] primary row found: ${!!data}`);

    // PGRST116 = .single() returned zero rows — genuine not-found.
    // Any other error (e.g. PGRST204 / 42703 = column doesn't exist yet) →
    // retry without input_text so the report still loads.
    if (error && error.code !== "PGRST116") {
      console.warn(
        `[/api/analyses/${id}] non-row-missing error (${error.code}), retrying without input_text`
      );

      const { data: retryData, error: retryError } = await supabase
        .from("analyses")
        .select("id, topic, source_type, word_count, created_at, used_mock_fallback, report")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (retryError) {
        console.error(`[/api/analyses/${id}] retry error — code: ${retryError.code}, msg: ${retryError.message}`);
      }
      console.log(`[/api/analyses/${id}] retry row found: ${!!retryData}`);

      if (retryError || !retryData) {
        return Response.json({ error: "Not found" }, { status: 404 });
      }

      // Return the row with input_text explicitly null so the client always
      // receives a consistent shape.
      return Response.json({ analysis: { ...retryData, input_text: null } });
    }

    // Row genuinely doesn't exist (PGRST116) or data is missing for another reason.
    if (error || !data) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ analysis: data });
  } catch (err) {
    console.error(`[/api/analyses/${id}] unexpected exception:`, err);
    return Response.json({ error: "Failed to fetch analysis" }, { status: 500 });
  }
}
