"use client";

import React, { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar, Clock, BarChart2 } from "lucide-react";
import { StudyActivity } from "@/types/academic";
import { cn } from "@/lib/utils";

export interface StudyActivityChartProps {
  activities: StudyActivity[];
}

type PeriodRange = "7d" | "30d" | "90d";

export function StudyActivityChart({ activities }: StudyActivityChartProps) {
  const [period, setPeriod] = useState<PeriodRange>("30d");

  // Filter activities and generate continuous daily timeline for selected range
  const { chartData, periodTotalHours, periodActiveDays, periodAvgDaily } = useMemo(() => {
    const daysCount = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    const now = new Date();
    const result: Array<{
      date: string;
      displayDate: string;
      shortDate: string;
      hours: number;
      sessions: number;
      notes: string[];
    }> = [];

    // Map existing activities by date string (YYYY-MM-DD)
    const actMap = new Map<string, StudyActivity[]>();
    activities.forEach((act) => {
      const dStr = act.study_date.split("T")[0];
      const list = actMap.get(dStr) || [];
      list.push(act);
      actMap.set(dStr, list);
    });

    let totalHours = 0;
    let activeDays = 0;

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split("T")[0];

      const acts = actMap.get(dStr) || [];
      const dayHours = acts.reduce((acc, a) => acc + (Number(a.study_hours) || 0), 0);
      const roundedHours = Math.round(dayHours * 10) / 10;

      if (roundedHours > 0) {
        totalHours += roundedHours;
        activeDays++;
      }

      result.push({
        date: dStr,
        displayDate: d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        shortDate:
          period === "7d"
            ? d.toLocaleDateString("en-US", { weekday: "short" })
            : d.toLocaleDateString("en-US", { month: "numeric", day: "numeric" }),
        hours: roundedHours,
        sessions: acts.length,
        notes: acts.map((a) => a.notes).filter(Boolean) as string[],
      });
    }

    const avgDaily = activeDays > 0 ? Math.round((totalHours / activeDays) * 10) / 10 : 0;

    return {
      chartData: result,
      periodTotalHours: Math.round(totalHours * 10) / 10,
      periodActiveDays: activeDays,
      periodAvgDaily: avgDaily,
    };
  }, [activities, period]);

  const hasData = activities.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-5 sm:p-6 space-y-5">
      {/* Header with Title and Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 pb-2">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[#0F172A] tracking-tight">
            STUDY ACTIVITY OVERVIEW
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Your study time and consistency over the selected period.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Summary Pills in Header */}
          {hasData && (
            <div className="hidden lg:flex items-center gap-2 pr-2 text-xs text-[#64748B]">
              <span className="inline-flex items-center gap-1 font-semibold text-[#0F172A]">
                <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                {periodTotalHours}h
              </span>
              <span className="text-slate-300">•</span>
              <span>{periodActiveDays} active days</span>
            </div>
          )}

          {/* Segmented Control */}
          <div
            role="tablist"
            aria-label="Study activity period range"
            className="flex items-center p-1 bg-[#F1F5F9] rounded-xl border border-slate-200/80"
          >
            {(["7d", "30d", "90d"] as PeriodRange[]).map((r) => {
              const label = r === "7d" ? "7D" : r === "30d" ? "30D" : "90D";
              const isActive = period === r;
              return (
                <button
                  key={r}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setPeriod(r)}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer",
                    isActive
                      ? "bg-white text-[#2563EB] shadow-2xs font-bold"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      {!hasData ? (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-[#F8FAFC] rounded-xl border border-dashed border-[#E2E8F0] space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
            <BarChart2 className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-[#0F172A]">No activity in this period</p>
          <p className="text-[11px] text-[#64748B] max-w-xs leading-relaxed">
            Logged study hours will visualize your daily study cadence and study habits here.
          </p>
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="studyHoursGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="shortDate"
                tickLine={false}
                axisLine={{ stroke: "#E2E8F0" }}
                tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }}
                interval={period === "90d" ? 12 : period === "30d" ? 4 : 0}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: "#E2E8F0" }}
                tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }}
                unit="h"
                allowDecimals
              />
              <Tooltip content={<CustomStudyTooltip />} />
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#2563EB"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#studyHoursGradient)"
                activeDot={{
                  r: 5,
                  fill: "#2563EB",
                  stroke: "#FFFFFF",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function CustomStudyTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  const hours = data.hours || 0;
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  const durationStr =
    hours === 0
      ? "0m"
      : wholeHours > 0 && minutes > 0
      ? `${wholeHours}h ${minutes}m`
      : wholeHours > 0
      ? `${wholeHours}h`
      : `${minutes}m`;

  return (
    <div className="bg-white p-3 rounded-xl border border-[#E2E8F0] shadow-md text-xs space-y-1.5 min-w-[170px] select-none">
      <div className="flex items-center justify-between pb-1 border-b border-slate-100 text-[#64748B] text-[11px] font-medium">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-[#2563EB]" />
          {data.displayDate}
        </span>
      </div>

      <div className="flex items-baseline justify-between pt-0.5">
        <span className="text-[#64748B]">Study Time:</span>
        <span className="font-bold text-[#0F172A] text-sm">{durationStr}</span>
      </div>

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[#64748B]">Sessions:</span>
        <span className="font-semibold text-slate-800">{data.sessions}</span>
      </div>

      {data.notes && data.notes.length > 0 && (
        <div className="pt-1 border-t border-slate-100">
          <p className="text-[10px] text-[#64748B] line-clamp-2 italic leading-relaxed">
            {data.notes[0]}
          </p>
        </div>
      )}
    </div>
  );
}
