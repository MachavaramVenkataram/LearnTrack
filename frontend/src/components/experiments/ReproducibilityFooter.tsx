"use client";

import React from "react";
import { Sparkles, Check, Database, GitCommit, FileCode, ShieldCheck } from "lucide-react";

export interface ReproducibilityFooterProps {
  datasetVersion?: string;
  datasetHash?: string | null;
  mlflowVersion?: string;
}

export function ReproducibilityFooter({
  datasetVersion = "1.0.0",
  datasetHash = "cc63eb5665f45f05c85d7526fbecb9c4d2f6743224fc27d5c309feec7314b9fa",
  mlflowVersion = "3.16.1",
}: ReproducibilityFooterProps) {
  const guarantees = [
    {
      label: "Dataset Hash Partition",
      val: `v${datasetVersion} verified`,
      icon: Database,
    },
    {
      label: "Parameters & Hyperparameters",
      val: "Full parameter space logged",
      icon: GitCommit,
    },
    {
      label: "5-Fold Cross-Validation",
      val: "Stratified splits recorded",
      icon: ShieldCheck,
    },
    {
      label: "Serialized Model Artifacts",
      val: "Versioned pickle & schemas",
      icon: FileCode,
    },
  ];

  return (
    <div className="rounded-[16px] border border-blue-100 bg-blue-50/30 p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 tracking-tight uppercase text-[11px]">
                Reproducibility
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check className="w-2.5 h-2.5" />
                Deterministic ML Guarantee
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
              Experiment metrics, hyperparameters, dataset partitions, and serialized artifacts are
              logged directly through the LearnTrack MLflow tracking pipeline. Each execution creates an
              immutable, verifiable audit trail for regression testing and model governance.
            </p>
          </div>
        </div>

        <div className="shrink-0 pl-12 sm:pl-0 font-mono text-[11px] text-slate-500 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/60 self-start sm:self-auto">
          MLflow Client v{mlflowVersion}
        </div>
      </div>

      {/* Guarantee Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2">
        {guarantees.map((g, idx) => {
          const Icon = g.icon;
          return (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white border border-slate-200/70 shadow-2xs flex items-center gap-2.5 text-xs"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                  {g.label}
                </span>
                <span className="font-semibold text-slate-800 text-xs truncate block">
                  {g.val}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dataset SHA-256 Digest Bar */}
      {datasetHash && (
        <div className="pt-2 border-t border-blue-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono">
          <span className="text-slate-500">Partition SHA-256 Digest:</span>
          <span className="text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 break-all select-all font-bold">
            {datasetHash}
          </span>
        </div>
      )}
    </div>
  );
}
