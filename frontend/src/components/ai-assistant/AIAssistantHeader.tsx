"use client";

import React from "react";
import {
  BrainCircuit,
  CalendarDays,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { PremiumActionButton } from "@/components/ui/PremiumActionButton";

interface AIAssistantHeaderProps {
  isContextReady: boolean;
  isLeftSidebarOpen: boolean;
  isRightContextOpen: boolean;
  onToggleLeftSidebar: () => void;
  onToggleRightContext: () => void;
}

export function AIAssistantHeader({
  isContextReady,
  isLeftSidebarOpen,
  isRightContextOpen,
  onToggleLeftSidebar,
  onToggleRightContext,
}: AIAssistantHeaderProps) {
  return (
    <header className="h-16 px-4 sm:px-6 border-b border-slate-200/80 bg-white/90 backdrop-blur-xs flex items-center justify-between shrink-0 z-20">
      {/* Left: Sidebar toggle + 40px icon + Titles */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleLeftSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          title={isLeftSidebarOpen ? "Hide conversations sidebar" : "Show conversations sidebar"}
          aria-label="Toggle conversations sidebar"
        >
          {isLeftSidebarOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4" />
          )}
        </button>

        {/* 40px soft blue container with BrainCircuit icon */}
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 shadow-xs hover:scale-104 transition-transform duration-200">
          <BrainCircuit className="w-5 h-5" />
        </div>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight font-sans">
              LearnTrack AI
            </h1>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded-full hidden sm:inline-flex">
              Academic Intelligence
            </span>
            <span className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1.5" title="LearnTrack AI Powered by Google Gemini">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Powered by Gemini
            </span>

            {/* Context Status Indicator */}
            {isContextReady ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Context Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Context Limited
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 hidden md:block">
            Context-aware academic guidance grounded in your LearnTrack workspace.
          </p>
        </div>
      </div>

      {/* Right: Open Study Plan & Context panel toggle */}
      <div className="flex items-center gap-2.5">
        <PremiumActionButton
          href="/study-plan"
          label="Open Study Plan"
          variant="secondary"
          icon={<CalendarDays className="w-4 h-4" />}
          className="hidden sm:inline-flex"
        />

        <button
          onClick={onToggleRightContext}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          title={isRightContextOpen ? "Hide academic context" : "Show academic context"}
          aria-label="Toggle academic context panel"
        >
          {isRightContextOpen ? (
            <PanelRightClose className="w-4 h-4" />
          ) : (
            <PanelRightOpen className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}
