"use client";

import React from "react";
import {
  Cpu,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ModelIdentityHeroProps {
  modelType?: string;
  modelVersion?: string;
  target?: string;
  targetScale?: string;
  datasetName?: string;
  featureCount?: number;
  isTelemetryActive?: boolean;
  onOpenModelCard: () => void;
}

export function ModelIdentityHero({
  modelType = "Linear Regression (Ridge)",
  modelVersion = "candidate-8963bdf8",
  target = "final_score",
  targetScale = "0 to 100 continuous score",
  datasetName = "UCI Student Performance Benchmark",
  featureCount = 11,
  isTelemetryActive = true,
  onOpenModelCard,
}: ModelIdentityHeroProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-xs overflow-hidden">
      {/* Top Main Hero Section */}
      <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100">
        {/* Left: Model Identity & Version */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80 shadow-2xs">
              <Cpu className="w-6 h-6" />
            </div>
            {isTelemetryActive && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 truncate">
                {modelType}
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {modelVersion}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-mono">
              Target: <strong className="text-slate-800">{target}</strong> ({targetScale})
            </p>
          </div>
        </div>

        {/* Center: Architecture & Dataset Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6 py-2 px-4 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Model Type
            </span>
            <span className="font-semibold text-slate-800 text-xs mt-0.5 block truncate">
              L2 Regularized
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Dataset
            </span>
            <span className="font-semibold text-slate-800 text-xs mt-0.5 block truncate" title={datasetName}>
              {datasetName.split("(")[0].trim()}
            </span>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Active Features
            </span>
            <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
              {featureCount} Mathematical Inputs
            </span>
          </div>
        </div>

        {/* Right: Production Champion Status & Action */}
        <div className="flex items-center lg:flex-col lg:items-end justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Production Champion
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline font-mono">
              v1.0.0
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenModelCard}
            leftIcon={<FileText className="w-3.5 h-3.5 text-slate-500" />}
            className="h-8 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 border-[#E2E8F0] hover:border-slate-300 rounded-[8px]"
          >
            View Model Card
          </Button>
        </div>
      </div>

      {/* Bottom Compact Model Status Ribbon (Section 5) */}
      <div className="bg-slate-50/60 px-5 sm:px-6 py-2.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-800 text-[11.5px]">Production</span>
          <span className="text-[10.5px] text-slate-400 hidden lg:inline">· Live Serving</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-semibold text-slate-800 text-[11.5px]">Healthy</span>
          <span className="text-[10.5px] text-slate-400 hidden lg:inline">· Within Tolerances</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="font-semibold text-slate-800 text-[11.5px]">Tracked</span>
          <span className="text-[10.5px] text-slate-400 hidden lg:inline">· MLflow Logged</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="font-semibold text-slate-800 text-[11.5px]">Explainable</span>
          <span className="text-[10.5px] text-slate-400 hidden lg:inline">· SHAP Ready</span>
        </div>
      </div>
    </div>
  );
}
