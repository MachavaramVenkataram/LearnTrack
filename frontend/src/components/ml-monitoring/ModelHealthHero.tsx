"use client";

import React from "react";
import Link from "next/link";
import {
  Cpu,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Activity,
  Layers,
  FileText,
  ExternalLink,
  ShieldCheck,
  TrendingDown,
  Clock,
  ChevronRight,
} from "lucide-react";
import { ProductionModelInfo, MonitoringSummary, DriftReport } from "@/lib/api/mlOps";
import { Button } from "@/components/ui/Button";

export interface ModelHealthHeroProps {
  prodModel: ProductionModelInfo | null;
  summary: MonitoringSummary | null;
  driftReport: DriftReport | null;
  onOpenModelCard: () => void;
}

export function ModelHealthHero({
  prodModel,
  summary,
  driftReport,
  onOpenModelCard,
}: ModelHealthHeroProps) {
  const alertStatus = driftReport?.overall_status || summary?.alert_level || "NORMAL";
  const hasData = summary && summary.prediction_count > 0;

  // Determine model status indicator
  let statusBadge = {
    label: "HEALTHY",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
    description: "Model is operating within nominal statistical thresholds.",
  };

  if (!hasData && (!driftReport || driftReport.observations_count === 0)) {
    statusBadge = {
      label: "NO DATA",
      color: "bg-slate-100 text-slate-700 border-slate-200",
      dot: "bg-slate-400",
      icon: Activity,
      description: "Awaiting production observations to evaluate operational status.",
    };
  } else if (alertStatus === "CRITICAL") {
    statusBadge = {
      label: "DEGRADED",
      color: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
      icon: AlertOctagon,
      description: "Significant drift or latency violation detected requiring review.",
    };
  } else if (alertStatus === "WARNING") {
    statusBadge = {
      label: "WARNING",
      color: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
      icon: AlertTriangle,
      description: "Elevated drift or feedback error warning threshold approached.",
    };
  }

  const StatusIcon = statusBadge.icon;

  // Quick stats values strictly without fabricating
  const performanceDisplay =
    summary?.error_metrics?.mae !== null && summary?.error_metrics?.mae !== undefined
      ? `MAE ${summary.error_metrics.mae.toFixed(2)}`
      : summary?.error_metrics?.insufficient_data
      ? "Insufficient data"
      : "—";

  const driftDisplay =
    driftReport?.prediction_drift?.drift_status &&
    driftReport.prediction_drift.drift_status !== "Insufficient Data"
      ? driftReport.prediction_drift.drift_status
      : "Insufficient data";

  const latencyDisplay =
    summary?.latency_metrics?.p95_latency_ms && summary.latency_metrics.p95_latency_ms > 0
      ? `${summary.latency_metrics.p95_latency_ms.toFixed(1)}ms`
      : "—";

  const coverageDisplay =
    summary?.coverage_percentage !== undefined && summary.prediction_count > 0
      ? `${summary.coverage_percentage.toFixed(1)}% (${summary.feedback_count} verified)`
      : summary?.feedback_count && summary.feedback_count > 0
      ? `${summary.feedback_count} verified`
      : "—";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200/90 shadow-xs p-6 transition-all duration-200">
      {/* Decorative technical accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Active Model Identification */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              Active Production Model
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
              <StatusIcon className="w-3 h-3" />
              {statusBadge.label}
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {prodModel?.model_name || "Ridge Regression"}
            </h2>
            <button
              type="button"
              onClick={onOpenModelCard}
              title="Click to view model specification and lineage"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-[8px] bg-blue-50/80 text-blue-700 hover:bg-blue-100 hover:border-blue-300 border border-blue-200/80 transition-all duration-160 cursor-pointer active:scale-95 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              v{prodModel?.model_version || "1.0.0"}
              <ChevronRight className="w-3 h-3 text-blue-500 transition-transform duration-160 group-hover:translate-x-0.5" />
            </button>
          </div>

          <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>
              Run ID:{" "}
              <span className="font-mono font-medium text-slate-800">
                {prodModel?.run_id ? `${prodModel.run_id.slice(0, 10)}...` : "mlruns"}
              </span>
            </span>
            <span className="text-slate-300">•</span>
            <span>
              Dataset:{" "}
              <span className="font-mono font-medium text-slate-800">
                v{prodModel?.dataset_version || "1.0.0"}
              </span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{statusBadge.description}</span>
          </p>
        </div>

        {/* Right Side: Aligned Action Group (Section 7, 8, 9) */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="secondary"
            size="md"
            onClick={onOpenModelCard}
            tooltip="View model architecture, features & evaluation benchmarks"
            leftIcon={
              <FileText className="w-4 h-4 text-blue-600 transition-transform duration-180 ease-out group-hover:-translate-y-0.5" />
            }
            className="h-10 px-3.5 rounded-[10px] text-[13px] font-semibold text-slate-800 hover:text-slate-950 border-[#E2E8F0] hover:border-[#BFDBFE] hover:bg-[#F8FAFF]"
          >
            Model Card
          </Button>

          <Link href="/experiments" tabIndex={-1}>
            <Button
              variant="secondary"
              size="md"
              tooltip="Inspect MLflow runs and training experiment registry"
              leftIcon={
                <Layers className="w-4 h-4 text-indigo-600 transition-transform duration-180 ease-out group-hover:rotate-6" />
              }
              className="h-10 px-3.5 rounded-[10px] text-[13px] font-semibold text-slate-800 hover:text-slate-950 border-[#E2E8F0] hover:border-[#BFDBFE] hover:bg-[#F8FAFF]"
            >
              View Experiments
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Metrics Strip */}
      <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Performance
          </span>
          <p className="text-sm font-bold font-mono text-slate-800 truncate">
            {performanceDisplay}
          </p>
          <span className="text-[10px] text-slate-500 block">Verified error</span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Drift Status
          </span>
          <p className="text-sm font-bold font-mono text-slate-800 truncate">
            {driftDisplay}
          </p>
          <span className="text-[10px] text-slate-500 block">Feature stability</span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            P95 Latency
          </span>
          <p className="text-sm font-bold font-mono text-blue-600 truncate">
            {latencyDisplay}
          </p>
          <span className="text-[10px] text-slate-500 block">Inference speed</span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Feedback Coverage
          </span>
          <p className="text-sm font-bold font-mono text-slate-800 truncate">
            {coverageDisplay}
          </p>
          <span className="text-[10px] text-slate-500 block">Ground truth</span>
        </div>
      </div>
    </div>
  );
}
