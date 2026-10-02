"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Cpu, Database, CheckCircle, BarChart } from "lucide-react";
import { MLModelInfo } from "@/lib/api/ml";

export interface ModelCardMicroPanelProps {
  modelInfo?: MLModelInfo | null;
  modelVersion?: string;
}

export function ModelCardMicroPanel({ modelInfo, modelVersion }: ModelCardMicroPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const modelType = modelInfo?.model_type || "Linear Regression (Ridge)";
  const version = modelInfo?.model_version || modelVersion || "v1.0.0";
  const dataset = modelInfo?.dataset_name || "student-performance-v1.0.0";
  const target = modelInfo?.target || "Final Academic Score";
  const targetScale = modelInfo?.target_scale || "0–100 scale";
  const featureCount = modelInfo?.feature_names?.length || 10;
  const metrics = modelInfo?.evaluation_metrics;

  return (
    <div className="border border-slate-200/90 rounded-xl bg-slate-50/60 overflow-hidden text-xs transition-all duration-150">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-slate-100/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-blue-600" />
          <span className="font-semibold text-slate-800">Model Details</span>
          <span className="text-[10px] text-slate-500 font-mono">[{version}]</span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <span>{isExpanded ? "Hide specs" : "View specs"}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-1 space-y-3 border-t border-slate-200/70 text-slate-600">
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-2 rounded-lg bg-white border border-slate-200/70">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Algorithm
              </span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5 block truncate">
                {modelType}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white border border-slate-200/70">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Task & Target
              </span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5 block truncate">
                Regression ({target})
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white border border-slate-200/70">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Features Engineered
              </span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5 block">
                {featureCount} Academic Signals
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white border border-slate-200/70">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Dataset Version
              </span>
              <span className="text-xs font-semibold text-slate-800 mt-0.5 block truncate font-mono">
                {dataset}
              </span>
            </div>
          </div>

          {/* Test Metrics from real backend telemetry if present */}
          {metrics && (
            <div className="p-2.5 rounded-lg bg-white border border-slate-200/70 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Independent Test Evaluation
              </span>
              <div className="flex items-center gap-4 text-xs font-mono font-medium text-slate-700">
                <span>MAE: {metrics.independent_test.mae.toFixed(2)}</span>
                <span>RMSE: {metrics.independent_test.rmse.toFixed(2)}</span>
                <span>R²: {metrics.independent_test.r2.toFixed(4)}</span>
              </div>
            </div>
          )}

          {modelInfo?.selection_rationale && (
            <p className="text-[11px] text-slate-500 leading-normal italic">
              &quot;{modelInfo.selection_rationale}&quot;
            </p>
          )}
        </div>
      )}
    </div>
  );
}
