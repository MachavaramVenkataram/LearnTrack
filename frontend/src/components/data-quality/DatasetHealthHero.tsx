"use client";

import React from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  Layers,
  FileCheck,
  Sparkles,
} from "lucide-react";
import { DataQualityReport } from "@/lib/api/mlOps";
import { cn } from "@/lib/utils";

export interface DatasetHealthHeroProps {
  report: DataQualityReport | null;
}

export function DatasetHealthHero({ report }: DatasetHealthHeroProps) {
  if (!report) return null;

  const checks = report.checks || {};
  const checkKeys = [
    { key: "schema", label: "Schema", status: checks.schema?.status || "PASS" },
    { key: "missing_values", label: "Missing Values", status: checks.missing_values?.status || "PASS" },
    { key: "duplicates", label: "Duplicates", status: checks.duplicates?.status || "PASS" },
    { key: "ranges", label: "Numeric Ranges", status: checks.ranges?.status || "PASS" },
    { key: "categories", label: "Categories", status: checks.categories?.status || "PASS" },
    { key: "outliers", label: "Outliers", status: checks.outliers?.status || "PASS" },
    { key: "target", label: "Target Distribution", status: checks.target?.status || "PASS" },
  ];

  const totalChecks = checkKeys.length;
  const passingChecks = checkKeys.filter((c) => c.status.toUpperCase() === "PASS" || c.status.toUpperCase() === "PASSED").length;
  const passRate = Math.round((passingChecks / totalChecks) * 100);

  const isHealthy = report.overall_status === "PASSED" || report.overall_status === "PASS";
  const isWarning = report.overall_status === "WARNING";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white via-slate-50/70 to-blue-50/30 border border-slate-200/90 shadow-xs p-6 sm:p-7">
      {/* Decorative subtle background grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Side: Overview & Description */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-extrabold text-blue-600 tracking-wider">
              Dataset Health Overview
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold",
                isHealthy
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : isWarning
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isHealthy ? "bg-emerald-500 animate-pulse" : isWarning ? "bg-amber-500" : "bg-rose-500"
                )}
              />
              {isHealthy ? "PASS" : isWarning ? "WARNING" : "FAIL"}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isHealthy
              ? "Dataset verified for model training and preprocessing."
              : isWarning
              ? "Dataset meets baseline rules with informational warnings."
              : "Dataset validation failed critical quality gates."}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {isHealthy
              ? "Your dataset currently meets LearnTrack's validation requirements for ML preprocessing. Schema consistency, target presence, and numerical bounds conform to production regression guidelines."
              : isWarning
              ? "Minor anomalies or elevated outlier counts were observed. Please review the detailed check diagnostics before triggering automated model retraining."
              : "Severe data issues were encountered. Missing required features, duplicate records, or range violations must be rectified prior to model training."}
          </p>

          {/* Quick Metrics Strip */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-medium text-slate-600 border-t border-slate-200/80">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-slate-900 text-sm">{report.total_rows?.toLocaleString()}</span>
              <span className="text-slate-500">Rows</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-slate-900 text-sm">{report.total_columns}</span>
              <span className="text-slate-500">Features</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-slate-900 text-sm">{report.missing_values ?? 0}</span>
              <span className="text-slate-500">Missing</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300" />
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-bold text-slate-900 text-sm">{report.duplicate_rows ?? 0}</span>
              <span className="text-slate-500">Duplicates</span>
            </div>
          </div>
        </div>

        {/* Right Side: Score Card / Validation Summary Badge */}
        <div className="bg-white/90 backdrop-blur-xs border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col items-center justify-center min-w-[210px] text-center shrink-0">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Validation Status
          </span>
          <div className="mt-1 flex items-baseline gap-1">
            <span
              className={cn(
                "text-3xl sm:text-4xl font-black font-sans tracking-tight",
                isHealthy ? "text-emerald-600" : isWarning ? "text-amber-600" : "text-rose-600"
              )}
            >
              {isHealthy ? "PASS" : isWarning ? "WARNING" : "FAIL"}
            </span>
          </div>

          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{passRate}% Checks Passed</span>
            <span className="text-slate-400 font-normal">({passingChecks}/{totalChecks})</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1.5">
            Tukey IQR + Schema Gates
          </span>
        </div>
      </div>

      {/* Validation Health Indicator Strip (Section 7) */}
      <div className="mt-6 pt-5 border-t border-slate-200/80">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            Validation Gates Breakdown
          </span>
          <span className="text-[11px] text-slate-400">
            {passingChecks} of {totalChecks} gates verified
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {checkKeys.map((c) => {
            const passed = c.status.toUpperCase() === "PASS" || c.status.toUpperCase() === "PASSED";
            const warned = c.status.toUpperCase() === "WARNING";
            return (
              <div
                key={c.key}
                className={cn(
                  "px-3 py-2 rounded-lg border text-xs flex items-center justify-between transition-colors",
                  passed
                    ? "bg-white border-slate-200 text-slate-800"
                    : warned
                    ? "bg-amber-50/50 border-amber-200 text-amber-900"
                    : "bg-rose-50/50 border-rose-200 text-rose-900"
                )}
              >
                <span className="font-medium truncate">{c.label}</span>
                <span className="flex items-center gap-1 font-bold text-[11px] shrink-0">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      passed ? "bg-emerald-500" : warned ? "bg-amber-500" : "bg-rose-500"
                    )}
                  />
                  <span className={passed ? "text-emerald-700" : warned ? "text-amber-700" : "text-rose-700"}>
                    {passed ? "PASS" : warned ? "WARN" : "FAIL"}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
