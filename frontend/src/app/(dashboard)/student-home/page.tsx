"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  Timer,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  Flame,
  Clock,
  Target,
  BarChart3,
  Bot,
  Brain,
  ListChecks,
  AlertCircle,
  RefreshCw,
  Plus,
  Play,
  Award,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getTodayFocusActions,
  getUpNextTimeline,
  getLearningSnapshot,
  getStudentAIRecommendation,
} from "@/lib/student-os/service";
import {
  TodayFocusAction,
  UpNextTimelineItem,
  LearningSnapshotData,
  StudentAIRecommendation,
} from "@/types/student-os";
import { useToast } from "@/components/ui/Toast";

export default function StudentHomePage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const userId = user?.id || "demo-student";

  const [isLoading, setIsLoading] = useState(true);
  const [focusActions, setFocusActions] = useState<TodayFocusAction[]>([]);
  const [timelineItems, setTimelineItems] = useState<UpNextTimelineItem[]>([]);
  const [snapshot, setSnapshot] = useState<LearningSnapshotData | null>(null);
  const [recommendation, setRecommendation] = useState<StudentAIRecommendation | null>(null);

  // Greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const studentName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Student";

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [actions, timeline, snap, rec] = await Promise.all([
        getTodayFocusActions(userId),
        getUpNextTimeline(userId),
        getLearningSnapshot(userId),
        getStudentAIRecommendation(userId),
      ]);
      setFocusActions(actions);
      setTimelineItems(timeline);
      setSnapshot(snap);
      setRecommendation(rec);
    } catch {
      showToast("Error loading command center", "Could not fetch latest student agenda.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* 1. Header Banner */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100/70 text-[11px] font-semibold text-blue-700 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Student Operating System</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              {getGreeting()}, {studentName}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              &ldquo;Here&apos;s what matters today.&rdquo;
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/focus")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Focus Session</span>
            </button>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Refresh agenda"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* Learning Snapshot Quick Bar */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Learning Snapshot
            </h2>
            <Link
              href="/analytics"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View full analytics</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* Streak */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Study Streak</span>
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xl font-bold text-slate-900">
                {snapshot ? `${snapshot.studyStreakDays} days` : "Not recorded"}
              </p>
              <span className="text-[11px] text-emerald-600 font-medium">Active streak</span>
            </div>

            {/* Weekly Study Hours */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Weekly Hours</span>
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xl font-bold text-slate-900">
                {snapshot ? `${snapshot.weeklyStudyHours}h` : "Not recorded"}
              </p>
              <span className="text-[11px] text-slate-500 font-medium">Last 7 days</span>
            </div>

            {/* Completed Tasks */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Tasks Done</span>
                <ListChecks className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-xl font-bold text-slate-900">
                {snapshot ? snapshot.completedTasks : "0"}
              </p>
              <span className="text-[11px] text-slate-500 font-medium">Recorded tasks</span>
            </div>

            {/* Flashcards Due */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Cards Due</span>
                <Layers className="w-4 h-4 text-violet-500" />
              </div>
              <p className="text-xl font-bold text-slate-900">
                {snapshot ? snapshot.flashcardsDue : "0"}
              </p>
              <Link
                href="/flashcards"
                className="text-[11px] text-blue-600 hover:underline font-medium"
              >
                Review now
              </Link>
            </div>

            {/* Practice Accuracy */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Accuracy</span>
                <Award className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xl font-bold text-slate-900">
                {snapshot?.practiceAccuracy != null ? `${snapshot.practiceAccuracy}%` : "Not enough data"}
              </p>
              <span className="text-[11px] text-slate-500 font-medium">Practice quizzes</span>
            </div>

            {/* Current Goal Progress */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Goal Progress</span>
                <Target className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-xl font-bold text-slate-900">
                {snapshot?.currentGoalProgress != null ? `${snapshot.currentGoalProgress}%` : "No active goal"}
              </p>
              <Link href="/goals" className="text-[11px] text-blue-600 hover:underline font-medium">
                View goals
              </Link>
            </div>
          </div>
        </section>

        {/* 2-Column Core: Today's Focus (Left) & Up Next + AI Recommendation (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Today's Focus (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span>Today&apos;s Focus</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Prioritized action items calculated from your upcoming deadlines, weak concepts, and study goals.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/focus")}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>Start Focus Session</span>
                </button>
              </div>

              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mb-2" />
                  <span className="text-sm">Synthesizing today&apos;s priorities...</span>
                </div>
              ) : focusActions.length === 0 ? (
                <div className="py-12 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6">
                  <ListChecks className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <h3 className="text-sm font-semibold text-slate-800">You are all caught up!</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                    No urgent tasks due today. Start a focus session or explore new practice questions.
                  </p>
                  <button
                    onClick={() => router.push("/focus")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 cursor-pointer"
                  >
                    Start Focus Session
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {focusActions.map((action, idx) => (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                            {action.subject}
                          </span>
                          <span
                            className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border ${
                              action.priority === "urgent"
                                ? "bg-rose-50 text-rose-700 border-rose-100"
                                : action.priority === "high"
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {action.priority}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {action.estimatedMinutes} min
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {action.task}
                        </h4>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (action.actionUrl) {
                              router.push(action.actionUrl);
                            } else {
                              router.push(
                                `/focus?subject=${encodeURIComponent(
                                  action.subject
                                )}&task=${encodeURIComponent(action.task)}`
                              );
                            }
                          }}
                          className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Start Focus Session</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Cross-Feature Links Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/notebook"
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                    Notebook
                  </h4>
                  <p className="text-[11px] text-slate-400">Class notes &amp; AI study tools</p>
                </div>
              </Link>

              <Link
                href="/assignments"
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    Assignments
                  </h4>
                  <p className="text-[11px] text-slate-400">Deadlines &amp; AI breakdowns</p>
                </div>
              </Link>

              <Link
                href="/skills"
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs transition-all flex items-center gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800 group-hover:text-violet-600 transition-colors">
                    Skill Intelligence
                  </h4>
                  <p className="text-[11px] text-slate-400">Evidence-based progression</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Column: AI Recommendation & Up Next (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* AI Recommendation Card */}
            <div className="bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-violet-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold tracking-wider uppercase text-violet-200">
                  AI Recommendation
                </span>
              </div>

              {recommendation ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {recommendation.recommendationText}
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/focus?subject=${encodeURIComponent(
                            recommendation.subject
                          )}&task=${encodeURIComponent("Review " + recommendation.topic)}`
                        )
                      }
                      className="px-3.5 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Study This Topic
                    </button>
                    <button
                      onClick={() =>
                        router.push(
                          `/assistant?prompt=${encodeURIComponent(
                            `Can you explain ${recommendation.topic} in ${recommendation.subject} simply and provide 3 quick quiz questions?`
                          )}`
                        )
                      }
                      className="px-3.5 py-1.5 rounded-lg bg-violet-800/80 hover:bg-violet-700 text-violet-100 text-xs font-semibold border border-violet-600/50 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>Ask LearnTrack</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-300">Not enough recorded data yet.</p>
              )}
            </div>

            {/* Up Next Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Up Next</span>
                </h3>
                <Link
                  href="/assignments"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700"
                >
                  View calendar
                </Link>
              </div>

              {isLoading ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Loading upcoming agenda...
                </div>
              ) : timelineItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No upcoming deadlines recorded.
                </div>
              ) : (
                <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                  {timelineItems.map((item) => (
                    <div key={item.id} className="relative group">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-blue-600 shadow-xs" />

                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                            {item.type} • {item.subject}
                          </span>
                          <h4 className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </h4>
                          <span className="text-[11px] text-slate-500 font-medium">
                            Due: {new Date(item.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${
                            item.urgency === "urgent"
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : item.urgency === "upcoming"
                              ? "bg-amber-50 text-amber-700 border-amber-100"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {item.urgency}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
