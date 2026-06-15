import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createStripeClient } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase";
import { getOrCreateProfile } from "@/lib/usageLimits";

const dev = process.env.NODE_ENV === "development";

export async function POST() {
  const authClient = await createServerSupabaseClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId    = user.id;
  const userEmail = user.email ?? undefined;

  const priceId = process.env.STRIPE_STUDENT_PRO_PRICE_ID;
  if (!priceId) {
    console.error("[stripe/checkout] Missing env: STRIPE_STUDENT_PRO_PRICE_ID");
    return Response.json({ error: "Missing STRIPE_STUDENT_PRO_PRICE_ID" }, { status: 500 });
  }

  try {
    const stripe   = createStripeClient();
    const supabase = createServiceClient();
    const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    // Profile load is a hard requirement — we need trial_used to determine whether
    // to include a trial. A null/failed profile would silently skip the trial and
    // charge the user immediately, so we surface the error instead.
    let profile;
    try {
      profile = await getOrCreateProfile(userId);
    } catch (err) {
      console.error("[stripe/checkout] Failed to load profile — cannot determine trial eligibility:", err);
      return Response.json(
        { error: "Failed to load account data. Please try again." },
        { status: 500 },
      );
    }

    if (dev) {
      console.log(`[stripe/checkout] userId:            ${userId}`);
      console.log(`[stripe/checkout] profile.trial_used: ${profile.trial_used}`);
      console.log(`[stripe/checkout] profile.plan:        ${profile.plan}`);
    }

    // If the user is already Pro and has a Stripe customer, send them to the portal
    // instead of letting them open a second subscription checkout.
    if (profile.plan === "pro" && profile.stripe_customer_id) {
      if (dev) console.log(`[stripe/checkout] User already Pro — redirecting to portal`);
      try {
        const portalSession = await stripe.billingPortal.sessions.create({
          customer:   profile.stripe_customer_id,
          return_url: `${appUrl}/pricing`,
        });
        return Response.json({ url: portalSession.url });
      } catch (portalErr) {
        console.error("[stripe/checkout] Could not redirect existing Pro to portal, proceeding to checkout:", portalErr);
      }
    }

    // Get or pre-create a Stripe customer so checkout can pre-fill the email.
    // Persisting it immediately means the webhook sees the same customer ID rather
    // than Stripe silently creating a second one.
    let customerId = profile.stripe_customer_id ?? undefined;

    if (!customerId) {
      try {
        const customer = await stripe.customers.create({
          ...(userEmail ? { email: userEmail } : {}),
          metadata: { userId, authProvider: "supabase" },
        });
        customerId = customer.id;

        await supabase
          .from("profiles")
          .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
          .eq("user_id", userId);

        console.log(`[stripe/checkout] Created Stripe customer ${customerId} for user ${userId}`);
      } catch (custErr) {
        console.error("[stripe/checkout] Failed to pre-create Stripe customer (Stripe will create one at checkout):", custErr);
        customerId = undefined;
      }
    }

    // Only exclude the trial if we can positively confirm trial_used === true.
    // false, undefined, or null all mean the user is still eligible for their one trial.
    const trialIncluded = profile.trial_used !== true;

    if (dev) {
      console.log(`[stripe/checkout] trialIncluded:       ${trialIncluded}`);
      console.log(`[stripe/checkout] trial_period_days:   ${trialIncluded ? "7 (trial — $0 today)" : "none (charges immediately)"}`);
      console.log(`[stripe/checkout] priceId prefix:      ${priceId.slice(0, 18)}...`);
      console.log(`[stripe/checkout] customerId:          ${customerId ?? "none (Stripe will create)"}`);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      ...(customerId ? { customer: customerId } : {}),
      metadata: {
        userId:        userId,
        authProvider:  "supabase",
        plan:          "pro",
        trialIncluded: trialIncluded ? "true" : "false",
      },
      subscription_data: {
        ...(trialIncluded ? { trial_period_days: 7 } : {}),
        metadata: {
          userId:        userId,
          authProvider:  "supabase",
          plan:          "pro",
          trialIncluded: trialIncluded ? "true" : "false",
        },
      },
      success_url: `${appUrl}/analyzer?upgraded=true`,
      cancel_url:  `${appUrl}/pricing?canceled=true`,
    });

    if (dev) {
      console.log(`[stripe/checkout] Session created: ${session.id}`);
      console.log(`[stripe/checkout] Session has trial_period_days: ${trialIncluded}`);
    }

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/checkout] Error:", err);
    return Response.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
