"use client";

import React from "react";
import Link from "next/link";
import { History, AlertTriangle, RefreshCw, Cpu } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";

import { MLHealthState } from "@/lib/api/ml";

export interface PredictionHeaderProps {
  mlServiceHealthy?: boolean | null;
  healthState?: MLHealthState;
  modelVersion?: string;
  onRetryHealthCheck?: () => void;
  isCheckingHealth?: boolean;
}

export function PredictionHeader({
  mlServiceHealthy,
  healthState,
  modelVersion = "v1.0.0",
  onRetryHealthCheck,
  isCheckingHealth = false,
}: PredictionHeaderProps) {
  // Resolve effective health state
  const effectiveState: MLHealthState = isCheckingHealth
    ? "CHECKING"
    : healthState ||
      (mlServiceHealthy === null
        ? "CHECKING"
        : mlServiceHealthy
        ? "ONLINE"
        : "OFFLINE");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
      <div>
        {/* System Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            <Cpu className="w-3 h-3 text-slate-500" />
            LearnTrack ML {modelVersion}
          </span>

          {effectiveState === "CHECKING" ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Checking...
            </span>
          ) : effectiveState === "ONLINE" ? (
            <Tooltip
              content="LearnTrack's ML prediction service is reachable and the trained model is active."
              position="bottom"
            >
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 cursor-default hover:bg-emerald-100/60 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Model Online
              </button>
            </Tooltip>
          ) : effectiveState === "MODEL_ERROR" ? (
            <div className="flex items-center gap-1.5">
              <Tooltip
                content="FastAPI service is reachable, but model artifacts failed to load or are warming up."
                position="bottom"
              >
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Model Error
                </span>
              </Tooltip>
              {onRetryHealthCheck && (
                <button
                  type="button"
                  onClick={onRetryHealthCheck}
                  disabled={isCheckingHealth}
                  className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded-md hover:bg-slate-100"
                  title="Retry connection"
                >
                  <RefreshCw className={`w-3 h-3 ${isCheckingHealth ? "animate-spin" : ""}`} />
                  Retry
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Tooltip
                content="FastAPI ML service is unreachable. Ensure the backend is running."
                position="bottom"
              >
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  Model Offline
                </span>
              </Tooltip>
              {onRetryHealthCheck && (
                <button
                  type="button"
                  onClick={onRetryHealthCheck}
                  disabled={isCheckingHealth}
                  className="text-[11px] text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded-md hover:bg-slate-100"
                  title="Retry connection"
                >
                  <RefreshCw className={`w-3 h-3 ${isCheckingHealth ? "animate-spin" : ""}`} />
                  Retry
                </button>
              )}
            </div>
          )}
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Academic Performance Prediction
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Estimate your expected academic outcome using your current performance data and LearnTrack&apos;s ML prediction engine.
        </p>
      </div>

      {/* Header Action: Prediction History Button (Section 3) */}
      <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
        <Link
          href="/prediction/history"
          className="group inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl shadow-2xs hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all duration-150 ease-out active:scale-[0.98]"
        >
          <History className="w-4 h-4 text-slate-500 group-hover:text-blue-600 group-hover:rotate-[-8deg] transition-transform duration-160 ease-out" />
          <span>Prediction History</span>
        </Link>
      </div>
    </div>
  );
}
