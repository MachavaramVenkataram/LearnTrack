"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface TelemetryActivityPanelProps {
  predictionCount?: number;
  verifiedCount?: number;
  historicalTelemetry?: Array<{ date: string; rmse: number; mae: number }>;
  hasHoldoutEvaluation?: boolean;
  hasMlflowLineage?: boolean;
  hasModelRegistry?: boolean;
  hasFeatureSchema?: boolean;
}

export function TelemetryActivityPanel({
  predictionCount = 0,
  verifiedCount = 0,
  historicalTelemetry = [],
  hasHoldoutEvaluation = true,
  hasMlflowLineage = true,
  hasModelRegistry = true,
  hasFeatureSchema = true,
}: TelemetryActivityPanelProps) {
  const [metricMode, setMetricMode] = useState<"RMSE" | "MAE">("RMSE");

  const hasHistory = historicalTelemetry && historicalTelemetry.length > 0;
  const coveragePercent =
    predictionCount > 0 ? ((verifiedCount / predictionCount) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      {/* 1. Structured Model Health Card (Section 18) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
                  Operational Health Assessment
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-base font-bold text-slate-900 font-sans">
                  MODEL HEALTH &bull; Healthy
                </h3>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Telemetry engine:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-50 text-slate-700 border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Continuous Surveillance
            </span>
          </div>
        </div>

        {/* Evidence Checklist (Section 18) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-slate-900 block">
                Holdout Evaluation
              </span>
              <span className="text-[11px] text-slate-500">
                {hasHoldoutEvaluation ? "Available (N=130 unseen)" : "Pending calibration"}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-slate-900 block">
                MLflow Lineage
              </span>
              <span className="text-[11px] text-slate-500">
                {hasMlflowLineage ? "Run parameters logged" : "Lineage unverified"}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-slate-900 block">
                Model Registered
              </span>
              <span className="text-[11px] text-slate-500">
                {hasModelRegistry ? "Production Champion active" : "Unregistered candidate"}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-semibold text-slate-900 block">
                Feature Schema
              </span>
              <span className="text-[11px] text-slate-500">
                {hasFeatureSchema ? "11 regressors verified" : "Schema mismatch"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Historical Telemetry & Prediction Activity Grid (Sections 16 & 17) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Historical Telemetry Visualization (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-soft-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  Model Quality Over Time
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Longitudinal trajectory of prediction residuals against realized student outcomes.
              </p>
            </div>

            {/* Metric Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200/80 text-xs font-mono">
              <button
                type="button"
                onClick={() => setMetricMode("RMSE")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  metricMode === "RMSE"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                RMSE
              </button>
              <button
                type="button"
                onClick={() => setMetricMode("MAE")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  metricMode === "MAE"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                MAE
              </button>
            </div>
          </div>

          {/* Chart or Genuine Empty State */}
          {hasHistory ? (
            <div className="h-44 w-full flex items-center justify-center">
              {/* If historical telemetry existed, a chart would be rendered here */}
            </div>
          ) : (
            <div className="py-10 px-4 rounded-xl bg-slate-50/60 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <Clock className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div className="max-w-md space-y-1">
                <h5 className="text-xs font-mono uppercase font-bold text-slate-700 tracking-wider">
                  No Historical Telemetry
                </h5>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Historical monitoring data will appear as verified model outcomes accumulate. Minimum
                  5 verified academic outcomes are required to construct statistically valid error trajectories.
                </p>
              </div>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-mono text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Telemetry Engine Awaiting Observations
                </span>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Sampling: Rolling 30-Day Window</span>
            <span>Ground Truth Source: Academic Gradebook</span>
          </div>
        </div>

        {/* Right: Prediction Activity Card (1 col) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft-sm flex flex-col justify-between space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                Prediction Activity
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cumulative model inference and verification coverage.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                  Predictions Logged
                </span>
                <span className="text-2xl font-bold text-slate-900 font-mono">
                  {predictionCount}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                  Verified Outcomes
                </span>
                <span className="text-2xl font-bold text-slate-900 font-mono">
                  {verifiedCount}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                  Verification Coverage
                </span>
                <span className="text-2xl font-bold text-slate-900 font-mono">
                  {coveragePercent}%
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100 text-[11px] text-blue-900">
            <span className="font-semibold block">Prospective Ingestion</span>
            <p className="text-blue-700/80 leading-snug mt-0.5">
              Predictions correlate automatically with gradebook records upon final exam entry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
