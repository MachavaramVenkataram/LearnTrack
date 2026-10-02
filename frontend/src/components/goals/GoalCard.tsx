"use client";

import React, { useState } from "react";
import {
  Award,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Edit2,
  Trash2,
  CalendarClock,
  Check,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { AcademicGoal, GoalType, Subject } from "@/types/academic";

export interface GoalCardProps {
  goal: AcademicGoal;
  subjects: Subject[];
  onEdit: (goal: AcademicGoal) => void;
  onToggleStatus: (goal: AcademicGoal) => void;
  onDelete: (goal: AcademicGoal) => void;
}

export function GoalCard({
  goal,
  subjects,
  onEdit,
  onToggleStatus,
  onDelete,
}: GoalCardProps) {
  const [, setIsHovered] = useState(false);

  // Subject match if course-specific
  const subject = subjects.find((s) => s.id === goal.subject_id);

  // Progress calculation
  const progress =
    goal.target_value > 0
      ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
      : 0;

  // Deadline & Overdue calculation
  const hasDeadline = Boolean(goal.deadline);
  const deadlineDate = goal.deadline ? new Date(goal.deadline) : null;
  /* eslint-disable react-hooks/purity */
  const isOverdue =
    Boolean(deadlineDate && deadlineDate.getTime() < Date.now() && progress < 100);
  /* eslint-enable react-hooks/purity */

  // Computed Status
  let computedStatus: "completed" | "paused" | "overdue" | "on_track" | "needs_attention";
  if (goal.status === "completed" || progress >= 100) {
    computedStatus = "completed";
  } else if (goal.status === "paused") {
    computedStatus = "paused";
  } else if (isOverdue) {
    computedStatus = "overdue";
  } else if (progress >= 60 || (!deadlineDate && progress >= 40)) {
    computedStatus = "on_track";
  } else {
    computedStatus = "needs_attention";
  }

  // Remaining value calculation
  const remaining = Math.max(0, Math.round((goal.target_value - goal.current_value) * 10) / 10);

  // Format remaining text
  let remainingText = `${remaining} ${goal.unit || "points"} remaining`;
  if (progress >= 100 || remaining === 0) {
    remainingText = "Target reached";
  } else if (goal.goal_type === "attendance") {
    remainingText = `${remaining}% attendance needed`;
  } else if (goal.goal_type === "study_hours") {
    remainingText = `${remaining} hours remaining`;
  } else if (goal.goal_type === "assignments") {
    remainingText = `${remaining} assignments remaining`;
  }

  // Goal Type details (Icon, Label, Style)
  const getGoalTypeConfig = (type: GoalType) => {
    switch (type) {
      case "attendance":
        return {
          icon: Calendar,
          label: "ATTENDANCE TARGET",
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          text: "text-emerald-600",
        };
      case "study_hours":
        return {
          icon: Clock,
          label: "STUDY HOURS",
          bg: "bg-indigo-50",
          border: "border-indigo-100",
          text: "text-indigo-600",
        };
      case "subject_score":
        return {
          icon: BookOpen,
          label: "COURSE SCORE",
          bg: "bg-violet-50",
          border: "border-violet-100",
          text: "text-violet-600",
        };
      case "assignments":
        return {
          icon: CheckCircle2,
          label: "ASSIGNMENTS",
          bg: "bg-amber-50",
          border: "border-amber-100",
          text: "text-amber-600",
        };
      case "average_score":
      default:
        return {
          icon: Award,
          label: "AVERAGE / CGPA",
          bg: "bg-blue-50",
          border: "border-blue-100",
          text: "text-[#2563EB]",
        };
    }
  };

  const typeConfig = getGoalTypeConfig(goal.goal_type);
  const TypeIcon = typeConfig.icon;

  // Milestone points: 25%, 50%, 100%
  const m25 = Math.round(goal.target_value * 0.25 * 10) / 10;
  const m50 = Math.round(goal.target_value * 0.5 * 10) / 10;
  const is25Met = goal.current_value >= m25;
  const is50Met = goal.current_value >= m50;
  const isTargetMet = goal.current_value >= goal.target_value;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="p-5 sm:p-5.5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:border-[#CBD5E1] hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group"
    >
      {/* 1. Header Row */}
      <div className="space-y-3 pb-3.5 border-b border-slate-100">
        <div className="flex items-start justify-between gap-3">
          {/* Icon & Goal Type */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-[12px] ${typeConfig.bg} border ${typeConfig.border} flex items-center justify-center ${typeConfig.text} shrink-0 transition-transform duration-200 group-hover:scale-105`}
            >
              <TypeIcon className="w-5 h-5" />
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#64748B]">
                {typeConfig.label}
              </span>
              <h3 className="font-bold text-[15px] text-[#0F172A] leading-snug group-hover:text-[#2563EB] transition-colors">
                {goal.title}
              </h3>
            </div>
          </div>

          {/* Actions & Status Badge */}
          <div className="flex items-center gap-1.5">
            {/* Status Badge */}
            {computedStatus === "completed" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Check className="w-3 h-3" />
                Completed
              </span>
            )}
            {computedStatus === "on_track" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                On Track
              </span>
            )}
            {computedStatus === "needs_attention" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="w-3 h-3" />
                Needs Attention
              </span>
            )}
            {computedStatus === "overdue" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Overdue
              </span>
            )}
            {computedStatus === "paused" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                <PauseCircle className="w-3 h-3" />
                Paused
              </span>
            )}

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity ml-1">
              <button
                type="button"
                onClick={() => onToggleStatus(goal)}
                title={goal.status === "active" ? "Pause Goal" : "Resume Goal"}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {goal.status === "active" ? (
                  <PauseCircle className="w-3.5 h-3.5" />
                ) : (
                  <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                )}
              </button>
              <button
                type="button"
                onClick={() => onEdit(goal)}
                title="Edit Goal"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(goal)}
                title="Delete Goal"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Subject Reference & Description */}
        {(subject || goal.description) && (
          <div className="space-y-1">
            {subject && (
              <p className="text-xs font-semibold text-[#2563EB] flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {subject.subject_code ? `${subject.subject_code} • ` : ""}
                {subject.subject_name}
              </p>
            )}
            {goal.description && (
              <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                {goal.description}
              </p>
            )}
          </div>
        )}
      </div>

      {/* 2. Current vs Target Values */}
      <div className="py-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
              Current
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-[30px] font-bold text-[#0F172A] tracking-tight leading-none">
                {goal.current_value}
              </span>
              <span className="text-sm font-semibold text-slate-500">
                {goal.unit || ""}
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
              Target
            </span>
            <div className="flex items-baseline justify-end gap-1">
              <span className="text-base font-bold text-slate-700">
                {goal.target_value}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {goal.unit || ""}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600">Progress</span>
            <span
              className={`font-bold font-mono ${
                progress >= 100
                  ? "text-emerald-600"
                  : progress >= 60
                  ? "text-[#2563EB]"
                  : "text-amber-600"
              }`}
            >
              {progress}%
            </span>
          </div>

          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${
                progress >= 100
                  ? "bg-emerald-500"
                  : progress >= 60
                  ? "bg-[#2563EB]"
                  : "bg-amber-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Remaining Metric */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-slate-500 font-medium">
            {remainingText}
          </span>
          <span className="text-[11px] font-semibold text-slate-400 font-mono">
            Auto-synced
          </span>
        </div>
      </div>

      {/* 3. Milestones Strip */}
      <div className="py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100/90 grid grid-cols-3 gap-1.5 text-center text-[10.5px]">
        <div className="flex items-center justify-center gap-1 font-medium">
          {is25Met ? (
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-bold">
              ✓
            </span>
          ) : (
            <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[9px]">
              ○
            </span>
          )}
          <span className={is25Met ? "text-slate-800 font-semibold" : "text-slate-400"}>
            25% ({m25})
          </span>
        </div>

        <div className="flex items-center justify-center gap-1 font-medium">
          {is50Met ? (
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-bold">
              ✓
            </span>
          ) : (
            <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[9px]">
              ○
            </span>
          )}
          <span className={is50Met ? "text-slate-800 font-semibold" : "text-slate-400"}>
            50% ({m50})
          </span>
        </div>

        <div className="flex items-center justify-center gap-1 font-medium">
          {isTargetMet ? (
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[9px] font-bold">
              ✓
            </span>
          ) : (
            <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[9px]">
              ○
            </span>
          )}
          <span className={isTargetMet ? "text-emerald-700 font-bold" : "text-slate-400"}>
            Target ({goal.target_value})
          </span>
        </div>
      </div>

      {/* 4. Footer: Deadline & Action */}
      <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
          {hasDeadline && deadlineDate ? (
            <span className={isOverdue ? "text-rose-600 font-semibold" : "font-medium"}>
              {isOverdue ? "Overdue: " : "Due: "}
              {deadlineDate.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          ) : (
            <span className="text-slate-400">No deadline set</span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onEdit(goal)}
          className="text-xs font-semibold text-[#2563EB] hover:text-blue-700 flex items-center gap-1 group/btn cursor-pointer"
        >
          <span>Manage</span>
          <ArrowRight className="w-3 h-3 transition-transform duration-150 group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
