"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationDropdown } from "./NotificationDropdown";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { SupabaseConnectionBadge } from "./SupabaseConnectionBadge";

export interface DashboardTopNavProps {
  onMenuClick?: () => void;
}

export function DashboardTopNav({ onMenuClick }: DashboardTopNavProps) {
  const { user, profile, studentProfile, signOut } = useAuth();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const displayName = profile?.full_name || user?.email?.split("@")[0] || "Student";
  const academicSub = studentProfile
    ? `Year ${studentProfile.year} • Sem ${studentProfile.semester}`
    : "Academic Workspace";

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-20 w-full h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shadow-soft-sm print:hidden">
        {/* Left side: Mobile menu toggle + Quick Search */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            aria-label="Open LearnTrack Command Center"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200/90 bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 text-slate-500 hover:text-slate-800 transition-all text-xs font-medium w-48 sm:w-64 cursor-pointer shadow-2xs group"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span className="flex-1 text-left truncate">Search or run command...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white rounded border border-slate-200 shadow-2xs font-semibold">
              {typeof window !== "undefined" && /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform) ? "⌘K" : "Ctrl K"}
            </kbd>
          </button>
        </div>

        {/* Right side: Security status pill, Notifications, Profile menu */}
        <div className="flex items-center gap-3">
          <SupabaseConnectionBadge />

          {/* Notifications */}
          <NotificationDropdown />

          {/* User Profile Dropdown (Section 27) */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group"
              aria-label="User Profile Menu"
              aria-expanded={isProfileMenuOpen}
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-400">{academicSub}</p>
              </div>
              <div className="relative">
                <Avatar
                  name={displayName}
                  size="sm"
                  src={profile?.avatar_url || profile?.avatarUrl}
                  className="w-8 h-8 rounded-full border border-slate-200/80 shadow-2xs"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1.5 ring-white" />
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-180 ${isProfileMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {isProfileMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-slate-200 shadow-elevated z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-180 p-1.5 text-xs"
                onClick={() => setIsProfileMenuOpen(false)}
              >
                {/* Profile Header Summary */}
                <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 mb-1 flex items-center gap-3">
                  <Avatar
                    name={displayName}
                    size="md"
                    src={profile?.avatar_url || profile?.avatarUrl}
                    className="w-10 h-10 rounded-xl border border-slate-200/80 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate leading-tight">{displayName}</p>
                    <p className="text-[10.5px] font-mono text-slate-500 truncate mt-0.5">
                      {studentProfile?.roll_number || profile?.rollNumber || "LT-STUDENT"}
                    </p>
                  </div>
                </div>

                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>View Academic Profile</span>
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>Account Settings</span>
                </Link>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-700 font-medium transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
}
