"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  BookOpen,
  TrendingUp,
  RotateCcw,
  Trash2,
  Calendar,
  Layers,
  History,
  AlertTriangle,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

import {
  getActiveStudyPlan,
  getStudyPlans,
  saveStudyPlanWithSessions,
  updateStudySessionStatus,
  deleteStudyPlan,
  logStudySessionActivity,
  getSubjects,
} from "@/lib/academic/service";
import { buildStudentContext } from "@/lib/ai/contextBuilder";
import { requestStudyPlanGeneration } from "@/lib/api/ai";
import {
  StudyPlan,
  StudyPlanSession,
  SessionStatus,
  StudyPlanGenerationInput,
  StudentAIContext,
  Subject,
} from "@/types/academic";

import { StudySessionCard } from "@/components/study-plan/StudySessionCard";
import { WeeklyTimeline, DayGroup } from "@/components/study-plan/WeeklyTimeline";
import { SubjectPrioritiesCard } from "@/components/study-plan/SubjectPrioritiesCard";
import { AiPlanInsightsCard } from "@/components/study-plan/AiPlanInsightsCard";
import { EmptyStudyWorkspace } from "@/components/study-plan/EmptyStudyWorkspace";
import { GeneratePlanModal } from "@/components/study-plan/GeneratePlanModal";
import { SessionCompletionModal } from "@/components/study-plan/SessionCompletionModal";

