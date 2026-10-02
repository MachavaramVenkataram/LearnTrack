"use client";

import React from "react";
import { Cpu, GitBranch, Database, Terminal, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ErrorAnalysisReport } from "@/lib/api/mlOps";

export interface ModelContextStripProps {
  report: ErrorAnalysisReport | null;
  evaluationType: "BENCHMARK" | "PRODUCTION";
}

export function ModelContextStrip({ report, evaluationType }: ModelContextStripProps) {
  const isProduction = evaluationType === "PRODUCTION";

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-3.5 sm:p-4 shadow-xs">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-xs">
        {/* Cell 1: Model Architecture */}
        <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:pr-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Architecture
            </p>
            <p className="text-slate-900 font-semibold text-[13px] truncate">
              {report?.model_name || "Ridge Regression"}
            </p>
          </div>
        </div>

        {/* Cell 2: Model Version */}
        <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <GitBranch className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Model Version
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                v{report?.model_version || "1"}
              </span>
            </div>
          </div>
        </div>

        {/* Cell 3: Dataset Version */}
        <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-4">
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Dataset Version
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                v{report?.dataset_version || "1.0.0"}
              </span>
            </div>
          </div>
        </div>

        {/* Cell 4: MLflow Run ID */}
        <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:px-4">
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              MLflow Run ID
            </p>
            <p
              className="text-slate-700 font-mono text-[12px] truncate max-w-[130px] font-medium"
              title={report?.run_id || "Active Run"}
            >
              {report?.run_id ? report.run_id.slice(0, 8) : "Active Run"}
            </p>
          </div>
        </div>

        {/* Cell 5: Evaluation Regime */}
        <div className="flex items-center gap-3 pt-2 sm:pt-0 sm:pl-4 col-span-2 sm:col-span-1">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Regime
            </p>
            <div className="mt-0.5">
              <Badge
                variant={isProduction ? "default" : "secondary"}
                size="sm"
                className="font-mono text-[10px] uppercase font-semibold"
              >
                {evaluationType}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
