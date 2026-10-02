"use client";

import React from "react";
import { CheckCircle2, Clock, Brain, Flame, Target } from "lucide-react";

interface ReviewProgressCardProps {
  completedTodayCount: number;
  dueTodayCount: number;
}

export function ReviewProgressCard({
  completedTodayCount,
  dueTodayCount,
}: ReviewProgressCardProps) {
  const totalTargetToday = completedTodayCount + dueTodayCount;
  const percentComplete =
    totalTargetToday > 0
      ? Math.min(100, Math.round((completedTodayCount / totalTargetToday) * 100))
      : 100;

  // Deterministic estimate: ~15 seconds per active recall question
  const estRemainingMinutes =
    dueTodayCount > 0 ? Math.max(1, Math.ceil((dueTodayCount * 15) / 60)) : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/80">
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              Today&apos;s Review Progress
            </h4>
            <p className="text-[11px] text-slate-500">
              Daily active recall quota to prevent memory interval decay
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-800">
            <span className="text-blue-600 text-sm font-black">{completedTodayCount}</span>
            <span className="text-slate-400 font-normal"> / {totalTargetToday} cards</span>
          </span>

          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
              percentComplete === 100
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}
          >
            {percentComplete}% complete
          </span>
        </div>
      </div>

      {/* Progress Bar Track */}
      <div className="mt-3.5 space-y-2">
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentComplete}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{completedTodayCount} completed</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {dueTodayCount > 0
                ? `${dueTodayCount} remaining (~${estRemainingMinutes} min)`
                : "All scheduled cards completed"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
