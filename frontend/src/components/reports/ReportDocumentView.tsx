"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Sparkles,
  Target,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  CalendarCheck,
  Shield,
  Info,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Activity,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Subject,
  AcademicRecord,
  StudyActivity,
  AcademicGoal,
  PerformancePrediction,
  Student,
} from "@/types/academic";
import { ReportSectionsConfig } from "./ReportConfigPanel";
import { cn } from "@/lib/utils";

export interface AcademicInsightItem {
  type: "trend" | "strength" | "improvement" | "goal" | "recommendation";
  title: string;
  evidence: string;
}

export interface ReportDocumentViewProps {
  studentProfile: Student;
  studentName: string;
  scopeLabel: string;
  selectedScope: string;
  activeRecords: AcademicRecord[];
  subjects: Subject[];
  activities: StudyActivity[];
  goals: AcademicGoal[];
  latestPrediction: PerformancePrediction | null;
  avgScore: number | null;
  avgAttendance: number | null;
  cgpa: number | null;
  totalStudyHours: number;
  sectionsConfig: ReportSectionsConfig;
  insightsList: AcademicInsightItem[];
  generatedTimestamp: string;
}

export function ReportDocumentView({
  studentProfile,
  studentName,
  scopeLabel,
  selectedScope,
  activeRecords,
  subjects,
  activities,
  goals,
  latestPrediction,
  avgScore,
  avgAttendance,
  cgpa,
  totalStudyHours,
  sectionsConfig,
  insightsList,
  generatedTimestamp,
}: ReportDocumentViewProps) {
  // Zoom scaling for desktop document viewer
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [sortBy, setSortBy] = useState<"score" | "code" | "sem">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleZoomIn = () => setZoomScale((z) => Math.min(1.2, +(z + 0.1).toFixed(1)));
  const handleZoomOut = () => setZoomScale((z) => Math.max(0.8, +(z - 0.1).toFixed(1)));
  const handleZoomReset = () => setZoomScale(1.0);

  // Sorted records
  const sortedRecords = [...activeRecords].sort((a, b) => {
    if (sortBy === "score") {
      const valA = a.total_marks ?? 0;
      const valB = b.total_marks ?? 0;
      return sortOrder === "desc" ? valB - valA : valA - valB;
    }
    if (sortBy === "code") {
      const subA = subjects.find((s) => s.id === a.subject_id)?.subject_code || "";
      const subB = subjects.find((s) => s.id === b.subject_id)?.subject_code || "";
      return sortOrder === "desc" ? subB.localeCompare(subA) : subA.localeCompare(subB);
    }
    return sortOrder === "desc" ? b.semester - a.semester : a.semester - b.semester;
  });

  return (
    <div className="space-y-3">
      {/* 1. Document Control Bar above paper (Desktop) (Section 10 & 42) */}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-100/80 border border-slate-200/80 text-xs text-slate-600 print:hidden">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Document Status
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Verified & Ready
          </span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="text-slate-500 hidden sm:inline">
            Scope: <strong className="text-slate-700">{scopeLabel}</strong>
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="hidden lg:flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomScale <= 0.8}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomReset}
            className="px-2 h-6 text-[11px] font-mono font-medium text-slate-700 hover:bg-slate-50 rounded"
            title="Reset Zoom to 100%"
          >
            {Math.round(zoomScale * 100)}%
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomScale >= 1.2}
            className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Paper Canvas Container with Zoom Transform (Section 8) */}
      <div className="overflow-x-auto pb-4 transition-all">
        <div
          id="academic-report-document"
          style={{
            transform: zoomScale !== 1.0 ? `scale(${zoomScale})` : undefined,
            transformOrigin: "top center",
          }}
          className={cn(
            "w-full bg-white rounded-2xl border border-slate-200/90 shadow-[0_8px_30px_rgba(15,23,42,0.08)] p-6 sm:p-10 space-y-8 transition-transform duration-200",
            "print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none print:transform-none"
          )}
        >
          {/* Header with LearnTrack Branding (Section 9 & 50) */}
          <div className="relative border-b border-slate-200/90 pb-6 space-y-4">
            {/* Top decorative gradient hairline */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 rounded-full" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
                  <GraduationCap className="w-6 h-6 stroke-[2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold tracking-wider uppercase text-blue-600">
                      LearnTrack
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Dossier v1.0</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
                    Academic Performance Report
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Academic Intelligence & Evaluation Dossier
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right text-xs text-slate-500 space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/80">
                  <span className="text-slate-400">Scope:</span> {scopeLabel}
                </div>
                <p className="text-[11px]">
                  Generated: <strong className="text-slate-800 font-medium">{generatedTimestamp}</strong>
                </p>
                <div className="flex items-center sm:justify-end gap-1 text-[10px] text-emerald-600 font-medium">
                  <Shield className="w-3 h-3" />
                  <span>Authenticated & Isolated Dossier</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 01: STUDENT OVERVIEW (Section 11) */}
          {sectionsConfig.studentOverview && (
            <section id="section-overview" className="space-y-3 scroll-mt-6 break-inside-avoid">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="font-mono text-blue-600">01</span>
                  Student Overview
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Student Name
                  </span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block truncate">
                    {studentName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Roll / Registration No.
                  </span>
                  <span className="font-semibold text-slate-900 font-mono text-xs mt-0.5 block">
                    {studentProfile.roll_number || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Institution / University
                  </span>
                  <span className="font-medium text-slate-800 mt-0.5 block truncate">
                    {studentProfile.university || "University Campus"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Department / Major
                  </span>
                  <span className="font-medium text-slate-800 mt-0.5 block truncate">
                    {studentProfile.department || "Academic Department"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Academic Year
                  </span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    Year {studentProfile.year || 1}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Current Semester
                  </span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">
                    Semester {studentProfile.semester || 1}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* SECTION 02: ACADEMIC SUMMARY (Section 12 & 13) */}
          {sectionsConfig.academicSummary && (
            <section id="section-summary" className="space-y-3 scroll-mt-6 break-inside-avoid">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="font-mono text-blue-600">02</span>
                  Academic Summary
                </h2>
                <span className="text-[11px] text-slate-400 font-medium">
                  Across {activeRecords.length} evaluation{activeRecords.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 1. Average Score */}
                <Link
                  href="/analytics"
                  className="group p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-2xs transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                      Average Score
                    </span>
                    <TrendingUp className="w-3.5 h-3.5 text-blue-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
                      {avgScore !== null ? `${avgScore}%` : "—"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {avgScore !== null ? "Current academic average" : "No score data"}
                  </p>
                </Link>

                {/* 2. CGPA */}
                <Link
                  href="/performance"
                  className="group p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-2xs transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                      Cumulative CGPA
                    </span>
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-indigo-600 font-sans tracking-tight">
                      {cgpa !== null ? cgpa.toFixed(2) : "—"}
                    </span>
                    {cgpa !== null && <span className="text-xs text-slate-400 font-medium">/10.0</span>}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {cgpa !== null ? "Credit-weighted index" : "No CGPA records"}
                  </p>
                </Link>

                {/* 3. Average Attendance */}
                <Link
                  href="/analytics"
                  className="group p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-emerald-300 hover:shadow-2xs transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                      Attendance Rate
                    </span>
                    <CalendarCheck className="w-3.5 h-3.5 text-emerald-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-emerald-600 font-sans tracking-tight">
                      {avgAttendance !== null ? `${avgAttendance}%` : "—"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {avgAttendance !== null
                      ? avgAttendance >= 75
                        ? "Above 75% target"
                        : "Below 75% target"
                      : "No attendance data"}
                  </p>
                </Link>

                {/* 4. Study Hours */}
                <Link
                  href="/study"
                  className="group p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-amber-300 hover:shadow-2xs transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                      Study Hours
                    </span>
                    <Clock className="w-3.5 h-3.5 text-amber-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-amber-600 font-sans tracking-tight">
                      {totalStudyHours > 0 ? `${totalStudyHours}h` : "—"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {totalStudyHours > 0 ? `${activities.length} sessions logged` : "No sessions logged"}
                  </p>
                </Link>
              </div>
            </section>
          )}

          {/* SECTION 03: SUBJECT PERFORMANCE (Section 14, 15, 16) */}
          {sectionsConfig.subjectPerformance && (
            <section id="section-subjects" className="space-y-3 scroll-mt-6 break-inside-avoid">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="font-mono text-blue-600">03</span>
                    Subject Performance
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Evaluation records included in this academic report.
                  </p>
                </div>

                {/* Sorting Controls */}
                <div className="flex items-center gap-2 text-xs print:hidden">
                  <span className="text-slate-400 text-[11px]">Sort by:</span>
                  <select
                    aria-label="Sort subjects by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[11px] text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="score">Total Score</option>
                    <option value="code">Course Code</option>
                    <option value="sem">Semester</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                    className="h-7 px-2 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                    title="Toggle sort direction"
                  >
                    {sortOrder === "desc" ? "High to Low" : "Low to High"}
                  </button>
                </div>
              </div>

              {sortedRecords.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-700">
                      No academic records in this scope
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                      Add academic evaluation records in Performance to populate this report breakdown.
                    </p>
                  </div>
                  <Link href="/performance">
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      Add Academic Record
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3">Course</th>
                        <th className="py-2.5 px-3">Subject Name</th>
                        <th className="py-2.5 px-3">Sem</th>
                        <th className="py-2.5 px-3">Internal</th>
                        <th className="py-2.5 px-3">Assignments</th>
                        <th className="py-2.5 px-3">Exam</th>
                        <th className="py-2.5 px-3">Total</th>
                        <th className="py-2.5 px-3">Attendance</th>
                        <th className="py-2.5 px-3">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {sortedRecords.map((r) => {
                        const sub = subjects.find((s) => s.id === r.subject_id);
                        return (
                          <tr
                            key={r.id}
                            className="hover:bg-blue-50/20 transition-colors duration-100 group"
                          >
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-600">
                              {sub?.subject_code || "—"}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">
                              <Link
                                href={`/subjects/${r.subject_id}`}
                                className="hover:text-blue-600 transition-colors flex items-center gap-1"
                              >
                                {sub?.subject_name || "Course"}
                                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity print:hidden" />
                              </Link>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">Sem {r.semester}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">
                              {r.internal_marks ?? "—"}
                              <span className="text-[10px] text-slate-400">/30</span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">
                              {r.assignment_marks ?? "—"}
                              <span className="text-[10px] text-slate-400">/20</span>
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">
                              {r.exam_marks ?? "—"}
                              <span className="text-[10px] text-slate-400">/50</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-extrabold text-slate-900 font-sans">
                                {r.total_marks ?? "—"}%
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={cn(
                                  "font-medium",
                                  (r.attendance_percentage || 0) >= 75
                                    ? "text-emerald-700"
                                    : "text-amber-700 font-semibold"
                                )}
                              >
                                {r.attendance_percentage ?? "—"}%
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={cn(
                                  "inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 rounded text-[11px] font-extrabold font-mono",
                                  r.grade?.startsWith("A")
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : r.grade?.startsWith("B")
                                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                                )}
                              >
                                {r.grade || "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* SECTION 04: PERFORMANCE PROJECTION (ML) (Section 17, 18, 19, 20, 21) */}
          {sectionsConfig.mlProjection && (
            <section id="section-projection" className="space-y-3 scroll-mt-6 break-inside-avoid">
              <div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="font-mono text-blue-600">04</span>
                  Performance Projection
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Machine-learning estimate based on available academic inputs.
                </p>
              </div>

              {latestPrediction ? (
                <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-4">
                  {/* 3 Metric Projection Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-white border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Predicted Score
                      </span>
                      <span className="text-xl font-extrabold text-blue-600 font-sans mt-0.5 block">
                        {latestPrediction.predicted_score}%
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Evaluation projection
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Predicted Grade
                      </span>
                      <span className="text-xl font-extrabold text-slate-900 font-sans mt-0.5 block">
                        {latestPrediction.predicted_grade}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Letter grade band
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Risk Category
                      </span>
                      <span
                        className={cn(
                          "text-sm font-extrabold mt-1 block",
                          latestPrediction.risk_level === "Low"
                            ? "text-emerald-700"
                            : latestPrediction.risk_level === "Medium"
                            ? "text-amber-700"
                            : "text-rose-700"
                        )}
                      >
                        {latestPrediction.risk_level} Risk
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Academic intervention index
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-slate-200/70">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Model Version
                      </span>
                      <span className="text-xs font-mono font-semibold text-slate-700 mt-1 block">
                        {latestPrediction.model_version || "candidate-ridge-v1"}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Trained on student features
                      </span>
                    </div>
                  </div>

                  {/* SHAP Explanations if available */}
                  {latestPrediction.explanations && latestPrediction.explanations.length > 0 && (
                    <div className="pt-3 border-t border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">
                          Why this projection? Top Feature Influences
                        </span>
                        <span className="text-[10px] text-slate-400 italic">
                          Model contribution does not imply causation
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {latestPrediction.explanations.slice(0, 4).map((exp, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex items-start gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                            <div className="space-y-0.5">
                              <span className="font-semibold text-slate-900 leading-tight block">
                                {exp.label}
                              </span>
                              <p className="text-[11px] text-slate-500 leading-relaxed">
                                {exp.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scientific Disclaimer (Section 21) */}
                  <p className="text-[10px] text-slate-400 leading-relaxed pt-1">
                    * Predictions are statistical estimates generated from recorded academic data and
                    computational models. They do not guarantee future institutional outcomes.
                  </p>
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center space-y-2">
                  <p className="text-xs text-slate-500">
                    No machine-learning performance projections recorded for this profile.
                  </p>
                  <Link href="/prediction">
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      Run Performance Prediction
                    </Button>
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* SECTION 05: ACADEMIC GOALS (Section 22 & 23) */}
          {sectionsConfig.academicGoals && (
            <section id="section-goals" className="space-y-3 scroll-mt-6 break-inside-avoid">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="font-mono text-blue-600">05</span>
                    Academic Goals
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Target milestones and semester commitments.
                  </p>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">
                  {goals.length} target{goals.length !== 1 ? "s" : ""}
                </span>
              </div>

              {goals.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center space-y-2">
                  <p className="text-xs text-slate-500">
                    No active academic goals configured in your LearnTrack profile.
                  </p>
                  <Link href="/goals">
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      Configure Academic Goals
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {goals.map((g) => {
                    const currentVal = Number(g.current_value) || 0;
                    const targetVal = Number(g.target_value) || 100;
                    const progressPct = Math.min(100, Math.round((currentVal / targetVal) * 100));

                    return (
                      <div
                        key={g.id}
                        className="p-3.5 rounded-xl border border-slate-200/90 bg-white space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{g.title}</span>
                          <span className="font-mono text-xs font-bold text-blue-600">
                            {g.current_value} / {g.target_value}
                            {g.unit ? ` ${g.unit}` : ""}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              progressPct >= 100 ? "bg-emerald-500" : "bg-blue-600"
                            )}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span className="capitalize">
                            Status: <strong className="text-slate-700">{g.status}</strong>
                          </span>
                          <span>
                            Deadline:{" "}
                            <strong className="text-slate-700">
                              {g.deadline ? new Date(g.deadline).toLocaleDateString() : "Open"}
                            </strong>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* SECTION 06: ACADEMIC INSIGHTS (Section 24 & 25) */}
          {sectionsConfig.academicInsights && (
            <section id="section-insights" className="space-y-3 scroll-mt-6 break-inside-avoid">
              <div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="font-mono text-blue-600">06</span>
                  Academic Insights
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Evidence-based observations calculated from your academic telemetry.
                </p>
              </div>

              {insightsList.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center space-y-2">
                  <p className="text-xs text-slate-500">
                    Add coursework marks and study activity to establish personalized insights.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {insightsList.map((ins, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/40 space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded leading-none border",
                            ins.type === "strength"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : ins.type === "trend"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : ins.type === "improvement"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          )}
                        >
                          {ins.type}
                        </span>
                        <span className="font-bold text-slate-900 truncate">{ins.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{ins.evidence}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* DOCUMENT FOOTER & OFFICIAL ATTESTATION (Section 31 & 57) */}
          <div className="pt-6 border-t border-slate-200/90 space-y-3 break-inside-avoid">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-start gap-2 max-w-xl text-[11px] leading-relaxed">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Methodology Notice:</strong> Analytics and predictive scores presented in
                  this dossier are synthesized from student coursework evaluations, attendance logs,
                  and computational algorithms. This report reflects student status as of{" "}
                  <strong>{generatedTimestamp}</strong>.
                </span>
              </div>
              <div className="text-left sm:text-right text-[10px] text-slate-400 font-mono">
                <p>LearnTrack Platform</p>
                <p>Private Student Dossier</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
