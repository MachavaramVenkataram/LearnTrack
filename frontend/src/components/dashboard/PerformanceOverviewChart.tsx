"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Plus, BarChart2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AcademicRecord, Subject } from "@/types/academic";
import { calculateCGPA } from "@/lib/academic/calculations";

export interface PerformanceOverviewChartProps {
  records: AcademicRecord[];
  subjects: Subject[];
}

export function PerformanceOverviewChart({
  records,
  subjects,
}: PerformanceOverviewChartProps) {
  const [timeframe, setTimeframe] = useState<"semester" | "6months" | "1year" | "all">("semester");

  // Group and aggregate records according to timeframe
  const chartData = useMemo(() => {
    if (!records || records.length === 0) return [];

    // Group by semester
    const semMap = new Map<number, AcademicRecord[]>();
    records.forEach((r) => {
      const list = semMap.get(r.semester) || [];
      list.push(r);
      semMap.set(r.semester, list);
    });

    const semesters = Array.from(semMap.keys()).sort((a, b) => a - b);

    // Depending on filter, limit slice
    let filteredSemesters = semesters;
    if (timeframe === "semester" && semesters.length > 4) {
      filteredSemesters = semesters.slice(-4);
    } else if (timeframe === "6months" && semesters.length > 2) {
      filteredSemesters = semesters.slice(-2);
    } else if (timeframe === "1year" && semesters.length > 3) {
      filteredSemesters = semesters.slice(-3);
    }

    return filteredSemesters.map((sem) => {
      const semRecords = semMap.get(sem) || [];
      const avgScore =
        Math.round(
          (semRecords.reduce((acc, r) => acc + (Number(r.total_marks) || 0), 0) /
            semRecords.length) *
            10
        ) / 10;

      const avgAttendance =
        Math.round(
          (semRecords.reduce((acc, r) => acc + (Number(r.attendance_percentage) || 0), 0) /
            semRecords.length) *
            10
        ) / 10;

      const gpa = calculateCGPA(semRecords, subjects) || 0;

      return {
        period: `Semester ${sem}`,
        score: avgScore,
        attendance: avgAttendance,
        gpa,
        coursesCount: semRecords.length,
      };
    });
  }, [records, subjects, timeframe]);

  const hasEnoughData = chartData.length > 0;

  return (
    <Card className="border-slate-200/90 shadow-card overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Performance Overview
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Track how your academic performance changes over time.
          </CardDescription>
        </div>

        {/* Filter controls */}
        {hasEnoughData && (
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setTimeframe("semester")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                timeframe === "semester" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"
              }`}
            >
              Semester
            </button>
            <button
              onClick={() => setTimeframe("6months")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                timeframe === "6months" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setTimeframe("1year")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                timeframe === "1year" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"
              }`}
            >
              1 Year
            </button>
            <button
              onClick={() => setTimeframe("all")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                timeframe === "all" ? "bg-white text-slate-900 shadow-2xs font-bold" : "hover:text-slate-900"
              }`}
            >
              All Time
            </button>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4">
        {!hasEnoughData ? (
          <div className="py-8 px-4 text-center flex flex-col items-center justify-center space-y-2.5 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-slate-900 font-sans">
                No performance records yet
              </h4>
              <p className="text-[11.5px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                Log course evaluations to start tracking semester scores and historical trajectories.
              </p>
            </div>
            <Link href="/performance" className="pt-1">
              <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Add Academic Record
              </Button>
            </Link>
          </div>
        ) : (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    `${val}%`,
                    name === "score" ? "Average Score" : "Attendance",
                  ]}
                  labelStyle={{ fontWeight: 600, color: "#0f172a" }}
                  contentStyle={{
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
                    fontSize: "12px",
                    padding: "10px 14px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreGradient)"
                  dot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#ffffff" }}
                  activeDot={{ r: 6, fill: "#1d4ed8" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
