"use client";

import React from "react";
import Link from "next/link";
import {
  Award,
  CalendarCheck,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { PerformancePrediction } from "@/types/academic";

interface InsightsMetricCardsProps {
  currentPerformance: number | null;
  averageAttendance: number | null;
  studyHours: number | null;
  latestPrediction: PerformancePrediction | null;
}

export function InsightsMetricCards({
  currentPerformance,
  averageAttendance,
  studyHours,
  latestPrediction,
}: InsightsMetricCardsProps) {
  // Helper to format timestamps cleanly without inventing values
  const formatPredictionTime = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      if (diffHours < 1) return "Generated recently";
      if (diffHours < 24) return `Generated ${diffHours}h ago`;
      return `Generated ${date.toLocaleDateString([], { month: "short", day: "numeric" })}`;
    } catch {
      return null;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. CURRENT PERFORMANCE */}
      <div className="group p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-180 ease-out flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-sans">
            Current Performance
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100/70 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-104 transition-transform duration-180">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <div className="text-[28px] sm:text-[30px] font-bold text-slate-900 tracking-tight font-mono">
            {currentPerformance !== null && currentPerformance !== undefined
              ? `${currentPerformance.toFixed(1)}%`
              : "—"}
          </div>
          <p className="text-xs text-slate-500 font-normal leading-relaxed truncate">
            {currentPerformance !== null && currentPerformance !== undefined
              ? "Average evaluation score"
              : "No coursework recorded"}
          </p>
        </div>
      </div>

      {/* 2. AVERAGE ATTENDANCE */}
      <div className="group p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-180 ease-out flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-sans">
            Average Attendance
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-104 transition-transform duration-180">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <div className="text-[28px] sm:text-[30px] font-bold text-slate-900 tracking-tight font-mono flex items-baseline gap-2">
            <span>
              {averageAttendance !== null && averageAttendance !== undefined
                ? `${averageAttendance.toFixed(1)}%`
                : "—"}
            </span>
            {averageAttendance !== null && (
              <span
                className={`text-xs font-semibold flex items-center ${
                  averageAttendance >= 75 ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {averageAttendance >= 75 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-normal leading-relaxed truncate">
            {averageAttendance !== null && averageAttendance !== undefined
              ? averageAttendance >= 75
                ? "Above 75% target threshold"
                : "Below 75% target threshold"
              : "No attendance recorded"}
          </p>
        </div>
      </div>

      {/* 3. STUDY HOURS */}
      <div className="group p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-180 ease-out flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-sans">
            Study Hours
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100/70 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-104 transition-transform duration-180">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <div className="text-[28px] sm:text-[30px] font-bold text-slate-900 tracking-tight font-mono">
            {studyHours !== null && studyHours !== undefined && studyHours > 0
              ? `${studyHours.toFixed(1)}h`
              : "—"}
          </div>
          <p className="text-xs text-slate-500 font-normal leading-relaxed truncate">
            {studyHours !== null && studyHours !== undefined && studyHours > 0
              ? "Total logged focused hours"
              : "No study sessions logged"}
          </p>
        </div>
      </div>

      {/* 4. LATEST PREDICTION */}
      <div className="group p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-180 ease-out flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-sans">
            Latest Prediction
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100/70 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-104 transition-transform duration-180">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <div className="text-[28px] sm:text-[30px] font-bold text-slate-900 tracking-tight font-mono">
            {latestPrediction
              ? `${latestPrediction.predicted_score.toFixed(1)} pts`
              : "—"}
          </div>
          <div className="text-xs text-slate-500 font-normal leading-relaxed flex items-center justify-between">
            {latestPrediction ? (
              <>
                <span className="font-medium text-slate-700">
                  Grade {latestPrediction.predicted_grade} • {latestPrediction.risk_level} Risk
                </span>
                {formatPredictionTime(latestPrediction.created_at) && (
                  <span className="text-[11px] text-slate-400 font-sans">
                    {formatPredictionTime(latestPrediction.created_at)}
                  </span>
                )}
              </>
            ) : (
              <Link
                href="/prediction"
                className="text-blue-600 font-medium hover:underline inline-flex items-center gap-1"
              >
                <span>Run prediction</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
