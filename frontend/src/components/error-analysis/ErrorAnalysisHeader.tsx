"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ErrorAnalysisHeaderProps {
  evaluationType: "BENCHMARK" | "PRODUCTION";
  onToggleEvaluation: (type: "BENCHMARK" | "PRODUCTION") => void;
  onRefresh: () => void;
  isLoading: boolean;
  isRefreshing: boolean;
  status: string;
}

export function ErrorAnalysisHeader({
  evaluationType,
  onToggleEvaluation,
  onRefresh,
  isLoading,
  isRefreshing,
  status,
}: ErrorAnalysisHeaderProps) {
  const isProduction = evaluationType === "PRODUCTION";
  const isReady = status !== "INSUFFICIENT_DATA" && status !== "ERROR";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
      {/* Title & Category Kicker */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              Model Intelligence
            </span>
          </div>

          {/* Real Status Badge */}
          {isReady ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Evaluation Ready
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Insufficient Data
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Model Error Analysis
        </h1>

        <p className="text-sm text-slate-500 max-w-2xl">
          Understand where prediction errors occur and how model performance changes across different data segments.
        </p>
      </div>

      {/* Top-Right: Regime Segmented Control + Refresh Action */}
      <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
        {/* Segmented Control (Section 3 & 4) */}
        <div
          className="flex items-center bg-[#F1F5F9] p-[3px] rounded-[11px] border border-[#E2E8F0] shadow-2xs"
          role="group"
          aria-label="Evaluation regime selector"
        >
          <button
            type="button"
            onClick={() => onToggleEvaluation("BENCHMARK")}
            disabled={isLoading || isRefreshing}
            title="Held-out validation and test partition data"
            className={`h-[32px] px-3.5 rounded-[8px] text-xs font-medium transition-all duration-180 ease-out select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
              !isProduction
                ? "bg-white text-[#2563EB] shadow-xs font-semibold scale-[1.01]"
                : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50"
            }`}
            aria-pressed={!isProduction}
          >
            Benchmark / Test Split
          </button>

          <button
            type="button"
            onClick={() => onToggleEvaluation("PRODUCTION")}
            disabled={isLoading || isRefreshing}
            title="Live inference predictions paired with verified student feedback"
            className={`h-[32px] px-3.5 rounded-[8px] text-xs font-medium transition-all duration-180 ease-out select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
              isProduction
                ? "bg-white text-[#2563EB] shadow-xs font-semibold scale-[1.01]"
                : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50"
            }`}
            aria-pressed={isProduction}
          >
            Production Feedback
          </button>
        </div>

        {/* Refresh Action Button */}
        <Button
          variant="secondary"
          size="md"
          onClick={onRefresh}
          disabled={isLoading || isRefreshing}
          tooltip="Refresh error analysis calculations"
          leftIcon={
            <RefreshCw
              className={`w-3.5 h-3.5 transition-transform duration-500 ease-out ${
                isRefreshing ? "animate-spin text-blue-600" : "group-hover:rotate-45"
              }`}
            />
          }
          className="h-10 px-3.5 rounded-[10px] text-xs font-semibold text-slate-700 hover:text-slate-900 border-[#E2E8F0] hover:border-[#CBD5E1]"
          aria-label="Refresh error analytics"
        >
          <span>{isRefreshing ? "Refreshing…" : "Refresh"}</span>
        </Button>
      </div>
    </div>
  );
}
