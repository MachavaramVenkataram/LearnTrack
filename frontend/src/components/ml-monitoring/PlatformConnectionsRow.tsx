"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  ChevronRight,
  Database,
  ArrowRight,
  Cpu,
  LineChart,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { DataQualityReport, ExperimentSummary } from "@/lib/api/mlOps";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface PlatformConnectionsRowProps {
  dataQuality: DataQualityReport | null;
  championExperiment: ExperimentSummary | null;
}

export function PlatformConnectionsRow({
  dataQuality,
  championExperiment,
}: PlatformConnectionsRowProps) {
  const isDqPassed = dataQuality?.status === "PASSED";
  const dqVersion = dataQuality?.dataset_version ?? "v1.0.0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. DATA QUALITY CONNECTION */}
      <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 transition-all group">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                isDqPassed
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : dataQuality
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}
            >
              {isDqPassed ? "✓ Passed" : dataQuality?.status ?? "Validating"}
            </span>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Data Quality
            </h4>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              Dataset Health: {dqVersion}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {dataQuality ? (
                <>
                  {dataQuality.issues?.length === 0 ? "All checks passed" : `${dataQuality.issues?.length ?? 0} issues detected`} • {dataQuality.total_rows ?? 0} rows
                </>
              ) : (
                "Validation reports synced from Python engine"
              )}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 mt-3">
          <Link
            href="/data-quality"
            className="inline-flex items-center justify-between w-full h-[36px] px-3 rounded-[9px] text-xs font-semibold text-slate-700 bg-slate-50/80 hover:bg-blue-50/70 hover:text-blue-600 border border-slate-200/80 hover:border-blue-200 transition-all duration-160 group/btn"
          >
            <span>View Data Quality</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-blue-600 group-hover/btn:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </Card>

      {/* 2. MODEL EVALUATION & EXPERIMENTS */}
      <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 transition-all group">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Award className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              Champion
            </span>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Model Evaluation
            </h4>
            <p className="text-sm font-semibold text-slate-800 mt-1 truncate">
              {championExperiment?.run_name ?? "Ridge Regression v1.0.0"}
            </p>
            <div className="grid grid-cols-3 gap-1 text-[11px] font-mono mt-1 text-slate-600">
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">MAE</span>
                <span className="font-bold text-slate-800">
                  {championExperiment?.test_mae !== null && championExperiment?.test_mae !== undefined
                    ? championExperiment.test_mae.toFixed(2)
                    : "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">RMSE</span>
                <span className="font-bold text-slate-800">
                  {championExperiment?.test_rmse !== null && championExperiment?.test_rmse !== undefined
                    ? championExperiment.test_rmse.toFixed(2)
                    : "—"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-sans">R²</span>
                <span className="font-bold text-slate-800">
                  {championExperiment?.test_r2 !== null && championExperiment?.test_r2 !== undefined
                    ? championExperiment.test_r2.toFixed(3)
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 mt-3">
          <Link
            href="/experiments"
            className="inline-flex items-center justify-between w-full h-[36px] px-3 rounded-[9px] text-xs font-semibold text-slate-700 bg-slate-50/80 hover:bg-blue-50/70 hover:text-blue-600 border border-slate-200/80 hover:border-blue-200 transition-all duration-160 group/btn"
          >
            <span>View Experiments</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-blue-600 group-hover/btn:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </Card>

      {/* 3. ERROR ANALYSIS */}
      <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 transition-all group">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <LineChart className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
              Diagnostics
            </span>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Error Analysis
            </h4>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              Residuals & Cohorts
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect worst prediction slices, feature residual correlations, and error distributions.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 mt-3">
          <Link
            href="/error-analysis"
            className="inline-flex items-center justify-between w-full h-[36px] px-3 rounded-[9px] text-xs font-semibold text-slate-700 bg-slate-50/80 hover:bg-blue-50/70 hover:text-blue-600 border border-slate-200/80 hover:border-blue-200 transition-all duration-160 group/btn"
          >
            <span>View Error Analysis</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-blue-600 group-hover/btn:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </Card>

      {/* 4. MODEL RETRAINING */}
      <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 transition-all group">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <RefreshCw className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              CI/CD Pipeline
            </span>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Model Retraining
            </h4>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              Trigger ML Pipelines
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Retrain on newly verified student ground-truth records and promote winning candidates.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 mt-3">
          <Link
            href="/retraining"
            className="inline-flex items-center justify-between w-full h-[36px] px-3 rounded-[9px] text-xs font-semibold text-slate-700 bg-slate-50/80 hover:bg-blue-50/70 hover:text-blue-600 border border-slate-200/80 hover:border-blue-200 transition-all duration-160 group/btn"
          >
            <span>View Retraining</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-blue-600 group-hover/btn:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </Card>
    </div>
  );
}
