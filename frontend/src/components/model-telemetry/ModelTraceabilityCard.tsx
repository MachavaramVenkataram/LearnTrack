"use client";

import React from "react";
import Link from "next/link";
import { GitBranch, ShieldCheck, ArrowUpRight, FileText, CheckCircle2 } from "lucide-react";

interface ModelTraceabilityCardProps {
  runId?: string;
  datasetName: string;
  datasetVersion?: string;
  modelVersion: string;
  modelType: string;
  onOpenModelCard: () => void;
}

export function ModelTraceabilityCard({
  runId = "candidate-8963bdf8",
  datasetName,
  datasetVersion = "1.0.0",
  modelVersion,
  modelType,
  onOpenModelCard,
}: ModelTraceabilityCardProps) {
  const shortRunId = runId.length > 18 ? `${runId.slice(0, 16)}...` : runId;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Experiment Traceability (Section 19) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft-sm flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                Experiment Traceability
              </span>
              <h3 className="text-sm font-bold text-slate-900">MLflow Run Lineage</h3>
            </div>
          </div>

          <Link
            href="/experiments"
            className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
          >
            <span>View Run</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Active Run ID
            </span>
            <span className="font-mono font-bold text-slate-800 text-[11.5px] truncate block" title={runId}>
              {shortRunId}
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">mlflow.run_id</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Dataset Lineage
            </span>
            <span className="font-mono font-bold text-slate-800 text-[11.5px] truncate block" title={datasetName}>
              v{datasetVersion}
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Benchmark split</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Model Artifact
            </span>
            <span className="font-mono font-bold text-slate-800 text-[11.5px] truncate block">
              {modelVersion}
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">joblib serialized</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Experiment State
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono font-semibold text-emerald-700 text-[11.5px]">
                Validated
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">5 Folds + Test</span>
          </div>
        </div>

        <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between font-mono">
          <span>MLflow Registry: Local File Store</span>
          <span className="text-purple-600 font-semibold">Trained &amp; Benchmarked</span>
        </div>
      </div>

      {/* 2. Model Registry Status & Drawer Trigger (Section 20) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft-sm flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                Model Registry
              </span>
              <h3 className="text-sm font-bold text-slate-900">Governance &amp; Deployment</h3>
            </div>
          </div>

          <button
            onClick={onOpenModelCard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>View Model Card</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Active Version
            </span>
            <span className="font-mono font-bold text-slate-900 text-sm block">
              {modelVersion.replace("Ridge-", "")}
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate" title={modelType}>
              {modelType}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Environment
            </span>
            <span className="font-semibold text-slate-900 text-sm block">
              Production
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">active cluster</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Registry Status
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Registered
            </span>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">immutable hash</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
          <span className="font-medium truncate mr-2">
            Target: <code className="font-mono text-slate-800">final_score</code> (0–100 scale)
          </span>
          <span className="text-[11px] font-mono text-emerald-700 font-semibold shrink-0">
            ● Active Serving
          </span>
        </div>
      </div>
    </div>
  );
}
