"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  PlusCircle,
  Calendar,
  Flame,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface PeriodProgressData {
  hasPreviousPeriod: boolean;
  currentPeriodLabel?: string;
  previousPeriodLabel?: string;
  currentScore?: number | null;
  previousScore?: number | null;
  scoreChange?: number | null;
  attendanceChange?: number | null;
  studyHoursChange?: number | null;
}

export interface PersonalBestItem {
  metric: string;
  value: string;
  context: string;
  date?: string;
}

export interface PeriodComparisonAndPersonalBestsProps {
  periodProgress: PeriodProgressData;
  personalBests: PersonalBestItem[];
}

export function PeriodComparisonAndPersonalBests({
  periodProgress,
  personalBests,
}: PeriodComparisonAndPersonalBestsProps) {
  const hasBests = personalBests.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. PROGRESS PERIOD COMPARISON (Section 35) */}
      <Card className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-150 flex flex-col justify-between">
        <div>
          <CardHeader className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
                Progress Period Comparison
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Performance change relative to the previous comparable semester.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-4 pb-5">
            {!periodProgress.hasPreviousPeriod ? (
              /* Previous period unavailable state (Section 35) */
              <div className="py-8 px-4 flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                  <Calendar className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900">
                    Previous comparable period unavailable
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Longitudinal comparison requires evaluations across at least two consecutive semesters.
                  </p>
                </div>
                <div className="pt-1">
                  <Link href="/performance">
                    <Button variant="outline" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
                      Add More Academic Records
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  {/* Score Change */}
                  <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Score Change
                    </span>
                    <div className="flex items-center justify-center gap-0.5 font-sans text-base font-extrabold">
                      {periodProgress.scoreChange !== null && periodProgress.scoreChange !== undefined ? (
                        periodProgress.scoreChange > 0 ? (
                          <span className="text-emerald-700 flex items-center font-mono">
                            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                            +{periodProgress.scoreChange.toFixed(1)}%
                          </span>
                        ) : periodProgress.scoreChange < 0 ? (
                          <span className="text-rose-700 flex items-center font-mono">
                            <ArrowDownRight className="w-4 h-4 text-rose-600" />
                            {periodProgress.scoreChange.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-slate-600 font-mono">0.0%</span>
                        )
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  </div>

                  {/* Attendance Change */}
                  <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Attendance
                    </span>
                    <div className="flex items-center justify-center gap-0.5 font-sans text-base font-extrabold">
                      {periodProgress.attendanceChange !== null && periodProgress.attendanceChange !== undefined ? (
                        periodProgress.attendanceChange > 0 ? (
                          <span className="text-emerald-700 flex items-center font-mono">
                            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                            +{periodProgress.attendanceChange.toFixed(1)}%
                          </span>
                        ) : periodProgress.attendanceChange < 0 ? (
                          <span className="text-rose-700 flex items-center font-mono">
                            <ArrowDownRight className="w-4 h-4 text-rose-600" />
                            {periodProgress.attendanceChange.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-slate-600 font-mono">0.0%</span>
                        )
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  </div>

                  {/* Study Hours Change */}
                  <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Study Time
                    </span>
                    <div className="flex items-center justify-center gap-0.5 font-sans text-base font-extrabold">
                      {periodProgress.studyHoursChange !== null && periodProgress.studyHoursChange !== undefined ? (
                        periodProgress.studyHoursChange > 0 ? (
                          <span className="text-emerald-700 flex items-center font-mono">
                            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                            +{periodProgress.studyHoursChange.toFixed(1)}h
                          </span>
                        ) : periodProgress.studyHoursChange < 0 ? (
                          <span className="text-rose-700 flex items-center font-mono">
                            <ArrowDownRight className="w-4 h-4 text-rose-600" />
                            {periodProgress.studyHoursChange.toFixed(1)}h
                          </span>
                        ) : (
                          <span className="text-slate-600 font-mono">0.0h</span>
                        )
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50/60 border border-slate-200/70 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Current: <strong>{periodProgress.currentScore ?? "—"}%</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>Previous: <strong>{periodProgress.previousScore ?? "—"}%</strong></span>
                  <span className="text-slate-300">•</span>
                  <span className="font-semibold text-blue-600">Consecutive Semester Baseline</span>
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </Card>

      {/* 2. PERSONAL BESTS (Section 36) */}
      <Card className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-150 flex flex-col justify-between">
        <div>
          <CardHeader className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <Award className="w-3.5 h-3.5" />
                </span>
                Personal Bests
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Documented milestone achievements backed strictly by real student records.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-4 pb-5">
            {!hasBests ? (
              <div className="py-8 px-4 flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Award className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900">No milestones recorded yet</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Record academic evaluations and study logs to earn verified personal bests.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {personalBests.map((best, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-colors text-xs space-y-1"
                  >
                    <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
                      <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{best.metric}</span>
                    </div>

                    <div className="text-lg font-extrabold text-slate-900 font-sans">
                      {best.value}
                    </div>

                    <p className="text-[11px] text-slate-500 truncate" title={best.context}>
                      {best.context}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
