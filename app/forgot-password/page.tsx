"use client";

import { useState } from "react";
import Link from "next/link";
import { Scan, ArrowRight, CheckCircle } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      // Route the reset link through /auth/callback so the code is exchanged
      // server-side and the session cookie is set before landing on /reset-password.
      const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;

      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (authError) {
        // Only surface unexpected errors — not "email not found" (that would reveal
        // whether an account exists, which is a privacy concern).
        setError("Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      // Always show the same success message regardless of whether the email exists.
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const bg = (
    "radial-gradient(ellipse 80% 50% at 50% -15%, rgba(16,185,129,0.09) 0%, transparent 55%), " +
    "linear-gradient(175deg, #eaf4ea 0%, #f0ede3 15%, #f4f0e6 42%, #fdf9f0 100%)"
  );

  const logo = (
    <div className="mb-8 flex flex-col items-center gap-3">
      <Link href="/" className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10 ring-1 ring-emerald-200">
          <Scan className="h-[18px] w-[18px] text-emerald-700" />
        </div>
        <span className="text-[20px] font-black tracking-tight" style={{ color: "#1c2018" }}>
          Frame<span className="text-emerald-700">Finder</span>
        </span>
      </Link>
    </div>
  );

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12" style={{ background: bg }}>
        <div className="w-full max-w-sm">
          {logo}
          <div
            className="rounded-2xl border p-8 text-center shadow-[0_8px_40px_rgba(0,0,0,0.07)]"
            style={{ backgroundColor: "#fdfbf5", borderColor: "#d8d3c8" }}
          >
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <h1 className="mb-2 text-[19px] font-black" style={{ color: "#1c2018" }}>
              Check your email
            </h1>
            <p className="text-[13px] leading-relaxed" style={{ color: "#687070" }}>
              If an account exists for{" "}
              <span className="font-semibold" style={{ color: "#1c2018" }}>{email}</span>
              , we sent a password reset link.
            </p>
            <p className="mt-3 text-[12px]" style={{ color: "#a8bfaa" }}>
              Check your spam folder if it doesn't arrive within a minute.
            </p>
          </div>
          <p className="mt-4 text-center text-[13px]" style={{ color: "#7a8e7c" }}>
            <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12" style={{ background: bg }}>
      <div className="w-full max-w-sm">
        {logo}

        <div
          className="rounded-2xl border p-7 shadow-[0_8px_40px_rgba(0,0,0,0.07)]"
          style={{ backgroundColor: "#fdfbf5", borderColor: "#d8d3c8" }}
        >
          <h1 className="mb-1 text-[20px] font-black" style={{ color: "#1c2018" }}>
            Reset password
          </h1>
          <p className="mb-6 text-[13px]" style={{ color: "#687070" }}>
            Enter your email and we'll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wider"
                style={{ color: "#7a8e7c" }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-xl border px-4 py-2.5 text-[14px] outline-none transition-all placeholder:text-[#c4bfb8] focus:ring-2 focus:ring-emerald-400/40"
                style={{ backgroundColor: "#f4f0e6", borderColor: "#d4cfc5", color: "#1c2018" }}
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-[14px] font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-[1px] hover:bg-emerald-600 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending…" : (
                <>
                  Send reset link
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-[13px]" style={{ color: "#7a8e7c" }}>
          <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
            Back to sign in
          </Link>
        </p>

      </div>
    </main>
  );
}
