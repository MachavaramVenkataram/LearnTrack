"use client";

import React from "react";
import Link from "next/link";
import { Info, Clock, PlusCircle, Activity } from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface AttendanceScorePoint {
  subject: string;
  attendance: number;
  score: number;
}

export interface StudyScorePoint {
  subject: string;
  hours: number;
  score: number;
}

export interface ExploratoryScatterCardsProps {
  attendanceVsScoreData: AttendanceScorePoint[];
  studyHoursVsScoreData: StudyScorePoint[];
}

export function ExploratoryScatterCards({
  attendanceVsScoreData,
  studyHoursVsScoreData,
}: ExploratoryScatterCardsProps) {
  const hasAttendanceData = attendanceVsScoreData.length > 0;
  const hasStudyData = studyHoursVsScoreData.length >= 2;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. PERFORMANCE VS ATTENDANCE SCATTER (Section 30) */}
      <Card className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-150 flex flex-col justify-between">
        <div>
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Activity className="w-3.5 h-3.5" />
                  </span>
                  Performance vs. Attendance
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Exploratory observation between recorded attendance and evaluation scores.
                </CardDescription>
              </div>

              <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Exploratory
              </span>
            </div>

            {/* Non-causal disclaimer (Section 30) */}
            <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-1.5 leading-snug">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Observational relationship only; this does not establish causation.
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-4 pb-4">
            {!hasAttendanceData ? (
              <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                No paired attendance and score records available.
              </div>
            ) : (
              <div className="h-48 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      dataKey="attendance"
                      name="Attendance"
                      unit="%"
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tick={{ fill: "#64748b", fontSize: 10 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="score"
                      name="Score"
                      unit="%"
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tick={{ fill: "#64748b", fontSize: 10 }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={({ payload }) => {
                        if (!payload || payload.length === 0) return null;
                        const data: AttendanceScorePoint = payload[0].payload;
                        return (
                          <div className="p-2.5 bg-white rounded-xl shadow-elevated border border-slate-200 text-xs space-y-1">
                            <p className="font-bold text-slate-900">{data.subject}</p>
                            <div className="flex items-center justify-between gap-3 text-slate-600 font-mono">
                              <span>Attendance:</span>
                              <span className="font-bold">{data.attendance}%</span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-blue-600 font-mono">
                              <span>Evaluation Score:</span>
                              <span className="font-bold">{data.score}%</span>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Scatter
                      data={attendanceVsScoreData}
                      fill="#2563eb"
                      isAnimationActive={true}
                      animationDuration={500}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </div>
      </Card>

      {/* 2. STUDY HOURS VS PERFORMANCE SCATTER (Section 31) */}
      <Card className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-150 flex flex-col justify-between">
        <div>
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </span>
                  Study Hours vs. Performance
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Exploratory comparison of dedicated study time against course evaluation.
                </CardDescription>
              </div>

              <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                Exploratory
              </span>
            </div>

            <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 flex items-start gap-1.5 leading-snug">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Displays paired study logs with corresponding course scores. Does not prove causation.
              </span>
            </div>
          </CardHeader>

          <CardContent className="pt-4 pb-4">
            {!hasStudyData ? (
              /* Informative Empty State (Section 31) */
              <div className="h-48 flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-2 px-4">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-800">
                    More study activity data is needed to explore this relationship
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Log focused study sessions tagged with subjects to generate paired observations.
                  </p>
                </div>
                <Link href="/study" className="pt-0.5">
                  <Button variant="outline" size="sm" leftIcon={<PlusCircle className="w-3 h-3" />}>
                    Log Study Session
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="h-48 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 20, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      type="number"
                      dataKey="hours"
                      name="Study Hours"
                      unit="h"
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tick={{ fill: "#64748b", fontSize: 10 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="score"
                      name="Score"
                      unit="%"
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tick={{ fill: "#64748b", fontSize: 10 }}
                    />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={({ payload }) => {
                        if (!payload || payload.length === 0) return null;
                        const data: StudyScorePoint = payload[0].payload;
                        return (
                          <div className="p-2.5 bg-white rounded-xl shadow-elevated border border-slate-200 text-xs space-y-1">
                            <p className="font-bold text-slate-900">{data.subject}</p>
                            <p className="text-slate-600 font-mono">Study Time: {data.hours} hours</p>
                            <p className="text-emerald-600 font-bold font-mono">Score: {data.score}%</p>
                          </div>
                        );
                      }}
                    />
                    <Scatter
                      data={studyHoursVsScoreData}
                      fill="#059669"
                      isAnimationActive={true}
                      animationDuration={500}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
