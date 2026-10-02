"use client";

import React from "react";
import {
  GraduationCap,
  Calendar,
  Clock,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { Subject } from "@/types/academic";
import { cn } from "@/lib/utils";

export interface AnalyticsContextBarProps {
  currentSemester: number | string;
  currentYear: string;
  lastUpdatedText: string;
  selectedSemester: string;
  selectedYear: string;
  selectedSubjectId: string;
  onSemesterChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onResetFilters: () => void;
  availableSemesters: number[];
  availableYears: string[];
  subjects: Subject[];
  totalRecordsCount: number;
  filteredRecordsCount: number;
  isFiltering?: boolean;
}

export function AnalyticsContextBar({
  currentSemester,
  currentYear,
  lastUpdatedText,
  selectedSemester,
  selectedYear,
  selectedSubjectId,
  onSemesterChange,
  onYearChange,
  onSubjectChange,
  onResetFilters,
  availableSemesters,
  availableYears,
  subjects,
  totalRecordsCount,
  filteredRecordsCount,
  isFiltering = false,
}: AnalyticsContextBarProps) {
  const isAnyFilterActive =
    selectedSemester !== "all" || selectedYear !== "all" || selectedSubjectId !== "all";

  // Derive human-readable labels for selected values
  const semesterLabel =
    selectedSemester === "all" ? "All Semesters" : `Semester ${selectedSemester}`;
  const yearLabel = selectedYear === "all" ? "All Academic Years" : selectedYear;
  const subjectLabel =
    selectedSubjectId === "all"
      ? "All Subjects"
      : subjects.find((s) => s.id === selectedSubjectId)?.subject_name || "Selected Subject";

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-4 sm:p-5 space-y-4 transition-all duration-150">
      {/* Top Metadata Row (Section 4) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
          <span>Analytics Context</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-slate-400">Current Semester:</span>
            <span className="font-semibold text-slate-900">Semester {currentSemester}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-400">Academic Year:</span>
            <span className="font-semibold text-slate-900">{currentYear}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{lastUpdatedText}</span>
          </div>
        </div>
      </div>

      {/* Interactive Filters Grid (Section 4 & 5) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Semester Filter */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Semester
          </label>
          <div className="relative">
            <select
              className={cn(
                "w-full h-10 rounded-xl border border-slate-200 bg-slate-50/70 px-3 pr-8 text-xs font-medium text-slate-800 transition-all duration-150 cursor-pointer appearance-none",
                "focus:outline-hidden focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10",
                selectedSemester !== "all" && "border-blue-300 bg-blue-50/40 text-blue-900 font-semibold"
              )}
              value={selectedSemester}
              onChange={(e) => onSemesterChange(e.target.value)}
              aria-label="Filter by semester"
            >
              <option value="all">All Semesters ({totalRecordsCount} records)</option>
              {availableSemesters.map((sem) => (
                <option key={sem} value={String(sem)}>
                  Semester {sem}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Academic Year Filter */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Academic Year
          </label>
          <div className="relative">
            <select
              className={cn(
                "w-full h-10 rounded-xl border border-slate-200 bg-slate-50/70 px-3 pr-8 text-xs font-medium text-slate-800 transition-all duration-150 cursor-pointer appearance-none",
                "focus:outline-hidden focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10",
                selectedYear !== "all" && "border-blue-300 bg-blue-50/40 text-blue-900 font-semibold"
              )}
              value={selectedYear}
              onChange={(e) => onYearChange(e.target.value)}
              aria-label="Filter by academic year"
            >
              <option value="all">All Academic Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr.startsWith("Year") ? yr : `Year ${yr}`}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Subject Focus Filter */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            Subject Focus
          </label>
          <div className="relative">
            <select
              className={cn(
                "w-full h-10 rounded-xl border border-slate-200 bg-slate-50/70 px-3 pr-8 text-xs font-medium text-slate-800 transition-all duration-150 cursor-pointer appearance-none truncate",
                "focus:outline-hidden focus:bg-white focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10",
                selectedSubjectId !== "all" && "border-blue-300 bg-blue-50/40 text-blue-900 font-semibold"
              )}
              value={selectedSubjectId}
              onChange={(e) => onSubjectChange(e.target.value)}
              aria-label="Filter by subject"
            >
              <option value="all">All Subjects ({subjects.length} registered)</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.subject_code ? `${sub.subject_code} - ` : ""}
                  {sub.subject_name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Filter Scope Summary (Section 6) */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2 text-slate-600">
          <span className="text-[11px] text-slate-400 font-medium">Showing analytics for:</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-[11.5px]">
            {semesterLabel}
            <span className="text-slate-300">•</span>
            {yearLabel}
            <span className="text-slate-300">•</span>
            <span className="truncate max-w-[200px]">{subjectLabel}</span>
          </span>

          <span className="text-[11px] text-slate-400 font-mono">
            ({filteredRecordsCount} record{filteredRecordsCount !== 1 ? "s" : ""} in scope)
          </span>

          {isFiltering && (
            <span className="text-[11px] text-blue-600 font-medium animate-pulse">
              Updating analytics...
            </span>
          )}
        </div>

        {isAnyFilterActive && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-[11px] font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
