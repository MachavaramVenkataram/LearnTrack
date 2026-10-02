"use client";

import React from "react";
import { UserRound, Bell, Sun, ShieldCheck, AlertTriangle, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

export type SettingsSectionId =
  | "account"
  | "notifications"
  | "appearance"
  | "security"
  | "ai"
  | "danger";

interface SettingsNavProps {
  activeSection: SettingsSectionId;
  onSelectSection: (section: SettingsSectionId) => void;
  className?: string;
}

interface NavItem {
  id: SettingsSectionId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: "ACCOUNT",
    items: [
      {
        id: "account",
        label: "Account & Credentials",
        icon: UserRound,
        description: "Identity, email, and password security",
      },
    ],
  },
  {
    group: "PREFERENCES",
    items: [
      {
        id: "notifications",
        label: "Notifications & Alerts",
        icon: Bell,
        description: "Prediction updates and study alerts",
      },
      {
        id: "appearance",
        label: "Appearance",
        icon: Sun,
        description: "Theme ergonomics and display mode",
      },
    ],
  },
  {
    group: "PRIVACY & DATA",
    items: [
      {
        id: "security",
        label: "Security & Privacy",
        icon: ShieldCheck,
        description: "Row-Level Security and data export",
      },
    ],
  },
  {
    group: "SYSTEM & INTELLIGENCE",
    items: [
      {
        id: "ai",
        label: "AI System",
        icon: Cpu,
        description: "Gemini + Groq multi-provider health",
      },
    ],
  },
  {
    group: "ACCOUNT ACTIONS",
    items: [
      {
        id: "danger",
        label: "Danger Zone",
        icon: AlertTriangle,
        description: "Permanent account deletion",
      },
    ],
  },
];

export function SettingsNav({
  activeSection,
  onSelectSection,
  className,
}: SettingsNavProps) {
  return (
    <nav className={cn("space-y-6", className)} aria-label="Settings Navigation">
      {/* Mobile Horizontal Selector */}
      <div className="md:hidden">
        <label htmlFor="mobile-settings-select" className="sr-only">
          Select Settings Section
        </label>
        <div className="relative">
          <select
            id="mobile-settings-select"
            value={activeSection}
            onChange={(e) => onSelectSection(e.target.value as SettingsSectionId)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
          >
            {NAV_GROUPS.map((group) => (
              <optgroup key={group.group} label={group.group}>
                {group.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Desktop Vertical Menu */}
      <div className="hidden md:block space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.group} className="space-y-1.5">
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              {group.group}
            </h4>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                const isDanger = item.id === "danger";

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectSection(item.id)}
                    className={cn(
                      "w-full relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer group",
                      isActive
                        ? isDanger
                          ? "bg-rose-50 text-rose-700 font-semibold shadow-xs"
                          : "bg-blue-50/90 text-blue-700 font-semibold shadow-xs"
                        : isDanger
                        ? "text-slate-600 hover:text-rose-700 hover:bg-rose-50/50"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    )}
                  >
                    {/* Left Active Accent Pill */}
                    {isActive && (
                      <span
                        className={cn(
                          "absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full",
                          isDanger ? "bg-rose-600" : "bg-blue-600"
                        )}
                        aria-hidden="true"
                      />
                    )}

                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isActive
                          ? isDanger
                            ? "bg-rose-100/80 text-rose-600"
                            : "bg-blue-100/80 text-blue-600"
                          : isDanger
                          ? "text-slate-400 group-hover:text-rose-600 group-hover:bg-rose-50"
                          : "text-slate-400 group-hover:text-slate-700 group-hover:bg-slate-200/60"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate leading-tight">{item.label}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
