import type Stripe from "stripe";
import { createStripeClient } from "@/lib/stripe";
import { createServiceClient } from "@/lib/supabase";

export const runtime = "nodejs";

const dev = process.env.NODE_ENV === "development";

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error("[stripe/webhook] Missing stripe-signature or STRIPE_WEBHOOK_SECRET");
    return Response.json({ error: "Missing stripe-signature or webhook secret" }, { status: 400 });
  }

  const rawBody = await request.arrayBuffer();
  const stripe = createStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(Buffer.from(rawBody), sig, webhookSecret);
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err);
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (dev) console.log(`[stripe/webhook] Received: ${event.type} (${event.id})`);

  const supabase = createServiceClient();

  try {
    switch (event.type) {

      // ── 1. CHECKOUT COMPLETED ──────────────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId         = session.metadata?.userId;
        const trialIncluded  = session.metadata?.trialIncluded === "true";
        const customerId     = typeof session.customer     === "string" ? session.customer     : null;
        const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;

        if (dev) {
          console.log(`[stripe/webhook] checkout.session.completed`);
          console.log(`[stripe/webhook]   userId:                  ${userId ?? "MISSING"}`);
          console.log(`[stripe/webhook]   session.trialIncluded:   ${trialIncluded} (from session metadata)`);
          console.log(`[stripe/webhook]   customerId:              ${customerId ?? "none"}`);
          console.log(`[stripe/webhook]   subscriptionId:          ${subscriptionId ?? "none"}`);
        }

        if (!userId) {
          console.warn("[stripe/webhook] checkout.session.completed — userId missing from metadata, cannot upgrade profile");
          break;
        }

        // Retrieve the actual Stripe subscription to get real status and trial timestamps.
        // More reliable than trusting metadata alone — covers the case where metadata is
        // missing or the checkout session object in the webhook is a partial snapshot.
        let sub: Stripe.Subscription | null = null;
        if (subscriptionId) {
          try {
            sub = await stripe.subscriptions.retrieve(subscriptionId);
            if (dev) {
              console.log(`[stripe/webhook]   subscription.status:      ${sub.status}`);
              console.log(`[stripe/webhook]   subscription.trial_start: ${sub.trial_start ?? "null"}`);
              console.log(`[stripe/webhook]   subscription.trial_end:   ${sub.trial_end ?? "null"}`);
            }
          } catch (err) {
            console.error("[stripe/webhook] Failed to retrieve subscription (will fall back to metadata):", err);
          }
        }

        const now = new Date();

        // Authoritative subscription status from Stripe; fall back to metadata guess.
        const subStatus = sub?.status ?? (trialIncluded ? "trialing" : "active");

        // Three independent signals that a trial is active — any one is sufficient.
        // This is the belt-and-suspenders check described in the spec:
        // a) session metadata explicitly says trial was included
        // b) Stripe subscription status is "trialing"
        // c) Stripe subscription has a trial_end timestamp (trial_end > 0)
        const isTrialing =
          trialIncluded ||
          sub?.status === "trialing" ||
          (sub?.trial_end != null && sub.trial_end > 0);

        const upsertData: Record<string, unknown> = {
          user_id:                userId,
          plan:                   "pro",
          stripe_customer_id:     customerId,
          stripe_subscription_id: subscriptionId,
          subscription_status:    subStatus,
          updated_at:             now.toISOString(),
        };

        if (isTrialing) {
          // Prefer real Stripe timestamps; fall back to wall-clock estimates.
          const trialStartAt = sub?.trial_start
            ? new Date(sub.trial_start * 1000)
            : now;
          const trialEndAt = sub?.trial_end
            ? new Date(sub.trial_end * 1000)
            : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

          // trial_used must stay true permanently — never set to false anywhere.
          upsertData.trial_used       = true;
          upsertData.trial_started_at = trialStartAt.toISOString();
          upsertData.trial_ended_at   = trialEndAt.toISOString();
        }

        if (dev) {
          console.log(`[stripe/webhook]   isTrialing:              ${isTrialing}`);
          console.log(`[stripe/webhook]   final payload: plan=${upsertData.plan}, subscription_status=${upsertData.subscription_status}, trial_used=${upsertData.trial_used ?? "(not set — no trial)"}, trial_started_at=${upsertData.trial_started_at ?? "null"}, trial_ended_at=${upsertData.trial_ended_at ?? "null"}`);
        }

        const { error } = await supabase
          .from("profiles")
          .upsert(upsertData, { onConflict: "user_id" });

        if (error) {
          console.error("[stripe/webhook] Supabase upsert error (checkout.session.completed):", error.message);
        } else {
          console.log(`[stripe/webhook] Upgraded user ${userId} to pro${isTrialing ? " (trial — trial_used=true)" : ""}`);
        }
        break;
      }

      // ── 2. SUBSCRIPTION UPDATED ────────────────────────────────────────────
      case "customer.subscription.updated": {
        const sub            = event.data.object as Stripe.Subscription;
        const userId         = sub.metadata?.userId;
        const customerId     = typeof sub.customer === "string" ? sub.customer : null;
        const subscriptionId = sub.id;

        if (dev) {
          console.log(`[stripe/webhook] customer.subscription.updated — status: ${sub.status}`);
          console.log(`[stripe/webhook]   userId:         ${userId ?? "MISSING"}`);
          console.log(`[stripe/webhook]   customerId:     ${customerId ?? "MISSING"}`);
          console.log(`[stripe/webhook]   subscriptionId: ${subscriptionId}`);
        }

        // Determine plan transition:
        // active / trialing → Pro
        // past_due          → keep Pro (grace period — do not immediately downgrade)
        // canceled / unpaid / incomplete_expired → Free
        const plan =
          sub.status === "active"   ||
          sub.status === "trialing" ||
          sub.status === "past_due"
            ? "pro"
            : "free";

        // IMPORTANT: do NOT include trial_used here — it must never be set back to false.
        const updates: Record<string, unknown> = {
          plan,
          subscription_status: sub.status,
          updated_at:          new Date().toISOString(),
        };

        // If the subscription just transitioned to trialing but trial_used was somehow
        // missed during checkout.session.completed, catch it here as a safety net.
        if (sub.status === "trialing" || (sub.trial_end != null && sub.trial_end > 0)) {
          updates.trial_used = true;
          if (sub.trial_start) updates.trial_started_at = new Date(sub.trial_start * 1000).toISOString();
          if (sub.trial_end)   updates.trial_ended_at   = new Date(sub.trial_end   * 1000).toISOString();
        }

        if (dev) console.log(`[stripe/webhook]   → plan: ${plan}, subscription_status: ${sub.status}`);

        // Lookup order: userId from subscription metadata (most reliable),
        // then stripe_subscription_id, then stripe_customer_id.
        let updated = false;

        if (userId) {
          const { error } = await supabase
            .from("profiles").update(updates).eq("user_id", userId);
          if (error) {
            console.error("[stripe/webhook] Supabase update error (subscription.updated, by userId):", error.message);
          } else {
            if (dev) console.log(`[stripe/webhook] Profile updated — user ${userId}, plan: ${plan}, status: ${sub.status}`);
            updated = true;
          }
        }

        if (!updated && subscriptionId) {
          const { error } = await supabase
            .from("profiles").update(updates).eq("stripe_subscription_id", subscriptionId);
          if (error) {
            console.error("[stripe/webhook] Supabase update error (subscription.updated, by subscriptionId):", error.message);
          } else {
            if (dev) console.log(`[stripe/webhook] Profile updated — subscription ${subscriptionId}, plan: ${plan}, status: ${sub.status}`);
            updated = true;
          }
        }

        if (!updated && customerId) {
          const { error } = await supabase
            .from("profiles").update(updates).eq("stripe_customer_id", customerId);
          if (error) {
            console.error("[stripe/webhook] Supabase update error (subscription.updated, by customerId):", error.message);
          } else {
            if (dev) console.log(`[stripe/webhook] Profile updated — customer ${customerId}, plan: ${plan}, status: ${sub.status}`);
            updated = true;
          }
        }

        if (!updated) {
          console.warn("[stripe/webhook] customer.subscription.updated — no matching profile found (userId/subscriptionId/customerId all failed)");
        }
        break;
      }

      // ── 3. SUBSCRIPTION DELETED (CANCELLATION) ────────────────────────────
      case "customer.subscription.deleted": {
        const sub            = event.data.object as Stripe.Subscription;
        const userId         = sub.metadata?.userId;
        const customerId     = typeof sub.customer === "string" ? sub.customer : null;
        const subscriptionId = sub.id;

        if (dev) {
          console.log(`[stripe/webhook] customer.subscription.deleted`);
          console.log(`[stripe/webhook]   userId:         ${userId ?? "MISSING"}`);
          console.log(`[stripe/webhook]   customerId:     ${customerId ?? "MISSING"}`);
          console.log(`[stripe/webhook]   subscriptionId: ${subscriptionId}`);
        }

        // DO NOT reset trial_used — one trial per account is permanent.
        // DO NOT touch analysis/pdf counts or saved reports.
        const updates = {
          plan:                "free",
          subscription_status: "canceled",
          updated_at:          new Date().toISOString(),
        };

        let updated = false;

        if (userId) {
          const { error } = await supabase
            .from("profiles").update(updates).eq("user_id", userId);
          if (error) {
            console.error("[stripe/webhook] Supabase update error (subscription.deleted, by userId):", error.message);
          } else {
            console.log(`[stripe/webhook] Downgraded user ${userId} to free (canceled)`);
            updated = true;
          }
        }

        if (!updated && subscriptionId) {
          const { error } = await supabase
            .from("profiles").update(updates).eq("stripe_subscription_id", subscriptionId);
          if (error) {
            console.error("[stripe/webhook] Supabase update error (subscription.deleted, by subscriptionId):", error.message);
          } else {
            console.log(`[stripe/webhook] Downgraded subscription ${subscriptionId} to free (canceled)`);
            updated = true;
          }
        }

        if (!updated && customerId) {
          const { error } = await supabase
            .from("profiles").update(updates).eq("stripe_customer_id", customerId);
          if (error) {
            console.error("[stripe/webhook] Supabase update error (subscription.deleted, by customerId):", error.message);
          } else {
            console.log(`[stripe/webhook] Downgraded customer ${customerId} to free (canceled)`);
            updated = true;
          }
        }

        if (!updated) {
          console.warn("[stripe/webhook] customer.subscription.deleted — no matching profile found");
        }
        break;
      }

      // ── 4. PAYMENT FAILED ─────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice        = event.data.object as Stripe.Invoice;
        const customerId     = typeof invoice.customer === "string" ? invoice.customer : null;
        // In Stripe v22, subscription is nested under parent.subscription_details.subscription
        const rawSub         = invoice.parent?.subscription_details?.subscription;
        const subscriptionId = typeof rawSub === "string" ? rawSub : (rawSub as Stripe.Subscription | null)?.id ?? null;

        if (dev) {
          console.log(`[stripe/webhook] invoice.payment_failed`);
          console.log(`[stripe/webhook]   customerId:     ${customerId ?? "MISSING"}`);
          console.log(`[stripe/webhook]   subscriptionId: ${subscriptionId ?? "MISSING"}`);
        }

        // MVP: flag as past_due but keep plan = pro.
        // The subscription.updated event (fired by Stripe) will set the definitive status.
        const updates = {
          subscription_status: "past_due",
          updated_at:          new Date().toISOString(),
        };

        let updated = false;

        if (subscriptionId) {
          const { error } = await supabase
            .from("profiles").update(updates).eq("stripe_subscription_id", subscriptionId);
          if (error) {
            console.error("[stripe/webhook] Supabase update error (invoice.payment_failed, by subscriptionId):", error.message);
          } else {
            if (dev) console.log(`[stripe/webhook] Marked past_due — subscription ${subscriptionId}`);
            updated = true;
          }
        }

        if (!updated && customerId) {
          const { error } = await supabase
            .from("profiles").update(updates).eq("stripe_customer_id", customerId);
          if (error) {
            console.error("[stripe/webhook] Supabase update error (invoice.payment_failed, by customerId):", error.message);
          } else {
            if (dev) console.log(`[stripe/webhook] Marked past_due — customer ${customerId}`);
          }
        }
        break;
      }

      default:
        if (dev) console.log(`[stripe/webhook] Unhandled event type: ${event.type}`);
        break;
    }
  } catch (err) {
    console.error(`[stripe/webhook] Handler error for ${event.type}:`, err);
    return Response.json({ error: "Handler error" }, { status: 500 });
  }

  return Response.json({ received: true });
}
