"use client";

import React from "react";
import {
  TrendingUp,
  GraduationCap,
  CalendarCheck,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface AnalyticsKpiCardsProps {
  averageScore: number | null;
  cgpa: number | null;
  averageAttendance: number | null;
  totalStudyHours: number;
  filteredRecordsCount: number;
  filteredActivitiesCount: number;
  attendanceTarget: number;
  hasPreviousPeriod: boolean;
  scoreChange: number | null;
  attendanceChange: number | null;
  studyHoursChange: number | null;
}

export function AnalyticsKpiCards({
  averageScore,
  cgpa,
  averageAttendance,
  totalStudyHours,
  filteredRecordsCount,
  filteredActivitiesCount,
  attendanceTarget,
  hasPreviousPeriod,
  scoreChange,
  attendanceChange,
  studyHoursChange,
}: AnalyticsKpiCardsProps) {
  // Common hover & transition styling: 160-180ms ease-out, translateY(-2px), border darker, shadow lift
  const cardClasses = cn(
    "group relative rounded-2xl bg-white p-5 border border-slate-200/90 shadow-2xs",
    "transition-all duration-180 ease-out hover:-translate-y-0.5 hover:shadow-xs hover:border-slate-300",
    "flex flex-col justify-between"
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. AVERAGE SCORE CARD */}
      <div className={cardClasses}>
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">
              Average Score
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-180">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 text-slate-900">
            <span className="text-3xl font-extrabold tracking-tight font-sans">
              {averageScore !== null ? `${averageScore}%` : "—"}
            </span>
            {averageScore !== null && (
              <span className="text-xs font-semibold text-slate-400">/ 100</span>
            )}
          </div>
        </div>

        {/* Trend Comparison / Context (Section 8: No Fake Comparisons) */}
        <div className="mt-3.5 pt-3 border-t border-slate-100/80 space-y-1">
          {hasPreviousPeriod && scoreChange !== null ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {scoreChange > 0 ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-700 font-mono">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  +{scoreChange.toFixed(1)} pts
                </span>
              ) : scoreChange < 0 ? (
                <span className="inline-flex items-center gap-0.5 text-rose-700 font-mono">
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                  {scoreChange.toFixed(1)} pts
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-slate-600 font-mono">
                  <Minus className="w-3.5 h-3.5 text-slate-400" />
                  0.0 pts
                </span>
              )}
              <span className="text-[11px] text-slate-400 font-normal">vs previous period</span>
            </div>
          ) : (
            <p className="text-[11.5px] text-slate-400 font-normal">
              {averageScore !== null
                ? "Comparison unavailable (baseline period)"
                : "No evaluation records"}
            </p>
          )}

          <p className="text-[11.5px] text-slate-500 leading-snug">
            {averageScore !== null
              ? `Across ${filteredRecordsCount} evaluation${filteredRecordsCount !== 1 ? "s" : ""}.`
              : "No coursework evaluations match."}
          </p>
        </div>
      </div>

      {/* 2. CGPA CARD */}
      <div className={cardClasses}>
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">
              CGPA
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-180">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 text-slate-900">
            <span className="text-3xl font-extrabold tracking-tight font-sans">
              {cgpa !== null ? cgpa.toFixed(2) : "—"}
            </span>
            {cgpa !== null && (
              <span className="text-xs font-semibold text-slate-400">/ 10.0</span>
            )}
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-100/80 space-y-1">
          <p className="text-[11.5px] font-semibold text-slate-700">
            {cgpa !== null ? "Credit-weighted index" : "No credit records"}
          </p>
          <p className="text-[11.5px] text-slate-500 leading-snug">
            {cgpa !== null
              ? "Weighted by standard course credit hours."
              : "Register subjects to compute CGPA."}
          </p>
        </div>
      </div>

      {/* 3. ATTENDANCE CARD */}
      <div className={cardClasses}>
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">
              Attendance
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-180">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 text-slate-900">
            <span className="text-3xl font-extrabold tracking-tight font-sans">
              {averageAttendance !== null ? `${averageAttendance}%` : "—"}
            </span>
            {averageAttendance !== null && (
              <span className="text-xs font-semibold text-slate-400">rate</span>
            )}
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-100/80 space-y-1">
          {hasPreviousPeriod && attendanceChange !== null ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {attendanceChange > 0 ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-700 font-mono">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  +{attendanceChange.toFixed(1)}%
                </span>
              ) : attendanceChange < 0 ? (
                <span className="inline-flex items-center gap-0.5 text-rose-700 font-mono">
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                  {attendanceChange.toFixed(1)}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-slate-600 font-mono">
                  <Minus className="w-3.5 h-3.5 text-slate-400" />
                  0.0%
                </span>
              )}
              <span className="text-[11px] text-slate-400 font-normal">vs previous period</span>
            </div>
          ) : (
            <p className="text-[11.5px] text-slate-400 font-normal">
              {averageAttendance !== null
                ? `Threshold baseline: ${attendanceTarget}%`
                : "No attendance logs"}
            </p>
          )}

          <p className="text-[11.5px] text-slate-500 leading-snug">
            {averageAttendance !== null
              ? averageAttendance >= attendanceTarget
                ? `Above configured ${attendanceTarget}% target.`
                : `Below configured ${attendanceTarget}% target.`
              : "No verified attendance records."}
          </p>
        </div>
      </div>

      {/* 4. STUDY HOURS CARD */}
      <div className={cardClasses}>
        <div>
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.04em] text-slate-500">
              Study Hours
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100/80 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-180">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-1.5 text-slate-900">
            <span className="text-3xl font-extrabold tracking-tight font-sans">
              {totalStudyHours > 0 ? `${totalStudyHours}h` : "—"}
            </span>
            {totalStudyHours > 0 && (
              <span className="text-xs font-semibold text-slate-400">invested</span>
            )}
          </div>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-100/80 space-y-1">
          {hasPreviousPeriod && studyHoursChange !== null ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {studyHoursChange > 0 ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-700 font-mono">
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  +{studyHoursChange.toFixed(1)}h
                </span>
              ) : studyHoursChange < 0 ? (
                <span className="inline-flex items-center gap-0.5 text-rose-700 font-mono">
                  <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
                  {studyHoursChange.toFixed(1)}h
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-slate-600 font-mono">
                  <Minus className="w-3.5 h-3.5 text-slate-400" />
                  0.0h
                </span>
              )}
              <span className="text-[11px] text-slate-400 font-normal">vs previous period</span>
            </div>
          ) : (
            <p className="text-[11.5px] text-slate-400 font-normal">
              {totalStudyHours > 0
                ? `${filteredActivitiesCount} session${filteredActivitiesCount !== 1 ? "s" : ""} recorded`
                : "No study activity recorded"}
            </p>
          )}

          <p className="text-[11.5px] text-slate-500 leading-snug">
            {totalStudyHours > 0
              ? "Dedicated self-directed revision."
              : "Log study sessions to monitor habits."}
          </p>
        </div>
      </div>
    </div>
  );
}
