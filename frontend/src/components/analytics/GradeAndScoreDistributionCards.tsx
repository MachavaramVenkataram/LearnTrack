"use client";

import React from "react";
import { Award, BarChart2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface GradeDistributionItem {
  grade: string;
  count: number;
  color: string;
}

export interface ScoreDistributionItem {
  range: string;
  count: number;
}

export interface GradeAndScoreDistributionCardsProps {
  gradeDistribution: GradeDistributionItem[];
  scoreDistribution: ScoreDistributionItem[];
  totalRecordsCount: number;
}

export function GradeAndScoreDistributionCards({
  gradeDistribution,
  scoreDistribution,
  totalRecordsCount,
}: GradeAndScoreDistributionCardsProps) {
  const hasRecords = totalRecordsCount > 0;

  // Filter only grades with counts > 0 for active breakdown, or display standard spectrum
  const populatedGrades = gradeDistribution.filter((g) => g.count > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. GRADE DISTRIBUTION CARD (Section 27) */}
      <Card className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-150 flex flex-col justify-between">
        <div>
          <CardHeader className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Award className="w-3.5 h-3.5" />
                </span>
                Grade Distribution
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Letter grade frequencies across evaluated courses.
              </CardDescription>
            </div>

            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Total: {totalRecordsCount}
            </span>
          </CardHeader>

          <CardContent className="pt-4 pb-4">
            {!hasRecords ? (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400">
                No course evaluation records available.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  {gradeDistribution.map((item) => {
                    const pct = totalRecordsCount > 0 ? (item.count / totalRecordsCount) * 100 : 0;
                    return (
                      <div key={item.grade} className="flex items-center gap-3 text-xs">
                        <span className="font-bold text-slate-700 w-6 shrink-0 text-center font-mono">
                          {item.grade}
                        </span>

                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: item.color,
                            }}
                          />
                        </div>

                        <div className="w-14 text-right shrink-0 flex items-center justify-end gap-1 font-mono text-[11px]">
                          <span className={cn("font-bold", item.count > 0 ? "text-slate-900" : "text-slate-400")}>
                            {item.count}
                          </span>
                          <span className="text-slate-400">({Math.round(pct)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </Card>

      {/* 2. SCORE DISTRIBUTION HISTOGRAM (Section 28) */}
      <Card className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-150 flex flex-col justify-between">
        <div>
          <CardHeader className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <BarChart2 className="w-3.5 h-3.5" />
                </span>
                Score Distribution
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Frequency histogram across standard evaluation brackets.
              </CardDescription>
            </div>

            <span className="text-[11px] font-mono text-slate-400">0–100 Scale</span>
          </CardHeader>

          <CardContent className="pt-4 pb-4">
            {!hasRecords ? (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400">
                No evaluation scores available to bin.
              </div>
            ) : (
              <div className="h-44 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="range"
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
                      formatter={(val: any) => [`${val} record(s)`, "Frequency"]}
                      contentStyle={{
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        fontSize: "11px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      }}
                    />
                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]}>
                      {scoreDistribution.map((entry: ScoreDistributionItem, index: number) => (
                        <Cell
                          key={`score-cell-${index}`}
                          fill={entry.count > 0 ? "#2563eb" : "#cbd5e1"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
