"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Lock, ArrowRight, Sparkles, Loader2, CreditCard } from "lucide-react";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: { text: string; locked?: boolean }[];
  cta: string;
  href: string;
  featured?: boolean;
  badge?: string;
  variant?: "default" | "elevated";
  comingSoon?: boolean;
}

export default function PricingCard({
  name, price, period, description, features, cta, href,
  featured = false, badge, variant = "default", comingSoon = false,
}: PricingCardProps) {

  if (featured) {
    // ── Student Pro — dark forest green premium card ─────────────────────
    const [loading, setLoading] = useState(false);
    const [checkoutError, setCheckoutError] = useState<string | null>(null);
    const [userPlan, setUserPlan] = useState<"free" | "pro" | null>(null);
    const [hasStripeCustomer, setHasStripeCustomer] = useState(false);
    const [trialUsed, setTrialUsed] = useState(false);
    const [planLoading, setPlanLoading] = useState(true);

    useEffect(() => {
      fetch("/api/usage")
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { plan?: "free" | "pro"; has_stripe_customer?: boolean; trial_used?: boolean } | null) => {
          if (data) {
            setUserPlan(data.plan ?? "free");
            setHasStripeCustomer(data.has_stripe_customer ?? false);
            setTrialUsed(data.trial_used ?? false);
          } else {
            setUserPlan("free");
          }
        })
        .catch(() => setUserPlan("free"))
        .finally(() => setPlanLoading(false));
    }, []);

    async function handleCheckout() {
      setLoading(true);
      setCheckoutError(null);
      try {
        const res = await fetch("/api/stripe/checkout", { method: "POST" });
        const body = await res.json() as { url?: string; error?: string };
        if (!res.ok) {
          if (res.status === 401) { window.location.href = "/login"; return; }
          throw new Error(body.error ?? "Checkout failed");
        }
        if (body.url) window.location.href = body.url;
      } catch (err) {
        setCheckoutError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        setLoading(false);
      }
    }

    async function handleManageSubscription() {
      setLoading(true);
      setCheckoutError(null);
      try {
        const res = await fetch("/api/stripe/portal", { method: "POST" });
        const body = await res.json() as { url?: string; error?: string };
        if (!res.ok) {
          if (res.status === 401) { window.location.href = "/login"; return; }
          throw new Error(body.error ?? "Failed to open subscription portal");
        }
        if (body.url) window.location.href = body.url;
      } catch (err) {
        setCheckoutError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        setLoading(false);
      }
    }

    return (
      <div
        className="relative flex flex-col overflow-hidden rounded-2xl"
        style={{
          background: "linear-gradient(145deg, #142418 0%, #1e2c20 50%, #253c28 100%)",
          boxShadow:
            "inset 0 0 60px rgba(16,185,129,0.08), 0 8px 40px rgba(14,32,18,0.30), 0 2px 8px rgba(0,0,0,0.12)",
          border: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        {/* Subtle emerald atmosphere glow */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-40 w-40 opacity-30 blur-2xl"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.5) 0%, transparent 70%)" }}
        />

        {/* Badge */}
        {badge && (
          <div className="absolute -top-px left-1/2 -translate-x-1/2">
            <span className="flex items-center gap-1 rounded-b-full bg-amber-400 px-4 py-1 text-[10.5px] font-black uppercase tracking-widest text-amber-900 shadow-md">
              <Sparkles className="h-2.5 w-2.5" />
              {badge}
            </span>
          </div>
        )}

        <div className="relative z-10 flex flex-1 flex-col p-7 pt-9">
          {/* Plan name */}
          <p className="font-mono text-[9px] font-black uppercase tracking-[0.22em] text-emerald-400">
            {name}
          </p>

          {/* Price */}
          <div className="mt-2.5 flex items-baseline gap-1">
            <span className="text-5xl font-black tracking-tight" style={{ color: "#f4f0e6" }}>
              {price}
            </span>
            <span className="text-sm font-medium" style={{ color: "#a8bfaa" }}>
              {period}
            </span>
          </div>

          {/* Description */}
          <p className="mt-2.5 text-[13px] leading-relaxed" style={{ color: "#a8bfaa" }}>
            {description}
          </p>

          {/* Divider */}
          <div className="my-5 h-px" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />

          {/* Features */}
          <ul className="flex flex-1 flex-col gap-2.5">
            {features.map((f) => (
              <li key={f.text} className="flex items-start gap-3 text-[13px]">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                <span style={{ color: "#d4e8d4" }}>{f.text}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          {checkoutError && (
            <p className="mt-4 text-center text-[11.5px] text-rose-300">{checkoutError}</p>
          )}

          {planLoading ? (
            <button
              disabled
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/60 px-5 py-3.5 text-[13.5px] font-bold text-white disabled:cursor-not-allowed"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </button>
          ) : userPlan === "pro" ? (
            hasStripeCustomer ? (
              <button
                onClick={handleManageSubscription}
                disabled={loading}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-5 py-3.5 text-[13.5px] font-bold text-emerald-200 transition-all hover:-translate-y-[1px] hover:bg-emerald-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                {loading ? "Opening portal…" : "Manage Subscription"}
              </button>
            ) : (
              <div
                className="mt-7 rounded-xl border border-emerald-800/40 px-4 py-3.5 text-center"
                style={{ backgroundColor: "rgba(16,185,129,0.08)" }}
              >
                <p className="text-[12px] leading-relaxed" style={{ color: "#a8bfaa" }}>
                  This Pro account was activated manually. Stripe customer portal is unavailable.
                </p>
              </div>
            )
          ) : (
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-[13.5px] font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-[1px] hover:bg-emerald-400 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {loading ? "Redirecting…" : trialUsed ? cta : "Start 7-Day Free Trial"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Default card (Free + Educator Pack) ──────────────────────────────────
  const isElevated = variant === "elevated";

  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-2xl"
      style={{
        backgroundColor: "#fdfbf5",
        border: isElevated ? "1px solid #b8d4b8" : "1px solid #d8d3c8",
        boxShadow: isElevated
          ? "0 4px 24px rgba(0,0,0,0.07), 0 0 0 4px rgba(16,185,129,0.04)"
          : "0 2px 12px rgba(0,0,0,0.05)",
      }}
    >
      {/* Subtle top accent line for Educator Pack */}
      {isElevated && (
        <div
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.35), transparent)" }}
        />
      )}

      {/* Coming Soon badge */}
      {comingSoon && (
        <div className="absolute right-4 top-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-amber-700">
            Coming Soon
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-7">
        {/* Plan name */}
        <p
          className="font-mono text-[9px] font-black uppercase tracking-[0.22em]"
          style={{ color: isElevated ? "#2c5c34" : "#4a7050" }}
        >
          {name}
        </p>

        {/* Price */}
        <div className="mt-2.5 flex items-baseline gap-1">
          <span className="text-5xl font-black tracking-tight" style={{ color: "#1c2018" }}>
            {price}
          </span>
          <span className="text-sm font-medium" style={{ color: "#7a8e7c" }}>
            {period}
          </span>
        </div>

        {/* Description */}
        <p className="mt-2.5 text-[13px] leading-relaxed" style={{ color: "#687070" }}>
          {description}
        </p>

        {/* Divider */}
        <div className="my-5 h-px" style={{ backgroundColor: "#e8e4da" }} />

        {/* Features */}
        <ul className="flex flex-1 flex-col gap-2.5">
          {features.map((f) => (
            <li key={f.text} className="flex items-start gap-3 text-[13px]">
              {f.locked ? (
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: "#c4bfb8" }} />
              ) : (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              )}
              <span style={{ color: f.locked ? "#c4bfb8" : "#1c2018" }}>
                {f.text}
              </span>
            </li>
          ))}
        </ul>

        {/* Coming soon helper text */}
        {comingSoon && (
          <p className="mt-5 text-[11.5px] leading-relaxed" style={{ color: "#7a8e7c" }}>
            Built for classrooms, student seats, and teacher-guided analysis. Coming after Student Pro launch.
          </p>
        )}

        {/* CTA */}
        {comingSoon ? (
          <button
            disabled
            className="mt-5 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[13.5px] font-bold text-white opacity-40"
            style={{ backgroundColor: "#2c5c34" }}
          >
            Coming Soon
          </button>
        ) : (
          <Link
            href={href}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[13.5px] font-bold text-white shadow-sm transition-all hover:-translate-y-[1px] active:translate-y-0"
            style={{
              backgroundColor: isElevated ? "#2c5c34" : "#10b981",
              boxShadow: isElevated
                ? "0 4px 14px rgba(44,92,52,0.22)"
                : "0 4px 14px rgba(16,185,129,0.22)",
            }}
          >
            {cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
