"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { StudyPlanSession } from "@/types/academic";

interface SubjectPriorityItem {
  id: string;
  name: string;
  code?: string;
  credits: number;
  score?: number | null;
  plannedSessionsCount: number;
  isPlanPriority: boolean;
  priorityLevel: "High" | "Medium" | "Standard";
  reason: string;
}

interface SubjectPrioritiesCardProps {
  subjects: Array<{
    id: string;
    name: string;
    code?: string;
    credits: number;
    score?: number | null;
  }>;
  sessions: StudyPlanSession[];
  prioritySubjectIds: string[];
}

export function SubjectPrioritiesCard({
  subjects,
  sessions,
  prioritySubjectIds,
}: SubjectPrioritiesCardProps) {
  // Compute prioritized list based strictly on real student data
  const priorityItems: SubjectPriorityItem[] = subjects.map((sub) => {
    const plannedCount = sessions.filter(
      (s) => s.subject_id === sub.id || s.subject_name?.toLowerCase() === sub.name.toLowerCase()
    ).length;

    const isPlanPriority = prioritySubjectIds.includes(sub.id);
    const score = sub.score;

    let priorityLevel: "High" | "Medium" | "Standard" = "Standard";
    let reason = "Core coursework";

    if (score !== null && score !== undefined && score < 70) {
      priorityLevel = "High";
      reason = `Assessment score (${score}%) below target threshold`;
    } else if (isPlanPriority) {
      priorityLevel = "High";
      reason = "Designated priority focus course";
    } else if (score !== null && score !== undefined && score < 80) {
      priorityLevel = "Medium";
      reason = `Maintaining ${score}% performance`;
    } else if (sub.credits >= 4) {
      priorityLevel = "Medium";
      reason = `High credit weight (${sub.credits} credits)`;
    }

    return {
      id: sub.id,
      name: sub.name,
      code: sub.code,
      credits: sub.credits,
      score,
      plannedSessionsCount: plannedCount,
      isPlanPriority,
      priorityLevel,
      reason,
    };
  });

  // Sort: High priority first, then by lowest score
  priorityItems.sort((a, b) => {
    const levelOrder = { High: 3, Medium: 2, Standard: 1 };
    if (levelOrder[a.priorityLevel] !== levelOrder[b.priorityLevel]) {
      return levelOrder[b.priorityLevel] - levelOrder[a.priorityLevel];
    }
    const scoreA = a.score ?? 100;
    const scoreB = b.score ?? 100;
    return scoreA - scoreB;
  });

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
              Subject Priorities
            </h3>
            <p className="text-xs text-[#64748B]">
              Ordered by assessment performance & credit impact
            </p>
          </div>
        </div>

        <Link
          href="/subjects"
          className="text-xs font-semibold text-[#2563EB] hover:text-blue-700 flex items-center gap-1 group/link"
        >
          <span>All Subjects</span>
          <ArrowRight className="w-3 h-3 transition-transform group-hover/link:translate-x-0.5" />
        </Link>
      </div>

      {priorityItems.length === 0 ? (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-center text-xs text-slate-500">
          No registered subjects found.{" "}
          <Link href="/subjects" className="text-blue-600 font-semibold underline">
            Register courses
          </Link>{" "}
          to enable intelligent prioritization.
        </div>
      ) : (
        <div className="space-y-2.5">
          {priorityItems.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all space-y-2 group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                      {item.name}
                    </span>
                    {item.code && (
                      <span className="text-[10px] font-mono text-slate-400">
                        ({item.code})
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {item.reason}
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-1.5">
                  {item.priorityLevel === "High" ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                      High Focus
                    </span>
                  ) : item.priorityLevel === "Medium" ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Moderate
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                      Standard
                    </span>
                  )}
                </div>
              </div>

              {/* Metrics strip */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/50 text-slate-500 font-mono">
                <span>
                  Current Score:{" "}
                  <strong className="text-slate-700">
                    {item.score !== null && item.score !== undefined ? `${item.score}%` : "Pending"}
                  </strong>
                </span>
                <span>
                  {item.plannedSessionsCount} session{item.plannedSessionsCount !== 1 ? "s" : ""}{" "}
                  scheduled
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
