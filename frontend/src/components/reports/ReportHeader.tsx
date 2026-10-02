"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Printer,
  Download,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface ReportHeaderProps {
  onPrint: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  isReady: boolean;
  isExporting?: boolean;
}

export function ReportHeader({
  onPrint,
  onExportCSV,
  onExportJSON,
  isReady,
  isExporting = false,
}: ReportHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="space-y-3 print:hidden">
      {/* 1. Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Link
          href="/dashboard"
          className="hover:text-slate-900 transition-colors duration-150"
        >
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
        <span className="text-slate-900 font-semibold">Reports</span>
      </nav>

      {/* 2. Main Title Row with Status and Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              Academic Reports
            </h1>
            {isReady ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Report ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                Compiling...
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Generate polished academic performance reports from your verified LearnTrack data.
          </p>
        </div>

        {/* Action Buttons: Desktop */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onExportCSV}
            disabled={!isReady || isExporting}
            leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
            className="h-9 px-3 text-xs font-medium text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-lg shadow-2xs transition-all active:scale-[0.98]"
            title="Download coursework evaluations and activities in CSV format"
          >
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExportJSON}
            disabled={!isReady || isExporting}
            leftIcon={<FileCode className="w-3.5 h-3.5 text-blue-600" />}
            className="h-9 px-3 text-xs font-medium text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-lg shadow-2xs transition-all active:scale-[0.98]"
            title="Download full academic dossier structure in JSON format"
          >
            Export JSON
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onPrint}
            disabled={!isReady}
            leftIcon={<Printer className="w-4 h-4 text-white" />}
            className="h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs transition-all active:scale-[0.98]"
            title="Open printable document or save as PDF"
          >
            Print / Save PDF
          </Button>
        </div>

        {/* Mobile Action Controls */}
        <div className="flex sm:hidden items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onPrint}
            disabled={!isReady}
            leftIcon={<Printer className="w-3.5 h-3.5 text-white" />}
            className="flex-1 h-9 text-xs font-semibold bg-blue-600 text-white rounded-lg"
          >
            Print / PDF
          </Button>

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9 p-0 rounded-lg border-slate-200 flex items-center justify-center text-slate-600"
              aria-label="Export options"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>

            {mobileMenuOpen && (
              <div className="absolute right-0 top-11 w-44 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-30 animate-in fade-in-50 zoom-in-95">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onExportCSV();
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Export CSV
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onExportJSON();
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <FileCode className="w-4 h-4 text-blue-600" />
                  Export JSON
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
