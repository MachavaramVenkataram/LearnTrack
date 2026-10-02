"use client";

import React, { useEffect } from "react";
import {
  X,
  Activity,
  CheckCircle2,
  Clock,
  Gauge,
  Sliders,
  AlertTriangle,
  Info,
  TrendingDown,
  TrendingUp,
  Layers,
  Database,
  Calculator,
} from "lucide-react";
import { MonitoringSummary, DriftReport } from "@/lib/api/mlOps";
import { KpiKey } from "./MonitoringKpiGrid";
import { Button } from "@/components/ui/Button";

export interface KpiDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  kpiKey: KpiKey | null;
  summary: MonitoringSummary | null;
  driftReport: DriftReport | null;
  windowDays: number;
}

export function KpiDetailDrawer({
  isOpen,
  onClose,
  kpiKey,
  summary,
  driftReport,
  windowDays,
}: KpiDetailDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !kpiKey) return null;

  const predCount = summary?.prediction_count ?? 0;
  const feedbackCount = summary?.feedback_count ?? 0;
  const coveragePct = summary?.coverage_percentage ?? 0;
  const maeVal = summary?.error_metrics?.mae ?? null;
  const rmseVal = summary?.error_metrics?.rmse ?? null;
  const p95Val = summary?.latency_metrics?.p95_latency_ms ?? null;
  const avgLat = summary?.latency_metrics?.avg_latency_ms ?? null;
  const p50Lat = summary?.latency_metrics?.median_latency_ms ?? null;
  const driftStatus = driftReport?.prediction_drift?.drift_status ?? "Insufficient Data";

  const getKpiDetails = () => {
    switch (kpiKey) {
      case "predictions":
        return {
          title: "Inference Volume",
          metricName: "Total Predictions",
          currentValue: predCount > 0 ? predCount.toLocaleString() : "—",
          statusText: predCount > 0 ? "Production Active" : "No Traffic in Window",
          statusColor: predCount > 0 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-slate-600 bg-slate-50 border-slate-200",
          definition: "Total number of student score inferences executed by the production model within the selected time window.",
          formula: "Count(Inference_Logs[timestamp >= now() - window])",
          dataAvailable: `${predCount} prediction events recorded in ${windowDays}D window`,
          thresholds: [
            { label: "Nominal", value: "> 0 requests / day", desc: "Pipeline active" },
            { label: "High Volume", value: "> 5,000 requests / day", desc: "Capacity monitoring recommended" },
          ],
          interpretation: "A sudden drop in prediction volume could indicate client integration disruption or upstream data pipeline errors.",
        };
      case "coverage":
        return {
          title: "Ground-Truth Coverage",
          metricName: "Verified Feedback Ratio",
          currentValue: predCount > 0 ? `${coveragePct.toFixed(1)}%` : "—",
          statusText: coveragePct >= 10 ? "Optimal Coverage" : feedbackCount > 0 ? "Low Coverage" : "Awaiting Outcomes",
          statusColor: coveragePct >= 10 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-amber-700 bg-amber-50 border-amber-200",
          definition: "Proportion of production inferences that have been paired with verified student exam outcomes (ground truth).",
          formula: "(Verified_Outcomes / Total_Predictions) * 100",
          dataAvailable: `${feedbackCount} verified outcomes out of ${predCount} total predictions`,
          thresholds: [
            { label: "Recommended", value: ">= 10.0%", desc: "Sufficient for statistical drift & error validation" },
            { label: "Minimal", value: ">= 5.0%", desc: "Permits basic MAE/RMSE calculation" },
          ],
          interpretation: "Higher ground-truth coverage provides higher confidence when evaluating whether model performance is holding up against actual student results.",
        };
      case "mae":
        return {
          title: "Mean Absolute Error (MAE)",
          metricName: "Average Prediction Discrepancy",
          currentValue: maeVal !== null ? maeVal.toFixed(2) : "—",
          statusText: maeVal !== null ? "Empirically Measured" : "Insufficient Outcomes",
          statusColor: maeVal !== null ? "text-blue-700 bg-blue-50 border-blue-200" : "text-slate-600 bg-slate-50 border-slate-200",
          definition: "Average absolute difference between the predicted exam scores and the actual student scores verified by instructors.",
          formula: "(1 / n) * Σ |y_actual - y_predicted|",
          dataAvailable: `${feedbackCount} verified outcome pairs evaluated`,
          thresholds: [
            { label: "Training Benchmark", value: "4.49 pts", desc: "Held-out test set baseline" },
            { label: "Warning Drift", value: "> 6.50 pts", desc: "Model degrading in production" },
          ],
          interpretation: "MAE represents average point error on a 0–100 scale. If production MAE increases significantly above 4.49, investigate input feature drift.",
        };
      case "rmse":
        return {
          title: "Root Mean Squared Error (RMSE)",
          metricName: "Quadratic Error Metric",
          currentValue: rmseVal !== null ? rmseVal.toFixed(2) : "—",
          statusText: rmseVal !== null ? "Empirically Measured" : "Insufficient Outcomes",
          statusColor: rmseVal !== null ? "text-blue-700 bg-blue-50 border-blue-200" : "text-slate-600 bg-slate-50 border-slate-200",
          definition: "Square root of the average squared difference between predictions and actuals. Heavily penalizes large, unacceptable outlier prediction errors.",
          formula: "sqrt((1 / n) * Σ (y_actual - y_predicted)²)",
          dataAvailable: `${feedbackCount} verified outcome pairs evaluated`,
          thresholds: [
            { label: "Training Benchmark", value: "7.68 pts", desc: "Held-out test set baseline" },
            { label: "Warning Drift", value: "> 10.0 pts", desc: "Elevated high-error outliers" },
          ],
          interpretation: "RMSE amplifies large discrepancies. A large gap between RMSE and MAE indicates isolated students with very high prediction errors.",
        };
      case "drift":
        return {
          title: "Prediction Drift",
          metricName: "Output Distribution Shift",
          currentValue: driftStatus,
          statusText: driftStatus === "Low Drift" ? "Distribution Stable" : driftStatus,
          statusColor: driftStatus === "Low Drift" ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-amber-700 bg-amber-50 border-amber-200",
          definition: "Quantitative divergence between the prediction score distribution in training versus active production requests.",
          formula: "PSI = Σ ((Actual% - Expected%) * ln(Actual% / Expected%))",
          dataAvailable: `${driftReport?.observations_count ?? 0} observations evaluated against baseline`,
          thresholds: [
            { label: "Low Drift (Nominal)", value: "PSI < 0.10", desc: "Stable population" },
            { label: "Moderate Drift", value: "0.10 <= PSI < 0.25", desc: "Monitor trend closely" },
            { label: "High Drift", value: "PSI >= 0.25", desc: "Action required; schedule retraining" },
          ],
          interpretation: "Even when ground truth is unavailable, prediction drift can immediately signal shifts in student cohorts or grading distributions.",
        };
      case "latency":
        return {
          title: "Inference Latency (P95)",
          metricName: "95th Percentile Execution Time",
          currentValue: p95Val !== null ? `${p95Val.toFixed(1)} ms` : "—",
          statusText: p95Val !== null && p95Val < 250 ? "Within SLA" : "Monitored",
          statusColor: p95Val !== null && p95Val < 250 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-slate-600 bg-slate-50 border-slate-200",
          definition: "The response time beneath which 95% of model inference requests complete.",
          formula: "Percentile_95(Inference_Duration_ms)",
          dataAvailable: `${predCount} inference executions measured`,
          thresholds: [
            { label: "Target SLA", value: "< 250 ms", desc: "Standard production performance" },
            { label: "Elevated", value: "> 500 ms", desc: "FastAPI server resource contention" },
          ],
          interpretation: "P95 latency captures worst-case response times for end users, isolating cold starts and queue spikes.",
        };
    }
  };

  const details = getKpiDetails();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 bg-slate-50/60 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                KPI Deep Dive
              </span>
              <h2 className="text-lg font-bold text-slate-900">
                {details.title}
              </h2>
              <p className="text-xs text-slate-500">
                {details.metricName}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              tooltip="Close deep dive (Esc)"
              aria-label="Close KPI details drawer"
              className="text-slate-400 hover:text-slate-700 rounded-[8px]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Metric Card */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Window: {windowDays} Days
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${details.statusColor}`}>
                  {details.statusText}
                </span>
              </div>

              <div>
                <p className="text-3xl font-bold font-mono text-slate-900 tracking-tight">
                  {details.currentValue}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {details.dataAvailable}
                </p>
              </div>

              {kpiKey === "latency" && avgLat !== null && (
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Mean:</span>{" "}
                    <span className="font-mono font-semibold text-slate-700">{avgLat.toFixed(1)} ms</span>
                  </div>
                  <div>
                    <span className="text-slate-400">P50:</span>{" "}
                    <span className="font-mono font-semibold text-slate-700">{p50Lat !== null ? p50Lat.toFixed(1) + " ms" : "—"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Definition */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                Definition
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {details.definition}
              </p>
            </div>

            {/* Formula */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-slate-600" />
                Calculation Method
              </h3>
              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto">
                <code>{details.formula}</code>
              </div>
            </div>

            {/* Operational Thresholds */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Operational Reference Thresholds
              </h3>
              <div className="space-y-2">
                {details.thresholds.map((th, i) => (
                  <div key={i} className="p-3 bg-white border border-slate-200 rounded-xl text-xs flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">{th.label}</p>
                      <p className="text-[11px] text-slate-400">{th.desc}</p>
                    </div>
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-md">
                      {th.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Interpretation */}
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-950 space-y-1">
              <p className="font-bold">Operational Guidance</p>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                {details.interpretation}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-end">
            <Button
              variant="secondary"
              size="md"
              onClick={onClose}
              className="h-9 px-4 rounded-[10px] text-xs font-semibold"
            >
              Close Deep Dive
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
