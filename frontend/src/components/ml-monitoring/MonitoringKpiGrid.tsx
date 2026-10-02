"use client";

import React from "react";
import {
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  Gauge,
  Sliders,
  AlertCircle,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { MonitoringSummary, DriftReport } from "@/lib/api/mlOps";

export type KpiKey =
  | "predictions"
  | "coverage"
  | "mae"
  | "rmse"
  | "drift"
  | "latency";

export interface MonitoringKpiGridProps {
  summary: MonitoringSummary | null;
  driftReport: DriftReport | null;
  windowDays: number;
  onSelectKpi: (key: KpiKey) => void;
}

export function MonitoringKpiGrid({
  summary,
  driftReport,
  windowDays,
  onSelectKpi,
}: MonitoringKpiGridProps) {
  const cards: Array<{
    key: KpiKey;
    label: string;
    value: string;
    subtext: string;
    tag: string;
    tagColor: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }> = [
    {
      key: "predictions",
      label: "Predictions",
      value:
        summary && summary.prediction_count !== undefined
          ? summary.prediction_count.toLocaleString()
          : "—",
      subtext: `Window: ${windowDays} days`,
      tag: summary && summary.prediction_count > 0 ? "Active inference" : "Awaiting data",
      tagColor: summary && summary.prediction_count > 0 ? "text-emerald-700 bg-emerald-50" : "text-slate-500 bg-slate-100",
      icon: Activity,
      accentColor: "text-blue-600",
    },
    {
      key: "coverage",
      label: "Coverage",
      value:
        summary && summary.prediction_count > 0 && summary.coverage_percentage !== undefined
          ? `${summary.coverage_percentage.toFixed(1)}%`
          : summary && summary.feedback_count > 0
          ? `${summary.feedback_count} verified`
          : "—",
      subtext: `${summary?.feedback_count ?? 0} verified outcomes`,
      tag:
        summary && summary.coverage_percentage > 10
          ? "Good sample"
          : summary && summary.feedback_count > 0
          ? "Low coverage"
          : "Zero verified",
      tagColor:
        summary && summary.coverage_percentage > 10
          ? "text-emerald-700 bg-emerald-50"
          : "text-amber-700 bg-amber-50",
      icon: CheckCircle2,
      accentColor: "text-emerald-600",
    },
    {
      key: "mae",
      label: "Current MAE",
      value:
        summary?.error_metrics?.mae !== null && summary?.error_metrics?.mae !== undefined
          ? summary.error_metrics.mae.toFixed(2)
          : "—",
      subtext: summary?.error_metrics?.insufficient_data
        ? "Insufficient data (< 5 verified)"
        : "Real-world error",
      tag:
        summary?.error_metrics?.mae !== null && summary?.error_metrics?.mae !== undefined
          ? summary.error_metrics.mae < 6.0
            ? "Within target"
            : "Elevated error"
          : "Needs feedback",
      tagColor:
        summary?.error_metrics?.mae !== null && summary?.error_metrics?.mae !== undefined
          ? summary.error_metrics.mae < 6.0
            ? "text-emerald-700 bg-emerald-50"
            : "text-amber-700 bg-amber-50"
          : "text-slate-500 bg-slate-100",
      icon: TrendingUp,
      accentColor: "text-indigo-600",
    },
    {
      key: "rmse",
      label: "Current RMSE",
      value:
        summary?.error_metrics?.rmse !== null && summary?.error_metrics?.rmse !== undefined
          ? summary.error_metrics.rmse.toFixed(2)
          : "—",
      subtext: summary?.error_metrics?.insufficient_data
        ? "Insufficient data (< 5 verified)"
        : "Root mean square error",
      tag:
        summary?.error_metrics?.rmse !== null && summary?.error_metrics?.rmse !== undefined
          ? summary.error_metrics.rmse < 8.0
            ? "Optimal"
            : "Monitor"
          : "Needs feedback",
      tagColor:
        summary?.error_metrics?.rmse !== null && summary?.error_metrics?.rmse !== undefined
          ? summary.error_metrics.rmse < 8.0
            ? "text-emerald-700 bg-emerald-50"
            : "text-amber-700 bg-amber-50"
          : "text-slate-500 bg-slate-100",
      icon: Gauge,
      accentColor: "text-purple-600",
    },
    {
      key: "drift",
      label: "Prediction Drift",
      value:
        driftReport?.prediction_drift?.drift_status &&
        driftReport.prediction_drift.drift_status !== "Insufficient Data"
          ? driftReport.prediction_drift.drift_status
          : "Insufficient data",
      subtext:
        driftReport?.observations_count && driftReport.observations_count >= 10
          ? "PSI vs reference curve"
          : `${driftReport?.observations_count ?? 0}/10 observations`,
      tag:
        driftReport?.prediction_drift?.drift_status === "Low Drift"
          ? "Stable"
          : driftReport?.prediction_drift?.drift_status === "Moderate Drift"
          ? "Warning"
          : driftReport?.prediction_drift?.drift_status === "High Drift"
          ? "High drift"
          : "Collecting data",
      tagColor:
        driftReport?.prediction_drift?.drift_status === "Low Drift"
          ? "text-emerald-700 bg-emerald-50"
          : driftReport?.prediction_drift?.drift_status === "Moderate Drift"
          ? "text-amber-700 bg-amber-50"
          : driftReport?.prediction_drift?.drift_status === "High Drift"
          ? "text-rose-700 bg-rose-50"
          : "text-slate-500 bg-slate-100",
      icon: Sliders,
      accentColor: "text-sky-600",
    },
    {
      key: "latency",
      label: "P95 Latency",
      value:
        summary?.latency_metrics?.p95_latency_ms && summary.latency_metrics.p95_latency_ms > 0
          ? `${summary.latency_metrics.p95_latency_ms.toFixed(1)}ms`
          : "—",
      subtext:
        summary?.latency_metrics?.sample_count && summary.latency_metrics.sample_count > 0
          ? `${summary.latency_metrics.sample_count} request samples`
          : "Inference response time",
      tag:
        summary?.latency_metrics?.p95_latency_ms && summary.latency_metrics.p95_latency_ms > 0
          ? summary.latency_metrics.p95_latency_ms < 50
            ? "Fast (<50ms)"
            : "Acceptable"
          : "No requests",
      tagColor:
        summary?.latency_metrics?.p95_latency_ms && summary.latency_metrics.p95_latency_ms > 0
          ? "text-emerald-700 bg-emerald-50"
          : "text-slate-500 bg-slate-100",
      icon: Clock,
      accentColor: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelectKpi(card.key)}
            title={`Click to inspect ${card.label} statistical definition & thresholds`}
            className="group relative bg-white border border-slate-200/90 rounded-[12px] p-3.5 text-left shadow-2xs hover:shadow-xs hover:border-blue-300 hover:bg-slate-50/60 hover:-translate-y-[1px] active:scale-[0.98] active:translate-y-0 transition-all duration-180 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 select-none"
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {card.label}
              </span>
              <Icon className={`w-3.5 h-3.5 ${card.accentColor} transition-transform duration-200 group-hover:scale-110`} />
            </div>

            {/* Value */}
            <p className="text-xl font-bold font-mono text-slate-900 tracking-tight truncate mb-1">
              {card.value}
            </p>

            {/* Tag / Status indicator */}
            <div className="mb-2">
              <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.5 rounded ${card.tagColor}`}>
                {card.tag}
              </span>
            </div>

            {/* Subtext explanation */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-2">
              <span className="truncate">{card.subtext}</span>
              <ChevronRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
