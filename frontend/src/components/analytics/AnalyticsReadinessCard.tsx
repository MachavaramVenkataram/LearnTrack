"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  BookOpen,
  Award,
  CalendarCheck,
  Clock,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export interface CompletenessData {
  percentage: number;
  completedFields: number;
  totalFieldsChecked?: number;
  status: "complete" | "adequate" | "needs_records" | "incomplete";
  explanation?: string;
}

export interface AnalyticsReadinessCardProps {
  completeness: CompletenessData;
  hasSubjects: boolean;
  hasRecords: boolean;
  hasAttendance: boolean;
  hasActivities: boolean;
}

export function AnalyticsReadinessCard({
  completeness,
  hasSubjects,
  hasRecords,
  hasAttendance,
  hasActivities,
}: AnalyticsReadinessCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getStatusBadge = () => {
    switch (completeness.status) {
      case "complete":
        return (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            High Fidelity
          </span>
        );
      case "adequate":
        return (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Developing Profile
          </span>
        );
      default:
        return (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Needs More Records
          </span>
        );
    }
  };

  return (
    <Card className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-visible transition-all duration-150">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Analytics Readiness
              </span>
              <span className="font-mono text-base font-extrabold text-slate-900">
                {completeness.percentage}%
              </span>
              {getStatusBadge()}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              {completeness.explanation}
            </p>
          </div>

          {/* Action Menu / Dropdown (Section 38) */}
          <div className="relative shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="gap-2 text-xs font-semibold shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>Add More Records</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </Button>

            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute right-0 bottom-full sm:bottom-auto sm:top-full mb-2 sm:mb-0 sm:mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-elevated z-30 p-1.5 space-y-1 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <Link
                    href="/subjects"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>Register New Subject</span>
                  </Link>

                  <Link
                    href="/performance"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium"
                  >
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span>Add Academic Evaluation</span>
                  </Link>

                  <Link
                    href="/performance"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium"
                  >
                    <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Record Course Attendance</span>
                  </Link>

                  <Link
                    href="/study"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors font-medium"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Log Focused Study Session</span>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, completeness.percentage))}%` }}
          />
        </div>

        {/* 4 Pillars Checklist (Section 37) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            {hasSubjects ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-slate-300 shrink-0" />
            )}
            <span className={cn(hasSubjects ? "text-slate-800 font-medium" : "text-slate-400")}>
              Registered Subjects
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            {hasRecords ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-slate-300 shrink-0" />
            )}
            <span className={cn(hasRecords ? "text-slate-800 font-medium" : "text-slate-400")}>
              Academic Evaluations
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            {hasAttendance ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-slate-300 shrink-0" />
            )}
            <span className={cn(hasAttendance ? "text-slate-800 font-medium" : "text-slate-400")}>
              Verified Attendance
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-600">
            {hasActivities ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-slate-300 shrink-0" />
            )}
            <span className={cn(hasActivities ? "text-slate-800 font-medium" : "text-slate-400")}>
              Focused Study Logs
            </span>
          </div>
        </div>

        <p className="text-[10.5px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
          Formula: Populated parameters ({completeness.completedFields}) / Total structural parameters ({completeness.totalFieldsChecked}) across coursework, attendance, and study logs.
        </p>
      </CardContent>
    </Card>
  );
}
