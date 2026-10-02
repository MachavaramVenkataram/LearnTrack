"use client";

import React from "react";
import { Sparkles, BarChart3, TrendingUp, Calendar, ArrowRight } from "lucide-react";

interface AcademicContextCardProps {
  rollNumber: string;
  department: string;
  year: number;
  semester: number;
  section?: string;
  onOpenContextDrawer: () => void;
}

export function AcademicContextCard({
  rollNumber,
  department,
  year,
  semester,
  section,
  onOpenContextDrawer,
}: AcademicContextCardProps) {
  const yearOrdinal =
    year === 1
      ? "1st Year"
      : year === 2
      ? "2nd Year"
      : year === 3
      ? "3rd Year"
      : year === 4
      ? "4th Year"
      : `${year}th Year`;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <h3 className="text-base font-bold text-slate-900 font-sans">
              Your LearnTrack Context
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Active parameter vector used dynamically across intelligence modules.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenContextDrawer}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50/70 border border-blue-200 hover:bg-blue-100/70 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>View how LearnTrack uses your profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
            Target Student
          </span>
          <span className="font-mono font-bold text-slate-900 text-xs truncate block" title={rollNumber}>
            {rollNumber || "LT-PENDING"}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">roll_number</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
            Academic Program
          </span>
          <span className="font-bold text-slate-900 text-xs truncate block" title={department}>
            {department || "Program Unspecified"}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">department</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
            Cohort Level
          </span>
          <span className="font-bold text-slate-900 text-xs block">
            {yearOrdinal}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">academic_year</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
            Active Term
          </span>
          <span className="font-bold text-slate-900 text-xs block">
            Semester {semester} {section ? `(${section})` : ""}
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">semester_term</span>
        </div>
      </div>

      {/* Connected Subsystems */}
      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-500 font-medium">Synchronized Subsystems:</span>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-[11px] font-medium border border-purple-100">
            <Sparkles className="w-3 h-3 text-purple-600" />
            AI Assistant
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-100">
            <BarChart3 className="w-3 h-3 text-blue-600" />
            Analytics
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-medium border border-indigo-100">
            <TrendingUp className="w-3 h-3 text-indigo-600" />
            Predictions
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-100">
            <Calendar className="w-3 h-3 text-emerald-600" />
            Study Planner
          </span>
        </div>
      </div>
    </div>
  );
}
