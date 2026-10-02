"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Info, ShieldCheck } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { ErrorAnalysisReport } from "@/lib/api/mlOps";

export interface ModelReliabilityCardProps {
  report: ErrorAnalysisReport | null;
}

export function ModelReliabilityCard({ report }: ModelReliabilityCardProps) {
  const meanResidual = report?.residual_analysis?.mean_residual;
  const guidance = report?.residual_analysis?.guidance || [];

  // Determine systematic bias state based on real calculated mean residual
  let biasStatus = "Undetermined";
  let biasVariant: "neutral" | "positive" | "warning" = "neutral";
  let biasDescription = "Awaiting evaluated observations.";

  if (meanResidual !== null && meanResidual !== undefined) {
    if (Math.abs(meanResidual) <= 0.75) {
      biasStatus = "Near-neutral bias";
      biasVariant = "positive";
      biasDescription = "Ideal calibration: prediction residuals average close to zero without directional skew.";
    } else if (Math.abs(meanResidual) <= 1.5) {
      biasStatus = "Minor systematic skew";
      biasVariant = "neutral";
      biasDescription =
        meanResidual > 0
          ? "Slight overall under-prediction bias (+ residuals)."
          : "Slight overall over-prediction bias (- residuals).";
    } else {
      biasStatus = meanResidual > 1.5 ? "Under-prediction skew" : "Over-prediction skew";
      biasVariant = "warning";
      biasDescription = "Significant systematic deviation. Review intercept and normalization.";
    }
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Insight Panel
              </span>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Model Reliability
              </h2>
            </div>
          </div>
          <Tooltip content="Statistical indicators of model bias, error stability, and operational reliability.">
            <span className="cursor-help text-slate-400 hover:text-slate-600">
              <Info className="w-3.5 h-3.5" />
            </span>
          </Tooltip>
        </div>

        {/* Section 1: Mean Residual / Systematic Bias Gauge */}
        <div
          className={`p-3.5 rounded-xl border transition-colors ${
            biasVariant === "positive"
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
              : biasVariant === "warning"
              ? "bg-amber-50/70 border-amber-200 text-amber-950"
              : "bg-blue-50/70 border-blue-200 text-blue-950"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wide uppercase text-slate-600">
              Mean Residual (Systematic Bias)
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                biasVariant === "positive"
                  ? "bg-emerald-100/80 text-emerald-800"
                  : biasVariant === "warning"
                  ? "bg-amber-100/80 text-amber-800"
                  : "bg-blue-100/80 text-blue-800"
              }`}
            >
              {biasVariant === "positive" ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
              ) : biasVariant === "warning" ? (
                <AlertTriangle className="w-3 h-3 text-amber-700" />
              ) : (
                <Info className="w-3 h-3 text-blue-700" />
              )}
              {biasStatus}
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">
              {meanResidual !== null && meanResidual !== undefined
                ? `${meanResidual > 0 ? `+${meanResidual}` : meanResidual} pts`
                : "N/A"}
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              (0.0 is perfect zero-bias)
            </span>
          </div>

          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            {biasDescription}
          </p>
        </div>

        {/* Section 2: Analytical Findings from backend */}
        {guidance.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Analytical Findings
            </p>
            <div className="space-y-2">
              {guidance.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50/80 border border-slate-100 text-slate-700 text-xs leading-relaxed"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  <span className="text-[11px] text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Error Classification Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] space-y-1">
          <span className="font-semibold text-slate-700 block">
            Error Severity Thresholds:
          </span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500 text-[10px]">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Typical Error (&le; 8 pts)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Elevated Error (8–15 pts)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Large Error (&gt; 15 pts)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
