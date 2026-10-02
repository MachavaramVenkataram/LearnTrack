"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { CalendarCheck, AlertTriangle, CheckCircle2, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SubjectPerformanceItem } from "@/lib/academic/calculations";

export interface AttendanceOverviewCardProps {
  subjects: SubjectPerformanceItem[];
  averageAttendance: number | null;
  targetThreshold?: number;
}

export function AttendanceOverviewCard({
  subjects,
  averageAttendance,
  targetThreshold = 75,
}: AttendanceOverviewCardProps) {
  const recordedSubjects = useMemo(() => {
    return subjects.filter((s) => s.attendance > 0);
  }, [subjects]);

  const belowTargetSubjects = useMemo(() => {
    return recordedSubjects.filter((s) => s.attendance < targetThreshold);
  }, [recordedSubjects, targetThreshold]);

  const hasData = recordedSubjects.length > 0;

  return (
    <Card className="border-slate-200/90 shadow-card flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            Attendance Overview
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Institutional minimum target: <strong>{targetThreshold}% Threshold</strong>
          </CardDescription>
        </div>

        {hasData && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {belowTargetSubjects.length > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {belowTargetSubjects.length} Below Target
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                All Courses Safe
              </span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {!hasData ? (
          <div className="py-8 px-4 text-center flex flex-col items-center justify-center space-y-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-2xs">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-slate-900 font-sans">No attendance records yet</h4>
              <p className="text-[11.5px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                Coursework attendance percentages will be tracked here against your 75% institutional baseline.
              </p>
            </div>
            <Link href="/performance" className="pt-1">
              <Button variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-white">
                Log Academic Record
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
            {recordedSubjects.slice(0, 5).map((sub) => {
              const isLow = sub.attendance < targetThreshold;
              return (
                <div key={sub.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                      {sub.subjectName}
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        isLow ? "text-rose-600" : "text-slate-900"
                      }`}
                    >
                      {sub.attendance}%
                    </span>
                  </div>

                  {/* Horizontal Bar with Target Marker */}
                  <div className="relative w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        sub.attendance >= 85
                          ? "bg-emerald-500"
                          : sub.attendance >= targetThreshold
                          ? "bg-blue-600"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, sub.attendance))}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Target explanation footnote */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Overall Average: <strong className="text-slate-700">{averageAttendance ?? "—"}%</strong></span>
              <span>Policy: ≥75% for exam eligibility</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
