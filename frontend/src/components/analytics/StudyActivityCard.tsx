"use client";

import React from "react";
import Link from "next/link";
import {
  Clock,
  Activity,
  Flame,
  PlusCircle,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StudyActivity } from "@/types/academic";
import { cn } from "@/lib/utils";

export interface StudyActivityCardProps {
  studyAnalytics: {
    total: number;
    avgDaily: number;
    avgWeekly: number;
    peakDay: string;
    weeklyChartData: Array<{ day: string; hours: number }>;
  };
  studyConsistency: {
    percentage: number;
    activeDays: number;
    totalDays?: number;
    totalDaysWindow?: number;
  };
  activities: StudyActivity[];
}

export function StudyActivityCard({
  studyAnalytics,
  studyConsistency,
  activities,
}: StudyActivityCardProps) {
  const hasData = activities.length > 0 && studyAnalytics.total > 0;

  return (
    <Card className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-150 flex flex-col justify-between">
      <div>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <Clock className="w-3.5 h-3.5" />
              </span>
              Study Activity
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Understand your study consistency across the selected period.
            </CardDescription>
          </div>

          <Link href="/study" className="self-start sm:self-auto text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
            Activity Workspace &rarr;
          </Link>
        </CardHeader>

        <CardContent className="pt-4 pb-4 space-y-4">
          {!hasData ? (
            /* Empty State (Section 25 & 73) */
            <div className="py-8 px-4 flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Clock className="w-5 h-5 stroke-[1.75]" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-900">No study activity recorded</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Record daily study sessions to measure revision intensity and learning consistency.
                </p>
              </div>
              <div className="pt-1">
                <Link href="/study">
                  <Button variant="outline" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
                    Log Study Session
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* 4 Metric Summary Tiles (Section 24) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Total
                  </span>
                  <span className="text-base font-extrabold text-slate-900 font-sans mt-0.5 block">
                    {studyAnalytics.total}h
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Daily Avg
                  </span>
                  <span className="text-base font-extrabold text-slate-900 font-sans mt-0.5 block">
                    {studyAnalytics.avgDaily}h
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Weekly Avg
                  </span>
                  <span className="text-base font-extrabold text-slate-900 font-sans mt-0.5 block">
                    {studyAnalytics.avgWeekly}h
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Active Day
                  </span>
                  <span className="text-base font-extrabold text-amber-600 font-sans mt-0.5 block">
                    {studyAnalytics.peakDay}
                  </span>
                </div>
              </div>

              {/* Study Consistency Gauge (Section 25) */}
              <div className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Activity className="w-3.5 h-3.5 text-amber-600" />
                    <span>Study Consistency</span>
                  </div>
                  <span className="font-mono text-sm font-extrabold text-amber-700">
                    {studyConsistency.percentage}%
                  </span>
                </div>

                <div className="h-2 w-full bg-amber-100/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, studyConsistency.percentage))}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-600 pt-0.5">
                  Calculated from <strong>{studyConsistency.activeDays}</strong> active revision day
                  {studyConsistency.activeDays !== 1 ? "s" : ""} across the current {studyConsistency.totalDays || studyConsistency.totalDaysWindow || 30}-day tracking period.
                </p>
              </div>

              {/* Weekly Day Distribution Chart (Section 26) */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Hours by Day of Week
                </span>
                <div className="h-28 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={studyAnalytics.weeklyChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={{ stroke: "#e2e8f0" }}
                        tick={{ fill: "#64748b", fontSize: 10 }}
                      />
                      <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#64748b", fontSize: 10 }}
                      />
                      <Tooltip
                        formatter={(val: any) => [`${val} hours`, "Study Time"]}
                        contentStyle={{
                          borderRadius: "10px",
                          border: "1px solid #e2e8f0",
                          fontSize: "11px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        }}
                      />
                      <Bar dataKey="hours" fill="#d97706" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
