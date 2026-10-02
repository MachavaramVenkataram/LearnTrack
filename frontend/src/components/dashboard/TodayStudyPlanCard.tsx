"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";
import { getActiveStudyPlan } from "@/lib/academic/service";
import { StudyPlan, StudyPlanSession } from "@/types/academic";

export function TodayStudyPlanCard() {
  const { studentProfile } = useAuth();
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [nextSession, setNextSession] = useState<StudyPlanSession | null>(null);
  const [todaySessionsCount, setTodaySessionsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadPlan() {
      if (!studentProfile?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const plan = await getActiveStudyPlan(studentProfile.id);
        if (isCancelled) return;

        setActivePlan(plan);

        if (plan?.sessions && plan.sessions.length > 0) {
          const todayIso = new Date().toISOString().split("T")[0];
          // Filter sessions for today or upcoming
          const todaySessions = plan.sessions.filter((s) => s.session_date === todayIso);
          setTodaySessionsCount(todaySessions.length);

          // Find first upcoming or in_progress session, or the earliest session
          const upcoming =
            todaySessions.find((s) => s.status === "upcoming" || s.status === "in_progress") ||
            plan.sessions.find((s) => s.status === "upcoming") ||
            todaySessions[0] ||
            plan.sessions[0];

          setNextSession(upcoming || null);
        }
      } catch (err) {
        console.error("Error loading today's study plan card:", err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    loadPlan();
    return () => {
      isCancelled = true;
    };
  }, [studentProfile?.id]);

  return (
    <Card className="border border-slate-200/80 shadow-xs hover:shadow-md transition-all rounded-2xl bg-white flex flex-col justify-between overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <CalendarDays className="w-4 h-4" />
          </span>
          <CardTitle className="text-sm font-bold text-slate-900">
            Today&apos;s Study Plan
          </CardTitle>
        </div>
        {activePlan && (
          <Badge variant="secondary" size="sm">
            {todaySessionsCount} Session{todaySessionsCount !== 1 ? "s" : ""} Today
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-5 flex-1 flex flex-col justify-between">
        {nextSession ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Next Scheduled Session
                </span>
                <Badge
                  variant={
                    nextSession.status === "completed"
                      ? "success"
                      : nextSession.status === "in_progress"
                      ? "warning"
                      : nextSession.status === "skipped"
                      ? "danger"
                      : "default"
                  }
                  size="sm"
                >
                  {nextSession.status === "in_progress"
                    ? "In Progress"
                    : nextSession.status === "completed"
                    ? "Completed"
                    : nextSession.status === "skipped"
                    ? "Skipped"
                    : "Upcoming"}
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  {nextSession.subject_name || "Target Subject"}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                  {nextSession.topic}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {nextSession.start_time} ({nextSession.duration_minutes} mins)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {nextSession.session_date}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">
                Plan: <strong>{activePlan?.title || "Active Plan"}</strong>
              </span>
              <Link href="/study-plan">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Open Study Plan
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">
                No Active Study Plan for Today
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Generate an AI-powered personalized study schedule balanced around your coursework priorities and available hours.
              </p>
            </div>
            <Link href="/study-plan" className="inline-block pt-1">
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Create Study Plan
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
