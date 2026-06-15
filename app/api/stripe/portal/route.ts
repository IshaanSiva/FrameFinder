import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createStripeClient } from "@/lib/stripe";
import { getOrCreateProfile } from "@/lib/usageLimits";

export const runtime = "nodejs";

export async function POST() {
  const authClient = await createServerSupabaseClient();
  const { data: { user } } = await authClient.auth.getUser();
  const userId = user?.id ?? null;

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let profile;
  try {
    profile = await getOrCreateProfile(userId);
  } catch (err) {
    console.error("[stripe/portal] Failed to fetch profile:", err);
    return Response.json({ error: "Failed to fetch account profile" }, { status: 500 });
  }

  if (!profile.stripe_customer_id) {
    return Response.json(
      { error: "No Stripe customer found for this account." },
      { status: 404 },
    );
  }

  try {
    const stripe = createStripeClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${appUrl}/pricing`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/portal] Error creating portal session:", err);
    return Response.json({ error: "Failed to create portal session" }, { status: 500 });
  }
}
