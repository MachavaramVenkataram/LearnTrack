"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  RefreshCw,
  FileCheck,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface DataQualityHeaderProps {
  status: string | null;
  isLoading: boolean;
  isValidating: boolean;
  onRefresh: () => void;
  onRunValidation: () => void;
}

export function DataQualityHeader({
  status,
  isLoading,
  isValidating,
  onRefresh,
  onRunValidation,
}: DataQualityHeaderProps) {
  const isHealthy = status === "PASSED" || status === "PASS";
  const isWarning = status === "WARNING";
  const isFailed = status === "FAILED" || status === "FAIL";

  return (
    <div className="space-y-4">
      {/* 1. Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Link
          href="/dashboard"
          className="hover:text-slate-900 transition-colors duration-150"
        >
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
        <span className="text-slate-400">ML Engineering</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
        <span className="text-slate-900 font-semibold">Data Quality</span>
      </nav>

      {/* 2. Main Title Row with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              Data Quality
            </h1>
            {status ? (
              isHealthy ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Dataset Healthy
                </span>
              ) : isWarning ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Needs Attention
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  Validation Failed
                </span>
              )
            ) : null}
          </div>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
            Validate dataset integrity before machine-learning training.
          </p>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading || isValidating}
            className="h-10 px-3.5 text-xs font-semibold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs hover:shadow-xs transition-all duration-150 cursor-pointer"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-2 text-slate-500", isLoading && "animate-spin text-blue-600")} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={onRunValidation}
            disabled={isValidating}
            className="h-10 px-4 text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-blue-500/25 hover:shadow-md hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer"
          >
            <FileCheck className={cn("w-3.5 h-3.5 mr-2", isValidating && "animate-spin")} />
            {isValidating ? "Validating dataset..." : "Run Validation"}
          </Button>
        </div>
      </div>
    </div>
  );
}
