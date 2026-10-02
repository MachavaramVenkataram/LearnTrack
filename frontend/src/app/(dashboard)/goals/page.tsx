"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Target,
  Plus,
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { AcademicGoal, GoalType, Subject } from "@/types/academic";
import {
  getAcademicGoals,
  updateAcademicGoal,
  deleteAcademicGoal,
  syncGoalProgressWithData,
  getSubjects,
} from "@/lib/academic/service";
import { CreateGoalModal } from "@/components/goals/CreateGoalModal";
import { GoalCard } from "@/components/goals/GoalCard";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export default function GoalsPage() {
  const { studentProfile, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [goals, setGoals] = useState<AcademicGoal[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"deadline" | "progress-desc" | "progress-asc" | "created">("deadline");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<AcademicGoal | null>(null);
  const [initialGoalType, setInitialGoalType] = useState<GoalType>("average_score");
  const [deleteTarget, setDeleteTarget] = useState<AcademicGoal | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load and sync data from real Supabase
  const loadGoalsAndSync = useCallback(async () => {
    if (!studentProfile) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      // 1. Sync real goal progress from academic records
      await syncGoalProgressWithData(studentProfile.id);
      // 2. Fetch updated goals and subjects
      const [fetchedGoals, fetchedSubjects] = await Promise.all([
        getAcademicGoals(studentProfile.id),
        getSubjects(studentProfile.id),
      ]);
      setGoals(fetchedGoals);
      setSubjects(fetchedSubjects);
    } catch (err: unknown) {
      console.error("Goals load error:", err);
      const message = err instanceof Error ? err.message : "Failed to load academic goals.";
      setLoadError(message);
      showToast("Error loading goals", message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [studentProfile, showToast]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (studentProfile) {
      timer = setTimeout(() => {
        void loadGoalsAndSync();
      }, 0);
    } else if (!authLoading) {
      timer = setTimeout(() => {
        setIsLoading(false);
      }, 0);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [studentProfile, authLoading, loadGoalsAndSync]);

  // Open Create Modal
  const handleOpenAdd = useCallback((preselectedType?: GoalType) => {
    setEditingGoal(null);
    setInitialGoalType(preselectedType || "average_score");
    setIsModalOpen(true);
  }, []);

  // Open modal if triggered via Command Center or URL param
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "add") {
        setTimeout(() => handleOpenAdd(), 0);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
    const handleCustomAction = (e: Event) => {
      const customEvent = e as CustomEvent<{ action?: string }>;
      if (customEvent.detail?.action === "add-goal") {
        handleOpenAdd();
      }
    };
    window.addEventListener("learntrack:open-action", handleCustomAction);
    return () => window.removeEventListener("learntrack:open-action", handleCustomAction);
  }, [handleOpenAdd]);

  // Open Edit Modal
  const handleOpenEdit = (goal: AcademicGoal) => {
    setEditingGoal(goal);
    setInitialGoalType(goal.goal_type);
    setIsModalOpen(true);
  };

  // Toggle Pause/Resume
  const handleToggleStatus = async (goal: AcademicGoal) => {
    const newStatus = goal.status === "active" ? "paused" : "active";
    try {
      const { error } = await updateAcademicGoal(goal.id, { status: newStatus });
      if (error) {
        showToast("Error updating status", error, "error");
      } else {
        showToast(
          newStatus === "active" ? "Goal resumed" : "Goal paused",
          `Target "${goal.title}" is now ${newStatus}.`,
          "info"
        );
        await loadGoalsAndSync();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error updating status";
      showToast("Error updating status", message, "error");
    }
  };

  // Delete Goal
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const success = await deleteAcademicGoal(deleteTarget.id);
      if (success) {
        showToast("Goal removed", "Target removed from your active workspace.", "info");
        setDeleteTarget(null);
        await loadGoalsAndSync();
      } else {
        showToast("Error deleting goal", "Unable to remove target.", "error");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error deleting goal";
      showToast("Error deleting goal", message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Summary Metrics calculated purely from real Supabase data
  const summaryMetrics = useMemo(() => {
    const total = goals.length;
    const active = goals.filter((g) => g.status === "active").length;
    const completed = goals.filter(
      (g) => g.status === "completed" || (g.target_value > 0 && g.current_value >= g.target_value)
    ).length;

    const onTrack = goals.filter((g) => {
      if (g.status !== "active") return false;
      const pct = g.target_value > 0 ? (g.current_value / g.target_value) * 100 : 0;
      return pct >= 50;
    }).length;

    const avgProgress =
      total > 0
        ? Math.round(
            goals.reduce((acc, g) => {
              const p = g.target_value > 0 ? Math.min(100, (g.current_value / g.target_value) * 100) : 0;
              return acc + p;
            }, 0) / total
          )
        : 0;

    return { total, active, completed, onTrack, avgProgress };
  }, [goals]);

  // Filtered & Sorted Goals
  const filteredGoals = useMemo(() => {
    let result = [...goals];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((g) => g.status === statusFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((g) => {
        const titleMatch = g.title.toLowerCase().includes(q);
        const descMatch = g.description?.toLowerCase().includes(q);
        const sub = subjects.find((s) => s.id === g.subject_id);
        const subMatch = sub ? sub.subject_name.toLowerCase().includes(q) || sub.subject_code?.toLowerCase().includes(q) : false;
        return titleMatch || descMatch || subMatch;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "deadline") {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (sortBy === "progress-desc") {
        const pA = a.target_value > 0 ? a.current_value / a.target_value : 0;
        const pB = b.target_value > 0 ? b.current_value / b.target_value : 0;
        return pB - pA;
      }
      if (sortBy === "progress-asc") {
        const pA = a.target_value > 0 ? a.current_value / a.target_value : 0;
        const pB = b.target_value > 0 ? b.current_value / b.target_value : 0;
        return pA - pB;
      }
      if (sortBy === "created") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    });

    return result;
  }, [goals, statusFilter, searchQuery, sortBy, subjects]);

  // Deterministic Goal Insights
  const goalInsights = useMemo(() => {
    const activeGoals = goals.filter((g) => g.status === "active");
    if (activeGoals.length === 0) return [];

    const insightsList: string[] = [];

    activeGoals.forEach((goal) => {
      const remaining = Math.round((goal.target_value - goal.current_value) * 10) / 10;
      if (remaining > 0) {
        if (goal.goal_type === "attendance") {
          insightsList.push(`Attendance target: You are currently ${remaining}% below your target of ${goal.target_value}%.`);
        } else if (goal.goal_type === "study_hours") {
          insightsList.push(`Study hours: ${remaining} additional hours needed to reach your goal of ${goal.target_value} hrs.`);
        } else if (goal.goal_type === "subject_score") {
          const sub = subjects.find((s) => s.id === goal.subject_id);
          insightsList.push(
            `Coursework for ${sub?.subject_name || "course"}: Requires ${remaining} marks to achieve target score of ${goal.target_value}%.`
          );
        } else {
          insightsList.push(
            `For "${goal.title}": Currently ${remaining} ${goal.unit || "points"} below target of ${goal.target_value}${goal.unit || ""}.`
          );
        }
      } else {
        insightsList.push(`Target reached for "${goal.title}" (${goal.current_value}${goal.unit || ""} achieved)!`);
      }
    });

    return insightsList.slice(0, 4);
  }, [goals, subjects]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 4 & 5. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-[#2563EB]">Goals</span>
          </div>

          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#0F172A] tracking-tight leading-tight">
            Academic Goals
          </h1>
          <p className="text-xs sm:text-[13px] text-[#64748B] max-w-xl leading-relaxed">
            Set measurable targets and track your academic progress toward them. Progress is automatically computed from your coursework evaluations and attendance.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/performance"
            className="h-[42px] px-4 rounded-[11px] bg-white border border-[#E2E8F0] text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC] hover:border-slate-300 transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <span>Performance</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            type="button"
            onClick={() => handleOpenAdd()}
            className="h-[42px] px-5 rounded-[11px] bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-soft-sm hover:shadow-soft-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 group cursor-pointer"
          >
            <Plus className="w-4 h-4 transition-transform duration-150 group-hover:rotate-90" />
            <span>Create Goal</span>
          </button>
        </div>
      </div>

      {/* 41. ERROR BANNER */}
      {loadError && !isLoading && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4 text-xs text-rose-800 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold text-rose-900">Unable to load your goals</p>
              <p className="text-rose-700 mt-0.5">{loadError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadGoalsAndSync}
            className="bg-white text-rose-700 border border-rose-300 hover:bg-rose-100/50 px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* 10. SUMMARY METRICS STRIP (When goals exist) */}
      {goals.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 animate-in fade-in duration-200">
          <div className="p-4.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-soft-md transition-all duration-200">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Active Goals
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Target className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-[26px] font-bold text-[#0F172A] tracking-tight leading-none">
              {summaryMetrics.active}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              Across current semester
            </p>
          </div>

          <div className="p-4.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-soft-md transition-all duration-200">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                On Track
              </span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-[26px] font-bold text-emerald-700 tracking-tight leading-none">
              {summaryMetrics.onTrack}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              &gt; 50% target progress
            </p>
          </div>

          <div className="p-4.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-soft-md transition-all duration-200">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Completed
              </span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-[26px] font-bold text-[#0F172A] tracking-tight leading-none">
              {summaryMetrics.completed}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              Targets achieved
            </p>
          </div>

          <div className="p-4.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-soft-md transition-all duration-200">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Avg Progress
              </span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-[26px] font-bold text-[#0F172A] tracking-tight leading-none">
              {summaryMetrics.avgProgress}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              Mean goal completion
            </p>
          </div>
        </div>
      )}

      {/* 7, 8, 9. CONTROLS, TABS & LIVE STATUS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm">
        {/* Compact Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          {[
            { id: "all", label: "All Goals", count: goals.length },
            { id: "active", label: "Active", count: goals.filter((g) => g.status === "active").length },
            { id: "completed", label: "Completed", count: goals.filter((g) => g.status === "completed").length },
            { id: "paused", label: "Paused", count: goals.filter((g) => g.status === "paused").length },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-[9px] transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#EFF6FF] text-[#2563EB] shadow-2xs font-bold border border-blue-200/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? "bg-blue-100 text-[#2563EB]" : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Search, Sorting & Live Status */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Input (Only when goals exist) */}
          {goals.length > 0 && (
            <div className="relative flex-1 md:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search goals..."
                className="w-full h-[36px] pl-8.5 pr-3 bg-slate-50 border border-[#E2E8F0] rounded-[9px] text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
          )}

          {/* Sort Dropdown */}
          {goals.length > 0 && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "deadline" | "progress-desc" | "progress-asc" | "created")}
              className="h-[36px] px-2.5 bg-slate-50 border border-[#E2E8F0] rounded-[9px] text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#2563EB] cursor-pointer"
            >
              <option value="deadline">Sort: Deadline</option>
              <option value="progress-desc">Sort: Highest Progress</option>
              <option value="progress-asc">Sort: Lowest Progress</option>
              <option value="created">Sort: Newest</option>
            </select>
          )}

          {/* 9. Live Status Indicator */}
          <div
            className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0 select-none ml-auto md:ml-0"
            title="Goal progress updates from your academic records."
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold text-slate-600">Live progress</span>
          </div>
        </div>
      </div>

      {/* 40. LOADING STATE SKELETON */}
      {isLoading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-white border border-slate-200/80 p-4 space-y-2">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-7 w-14 bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-white border border-slate-200/80 p-5 space-y-4">
                <div className="flex justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-200" />
                  <div className="w-16 h-6 rounded-full bg-slate-100" />
                </div>
                <div className="h-5 w-3/4 bg-slate-200 rounded" />
                <div className="h-10 w-1/2 bg-slate-100 rounded" />
                <div className="h-2 w-full bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : goals.length === 0 ? (
        /* 28, 29, 30. COMPACT ONBOARDING EMPTY STATE (< 340px) WITH TEMPLATES */
        <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-white border border-dashed border-[#CBD5E1] shadow-2xs text-center space-y-5 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto border border-blue-100 shadow-2xs group hover:-translate-y-0.5 transition-transform duration-200">
            <Target className="w-6 h-6 transition-transform duration-200 group-hover:scale-105" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Set your first academic goal
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Turn your academic plans into measurable targets and track your progress automatically from continuous evaluations.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => handleOpenAdd()}
              className="h-[42px] px-5 rounded-[11px] bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs shadow-soft-sm hover:shadow-soft-md hover:-translate-y-0.5 active:translate-y-0 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Goal</span>
            </button>
          </div>

          {/* 30. Quick Start Templates */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
              Quick Start Templates
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
              {[
                { type: "average_score" as GoalType, label: "CGPA Target", icon: Award },
                { type: "attendance" as GoalType, label: "Attendance Target", icon: Calendar },
                { type: "study_hours" as GoalType, label: "Study Hours Goal", icon: Clock },
                { type: "subject_score" as GoalType, label: "Subject Score", icon: BookOpen },
              ].map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.type}
                    type="button"
                    onClick={() => handleOpenAdd(template.type)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-[#EFF6FF] border border-slate-200/80 hover:border-blue-200 text-slate-700 hover:text-[#2563EB] transition-all flex items-center gap-2 group cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2563EB] shrink-0" />
                    <span className="text-xs font-semibold truncate">{template.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : filteredGoals.length === 0 ? (
        /* Filter returned no matches */
        <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
          <p className="text-sm font-semibold text-slate-700">No goals matching &quot;{searchQuery || statusFilter}&quot;</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        /* 11 & 12. 2-COLUMN GOAL CARDS GRID */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-300">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              subjects={subjects}
              onEdit={handleOpenEdit}
              onToggleStatus={handleToggleStatus}
              onDelete={(g) => setDeleteTarget(g)}
            />
          ))}
        </div>
      )}

      {/* 34, 35, 36, 37. GOAL PROGRESS INTELLIGENCE PANEL */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white border border-blue-100 shadow-soft-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-[#2563EB] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">
                Goal Progress Intelligence
              </h3>
              <p className="text-xs text-slate-500">
                Your active targets are automatically updated from your latest academic records and study logs.
              </p>
            </div>
          </div>

          <Link
            href="/simulator"
            className="h-[36px] px-3.5 rounded-[9px] bg-white border border-blue-200/90 text-xs font-semibold text-[#2563EB] hover:bg-blue-50 hover:border-blue-300 transition-all flex items-center gap-1.5 self-start sm:self-center shadow-2xs group cursor-pointer"
          >
            <span>What-If Simulator</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Real Insight bullets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
          {goalInsights.length === 0 ? (
            <div className="p-3 rounded-xl bg-white/80 border border-slate-200/60 text-slate-500 col-span-2">
              Create active academic goals to generate deterministic milestone comparisons and progress pacing.
            </div>
          ) : (
            goalInsights.map((insight, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white/80 border border-blue-100/80 text-slate-700 flex items-start gap-2 shadow-2xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                <span className="leading-relaxed">{insight}</span>
              </div>
            ))
          )}
        </div>

        {/* Transparency note */}
        <div className="pt-2 text-[11px] text-slate-400 border-t border-blue-100/70">
          Progress syncs whenever coursework evaluations, attendance logs, or study sessions are saved. Targets are student-directed benchmarks.
        </div>
      </div>

      {/* CREATE / EDIT GOAL MODAL */}
      <CreateGoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        studentId={studentProfile?.id}
        subjects={subjects}
        editingGoal={editingGoal}
        initialGoalType={initialGoalType}
        onSuccess={loadGoalsAndSync}
      />

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Academic Goal?"
        description="Are you sure you want to delete this target? Associated progress tracking will be permanently removed."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              Target: <strong>{deleteTarget?.title}</strong> ({deleteTarget?.target_value} {deleteTarget?.unit}). This action cannot be undone.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete Goal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
