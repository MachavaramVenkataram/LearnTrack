"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Brain,
  Layers,
  Calendar,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { learningService } from "@/lib/learning/service";
import { Flashcard, ExamPlan } from "@/types/learning";
import { useAuth } from "@/lib/auth-context";

interface TodaysLearningCardProps {
  totalStudyHours?: number;
}

export function TodaysLearningCard({ totalStudyHours = 0 }: TodaysLearningCardProps) {
  const { user, studentProfile } = useAuth();
  const userId = user?.id || studentProfile?.id || "demo-user";

  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const [exams, setExams] = useState<ExamPlan[]>([]);
  const [weakTopics, setWeakTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [allCards, allExams, weak] = await Promise.all([
          learningService.getFlashcards(userId),
          learningService.getExamPlans(userId),
          learningService.getWeakTopics(userId),
        ]);

        if (isMounted) {
          const todayStr = new Date().toISOString().split("T")[0];
          const due = allCards.filter(
            (c: Flashcard) => c.due_date <= todayStr || c.state === "new"
          );
          setDueCards(due);
          setExams(allExams);
          setWeakTopics(weak);
        }
      } catch (err) {
        console.error("Failed to load today's learning data:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Compute nearest upcoming exam
  const upcomingExam = exams
    .filter((e) => e.status === "active")
    .map((e) => {
      const days = Math.ceil(
        (new Date(e.exam_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );
      return { ...e, daysRemaining: days };
    })
    .filter((e) => e.daysRemaining >= 0)
    .sort((a, b) => a.daysRemaining - b.daysRemaining)[0];

  return (
    <Card className="border-blue-200/90 bg-gradient-to-r from-white via-blue-50/20 to-indigo-50/30 shadow-soft-sm overflow-hidden">
      <CardHeader className="p-4 sm:p-5 border-b border-blue-100/70 bg-white/70 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-soft-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-bold text-slate-900 tracking-tight">
                TODAY&apos;S LEARNING
              </CardTitle>
              <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-blue-100 text-blue-700">
                Active OS
              </span>
            </div>
            <p className="text-2xs text-slate-500 mt-0.5">
              Personalized daily revision queue and academic exam priorities
            </p>
          </div>
        </div>

        <Link href="/notebook">
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />} className="text-xs">
            Workspace
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* 1. Flashcards Due */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500">Flashcards</span>
              <Layers className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900">
              {isLoading ? "—" : dueCards.length}
            </div>
            <p className="text-2xs text-slate-500 font-medium">
              {dueCards.length > 0 ? "Due for spaced review" : "All cards caught up"}
            </p>
            {dueCards.length > 0 && (
              <div className="pt-1.5">
                <Link href="/flashcards" className="text-2xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                  Review queue <ArrowRight className="w-2.5 h-2.5" />
                </Link>
              </div>
            )}
          </div>

          {/* 2. Topic to Review */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500">Weak Topics</span>
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
              {isLoading ? "—" : weakTopics.length}
            </div>
            <p className="text-2xs text-slate-500 font-medium truncate">
              {weakTopics.length > 0 ? weakTopics[0] : "Strong quiz consistency"}
            </p>
            {weakTopics.length > 0 && (
              <div className="pt-1.5">
                <Link href="/practice" className="text-2xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1">
                  Practice quiz <ArrowRight className="w-2.5 h-2.5" />
                </Link>
              </div>
            )}
          </div>

          {/* 3. Study Hours / Activity */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500">Study Logged</span>
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900">
              {totalStudyHours > 0 ? `${totalStudyHours}h` : "45m"}
            </div>
            <p className="text-2xs text-slate-500 font-medium">
              Daily target: 2.0h
            </p>
            <div className="pt-1.5">
              <Link href="/study" className="text-2xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                Log session <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>

          {/* 4. Exam Countdown */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500">Next Exam</span>
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900">
              {upcomingExam ? `${upcomingExam.daysRemaining}d` : "None"}
            </div>
            <p className="text-2xs text-slate-500 font-medium truncate">
              {upcomingExam ? upcomingExam.subject_name : "No exam date set"}
            </p>
            <div className="pt-1.5">
              <Link href="/exam-prep" className="text-2xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Prep center <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Recommended Learning Action Banner */}
        <div className="mt-3 p-3 rounded-xl bg-blue-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-2xs font-bold uppercase tracking-wider text-blue-200">
                Recommended Focus
              </span>
              <p className="text-xs font-semibold text-white">
                {weakTopics.length > 0
                  ? `LearnTrack detected lower quiz performance in ${weakTopics[0]}. Ready to practice?`
                  : upcomingExam
                  ? `Review high-priority topics for ${upcomingExam.subject_name} (${upcomingExam.daysRemaining} days remaining)`
                  : "Keep your streak going by reviewing your notes in the Notebook workspace."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {weakTopics.length > 0 ? (
              <Link href="/practice">
                <Button variant="outline" size="sm" className="bg-white text-blue-700 hover:bg-blue-50 border-0 text-xs font-semibold">
                  Practice Questions
                </Button>
              </Link>
            ) : (
              <Link href="/notebook">
                <Button variant="outline" size="sm" className="bg-white text-blue-700 hover:bg-blue-50 border-0 text-xs font-semibold">
                  Open Notebook
                </Button>
              </Link>
            )}
            <Link href="/tutor">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 text-xs">
                Ask AI Tutor
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
