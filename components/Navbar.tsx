"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Scan, ArrowRight, ArrowLeft } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import UserMenu from "@/components/UserMenu";

const navLinks = [
  { href: "/",             label: "Home"          },
  { href: "/analyzer",     label: "Analyzer"      },
  { href: "/sample-report",label: "Sample Report" },
  { href: "/pricing",      label: "Pricing"       },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const isHome     = pathname === "/";
  const isAnalyzer = pathname.startsWith("/analyzer");
  const isReport   = pathname.startsWith("/analyzer/report");

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Subscribe to Supabase auth state changes.
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Dark glass only on homepage hero; cream on analyzer and all other routes
  const dark = isHome && !scrolled;

  // ── Shell styles ──────────────────────────────────────────────────────────
  const shellCls = dark
    ? "border-white/[0.07] bg-[#1e2c20]/80 backdrop-blur-2xl shadow-none"
    : isAnalyzer
    ? "border-[#a8c4a8] bg-[#d4e0d4]/96 backdrop-blur-xl shadow-sm"
    : "border-gray-200/60 bg-white/95 backdrop-blur-xl shadow-sm";

  // ── Logo icon ─────────────────────────────────────────────────────────────
  const logoIconCls = dark
    ? "bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25"
    : isAnalyzer
    ? "bg-emerald-600/10 text-emerald-700 ring-1 ring-emerald-200/80 group-hover:bg-emerald-600/15"
    : "bg-slate-800 text-white shadow-sm group-hover:shadow-md group-hover:shadow-slate-300";

  const brandTextCls   = dark ? "text-white"      : isAnalyzer ? "text-[#1c2018]" : "text-gray-900";
  const brandAccentCls = dark ? "text-emerald-400" : "text-emerald-700";

  // ── Nav link helper ────────────────────────────────────────────────────────
  function linkCls(active: boolean) {
    if (dark) {
      return active
        ? "bg-emerald-500/10 font-semibold text-emerald-400 ring-1 ring-emerald-500/20"
        : "font-medium text-slate-400 hover:bg-white/[0.06] hover:text-slate-200";
    }
    if (isAnalyzer) {
      return active
        ? "bg-emerald-50 font-semibold text-emerald-700"
        : "font-medium text-[#687070] hover:bg-[#ebe7dc] hover:text-[#1c2018]";
    }
    return active
      ? "bg-emerald-50 font-semibold text-emerald-700"
      : "font-medium text-gray-600 hover:bg-gray-100/70 hover:text-gray-900";
  }

  const activeDotCls = dark ? "bg-emerald-400" : "bg-emerald-600";

  // ── CTA button ────────────────────────────────────────────────────────────
  const ctaPrimaryCls = dark
    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-400"
    : isAnalyzer
    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-600"
    : "bg-slate-800 text-white shadow-sm hover:bg-slate-700 hover:shadow-md hover:shadow-slate-300";

  const ctaSignInCls = dark
    ? "text-slate-300 hover:text-white"
    : isAnalyzer
    ? "text-[#687070] hover:text-[#1c2018]"
    : "text-gray-600 hover:text-gray-900";

  // ── Mobile menu bg ────────────────────────────────────────────────────────
  const mobileBgCls = dark
    ? "border-white/[0.07] bg-[#1e2c20]/95"
    : isAnalyzer
    ? "border-[#a8c4a8] bg-[#d4e0d4]/96"
    : "border-gray-100 bg-white/98";

  const mobileHamburgerCls = dark
    ? "text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
    : isAnalyzer
    ? "text-[#687070] hover:bg-[#ebe7dc] hover:text-[#1c2018]"
    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900";

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-[background-color,border-color,box-shadow] duration-300 ${shellCls}`}
    >
      <div className="mx-auto flex h-[64px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${logoIconCls}`}>
            <Scan className="h-[16px] w-[16px]" />
          </div>
          <span className={`text-[17px] font-bold tracking-tight transition-colors duration-200 ${brandTextCls}`}>
            Frame<span className={brandAccentCls}>Finder</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-lg px-3.5 py-2 text-[13.5px] transition-all duration-150 ${linkCls(isActive)}`}
              >
                {link.label}
                {isActive && (
                  <span className={`absolute bottom-1 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full ${activeDotCls}`} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop auth */}
        <div className="hidden items-center gap-3 md:flex">
          {!user ? (
            <>
              <Link
                href="/login"
                className={`text-[13.5px] font-medium transition-colors duration-150 ${ctaSignInCls}`}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${ctaPrimaryCls}`}
              >
                Try Free
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/analyzer"
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${ctaPrimaryCls}`}
              >
                {isReport ? (
                  <>
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Analyzer
                  </>
                ) : (
                  <>
                    Analyzer
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Link>
              <UserMenu user={user} />
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={`rounded-lg p-2 transition-colors md:hidden ${mobileHamburgerCls}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={`border-t px-4 pb-5 pt-3 md:hidden ${mobileBgCls}`}>
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3.5 py-2.5 text-[15px] transition-colors ${linkCls(isActive)}`}
                >
                  {link.label}
                </Link>
              );
            })}
            {!user ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className={`mt-2 w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold ${ctaSignInCls}`}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className={`mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold ${ctaPrimaryCls}`}
                >
                  Try Free <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/analyzer"
                  onClick={() => setMobileOpen(false)}
                  className={`mt-2 flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold ${ctaPrimaryCls}`}
                >
                  {isReport ? (
                    <>
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to Analyzer
                    </>
                  ) : (
                    <>
                      Analyzer <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Link>
                <div className="mt-2 flex justify-center">
                  <UserMenu user={user} />
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
