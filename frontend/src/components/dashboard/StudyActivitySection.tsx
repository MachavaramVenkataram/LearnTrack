"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Clock, CheckCircle2, Flame, Plus, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StudyActivity } from "@/types/academic";

export interface StudyActivitySectionProps {
  activities: StudyActivity[];
  totalHours: number;
  averageDailyHours: number;
}

export function StudyActivitySection({
  activities,
  totalHours,
  averageDailyHours,
}: StudyActivitySectionProps) {
  // Aggregate last 7 days of activity
  const weeklyGrid = useMemo(() => {
    const days: { dateStr: string; dayLabel: string; hours: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "narrow" });

      const dayLogs = activities.filter((a) => a.study_date === dateStr);
      const hours = dayLogs.reduce((acc, a) => acc + (Number(a.study_hours) || 0), 0);

      days.push({ dateStr, dayLabel, hours });
    }
    return days;
  }, [activities]);

  const totalAssignments = useMemo(() => {
    return activities.reduce((acc, a) => acc + (Number(a.assignments_completed) || 0), 0);
  }, [activities]);

  const hasData = activities.length > 0;

  return (
    <Card className="border-slate-200/90 shadow-card flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            Study Activity
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Focus sessions and weekly study consistency
          </CardDescription>
        </div>

        {hasData && (
          <Link href="/study">
            <span className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View Activity Log →
            </span>
          </Link>
        )}
      </CardHeader>

      <CardContent className="pt-4 space-y-5">
        {!hasData ? (
          <div className="py-8 px-4 text-center flex flex-col items-center justify-center space-y-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-slate-900 font-sans">No study sessions logged yet</h4>
              <p className="text-[11.5px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                Track daily focus hours and assignments to unlock cadence analysis and consistency trends.
              </p>
            </div>
            <Link href="/study" className="pt-1">
              <Button variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-white">
                Record Study Session
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 3 Metric Pills */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-500 font-medium block">Total Hours</span>
                <span className="text-base font-extrabold text-slate-900 font-mono mt-0.5 block">
                  {totalHours}h
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-500 font-medium block">Daily Avg</span>
                <span className="text-base font-extrabold text-slate-900 font-mono mt-0.5 block">
                  {averageDailyHours}h
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-500 font-medium block">Assignments</span>
                <span className="text-base font-extrabold text-slate-900 font-mono mt-0.5 block">
                  {totalAssignments}
                </span>
              </div>
            </div>

            {/* GitHub-style 7-day Weekly Grid */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 block">
                Last 7 Days Activity
              </span>
              <div className="grid grid-cols-7 gap-2">
                {weeklyGrid.map((day) => {
                  const getIntensity = (hrs: number) => {
                    if (hrs === 0) return "bg-slate-100 text-slate-400";
                    if (hrs < 2) return "bg-indigo-100 text-indigo-700 font-bold";
                    if (hrs < 4) return "bg-indigo-300 text-indigo-900 font-bold";
                    return "bg-indigo-600 text-white font-bold";
                  };

                  return (
                    <div key={day.dateStr} className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-full aspect-square rounded-lg flex items-center justify-center text-[10px] transition-transform hover:scale-105 ${getIntensity(
                          day.hours
                        )}`}
                        title={`${day.dateStr}: ${day.hours}h`}
                      >
                        {day.hours > 0 ? `${day.hours}h` : "—"}
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400">
                        {day.dayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
