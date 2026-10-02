"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Target,
  Sparkles,
  ChevronRight,
  Database,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface AnalyticsHeaderProps {
  hasRecords: boolean;
  onOpenReportModal: () => void;
}

export function AnalyticsHeader({
  hasRecords,
  onOpenReportModal,
}: AnalyticsHeaderProps) {
  return (
    <div className="space-y-3 pb-1">
      {/* 1. Subtle Breadcrumb (Section 3) */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
        <Link
          href="/dashboard"
          className="hover:text-slate-800 transition-colors"
        >
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-semibold text-slate-900">Academic Analytics</span>
      </nav>

      {/* 2. Header Main Content & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Status Indicator (Section 2) */}
          <div className="flex items-center gap-2 mb-1.5">
            {hasRecords ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Data synchronized
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                Needs more data
              </span>
            )}
            <span className="text-[11px] text-slate-400 font-mono">LearnTrack Analytics v1.0</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Academic Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Understand how your academic performance is changing over time across coursework, attendance, and study habits.
          </p>
        </div>

        {/* Header Actions (Section 2: Generate Report = secondary, Manage Goals = primary) */}
        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenReportModal}
            leftIcon={<FileText className="w-3.5 h-3.5 text-slate-500" />}
            className="shadow-2xs hover:bg-[#F8FAFC] hover:border-[#CBD5E1] transition-all duration-150"
          >
            Generate Report
          </Button>

          <Link href="/goals">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Target className="w-3.5 h-3.5" />}
              className="shadow-xs shadow-blue-500/10 hover:-translate-y-0.5 transition-transform duration-150"
            >
              Manage Goals
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
