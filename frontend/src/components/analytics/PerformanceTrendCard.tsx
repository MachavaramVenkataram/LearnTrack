"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  BarChart3,
  PlusCircle,
  Calendar,
  Layers,
} from "lucide-react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface TrendDataPoint {
  period: string;
  semester: number;
  score: number;
  attendance: number;
  count: number;
}

export interface PerformanceTrendCardProps {
  trendData: TrendDataPoint[];
  trendTimeframe: "1_sem" | "2_sem" | "all";
  onTimeframeChange: (tf: "1_sem" | "2_sem" | "all") => void;
}

function CustomTrendTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const data: TrendDataPoint = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="p-3 bg-white rounded-xl shadow-elevated border border-slate-200 text-xs space-y-2 min-w-[170px]">
      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 font-bold text-slate-900">
        <span>{data.period}</span>
        <span className="text-[10.5px] font-mono text-slate-400 font-normal">
          {data.count} evaluation{data.count !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
            Average Score:
          </span>
          <span className="font-bold text-slate-900 font-mono">
            {data.score.toFixed(1)}%
          </span>
        </div>

        {data.attendance > 0 && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              Attendance:
            </span>
            <span className="font-bold text-slate-900 font-mono">
              {data.attendance.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function PerformanceTrendCard({
  trendData,
  trendTimeframe,
  onTimeframeChange,
}: PerformanceTrendCardProps) {
  const hasData = trendData.length > 0;

  return (
    <Card className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-150">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
            Performance Trend
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Average evaluation score across comparable academic periods.
          </CardDescription>
        </div>

        {/* Premium Segmented Control (Section 12) */}
        <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl text-xs font-medium border border-slate-200/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onTimeframeChange("1_sem")}
            className={cn(
              "px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer select-none",
              trendTimeframe === "1_sem"
                ? "bg-white text-blue-600 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Latest Sem
          </button>
          <button
            type="button"
            onClick={() => onTimeframeChange("2_sem")}
            className={cn(
              "px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer select-none",
              trendTimeframe === "2_sem"
                ? "bg-white text-blue-600 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            2 Periods
          </button>
          <button
            type="button"
            onClick={() => onTimeframeChange("all")}
            className={cn(
              "px-3 py-1 rounded-lg transition-all duration-150 cursor-pointer select-none",
              trendTimeframe === "all"
                ? "bg-white text-blue-600 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            All Available Data
          </button>
        </div>
      </CardHeader>

      <CardContent className="pt-5 pb-5">
        {!hasData ? (
          /* Empty State (Section 16: Build your performance history) */
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <BarChart3 className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Build your performance history</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add academic records across semesters to see how your performance changes over time.
              </p>
            </div>
            <div className="pt-1">
              <Link href="/performance">
                <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
                  Add Academic Record
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <Tooltip content={<CustomTrendTooltip />} />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
                <Area
                  type="monotone"
                  dataKey="score"
                  name="Average Score"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#scoreAreaGradient)"
                  dot={{ r: 4, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#2563eb", stroke: "#ffffff", strokeWidth: 2 }}
                  isAnimationActive={true}
                  animationDuration={650}
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  name="Attendance Rate"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: "#10b981", stroke: "#ffffff", strokeWidth: 1.5 }}
                  isAnimationActive={true}
                  animationDuration={650}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
