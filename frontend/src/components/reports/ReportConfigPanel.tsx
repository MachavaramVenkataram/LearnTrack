"use client";

import React from "react";
import {
  SlidersHorizontal,
  Layers,
  CheckSquare,
  Square,
  FileText,
  Shield,
  FileSpreadsheet,
  FileCode,
  Printer,
  ChevronDown,
  Sparkles,
  Target,
  GraduationCap,
  BookOpen,
  Calendar,
  Activity,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface ReportSectionsConfig {
  studentOverview: boolean;
  academicSummary: boolean;
  subjectPerformance: boolean;
  mlProjection: boolean;
  academicGoals: boolean;
  academicInsights: boolean;
}

export interface ReportConfigPanelProps {
  selectedScope: string;
  onScopeChange: (scope: string) => void;
  availableSemesters: number[];
  sectionsConfig: ReportSectionsConfig;
  onToggleSection: (key: keyof ReportSectionsConfig) => void;
  onSelectAllSections: () => void;
  onResetSections: () => void;
  activeNavSection: string;
  onScrollToSection: (sectionId: string) => void;
  onPrint: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
}

export function ReportConfigPanel({
  selectedScope,
  onScopeChange,
  availableSemesters,
  sectionsConfig,
  onToggleSection,
  onSelectAllSections,
  onResetSections,
  activeNavSection,
  onScrollToSection,
  onPrint,
  onExportCSV,
  onExportJSON,
}: ReportConfigPanelProps) {
  const selectedCount = Object.values(sectionsConfig).filter(Boolean).length;
  const totalCount = Object.keys(sectionsConfig).length;

  const sectionItems: Array<{
    key: keyof ReportSectionsConfig;
    id: string;
    num: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      key: "studentOverview",
      id: "section-overview",
      num: "01",
      label: "Student Overview",
      description: "Profile metadata, roll number & department",
      icon: GraduationCap,
    },
    {
      key: "academicSummary",
      id: "section-summary",
      num: "02",
      label: "Academic Summary",
      description: "Average score, CGPA, attendance & study hours",
      icon: Activity,
    },
    {
      key: "subjectPerformance",
      id: "section-subjects",
      num: "03",
      label: "Subject Performance",
      description: "Granular course breakdown and marks",
      icon: BookOpen,
    },
    {
      key: "mlProjection",
      id: "section-projection",
      num: "04",
      label: "Performance Projection",
      description: "Machine learning estimate & SHAP influences",
      icon: Sparkles,
    },
    {
      key: "academicGoals",
      id: "section-goals",
      num: "05",
      label: "Academic Goals",
      description: "Tracked targets and semester milestones",
      icon: Target,
    },
    {
      key: "academicInsights",
      id: "section-insights",
      num: "06",
      label: "Academic Insights",
      description: "Evidence-based trends & improvement areas",
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-4 print:hidden">
      {/* 1. Main Configuration Card */}
      <Card className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </span>
            <CardTitle className="text-sm font-bold text-slate-900">
              Report Configuration
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Choose what to include in your academic report.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Scope Selection (Section 5) */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Report Scope
            </label>
            <div className="relative">
              <select
                aria-label="Select report scope"
                value={selectedScope}
                onChange={(e) => onScopeChange(e.target.value)}
                className="w-full h-9 rounded-xl border border-slate-200 bg-slate-50/60 px-3 text-xs font-semibold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer pr-8"
              >
                <option value="all">Cumulative History (All Semesters)</option>
                {availableSemesters.map((sem) => (
                  <option key={sem} value={String(sem)}>
                    Semester {sem} Only
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Included Sections Checkbox List (Section 6) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Included Sections ({selectedCount}/{totalCount})
              </span>
              <button
                type="button"
                onClick={selectedCount === totalCount ? onResetSections : onSelectAllSections}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {selectedCount === totalCount ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="space-y-1">
              {sectionItems.map((item) => {
                const isChecked = sectionsConfig[item.key];
                const Icon = item.icon;
                return (
                  <label
                    key={item.key}
                    className={cn(
                      "flex items-start gap-2.5 p-2 rounded-xl border transition-all cursor-pointer select-none",
                      isChecked
                        ? "bg-blue-50/30 border-blue-200/80 text-slate-900"
                        : "bg-slate-50/40 border-slate-200/60 text-slate-500 opacity-60 hover:opacity-90"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isChecked}
                      onChange={() => onToggleSection(item.key)}
                    />
                    <div className="pt-0.5 shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-xs font-semibold leading-tight">{item.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Export Formats (Section 7) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Quick Export Format
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={onPrint}
                className="h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-1 shadow-2xs transition-all active:scale-[0.98]"
              >
                <Printer className="w-3.5 h-3.5" />
                PDF
              </button>
              <button
                type="button"
                onClick={onExportCSV}
                className="h-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1 transition-all active:scale-[0.98]"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                CSV
              </button>
              <button
                type="button"
                onClick={onExportJSON}
                className="h-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1 transition-all active:scale-[0.98]"
              >
                <FileCode className="w-3.5 h-3.5 text-blue-600" />
                JSON
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Interactive Document Outline (Section 26 & 27) */}
      <Card className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        <CardHeader className="pb-2 pt-3.5 px-4 border-b border-slate-100">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Report Outline
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 space-y-0.5">
          {sectionItems.map((item) => {
            const isIncluded = sectionsConfig[item.key];
            const isActive = activeNavSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={!isIncluded}
                onClick={() => onScrollToSection(item.id)}
                className={cn(
                  "w-full px-2.5 py-1.5 rounded-lg text-left text-xs transition-all flex items-center justify-between",
                  !isIncluded && "opacity-35 cursor-not-allowed",
                  isIncluded && !isActive && "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  isIncluded &&
                    isActive &&
                    "bg-blue-50 text-blue-700 font-semibold border border-blue-100 shadow-2xs"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-400 font-medium">
                    {item.num}
                  </span>
                  <span>{item.label}</span>
                </div>
                {!isIncluded && (
                  <span className="text-[9px] uppercase font-mono text-slate-400">Hidden</span>
                )}
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* 3. Security & Privacy Assurance (Section 31) */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5 text-slate-600 text-xs">
        <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900 text-[11px] leading-tight">
            Private & Verified Dossier
          </p>
          <p className="text-[10px] text-slate-500 leading-normal">
            Only authenticated academic records under your Supabase session are queried and rendered.
          </p>
        </div>
      </div>
    </div>
  );
}
