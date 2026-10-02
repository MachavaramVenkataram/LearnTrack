"use client";

import React from "react";
import Link from "next/link";
import { Plus, CalendarClock, BarChart3, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface StudyActivityHeaderProps {
  onOpenLogModal: () => void;
  hasActivities: boolean;
}

export function StudyActivityHeader({
  onOpenLogModal,
  hasActivities,
}: StudyActivityHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-[#E2E8F0]/70">
      {/* Left: Breadcrumbs & Title */}
      <div className="space-y-1.5">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-[#64748B] uppercase">
          <Link href="/dashboard" className="hover:text-[#2563EB] transition-colors">
            Workspace
          </Link>
          <ChevronRight className="w-3 h-3 text-[#94A3B8]" />
          <span className="text-[#0F172A] font-bold">Study Activity</span>
        </nav>

        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-blue-100/80 flex items-center justify-center text-[#2563EB] shadow-2xs transition-transform duration-200 hover:-translate-y-0.5 cursor-default shrink-0"
            title="Study Activity Intelligence"
          >
            <CalendarClock className="w-5 h-5 stroke-[2]" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight flex items-center gap-2.5">
              <span>Study Activity</span>
              {hasActivities && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100/80">
                  Live Cadence
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5 leading-normal">
              Track your study sessions, learning consistency, and academic habits.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
        <Link href="/analytics">
          <Button
            variant="outline"
            size="sm"
            className="h-[42px] px-3.5 rounded-xl border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#0F172A] text-xs font-semibold"
            leftIcon={<BarChart3 className="w-3.5 h-3.5 text-[#64748B]" />}
          >
            View Analytics
          </Button>
        </Link>

        <button
          onClick={onOpenLogModal}
          className="group inline-flex items-center gap-2 h-[42px] px-4 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-[13px] font-semibold shadow-xs hover:shadow-md transition-all duration-180 hover:-translate-y-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
        >
          <Plus className="w-4 h-4 transition-transform duration-180 group-hover:rotate-90 group-hover:scale-110" />
          <span>Log Study Session</span>
        </button>
      </div>
    </div>
  );
}
