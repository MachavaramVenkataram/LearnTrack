"use client";

import React from "react";
import { Info, ArrowRight, CheckCircle2, TrendingUp } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";

export interface PerformanceMetricsGroup {
  mae: number;
  rmse: number;
  r2: number;
}

export interface PerformanceOverviewProps {
  valMetrics?: PerformanceMetricsGroup | null;
  testMetrics?: PerformanceMetricsGroup | null;
  onSelectMetric?: (metricKey: "mae" | "rmse" | "r2") => void;
}

export function PerformanceOverview({
  valMetrics = { mae: 4.284, rmse: 6.298, r2: 0.8451 },
  testMetrics = { mae: 4.494, rmse: 7.677, r2: 0.8392 },
  onSelectMetric,
}: PerformanceOverviewProps) {
  const vMae = valMetrics?.mae ?? 4.284;
  const vRmse = valMetrics?.rmse ?? 6.298;
  const vR2 = valMetrics?.r2 ?? 0.8451;

  const tMae = testMetrics?.mae ?? 4.494;
  const tRmse = testMetrics?.rmse ?? 7.677;
  const tR2 = testMetrics?.r2 ?? 0.8392;

  // Generalization differences
  const rmseDiff = tRmse - vRmse;
  const maeDiff = tMae - vMae;
  const r2Diff = tR2 - vR2;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-1">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Generalization &amp; Benchmark Rigor
          </span>
          <h3 className="text-base font-bold text-slate-900">
            Performance Overview
          </h3>
        </div>

        <span className="text-xs text-slate-500 font-mono hidden sm:inline-block">
          5-Fold Stratified CV vs Independent Holdout
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Group 1: 5-Fold Cross-Validation Metrics */}
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                Internal Tuning Split
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                5-Fold Cross-Validation
              </h4>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
              Mean Across Folds
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* MAE */}
            <div
              onClick={() => onSelectMetric && onSelectMetric("mae")}
              className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-blue-300 hover:shadow-2xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Val MAE
                </span>
                <Tooltip content="Mean Absolute Error: average absolute difference between predicted and actual scores across folds.">
                  <span className="cursor-help text-slate-400 group-hover:text-slate-600">
                    <Info className="w-3 h-3" />
                  </span>
                </Tooltip>
              </div>
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1 block">
                {vMae.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                pts average error
              </span>
            </div>

            {/* RMSE */}
            <div
              onClick={() => onSelectMetric && onSelectMetric("rmse")}
              className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-blue-300 hover:shadow-2xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Val RMSE
                </span>
                <Tooltip content="Root Mean Squared Error: penalizes larger prediction errors more strongly.">
                  <span className="cursor-help text-slate-400 group-hover:text-slate-600">
                    <Info className="w-3 h-3" />
                  </span>
                </Tooltip>
              </div>
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1 block">
                {vRmse.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                pts squared penalty
              </span>
            </div>

            {/* R2 */}
            <div
              onClick={() => onSelectMetric && onSelectMetric("r2")}
              className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-blue-300 hover:shadow-2xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Val R²
                </span>
                <Tooltip content="Coefficient of Determination: indicates the proportion of target variance explained by the model.">
                  <span className="cursor-help text-slate-400 group-hover:text-slate-600">
                    <Info className="w-3 h-3" />
                  </span>
                </Tooltip>
              </div>
              <span className="text-xl sm:text-2xl font-bold font-mono text-blue-700 mt-1 block">
                {vR2.toFixed(3)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                variance explained
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Averaged across 5 stratified cohorts during model tournament and regularization parameter sweeps.
          </p>
        </div>

        {/* Group 2: Independent Holdout Test Set Metrics */}
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                Unseen Holdout Partition
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                Independent Holdout Test
              </h4>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Generalization Split
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Test MAE */}
            <div
              onClick={() => onSelectMetric && onSelectMetric("mae")}
              className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-emerald-300 hover:shadow-2xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Test MAE
                </span>
                <Tooltip content="Mean Absolute Error evaluated strictly on out-of-sample holdout students.">
                  <span className="cursor-help text-slate-400 group-hover:text-slate-600">
                    <Info className="w-3 h-3" />
                  </span>
                </Tooltip>
              </div>
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1 block">
                {tMae.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                generalization error
              </span>
            </div>

            {/* Test RMSE */}
            <div
              onClick={() => onSelectMetric && onSelectMetric("rmse")}
              className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-emerald-300 hover:shadow-2xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Test RMSE
                </span>
                <Tooltip content="Root Mean Squared Error on unseen holdout test split. Lower values indicate tighter bounds.">
                  <span className="cursor-help text-slate-400 group-hover:text-slate-600">
                    <Info className="w-3 h-3" />
                  </span>
                </Tooltip>
              </div>
              <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 mt-1 block">
                {tRmse.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                champion baseline
              </span>
            </div>

            {/* Test R2 */}
            <div
              onClick={() => onSelectMetric && onSelectMetric("r2")}
              className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-emerald-300 hover:shadow-2xs transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Test R²
                </span>
                <Tooltip content="Generalization Coefficient of Determination on unseen test split.">
                  <span className="cursor-help text-slate-400 group-hover:text-slate-600">
                    <Info className="w-3 h-3" />
                  </span>
                </Tooltip>
              </div>
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 mt-1 block">
                {tR2.toFixed(3)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                generalization R²
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Evaluated strictly on independent holdout data not exposed during parameter selection or CV folds.
          </p>
        </div>
      </div>

      {/* Generalization Gap Intelligence Strip (Section 9) */}
      <div className="p-4 sm:p-5 rounded-[14px] bg-slate-50/90 border border-[#E2E8F0] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start md:items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/60 text-indigo-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
                Generalization Analysis
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-600 font-medium text-xs">
                Holdout Error vs Validation Baseline
              </span>
            </div>
            <p className="text-slate-600 text-xs mt-0.5 leading-relaxed">
              Holdout error is slightly higher than cross-validation error (RMSE delta: <strong className="text-slate-900 font-mono">+{rmseDiff.toFixed(2)} pts</strong>, MAE delta: <strong className="text-slate-900 font-mono">+{maeDiff.toFixed(2)} pts</strong>, R² delta: <strong className="text-slate-900 font-mono">{r2Diff.toFixed(3)}</strong>), reflecting normal variance on unseen student cohorts without overfitting.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto shrink-0 pl-11 md:pl-0 font-mono text-xs">
          <div className="p-2 rounded-lg bg-white border border-slate-200 text-center min-w-[90px]">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">CV RMSE</span>
            <span className="font-bold text-slate-700">{vRmse.toFixed(2)}</span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />

          <div className="p-2 rounded-lg bg-white border border-slate-200 text-center min-w-[90px]">
            <span className="text-[9px] uppercase font-bold text-slate-400 block">Test RMSE</span>
            <span className="font-bold text-slate-900">{tRmse.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
