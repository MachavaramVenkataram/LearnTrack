"use client";

import React from "react";
import { Sparkles, GitBranch, Cpu, Database, Award } from "lucide-react";
import { ExperimentSummary } from "@/lib/api/mlOps";

export interface ExperimentInsightsStripProps {
  experiments: ExperimentSummary[];
  championRun?: ExperimentSummary | null;
}

export function ExperimentInsightsStrip({
  experiments,
  championRun,
}: ExperimentInsightsStripProps) {
  const totalRuns = experiments.length;

  // Unique model architectures
  const uniqueModels = new Set<string>();
  experiments.forEach((r) => {
    if (r.model_name) {
      const clean = r.model_name
        .replace(/\s*\(Candidate\)\s*/i, "")
        .replace(/\s*\(Champion\)\s*/i, "")
        .trim();
      uniqueModels.add(clean);
    }
  });

  // Unique dataset versions
  const uniqueDatasets = new Set<string>();
  experiments.forEach((r) => {
    if (r.dataset_version) uniqueDatasets.add(r.dataset_version);
  });

  const championCount = championRun ? 1 : 0;

  return (
    <div className="px-4 py-3 rounded-[12px] bg-slate-50/80 border border-[#E2E8F0] shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Sparkles className="w-3 h-3" />
        </div>
        <span className="font-bold text-slate-700 tracking-wider uppercase text-[10.5px]">
          Experiment Overview
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-slate-600 text-xs font-medium">
        <span className="inline-flex items-center gap-1.5">
          <GitBranch className="w-3.5 h-3.5 text-slate-400" />
          <strong className="text-slate-900 font-semibold">{totalRuns}</strong> runs logged
        </span>

        <span className="hidden sm:inline text-slate-300">·</span>

        <span className="inline-flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-slate-400" />
          <strong className="text-slate-900 font-semibold">{uniqueModels.size}</strong> model architectures
        </span>

        <span className="hidden sm:inline text-slate-300">·</span>

        <span className="inline-flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <strong className="text-slate-900 font-semibold">{uniqueDatasets.size}</strong> dataset partition
        </span>

        <span className="hidden sm:inline text-slate-300">·</span>

        <span className="inline-flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-emerald-600" />
          <strong className="text-slate-900 font-semibold">{championCount}</strong> champion active
        </span>
      </div>
    </div>
  );
}
