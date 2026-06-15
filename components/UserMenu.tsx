"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";

interface UserMenuProps {
  user: User;
}

export default function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSignOut = async () => {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  const initial = (user.email?.[0] ?? "?").toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-[13px] font-bold text-white shadow-sm transition-all hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
        aria-label="User menu"
        aria-expanded={open}
      >
        {initial}
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-xl border shadow-xl"
          style={{ backgroundColor: "#fdfbf5", borderColor: "#d4cfc5" }}
        >
          {/* Account info */}
          <div className="border-b px-4 py-3" style={{ borderColor: "#e8e4da" }}>
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: "#a8bfaa" }}
            >
              Signed in as
            </p>
            <p
              className="mt-0.5 truncate text-[12.5px] font-semibold"
              style={{ color: "#1c2018" }}
            >
              {user.email}
            </p>
          </div>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 px-4 py-3 text-[13px] font-medium transition-colors hover:bg-[#f0ece0]"
            style={{ color: "#687070" }}
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
