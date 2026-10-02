"use client";

import React, { useState } from "react";
import { Sun, Moon, Laptop, Check, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

interface ThemeOption {
  id: string;
  name: string;
  description: string;
  badge?: string;
  isAvailable: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

const THEME_REGISTRY: ThemeOption[] = [
  {
    id: "light-saas",
    name: "Light-First SaaS (Default)",
    description: "Refined white surfaces, slate typography, and high-contrast blue/indigo identity accents.",
    badge: "Active",
    isAvailable: true,
    icon: Sun,
  },
  {
    id: "dark-research",
    name: "Dark Observability",
    description: "Deep obsidian workspace tailored for low-light research sessions and late-night analysis.",
    badge: "Coming in v2.0",
    isAvailable: false,
    icon: Moon,
  },
  {
    id: "system-sync",
    name: "System Preference Sync",
    description: "Automatically synchronizes display palette with your operating system's active color scheme.",
    badge: "Coming in v2.0",
    isAvailable: false,
    icon: Laptop,
  },
];

export function AppearanceSection() {
  const { showToast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("learntrack_theme");
        if (stored && stored === "light-saas") return stored;
      } catch {
        // Keep default
      }
    }
    return "light-saas";
  });

  const handleSelectTheme = (theme: ThemeOption) => {
    if (!theme.isAvailable) {
      showToast(
        "Theme Preview",
        `${theme.name} is currently scheduled for the LearnTrack v2.0 release.`,
        "info"
      );
      return;
    }

    setSelectedTheme(theme.id);
    try {
      localStorage.setItem("learntrack_theme", theme.id);
      showToast("Appearance Updated", "Light-First SaaS theme is active.", "success");
    } catch {
      // Ignore localStorage issues
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle className="text-base text-slate-900 flex items-center gap-2">
            <Sun className="w-4 h-4 text-blue-600" />
            Appearance & Visual Ergonomics
          </CardTitle>
          <CardDescription>
            Customize the presentation palette and visual experience across your academic workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
              THEME SELECTION
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {THEME_REGISTRY.map((theme) => {
                const Icon = theme.icon;
                const isSelected = selectedTheme === theme.id;

                return (
                  <div
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme)}
                    className={`relative rounded-2xl border p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-500/30"
                        : theme.isAvailable
                        ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                        : "border-slate-200/60 bg-slate-50/50 opacity-75 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      {/* Theme Illustration Header */}
                      <div className="w-full h-24 rounded-xl border border-slate-200/80 overflow-hidden mb-3 bg-slate-50 relative flex flex-col shadow-2xs">
                        {theme.id === "light-saas" ? (
                          <div className="w-full h-full p-2 flex flex-col justify-between bg-[#F8FAFC]">
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-blue-600" />
                                <div className="w-8 h-1.5 rounded-full bg-slate-300" />
                              </div>
                              <div className="w-3 h-3 rounded-full bg-slate-200" />
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 py-1">
                              <div className="h-6 rounded bg-white border border-slate-200/70 p-1 flex items-center justify-between">
                                <div className="w-5 h-1 bg-slate-300 rounded" />
                                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                              </div>
                              <div className="h-6 rounded bg-white border border-slate-200/70 p-1 flex items-center justify-between">
                                <div className="w-5 h-1 bg-slate-300 rounded" />
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              </div>
                            </div>
                            <div className="h-2 rounded bg-blue-600/10 border border-blue-200/50 flex items-center px-1">
                              <div className="w-10 h-1 bg-blue-600 rounded-full" />
                            </div>
                          </div>
                        ) : theme.id === "dark-research" ? (
                          <div className="w-full h-full p-2 flex flex-col justify-between bg-slate-900">
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-blue-400" />
                                <div className="w-8 h-1.5 rounded-full bg-slate-700" />
                              </div>
                              <div className="w-3 h-3 rounded-full bg-slate-800" />
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 py-1">
                              <div className="h-6 rounded bg-slate-800 border border-slate-700/60 p-1 flex items-center justify-between">
                                <div className="w-5 h-1 bg-slate-600 rounded" />
                                <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                              </div>
                              <div className="h-6 rounded bg-slate-800 border border-slate-700/60 p-1 flex items-center justify-between">
                                <div className="w-5 h-1 bg-slate-600 rounded" />
                                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                              </div>
                            </div>
                            <div className="h-2 rounded bg-slate-800 border border-slate-700 flex items-center px-1">
                              <div className="w-10 h-1 bg-slate-600 rounded-full" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex">
                            <div className="w-1/2 h-full bg-[#F8FAFC] border-r border-slate-200/80 p-1.5 flex flex-col justify-center gap-1">
                              <div className="w-6 h-1.5 bg-slate-300 rounded" />
                              <div className="w-10 h-1 bg-slate-200 rounded" />
                            </div>
                            <div className="w-1/2 h-full bg-slate-900 p-1.5 flex flex-col justify-center gap-1">
                              <div className="w-6 h-1.5 bg-slate-700 rounded" />
                              <div className="w-10 h-1 bg-slate-800 rounded" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-4 h-4 ${isSelected ? "text-blue-600" : "text-slate-500"}`} />
                          <span className="text-xs font-bold text-slate-900 leading-tight">
                            {theme.name}
                          </span>
                        </div>

                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white shrink-0">
                            <Check className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                            {theme.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                        {theme.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Design System Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-slate-900">
                Light-First Academic Ergonomics
              </h5>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                LearnTrack defaults to a daylight-optimized contrast model designed to maximize focus during long study blocks and prevent visual fatigue while analyzing multidimensional academic metrics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
