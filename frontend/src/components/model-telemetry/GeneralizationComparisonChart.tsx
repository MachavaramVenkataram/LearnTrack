"use client";

import React, { useState } from "react";
import { Info, BarChart2 } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";

export interface GeneralizationComparisonChartProps {
  valMetrics?: { mae: number; rmse: number; r2: number };
  testMetrics?: { mae: number; rmse: number; r2: number };
  onSelectMetric?: (metricKey: "mae" | "rmse" | "r2") => void;
}

export function GeneralizationComparisonChart({
  valMetrics = { mae: 4.284, rmse: 6.298, r2: 0.8451 },
  testMetrics = { mae: 4.494, rmse: 7.677, r2: 0.8392 },
  onSelectMetric,
}: GeneralizationComparisonChartProps) {
  const [activeTab, setActiveTab] = useState<"rmse" | "mae" | "r2">("rmse");

  const metricConfigs = {
    rmse: {
      name: "Root Mean Squared Error (RMSE)",
      unit: "pts",
      desc: "Penalizes larger outliers more heavily; lower is superior.",
      valVal: valMetrics?.rmse ?? 6.298,
      testVal: testMetrics?.rmse ?? 7.677,
      maxScale: 10,
    },
    mae: {
      name: "Mean Absolute Error (MAE)",
      unit: "pts",
      desc: "Average magnitude of errors in continuous prediction scale.",
      valVal: valMetrics?.mae ?? 4.284,
      testVal: testMetrics?.mae ?? 4.494,
      maxScale: 10,
    },
    r2: {
      name: "Coefficient of Determination (R²)",
      unit: "",
      desc: "Proportion of academic score variance explained by model regressors.",
      valVal: valMetrics?.r2 ?? 0.8451,
      testVal: testMetrics?.r2 ?? 0.8392,
      maxScale: 1.0,
    },
  };

  const curr = metricConfigs[activeTab];
  const delta = curr.testVal - curr.valVal;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Visual Model Diagnostics
          </span>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            Cross-Validation vs Independent Holdout Delta
          </h4>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          {(["rmse", "mae", "r2"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (onSelectMetric) onSelectMetric(tab);
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between text-xs">
          <p className="text-slate-600">
            {curr.name} — <span className="text-slate-400">{curr.desc}</span>
          </p>

          <span className="font-mono text-xs text-slate-600">
            Delta:{" "}
            <strong
              className={
                activeTab === "r2"
                  ? delta >= 0
                    ? "text-emerald-700 font-bold"
                    : "text-slate-700"
                  : delta <= 1.5
                  ? "text-slate-700"
                  : "text-amber-700"
              }
            >
              {delta >= 0 ? `+${delta.toFixed(3)}` : delta.toFixed(3)} {curr.unit}
            </strong>
          </span>
        </div>

        {/* Bar 1: Cross-Validation */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-800">5-Fold Cross-Validation</span>
              <Tooltip content="Internal training validation split averaged across 5 stratified folds.">
                <span className="cursor-help text-slate-400">
                  <Info className="w-3 h-3" />
                </span>
              </Tooltip>
            </div>
            <span className="font-mono font-bold text-blue-700">
              {curr.valVal.toFixed(3)} {curr.unit}
            </span>
          </div>

          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.round((curr.valVal / curr.maxScale) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Bar 2: Independent Holdout */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-800">Independent Holdout Test</span>
              <Tooltip content="Strictly unseen independent student test partition not used during hyperparameter optimization.">
                <span className="cursor-help text-slate-400">
                  <Info className="w-3 h-3" />
                </span>
              </Tooltip>
            </div>
            <span className="font-mono font-bold text-emerald-700">
              {curr.testVal.toFixed(3)} {curr.unit}
            </span>
          </div>

          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.round((curr.testVal / curr.maxScale) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
