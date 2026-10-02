"use client";

import React from "react";
import {
  Lightbulb,
  Sparkles,
  SlidersHorizontal,
  Loader2,
} from "lucide-react";
import { PremiumActionButton } from "@/components/ui/PremiumActionButton";

interface InsightsHeaderProps {
  onRunPrediction: () => void;
  isPredicting: boolean;
}

export function InsightsHeader({
  onRunPrediction,
  isPredicting,
}: InsightsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200/80">
      {/* Left: 40px Icon + Title + Identity */}
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-10 h-10 rounded-[11px] bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 shadow-xs hover:scale-104 transition-transform duration-200">
          <Lightbulb className="w-5 h-5 text-blue-600" />
        </div>

        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
              LearnTrack Insights
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/70">
              Explainable academic intelligence
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Understand what is influencing your academic performance and where to focus next.
          </p>
        </div>
      </div>

      {/* Right: Actions using PremiumActionButton */}
      <div className="flex items-center gap-2.5 shrink-0">
        <PremiumActionButton
          href="/simulator"
          label="Open What-If Simulator"
          variant="intelligence"
          icon={<SlidersHorizontal className="w-4 h-4" />}
        />

        <button
          type="button"
          onClick={onRunPrediction}
          disabled={isPredicting}
          className="group inline-flex items-center gap-2 h-[42px] px-4 rounded-[11px] bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-[13px] shadow-xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-160 ease-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
        >
          {isPredicting ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Sparkles className="w-4 h-4 text-blue-100 group-hover:scale-110 transition-transform duration-160" />
          )}
          <span>{isPredicting ? "Running Prediction..." : "Run Prediction"}</span>
        </button>
      </div>
    </div>
  );
}
