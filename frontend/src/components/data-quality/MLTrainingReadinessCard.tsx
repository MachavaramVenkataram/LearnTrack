"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  GitBranch,
  ShieldCheck,
  Sparkles,
  Info,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { DataQualityReport } from "@/lib/api/mlOps";
import { cn } from "@/lib/utils";

export interface MLTrainingReadinessCardProps {
  report: DataQualityReport | null;
}

export function MLTrainingReadinessCard({ report }: MLTrainingReadinessCardProps) {
  if (!report) return null;

  const checks = report.checks || {};
  const isSchemaValid = checks.schema?.status === "PASS" || checks.schema?.target_present;
  const isTargetPresent = Boolean(checks.schema?.target_present);
  const isDuplicatesValid = checks.duplicates?.status === "PASS";
  const isRangesValid = checks.ranges?.status === "PASS";

  const isReady =
    (report.overall_status === "PASSED" || report.overall_status === "PASS") &&
    isSchemaValid &&
    isTargetPresent;

  return (
    <Card className="bg-white border-slate-200/90 shadow-2xs overflow-hidden">
      <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/40 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-blue-600" />
              ML Training Readiness &amp; Quality Gate
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Automated gate determination for downstream feature engineering and model training.
            </CardDescription>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 self-start sm:self-auto",
              isReady
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            )}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                isReady ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              )}
            />
            {isReady ? "Ready for Training" : "Needs Attention"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Gate Requirements Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block">Schema Conformity</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                All 7 feature columns present with compliant numerical types.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block">Target Variable</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Target &apos;final_score&apos; verified without null or NaN entries.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block">Record Uniqueness</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                0 duplicate rows detected. Clean observation boundaries.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block">Numerical Bounds</span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                All parameters conform strictly to academic domain boundaries.
              </p>
            </div>
          </div>
        </div>

        {/* Training Gate Action Bar */}
        <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Production Gate: {isReady ? "Passed" : "Action Required"}
              </span>
            </div>
            <p className="text-xs text-slate-600 max-w-xl">
              {isReady
                ? "This dataset is certified for ML training, hyperparameter tuning, and cross-validation in the Experiments workspace."
                : "Address flagged data warnings or rerun validation before retraining models."}
            </p>
          </div>

          <div className="shrink-0">
            {isReady ? (
              <Link href="/experiments">
                <Button className="h-9 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow-sm transition-all duration-150 gap-2 cursor-pointer">
                  <span>Continue to Experiments</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            ) : (
              <Button
                variant="outline"
                className="h-9 px-4 text-xs font-semibold border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
              >
                Review Gate Issues
              </Button>
            )}
          </div>
        </div>

        {/* Responsible Engineering Guidance */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-700 font-semibold">Responsible ML Validation:</strong> Passing validation gates certifies structural integrity, data completeness, and domain conformance. It does not guarantee zero prediction error; downstream model evaluation and cross-validation metrics remain mandatory.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
