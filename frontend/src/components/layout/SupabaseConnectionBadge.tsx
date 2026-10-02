"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

type ConnectionStatus = "connecting" | "connected" | "unavailable";

export function SupabaseConnectionBadge() {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");

  useEffect(() => {
    let mounted = true;

    async function checkHealth() {
      try {
        const res = await fetch("/api/health/supabase", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.supabase?.connected && mounted) {
            setStatus("connected");
            return;
          }
        }
        if (mounted) setStatus("unavailable");
      } catch {
        if (mounted) setStatus("unavailable");
      }
    }

    checkHealth();
    // Poll every 30 seconds for live status
    const interval = setInterval(checkHealth, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (status === "connecting") {
    return (
      <Link
        href="/supabase-status"
        title="Verifying Supabase connection..."
        className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] text-slate-600 font-medium hover:bg-slate-200 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span>Supabase Connecting...</span>
      </Link>
    );
  }

  if (status === "connected") {
    return (
      <Link
        href="/supabase-status"
        title="Genuine Supabase PostgreSQL & Auth connection verified"
        className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-700 font-medium hover:bg-emerald-100 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>Supabase Connected</span>
      </Link>
    );
  }

  return (
    <Link
      href="/supabase-status"
      title="Supabase health query failed"
      className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-[11px] text-rose-700 font-medium hover:bg-rose-100 transition-colors"
    >
      <span className="w-2 h-2 rounded-full bg-rose-500" />
      <span>Supabase Unavailable</span>
    </Link>
  );
}
