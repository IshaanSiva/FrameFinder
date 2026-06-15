"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scan, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [ready, setReady]                   = useState(false);   // session confirmed
  const [sessionError, setSessionError]     = useState(false);   // link expired / invalid
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]     = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState<string | null>(null);
  const [success, setSuccess]               = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    // Listen for PASSWORD_RECOVERY — fired when the user arrives via a reset link
    // that carries hash-based tokens (implicit flow).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Also check for an existing session — covers the PKCE flow where /auth/callback
    // has already exchanged the code and set the cookie before we landed here.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      } else {
        // Give the onAuthStateChange listener a moment to fire before showing
        // the "link invalid" screen — the hash fragment may still be processing.
        const timer = setTimeout(() => {
          if (!ready) setSessionError(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createBrowserSupabaseClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    // Sign out the recovery session so the user starts fresh at /login.
    await supabase.auth.signOut();
    setTimeout(() => router.push("/login"), 2000);
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

  // ── Success state ───────────────────────────────────────────────────────────
  if (success) {
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
              Password updated
            </h1>
            <p className="text-[13px] leading-relaxed" style={{ color: "#687070" }}>
              Your password has been changed. Redirecting you to sign in…
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ── Invalid / expired link ──────────────────────────────────────────────────
  if (sessionError && !ready) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12" style={{ background: bg }}>
        <div className="w-full max-w-sm">
          {logo}
          <div
            className="rounded-2xl border p-7 text-center shadow-[0_8px_40px_rgba(0,0,0,0.07)]"
            style={{ backgroundColor: "#fdfbf5", borderColor: "#d8d3c8" }}
          >
            <h1 className="mb-2 text-[19px] font-black" style={{ color: "#1c2018" }}>
              Link expired or invalid
            </h1>
            <p className="mb-5 text-[13px] leading-relaxed" style={{ color: "#687070" }}>
              This password reset link has expired or already been used. Request a new one.
            </p>
            <Link
              href="/forgot-password"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-[13.5px] font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-[1px] hover:bg-emerald-600 active:translate-y-0"
            >
              Request new link
              <ArrowRight className="h-4 w-4" />
            </Link>
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

  // ── Loading session ─────────────────────────────────────────────────────────
  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12" style={{ background: bg }}>
        <div className="w-full max-w-sm">
          {logo}
          <div
            className="rounded-2xl border p-8 text-center shadow-[0_8px_40px_rgba(0,0,0,0.07)]"
            style={{ backgroundColor: "#fdfbf5", borderColor: "#d8d3c8" }}
          >
            <p className="text-[13px]" style={{ color: "#687070" }}>Verifying reset link…</p>
          </div>
        </div>
      </main>
    );
  }

  // ── Password form ───────────────────────────────────────────────────────────
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12" style={{ background: bg }}>
      <div className="w-full max-w-sm">
        {logo}

        <div
          className="rounded-2xl border p-7 shadow-[0_8px_40px_rgba(0,0,0,0.07)]"
          style={{ backgroundColor: "#fdfbf5", borderColor: "#d8d3c8" }}
        >
          <h1 className="mb-1 text-[20px] font-black" style={{ color: "#1c2018" }}>
            Set new password
          </h1>
          <p className="mb-6 text-[13px]" style={{ color: "#687070" }}>
            Choose a strong password of at least 8 characters.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* New password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wider"
                style={{ color: "#7a8e7c" }}
              >
                New password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border py-2.5 pl-4 pr-10 text-[14px] outline-none transition-all placeholder:text-[#c4bfb8] focus:ring-2 focus:ring-emerald-400/40"
                  style={{ backgroundColor: "#f4f0e6", borderColor: "#d4cfc5", color: "#1c2018" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 transition-colors"
                  style={{ color: "#a8bfaa" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#687070")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#a8bfaa")}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wider"
                style={{ color: "#7a8e7c" }}
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border py-2.5 pl-4 pr-10 text-[14px] outline-none transition-all placeholder:text-[#c4bfb8] focus:ring-2 focus:ring-emerald-400/40"
                  style={{ backgroundColor: "#f4f0e6", borderColor: "#d4cfc5", color: "#1c2018" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 transition-colors"
                  style={{ color: "#a8bfaa" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#687070")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#a8bfaa")}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
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
              {loading ? "Updating…" : (
                <>
                  Update password
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
