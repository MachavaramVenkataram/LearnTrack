"use client";

import React from "react";
import { Clock, TrendingUp, CheckCircle2, Flame } from "lucide-react";
import { StudyActivity } from "@/types/academic";
import { cn } from "@/lib/utils";

export interface StudyMetricsSummaryProps {
  activities: StudyActivity[];
  totalHours: number;
  averageDailyHours: number;
  totalAssignmentsCompleted: number;
}

export function StudyMetricsSummary({
  activities,
  totalHours,
  averageDailyHours,
  totalAssignmentsCompleted,
}: StudyMetricsSummaryProps) {
  const hasData = activities.length > 0;

  const kpis = [
    {
      id: "total-hours",
      label: "TOTAL STUDY HOURS",
      value: hasData ? `${totalHours}h` : "—",
      context: hasData ? "Cumulative recorded" : "No activity yet",
      icon: Clock,
      iconBg: "bg-blue-50 text-[#2563EB] border border-blue-100/70",
      accentBorder: "hover:border-blue-300/80",
    },
    {
      id: "daily-avg",
      label: "DAILY STUDY AVERAGE",
      value: hasData ? `${averageDailyHours}h` : "—",
      context: hasData ? "Per active study day" : "No activity yet",
      icon: TrendingUp,
      iconBg: "bg-indigo-50 text-[#4F46E5] border border-indigo-100/70",
      accentBorder: "hover:border-indigo-300/80",
    },
    {
      id: "assignments",
      label: "ASSIGNMENTS COMPLETED",
      value: hasData ? totalAssignmentsCompleted : "—",
      context: hasData ? `${totalAssignmentsCompleted} recorded tasks` : "No activity yet",
      icon: CheckCircle2,
      iconBg: "bg-emerald-50 text-[#10B981] border border-emerald-100/70",
      accentBorder: "hover:border-emerald-300/80",
    },
    {
      id: "sessions",
      label: "RECORDED SESSIONS",
      value: hasData ? activities.length : "—",
      context: hasData ? `${activities.length} logged study blocks` : "No activity yet",
      icon: Flame,
      iconBg: "bg-amber-50 text-[#F59E0B] border border-amber-100/70",
      accentBorder: "hover:border-amber-300/80",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.id}
            className={cn(
              "group relative p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs transition-all duration-180 hover:-translate-y-0.5 hover:shadow-xs",
              kpi.accentBorder
            )}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748B]">
                  {kpi.label}
                </span>
                <div className="text-2xl sm:text-[28px] font-bold text-[#0F172A] tracking-tight leading-none pt-1">
                  {kpi.value}
                </div>
              </div>

              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-180 group-hover:scale-105",
                  kpi.iconBg
                )}
              >
                <Icon className="w-5 h-5 stroke-[2]" />
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-[#64748B]">
              <span className="truncate">{kpi.context}</span>
              {hasData && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
