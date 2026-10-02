"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Printer,
  Download,
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
  FileSpreadsheet,
  FileCode,
  Shield,
  Info,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import {
  Subject,
  AcademicRecord,
  StudyActivity,
  AcademicGoal,
  PerformancePrediction,
} from "@/types/academic";
import {
  getSubjects,
  getAcademicRecords,
  getStudyActivities,
  getAcademicGoals,
  getPredictionHistory,
} from "@/lib/academic/service";
import {
  calculateCGPA,
  calculateAverageScore,
  calculateAverageAttendance,
} from "@/lib/academic/calculations";
import { generateMLInsights } from "@/lib/api/ml";

// Modular Reports Components
import { ReportHeader } from "@/components/reports/ReportHeader";
import {
  ReportConfigPanel,
  ReportSectionsConfig,
} from "@/components/reports/ReportConfigPanel";
import {
  ReportDocumentView,
  AcademicInsightItem,
} from "@/components/reports/ReportDocumentView";
import { ReportWorkspaceSkeleton } from "@/components/reports/ReportSkeletons";

export default function ReportsPage() {
  const { studentProfile, profile, user, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [activities, setActivities] = useState<StudyActivity[]>([]);
  const [goals, setGoals] = useState<AcademicGoal[]>([]);
  const [predictions, setPredictions] = useState<PerformancePrediction[]>([]);
  const [insightsList, setInsightsList] = useState<AcademicInsightItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Scope filter state: "all" (Cumulative) or semester number as string
  const [selectedScope, setSelectedScope] = useState<string>("all");

  // Interactive section toggles
  const [sectionsConfig, setSectionsConfig] = useState<ReportSectionsConfig>({
    studentOverview: true,
    academicSummary: true,
    subjectPerformance: true,
    mlProjection: true,
    academicGoals: true,
    academicInsights: true,
  });

  // Track active section for table of contents
  const [activeNavSection, setActiveNavSection] = useState<string>("section-overview");

  // Load report data from authenticated student records
  const loadReportData = useCallback(async () => {
    if (!studentProfile) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [subs, recs, acts, gls, preds] = await Promise.all([
        getSubjects(studentProfile.id),
        getAcademicRecords(studentProfile.id),
        getStudyActivities(studentProfile.id, 100),
        getAcademicGoals(studentProfile.id),
        getPredictionHistory(studentProfile.id),
      ]);
      setSubjects(subs);
      setRecords(recs);
      setActivities(acts);
      setGoals(gls);
      setPredictions(preds);

      // Generate or synthesize grounded academic insights
      const latestPred = preds.length > 0 ? preds[0] : null;
      const initialScore = calculateAverageScore(recs);
      const initialAtt = calculateAverageAttendance(recs);
      const initialHours = Math.round(
        acts.reduce((sum, a) => sum + (Number(a.study_hours) || 0), 0) * 10
      ) / 10;

      let generatedInsights: AcademicInsightItem[] = [];

      try {
        const mlRes = await generateMLInsights({
          academic_records: recs,
          attendance_percentage: initialAtt ?? 80,
          study_hours: initialHours,
          latest_prediction: latestPred
            ? {
                predicted_score: latestPred.predicted_score,
                predicted_grade: latestPred.predicted_grade,
                risk_level: latestPred.risk_level,
              }
            : null,
          shap_explanations: latestPred?.explanations || [],
        });

        if (mlRes?.insights && mlRes.insights.length > 0) {
          generatedInsights = mlRes.insights.map((item) => ({
            type:
              item.type === "strength"
                ? "strength"
                : item.type === "trend"
                ? "trend"
                : item.type === "improvement"
                ? "improvement"
                : "recommendation",
            title: item.title,
            evidence: item.description,
          }));
        }
      } catch (err) {
        // Fallback: Deterministic insights strictly derived from actual student data
        if (recs.length > 0) {
          if (initialAtt !== null) {
            generatedInsights.push({
              type: initialAtt >= 75 ? "strength" : "improvement",
              title: "Attendance Pacing",
              evidence: `Overall attendance is recorded at ${initialAtt}%, ${
                initialAtt >= 75 ? "meeting" : "below"
              } the institutional reference threshold of 75%.`,
            });
          }

          if (initialScore !== null) {
            generatedInsights.push({
              type: "trend",
              title: "Coursework Performance Average",
              evidence: `Current average score across ${recs.length} verified evaluation${
                recs.length !== 1 ? "s" : ""
              } stands at ${initialScore}%.`,
            });
          }

          // Highest vs Lowest subject gap
          if (recs.length > 1) {
            const sortedByScore = [...recs].sort(
              (a, b) => (b.total_marks ?? 0) - (a.total_marks ?? 0)
            );
            const highestRec = sortedByScore[0];
            const lowestRec = sortedByScore[sortedByScore.length - 1];
            const highestSub = subs.find((s) => s.id === highestRec.subject_id);
            const lowestSub = subs.find((s) => s.id === lowestRec.subject_id);

            if (highestSub && lowestSub && highestRec.id !== lowestRec.id) {
              generatedInsights.push({
                type: "improvement",
                title: "Subject Focus Opportunity",
                evidence: `${lowestSub.subject_name} (${lowestRec.total_marks}%) presents an academic gap compared to ${highestSub.subject_name} (${highestRec.total_marks}%).`,
              });
            }
          }

          if (initialHours > 0) {
            generatedInsights.push({
              type: "recommendation",
              title: "Study Habit Investment",
              evidence: `You have logged ${initialHours} total hours of self-directed revision across ${acts.length} recorded session${
                acts.length !== 1 ? "s" : ""
              }.`,
            });
          }
        }
      }

      setInsightsList(generatedInsights);
    } catch (err: any) {
      console.error("[ReportsPage] Error loading report data:", err);
      showToast("Error loading report data", err?.message, "error");
    } finally {
      setIsLoading(false);
    }
  }, [studentProfile, showToast]);

  useEffect(() => {
    if (studentProfile) {
      loadReportData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [studentProfile, authLoading, loadReportData]);

  // Available semesters list from records
  const availableSemesters = useMemo(() => {
    const sems = Array.from(new Set(records.map((r) => r.semester))).filter(
      (s): s is number => typeof s === "number" && !isNaN(s)
    );
    return sems.sort((a, b) => a - b);
  }, [records]);

  // Filter records by selected scope
  const activeRecords = useMemo(() => {
    if (selectedScope === "all") return records;
    return records.filter((r) => r.semester === Number(selectedScope));
  }, [records, selectedScope]);

  // Derived metrics according to selected scope
  const avgScore = useMemo(() => calculateAverageScore(activeRecords), [activeRecords]);
  const avgAttendance = useMemo(() => calculateAverageAttendance(activeRecords), [activeRecords]);
  const cgpa = useMemo(() => calculateCGPA(activeRecords, subjects), [activeRecords, subjects]);

  const totalStudyHours = useMemo(() => {
    const sum = activities.reduce((acc, a) => acc + (Number(a.study_hours) || 0), 0);
    return Math.round(sum * 10) / 10;
  }, [activities]);

  const latestPrediction = predictions.length > 0 ? predictions[0] : null;

  // Student display name
  const studentName = useMemo(() => {
    if (profile?.full_name) return profile.full_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split("@")[0];
    return "Enrolled Student";
  }, [profile, user]);

  // Scope label for UI & exports
  const scopeLabel = useMemo(() => {
    if (selectedScope === "all") return "Cumulative History";
    return `Semester ${selectedScope} Only`;
  }, [selectedScope]);

  // Section toggle handlers
  const handleToggleSection = (key: keyof ReportSectionsConfig) => {
    setSectionsConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectAllSections = () => {
    setSectionsConfig({
      studentOverview: true,
      academicSummary: true,
      subjectPerformance: true,
      mlProjection: true,
      academicGoals: true,
      academicInsights: true,
    });
  };

  const handleResetSections = () => {
    setSectionsConfig({
      studentOverview: false,
      academicSummary: false,
      subjectPerformance: false,
      mlProjection: false,
      academicGoals: false,
      academicInsights: false,
    });
  };

  // Smooth scroll to document section
  const handleScrollToSection = (sectionId: string) => {
    setActiveNavSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Export CSV Handler (Requirement #29: Scoped to selected filters)
  const handleExportCSV = async () => {
    if (!studentProfile) return;
    setIsExporting(true);
    try {
      let csvContent = "data:text/csv;charset=utf-8,";

      // Report Metadata Header
      csvContent += "LEARNTRACK ACADEMIC PERFORMANCE REPORT\r\n";
      csvContent += `Student Name,"${studentName}"\r\n`;
      csvContent += `Roll Number,"${studentProfile.roll_number || "—"}"\r\n`;
      csvContent += `Report Scope,"${scopeLabel}"\r\n`;
      csvContent += `Generated Date,"${new Date().toLocaleDateString()}"\r\n\r\n`;

      // 1. Academic Summary
      if (sectionsConfig.academicSummary) {
        csvContent += "ACADEMIC SUMMARY\r\n";
        csvContent += "Average Score,Cumulative CGPA,Average Attendance,Total Study Hours\r\n";
        csvContent += `"${avgScore !== null ? `${avgScore}%` : "—"}","${
          cgpa !== null ? cgpa.toFixed(2) : "—"
        }","${avgAttendance !== null ? `${avgAttendance}%` : "—"}","${totalStudyHours}h"\r\n\r\n`;
      }

      // 2. Subject Evaluations
      if (sectionsConfig.subjectPerformance) {
        csvContent += "SUBJECT EVALUATIONS\r\n";
        csvContent += "Course Code,Subject Name,Semester,Internal Marks,Assignment Marks,Exam Marks,Total Score %,Attendance %,Grade\r\n";
        activeRecords.forEach((r) => {
          const sub = subjects.find((s) => s.id === r.subject_id);
          csvContent += `"${sub?.subject_code || "—"}","${sub?.subject_name || "Course"}","${
            r.semester
          }","${r.internal_marks ?? "—"}","${r.assignment_marks ?? "—"}","${
            r.exam_marks ?? "—"
          }","${r.total_marks ?? "—"}","${r.attendance_percentage ?? "—"}","${r.grade || "—"}"\r\n`;
        });
        csvContent += "\r\n";
      }

      // 3. Goals
      if (sectionsConfig.academicGoals && goals.length > 0) {
        csvContent += "ACADEMIC GOALS\r\n";
        csvContent += "Title,Goal Type,Current Value,Target Value,Unit,Status,Deadline\r\n";
        goals.forEach((g) => {
          csvContent += `"${g.title}","${g.goal_type}","${g.current_value}","${g.target_value}","${
            g.unit || ""
          }","${g.status}","${g.deadline || "Open"}"\r\n`;
        });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `LearnTrack_Report_${studentProfile.roll_number || "student"}_${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(
        "Report CSV Exported",
        `Academic records for ${scopeLabel} downloaded in CSV format.`,
        "success"
      );
    } catch (err: any) {
      showToast("Export failed", err?.message, "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Export JSON Handler (Requirement #30: Structured data grounded in real inputs)
  const handleExportJSON = async () => {
    if (!studentProfile) return;
    setIsExporting(true);
    try {
      const exportObject: any = {
        dossier_type: "LearnTrack Academic Performance Report",
        generated_at: new Date().toISOString(),
        scope: scopeLabel,
        student: {
          name: studentName,
          roll_number: studentProfile.roll_number || null,
          university: studentProfile.university || null,
          department: studentProfile.department || null,
          year: studentProfile.year || 1,
          semester: studentProfile.semester || 1,
        },
      };

      if (sectionsConfig.academicSummary) {
        exportObject.academic_summary = {
          average_score: avgScore,
          cgpa: cgpa !== null ? Number(cgpa.toFixed(2)) : null,
          average_attendance: avgAttendance,
          total_study_hours: totalStudyHours,
          total_evaluations: activeRecords.length,
        };
      }

      if (sectionsConfig.subjectPerformance) {
        exportObject.subject_records = activeRecords.map((r) => {
          const sub = subjects.find((s) => s.id === r.subject_id);
          return {
            course_code: sub?.subject_code || null,
            subject_name: sub?.subject_name || "Course",
            credits: sub?.credits || 0,
            semester: r.semester,
            internal_marks: r.internal_marks,
            assignment_marks: r.assignment_marks,
            exam_marks: r.exam_marks,
            total_marks: r.total_marks,
            attendance_percentage: r.attendance_percentage,
            grade: r.grade,
          };
        });
      }

      if (sectionsConfig.mlProjection && latestPrediction) {
        exportObject.prediction = {
          predicted_score: latestPrediction.predicted_score,
          predicted_grade: latestPrediction.predicted_grade,
          risk_level: latestPrediction.risk_level,
          model_version: latestPrediction.model_version,
          shap_influences: latestPrediction.explanations || [],
        };
      }

      if (sectionsConfig.academicGoals && goals.length > 0) {
        exportObject.goals = goals.map((g) => ({
          title: g.title,
          goal_type: g.goal_type,
          current_value: g.current_value,
          target_value: g.target_value,
          unit: g.unit,
          status: g.status,
          deadline: g.deadline,
        }));
      }

      if (sectionsConfig.academicInsights && insightsList.length > 0) {
        exportObject.insights = insightsList;
      }

      const blob = new Blob([JSON.stringify(exportObject, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `LearnTrack_Report_${studentProfile.roll_number || "student"}_${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast(
        "Report JSON Exported",
        `Academic report dossier structure exported successfully.`,
        "success"
      );
    } catch (err: any) {
      showToast("Export failed", err?.message, "error");
    } finally {
      setIsExporting(false);
    }
  };

  const formattedTimestamp = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  if (isLoading || authLoading) {
    return <ReportWorkspaceSkeleton />;
  }

  // Empty state if student onboarding profile is missing
  if (!studentProfile) {
    return (
      <div className="space-y-6">
        <ReportHeader
          onPrint={() => {}}
          onExportCSV={() => {}}
          onExportJSON={() => {}}
          isReady={false}
        />
        <EmptyState
          title="Student Profile Required"
          description="Complete your student onboarding profile to compile and export verified academic performance dossiers."
          actionLabel="Complete Profile"
          onAction={() => {}}
          icon={<GraduationCap className="w-6 h-6 text-blue-600" />}
        />
      </div>
    );
  }

  // Empty state if absolutely no subjects or records exist (Section 51)
  if (subjects.length === 0 && records.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300 pb-16">
        <ReportHeader
          onPrint={() => {}}
          onExportCSV={() => {}}
          onExportJSON={() => {}}
          isReady={false}
        />

        <div className="p-10 rounded-2xl bg-white border border-slate-200 shadow-card text-center max-w-2xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto shadow-2xs">
            <GraduationCap className="w-6 h-6" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
              Your Academic Report Starts Here
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
              Add coursework evaluations, subjects, and study activity to compile your first
              verified LearnTrack academic performance dossier.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/performance">
              <Button variant="primary" size="sm" className="h-9 px-4 text-xs font-semibold">
                Add Academic Record
              </Button>
            </Link>
            <Link href="/subjects">
              <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-medium">
                Add Subject
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Print Stylesheet Overrides (Section 43 & 44) */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 14mm 12mm 14mm 12mm;
          }
          body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          aside,
          nav,
          header,
          .print\\:hidden,
          #ask-learntrack-button {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          #academic-report-document {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            transform: none !important;
            width: 100% !important;
          }
          .break-inside-avoid {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* 1. Header (Screen View) */}
      <ReportHeader
        onPrint={handlePrint}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        isReady={!isLoading}
        isExporting={isExporting}
      />

      {/* 2. Interactive 2-Column Report Workspace (Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Configuration Controls (Sticky on Desktop) */}
        <aside className="lg:col-span-4 xl:col-span-3.5 print:hidden sticky top-20 z-10">
          <ReportConfigPanel
            selectedScope={selectedScope}
            onScopeChange={setSelectedScope}
            availableSemesters={availableSemesters}
            sectionsConfig={sectionsConfig}
            onToggleSection={handleToggleSection}
            onSelectAllSections={handleSelectAllSections}
            onResetSections={handleResetSections}
            activeNavSection={activeNavSection}
            onScrollToSection={handleScrollToSection}
            onPrint={handlePrint}
            onExportCSV={handleExportCSV}
            onExportJSON={handleExportJSON}
          />
        </aside>

        {/* Right Column: Live Document Preview */}
        <main className="lg:col-span-8 xl:col-span-8.5 w-full min-w-0">
          <ReportDocumentView
            studentProfile={studentProfile}
            studentName={studentName}
            scopeLabel={scopeLabel}
            selectedScope={selectedScope}
            activeRecords={activeRecords}
            subjects={subjects}
            activities={activities}
            goals={goals}
            latestPrediction={latestPrediction}
            avgScore={avgScore}
            avgAttendance={avgAttendance}
            cgpa={cgpa}
            totalStudyHours={totalStudyHours}
            sectionsConfig={sectionsConfig}
            insightsList={insightsList}
            generatedTimestamp={formattedTimestamp}
          />
        </main>
      </div>
    </div>
  );
}
