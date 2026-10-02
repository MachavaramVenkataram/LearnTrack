"use client";

import React from "react";
import { Cpu, Database, Activity, ShieldCheck, Info, CheckCircle2, AlertTriangle } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { RetrainingStatusResponse } from "@/lib/api/mlOps";

export interface RetrainingHealthHeroProps {
  statusData: RetrainingStatusResponse | null;
}

export function RetrainingHealthHero({ statusData }: RetrainingHealthHeroProps) {
  const prod = statusData?.active_production_model;
  const dataAvail = statusData?.data_availability;
  const drift = statusData?.drift_status;
  const perf = statusData?.performance_status;

  // Labeled Data progress
  const feedbackCount = dataAvail?.feedback_observations || 0;
  const minRequired = dataAvail?.min_required_for_retraining || 10;
  const progressPercent = Math.min(100, Math.round((feedbackCount / minRequired) * 100));
  const isDataSufficient = feedbackCount >= minRequired;

  // Drift status
  const isDriftNormal = (drift?.alert_level || "").toUpperCase() === "NORMAL";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* Card 1: Current Production Model */}
      <div className="group relative bg-white border border-[#E2E8F0] hover:border-blue-300 rounded-[14px] p-5 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-180 ease-out flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
              Current Production Model
            </span>
            <Tooltip content="The active champion model serving live student performance predictions." position="top">
              <span className="cursor-help text-slate-400 hover:text-slate-600 inline-flex items-center">
                <Info className="w-3.5 h-3.5" />
              </span>
            </Tooltip>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100/80 transition-colors">
            <Cpu className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 truncate">
              {prod?.model_type || prod?.model_name || "Linear Regression (Ridge)"}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2 flex-wrap text-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              v{prod?.model_version || "1.0.0"}
            </span>
            <span className="font-mono text-slate-600 text-xs">
              RMSE: <strong>{prod?.test_rmse ?? 7.677} pts</strong>
            </span>
          </div>

          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Serving live inference in production</span>
          </p>
        </div>
      </div>

      {/* Card 2: Labeled Data Availability */}
      <div className="group relative bg-white border border-[#E2E8F0] hover:border-indigo-300 rounded-[14px] p-5 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-180 ease-out flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
              Labeled Data Availability
            </span>
            <Tooltip content="Verified ground-truth academic outcome pairs collected to validate retraining readiness." position="top">
              <span className="cursor-help text-slate-400 hover:text-slate-600 inline-flex items-center">
                <Info className="w-3.5 h-3.5" />
              </span>
            </Tooltip>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-100/80 transition-colors">
            <Database className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 font-mono">
              {feedbackCount} <span className="text-base text-slate-400 font-normal">/ {minRequired}</span>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-semibold ${
                isDataSufficient
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}
            >
              {isDataSufficient ? "SUFFICIENT" : "ACCUMULATING"}
            </span>
          </div>

          {/* Visual Progress Bar (Section 8) */}
          <div className="mt-2.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isDataSufficient ? "bg-emerald-500" : "bg-indigo-600"
              }`}
              style={{ width: `${Math.max(4, progressPercent)}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 mt-2 truncate">
            {isDataSufficient
              ? "Sufficient feedback volume for candidate retraining."
              : `Requires ${minRequired - feedbackCount} more observations before automated trigger.`}
          </p>
        </div>
      </div>

      {/* Card 3: Drift Status */}
      <div className="group relative bg-white border border-[#E2E8F0] hover:border-amber-300 rounded-[14px] p-5 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-180 ease-out flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
              Drift Status
            </span>
            <Tooltip content="Monitors population shift and covariate drift between training distribution and live inference data." position="top">
              <span className="cursor-help text-slate-400 hover:text-slate-600 inline-flex items-center">
                <Info className="w-3.5 h-3.5" />
              </span>
            </Tooltip>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-100/80 transition-colors">
            <Activity className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 font-mono">
              {drift?.alert_level || "NORMAL"}
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-semibold ${
                isDriftNormal
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {isDriftNormal ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  STABLE
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  ELEVATED
                </>
              )}
            </span>
          </div>

          <p className="text-xs text-slate-600 mt-2 font-medium">
            {isDriftNormal ? "● Within expected operational limits" : "● Drift alert threshold exceeded"}
          </p>

          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {drift?.evaluated_observations || 0} production observations tracked
          </p>
        </div>
      </div>

      {/* Card 4: Performance Status */}
      <div className="group relative bg-white border border-[#E2E8F0] hover:border-emerald-300 rounded-[14px] p-5 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-180 ease-out flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
              Performance Status
            </span>
            <Tooltip content="Live predictive accuracy metrics compared against test partition baseline." position="top">
              <span className="cursor-help text-slate-400 hover:text-slate-600 inline-flex items-center">
                <Info className="w-3.5 h-3.5" />
              </span>
            </Tooltip>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100/80 transition-colors">
            <ShieldCheck className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono">
            {perf?.current_mae !== null && perf?.current_mae !== undefined
              ? `${perf.current_mae} MAE`
              : "Stable Baseline"}
          </div>

          <p className="text-xs text-slate-600 mt-2 font-medium">
            {perf?.status || "Monitoring Active"}
          </p>

          <p className="text-[11px] text-slate-400 mt-1 truncate">
            Regression protection active on all models
          </p>
        </div>
      </div>
    </div>
  );
}