export default function StudyPlanPage() {
  const { user, profile, studentProfile, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [allPlans, setAllPlans] = useState<StudyPlan[]>([]);
  const [context, setContext] = useState<StudentAIContext | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Selected date filter in weekly timeline (null means "All Days")
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Generator Modal state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Session completion modal state
  const [completingSession, setCompletingSession] = useState<StudyPlanSession | null>(null);

  // Plan delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Open generator modal if triggered via Command Center or URL param
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "generate") {
        setIsGeneratorOpen(true);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
    const handleCustomAction = (e: any) => {
      if (e.detail?.action === "generate-plan") {
        setIsGeneratorOpen(true);
      }
    };
    window.addEventListener("learntrack:open-action", handleCustomAction);
    return () => window.removeEventListener("learntrack:open-action", handleCustomAction);
  }, []);

  // Load student context, registered subjects, and study plans
  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setLoadError(null);

    try {
      const studentId = studentProfile?.id || user.id;

      const [ctx, active, plans, fetchedSubjects] = await Promise.all([
        buildStudentContext(user.id, studentProfile?.id, profile?.full_name),
        getActiveStudyPlan(studentId),
        getStudyPlans(studentId),
        studentProfile?.id ? getSubjects(studentProfile.id) : Promise.resolve([]),
      ]);

      setContext(ctx);
      setActivePlan(active);
      setAllPlans(plans);
      setSubjects(fetchedSubjects);
    } catch (err: any) {
      console.error("Error loading study plan data:", err);
      setLoadError(err?.message || "Failed to load study plan workspace.");
      showToast("Error", "Could not load your study plan data.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, studentProfile?.id, profile, showToast]);

  useEffect(() => {
    if (user?.id) {
      loadData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [user?.id, authLoading, loadData]);

  // Derived progress statistics calculated strictly from real data
  const progressStats = useMemo(() => {
    if (!activePlan?.sessions || activePlan.sessions.length === 0) {
      return {
        completionPercentage: 0,
        completedSessions: 0,
        totalSessions: 0,
        completedMinutes: 0,
        totalMinutes: 0,
        completedHours: 0,
        totalHours: 0,
        todayHours: 0,
        todaySessionsCount: 0,
        todayCompletedCount: 0,
      };
    }

    const totalSessions = activePlan.sessions.length;
    const completedSessions = activePlan.sessions.filter(
      (s) => s.status === "completed"
    ).length;
    const completionPercentage =
      totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    const totalMinutes = activePlan.sessions.reduce(
      (acc, s) => acc + (s.duration_minutes || 0),
      0
    );
    const completedMinutes = activePlan.sessions
      .filter((s) => s.status === "completed")
      .reduce((acc, s) => acc + (s.duration_minutes || 0), 0);

    // Compute today's metrics
    const todayIso = new Date().toISOString().split("T")[0];
    const todaySessions = activePlan.sessions.filter(
      (s) => s.session_date === todayIso
    );
    const todayMinutes = todaySessions.reduce(
      (acc, s) => acc + (s.duration_minutes || 0),
      0
    );
    const todayCompletedCount = todaySessions.filter(
      (s) => s.status === "completed"
    ).length;

    return {
      completionPercentage,
      completedSessions,
      totalSessions,
      completedMinutes,
      totalMinutes,
      completedHours: Math.round((completedMinutes / 60) * 10) / 10,
      totalHours: Math.round((totalMinutes / 60) * 10) / 10,
      todayHours: Math.round((todayMinutes / 60) * 10) / 10,
      todaySessionsCount: todaySessions.length,
      todayCompletedCount,
    };
  }, [activePlan]);

  // Group active plan sessions by date into DayGroup objects
  const daysGrouped = useMemo<DayGroup[]>(() => {
    if (!activePlan?.sessions || activePlan.sessions.length === 0) return [];

    const todayIso = new Date().toISOString().split("T")[0];
    const map = new Map<string, StudyPlanSession[]>();

    activePlan.sessions.forEach((s) => {
      const existing = map.get(s.session_date) || [];
      existing.push(s);
      map.set(s.session_date, existing);
    });

    const entries = Array.from(map.entries());
    entries.sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

    return entries.map(([dateStr, sessionList], idx) => {
      const d = new Date(dateStr);
      const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
      const weekdayShort = d.toLocaleDateString("en-US", { weekday: "short" });
      const formatted = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const completedCount = sessionList.filter(
        (s) => s.status === "completed"
      ).length;

      return {
        dateStr,
        dayTitle: `Day ${idx + 1}: ${weekday}`,
        dateFormatted: formatted,
        weekdayShort,
        sessions: sessionList.sort((a, b) => a.start_time.localeCompare(b.start_time)),
        isAllCompleted:
          completedCount === sessionList.length && sessionList.length > 0,
        completedCount,
        totalCount: sessionList.length,
        isToday: dateStr === todayIso,
      };
    });
  }, [activePlan]);

  // Today's sessions specifically (or the next upcoming day's sessions if today has none)
  const todaySessionsData = useMemo(() => {
    if (!daysGrouped || daysGrouped.length === 0) return null;

    const todayIso = new Date().toISOString().split("T")[0];
    const todayGroup = daysGrouped.find((d) => d.dateStr === todayIso);

    if (todayGroup && todayGroup.sessions.length > 0) {
      return {
        label: "Today's Schedule",
        isToday: true,
        dateFormatted: todayGroup.dateFormatted,
        sessions: todayGroup.sessions,
      };
    }

    // If no sessions today, find earliest upcoming day with uncompleted sessions
    const upcomingDay =
      daysGrouped.find((d) => !d.isAllCompleted && d.dateStr >= todayIso) ||
      daysGrouped.find((d) => d.dateStr >= todayIso) ||
      daysGrouped[0];

    return {
      label: `Next Scheduled: ${upcomingDay.dayTitle}`,
      isToday: false,
      dateFormatted: upcomingDay.dateFormatted,
      sessions: upcomingDay.sessions,
    };
  }, [daysGrouped]);

  // Filtered sessions for the main schedule timeline based on selectedDate
  const displayedScheduleDays = useMemo(() => {
    if (selectedDate === null) {
      return daysGrouped;
    }
    return daysGrouped.filter((d) => d.dateStr === selectedDate);
  }, [daysGrouped, selectedDate]);

  // Handle plan generation
  const handleGeneratePlan = async (input: StudyPlanGenerationInput) => {
    if (!user?.id) return;
    setIsGenerating(true);

    try {
      const studentId = studentProfile?.id || user.id;
      const startDateStr = new Date().toISOString().split("T")[0];

      const generatedOutput = await requestStudyPlanGeneration({
        userId: user.id,
        studentId,
        studentName: profile?.full_name || "Student",
        input,
        startDateStr,
        context: context || undefined,
      });

      // Calculate end date based on duration
      const durationDays = generatedOutput.total_days || 7;
      const endD = new Date();
      endD.setDate(endD.getDate() + durationDays - 1);
      const endDateStr = endD.toISOString().split("T")[0];

      // Save to Supabase
      const newPlan = await saveStudyPlanWithSessions(
        studentId,
        generatedOutput,
        startDateStr,
        endDateStr
      );

      if (!newPlan) {
        throw new Error("Could not save generated study plan.");
      }

      setActivePlan(newPlan);
      setAllPlans((prev) => [newPlan, ...prev]);
      setIsGeneratorOpen(false);

      showToast(
        "Study Plan Created",
        `Generated ${newPlan.sessions?.length || 0} balanced study sessions.`,
        "success"
      );
    } catch (err: any) {
      console.error("Plan generation error:", err);
      showToast(
        "Generation Failed",
        err.message || "Unable to generate study plan. Please try again.",
        "error"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Update session status (e.g. In Progress, Skipped)
  const handleUpdateStatus = async (
    session: StudyPlanSession,
    newStatus: SessionStatus
  ) => {
    try {
      await updateStudySessionStatus(session.id, newStatus);
      if (activePlan) {
        const updatedSessions = (activePlan.sessions || []).map((s) =>
          s.id === session.id ? { ...s, status: newStatus } : s
        );
        setActivePlan({ ...activePlan, sessions: updatedSessions });
      }
      showToast("Session Updated", `Marked as ${newStatus.replace("_", " ")}.`, "info");
    } catch {
      showToast("Error", "Could not update session status.", "error");
    }
  };

  // Confirm complete session and optionally record to study_activity
  const handleConfirmCompletion = async (
    session: StudyPlanSession,
    autoLog: boolean
  ) => {
    try {
      const studentId = studentProfile?.id || user?.id || "default-student";

      await updateStudySessionStatus(session.id, "completed");

      if (autoLog) {
        await logStudySessionActivity(
          studentId,
          session.session_date,
          session.duration_minutes,
          session.topic,
          session.subject_name
        );
        showToast(
          "Session Logged",
          `${session.duration_minutes} minutes recorded to your Study Activity log.`,
          "success"
        );
      } else {
        showToast("Session Completed", "Great job on completing this session!", "success");
      }

      if (activePlan) {
        const updatedSessions = (activePlan.sessions || []).map((s) =>
          s.id === session.id ? { ...s, status: "completed" as SessionStatus } : s
        );
        setActivePlan({ ...activePlan, sessions: updatedSessions });
      }
    } catch (e) {
      console.error(e);
      showToast("Error", "Could not complete session.", "error");
    }
  };

  // Delete active plan
  const handleDeletePlan = async () => {
    if (!activePlan) return;
    setIsDeleting(true);

    try {
      const success = await deleteStudyPlan(activePlan.id);
      if (success) {
        setActivePlan(null);
        setAllPlans((prev) => prev.filter((p) => p.id !== activePlan.id));
        showToast("Plan Removed", "The active study plan was deleted.", "info");
        setIsDeleteModalOpen(false);
      } else {
        showToast("Error", "Could not delete plan.", "error");
      }
    } catch {
      showToast("Error", "Failed to delete study plan.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // List of priority subject IDs to pass into child cards
  const prioritySubjectIds = useMemo(() => {
    if (!context?.academic.subjects) return [];
    return context.academic.subjects
      .filter((s) => s.score !== null && s.score !== undefined && s.score < 75)
      .map((s) => s.id);
  }, [context]);

  return (
    <div className="space-y-6 pb-14 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* ============================================================== */}
      {/* 4, 5, 6, 7, 8. PAGE HEADER & STATUS STRIP                     */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-[#2563EB]">Study Plan</span>
          </div>

          <div className="flex items-center gap-3 pt-0.5">
            {/* Header 40px icon */}
            <div className="w-10 h-10 rounded-[12px] bg-[#EFF6FF] text-[#2563EB] border border-blue-100 flex items-center justify-center shadow-2xs transition-transform duration-200 hover:-translate-y-0.5">
              <CalendarDays className="w-5 h-5" />
            </div>

            <div>
              <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0F172A] tracking-tight leading-tight">
                Your Study Plan
              </h1>
              <p className="text-xs sm:text-[13px] text-[#64748B] max-w-xl leading-relaxed">
                Turn your academic priorities into a focused daily schedule.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          <Link
            href="/assistant"
            className="h-[42px] px-4 rounded-[11px] bg-white border border-[#E2E8F0] text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] hover:border-slate-300 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-[#4F46E5] transition-transform duration-150 group-hover:rotate-12" />
            <span>Ask AI Assistant</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsGeneratorOpen(true)}
            className="h-[42px] px-5 rounded-[11px] bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-soft-sm hover:shadow-soft-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 cursor-pointer group"
          >
            <Plus className="w-4 h-4 transition-transform duration-150 group-hover:rotate-90" />
            <span>{activePlan ? "Adjust Plan" : "Create Study Plan"}</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {loadError && !isLoading && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4 text-xs text-rose-800 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold text-rose-900">Unable to load study plan</p>
              <p className="text-rose-700 mt-0.5">{loadError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="bg-white text-rose-700 border border-rose-300 hover:bg-rose-100/50 px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* 9. Active Plan Status Bar */}
      {activePlan && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-xs shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Plan
            </span>
            <span className="text-slate-400 font-mono">•</span>
            <span className="font-bold text-slate-900 truncate max-w-xs">
              {activePlan.title}
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-500 text-[11px] font-mono">
            <span>
              Period:{" "}
              <strong className="text-slate-700">
                {activePlan.start_date} → {activePlan.end_date}
              </strong>
            </span>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
              title="Delete active plan"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 37. LOADING STATE SKELETON                                     */}
      {/* ============================================================== */}
      {isLoading ? (
        <div className="space-y-6 animate-pulse">
          {/* KPI skeleton strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-white border border-slate-200/80 p-4 space-y-2"
              >
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-7 w-14 bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>

          {/* Schedule skeleton */}
          <div className="h-72 rounded-2xl bg-white border border-slate-200/80 p-6 space-y-4">
            <div className="h-5 w-48 bg-slate-200 rounded" />
            <div className="h-20 bg-slate-100 rounded-xl" />
            <div className="h-20 bg-slate-100 rounded-xl" />
          </div>
        </div>
      ) : !activePlan ? (
        /* ============================================================ */
        /* 10, 11, 12, 13. NO ACTIVE PLAN WORKSPACE (< 340px)           */
        /* ============================================================ */
        <EmptyStudyWorkspace
          hasSubjects={
            (context?.academic.subjects && context.academic.subjects.length > 0) ||
            subjects.length > 0
          }
          onOpenGenerator={() => setIsGeneratorOpen(true)}
        />
      ) : (
        /* ============================================================ */
        /* 14, 15, 16. ACTIVE PLAN WORKSPACE EXPERIENCE                 */
        /* ============================================================ */
        <div className="space-y-6">
          {/* ROW 1: Plan Summary Cards (Real Values Only) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 animate-in fade-in duration-200">
            {/* Card 1: Today's Hours */}
            <div className="p-4.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-soft-md transition-all duration-200">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Today&apos;s Hours
                </span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-[26px] font-bold text-[#0F172A] tracking-tight leading-none font-mono">
                {progressStats.todayHours}h
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                {progressStats.todaySessionsCount} scheduled session
                {progressStats.todaySessionsCount !== 1 ? "s" : ""} today
              </p>
            </div>

            {/* Card 2: Today's Completed Sessions */}
            <div className="p-4.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-soft-md transition-all duration-200">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Today&apos;s Done
                </span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-[26px] font-bold text-emerald-700 tracking-tight leading-none font-mono">
                {progressStats.todayCompletedCount} / {progressStats.todaySessionsCount}
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                {progressStats.todaySessionsCount - progressStats.todayCompletedCount}{" "}
                remaining today
              </p>
            </div>

            {/* Card 3: Total Completed Sessions */}
            <div className="p-4.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-soft-md transition-all duration-200">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Completed
                </span>
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-[26px] font-bold text-[#0F172A] tracking-tight leading-none font-mono">
                {progressStats.completedSessions}
                <span className="text-sm font-normal text-slate-400 ml-1">
                  / {progressStats.totalSessions}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-medium">
                {progressStats.completedHours}h logged of {progressStats.totalHours}h
              </p>
            </div>

            {/* Card 4: Plan Completion Rate */}
            <div className="p-4.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-soft-md transition-all duration-200">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Plan Progress
                </span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-[26px] font-bold text-[#0F172A] tracking-tight leading-none font-mono">
                {progressStats.completionPercentage}%
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#2563EB] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressStats.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* ROW 2: Today's Study Plan (The Hero Section!) */}
          {todaySessionsData && (
            <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-[#0F172A] tracking-tight">
                        Today&apos;s Study Plan
                      </h2>
                      {!todaySessionsData.isToday && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {todaySessionsData.label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B]">
                      {todaySessionsData.isToday
                        ? "Your recommended study sessions for today."
                        : `Showing next scheduled day (${todaySessionsData.dateFormatted}).`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="font-mono">
                    {todaySessionsData.sessions.filter((s) => s.status === "completed").length}{" "}
                    / {todaySessionsData.sessions.length} Completed
                  </span>
                </div>
              </div>

              {/* Sessions list */}
              <div className="space-y-3">
                {todaySessionsData.sessions.map((session) => (
                  <StudySessionCard
                    key={session.id}
                    session={session}
                    isPrioritySubject={
                      session.subject_id
                        ? prioritySubjectIds.includes(session.subject_id)
                        : false
                    }
                    onUpdateStatus={handleUpdateStatus}
                    onComplete={(s) => setCompletingSession(s)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ROW 3: Two Column Layout: Weekly Timeline & Subject Priorities */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Weekly Timeline & Detailed Schedule */}
            <div className="lg:col-span-7 space-y-6">
              <WeeklyTimeline
                days={daysGrouped}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                totalCompletedHours={progressStats.completedHours}
                totalPlannedHours={progressStats.totalHours}
                completionPercentage={progressStats.completionPercentage}
              />

              {/* Detailed Schedule for selected day or all days */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>
                      {selectedDate === null
                        ? "Full Schedule Overview"
                        : `Sessions for ${
                            daysGrouped.find((d) => d.dateStr === selectedDate)
                              ?.dayTitle || selectedDate
                          }`}
                    </span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {displayedScheduleDays.reduce(
                      (acc, d) => acc + d.sessions.length,
                      0
                    )}{" "}
                    sessions
                  </span>
                </div>

                {displayedScheduleDays.map((dayGroup) => (
                  <div
                    key={dayGroup.dateStr}
                    className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
                          {dayGroup.dayTitle}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          • {dayGroup.dateFormatted}
                        </span>
                        {dayGroup.isToday && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-600 text-white uppercase tracking-wider">
                            Today
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-semibold text-slate-500 font-mono">
                        {dayGroup.completedCount} / {dayGroup.totalCount} Done
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {dayGroup.sessions.map((session) => (
                        <StudySessionCard
                          key={session.id}
                          session={session}
                          isPrioritySubject={
                            session.subject_id
                              ? prioritySubjectIds.includes(session.subject_id)
                              : false
                          }
                          onUpdateStatus={handleUpdateStatus}
                          onComplete={(s) => setCompletingSession(s)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 5 Columns: Subject Priorities, Plan History & Insights */}
            <div className="lg:col-span-5 space-y-6">
              {/* Subject Priorities Card */}
              <SubjectPrioritiesCard
                subjects={context?.academic.subjects || []}
                sessions={activePlan.sessions || []}
                prioritySubjectIds={prioritySubjectIds}
              />

              {/* Plan Management & History */}
              {allPlans.length > 1 && (
                <div className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-500" />
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Previous Plans
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {allPlans.length - 1} archived
                    </span>
                  </div>

                  <div className="space-y-2">
                    {allPlans
                      .filter((p) => p.id !== activePlan.id)
                      .slice(0, 3)
                      .map((p) => {
                        const sessCount = p.sessions?.length || 0;
                        const doneCount =
                          p.sessions?.filter((s) => s.status === "completed")
                            .length || 0;
                        const pct =
                          sessCount > 0
                            ? Math.round((doneCount / sessCount) * 100)
                            : 0;

                        return (
                          <div
                            key={p.id}
                            className="p-3 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-bold text-slate-800 truncate max-w-[160px]">
                                {p.title}
                              </p>
                              <p className="text-[11px] text-slate-400 font-mono">
                                {p.start_date} → {p.end_date}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="font-mono font-bold text-slate-700">
                                {pct}%
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {doneCount}/{sessCount} sessions
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ROW 4: AI Plan Insights */}
          <AiPlanInsightsCard
            plan={activePlan}
            context={context}
            dailyHours={3}
            breakPreference="standard"
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* GENERATE / ADJUST STUDY PLAN MODAL                             */}
      {/* ============================================================== */}
      <GeneratePlanModal
        isOpen={isGeneratorOpen}
        isGenerating={isGenerating}
        onClose={() => setIsGeneratorOpen(false)}
        context={context}
        onGenerate={handleGeneratePlan}
      />

      {/* ============================================================== */}
      {/* SESSION COMPLETION MODAL                                       */}
      {/* ============================================================== */}
      <SessionCompletionModal
        session={completingSession}
        isOpen={Boolean(completingSession)}
        onClose={() => setCompletingSession(null)}
        onConfirm={handleConfirmCompletion}
      />

      {/* ============================================================== */}
      {/* DELETE PLAN CONFIRMATION MODAL                                 */}
      {/* ============================================================== */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Active Study Plan?"
        description="Are you sure you want to remove your current study plan? Scheduled sessions and progress for this plan will be deleted."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              Plan: <strong>{activePlan?.title}</strong> ({activePlan?.sessions?.length || 0} sessions). You can generate a new personalized plan at any time.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeletePlan}
              isLoading={isDeleting}
            >
              Delete Plan
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
