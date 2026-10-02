"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  Sparkles,
  Flame,
  Clock,
  Layers,
  CheckCircle2,
  Calendar,
  Play,
  Brain,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { studentOsService } from "@/lib/student-os/service";
import {
  TodayFocusAction,
  UpNextTimelineItem,
  LearningSnapshotData,
  StudentAIRecommendation,
  Skill,
} from "@/types/student-os";

interface DashboardCommandStripProps {
  userId: string;
}

export function DashboardCommandStrip({ userId }: DashboardCommandStripProps) {
  const [focusActions, setFocusActions] = useState<TodayFocusAction[]>([]);
  const [upNext, setUpNext] = useState<UpNextTimelineItem[]>([]);
  const [snapshot, setSnapshot] = useState<LearningSnapshotData | null>(null);
  const [recommendation, setRecommendation] = useState<StudentAIRecommendation | null>(null);
  const [topSkill, setTopSkill] = useState<Skill | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [actions, timeline, snap, rec, skills] = await Promise.all([
          studentOsService.getTodayFocusActions(userId),
          studentOsService.getUpNextTimeline(userId),
          studentOsService.getLearningSnapshot(userId),
          studentOsService.getStudentAIRecommendation(userId),
          studentOsService.getSkills(userId),
        ]);

        if (isMounted) {
          setFocusActions(actions);
          setUpNext(timeline);
          setSnapshot(snap);
          setRecommendation(rec);
          if (skills.length > 0) {
            const sorted = [...skills].sort((a, b) => b.score - a.score);
            setTopSkill(sorted[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load Student OS command strip:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const topFocus = focusActions[0];
  const nextItem = upNext[0];

  return (
    <Card className="border-blue-200/80 bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 shadow-soft-sm overflow-hidden">
      {/* Header bar */}
      <CardHeader className="p-4 sm:p-5 border-b border-blue-100/70 bg-white/70 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-soft-xs">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold text-slate-900 tracking-tight">
                STUDENT COMMAND CENTER
              </CardTitle>
              <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-blue-100 text-blue-700">
                Live Agenda
              </span>
            </div>
            <p className="text-2xs text-slate-500 mt-0.5">
              Personalized priority focus, deadlines, and AI intelligence for today
            </p>
          </div>
        </div>

        <Link href="/student-home">
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50/80 font-medium"
          >
            Open Full Command Center
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Row 1: Today's Focus & Up Next */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Today's Focus Card */}
          <div className="bg-white/90 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between hover:border-blue-300 transition-colors shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                  Priority Action
                </span>
                <span
                  className={`text-2xs font-semibold px-2 py-0.5 rounded-md ${
                    topFocus?.priority === "urgent"
                      ? "bg-rose-50 text-rose-600 border border-rose-200"
                      : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}
                >
                  {topFocus ? `${topFocus.priority.toUpperCase()} PRIORITY` : "ON TRACK"}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900">
                {topFocus ? topFocus.task : "All priority tasks completed for today"}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {topFocus ? `${topFocus.subject} • ~${topFocus.estimatedMinutes} minutes estimated` : "Great job staying ahead of your syllabus!"}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-2xs text-slate-400">
                {topFocus ? "Focus on deep comprehension" : "Ready for next objective"}
              </span>
              <Link href={topFocus ? `/focus?subject=${encodeURIComponent(topFocus.subject)}&task=${encodeURIComponent(topFocus.task)}` : "/focus"}>
                <Button variant="primary" size="sm" leftIcon={<Play className="w-3 h-3 fill-current" />} className="text-xs">
                  Start Focus Session
                </Button>
              </Link>
            </div>
          </div>

          {/* Up Next Card */}
          <div className="bg-white/90 border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-300 transition-colors shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                  Up Next on Timeline
                </span>
                <span className="text-2xs font-medium text-slate-500">
                  {nextItem ? `Due: ${new Date(nextItem.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "No urgent deadlines"}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 truncate">
                {nextItem ? nextItem.title : "No upcoming assignments or tests due"}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {nextItem ? `${nextItem.subject} • ${nextItem.type}` : "Keep maintaining consistent study habits"}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-2xs text-slate-400">
                {upNext.length > 1 ? `+${upNext.length - 1} more deliverables queued` : "Timeline clear"}
              </span>
              <Link href="/assignments">
                <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />} className="text-xs">
                  View Deliverables
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Row 2: Learning Snapshot KPI Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white/80 border border-slate-100 rounded-lg p-2.5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xs text-slate-400 font-medium">Study Streak</div>
              <div className="text-xs font-bold text-slate-900">
                {snapshot ? `${snapshot.studyStreakDays} Days` : "—"}
              </div>
            </div>
          </div>

          <div className="bg-white/80 border border-slate-100 rounded-lg p-2.5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xs text-slate-400 font-medium">Weekly Hours</div>
              <div className="text-xs font-bold text-slate-900">
                {snapshot ? `${snapshot.weeklyStudyHours} hrs` : "—"}
              </div>
            </div>
          </div>

          <div className="bg-white/80 border border-slate-100 rounded-lg p-2.5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xs text-slate-400 font-medium">Flashcards Due</div>
              <div className="text-xs font-bold text-slate-900">
                {snapshot ? `${snapshot.flashcardsDue} Due` : "—"}
              </div>
            </div>
          </div>

          <div className="bg-white/80 border border-slate-100 rounded-lg p-2.5 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-2xs text-slate-400 font-medium">Practice Accuracy</div>
              <div className="text-xs font-bold text-slate-900">
                {snapshot?.practiceAccuracy !== null && snapshot?.practiceAccuracy !== undefined ? `${snapshot.practiceAccuracy}%` : "Not enough data"}
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: AI Grounded Recommendation & Skill Pulse */}
        <div className="bg-gradient-to-r from-purple-50/70 to-indigo-50/60 border border-purple-200/70 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xs font-bold text-purple-900 uppercase tracking-wider">
                  AI Recommendation
                </span>
                {topSkill && (
                  <span className="text-2xs text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full font-medium">
                    Top Verified Skill: {topSkill.name} ({topSkill.score}%)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                {recommendation?.recommendationText ||
                  "Your recent practice shows weaker performance in Regression Metrics. Consider reviewing MAE, RMSE and R² before continuing."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <Link href="/practice">
              <Button variant="outline" size="sm" className="text-xs border-purple-200 text-purple-800 hover:bg-purple-100/60">
                Study This Topic
              </Button>
            </Link>
            <Link href={`/assistant?prompt=${encodeURIComponent(recommendation?.recommendationText || "What should I focus on studying today?")}`}>
              <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />} className="text-xs bg-purple-600 text-white hover:bg-purple-700">
                Ask LearnTrack
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
