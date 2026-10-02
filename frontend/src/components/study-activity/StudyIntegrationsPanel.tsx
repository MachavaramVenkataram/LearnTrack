"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
} from "lucide-react";
import { StudyActivity, StudyPlan, AcademicGoal } from "@/types/academic";

export interface StudyIntegrationsPanelProps {
  activities: StudyActivity[];
  activePlan: StudyPlan | null;
  goals: AcademicGoal[];
}

export function StudyIntegrationsPanel({
  activities,
  activePlan,
  goals,
}: StudyIntegrationsPanelProps) {
  // 1. Calculate today's planned sessions from active plan
  const todayPlanned = useMemo(() => {
    if (!activePlan || !activePlan.sessions || activePlan.sessions.length === 0) {
      return null;
    }
    const todayStr = new Date().toISOString().split("T")[0];
    const todaySessions = activePlan.sessions.filter((s) => s.session_date === todayStr);

    const totalMinutes = todaySessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
    const completedSessions = todaySessions.filter((s) => s.status === "completed").length;

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const durationStr =
      hours > 0 && mins > 0 ? `${hours}h ${mins}m` : hours > 0 ? `${hours}h` : `${mins}m`;

    return {
      sessionCount: todaySessions.length,
      completedCount: completedSessions,
      durationStr,
      sessions: todaySessions,
    };
  }, [activePlan]);

  // 2. Find most relevant active study/attendance/cgpa goal
  const primaryGoal = useMemo(() => {
    if (!goals || goals.length === 0) return null;
    return goals.find((g) => g.status === "active") || goals[0];
  }, [goals]);

  const goalProgressPct = useMemo(() => {
    if (!primaryGoal || primaryGoal.target_value <= 0) return 0;
    return Math.min(
      Math.round((primaryGoal.current_value / primaryGoal.target_value) * 100),
      100
    );
  }, [primaryGoal]);

  // 3. Compute deterministic insights
  const insights = useMemo(() => {
    if (!activities || activities.length < 2) return [];

    const list: Array<{ title: string; desc: string }> = [];

    // Most active day of week
    const dayHours: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    activities.forEach((a) => {
      const day = new Date(a.study_date).getDay();
      dayHours[day] += Number(a.study_hours) || 0;
    });

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let peakDay = 1;
    let peakVal = 0;
    Object.entries(dayHours).forEach(([d, val]) => {
      if (val > peakVal) {
        peakVal = val;
        peakDay = Number(d);
      }
    });

    if (peakVal > 0) {
      list.push({
        title: "Peak Learning Cadence",
        desc: `You record the highest volume of study on ${dayNames[peakDay]}s (${Math.round(peakVal * 10) / 10}h total).`,
      });
    }

    // Average duration
    const totalH = activities.reduce((acc, a) => acc + (Number(a.study_hours) || 0), 0);
    const avgH = Math.round((totalH / activities.length) * 10) / 10;
    list.push({
      title: "Session Duration",
      desc: `Your average study block is ${avgH} hours across ${activities.length} logged sessions.`,
    });

    return list;
  }, [activities]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. Study Plan Integration Card */}
      <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs space-y-3.5 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748B]">
              STUDY PLAN INTEGRATION
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <CalendarDays className="w-3.5 h-3.5 stroke-[2]" />
            </div>
          </div>

          <h4 className="text-sm font-bold text-[#0F172A] tracking-tight">
            Today&apos;s Planned Study
          </h4>

          {todayPlanned && todayPlanned.sessionCount > 0 ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#0F172A] font-semibold">
                <span>
                  {todayPlanned.sessionCount} session{todayPlanned.sessionCount !== 1 ? "s" : ""}
                </span>
                <span className="text-[#2563EB]">{todayPlanned.durationStr} planned</span>
              </div>
              <div className="text-[11px] text-[#64748B]">
                {todayPlanned.completedCount} of {todayPlanned.sessionCount} sessions completed today
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round((todayPlanned.completedCount / todayPlanned.sessionCount) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#64748B] leading-relaxed">
              {activePlan
                ? "No sessions scheduled for today in your active plan."
                : "No active weekly study plan generated yet."}
            </p>
          )}
        </div>

        <Link
          href="/study-plan"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] group pt-1"
        >
          <span>Open Study Plan</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* 2. Goal Integration Card */}
      <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs space-y-3.5 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748B]">
              ACADEMIC GOAL
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#10B981] flex items-center justify-center">
              <Target className="w-3.5 h-3.5 stroke-[2]" />
            </div>
          </div>

          <h4 className="text-sm font-bold text-[#0F172A] tracking-tight">
            {primaryGoal ? primaryGoal.title : "Academic Goal Progress"}
          </h4>

          {primaryGoal ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#0F172A]">
                <span className="text-[#64748B]">Current Progress</span>
                <span className="font-bold text-[#0F172A]">{goalProgressPct}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-[#10B981] rounded-full transition-all duration-300"
                  style={{ width: `${goalProgressPct}%` }}
                />
              </div>
              <div className="text-[11px] text-[#64748B] flex items-center justify-between">
                <span>
                  Current: {primaryGoal.current_value} / {primaryGoal.target_value} {primaryGoal.unit}
                </span>
                <span className="capitalize">{primaryGoal.status}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#64748B] leading-relaxed">
              Set measurable targets for your attendance, study hours, or coursework evaluations.
            </p>
          )}
        </div>

        <Link
          href="/goals"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#10B981] hover:text-emerald-700 group pt-1"
        >
          <span>Manage Goals</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* 3. Deterministic Activity Insights */}
      <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs space-y-3.5 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-600" />
              ACTIVITY INSIGHTS
            </span>
          </div>

          <h4 className="text-sm font-bold text-[#0F172A] tracking-tight">
            Cadence &amp; Habits
          </h4>

          {insights.length > 0 ? (
            <div className="space-y-2.5 pt-1 text-xs">
              {insights.map((ins, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-semibold text-[#0F172A]">{ins.title}</div>
                  <div className="text-[11px] text-[#64748B] leading-relaxed">{ins.desc}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#64748B] leading-relaxed">
              Insights will appear as you build your study history. Log at least two sessions to compute cadence.
            </p>
          )}
        </div>

        <div className="text-[10.5px] text-[#94A3B8] font-medium pt-1">
          Deterministic observation • Non-causal
        </div>
      </div>
    </div>
  );
}
