"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  GraduationCap,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Percent,
  TrendingUp,
  Award,
  ChevronRight,
  ArrowRight,
  LayoutGrid,
  List,
  X,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpDown,
  FilePlus2,
  Activity,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { AddSubjectModal } from "@/components/subjects/AddSubjectModal";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { Subject, AcademicRecord } from "@/types/academic";
import {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  getAcademicRecords,
  createAcademicRecord,
} from "@/lib/academic/service";
import {
  calculateWeightedTotal,
  determineGradeAndPoint,
  calculateAverageScore,
  calculateAverageAttendance,
  generateDeterministicInsights,
} from "@/lib/academic/calculations";
import { validateSubject, validateAcademicRecord } from "@/lib/validations/academic";

export default function SubjectsPage() {
  const { studentProfile, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Search, Filters & View Mode
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name-asc" | "name-desc" | "sem-asc" | "sem-desc" | "score-desc" | "credits-desc">("name-asc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Subject Modal State (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick Add Record Modal State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [quickRecordSubject, setQuickRecordSubject] = useState<Subject | null>(null);
  const [recordAcademicYear, setRecordAcademicYear] = useState("2025-2026");
  const [recordSemester, setRecordSemester] = useState("1");
  const [recordAttendance, setRecordAttendance] = useState("85");
  const [recordAssignments, setRecordAssignments] = useState("80");
  const [recordInternal, setRecordInternal] = useState("75");
  const [recordExam, setRecordExam] = useState("78");
  const [recordFormErrors, setRecordFormErrors] = useState<Record<string, string>>({});
  const [isSavingRecord, setIsSavingRecord] = useState(false);

  // Auto-calculated score preview in Quick Record modal
  const computedRecordTotal = useMemo(() => {
    const i = parseFloat(recordInternal) || 0;
    const a = parseFloat(recordAssignments) || 0;
    const e = parseFloat(recordExam) || 0;
    return calculateWeightedTotal(i, a, e);
  }, [recordInternal, recordAssignments, recordExam]);

  const computedRecordGrade = useMemo(() => {
    return determineGradeAndPoint(computedRecordTotal);
  }, [computedRecordTotal]);

  // Fetch real subjects & records from Supabase
  const loadData = useCallback(async () => {
    if (!studentProfile) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const [subjectsData, recordsData] = await Promise.all([
        getSubjects(studentProfile.id),
        getAcademicRecords(studentProfile.id),
      ]);
      setSubjects(subjectsData || []);
      setRecords(recordsData || []);
    } catch (err: any) {
      console.error("[Subjects] Error loading subjects and records:", err);
      setLoadError(err?.message || "Failed to load subjects from database.");
      showToast("Error loading subjects", err?.message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [studentProfile, showToast]);

  useEffect(() => {
    if (studentProfile) {
      loadData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [studentProfile, authLoading, loadData]);

  // Open modal for Create Subject
  const handleOpenAdd = useCallback(() => {
    setEditingSubject(null);
    setIsModalOpen(true);
  }, []);

  // Open modal if triggered via Command Center or URL param
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "add") {
        handleOpenAdd();
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
    const handleCustomAction = (e: any) => {
      if (e.detail?.action === "add-subject") {
        handleOpenAdd();
      }
    };
    window.addEventListener("learntrack:open-action", handleCustomAction);
    return () => window.removeEventListener("learntrack:open-action", handleCustomAction);
  }, [handleOpenAdd]);

  // Open modal for Edit Subject
  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  // Open Quick Add Record modal for a specific subject
  const handleOpenQuickRecord = (subject: Subject) => {
    setQuickRecordSubject(subject);
    setRecordAcademicYear("2025-2026");
    setRecordSemester(String(subject.semester || 1));
    setRecordAttendance("85");
    setRecordAssignments("80");
    setRecordInternal("75");
    setRecordExam("78");
    setRecordFormErrors({});
    setIsRecordModalOpen(true);
  };

  // Save Quick Academic Record
  const handleSaveQuickRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentProfile || !quickRecordSubject) return;

    const payload = {
      student_id: studentProfile.id,
      subject_id: quickRecordSubject.id,
      academic_year: recordAcademicYear,
      semester: Number(recordSemester),
      attendance_percentage: Number(recordAttendance),
      assignment_marks: Number(recordAssignments),
      internal_marks: Number(recordInternal),
      exam_marks: Number(recordExam),
      total_marks: computedRecordTotal,
      grade: computedRecordGrade.grade,
      grade_point: computedRecordGrade.gradePoint,
    };

    const validation = validateAcademicRecord(payload);
    if (!validation.isValid) {
      setRecordFormErrors(validation.errors);
      return;
    }

    setIsSavingRecord(true);
    setRecordFormErrors({});

    try {
      const { error } = await createAcademicRecord(payload);
      if (error) {
        showToast("Error saving record", error, "error");
      } else {
        showToast("Record logged.", `Academic score saved for ${quickRecordSubject.subject_name}.`, "success");
        setIsRecordModalOpen(false);
        await loadData();
      }
    } catch (err: any) {
      showToast("Failed to save score.", err?.message, "error");
    } finally {
      setIsSavingRecord(false);
    }
  };

  // Confirm Delete Subject
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const success = await deleteSubject(deleteTarget.id);
      if (!success) {
        showToast("Error deleting subject", "Could not remove subject from database.", "error");
      } else {
        showToast("Subject deleted.", `${deleteTarget.subject_name} was removed from your roster.`, "success");
        setDeleteTarget(null);
        await loadData();
      }
    } catch (err: any) {
      showToast("Deletion failed", err?.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Map latest academic record by subject
  const subjectRecordsMap = useMemo(() => {
    const map = new Map<string, AcademicRecord>();
    // Sort descending by semester so latest is picked
    const sorted = [...records].sort((a, b) => b.semester - a.semester);
    sorted.forEach((r) => {
      if (!map.has(r.subject_id)) {
        map.set(r.subject_id, r);
      }
    });
    return map;
  }, [records]);

  // Real Calculated Summary Metrics
  const summary = useMemo(() => {
    const totalSubjects = subjects.length;
    const semesters = Array.from(new Set(subjects.map((s) => s.semester)));
    const avgScore = calculateAverageScore(records);
    const avgAttendance = calculateAverageAttendance(records);

    return {
      totalSubjects,
      uniqueSemesters: semesters.length,
      currentSemester: studentProfile?.semester || (semesters.length > 0 ? Math.max(...semesters) : 1),
      avgScore,
      avgAttendance,
    };
  }, [subjects, records, studentProfile]);

  // Subject Intelligence / Snapshots
  const intelligenceSnapshot = useMemo(() => {
    if (records.length === 0 || subjects.length === 0) return null;

    const subjectsWithScores = subjects
      .map((s) => {
        const rec = subjectRecordsMap.get(s.id);
        return {
          subject: s,
          record: rec,
          score: rec ? Number(rec.total_marks) || 0 : null,
          attendance: rec ? Number(rec.attendance_percentage) || 0 : null,
          grade: rec ? rec.grade : null,
        };
      })
      .filter((item) => item.score !== null) as Array<{
        subject: Subject;
        record: AcademicRecord;
        score: number;
        attendance: number;
        grade: string;
      }>;

    if (subjectsWithScores.length === 0) return null;

    const sortedByScore = [...subjectsWithScores].sort((a, b) => b.score - a.score);
    const topPerforming = sortedByScore[0];
    const lowestPerforming = sortedByScore[sortedByScore.length - 1];

    const lowAttendanceList = subjectsWithScores.filter((item) => item.attendance < 75);

    return {
      topPerforming,
      lowestPerforming: sortedByScore.length > 1 && lowestPerforming.score < topPerforming.score ? lowestPerforming : null,
      lowAttendanceCount: lowAttendanceList.length,
      subjectsWithScoresCount: subjectsWithScores.length,
    };
  }, [subjects, records, subjectRecordsMap]);

  // Deterministic Insights
  const deterministicInsights = useMemo(() => {
    if (records.length === 0 && subjects.length === 0) return [];
    return generateDeterministicInsights(records, subjects, []);
  }, [records, subjects]);

  // Filter & Search
  const filteredSubjects = useMemo(() => {
    return subjects
      .filter((s) => {
        const query = searchQuery.toLowerCase().trim();
        const matchSearch =
          !query ||
          s.subject_name.toLowerCase().includes(query) ||
          (s.subject_code && s.subject_code.toLowerCase().includes(query)) ||
          `semester ${s.semester}`.includes(query) ||
          `sem ${s.semester}`.includes(query);

        const matchSemester =
          selectedSemester === "all" || String(s.semester) === selectedSemester;

        return matchSearch && matchSemester;
      })
      .sort((a, b) => {
        const recA = subjectRecordsMap.get(a.id);
        const recB = subjectRecordsMap.get(b.id);
        const scoreA = recA ? Number(recA.total_marks) || 0 : -1;
        const scoreB = recB ? Number(recB.total_marks) || 0 : -1;

        if (sortBy === "name-asc") return a.subject_name.localeCompare(b.subject_name);
        if (sortBy === "name-desc") return b.subject_name.localeCompare(a.subject_name);
        if (sortBy === "sem-asc") return a.semester - b.semester;
        if (sortBy === "sem-desc") return b.semester - a.semester;
        if (sortBy === "score-desc") return scoreB - scoreA;
        if (sortBy === "credits-desc") return (b.credits || 0) - (a.credits || 0);
        return 0;
      });
  }, [subjects, searchQuery, selectedSemester, sortBy, subjectRecordsMap]);

  const availableSemesters = useMemo(() => {
    return Array.from(new Set(subjects.map((s) => s.semester))).sort((a, b) => a - b);
  }, [subjects]);

  const hasActiveFilters = searchQuery.trim() !== "" || selectedSemester !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedSemester("all");
  };

  const getGradeBadgeVariant = (grade: string) => {
    if (grade === "A+" || grade === "A")
      return "bg-emerald-50 text-emerald-700 border-emerald-200/90";
    if (grade === "B+" || grade === "B")
      return "bg-blue-50 text-blue-700 border-blue-200/90";
    if (grade === "C" || grade === "D")
      return "bg-amber-50 text-amber-700 border-amber-200/90";
    return "bg-rose-50 text-rose-700 border-rose-200/90";
  };

  // Profile required screen
  if (!authLoading && !studentProfile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
          <span>Workspace</span>
          <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
          <span className="text-blue-600">Subjects</span>
        </div>
        <Card className="p-8 text-center max-w-lg mx-auto border-blue-100 bg-white shadow-soft-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Set Up Your Student Profile First</h3>
          <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
            Before adding subjects, please complete your academic onboarding so records are mapped to your university and department.
          </p>
          <Link href="/onboarding">
            <Button variant="primary" size="md">
              Complete Onboarding
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[#F8FAFC] min-h-screen pb-16">
      {/* 4. REDESIGNED PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/70">
        <div>
          {/* Breadcrumb: WORKSPACE / SUBJECTS */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            <span>Workspace</span>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            <span className="text-blue-600">Subjects</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Subjects
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manage courses, semesters, performance tracking, and academic records.
          </p>
        </div>

        {/* 6. Primary Action Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />}
            onClick={handleOpenAdd}
            className="h-[42px] px-4 rounded-[10px] bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs shadow-soft-sm hover:-translate-y-0.5 hover:shadow-soft-md transition-all duration-200 group"
          >
            Add Subject
          </Button>
        </div>
      </div>

      {/* 35. ERROR STATE */}
      {loadError && !isLoading && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4 text-xs text-rose-800">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold text-rose-900">Unable to load subjects</p>
              <p className="text-rose-700 mt-0.5">{loadError}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="bg-white text-rose-700 border-rose-300 hover:bg-rose-100/50 shrink-0 font-semibold"
          >
            Retry
          </Button>
        </div>
      )}

      {/* 34. LOADING SKELETON STATE */}
      {isLoading ? (
        <div className="space-y-6 animate-pulse">
          {/* Summary Strip Skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-white border border-slate-200/80 p-4 space-y-2">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-7 w-14 bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 rounded-2xl bg-white border border-slate-200/80 p-5 space-y-4">
                <div className="flex justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-200" />
                  <div className="w-12 h-6 rounded bg-slate-100" />
                </div>
                <div className="h-5 w-3/4 bg-slate-200 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
                <div className="h-2 w-full bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : subjects.length === 0 ? (
        /* 7, 8, 9 & 45. COMPACT EMPTY ONBOARDING STATE (Max 300px height, dashed border) */
        <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-white border border-dashed border-[#CBD5E1] shadow-2xs text-center space-y-4 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto border border-blue-100 shadow-2xs group hover:-translate-y-0.5 transition-transform duration-200">
            <BookOpen className="w-6 h-6 transition-transform duration-200 group-hover:scale-105" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              No subjects registered yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Add your first academic subject to start tracking coursework performance, attendance logs, and predictive ML insights.
            </p>
          </div>

          {/* 3-Step Progression Visual */}
          <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto text-left text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
              <span className="font-bold text-blue-900 text-[10px] block">01 STEP</span>
              <span className="font-semibold text-blue-800 text-[11px]">Add Subjects</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="font-bold text-slate-400 text-[10px] block">02 STEP</span>
              <span className="font-semibold text-slate-600 text-[11px]">Record Scores</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="font-bold text-slate-400 text-[10px] block">03 STEP</span>
              <span className="font-semibold text-slate-600 text-[11px]">Unlock Insights</span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleOpenAdd}
              className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs h-[42px] px-5 rounded-xl shadow-soft-sm"
            >
              Add First Subject
            </Button>
          </div>
        </div>
      ) : (
        /* WHEN SUBJECTS EXIST — COMPLETE SAAS WORKSPACE */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 10 & 11. SUMMARY STRIP */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Subjects */}
            <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-soft-md transition-all duration-200 group">
              <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
                <span className="uppercase tracking-wider text-[11px]">Total Subjects</span>
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight font-sans">
                  {summary.totalSubjects}
                </span>
                <span className="text-xs text-slate-400 font-semibold">Registered</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Across {summary.uniqueSemesters} semester{summary.uniqueSemesters !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Card 2: Current Semester */}
            <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-soft-md transition-all duration-200 group">
              <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
                <span className="uppercase tracking-wider text-[11px]">Current Semester</span>
                <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight font-sans">
                  Semester {summary.currentSemester}
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Active coursework term
              </p>
            </div>

            {/* Card 3: Average Score */}
            <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-soft-md transition-all duration-200 group">
              <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
                <span className="uppercase tracking-wider text-[11px]">Average Score</span>
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Percent className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight font-sans">
                  {summary.avgScore !== null ? `${summary.avgScore}%` : "—"}
                </span>
                {summary.avgScore !== null && (
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      summary.avgScore >= 75
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-amber-700 bg-amber-50"
                    }`}
                  >
                    {summary.avgScore >= 75 ? "Optimal" : "Attention"}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                {records.length > 0 ? "Coursework evaluations" : "No evaluations logged yet"}
              </p>
            </div>

            {/* Card 4: Average Attendance */}
            <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-soft-md transition-all duration-200 group">
              <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
                <span className="uppercase tracking-wider text-[11px]">Attendance</span>
                <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight font-sans">
                  {summary.avgAttendance !== null ? `${summary.avgAttendance}%` : "—"}
                </span>
                {summary.avgAttendance !== null && (
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      summary.avgAttendance >= 75
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-rose-700 bg-rose-50"
                    }`}
                  >
                    {summary.avgAttendance >= 75 ? "Healthy (≥75%)" : "Below 75%"}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Institutional target: 75%
              </p>
            </div>
          </div>

          {/* 12, 13, 14, 15 & 16. SEARCH, FILTERS & VIEW TOGGLE TOOLBAR */}
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-[#E2E8F0] shadow-soft-sm space-y-2">
            <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
              {/* 13. Instant Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search subjects or course codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9.5 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters & View Toggle */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Semester Filter */}
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Semesters</option>
                  {availableSemesters.map((sem) => (
                    <option key={sem} value={String(sem)}>
                      Semester {sem}
                    </option>
                  ))}
                </select>

                {/* Sort Selector */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none cursor-pointer"
                >
                  <option value="name-asc">Name (A–Z)</option>
                  <option value="name-desc">Name (Z–A)</option>
                  <option value="sem-asc">Semester (Low to High)</option>
                  <option value="sem-desc">Semester (High to Low)</option>
                  <option value="score-desc">Performance (High to Low)</option>
                  <option value="credits-desc">Credits (High to Low)</option>
                </select>

                {/* 16. View Toggle (Grid / List) */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === "grid"
                        ? "bg-white text-blue-600 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                    title="Grid view"
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === "list"
                        ? "bg-white text-blue-600 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                    title="List view"
                    aria-label="List view"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-100 text-xs">
                <span className="text-[11px] font-semibold text-slate-400">Active filters:</span>

                {searchQuery && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                    Search: &ldquo;{searchQuery}&rdquo;
                    <button onClick={() => setSearchQuery("")} className="hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedSemester !== "all" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                    Semester {selectedSemester}
                    <button onClick={() => setSelectedSemester("all")} className="hover:text-blue-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 ml-1 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* MAIN SUBJECTS DISPLAY (Grid or List) */}
          {filteredSubjects.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl bg-white border border-slate-200/90 shadow-soft-sm">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No matching subjects</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No registered subjects match your search or semester filter.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* 17, 18, 19 & 20. SUBJECT CARDS (GRID VIEW) */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSubjects.map((sub) => {
                const rec = subjectRecordsMap.get(sub.id);
                const hasScore = rec !== undefined && rec.total_marks !== null;
                const score = hasScore ? Number(rec.total_marks) || 0 : null;
                const attendance = hasScore ? Number(rec.attendance_percentage) || 0 : null;
                const grade = hasScore ? rec.grade : null;

                return (
                  <div
                    key={sub.id}
                    className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:-translate-y-1 hover:border-blue-300 hover:shadow-soft-md transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div className="space-y-3.5">
                      {/* Top Header: Icon + Subject Info + Action Menu */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 truncate">
                          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-blue-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <Link href={`/subjects/${sub.id}`} className="block truncate">
                              <h3 className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                {sub.subject_name}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {sub.subject_code ? (
                                <span className="text-[11px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                  {sub.subject_code}
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-400">No code</span>
                              )}
                              <span className="text-slate-300">•</span>
                              <span className="text-[11px] text-slate-500 font-medium">
                                Sem {sub.semester}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Top Actions: Edit, Delete, Quick Record */}
                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => handleOpenQuickRecord(sub)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Add Academic Record for this subject"
                            aria-label="Add Academic Record"
                          >
                            <FilePlus2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(sub)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Subject"
                            aria-label="Edit Subject"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(sub)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Subject"
                            aria-label="Delete Subject"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 21 & 22. PERFORMANCE & ATTENDANCE SECTION */}
                      {hasScore ? (
                        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/70 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Performance</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 font-mono text-sm">
                                {score}%
                              </span>
                              {grade && (
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getGradeBadgeVariant(
                                    grade
                                  )}`}
                                >
                                  {grade}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                (score || 0) >= 80
                                  ? "bg-blue-600"
                                  : (score || 0) >= 65
                                  ? "bg-blue-500"
                                  : "bg-amber-500"
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, score || 0))}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-0.5 text-slate-500">
                            <span>Attendance</span>
                            <span
                              className={`font-semibold ${
                                (attendance || 0) >= 75 ? "text-emerald-700" : "text-rose-600"
                              }`}
                            >
                              {attendance}% {(attendance || 0) >= 75 ? "• Healthy" : "• Low"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-50/70 border border-dashed border-slate-200 text-xs flex items-center justify-between">
                          <div className="text-slate-400 text-[11px]">
                            No coursework evaluation logged
                          </div>
                          {/* 25. Quick Action Button */}
                          <button
                            onClick={() => handleOpenQuickRecord(sub)}
                            className="font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 text-[11px]"
                          >
                            + Log Score
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                      <span className="font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        {sub.credits} Credits
                      </span>

                      <Link
                        href={`/subjects/${sub.id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        View subject <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 29. SUBJECT LIST VIEW (TABLE) */
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-3">Code</th>
                    <th className="py-3 px-3">Sem</th>
                    <th className="py-3 px-3">Credits</th>
                    <th className="py-3 px-3">Performance</th>
                    <th className="py-3 px-3">Grade</th>
                    <th className="py-3 px-3">Attendance</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredSubjects.map((sub) => {
                    const rec = subjectRecordsMap.get(sub.id);
                    const hasScore = rec !== undefined && rec.total_marks !== null;
                    const score = hasScore ? Number(rec.total_marks) || 0 : null;
                    const attendance = hasScore ? Number(rec.attendance_percentage) || 0 : null;
                    const grade = hasScore ? rec.grade : null;

                    return (
                      <tr key={sub.id} className="hover:bg-[#F8FAFC] transition-colors group">
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          <Link
                            href={`/subjects/${sub.id}`}
                            className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                          >
                            {sub.subject_name}
                          </Link>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-500">
                          {sub.subject_code || "—"}
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-600 font-mono">
                          S{sub.semester}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">{sub.credits}</td>
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-900">
                          {score !== null ? `${score}%` : "—"}
                        </td>
                        <td className="py-3.5 px-3">
                          {grade ? (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getGradeBadgeVariant(
                                grade
                              )}`}
                            >
                              {grade}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          {attendance !== null ? (
                            <span
                              className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                                attendance >= 75
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {attendance}%
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenQuickRecord(sub)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Add Academic Record"
                              aria-label="Add Record"
                            >
                              <FilePlus2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(sub)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit Subject"
                              aria-label="Edit Subject"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(sub)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Subject"
                              aria-label="Delete Subject"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 30, 31 & 55. SUBJECT INTELLIGENCE SNAPSHOT & AI INSIGHTS (Only when data exists) */}
          {intelligenceSnapshot && (
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Subject Intelligence & Insights
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Academic trajectory and course standing calculated from your continuous evaluation data.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Snapshot Card 1: Top Performing */}
                <Card className="border-[#E2E8F0] shadow-soft-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <Award className="w-3.5 h-3.5" />
                      <span>Top Performing Course</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs pt-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {intelligenceSnapshot.topPerforming.subject.subject_name}
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {intelligenceSnapshot.topPerforming.subject.subject_code || "Core Subject"}
                        </span>
                      </div>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {intelligenceSnapshot.topPerforming.score}% ({intelligenceSnapshot.topPerforming.grade})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Highest recorded coursework evaluation score in your active academic profile.
                    </p>
                  </CardContent>
                </Card>

                {/* Snapshot Card 2: Focus Opportunity or Attendance Status */}
                <Card className="border-[#E2E8F0] shadow-soft-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                      <Activity className="w-3.5 h-3.5" />
                      <span>Focus & Attendance Standing</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs pt-1">
                    {intelligenceSnapshot.lowestPerforming ? (
                      <>
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {intelligenceSnapshot.lowestPerforming.subject.subject_name}
                            </div>
                            <span className="text-[11px] font-mono text-slate-400">
                              {intelligenceSnapshot.lowestPerforming.subject.subject_code || "Core Subject"}
                            </span>
                          </div>
                          <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {intelligenceSnapshot.lowestPerforming.score}%
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          Lowest evaluation score recorded. Prioritizing revision here will accelerate CGPA growth.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="font-bold text-slate-900">Attendance Healthy</div>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          All registered subjects meet or exceed the institutional 75% attendance requirement.
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Snapshot Card 3: Deterministic Insight & Link */}
                <Card className="border-[#E2E8F0] shadow-soft-sm flex flex-col justify-between">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Automated Observation</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2.5 text-xs pt-1">
                    {deterministicInsights.length > 0 ? (
                      <div>
                        <div className="font-bold text-slate-900 text-xs">
                          {deterministicInsights[0].title}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {deterministicInsights[0].description}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400">
                        Continue recording test marks to generate automated observations.
                      </p>
                    )}

                    <Link
                      href="/insights"
                      className="font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 pt-1 text-[11px]"
                    >
                      View AI Insights Hub <ArrowRight className="w-3 h-3" />
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 38. PREMIUM REDESIGNED ADD / EDIT SUBJECT MODAL */}
      <AddSubjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSubject(null);
        }}
        studentId={studentProfile?.id}
        editingSubject={editingSubject}
        defaultSemester={studentProfile?.semester || 1}
        onSuccess={loadData}
      />

      {/* 25. QUICK ADD ACADEMIC RECORD MODAL (Directly from subject card) */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title={`Log Score: ${quickRecordSubject?.subject_name || "Course"}`}
        description="Add continuous assessment evaluations and attendance marks for this course."
      >
        <form onSubmit={handleSaveQuickRecord} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Academic Year"
              id="recordYear"
              placeholder="e.g. 2025-2026"
              value={recordAcademicYear}
              onChange={(e) => setRecordAcademicYear(e.target.value)}
              error={recordFormErrors.academic_year}
              required
            />

            <Select
              label="Semester"
              id="recordSem"
              value={recordSemester}
              onChange={(e) => setRecordSemester(e.target.value)}
              options={[
                { value: "1", label: "Semester 1" },
                { value: "2", label: "Semester 2" },
                { value: "3", label: "Semester 3" },
                { value: "4", label: "Semester 4" },
                { value: "5", label: "Semester 5" },
                { value: "6", label: "Semester 6" },
                { value: "7", label: "Semester 7" },
                { value: "8", label: "Semester 8" },
              ]}
              error={recordFormErrors.semester}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Attendance %"
              id="quickAttendance"
              type="number"
              min="0"
              max="100"
              value={recordAttendance}
              onChange={(e) => setRecordAttendance(e.target.value)}
              error={recordFormErrors.attendance_percentage}
              required
            />

            <Input
              label="Assignments"
              id="quickAssignments"
              type="number"
              min="0"
              max="100"
              value={recordAssignments}
              onChange={(e) => setRecordAssignments(e.target.value)}
              error={recordFormErrors.assignment_marks}
              required
            />

            <Input
              label="Internal"
              id="quickInternal"
              type="number"
              min="0"
              max="100"
              value={recordInternal}
              onChange={(e) => setRecordInternal(e.target.value)}
              error={recordFormErrors.internal_marks}
              required
            />

            <Input
              label="Exam Marks"
              id="quickExam"
              type="number"
              min="0"
              max="100"
              value={recordExam}
              onChange={(e) => setRecordExam(e.target.value)}
              error={recordFormErrors.exam_marks}
              required
            />
          </div>

          {/* Computed Evaluation Preview */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-slate-800">Computed Evaluation</span>
              <p className="text-[11px] text-slate-500">
                Internal (30%) + Assignments (20%) + Exam (50%)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 font-mono text-sm">
                {computedRecordTotal} / 100
              </span>
              <span className="font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {computedRecordGrade.grade} ({computedRecordGrade.gradePoint} GP)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsRecordModalOpen(false)}
              disabled={isSavingRecord}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSavingRecord}
              className="bg-[#2563EB] hover:bg-blue-700"
            >
              Save Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* 40. DELETE CONFIRMATION DIALOG */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete this academic subject?"
        description="This subject and any associated continuous evaluation scores will be permanently removed."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              Subject: <strong>{deleteTarget?.subject_name}</strong> ({deleteTarget?.subject_code || "No code"}).
              This may affect associated academic records and CGPA calculations. This action cannot be undone.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
            >
              Delete Subject
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
