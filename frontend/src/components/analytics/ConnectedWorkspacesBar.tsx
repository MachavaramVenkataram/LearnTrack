"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  PlusCircle,
  Clock,
  Award,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AcademicGoal, PerformancePrediction } from "@/types/academic";

export interface ConnectedWorkspacesBarProps {
  latestPrediction: PerformancePrediction | null;
  activeGoal: AcademicGoal | null;
  insightSnippet?: string | null;
}

export function ConnectedWorkspacesBar({
  latestPrediction,
  activeGoal,
  insightSnippet,
}: ConnectedWorkspacesBarProps) {
  return (
    <div className="space-y-4">
      {/* Connected Intelligence Micro-Cards (Sections 69, 70, 71) */}
      {(latestPrediction || activeGoal || insightSnippet) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 1. Academic Insight Connection */}
          {insightSnippet ? (
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Analytics Insight</span>
                </div>
                <p className="text-xs text-slate-700 leading-snug font-medium">
                  {insightSnippet}
                </p>
              </div>

              <Link
                href="/insights"
                className="text-[11.5px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors pt-1"
              >
                <span>Explore Full Insights</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : null}

          {/* 2. Latest Prediction Connection */}
          {latestPrediction ? (
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Latest Prediction
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-normal">
                    {latestPrediction.model_version}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 pt-0.5">
                  <span className="text-xl font-extrabold text-slate-900 font-sans">
                    {latestPrediction.predicted_score.toFixed(1)}%
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Grade {latestPrediction.predicted_grade} • {latestPrediction.risk_level} Risk
                  </span>
                </div>
              </div>

              <Link
                href="/prediction"
                className="text-[11.5px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors pt-1"
              >
                <span>Open Prediction Workspace</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : null}

          {/* 3. Goal Progress Connection */}
          {activeGoal ? (
            <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    Target Goal
                  </span>
                  <span className="font-mono text-slate-900 font-bold">
                    {activeGoal.target_value}%
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium truncate">
                  {activeGoal.title}
                </p>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (activeGoal.current_value / (activeGoal.target_value || 1)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <Link
                href="/goals"
                className="text-[11.5px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors pt-1"
              >
                <span>Manage Academic Goals</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : null}
        </div>
      )}

      {/* Analytics Quick Actions Row (Section 46) */}
      <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Analytics Quick Actions
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/performance">
            <Button variant="outline" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5 text-blue-600" />}>
              Add Academic Record
            </Button>
          </Link>

          <Link href="/study">
            <Button variant="outline" size="sm" leftIcon={<Clock className="w-3.5 h-3.5 text-amber-600" />}>
              Record Study Session
            </Button>
          </Link>

          <Link href="/prediction">
            <Button variant="outline" size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-600" />}>
              Run Prediction
            </Button>
          </Link>

          <Link href="/insights">
            <Button variant="outline" size="sm" leftIcon={<Lightbulb className="w-3.5 h-3.5 text-blue-600" />}>
              View Insights
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
