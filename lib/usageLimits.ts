import "server-only";
import { createServiceClient } from "./supabase";

interface PlanLimits {
  analysisPerPeriod: number;
  periodDays: number;
  wordLimit: number;
  pdfPerPeriod: number | null; // null = unlimited
  pdfPageLimit: number;
}

export type Plan = "free" | "pro";

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    analysisPerPeriod: 3,
    periodDays: 7,
    wordLimit: 1200,
    pdfPerPeriod: 1,
    pdfPageLimit: 10,
  },
  pro: {
    analysisPerPeriod: 100,
    periodDays: 30,
    wordLimit: 10000,
    pdfPerPeriod: null,
    pdfPageLimit: 50,
  },
};

export interface UsageProfile {
  user_id: string;
  plan: Plan;
  analysis_count: number;
  pdf_upload_count: number;
  usage_period_start: string;
  created_at: string;
  updated_at: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  trial_used: boolean;
  trial_started_at: string | null;
  trial_ended_at: string | null;
}

export async function getOrCreateProfile(userId: string): Promise<UsageProfile> {
  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return existing as UsageProfile;

  const { data: created, error } = await supabase
    .from("profiles")
    .insert({ user_id: userId })
    .select("*")
    .single();

  if (error) throw new Error(`Failed to create profile: ${error.message}`);
  return created as UsageProfile;
}

export async function resetUsageIfNeeded(profile: UsageProfile): Promise<UsageProfile> {
  const { periodDays } = PLAN_LIMITS[profile.plan];
  const daysSince =
    (Date.now() - new Date(profile.usage_period_start).getTime()) / 86_400_000;

  if (daysSince < periodDays) return profile;

  const supabase = createServiceClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      analysis_count: 0,
      pdf_upload_count: 0,
      usage_period_start: now,
      updated_at: now,
    })
    .eq("user_id", profile.user_id)
    .select("*")
    .single();

  if (error) throw new Error(`Failed to reset usage: ${error.message}`);
  return data as UsageProfile;
}

export interface LimitViolation {
  errorCode: string;
  message: string;
}

export async function checkUsageLimits(
  userId: string,
  wordCount: number,
  sourceType: string,
  pdfPageCount?: number,
): Promise<{ ok: true; profile: UsageProfile } | { ok: false; violation: LimitViolation }> {
  let profile = await getOrCreateProfile(userId);
  profile = await resetUsageIfNeeded(profile);
  const limits = PLAN_LIMITS[profile.plan];
  const isPdf = sourceType === "pdf";

  if (profile.analysis_count >= limits.analysisPerPeriod) {
    return {
      ok: false,
      violation: {
        errorCode: profile.plan === "free" ? "WEEKLY_ANALYSIS_LIMIT" : "MONTHLY_ANALYSIS_LIMIT",
        message:
          profile.plan === "free"
            ? "You've used your 3 free analyses this week."
            : "Student Pro includes 100 analyses per month.",
      },
    };
  }

  if (!isPdf && wordCount > limits.wordLimit) {
    return {
      ok: false,
      violation: {
        errorCode: "WORD_LIMIT",
        message:
          profile.plan === "free"
            ? "Free scans are limited to 1,200 words."
            : "Student Pro scans are limited to 10,000 words.",
      },
    };
  }

  if (isPdf) {
    const pdfLimit = limits.pdfPerPeriod;
    if (pdfLimit !== null && profile.pdf_upload_count >= pdfLimit) {
      return {
        ok: false,
        violation: {
          errorCode: "PDF_WEEKLY_LIMIT",
          message: "Free PDF uploads are limited to 1 per week.",
        },
      };
    }

    if (pdfPageCount !== undefined && pdfPageCount > limits.pdfPageLimit) {
      return {
        ok: false,
        violation: {
          errorCode: "PDF_PAGE_LIMIT",
          message:
            profile.plan === "free"
              ? "Free PDFs are limited to 10 pages."
              : "Student Pro includes up to 50-page PDFs.",
        },
      };
    }
  }

  return { ok: true, profile };
}

export async function incrementUsage(userId: string, sourceType: string): Promise<void> {
  try {
    const profile = await getOrCreateProfile(userId);
    const supabase = createServiceClient();
    const isPdf = sourceType === "pdf";

    const updates: Record<string, unknown> = {
      analysis_count: profile.analysis_count + 1,
      updated_at: new Date().toISOString(),
    };
    if (isPdf) updates.pdf_upload_count = profile.pdf_upload_count + 1;

    await supabase.from("profiles").update(updates).eq("user_id", userId);
  } catch (err) {
    console.error("[usageLimits] incrementUsage failed:", err);
  }
}
