"use client";

import React from "react";
import { Clock, Plus, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface StudyActivityEmptyStateProps {
  onOpenLogModal: () => void;
}

export function StudyActivityEmptyState({ onOpenLogModal }: StudyActivityEmptyStateProps) {
  const steps = [
    {
      num: "01",
      title: "Log a session",
      desc: "Record your focused study duration and coursework subject.",
    },
    {
      num: "02",
      title: "Track consistency",
      desc: "Watch your 30-day learning heatmap and streaks build.",
    },
    {
      num: "03",
      title: "Improve your routine",
      desc: "Inspect subject time allocation and study cadence insights.",
    },
  ];

  return (
    <div className="max-w-[420px] mx-auto py-8 px-4 text-center space-y-6">
      {/* Icon & Message */}
      <div className="space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] mx-auto shadow-2xs">
          <Clock className="w-6 h-6 stroke-[2]" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
            Start tracking your learning
          </h3>
          <p className="text-xs text-[#64748B] leading-relaxed max-w-sm mx-auto">
            Log your study sessions to understand your learning consistency, subject focus, and academic progress.
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            className="h-10 px-5 rounded-xl font-semibold shadow-xs"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={onOpenLogModal}
          >
            Log First Study Session
          </Button>
        </div>
      </div>

      {/* Quick Start Guide */}
      <div className="pt-5 border-t border-slate-200/80 text-left space-y-3">
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748B]">
          QUICK START
        </div>

        <div className="space-y-2">
          {steps.map((s) => (
            <div
              key={s.num}
              className="p-2.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs flex items-start gap-3"
            >
              <span className="text-xs font-mono font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/70 shrink-0">
                {s.num}
              </span>
              <div className="min-w-0 space-y-0.5">
                <div className="text-xs font-semibold text-[#0F172A]">{s.title}</div>
                <div className="text-[11px] text-[#64748B] leading-normal">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
