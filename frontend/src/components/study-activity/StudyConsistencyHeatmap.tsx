"use client";

import React, { useMemo } from "react";
import { Flame, Award } from "lucide-react";
import { StudyActivity } from "@/types/academic";
import { calculateStudyConsistency } from "@/lib/academic/calculations";
import { cn } from "@/lib/utils";

export interface StudyConsistencyHeatmapProps {
  activities: StudyActivity[];
}

export function StudyConsistencyHeatmap({ activities }: StudyConsistencyHeatmapProps) {
  const hasData = activities.length > 0;

  // 1. Calculate deterministic consistency over 30 days
  const consistency = useMemo(() => {
    return calculateStudyConsistency(activities, 30);
  }, [activities]);

  // 2. Calculate deterministic streaks from real study dates
  const { currentStreak, bestStreak } = useMemo(() => {
    if (!activities || activities.length === 0) {
      return { currentStreak: 0, bestStreak: 0 };
    }

    // Get unique YYYY-MM-DD dates sorted descending
    const dateSet = new Set(activities.map((a) => a.study_date.split("T")[0]));
    const sortedDates = Array.from(dateSet).sort().reverse();

    if (sortedDates.length === 0) {
      return { currentStreak: 0, bestStreak: 0 };
    }

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Current streak
    let curr = 0;
    const latestDate = sortedDates[0];
    const isStreakAlive = latestDate === todayStr || latestDate === yesterdayStr;

    if (isStreakAlive) {
      const checkDate = new Date(latestDate);
      while (dateSet.has(checkDate.toISOString().split("T")[0])) {
        curr++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    // Best streak
    let best = 0;
    let tempStreak = 0;
    // Walk from oldest to newest
    const ascDates = [...sortedDates].reverse();
    for (let i = 0; i < ascDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(ascDates[i - 1]);
        const nextExpected = new Date(prev);
        nextExpected.setDate(nextExpected.getDate() + 1);
        const expectedStr = nextExpected.toISOString().split("T")[0];

        if (ascDates[i] === expectedStr) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > best) best = tempStreak;
    }

    return { currentStreak: curr, bestStreak: best };
  }, [activities]);

  // 3. Generate 35-day grid (5 weeks: Mon - Sun)
  const heatmapWeeks = useMemo(() => {
    const days: Array<{
      dateStr: string;
      displayDate: string;
      dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
      hours: number;
      intensity: 0 | 1 | 2 | 3 | 4;
    }> = [];

    const now = new Date();
    const actMap = new Map<string, number>();
    activities.forEach((a) => {
      const d = a.study_date.split("T")[0];
      actMap.set(d, (actMap.get(d) || 0) + (Number(a.study_hours) || 0));
    });

    // We want the last 35 days up to today
    for (let i = 34; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split("T")[0];
      const hours = Math.round((actMap.get(dStr) || 0) * 10) / 10;

      let intensity: 0 | 1 | 2 | 3 | 4 = 0;
      if (hours > 0 && hours < 1.5) intensity = 1;
      else if (hours >= 1.5 && hours < 3) intensity = 2;
      else if (hours >= 3 && hours < 5) intensity = 3;
      else if (hours >= 5) intensity = 4;

      days.push({
        dateStr: dStr,
        displayDate: d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        dayOfWeek: d.getDay(),
        hours,
        intensity,
      });
    }

    // Split into 5 weeks of 7 days
    const weeks: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  }, [activities]);

  const intensityClasses = {
    0: "bg-slate-100 border-slate-200/60 hover:border-slate-300",
    1: "bg-blue-100 border-blue-200 hover:border-blue-300",
    2: "bg-blue-300 border-blue-400 hover:border-blue-500",
    3: "bg-blue-500 border-blue-600 hover:border-blue-700",
    4: "bg-blue-700 border-blue-800 hover:border-blue-900",
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-5 sm:p-6 space-y-5">
      {/* Title & Consistency KPI */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <span>STUDY CONSISTENCY</span>
            <span className="text-[10px] font-semibold text-[#64748B] px-1.5 py-0.5 rounded bg-slate-100 uppercase tracking-wider">
              30-Day
            </span>
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Cadence of days with recorded learning activity.
          </p>
        </div>

        {hasData ? (
          <div className="text-right">
            <div className="text-2xl font-bold text-[#0F172A] tracking-tight leading-none">
              {consistency.percentage}%
            </div>
            <div className="text-[11px] text-[#64748B] mt-1 font-medium">
              {consistency.activeDays} of 30 active days
            </div>
          </div>
        ) : (
          <div className="text-right">
            <div className="text-sm font-semibold text-[#64748B]">Not enough activity</div>
            <div className="text-[11px] text-[#94A3B8]">0 days logged</div>
          </div>
        )}
      </div>

      {/* Heatmap Grid */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-[10.5px] font-semibold text-[#64748B] px-0.5">
          <span>Past 5 Weeks</span>
          <div className="flex items-center gap-1.5 text-[10px] text-[#64748B]">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-200/60 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-100 border border-blue-200 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-300 border border-blue-400 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 border border-blue-600 inline-block" />
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-700 border border-blue-800 inline-block" />
            <span>More</span>
          </div>
        </div>

        {/* 5 columns of 7 days */}
        <div className="grid grid-cols-5 gap-2 pt-1">
          {heatmapWeeks.map((week, wIdx) => (
            <div key={wIdx} className="space-y-1.5">
              {week.map((day) => (
                <div
                  key={day.dateStr}
                  title={`${day.displayDate}: ${day.hours > 0 ? `${day.hours}h study` : "No session"}`}
                  className={cn(
                    "h-6 rounded-md border transition-all duration-150 cursor-pointer flex items-center justify-center text-[10px] font-mono group relative",
                    intensityClasses[day.intensity],
                    day.intensity >= 3 ? "text-white font-bold" : "text-slate-700"
                  )}
                >
                  {day.hours > 0 && <span className="text-[9px] font-medium leading-none">{day.hours}h</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Streak Context Cards */}
      <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/70 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F59E0B] border border-amber-100/80 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
              Current Streak
            </div>
            <div className="text-base font-bold text-[#0F172A] leading-tight">
              {hasData && currentStreak > 0 ? `${currentStreak} day${currentStreak !== 1 ? "s" : ""}` : "—"}
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200/70 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] border border-blue-100/80 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
              Best Streak
            </div>
            <div className="text-base font-bold text-[#0F172A] leading-tight">
              {hasData && bestStreak > 0 ? `${bestStreak} day${bestStreak !== 1 ? "s" : ""}` : "—"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
