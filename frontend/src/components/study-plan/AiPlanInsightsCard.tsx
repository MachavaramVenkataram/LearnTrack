"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { StudyPlan, StudentAIContext } from "@/types/academic";

interface AiPlanInsightsCardProps {
  plan: StudyPlan | null;
  context: StudentAIContext | null;
  dailyHours?: number;
  breakPreference?: "pomodoro" | "standard" | "long_blocks";
}

export function AiPlanInsightsCard({
  plan,
  context,
  dailyHours = 3,
  breakPreference = "standard",
}: AiPlanInsightsCardProps) {
  // Generate deterministic, factual insights strictly grounded in real context & active plan
  const insights: string[] = [];

  if (plan?.sessions && plan.sessions.length > 0) {
    const totalSessions = plan.sessions.length;
    const completedSessions = plan.sessions.filter((s) => s.status === "completed").length;
    const remainingSessions = totalSessions - completedSessions;

    // Factual pacing insight
    insights.push(
      `Paced at approximately ${dailyHours} hours/day across ${totalSessions} structured learning sessions.`
    );

    // Break strategy explanation
    if (breakPreference === "pomodoro") {
      insights.push(
        "Utilizing 25-minute Pomodoro study intervals with 5-minute cognitive resets to maintain focus."
      );
    } else if (breakPreference === "long_blocks") {
      insights.push(
        "Utilizing 90-minute deep work blocks with 15-minute breaks suited for complex problem solving."
      );
    } else {
      insights.push(
        "Utilizing standard 50-minute study blocks with 10-minute intervals for sustained retention."
      );
    }

    // Weakest course focus insight if available in context
    if (context?.academic.subjects && context.academic.subjects.length > 0) {
      const sorted = [...context.academic.subjects]
        .filter((s) => s.score !== null && s.score !== undefined)
        .sort((a, b) => (a.score || 0) - (b.score || 0));

      if (sorted.length > 0 && (sorted[0].score || 0) < 75) {
        insights.push(
          `Dedicated reinforcement blocks assigned for ${sorted[0].name} based on continuous evaluation scores.`
        );
      }
    }

    // Completion progress insight
    if (completedSessions > 0) {
      insights.push(
        `${completedSessions} of ${totalSessions} sessions completed. Keep consistent daily cadence to stay on track.`
      );
    } else {
      insights.push(
        `${remainingSessions} sessions ready for execution. Complete sessions to build study streak and momentum.`
      );
    }
  } else {
    insights.push(
      "Create an active study plan to generate personalized timetable distribution and pacing analysis."
    );
  }

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white border border-blue-100 shadow-soft-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
              AI Planning Insights
            </h3>
            <p className="text-xs text-[#64748B]">
              Factual pacing and focus breakdown derived from your coursework
            </p>
          </div>
        </div>

        <Link
          href="/assistant"
          className="h-8 px-3 rounded-[9px] bg-white border border-blue-200/90 text-xs font-semibold text-[#2563EB] hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center gap-1.5 self-start sm:self-center shadow-2xs group cursor-pointer"
        >
          <span>Ask AI Assistant</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Insight bullets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-white/80 border border-blue-100/80 text-slate-700 flex items-start gap-2 shadow-2xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
            <span className="leading-relaxed">{insight}</span>
          </div>
        ))}
      </div>

      {/* Transparency note */}
      <div className="pt-2 text-[11px] text-slate-400 border-t border-blue-100/70 flex items-center justify-between">
        <span>
          AI-assisted recommendations based on your registered coursework and targets.
        </span>
        <span className="text-[10px] font-mono text-slate-400">
          Deterministic Pacing
        </span>
      </div>
    </div>
  );
}
