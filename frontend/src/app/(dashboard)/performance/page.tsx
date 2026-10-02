"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  BookOpen,
  Calendar,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  BarChart2,
  Percent,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Award,
  ArrowRight,
  ArrowUpDown,
  SlidersHorizontal,
  ExternalLink,
  Brain,
  RefreshCw,
  X,
  ChevronLeft,
  Activity,
  Layers,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { AcademicRecord, Subject } from "@/types/academic";
import {
  getSubjects,
  getAcademicRecords,
  createAcademicRecord,
  updateAcademicRecord,
  deleteAcademicRecord,
} from "@/lib/academic/service";
import {
  calculateWeightedTotal,
  determineGradeAndPoint,
  calculateAverageScore,
  calculateCGPA,
  calculateAverageAttendance,
  calculatePerformanceTrend,
  calculateGradeDistribution,
  calculateSubjectPerformance,
  generateDeterministicInsights,
  calculateDataCompleteness,
} from "@/lib/academic/calculations";
import { validateAcademicRecord } from "@/lib/validations/academic";
import { predictPerformance, MLPredictionResponse } from "@/lib/api/ml";

export default function PerformancePage() {
  const { studentProfile, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ML Prediction state (real FastAPI XGBoost model)
  const [prediction, setPrediction] = useState<MLPredictionResponse | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Search & Filter Toolbar
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"score-desc" | "score-asc" | "sem-desc" | "sem-asc">("sem-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Trend Chart Timeframe / Grouping
  const [chartSemesterFilter, setChartSemesterFilter] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AcademicRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AcademicRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [subjectId, setSubjectId] = useState("");
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [semester, setSemester] = useState("1");
  const [attendance, setAttendance] = useState("85");
  const [assignmentMarks, setAssignmentMarks] = useState("80");
  const [internalMarks, setInternalMarks] = useState("75");
  const [examMarks, setExamMarks] = useState("78");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Auto-calculated score & grade in modal
  const computedTotal = useMemo(() => {
    const i = parseFloat(internalMarks) || 0;
    const a = parseFloat(assignmentMarks) || 0;
    const e = parseFloat(examMarks) || 0;
    return calculateWeightedTotal(i, a, e);
  }, [internalMarks, assignmentMarks, examMarks]);

  const computedGradeInfo = useMemo(() => {
    return determineGradeAndPoint(computedTotal);
  }, [computedTotal]);

  // Load Real Supabase Data
  const loadData = useCallback(async () => {
    if (!studentProfile) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const [subData, recData] = await Promise.all([
        getSubjects(studentProfile.id),
        getAcademicRecords(studentProfile.id),
      ]);
      setSubjects(subData || []);
      setRecords(recData || []);

      // If records exist, trigger real ML prediction from FastAPI
      if (recData && recData.length > 0) {
        fetchRealPrediction(recData);
      } else {
        setPrediction(null);
      }
    } catch (err: any) {
      console.error("[Performance] Failed to fetch academic data:", err);
      setLoadError(err?.message || "Failed to load academic records from database.");
      showToast("Unable to load academic performance", err?.message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [studentProfile, showToast]);

  // Fetch real ML prediction based on student's actual records
  const fetchRealPrediction = async (currentRecords: AcademicRecord[]) => {
    try {
      setIsPredicting(true);
      const avgAtt = calculateAverageAttendance(currentRecords) || 80;
      const avgInternal =
        currentRecords.reduce((sum, r) => sum + (Number(r.internal_marks) || 0), 0) /
        currentRecords.length;
      const avgAssign =
        currentRecords.reduce((sum, r) => sum + (Number(r.assignment_marks) || 0), 0) /
        currentRecords.length;
      const avgScore = calculateAverageScore(currentRecords) || 75;

      const predictionData = await predictPerformance({
        attendance_percentage: Math.round(avgAtt),
        assignment_score: Math.round(avgAssign),
        internal_marks: Math.round(avgInternal),
        previous_score: Math.round(avgScore),
        study_hours: 4.5,
        assignments_completed: currentRecords.length * 3,
      });
      setPrediction(predictionData);
    } catch (err) {
      console.warn("[Performance] ML prediction offline or unavailable:", err);
      setPrediction(null);
    } finally {
      setIsPredicting(false);
    }
  };

  useEffect(() => {
    if (studentProfile) {
      loadData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [studentProfile, authLoading, loadData]);

  // Handle open add record modal
  const handleOpenAdd = useCallback(() => {
    setEditingRecord(null);
    setSubjectId(subjects.length > 0 ? subjects[0].id : "");
    setAcademicYear("2025-2026");
    setSemester(studentProfile?.semester ? String(studentProfile.semester) : "1");
    setAttendance("85");
    setAssignmentMarks("80");
    setInternalMarks("75");
    setExamMarks("78");
    setFormErrors({});
    setIsModalOpen(true);
  }, [subjects, studentProfile]);

  // Listen for Command Center and URL params
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "add") {
        handleOpenAdd();
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
    const handleCustomAction = (e: any) => {
      if (e.detail?.action === "add-record") {
        handleOpenAdd();
      }
    };
    window.addEventListener("learntrack:open-action", handleCustomAction);
    return () => window.removeEventListener("learntrack:open-action", handleCustomAction);
  }, [handleOpenAdd]);

  // Handle open edit record modal
  const handleOpenEdit = (rec: AcademicRecord) => {
    setEditingRecord(rec);
    setSubjectId(rec.subject_id);
    setAcademicYear(rec.academic_year || "2025-2026");
    setSemester(String(rec.semester || 1));
    setAttendance(String(rec.attendance_percentage ?? 0));
    setAssignmentMarks(String(rec.assignment_marks ?? 0));
    setInternalMarks(String(rec.internal_marks ?? 0));
    setExamMarks(String(rec.exam_marks ?? 0));
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Save Record (Add or Edit)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentProfile) return;

    if (!subjectId) {
      setFormErrors({ subject_id: "Please select a registered subject." });
      return;
    }

    const payload = {
      student_id: studentProfile.id,
      subject_id: subjectId,
      academic_year: academicYear,
      semester: Number(semester),
      attendance_percentage: Number(attendance),
      assignment_marks: Number(assignmentMarks),
      internal_marks: Number(internalMarks),
      exam_marks: Number(examMarks),
      total_marks: computedTotal,
      grade: computedGradeInfo.grade,
      grade_point: computedGradeInfo.gradePoint,
    };

    const validation = validateAcademicRecord(payload);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    setIsSaving(true);
    setFormErrors({});

    try {
      if (editingRecord) {
        const { error } = await updateAcademicRecord(editingRecord.id, payload);
        if (error) {
          showToast("Error updating record", error, "error");
        } else {
          showToast("Academic record updated.", "Changes saved to database.", "success");
          setIsModalOpen(false);
          await loadData();
        }
      } else {
        const { error } = await createAcademicRecord(payload);
        if (error) {
          showToast("Error saving record", error, "error");
        } else {
          showToast("Academic record added.", "New coursework evaluation saved.", "success");
          setIsModalOpen(false);
          await loadData();
        }
      }
    } catch (err: any) {
      showToast("Unable to save your changes.", err?.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm Delete Record
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const success = await deleteAcademicRecord(deleteTarget.id);
      if (!success) {
        showToast("Error deleting record", "Could not remove record from database.", "error");
      } else {
        showToast("Record deleted.", "Academic record removed from your profile.", "success");
        setDeleteTarget(null);
        await loadData();
      }
    } catch (err: any) {
      showToast("Deletion failed", err?.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Real Calculated Metrics
  const summaryMetrics = useMemo(() => {
    if (!records || records.length === 0) {
      return {
        avgScore: null,
        cgpa: null,
        avgAttendance: null,
        totalCredits: 0,
        totalRecords: 0,
        trend: null,
      };
    }

    const avgScore = calculateAverageScore(records);
    const cgpa = calculateCGPA(records, subjects);
    const avgAttendance = calculateAverageAttendance(records);
    const trend = calculatePerformanceTrend(records);

    const subjectCreditMap = new Map<string, number>();
    subjects.forEach((s) => subjectCreditMap.set(s.id, Number(s.credits) || 3));

    const totalCredits = records.reduce((sum, r) => {
      return sum + (subjectCreditMap.get(r.subject_id) || 3);
    }, 0);

    return {
      avgScore,
      cgpa,
      avgAttendance,
      totalCredits,
      totalRecords: records.length,
      trend,
    };
  }, [records, subjects]);

  // Subject Performance List
  const subjectPerformanceItems = useMemo(() => {
    if (!records.length || !subjects.length) return [];
    return calculateSubjectPerformance(records, subjects);
  }, [records, subjects]);

  // Grade Distribution
  const gradeDistribution = useMemo(() => {
    return calculateGradeDistribution(records);
  }, [records]);

  // Deterministic Insights
  const deterministicInsights = useMemo(() => {
    if (!records.length && !subjects.length) return [];
    return generateDeterministicInsights(records, subjects, []);
  }, [records, subjects]);

  // Data Completeness
  const dataCompleteness = useMemo(() => {
    return calculateDataCompleteness(subjects, records, []);
  }, [subjects, records]);

  // Filtered & Sorted Records
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        const sub = subjects.find((s) => s.id === r.subject_id) || r.subject;
        const subName = sub?.subject_name?.toLowerCase() || "";
        const subCode = sub?.subject_code?.toLowerCase() || "";
        const query = searchQuery.toLowerCase().trim();
        const matchSearch =
          !query ||
          subName.includes(query) ||
          subCode.includes(query) ||
          r.grade.toLowerCase() === query ||
          `semester ${r.semester}`.includes(query) ||
          `sem ${r.semester}`.includes(query);

        const matchSemester =
          selectedSemester === "all" || String(r.semester) === selectedSemester;
        const matchYear =
          selectedYear === "all" || r.academic_year === selectedYear;
        const matchGrade =
          selectedGrade === "all" || r.grade === selectedGrade;

        return matchSearch && matchSemester && matchYear && matchGrade;
      })
      .sort((a, b) => {
        if (sortBy === "score-desc") return (b.total_marks || 0) - (a.total_marks || 0);
        if (sortBy === "score-asc") return (a.total_marks || 0) - (b.total_marks || 0);
        if (sortBy === "sem-desc") return b.semester - a.semester;
        if (sortBy === "sem-asc") return a.semester - b.semester;
        return 0;
      });
  }, [records, subjects, searchQuery, selectedSemester, selectedYear, selectedGrade, sortBy]);

  // Paginated Records
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;

  // Filter Dropdown Options
  const availableSemesters = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.semester))).sort((a, b) => a - b);
  }, [records]);

  const availableYears = useMemo(() => {
    return Array.from(new Set(records.map((r) => r.academic_year))).filter(Boolean) as string[];
  }, [records]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedSemester !== "all" ||
    selectedYear !== "all" ||
    selectedGrade !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedSemester("all");
    setSelectedYear("all");
    setSelectedGrade("all");
    setCurrentPage(1);
  };

  // Performance Trend Chart Data
  const trendChartData = useMemo(() => {
    if (!records || records.length === 0) return [];

    // Group records by semester
    const semMap = new Map<number, AcademicRecord[]>();
    records.forEach((r) => {
      const list = semMap.get(r.semester) || [];
      list.push(r);
      semMap.set(r.semester, list);
    });

    const semesters = Array.from(semMap.keys()).sort((a, b) => a - b);

    // If a specific semester is picked in chart controls
    const activeSemesters =
      chartSemesterFilter === "all"
        ? semesters
        : semesters.filter((s) => String(s) === chartSemesterFilter);

    return activeSemesters.map((sem) => {
      const semRecs = semMap.get(sem) || [];
      const avgScore =
        Math.round(
          (semRecs.reduce((sum, r) => sum + (Number(r.total_marks) || 0), 0) /
            semRecs.length) *
            10
        ) / 10;
      const avgAttendance =
        Math.round(
          (semRecs.reduce((sum, r) => sum + (Number(r.attendance_percentage) || 0), 0) /
            semRecs.length) *
            10
        ) / 10;

      return {
        name: `Semester ${sem}`,
        shortName: `S${sem}`,
        score: avgScore,
        attendance: avgAttendance,
        coursesCount: semRecs.length,
      };
    });
  }, [records, chartSemesterFilter]);

  const getGradeBadgeVariant = (grade: string) => {
    if (grade === "A+" || grade === "A")
      return "bg-emerald-50 text-emerald-700 border-emerald-200/90";
    if (grade === "B+" || grade === "B")
      return "bg-blue-50 text-blue-700 border-blue-200/90";
    if (grade === "C" || grade === "D")
      return "bg-amber-50 text-amber-700 border-amber-200/90";
    return "bg-rose-50 text-rose-700 border-rose-200/90";
  };

  // State: Student profile missing
  if (!authLoading && !studentProfile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Workspace</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-blue-600">Performance</span>
        </div>
        <Card className="p-8 text-center max-w-lg mx-auto border-blue-100 bg-white shadow-soft-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">Academic Profile Required</h3>
          <p className="text-xs text-slate-500 mt-2 mb-6 leading-relaxed">
            Please complete your student profile setup before logging coursework evaluations.
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
          {/* 5. Breadcrumb: WORKSPACE / PERFORMANCE */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            <span>Workspace</span>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            <span className="text-blue-600">Performance</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Academic Performance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Understand your academic trajectory, course performance, attendance, and semester progress.
          </p>
        </div>

        {/* Action Buttons: Primary + Secondary */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/subjects">
            <Button
              variant="outline"
              size="md"
              leftIcon={<BookOpen className="w-4 h-4 text-slate-500" />}
              className="h-[42px] px-3.5 rounded-[10px] bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs font-semibold text-xs"
            >
              Manage Subjects
            </Button>
          </Link>

          {/* 6. Primary Action Button */}
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />}
            onClick={handleOpenAdd}
            disabled={subjects.length === 0}
            className="h-[42px] px-4 rounded-[10px] bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs shadow-soft-sm hover:-translate-y-0.5 hover:shadow-soft-md transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none group"
          >
            Add Academic Record
          </Button>
        </div>
      </div>

      {/* 7. SUBJECT SETUP BANNER (Compact, strictly hidden when subjects exist) */}
      {subjects.length === 0 && !isLoading && (
        <div className="h-[58px] px-4 rounded-xl bg-amber-50/90 border border-amber-200/90 flex items-center justify-between gap-3 text-xs shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold">
              !
            </div>
            <div className="truncate">
              <span className="font-bold text-amber-900 mr-2">Set up your subjects</span>
              <span className="text-amber-800 hidden sm:inline">
                Academic records need a registered subject before scores can be evaluated.
              </span>
            </div>
          </div>
          <Link href="/subjects" className="shrink-0">
            <button className="flex items-center gap-1 font-bold text-amber-900 hover:text-amber-950 bg-amber-200/60 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors text-xs">
              Register Subjects <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      )}

      {/* 44 & 45. ERROR STATE (Distinguished from empty state) */}
      {loadError && !isLoading && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-4 text-xs text-rose-800">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold text-rose-900">Unable to load academic performance</p>
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

      {/* 43. LOADING SKELETON STATE */}
      {isLoading ? (
        <div className="space-y-6 animate-pulse">
          {/* Skeleton Summary Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-white border border-slate-200/80 p-4 space-y-3">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-8 w-16 bg-slate-200 rounded-lg" />
                <div className="h-2.5 w-28 bg-slate-100 rounded" />
              </div>
            ))}
          </div>

          {/* Skeleton Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 h-80 rounded-2xl bg-white border border-slate-200/80 p-6" />
            <div className="lg:col-span-4 h-80 rounded-2xl bg-white border border-slate-200/80 p-6" />
          </div>

          {/* Skeleton Records Row */}
          <div className="h-64 rounded-2xl bg-white border border-slate-200/80 p-6" />
        </div>
      ) : records.length === 0 ? (
        /* 14, 15, 16. COMPACT EMPTY ONBOARDING STATE (280-340px max height) */
        <div className="py-8 px-6 rounded-2xl bg-white border border-slate-200/90 shadow-soft-sm max-w-2xl mx-auto text-center space-y-5 animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto border border-blue-100 shadow-2xs group hover:-translate-y-0.5 transition-transform duration-200">
            <BarChart2 className="w-6 h-6 transition-transform duration-200 group-hover:scale-105" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              No academic records yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Add your first academic record to start tracking performance, grades, attendance, and predictive AI insights.
            </p>
          </div>

          {/* Compact 3-Step Progression or Direct Action */}
          {subjects.length === 0 ? (
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-3 gap-2 max-w-md mx-auto text-[11px] text-left">
                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70">
                  <div className="font-bold text-amber-900">STEP 1</div>
                  <div className="text-amber-800 text-[10px] mt-0.5 font-medium">Add subjects</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="font-bold text-slate-400">STEP 2</div>
                  <div className="text-slate-500 text-[10px] mt-0.5 font-medium">Log scores</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="font-bold text-slate-400">STEP 3</div>
                  <div className="text-slate-500 text-[10px] mt-0.5 font-medium">AI analytics</div>
                </div>
              </div>

              <Link href="/subjects" className="inline-block">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<BookOpen className="w-4 h-4" />}
                  className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs h-[42px] px-5 rounded-xl shadow-soft-sm"
                >
                  Register Subjects First
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 pt-1">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={handleOpenAdd}
                className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs h-[42px] px-5 rounded-xl shadow-soft-sm"
              >
                Add Academic Record
              </Button>
              <Link href="/subjects">
                <Button
                  variant="outline"
                  size="md"
                  className="h-[42px] px-4 rounded-xl text-slate-700 border-slate-200 hover:bg-slate-50 font-semibold text-xs"
                >
                  Manage Subjects
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* 17. WHEN DATA EXISTS — PRODUCTION-QUALITY ANALYTICS WORKSPACE */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 8 & 9. ROW 1: PERFORMANCE SUMMARY METRICS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Overall Score */}
            <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-soft-md transition-all duration-200 group">
              <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
                <span className="uppercase tracking-wider text-[11px]">Overall Score</span>
                <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Percent className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight font-sans">
                  {summaryMetrics.avgScore !== null ? `${summaryMetrics.avgScore}%` : "—"}
                </span>
                {summaryMetrics.trend && summaryMetrics.trend.hasHistoricalData && (
                  <span
                    className={`inline-flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                      summaryMetrics.trend.direction === "up"
                        ? "text-emerald-700 bg-emerald-50"
                        : summaryMetrics.trend.direction === "down"
                        ? "text-rose-700 bg-rose-50"
                        : "text-slate-600 bg-slate-100"
                    }`}
                  >
                    {summaryMetrics.trend.direction === "up" ? (
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                    ) : summaryMetrics.trend.direction === "down" ? (
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                    ) : null}
                    {summaryMetrics.trend.percentageChange > 0 ? "+" : ""}
                    {summaryMetrics.trend.percentageChange}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1 truncate">
                {summaryMetrics.trend ? summaryMetrics.trend.label : "Continuous evaluation average"}
              </p>
            </div>

            {/* 2. Current CGPA */}
            <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-soft-md transition-all duration-200 group">
              <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
                <span className="uppercase tracking-wider text-[11px]">Current CGPA</span>
                <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight font-sans">
                  {summaryMetrics.cgpa !== null ? summaryMetrics.cgpa.toFixed(2) : "—"}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ 10.0</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Weighted by registered subject credits
              </p>
            </div>

            {/* 3. Average Attendance */}
            <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-soft-md transition-all duration-200 group">
              <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
                <span className="uppercase tracking-wider text-[11px]">Attendance</span>
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight font-sans">
                  {summaryMetrics.avgAttendance !== null ? `${summaryMetrics.avgAttendance}%` : "—"}
                </span>
                {summaryMetrics.avgAttendance !== null && (
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      summaryMetrics.avgAttendance >= 75
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-rose-700 bg-rose-50"
                    }`}
                  >
                    {summaryMetrics.avgAttendance >= 75 ? "Healthy (≥75%)" : "Below Target"}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                Institutional threshold: 75%
              </p>
            </div>

            {/* 4. Credits & Total Records */}
            <div className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-soft-md transition-all duration-200 group">
              <div className="flex items-center justify-between text-xs font-semibold text-[#64748B]">
                <span className="uppercase tracking-wider text-[11px]">Credits & Logs</span>
                <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Layers className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight font-sans">
                  {summaryMetrics.totalCredits}
                </span>
                <span className="text-xs text-slate-400 font-semibold">Credits</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-1">
                {summaryMetrics.totalRecords} coursework record{summaryMetrics.totalRecords !== 1 ? "s" : ""} logged
              </p>
            </div>
          </div>

          {/* 18, 19, 20 & 21. ROW 2: PERFORMANCE TREND & SUBJECT PERFORMANCE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Performance Trend Chart (8 cols) */}
            <Card className="lg:col-span-7 xl:col-span-8 border-[#E2E8F0] shadow-soft-sm flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Performance Trend
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    Trajectory of continuous assessment scores across semesters
                  </CardDescription>
                </div>

                {/* 19. Chart Segmented Controls */}
                {availableSemesters.length > 1 && (
                  <div className="flex items-center gap-1 bg-slate-100/90 p-0.5 rounded-xl text-xs font-semibold text-slate-600">
                    <button
                      onClick={() => setChartSemesterFilter("all")}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        chartSemesterFilter === "all"
                          ? "bg-white text-blue-600 shadow-2xs font-bold"
                          : "hover:text-slate-900"
                      }`}
                    >
                      All Semesters
                    </button>
                    {availableSemesters.map((sem) => (
                      <button
                        key={sem}
                        onClick={() => setChartSemesterFilter(String(sem))}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          chartSemesterFilter === String(sem)
                            ? "bg-white text-blue-600 shadow-2xs font-bold"
                            : "hover:text-slate-900"
                        }`}
                      >
                        Sem {sem}
                      </button>
                    ))}
                  </div>
                )}
              </CardHeader>

              <CardContent className="pt-4 pb-2">
                {trendChartData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                    Not enough data points to plot trend.
                  </div>
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={trendChartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="attAreaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                          dataKey="shortName"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }}
                          dy={6}
                        />
                        <YAxis
                          domain={[0, 100]}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94A3B8", fontSize: 11 }}
                          dx={-4}
                        />
                        {/* 20. Chart Tooltip */}
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload || !payload.length) return null;
                            const item = payload[0].payload;
                            return (
                              <div className="p-3 bg-slate-900/95 text-white rounded-xl shadow-lg border border-slate-800 text-xs space-y-1 backdrop-blur-xs min-w-[150px]">
                                <div className="font-bold text-slate-200 border-b border-slate-700/80 pb-1 mb-1.5 flex justify-between items-center">
                                  <span>{item.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {item.coursesCount} course{item.coursesCount !== 1 ? "s" : ""}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-slate-300">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-blue-400" /> Average Score:
                                  </span>
                                  <span className="font-bold text-white font-mono">{item.score}%</span>
                                </div>
                                <div className="flex items-center justify-between text-slate-300">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Attendance:
                                  </span>
                                  <span className="font-bold text-white font-mono">{item.attendance}%</span>
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke="#2563EB"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#scoreAreaGrad)"
                          name="Average Score"
                          dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#FFFFFF" }}
                          activeDot={{ r: 6, fill: "#2563EB", stroke: "#FFFFFF", strokeWidth: 2 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="attendance"
                          stroke="#10B981"
                          strokeWidth={1.5}
                          strokeDasharray="4 4"
                          fillOpacity={1}
                          fill="url(#attAreaGrad)"
                          name="Attendance"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right: Subject Performance Ranking (5 cols) */}
            <Card className="lg:col-span-5 xl:col-span-4 border-[#E2E8F0] shadow-soft-sm flex flex-col justify-between">
              <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    Subject Performance
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-0.5">
                    Course standing and evaluation scores
                  </CardDescription>
                </div>
                <Link
                  href="/subjects"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 shrink-0"
                >
                  All subjects <ChevronRight className="w-3 h-3" />
                </Link>
              </CardHeader>

              <CardContent className="pt-3 pb-3">
                <div className="space-y-3 max-h-68 overflow-y-auto pr-1">
                  {subjectPerformanceItems.slice(0, 5).map((item) => (
                    <Link
                      key={item.id}
                      href={`/subjects/${item.id}`}
                      className="block p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/70 transition-all duration-150 group"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="truncate pr-2">
                          <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {item.subjectName}
                          </span>
                          {item.subjectCode && (
                            <span className="text-[10px] font-mono text-slate-400 ml-1.5">
                              {item.subjectCode}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-slate-900 font-mono">
                            {item.score}%
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getGradeBadgeVariant(
                              item.grade
                            )}`}
                          >
                            {item.grade}
                          </span>
                        </div>
                      </div>

                      {/* Score Progress Bar */}
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.score >= 80
                              ? "bg-blue-600"
                              : item.score >= 65
                              ? "bg-blue-500"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                        <span>Attendance: {item.attendance}%</span>
                        <span className="text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                          View details <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 23 & 24. ROW 3: GRADE DISTRIBUTION & ATTENDANCE ANALYTICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Grade Distribution: Horizontal Bar Visualization */}
            <Card className="border-[#E2E8F0] shadow-soft-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  Grade Distribution
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Breakdown across {records.length} coursework evaluation{records.length !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-2.5">
                {(["A+", "A", "B+", "B", "C", "D", "F"] as const).map((grade) => {
                  const count = gradeDistribution[grade] || 0;
                  const pct = records.length > 0 ? Math.round((count / records.length) * 100) : 0;
                  return (
                    <div key={grade} className="flex items-center gap-3 text-xs">
                      <span className="w-7 font-bold text-slate-700 font-mono text-right shrink-0">
                        {grade}
                      </span>
                      <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            grade.startsWith("A")
                              ? "bg-blue-600"
                              : grade.startsWith("B")
                              ? "bg-blue-400"
                              : grade === "C"
                              ? "bg-amber-400"
                              : "bg-rose-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-16 text-[11px] text-slate-500 text-right font-mono shrink-0">
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Attendance Analytics */}
            <Card className="border-[#E2E8F0] shadow-soft-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Attendance Analytics
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-0.5">
                  Institutional examination eligibility threshold: <strong>75%</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Circular/Large Percentage Display */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center shrink-0 w-36">
                    <div className="text-3xl font-extrabold text-emerald-800 font-sans tracking-tight">
                      {summaryMetrics.avgAttendance !== null ? `${summaryMetrics.avgAttendance}%` : "—"}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-700 mt-1">
                      {summaryMetrics.avgAttendance && summaryMetrics.avgAttendance >= 75
                        ? "Eligibility Healthy"
                        : "Attention Required"}
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 w-full text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between text-slate-700 mb-1">
                        <span className="font-semibold">Minimum Requirement</span>
                        <span className="font-bold text-slate-900 font-mono">75% Target</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(0, summaryMetrics.avgAttendance || 0))}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                        <span className="font-bold">
                          {records.filter((r) => Number(r.attendance_percentage) >= 75).length} Course(s)
                        </span>
                        <div className="text-[10px] text-emerald-700">Above 75% threshold</div>
                      </div>
                      <div className="p-2 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60">
                        <span className="font-bold">
                          {records.filter((r) => Number(r.attendance_percentage) < 75).length} Course(s)
                        </span>
                        <div className="text-[10px] text-amber-700">Below threshold</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 10, 11, 12, 13 & 25. ROW 4: FILTER TOOLBAR & ACADEMIC RECORDS TABLE */}
          <div className="space-y-3">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Academic Records</h3>
                <p className="text-xs text-slate-500">
                  Detailed evaluation components, continuous assessments, and grades
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Showing {filteredRecords.length} of {records.length} record{records.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* 10. Single Compact Filter Toolbar (56–64px height, #FFFFFF, border #E2E8F0) */}
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-[#E2E8F0] shadow-soft-sm space-y-2">
              <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center justify-between">
                {/* 11. Instant Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search subjects or course codes..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
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

                {/* 12. Filters: Semester, Year, Grade, Sort */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Semester */}
                  <select
                    value={selectedSemester}
                    onChange={(e) => {
                      setSelectedSemester(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Semesters</option>
                    {availableSemesters.map((sem) => (
                      <option key={sem} value={String(sem)}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>

                  {/* Year */}
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Years</option>
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>

                  {/* Grade */}
                  <select
                    value={selectedGrade}
                    onChange={(e) => {
                      setSelectedGrade(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Grades</option>
                    <option value="A+">Grade A+</option>
                    <option value="A">Grade A</option>
                    <option value="B+">Grade B+</option>
                    <option value="B">Grade B</option>
                    <option value="C">Grade C</option>
                    <option value="D">Grade D</option>
                    <option value="F">Grade F</option>
                  </select>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 focus:outline-none cursor-pointer"
                  >
                    <option value="sem-desc">Latest Semester</option>
                    <option value="sem-asc">Oldest Semester</option>
                    <option value="score-desc">Score: High to Low</option>
                    <option value="score-asc">Score: Low to High</option>
                  </select>
                </div>
              </div>

              {/* 13. Active Filter Chips */}
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

                  {selectedYear !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                      Year: {selectedYear}
                      <button onClick={() => setSelectedYear("all")} className="hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {selectedGrade !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                      Grade: {selectedGrade}
                      <button onClick={() => setSelectedGrade("all")} className="hover:text-blue-900">
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

            {/* 25, 26, 27. Main Record Table / Empty Filter Result */}
            {filteredRecords.length === 0 ? (
              <div className="py-12 px-4 text-center rounded-2xl bg-white border border-slate-200/90 shadow-soft-sm">
                <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No matching academic records</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  No records match your selected search or filter criteria.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 26. Desktop SaaS Table */}
                <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-3">Sem</th>
                        <th className="py-3 px-3">Attendance</th>
                        <th className="py-3 px-3">Internal (30%)</th>
                        <th className="py-3 px-3">Assignments (20%)</th>
                        <th className="py-3 px-3">Exam (50%)</th>
                        <th className="py-3 px-3">Total Score</th>
                        <th className="py-3 px-3">Grade</th>
                        <th className="py-3 px-3">GP</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {paginatedRecords.map((r) => {
                        const sub = subjects.find((s) => s.id === r.subject_id) || r.subject;
                        return (
                          <tr
                            key={r.id}
                            className="hover:bg-[#F8FAFC] transition-colors group"
                          >
                            <td className="py-3.5 px-4 font-medium text-slate-900">
                              <div>
                                <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                  {sub?.subject_name || "Unknown Subject"}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                                  {sub?.subject_code || "—"} • {sub?.credits || 3} Credits • {r.academic_year || "2025-2026"}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 font-semibold text-slate-600 font-mono">
                              S{r.semester}
                            </td>
                            <td className="py-3.5 px-3">
                              <span
                                className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                                  Number(r.attendance_percentage) >= 75
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-rose-50 text-rose-700"
                                }`}
                              >
                                {r.attendance_percentage}%
                              </span>
                            </td>
                            <td className="py-3.5 px-3 font-mono text-slate-600">{r.internal_marks}</td>
                            <td className="py-3.5 px-3 font-mono text-slate-600">{r.assignment_marks}</td>
                            <td className="py-3.5 px-3 font-mono text-slate-600">{r.exam_marks}</td>
                            <td className="py-3.5 px-3 font-bold text-slate-900 font-mono text-xs">
                              {r.total_marks}%
                            </td>
                            <td className="py-3.5 px-3">
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${getGradeBadgeVariant(
                                  r.grade
                                )}`}
                              >
                                {r.grade}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 font-mono font-bold text-slate-700">
                              {r.grade_point}
                            </td>
                            {/* 28. Record Action Menu */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEdit(r)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Edit Record"
                                  aria-label="Edit record"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(r)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Delete Record"
                                  aria-label="Delete record"
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

                {/* Mobile Responsive Cards */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                  {paginatedRecords.map((r) => {
                    const sub = subjects.find((s) => s.id === r.subject_id) || r.subject;
                    return (
                      <div
                        key={r.id}
                        className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-soft-sm space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900">{sub?.subject_name}</h4>
                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                              {sub?.subject_code || "—"} • Sem {r.semester} • {r.academic_year}
                            </div>
                          </div>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getGradeBadgeVariant(
                              r.grade
                            )}`}
                          >
                            {r.grade} ({r.grade_point} GP)
                          </span>
                        </div>

                        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
                          <div className="bg-slate-50 p-1.5 rounded-lg">
                            <div className="text-[10px] text-slate-400 font-medium">Att.</div>
                            <div className="font-bold text-slate-800">{r.attendance_percentage}%</div>
                          </div>
                          <div className="bg-slate-50 p-1.5 rounded-lg">
                            <div className="text-[10px] text-slate-400 font-medium">Internal</div>
                            <div className="font-bold text-slate-800">{r.internal_marks}</div>
                          </div>
                          <div className="bg-slate-50 p-1.5 rounded-lg">
                            <div className="text-[10px] text-slate-400 font-medium">Exam</div>
                            <div className="font-bold text-slate-800">{r.exam_marks}</div>
                          </div>
                          <div className="bg-blue-50/70 p-1.5 rounded-lg text-blue-900">
                            <div className="text-[10px] text-blue-600 font-medium">Total</div>
                            <div className="font-bold text-blue-900">{r.total_marks}%</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenEdit(r)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                            className="text-rose-600 hover:bg-rose-50"
                            onClick={() => setDeleteTarget(r)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 29. Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2 px-1 text-xs text-slate-500">
                    <span>
                      Page {currentPage} of {totalPages} ({filteredRecords.length} records)
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                        className="bg-white border-slate-200"
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                        className="bg-white border-slate-200"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 30, 31, 32, 33, 34. ROW 5: AI PERFORMANCE INSIGHTS & REAL ML PREDICTION */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  AI Performance Insights
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Evidence-based observations and predictive intelligence grounded in your academic data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Real Deterministic Insights */}
              <Card className="border-[#E2E8F0] shadow-soft-sm flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Evidence-Based Observations</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs pt-1">
                  {deterministicInsights.length > 0 ? (
                    deterministicInsights.slice(0, 2).map((ins) => (
                      <div
                        key={ins.id}
                        className={`p-2.5 rounded-xl border ${
                          ins.type === "positive"
                            ? "bg-emerald-50/70 border-emerald-200/60 text-emerald-900"
                            : ins.type === "warning"
                            ? "bg-amber-50/70 border-amber-200/60 text-amber-900"
                            : "bg-slate-50 border-slate-200/70 text-slate-800"
                        }`}
                      >
                        <div className="font-bold">{ins.title}</div>
                        <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed">
                          {ins.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-xs">
                      Log more coursework evaluations to unlock automated insights.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Card 2: 31 & 32. Real ML Prediction & SHAP Explainability */}
              <Card className="border-[#E2E8F0] shadow-soft-sm flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                      <Brain className="w-3.5 h-3.5" />
                      <span>Predicted Performance</span>
                    </div>
                    {prediction && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {prediction.model_version}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-xs pt-1">
                  {prediction ? (
                    <>
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">
                          {prediction.predicted_score.toFixed(1)}%
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
                            prediction.risk_level === "Low"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : prediction.risk_level === "Medium"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {prediction.risk_level} Risk • {prediction.predicted_grade}
                        </span>
                      </div>

                      {/* 31. SHAP Feature Attribution Factors */}
                      {prediction.explanations && prediction.explanations.length > 0 && (
                        <div className="pt-1.5 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Top Model Influences (SHAP)
                          </span>
                          {prediction.explanations.slice(0, 2).map((exp, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px]">
                              <span className="text-slate-600 truncate pr-2">{exp.label}</span>
                              <span
                                className={`font-mono font-bold shrink-0 ${
                                  exp.direction === "positive" ? "text-emerald-600" : "text-rose-600"
                                }`}
                              >
                                {exp.direction === "positive" ? "+" : ""}
                                {exp.impact.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400 italic pt-1 leading-tight">
                        Model influence does not imply causation.
                      </p>
                    </>
                  ) : (
                    <div className="py-3 text-center space-y-1.5">
                      <p className="text-slate-500 text-xs">
                        {isPredicting ? "Calculating ML projection..." : "ML prediction engine standby."}
                      </p>
                      <Link href="/simulator">
                        <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                          Explore What-If Scenarios →
                        </button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Card 3: 33 & 34. What-If Action & Data Completeness */}
              <Card className="border-[#E2E8F0] shadow-soft-sm flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                      <span>Data Quality & Simulation</span>
                    </div>
                    <span className="font-mono text-blue-600 font-bold">
                      {dataCompleteness.percentage}%
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs pt-1">
                  <div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${dataCompleteness.percentage}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                      {dataCompleteness.explanation}
                    </p>
                  </div>

                  {/* 33. What-If Simulator Action */}
                  <Link href="/simulator" className="block pt-1">
                    <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 hover:bg-blue-100/60 transition-colors flex items-center justify-between text-xs font-semibold text-blue-900 group">
                      <span>Explore What-If Scenarios</span>
                      <ArrowRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT ACADEMIC RECORD */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? "Edit Academic Record" : "Add Academic Record"}
        description="Log your continuous evaluation components. Total marks and grade point are calculated automatically."
      >
        <form onSubmit={handleSave} className="space-y-4 pt-2">
          {/* Subject Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Subject <span className="text-rose-500">*</span>
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subject_name} {s.subject_code ? `(${s.subject_code})` : ""} - Sem {s.semester}
                </option>
              ))}
            </select>
            {formErrors.subject_id && (
              <p className="text-xs text-rose-600 mt-1">{formErrors.subject_id}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Academic Year"
              id="academicYear"
              placeholder="e.g. 2025-2026"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              error={formErrors.academic_year}
              required
            />

            <Select
              label="Semester"
              id="recordSemester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
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
              error={formErrors.semester}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <Input
              label="Attendance %"
              id="attendance"
              type="number"
              min="0"
              max="100"
              value={attendance}
              onChange={(e) => setAttendance(e.target.value)}
              error={formErrors.attendance_percentage}
              required
            />

            <Input
              label="Assignments"
              id="assignmentMarks"
              type="number"
              min="0"
              max="100"
              value={assignmentMarks}
              onChange={(e) => setAssignmentMarks(e.target.value)}
              error={formErrors.assignment_marks}
              required
            />

            <Input
              label="Internal"
              id="internalMarks"
              type="number"
              min="0"
              max="100"
              value={internalMarks}
              onChange={(e) => setInternalMarks(e.target.value)}
              error={formErrors.internal_marks}
              required
            />

            <Input
              label="Exam Marks"
              id="examMarks"
              type="number"
              min="0"
              max="100"
              value={examMarks}
              onChange={(e) => setExamMarks(e.target.value)}
              error={formErrors.exam_marks}
              required
            />
          </div>

          {/* Auto-computed Total & Grade Preview */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-800">Computed Evaluation</span>
              <p className="text-[11px] text-slate-500">
                Internal (30%) + Assignments (20%) + Exam (50%)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 font-mono text-sm">
                {computedTotal} / 100
              </span>
              <span className="font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {computedGradeInfo.grade} ({computedGradeInfo.gradePoint} GP)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              className="bg-[#2563EB] hover:bg-blue-700"
            >
              {editingRecord ? "Save Record" : "Add Record"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: DELETE CONFIRMATION */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete this academic record?"
        description="This record will be permanently removed from your LearnTrack account."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              Subject: <strong>{subjects.find((s) => s.id === deleteTarget?.subject_id)?.subject_name || "Course"}</strong> •
              Score: {deleteTarget?.total_marks} ({deleteTarget?.grade}). This action cannot be undone.
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
              Delete Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
