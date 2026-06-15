"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Scan, ArrowRight, Eye, EyeOff } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);

  // Show a friendly message if redirected here after a failed auth callback.
  const urlError =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("error")
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createBrowserSupabaseClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      // Map Supabase's internal error messages to user-friendly copy.
      // showPassword state is intentionally NOT reset here.
      const msg = authError.message.toLowerCase();
      if (
        msg.includes("invalid login") ||
        msg.includes("invalid credentials") ||
        msg.includes("email not confirmed") ||
        msg.includes("wrong password")
      ) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(authError.message);
      }
      setLoading(false);
    } else {
      router.push("/analyzer");
      router.refresh();
    }
  };

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
            Sign in
          </h1>
          <p className="mb-6 text-[13px]" style={{ color: "#687070" }}>
            Welcome back. Continue your analysis.
          </p>

          {urlError === "auth_callback_error" && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-700">
              Email confirmation failed — please try signing in again.
            </div>
          )}

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
              {/* Label row — password label + forgot password link */}
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-[11.5px] font-bold uppercase tracking-wider"
                  style={{ color: "#7a8e7c" }}
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11.5px] font-medium text-emerald-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Password input with show/hide toggle */}
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
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
                  {showPassword
                    ? <EyeOff className="h-4 w-4" />
                    : <Eye    className="h-4 w-4" />}
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
              {loading ? "Signing in…" : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-[13px]" style={{ color: "#7a8e7c" }}>
          No account?{" "}
          <Link href="/signup" className="font-semibold text-emerald-700 hover:underline">
            Sign up free
          </Link>
        </p>

      </div>
    </main>
  );
}
