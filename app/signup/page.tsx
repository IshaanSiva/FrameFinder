"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scan, ArrowRight, CheckCircle } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]                 = useState<string | null>(null);
  const [loading, setLoading]             = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserSupabaseClient();

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Redirect to /auth/callback after email confirmation.
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      // Email confirmation is disabled — user is immediately signed in.
      router.push("/analyzer");
      router.refresh();
    } else {
      // Email confirmation required — show check-your-email state.
      setConfirmationSent(true);
      setLoading(false);
    }
  };

  if (confirmationSent) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-4 py-12"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -15%, rgba(16,185,129,0.09) 0%, transparent 55%), " +
            "linear-gradient(175deg, #eaf4ea 0%, #f0ede3 15%, #f4f0e6 42%, #fdf9f0 100%)",
        }}
      >
        <div className="w-full max-w-sm">
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
              We sent a confirmation link to{" "}
              <span className="font-semibold" style={{ color: "#1c2018" }}>
                {email}
              </span>
              . Click it to activate your account.
            </p>
            <p className="mt-4 text-[12px]" style={{ color: "#a8bfaa" }}>
              Once confirmed, you can sign in below.
            </p>
          </div>

          <p className="mt-4 text-center text-[13px]" style={{ color: "#7a8e7c" }}>
            Already confirmed?{" "}
            <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% -15%, rgba(16,185,129,0.09) 0%, transparent 55%), " +
          "linear-gradient(175deg, #eaf4ea 0%, #f0ede3 15%, #f4f0e6 42%, #fdf9f0 100%)",
      }}
    >
      <div className="w-full max-w-sm">

        {/* Logo */}
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

        {/* Card */}
        <div
          className="rounded-2xl border p-7 shadow-[0_8px_40px_rgba(0,0,0,0.07)]"
          style={{ backgroundColor: "#fdfbf5", borderColor: "#d8d3c8" }}
        >
          <h1 className="mb-1 text-[20px] font-black" style={{ color: "#1c2018" }}>
            Create account
          </h1>
          <p className="mb-6 text-[13px]" style={{ color: "#687070" }}>
            Free to start. No credit card required.
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

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wider"
                style={{ color: "#7a8e7c" }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="At least 6 characters"
                className="w-full rounded-xl border px-4 py-2.5 text-[14px] outline-none transition-all placeholder:text-[#c4bfb8] focus:ring-2 focus:ring-emerald-400/40"
                style={{ backgroundColor: "#f4f0e6", borderColor: "#d4cfc5", color: "#1c2018" }}
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wider"
                style={{ color: "#7a8e7c" }}
              >
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="••••••••"
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
              {loading ? "Creating account…" : (
                <>
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-4 text-center text-[11.5px] leading-relaxed" style={{ color: "#a8bfaa" }}>
            By signing up you agree to our{" "}
            <Link href="/terms" className="underline hover:text-[#687070]">Terms</Link>
            {" and "}
            <Link href="/privacy" className="underline hover:text-[#687070]">Privacy Policy</Link>.
          </p>
        </div>

        <p className="mt-4 text-center text-[13px]" style={{ color: "#7a8e7c" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </main>
  );
}
