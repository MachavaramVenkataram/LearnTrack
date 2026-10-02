"use client";

import React, { useState, useId } from "react";
import Link from "next/link";
import {
  RotateCcw,
  Sparkles,
  Sliders,
  Database,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  PlusCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PredictionFeatureInput } from "@/types/academic";
import { ResetConfirmationModal } from "./ResetConfirmationModal";
import { cn } from "@/lib/utils";

export interface AcademicInputsCardProps {
  formData: PredictionFeatureInput;
  onChange: (field: keyof PredictionFeatureInput, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  onAutofillFromRecords: () => void;
  hasChanged: boolean;
  dataSource: "supabase" | "manual";
  hasAcademicRecords: boolean;
  latestRecordDate?: string | null;
  isLoading: boolean;
  isMLHealthy: boolean | null;
}

export function AcademicInputsCard({
  formData,
  onChange,
  onSubmit,
  onReset,
  onAutofillFromRecords,
  hasChanged,
  dataSource,
  hasAcademicRecords,
  latestRecordDate,
  isLoading,
  isMLHealthy,
}: AcademicInputsCardProps) {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Form field unique IDs for accessibility
  const attendanceId = useId();
  const internalId = useId();
  const previousId = useId();
  const assignmentScoreId = useId();
  const assignmentsCompletedId = useId();
  const studyHoursId = useId();

  // Inline validation logic
  const errors: Partial<Record<keyof PredictionFeatureInput, string>> = {};

  if (formData.attendance_percentage < 0 || formData.attendance_percentage > 100) {
    errors.attendance_percentage = "Attendance rate must be between 0% and 100%.";
  }

  if (formData.internal_marks < 0 || formData.internal_marks > 100) {
    errors.internal_marks = "Internal marks must be between 0 and 100.";
  }

  if (formData.previous_score < 0 || formData.previous_score > 100) {
    errors.previous_score = "Previous term score must be between 0 and 100.";
  }

  if (formData.assignment_score < 0 || formData.assignment_score > 100) {
    errors.assignment_score = "Assignment average must be between 0 and 100.";
  }

  if (
    formData.assignments_completed < 0 ||
    !Number.isInteger(Number(formData.assignments_completed))
  ) {
    errors.assignments_completed = "Assignments completed must be a non-negative integer.";
  }

  if (formData.study_hours < 0 || formData.study_hours > 168) {
    errors.study_hours = "Weekly study hours must be between 0 and 168 hours.";
  }

  const hasValidationErrors = Object.keys(errors).length > 0;

  const handleResetClick = () => {
    if (hasChanged) {
      setIsResetModalOpen(true);
    } else {
      onReset();
    }
  };

  // Institutional threshold rule check
  const isAttendanceBelowMin = formData.attendance_percentage < 75.0;

  return (
    <>
      <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white overflow-hidden transition-all duration-150">
        <CardHeader className="pb-4 border-b border-slate-100/90">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <Sliders className="w-4 h-4" />
                </span>
                Academic Inputs
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Current academic signals used by the model
              </CardDescription>
            </div>

            <button
              type="button"
              onClick={handleResetClick}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 transition-colors shrink-0"
              title="Reset academic inputs to baseline"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              Reset
            </button>
          </div>

          {/* Data Source & Freshness Metadata Banner (Sections 12, 31, 32, 33) */}
          <div className="mt-3.5 pt-3 border-t border-slate-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium text-[11px]">Data source:</span>
              {dataSource === "supabase" ? (
                <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-50/90 px-2 py-0.5 rounded-md text-[11px] border border-blue-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  Latest academic records
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-[11px] border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Manual inputs
                </span>
              )}

              {dataSource === "supabase" && latestRecordDate && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-300" />
                  Updated: {latestRecordDate}
                </span>
              )}
            </div>

            {hasAcademicRecords ? (
              <button
                type="button"
                onClick={onAutofillFromRecords}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors self-start sm:self-auto"
              >
                <Database className="w-3 h-3" />
                Use My Latest Academic Data
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span>No academic records available yet.</span>
                <Link
                  href="/subjects"
                  className="font-medium text-blue-600 hover:underline flex items-center gap-0.5"
                >
                  <PlusCircle className="w-3 h-3" /> Add Record
                </Link>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-5 space-y-6">
          <form onSubmit={onSubmit} className="space-y-6">
            {/* SECTION 1: ACADEMIC PERFORMANCE */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Academic Performance
                </span>
                <span className="text-[10.5px] text-slate-400">Standard range: 0–100</span>
              </div>

              {/* Attendance Rate */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <label htmlFor={attendanceId} className="flex items-center gap-1.5 cursor-pointer">
                    Attendance Rate
                    {isAttendanceBelowMin ? (
                      <span className="inline-flex items-center gap-0.5 text-[10.5px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-600" /> &lt;75% min
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10.5px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Eligible
                      </span>
                    )}
                  </label>
                  <span
                    className={cn(
                      "font-mono font-bold text-xs",
                      isAttendanceBelowMin ? "text-amber-600" : "text-blue-600"
                    )}
                  >
                    {formData.attendance_percentage}%
                  </span>
                </div>

                <div className="relative">
                  <input
                    id={attendanceId}
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formData.attendance_percentage}
                    onChange={(e) => onChange("attendance_percentage", e.target.value)}
                    className={cn(
                      "w-full h-12 px-3.5 rounded-[10px] text-sm text-slate-900 bg-white border font-medium transition-all duration-150 ease-out",
                      "focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10",
                      errors.attendance_percentage
                        ? "border-rose-400 bg-rose-50/20"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                    required
                    aria-describedby={`${attendanceId}-help`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                    %
                  </span>
                </div>

                {/* Subtle progress indicator bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      isAttendanceBelowMin ? "bg-amber-500" : "bg-blue-600"
                    )}
                    style={{
                      width: `${Math.min(100, Math.max(0, formData.attendance_percentage))}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <p id={`${attendanceId}-help`} className="text-slate-400">
                    Institutional minimum requirement is 75%.
                  </p>
                  {errors.attendance_percentage && (
                    <span className="text-rose-600 font-medium">
                      {errors.attendance_percentage}
                    </span>
                  )}
                </div>
              </div>

              {/* Internal Marks & Previous Term Score Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Internal Marks */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <label htmlFor={internalId} className="cursor-pointer">
                      Internal Assessment
                    </label>
                    <span className="font-mono font-bold text-xs text-blue-600">
                      {formData.internal_marks} / 100
                    </span>
                  </div>

                  <input
                    id={internalId}
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formData.internal_marks}
                    onChange={(e) => onChange("internal_marks", e.target.value)}
                    className={cn(
                      "w-full h-12 px-3.5 rounded-[10px] text-sm text-slate-900 bg-white border font-medium transition-all duration-150 ease-out",
                      "focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10",
                      errors.internal_marks
                        ? "border-rose-400 bg-rose-50/20"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                    required
                  />

                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(0, formData.internal_marks))}%`,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {errors.internal_marks ? (
                      <span className="text-rose-600 font-medium">{errors.internal_marks}</span>
                    ) : (
                      "Midterm & continuous assessments (0–100)."
                    )}
                  </p>
                </div>

                {/* Previous Term Score */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <label htmlFor={previousId} className="cursor-pointer">
                      Previous Term Score
                    </label>
                    <span className="font-mono font-bold text-xs text-blue-600">
                      {formData.previous_score} / 100
                    </span>
                  </div>

                  <input
                    id={previousId}
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formData.previous_score}
                    onChange={(e) => onChange("previous_score", e.target.value)}
                    className={cn(
                      "w-full h-12 px-3.5 rounded-[10px] text-sm text-slate-900 bg-white border font-medium transition-all duration-150 ease-out",
                      "focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10",
                      errors.previous_score
                        ? "border-rose-400 bg-rose-50/20"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                    required
                  />

                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(0, formData.previous_score))}%`,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {errors.previous_score ? (
                      <span className="text-rose-600 font-medium">{errors.previous_score}</span>
                    ) : (
                      "Prior semester baseline average (0–100)."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 2: COURSEWORK */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Coursework
                </span>
                <span className="text-[10.5px] text-slate-400">Assignments & practicals</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Assignment Average */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <label htmlFor={assignmentScoreId} className="cursor-pointer">
                      Assignment Average
                    </label>
                    <span className="font-mono font-bold text-xs text-blue-600">
                      {formData.assignment_score} / 100
                    </span>
                  </div>

                  <input
                    id={assignmentScoreId}
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formData.assignment_score}
                    onChange={(e) => onChange("assignment_score", e.target.value)}
                    className={cn(
                      "w-full h-12 px-3.5 rounded-[10px] text-sm text-slate-900 bg-white border font-medium transition-all duration-150 ease-out",
                      "focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10",
                      errors.assignment_score
                        ? "border-rose-400 bg-rose-50/20"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                    required
                  />

                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(0, formData.assignment_score))}%`,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {errors.assignment_score ? (
                      <span className="text-rose-600 font-medium">
                        {errors.assignment_score}
                      </span>
                    ) : (
                      "Coursework quality marks (0–100)."
                    )}
                  </p>
                </div>

                {/* Assignments Completed */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <label htmlFor={assignmentsCompletedId} className="cursor-pointer">
                      Assignments Completed
                    </label>
                    <span className="font-mono font-bold text-xs text-blue-600">
                      {formData.assignments_completed} units
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      id={assignmentsCompletedId}
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formData.assignments_completed}
                      onChange={(e) => onChange("assignments_completed", e.target.value)}
                      className={cn(
                        "w-full h-12 px-3.5 rounded-[10px] text-sm text-slate-900 bg-white border font-medium transition-all duration-150 ease-out",
                        "focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10",
                        errors.assignments_completed
                          ? "border-rose-400 bg-rose-50/20"
                          : "border-slate-200 hover:border-slate-300"
                      )}
                      required
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                      units
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {errors.assignments_completed ? (
                      <span className="text-rose-600 font-medium">
                        {errors.assignments_completed}
                      </span>
                    ) : (
                      "Submitted coursework tasks count."
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* SECTION 3: STUDY BEHAVIOR */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Study Behavior
                </span>
                <span className="text-[10.5px] text-slate-400">Time commitment</span>
              </div>

              {/* Weekly Focused Study Hours */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <label htmlFor={studyHoursId} className="cursor-pointer">
                    Weekly Focused Study Hours
                  </label>
                  <span className="font-mono font-bold text-xs text-blue-600">
                    {formData.study_hours} hrs / week
                  </span>
                </div>

                <div className="relative">
                  <input
                    id={studyHoursId}
                    type="number"
                    min="0"
                    max="168"
                    step="0.5"
                    value={formData.study_hours}
                    onChange={(e) => onChange("study_hours", e.target.value)}
                    className={cn(
                      "w-full h-12 px-3.5 rounded-[10px] text-sm text-slate-900 bg-white border font-medium transition-all duration-150 ease-out",
                      "focus:outline-hidden focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10",
                      errors.study_hours
                        ? "border-rose-400 bg-rose-50/20"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                    required
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                    hrs
                  </span>
                </div>

                <p className="text-[11px] text-slate-400">
                  {errors.study_hours ? (
                    <span className="text-rose-600 font-medium">{errors.study_hours}</span>
                  ) : (
                    "Self-directed revision and reading time outside classes."
                  )}
                </p>
              </div>
            </div>

            {/* Primary Action Button (Section 36) */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={hasValidationErrors || isLoading}
                isLoading={isLoading}
                className="w-full h-12 rounded-[10px] font-semibold text-sm shadow-md shadow-blue-500/10 hover:-translate-y-0.5 active:translate-y-0 transition-transform duration-150 justify-center"
                leftIcon={<Sparkles className="w-4 h-4 text-white" />}
              >
                {isLoading ? "Running Prediction..." : "Analyze My Performance"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Modal for Reset */}
      <ResetConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={onReset}
      />
    </>
  );
}
