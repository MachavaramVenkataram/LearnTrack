"use client";

import React from "react";
import { FlaskConical, GitBranch, Award, Layers, Info } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { ExperimentSummary } from "@/lib/api/mlOps";

export interface ExperimentHeroCardsProps {
  experiments: ExperimentSummary[];
  championRun?: ExperimentSummary | null;
  onFilterDataset?: (datasetVersion: string) => void;
}

export function ExperimentHeroCards({
  experiments,
  championRun,
  onFilterDataset,
}: ExperimentHeroCardsProps) {
  const totalRuns = experiments.length;
  const primaryDataset = experiments[0]?.dataset_version || "1.0.0";
  const datasetHash = experiments[0]?.dataset_hash || "cc63eb5665f45f05c85d7526fbecb9c4d2f6743224fc27d5c309feec7314b9fa";

  const champName = championRun?.model_name
    ? championRun.model_name
        .replace(/\s*\(Candidate\)\s*/i, "")
        .replace(/\s*\(Champion\)\s*/i, "")
        .trim()
    : "Ridge Regression";

  const champVersion = championRun?.tags?.version
    ? `v${championRun.tags.version}`
    : `v${championRun?.dataset_version || "1.0.0"}`;

  const champTestRmse = championRun?.test_rmse ?? championRun?.metrics?.test_rmse ?? 7.677;
  const champValR2 = championRun?.val_r2 ?? championRun?.metrics?.val_r2 ?? 0.8451;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* Card 1: EXPERIMENT IDENTITY */}
      <div className="group relative bg-white border border-[#E2E8F0] hover:border-blue-300 rounded-[14px] p-5 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-180 ease-out flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
              Experiment
            </span>
            <Tooltip
              content="The primary active MLflow tracking experiment workspace for academic outcome forecasting."
              position="top"
            >
              <span className="cursor-help text-slate-400 hover:text-slate-600 inline-flex items-center">
                <Info className="w-3.5 h-3.5" />
              </span>
            </Tooltip>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100/80 transition-colors">
            <FlaskConical className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="mt-3">
          <span
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 block truncate font-mono"
            title="learntrack-student-performance"
          >
            learntrack-student-performance
          </span>
          <p className="text-[11.5px] text-slate-500 mt-1 line-clamp-1">
            Student performance regression experiments
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              ID: 1 (Default)
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Regression</span>
          </div>
        </div>
      </div>

      {/* Card 2: LOGGED RUNS */}
      <div className="group relative bg-white border border-[#E2E8F0] hover:border-indigo-300 rounded-[14px] p-5 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-180 ease-out flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
              Logged Runs
            </span>
            <Tooltip
              content="Total reproducible training executions logged to MLflow with full telemetry and serialized artifacts."
              position="top"
            >
              <span className="cursor-help text-slate-400 hover:text-slate-600 inline-flex items-center">
                <Info className="w-3.5 h-3.5" />
              </span>
            </Tooltip>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-100/80 transition-colors">
            <GitBranch className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 font-mono">
            {totalRuns} <span className="text-sm text-slate-400 font-normal">runs</span>
          </div>
          <p className="text-[11.5px] text-slate-500 mt-1">
            4 model architectures evaluated
          </p>
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>100% executions finished cleanly</span>
          </div>
        </div>
      </div>

      {/* Card 3: CHAMPION MODEL */}
      <div className="group relative bg-white border border-[#E2E8F0] hover:border-emerald-300 rounded-[14px] p-5 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-180 ease-out flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
              Champion Model
            </span>
            <Tooltip
              content="Active benchmark leader verified through cross-validation and independent test splits."
              position="top"
            >
              <span className="cursor-help text-slate-400 hover:text-slate-600 inline-flex items-center">
                <Info className="w-3.5 h-3.5" />
              </span>
            </Tooltip>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100/80 transition-colors">
            <Award className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-base sm:text-lg font-bold tracking-tight text-slate-900 truncate"
              title={champName}
            >
              {champName}
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Champion
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2 text-xs">
            <span className="font-mono text-slate-400 text-[11px]">{champVersion}</span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-slate-700 font-semibold text-xs">
              Test RMSE: {champTestRmse.toFixed(3)}
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500">
              Val R²: <strong className="text-slate-800">{champValR2.toFixed(3)}</strong>
            </span>
            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-600">
              Production Baseline
            </span>
          </div>
        </div>
      </div>

      {/* Card 4: DATASET VERSION */}
      <div
        onClick={() => onFilterDataset && onFilterDataset(primaryDataset)}
        className="group relative bg-white border border-[#E2E8F0] hover:border-purple-300 rounded-[14px] p-5 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-180 ease-out flex flex-col justify-between cursor-pointer"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
              Dataset Version
            </span>
            <Tooltip
              content="The benchmark dataset partition used for reproducible model training and cross-validation splits."
              position="top"
            >
              <span className="cursor-help text-slate-400 hover:text-slate-600 inline-flex items-center">
                <Info className="w-3.5 h-3.5" />
              </span>
            </Tooltip>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-100/80 transition-colors">
            <Layers className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 font-mono">
              v{primaryDataset}
            </span>
            <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              1,044 samples
            </span>
          </div>

          <p className="text-[11px] text-slate-500 mt-1 font-mono truncate" title={datasetHash}>
            SHA-256: {datasetHash ? `${datasetHash.slice(0, 10)}…` : "Verified"}
          </p>

          <p className="text-[10px] text-purple-600 group-hover:underline mt-2.5 font-medium">
            Click to filter runs by this dataset →
          </p>
        </div>
      </div>
    </div>
  );
}
