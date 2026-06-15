import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getOrCreateProfile, resetUsageIfNeeded, PLAN_LIMITS } from "@/lib/usageLimits";

export async function GET() {
  const authClient = await createServerSupabaseClient();
  const { data: { user } } = await authClient.auth.getUser();
  const userId = user?.id ?? null;

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let profile = await getOrCreateProfile(userId);
    profile = await resetUsageIfNeeded(profile);
    const limits = PLAN_LIMITS[profile.plan];

    return Response.json({
      plan: profile.plan,
      analysis_count: profile.analysis_count,
      analysis_limit: limits.analysisPerPeriod,
      pdf_upload_count: profile.pdf_upload_count,
      pdf_upload_limit: limits.pdfPerPeriod,
      usage_period_start: profile.usage_period_start,
      period_type: profile.plan === "free" ? "weekly" : "monthly",
      has_stripe_customer: !!profile.stripe_customer_id,
      subscription_status: profile.subscription_status,
      trial_used: profile.trial_used,
      trial_started_at: profile.trial_started_at,
      trial_ended_at: profile.trial_ended_at,
    });
  } catch (err) {
    console.error("[/api/usage] Error:", err);
    return Response.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}
