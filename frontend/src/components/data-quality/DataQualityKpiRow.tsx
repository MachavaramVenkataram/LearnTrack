"use client";

import React, { useState } from "react";
import {
  Database,
  Clock,
  Layers,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { DataQualityReport } from "@/lib/api/mlOps";
import { cn } from "@/lib/utils";

export interface DataQualityKpiRowProps {
  report: DataQualityReport | null;
}

export function DataQualityKpiRow({ report }: DataQualityKpiRowProps) {
  const [isVersionPopoverOpen, setIsVersionPopoverOpen] = useState(false);

  if (!report) return null;

  const isHealthy = report.overall_status === "PASSED" || report.overall_status === "PASS";
  const isWarning = report.overall_status === "WARNING";

  const formattedTime = report.timestamp
    ? new Date(report.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "N/A";
  const formattedDate = report.timestamp
    ? new Date(report.timestamp).toLocaleDateString()
    : "—";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Dataset Version (Interactive Popover - Section 5) */}
      <Card className="bg-white border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-150 relative">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Dataset Version
            </span>
            <div className="relative inline-block mt-0.5">
              <button
                type="button"
                onClick={() => setIsVersionPopoverOpen((prev) => !prev)}
                onBlur={() => setTimeout(() => setIsVersionPopoverOpen(false), 200)}
                className="group flex items-center gap-1.5 text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer focus-visible:outline-none"
                aria-haspopup="dialog"
                aria-expanded={isVersionPopoverOpen}
              >
                <span>v{report.dataset_version || "1.0.0"}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 transition-transform" />
              </button>

              {/* Version Popover Modal (Section 5) */}
              {isVersionPopoverOpen && (
                <div className="absolute left-0 top-full mt-2 w-64 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xl z-30 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900">Dataset Metadata</span>
                    <span className="font-mono text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                      v{report.dataset_version}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Rows:</span>
                      <span className="font-mono font-semibold text-slate-800">{report.total_rows.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Features:</span>
                      <span className="font-mono font-semibold text-slate-800">{report.total_columns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Validated:</span>
                      <span className="text-slate-800 font-medium">{formattedTime} · {formattedDate}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                      <span className="text-slate-400">Gate Status:</span>
                      <span className={cn("font-bold text-[11px]", isHealthy ? "text-emerald-600" : "text-rose-600")}>
                        {report.overall_status}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              Primary production set
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Database className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. Last Validation */}
      <Card className="bg-white border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-150">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Last Validation
            </span>
            <p className="text-lg font-bold text-slate-900 mt-0.5 truncate">
              {formattedTime}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {formattedDate}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <Clock className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Total Rows */}
      <Card className="bg-white border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-150">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Rows
            </span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">
              {report.total_rows.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Academic observations
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
            <Layers className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Features */}
      <Card className="bg-white border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-150">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Features
            </span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">
              {report.total_columns}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {report.numeric_columns?.length || 7} numeric, {report.categorical_columns?.length || 0} categorical
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <FileCheck className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>

      {/* 5. Quality Status */}
      <Card className="bg-white border-slate-200/90 shadow-2xs hover:shadow-xs transition-all duration-150">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Quality Status
            </span>
            <div className="mt-1">
              {isHealthy ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  PASS
                </span>
              ) : isWarning ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  WARNING
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  FAIL
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {isHealthy ? "All gates cleared" : "Action required"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
