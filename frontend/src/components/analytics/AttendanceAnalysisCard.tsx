"use client";

import React from "react";
import Link from "next/link";
import {
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Subject, AcademicRecord } from "@/types/academic";
import { cn } from "@/lib/utils";

export interface AttendanceAnalysisCardProps {
  averageAttendance: number | null;
  attendanceTarget: number;
  onTargetChange: (target: number) => void;
  records: AcademicRecord[];
  subjects: Subject[];
}

export function AttendanceAnalysisCard({
  averageAttendance,
  attendanceTarget,
  onTargetChange,
  records,
  subjects,
}: AttendanceAnalysisCardProps) {
  const hasData = averageAttendance !== null && records.length > 0;

  // Breakdown of subjects with attendance status
  const breakdown = records.map((r) => {
    const sub = subjects.find((s) => s.id === r.subject_id) || r.subject;
    const att = Number(r.attendance_percentage) || 0;

    let status: "above" | "near" | "below" = "above";
    if (att < attendanceTarget - 5) {
      status = "below";
    } else if (att < attendanceTarget) {
      status = "near";
    } else {
      status = "above";
    }

    return {
      id: r.id,
      subjectId: r.subject_id,
      name: sub?.subject_name || "Course",
      code: sub?.subject_code || "",
      attendance: att,
      status,
    };
  });

  const belowCount = breakdown.filter((b) => b.status === "below").length;
  const nearCount = breakdown.filter((b) => b.status === "near").length;

  return (
    <Card className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-150 flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <CalendarCheck className="w-3.5 h-3.5" />
              </span>
              Attendance Analysis
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Track attendance against your configured institutional threshold.
            </CardDescription>
          </div>

          {/* Configured Target Selector (Section 21) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 self-start sm:self-auto">
            <span className="text-[11px] font-medium text-slate-400">Target:</span>
            <select
              className="h-8 rounded-lg border border-slate-200 bg-slate-50/80 px-2 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-hidden focus:bg-white focus:border-blue-600"
              value={attendanceTarget}
              onChange={(e) => onTargetChange(Number(e.target.value))}
              aria-label="Set attendance threshold target"
            >
              <option value={75}>75% (Institutional Minimum)</option>
              <option value={80}>80% (Recommended)</option>
              <option value={85}>85% (High Standard)</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="pt-4 pb-4 space-y-4">
          {!hasData ? (
            /* Empty State (Section 73) */
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CalendarCheck className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-900">No attendance data recorded</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Record attendance to unlock attendance analysis and eligibility tracking.
                </p>
              </div>
              <div className="pt-1">
                <Link href="/performance">
                  <Button variant="outline" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
                    Record Attendance
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Overall Attendance Bullet / Metric Bar (Section 22) */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Overall Attendance Rate</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-slate-900">
                      {averageAttendance}%
                    </span>
                    <span
                      className={cn(
                        "text-[10.5px] font-bold px-2 py-0.5 rounded-md border",
                        averageAttendance >= attendanceTarget
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : averageAttendance >= attendanceTarget - 5
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      )}
                    >
                      {averageAttendance >= attendanceTarget
                        ? "Above target"
                        : averageAttendance >= attendanceTarget - 5
                        ? "Near target"
                        : "Below target"}
                    </span>
                  </div>
                </div>

                {/* Horizontal Progress Bullet Chart with Target Marker */}
                <div className="relative pt-1">
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        averageAttendance >= attendanceTarget
                          ? "bg-emerald-500"
                          : averageAttendance >= attendanceTarget - 5
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      )}
                      style={{ width: `${Math.min(100, Math.max(0, averageAttendance))}%` }}
                    />
                  </div>

                  {/* Target line indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-700 pointer-events-none"
                    style={{ left: `${attendanceTarget}%` }}
                    title={`Target: ${attendanceTarget}%`}
                  >
                    <span className="absolute -top-3.5 -translate-x-1/2 text-[9.5px] font-mono font-bold text-slate-500">
                      {attendanceTarget}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Alert if any below target */}
              {belowCount > 0 ? (
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    <strong>{belowCount} course{belowCount !== 1 ? "s" : ""}</strong> currently below the{" "}
                    <strong>{attendanceTarget}%</strong> requirement. Immediate focus needed to prevent examination ineligibility.
                  </p>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>All recorded subjects meet or exceed the {attendanceTarget}% reference target.</span>
                </div>
              )}

              {/* Course Attendance Breakdown (Section 22) */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Course Attendance Breakdown
                </span>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {breakdown.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-800 truncate">
                          {item.name}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-mono font-bold text-slate-900">
                            {item.attendance}%
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-semibold px-1.5 py-0.2 rounded border",
                              item.status === "above"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : item.status === "near"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            )}
                          >
                            {item.status === "above"
                              ? "Above target"
                              : item.status === "near"
                              ? "Near target"
                              : "Below target"}
                          </span>
                        </div>
                      </div>

                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            item.status === "above"
                              ? "bg-emerald-500"
                              : item.status === "near"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          )}
                          style={{ width: `${Math.min(100, Math.max(0, item.attendance))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
