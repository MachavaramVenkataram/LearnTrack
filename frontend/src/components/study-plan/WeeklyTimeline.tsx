"use client";

import React from "react";
import { Calendar, CheckCircle2 } from "lucide-react";
import { StudyPlanSession } from "@/types/academic";

export interface DayGroup {
  dateStr: string;
  dayTitle: string;
  dateFormatted: string;
  weekdayShort: string;
  sessions: StudyPlanSession[];
  isAllCompleted: boolean;
  completedCount: number;
  totalCount: number;
  isToday: boolean;
}

interface WeeklyTimelineProps {
  days: DayGroup[];
  selectedDate: string | null; // null means "All Days"
  onSelectDate: (dateStr: string | null) => void;
  totalCompletedHours: number;
  totalPlannedHours: number;
  completionPercentage: number;
}

export function WeeklyTimeline({
  days,
  selectedDate,
  onSelectDate,
  totalCompletedHours,
  totalPlannedHours,
  completionPercentage,
}: WeeklyTimelineProps) {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm space-y-4">
      {/* Header with Weekly Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
              Weekly Schedule Timeline
            </h3>
            <p className="text-xs text-[#64748B]">
              Select a day to view its scheduled sessions
            </p>
          </div>
        </div>

        {/* Progress summary badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-900 font-mono">
              {totalCompletedHours}h / {totalPlannedHours}h
            </div>
            <div className="text-[11px] text-slate-400">
              {completionPercentage}% complete
            </div>
          </div>
          <div className="w-20 bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#2563EB] h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Days Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        {/* "All Days" pill */}
        <button
          type="button"
          onClick={() => onSelectDate(null)}
          className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold shrink-0 transition-all flex flex-col items-center justify-center min-w-[72px] cursor-pointer ${
            selectedDate === null
              ? "bg-[#2563EB] text-white border-[#2563EB] shadow-2xs"
              : "bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700"
          }`}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
            View
          </span>
          <span className="font-bold text-[13px] mt-0.5">All Days</span>
          <span className="text-[10px] font-mono opacity-80 mt-0.5">
            {days.reduce((acc, d) => acc + d.sessions.length, 0)} sessions
          </span>
        </button>

        {/* Individual day buttons */}
        {days.map((day) => {
          const isSelected = selectedDate === day.dateStr;
          const isDone = day.isAllCompleted && day.totalCount > 0;

          return (
            <button
              key={day.dateStr}
              type="button"
              onClick={() => onSelectDate(day.dateStr)}
              className={`relative px-3.5 py-2.5 rounded-xl border text-xs shrink-0 transition-all flex flex-col items-center justify-center min-w-[84px] cursor-pointer ${
                isSelected
                  ? "bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] shadow-2xs ring-1 ring-blue-500/20"
                  : day.isToday
                  ? "bg-blue-50/40 border-blue-200 text-slate-800 hover:bg-blue-50/70"
                  : "bg-slate-50 hover:bg-slate-100/80 border-slate-200/80 text-slate-700"
              }`}
            >
              {/* Today indicator pip */}
              {day.isToday && (
                <span className="absolute -top-1 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#2563EB] text-white uppercase tracking-wider">
                  Today
                </span>
              )}

              {/* Day of week */}
              <span
                className={`text-[10px] uppercase font-bold tracking-wider ${
                  isSelected ? "text-[#2563EB]" : "text-slate-500"
                }`}
              >
                {day.weekdayShort}
              </span>

              {/* Date formatted */}
              <span className="font-bold text-[13px] mt-0.5 text-slate-900">
                {day.dateFormatted}
              </span>

              {/* Session status dots / badge */}
              <div className="flex items-center gap-1 mt-1">
                {isDone ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" />
                    All Done
                  </span>
                ) : (
                  <span
                    className={`text-[10px] font-mono font-medium ${
                      isSelected ? "text-blue-700" : "text-slate-500"
                    }`}
                  >
                    {day.completedCount}/{day.totalCount} done
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
