"use client";

import React from "react";
import {
  Clock,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  BookOpen,
  Check,
  Flame,
} from "lucide-react";
import { StudyPlanSession, SessionStatus } from "@/types/academic";

interface StudySessionCardProps {
  session: StudyPlanSession;
  isPrioritySubject?: boolean;
  onUpdateStatus: (session: StudyPlanSession, newStatus: SessionStatus) => void;
  onComplete: (session: StudyPlanSession) => void;
}

export function StudySessionCard({
  session,
  isPrioritySubject = false,
  onUpdateStatus,
  onComplete,
}: StudySessionCardProps) {
  const isCompleted = session.status === "completed";
  const isInProgress = session.status === "in_progress";
  const isSkipped = session.status === "skipped";

  // Format start time and end time if possible
  const startTime = session.start_time || "09:00";
  const duration = session.duration_minutes || 60;

  // Compute estimated end time
  const [startH, startM] = startTime.split(":").map(Number);
  let timeRangeText = startTime;
  if (!isNaN(startH) && !isNaN(startM)) {
    const totalMinutes = startH * 60 + startM + duration;
    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    timeRangeText = `${startTime} — ${pad(endH)}:${pad(endM)}`;
  }

  return (
    <div
      className={`group relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
        isCompleted
          ? "bg-emerald-50/30 border-emerald-200/70 text-slate-800"
          : isInProgress
          ? "bg-amber-50/30 border-amber-300 ring-2 ring-amber-400/20 shadow-soft-sm"
          : isSkipped
          ? "bg-slate-50/60 border-slate-200 text-slate-400 opacity-60"
          : "bg-white border-[#E2E8F0] hover:border-blue-200 hover:shadow-soft-sm hover:-translate-y-0.5"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Info Column */}
        <div className="space-y-2 flex-1 min-w-0">
          {/* Metadata badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200/80">
              <Clock className="w-3 h-3 text-slate-400" />
              {timeRangeText}
            </span>

            <span className="text-[11px] font-semibold text-slate-500 font-mono">
              {duration}m
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100">
              <BookOpen className="w-3 h-3 text-blue-500" />
              {session.subject_name || "General Coursework"}
            </span>

            {isPrioritySubject && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-amber-50 text-amber-700 border border-amber-200">
                <Flame className="w-3 h-3 text-amber-500" />
                High Priority
              </span>
            )}

            {/* Status indicator pill */}
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200">
                <Check className="w-3 h-3 text-emerald-600" />
                Completed
              </span>
            ) : isInProgress ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                In Progress
              </span>
            ) : isSkipped ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                Skipped
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Upcoming
              </span>
            )}
          </div>

          {/* Session Topic Headline */}
          <div>
            <h3
              className={`text-[15px] font-bold tracking-tight leading-snug ${
                isCompleted
                  ? "line-through text-slate-500"
                  : "text-[#0F172A] group-hover:text-[#2563EB] transition-colors"
              }`}
            >
              {session.topic}
            </h3>

            {session.activity && (
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                <span className="font-semibold text-slate-700">Activity: </span>
                {session.activity}
              </p>
            )}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {!isCompleted && !isSkipped && (
            <>
              {/* Start / Pause button */}
              <button
                type="button"
                onClick={() =>
                  onUpdateStatus(session, isInProgress ? "upcoming" : "in_progress")
                }
                className={`h-9 px-3.5 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isInProgress
                    ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300"
                    : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300"
                }`}
                title={isInProgress ? "Pause session" : "Start session"}
              >
                {isInProgress ? (
                  <>
                    <PauseCircle className="w-3.5 h-3.5 text-amber-700" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-3.5 h-3.5 text-blue-600" />
                    <span>Start</span>
                  </>
                )}
              </button>

              {/* Complete button */}
              <button
                type="button"
                onClick={() => onComplete(session)}
                className="h-9 px-3.5 rounded-[10px] text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white flex items-center gap-1.5 shadow-2xs hover:shadow-soft-sm transition-all cursor-pointer"
                title="Mark session as completed"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Complete</span>
              </button>

              {/* Skip button */}
              <button
                type="button"
                onClick={() => onUpdateStatus(session, "skipped")}
                className="h-9 px-2.5 rounded-[10px] text-xs font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Skip this session"
              >
                Skip
              </button>
            </>
          )}

          {isCompleted && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Completed
              </span>
              <button
                type="button"
                onClick={() => onUpdateStatus(session, "upcoming")}
                className="text-[11px] text-slate-400 hover:text-slate-700 underline transition-colors cursor-pointer ml-1"
                title="Reopen session"
              >
                Undo
              </button>
            </div>
          )}

          {isSkipped && (
            <button
              type="button"
              onClick={() => onUpdateStatus(session, "upcoming")}
              className="h-8 px-3 rounded-[9px] text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Restore
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
