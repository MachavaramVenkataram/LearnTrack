"use client";

import React from "react";
import Link from "next/link";
import { Lightbulb, Plus, BookOpen, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function InsightsEmptyState() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-6 text-center space-y-6 bg-white rounded-2xl border border-slate-200/90 shadow-2xs">
      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
        <Lightbulb className="w-6 h-6 text-blue-600" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
          Build your academic history
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          LearnTrack Insights needs coursework records, attendance logs, or study activity to generate
          statistically grounded model explanations.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        <Link href="/subjects">
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Add Coursework Record
          </Button>
        </Link>
        <Link href="/study">
          <Button variant="outline" size="sm" leftIcon={<Clock className="w-4 h-4 text-blue-600" />}>
            Record Study Session
          </Button>
        </Link>
      </div>

      {/* Feature Unlock Checklist */}
      <div className="pt-6 border-t border-slate-100 max-w-md mx-auto text-left space-y-2.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
          What unlocks with your activity:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Performance trends</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Model predictions</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>SHAP feature contributions</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Personalized insights</span>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>What-If scenario simulations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
