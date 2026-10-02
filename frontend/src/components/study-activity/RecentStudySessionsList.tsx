"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  Trash2,
  CheckCircle2,
  Search,
  BookOpen,
  Filter,
} from "lucide-react";
import { StudyActivity } from "@/types/academic";
import { cn } from "@/lib/utils";

export interface RecentStudySessionsListProps {
  activities: StudyActivity[];
  onDeleteSession: (activity: StudyActivity) => void;
}

export function RecentStudySessionsList({
  activities,
  onDeleteSession,
}: RecentStudySessionsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(8);

  const filteredActivities = useMemo(() => {
    if (!searchQuery.trim()) return activities;
    const q = searchQuery.toLowerCase();
    return activities.filter((act) => {
      const notes = (act.notes || "").toLowerCase();
      const date = act.study_date.toLowerCase();
      return notes.includes(q) || date.includes(q);
    });
  }, [activities, searchQuery]);

  const visibleActivities = filteredActivities.slice(0, displayCount);
  const hasMore = filteredActivities.length > displayCount;

  if (activities.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-5 sm:p-6 space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <span>Recent Study Sessions</span>
            <span className="text-xs font-semibold text-[#64748B] bg-slate-100 px-2 py-0.5 rounded-full">
              {activities.length}
            </span>
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Chronological audit of logged focused learning sessions.
          </p>
        </div>

        {activities.length > 3 && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topics or dates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        )}
      </div>

      {/* List Rows */}
      {visibleActivities.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#64748B]">
          No sessions matching &quot;{searchQuery}&quot;
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {visibleActivities.map((act) => {
            const hours = Number(act.study_hours) || 0;
            const wholeHours = Math.floor(hours);
            const minutes = Math.round((hours - wholeHours) * 60);
            const durationStr =
              wholeHours > 0 && minutes > 0
                ? `${wholeHours}h ${minutes}m`
                : wholeHours > 0
                ? `${wholeHours}h`
                : `${minutes}m`;

            // Extract subject tag if exists [Subject]
            const notes = (act.notes || "").trim();
            const tagMatch = notes.match(/^\[(.*?)\]/);
            const subjectTag = tagMatch ? tagMatch[1] : null;
            const cleanNotes = tagMatch ? notes.replace(/^\[.*?\]\s*/, "") : notes;

            const isToday =
              act.study_date.split("T")[0] === new Date().toISOString().split("T")[0];

            return (
              <div
                key={act.id}
                className="py-3 px-2 sm:px-3 -mx-2 sm:-mx-3 rounded-xl hover:bg-[#F8FAFC] transition-colors duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left: Info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5 border border-blue-100/60">
                    <BookOpen className="w-4 h-4 stroke-[1.8]" />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {subjectTag && (
                        <span className="text-[11px] font-semibold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/70">
                          {subjectTag}
                        </span>
                      )}

                      <span className="text-xs font-semibold text-[#0F172A] truncate">
                        {cleanNotes || "Focused Study Session"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-[#94A3B8]" />
                        {isToday ? "Today" : new Date(act.study_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>

                      {act.assignments_completed > 0 && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {act.assignments_completed} task{act.assignments_completed > 1 ? "s" : ""}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Badges & Action */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto pl-11 sm:pl-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-[#2563EB] border border-blue-100/80">
                      {durationStr}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/80">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Completed
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteSession(act)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                    title="Delete session"
                    aria-label="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Show more button */}
      {hasMore && (
        <div className="pt-2 text-center border-t border-slate-100">
          <button
            onClick={() => setDisplayCount((prev) => prev + 10)}
            className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer"
          >
            Show more recorded sessions ({filteredActivities.length - displayCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
