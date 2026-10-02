"use client";

import React, { useEffect } from "react";
import {
  X,
  Activity,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Info,
  Layers,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { FeatureDriftItem } from "@/lib/api/mlOps";
import { Button } from "@/components/ui/Button";

export interface FeatureDriftDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  feature: FeatureDriftItem | null;
  observationsCount: number;
}

export function FeatureDriftDrawer({
  isOpen,
  onClose,
  feature,
  observationsCount,
}: FeatureDriftDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !feature) return null;

  const isLow = feature.status === "Low Drift";
  const isMod = feature.status === "Moderate Drift";
  const isHigh = feature.status === "High Drift";
  const isInsuff = feature.status === "Insufficient Data" || observationsCount < 10;

  // Approximate normal bell curves for baseline vs current if means are available
  const hasMeans = feature.reference_mean !== null && feature.current_mean !== null && !isInsuff;

  // Generate synthetic points for standard distribution curves strictly based on real means
  const refMean = feature.reference_mean ?? 50;
  const curMean = feature.current_mean ?? refMean;
  const spread = 15;

  const pointsCount = 40;
  const minX = Math.min(refMean, curMean) - spread * 2.5;
  const maxX = Math.max(refMean, curMean) + spread * 2.5;
  const step = (maxX - minX) / pointsCount;

  const curveData: Array<{ x: number; refY: number; curY: number }> = [];
  if (hasMeans) {
    for (let i = 0; i <= pointsCount; i++) {
      const x = minX + i * step;
      // Normal distribution density formula
      const refY = Math.exp(-0.5 * Math.pow((x - refMean) / spread, 2));
      const curY = Math.exp(-0.5 * Math.pow((x - curMean) / spread, 2));
      curveData.push({ x: Math.round(x * 10) / 10, refY: refY * 80, curY: curY * 80 });
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 bg-slate-50/60 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Sliders className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Feature Observability
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 font-mono">
                {feature.feature_name}
              </h2>
              <p className="text-xs text-slate-500">
                Data type: <span className="font-semibold text-slate-700">{feature.feature_type}</span>
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              tooltip="Close inspector (Esc)"
              aria-label="Close feature details drawer"
              className="text-slate-400 hover:text-slate-700 rounded-[8px]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status Callout */}
            <div
              className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                isHigh
                  ? "bg-rose-50 border-rose-200 text-rose-900"
                  : isMod
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : isLow
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-slate-50 border-slate-200 text-slate-700"
              }`}
            >
              {isHigh && <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              {isMod && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
              {isLow && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {isInsuff && <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />}
              <div className="space-y-1">
                <p className="font-bold">
                  Status: {feature.status}
                </p>
                <p className="text-[11px] leading-relaxed">
                  {isHigh
                    ? "Substantial distribution divergence observed between training baseline and active production requests."
                    : isMod
                    ? "Moderate shift observed. Recommend tracking closely over the next window."
                    : isLow
                    ? "Feature distribution aligns closely with baseline training references."
                    : "At least 10 production observations are required to calculate statistically sound drift metrics."}
                </p>
              </div>
            </div>

            {/* Empirical Statistics Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Distribution Metrics
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] text-slate-500">Baseline Mean</p>
                  <p className="text-base font-bold font-mono text-slate-900 mt-1">
                    {feature.reference_mean !== null ? feature.reference_mean.toFixed(2) : "—"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Training dataset reference</p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-[11px] text-slate-500">Production Mean</p>
                  <p className="text-base font-bold font-mono text-slate-900 mt-1">
                    {feature.current_mean !== null ? feature.current_mean.toFixed(2) : "—"}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {observationsCount} sample{observationsCount === 1 ? "" : "s"} observed
                  </p>
                </div>
              </div>
            </div>

            {/* Statistical Tests */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Drift Test Statistics
              </h3>
              <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden text-xs">
                <div className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-700">Population Stability Index (PSI)</span>
                    <p className="text-[10px] text-slate-400">Target threshold: &lt; 0.10 (stable)</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {feature.metric_value !== null ? feature.metric_value.toFixed(4) : "—"}
                  </span>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-700">Kolmogorov-Smirnov Statistic (D)</span>
                    <p className="text-[10px] text-slate-400">Maximum cumulative difference</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {feature.ks_statistic !== null ? feature.ks_statistic.toFixed(4) : "—"}
                  </span>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-700">KS p-value</span>
                    <p className="text-[10px] text-slate-400">Significance threshold: &gt; 0.05</p>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    {feature.p_value !== null ? feature.p_value.toFixed(4) : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Distribution Comparison Chart */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Distribution Comparison
                </h3>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-3 border-b-2 border-dashed border-slate-400" />
                    Baseline
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                    <span className="w-3 border-b-2 border-blue-600" />
                    Current
                  </span>
                </div>
              </div>

              {!hasMeans ? (
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 border-dashed text-center space-y-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Info className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-medium text-slate-700">
                    Insufficient production observations
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    A minimum of 10 feature values must be logged through prediction requests to plot the production distribution curve. Current: {observationsCount}.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-200 space-y-2">
                  <div className="h-36 w-full relative flex items-end">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 80" preserveAspectRatio="none">
                      {/* Baseline Distribution (Dashed) */}
                      <path
                        d={curveData.reduce(
                          (acc, pt, i) =>
                            `${acc} ${i === 0 ? "M" : "L"} ${(i / (curveData.length - 1)) * 100} ${80 - pt.refY}`,
                          ""
                        )}
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                      />
                      {/* Current Production Distribution (Solid) */}
                      <path
                        d={curveData.reduce(
                          (acc, pt, i) =>
                            `${acc} ${i === 0 ? "M" : "L"} ${(i / (curveData.length - 1)) * 100} ${80 - pt.curY}`,
                          ""
                        )}
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                      />
                    </svg>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono border-t border-slate-200 pt-1">
                    <span>{Math.round(minX)}</span>
                    <span>Center: {refMean.toFixed(1)}</span>
                    <span>{Math.round(maxX)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Operational Interpretation */}
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-950 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                Interpreting This Feature
              </p>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                When PSI &gt; 0.25 or KS p-value &lt; 0.05, the incoming feature values diverge from the assumptions under which the model was trained. Investigate input pipeline data transformations or cohort shifts before retraining.
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
              Close Inspector
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
