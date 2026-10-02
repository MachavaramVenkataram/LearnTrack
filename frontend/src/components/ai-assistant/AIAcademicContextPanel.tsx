"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Info,
  RefreshCw,
  SlidersHorizontal,
  CalendarRange,
  Target,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PremiumActionButton } from "@/components/ui/PremiumActionButton";
import { StudentAIContext, StudyPlan, AcademicGoal } from "@/types/academic";

interface AIAcademicContextPanelProps {
  context: StudentAIContext | null;
  activePlan: StudyPlan | null;
  goals: AcademicGoal[];
  isLoading: boolean;
  onRefreshContext: () => Promise<void>;
}

export function AIAcademicContextPanel({
  context,
  activePlan,
  goals,
  isLoading,
  onRefreshContext,
}: AIAcademicContextPanelProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshContext();
      setLastRefreshedAt(new Date());
    } finally {
      setIsRefreshing(false);
    }
  };

  const hasAnyData =
    (context?.academic.subjects && context.academic.subjects.length > 0) ||
    context?.academic.cgpa !== null ||
    context?.study.total_hours > 0 ||
    context?.prediction !== null;

  return (
    <div className="h-full flex flex-col bg-slate-50/50 border-l border-slate-200/80 w-full overflow-hidden select-none">
      {/* Panel Top Bar with Refresh & Info */}
      <div className="p-3.5 border-b border-slate-200/70 bg-white/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-bold text-slate-800 tracking-tight">
            YOUR LEARNTRACK CONTEXT
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasAnyData ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
              Setup Needed
            </span>
          )}

          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
            title="Refresh academic context"
            aria-label="Refresh academic context"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Timestamp & Tooltip info */}
      <div className="px-3.5 py-1.5 bg-slate-100/60 border-b border-slate-200/50 flex items-center justify-between text-[10px] text-slate-500 shrink-0">
        <span className="truncate">Grounded in your real coursework records</span>
        <span className="font-mono text-slate-400 shrink-0">
          {lastRefreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {/* Main Context Scroll Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-200/60 animate-pulse" />
            ))}
          </div>
        ) : !hasAnyData ? (
          /* Empty Context State (Requirement #55) */
          <div className="p-5 rounded-xl border border-slate-200 bg-white text-center space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-slate-800 text-xs">
                Your academic workspace is being set up
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Add subjects, academic records, or study activity to unlock personalized LearnTrack AI guidance.
              </p>
            </div>
            <Link href="/subjects" className="inline-block pt-1">
              <Button variant="primary" size="sm" className="h-8 text-xs px-3">
                Add Subject
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* ============================================================== */}
            {/* 1. ACADEMIC OVERVIEW (Requirement #33)                        */}
            {/* ============================================================== */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-0.5">
                Academic Overview
              </span>

              {/* Standing Card */}
              <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {context?.profile.semester
                      ? `Semester ${context.profile.semester}`
                      : "Semester 1"}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Year {context?.profile.year || 1}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 truncate font-medium">
                  {context?.profile.department || "Computer Science & Engineering"}
                </p>
              </div>

              {/* 3 Metric cards: CGPA, Attendance, Study Hours */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs text-center">
                  <span className="text-[10px] text-slate-400 block font-medium">CGPA</span>
                  <span className="text-sm font-bold text-slate-900 font-mono block mt-0.5">
                    {context?.academic.cgpa !== null && context?.academic.cgpa !== undefined
                      ? context.academic.cgpa.toFixed(2)
                      : "—"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs text-center">
                  <span className="text-[10px] text-slate-400 block font-medium">Attendance</span>
                  <span className="text-sm font-bold text-slate-900 font-mono block mt-0.5">
                    {context?.academic.average_attendance !== null &&
                    context?.academic.average_attendance !== undefined
                      ? `${context.academic.average_attendance.toFixed(1)}%`
                      : "—"}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs text-center">
                  <span className="text-[10px] text-slate-400 block font-medium">Study Hours</span>
                  <span className="text-sm font-bold text-slate-900 font-mono block mt-0.5">
                    {context?.study.total_hours
                      ? `${context.study.total_hours.toFixed(1)}h`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* 2. PERFORMANCE INTELLIGENCE (Requirement #33)                  */}
            {/* ============================================================== */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-0.5">
                Performance Intelligence
              </span>

              <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700">
                    Latest Model Prediction
                  </span>
                  {context?.prediction ? (
                    <Badge
                      variant={
                        context.prediction.risk_level === "Low"
                          ? "success"
                          : context.prediction.risk_level === "Medium"
                          ? "warning"
                          : "danger"
                      }
                      size="sm"
                    >
                      {context.prediction.risk_level} Risk
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">Pending Data</span>
                  )}
                </div>

                <div className="flex items-baseline justify-between pt-0.5">
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    {context?.prediction
                      ? `${context.prediction.predicted_score.toFixed(1)} pts`
                      : "—"}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    Grade: <strong>{context?.prediction?.predicted_grade || "N/A"}</strong>
                  </span>
                </div>

                {/* Key SHAP factors if available */}
                {context?.prediction?.key_factors && context.prediction.key_factors.length > 0 && (
                  <div className="pt-1.5 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Top Influencing Factors
                    </span>
                    <div className="space-y-1">
                      {context.prediction.key_factors.slice(0, 3).map((factor, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-[11px] text-slate-700 bg-slate-50 px-2 py-1 rounded-md"
                        >
                          <span className="truncate max-w-[170px]">{factor.label}</span>
                          <span
                            className={`font-mono text-[10px] font-bold ${
                              factor.direction === "positive"
                                ? "text-emerald-600"
                                : "text-rose-600"
                            }`}
                          >
                            {factor.direction === "positive" ? "+" : "-"}
                            {Math.abs(factor.impact).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ============================================================== */}
            {/* 3. ACADEMIC CONTEXT: SUBJECTS, STUDY PLAN, GOALS               */}
            {/* ============================================================== */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Enrolled Subjects ({context?.academic.subjects.length || 0})
                </span>
                <Link
                  href="/subjects"
                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                >
                  View all <ExternalLink className="w-2.5 h-2.5" />
                </Link>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
                {context?.academic.subjects && context.academic.subjects.length > 0 ? (
                  context.academic.subjects.map((s) => (
                    <Link
                      key={s.id}
                      href={`/subjects/${s.id}`}
                      className="p-2 rounded-lg bg-white border border-slate-200/70 hover:border-blue-200 hover:bg-blue-50/40 transition-colors flex items-center justify-between text-[11px] group shadow-2xs"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-slate-800 group-hover:text-blue-700 truncate block">
                          {s.name}
                        </span>
                        {s.code && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {s.code}
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-bold text-slate-700 shrink-0">
                        {s.score !== null && s.score !== undefined ? `${s.score}%` : "—"}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-400 italic px-1">
                    No enrolled subjects yet.
                  </p>
                )}
              </div>
            </div>

            {/* Active Study Plan Snapshot */}
            {activePlan && (
              <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Active Study Plan
                  </span>
                  <Badge variant="secondary" size="sm" className="text-[10px]">
                    Active
                  </Badge>
                </div>
                <p className="font-semibold text-slate-800 text-xs truncate">
                  {activePlan.title}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>
                    {activePlan.sessions && activePlan.sessions.length > 0
                      ? `${activePlan.sessions.length} planned sessions`
                      : "Schedule configured"}
                  </span>
                  <Link
                    href="/study-plan"
                    className="text-blue-600 font-medium hover:underline flex items-center gap-0.5"
                  >
                    Manage <ArrowRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Active Goals Snapshot */}
            {goals.filter((g) => g.status === "active").length > 0 && (
              <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Academic Goals ({goals.filter((g) => g.status === "active").length})
                  </span>
                  <Link
                    href="/goals"
                    className="text-[10px] font-semibold text-blue-600 hover:underline"
                  >
                    View Goals
                  </Link>
                </div>

                <div className="space-y-1.5">
                  {goals
                    .filter((g) => g.status === "active")
                    .slice(0, 2)
                    .map((goal) => {
                      const pct = Math.min(
                        100,
                        Math.round((goal.current_value / (goal.target_value || 1)) * 100)
                      );
                      return (
                        <div key={goal.id} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-700 truncate max-w-[160px]">
                              {goal.title}
                            </span>
                            <span className="font-mono font-semibold text-slate-800">
                              {pct}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Quick Action Navigation link (What-If Simulator) */}
            <div className="pt-2">
              <PremiumActionButton
                href="/simulator"
                label="What-If Simulator"
                variant="intelligence"
                icon={<SlidersHorizontal className="w-4 h-4" />}
                fullWidth
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
