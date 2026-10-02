"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { PlusCircle, Sparkles } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { Subject, AcademicRecord, StudyActivity, AcademicGoal, PerformancePrediction } from "@/types/academic";
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
  calculateScoreDistribution,
  calculateCorrelationMatrix,
  calculateStudyConsistency,
  calculatePeriodProgress,
  calculatePersonalBests,
  calculateDataCompleteness,
  calculateGradeDistribution,
} from "@/lib/academic/calculations";

// Modular Analytics Components
import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { AnalyticsContextBar } from "@/components/analytics/AnalyticsContextBar";
import { AnalyticsKpiCards } from "@/components/analytics/AnalyticsKpiCards";
import { PerformanceTrendCard, TrendDataPoint } from "@/components/analytics/PerformanceTrendCard";
import { SubjectPerformanceCard, SubjectComparisonItem } from "@/components/analytics/SubjectPerformanceCard";
import { AttendanceAnalysisCard } from "@/components/analytics/AttendanceAnalysisCard";
import { StudyActivityCard } from "@/components/analytics/StudyActivityCard";
import { GradeAndScoreDistributionCards } from "@/components/analytics/GradeAndScoreDistributionCards";
import { ExploratoryScatterCards } from "@/components/analytics/ExploratoryScatterCards";
import { StatisticalCorrelationCard } from "@/components/analytics/StatisticalCorrelationCard";
import { PeriodComparisonAndPersonalBests } from "@/components/analytics/PeriodComparisonAndPersonalBests";
import { AnalyticsReadinessCard } from "@/components/analytics/AnalyticsReadinessCard";
import { ConnectedWorkspacesBar } from "@/components/analytics/ConnectedWorkspacesBar";
import { ReportGenerationModal } from "@/components/analytics/ReportGenerationModal";
import { AnalyticsPageSkeleton } from "@/components/analytics/AnalyticsSkeletons";
import { Button } from "@/components/ui/Button";

export default function AnalyticsPage() {
  const { studentProfile, user, isLoading: authLoading } = useAuth();
  const studentId = studentProfile?.id;
  const currentSemester = studentProfile?.semester;
  const currentYear = studentProfile?.year;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [records, setRecords] = useState<AcademicRecord[]>([]);
  const [activities, setActivities] = useState<StudyActivity[]>([]);
  const [goals, setGoals] = useState<AcademicGoal[]>([]);
  const [predictions, setPredictions] = useState<PerformancePrediction[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  // Filters State (Sections 4, 5, 40)
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");

  // Trend timeframe: '1_sem' | '2_sem' | 'all' (Section 12)
  const [trendTimeframe, setTrendTimeframe] = useState<"1_sem" | "2_sem" | "all">("all");

  // Subject comparison sort: 'highest' | 'lowest' | 'alphabetical' | 'improved' (Section 17)
  const [subjectSort, setSubjectSort] = useState<"highest" | "lowest" | "alphabetical" | "improved">("highest");

  // Attendance target threshold (Section 21)
  const [attendanceTarget, setAttendanceTarget] = useState<number>(75);

  // Report Modal State (Section 44)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Load verified data from Supabase
  const loadData = useCallback(async () => {
    if (!studentId) {
      setIsLoading(false);
      return;
    }
    try {
      const [subData, recData, actData, goalData, predData] = await Promise.all([
        getSubjects(studentId),
        getAcademicRecords(studentId),
        getStudyActivities(studentId, 100),
        getAcademicGoals(studentId),
        getPredictionHistory(studentId),
      ]);
      setSubjects(subData || []);
      setRecords(recData || []);
      setActivities(actData || []);
      setGoals(goalData || []);
      setPredictions(predData || []);
    } catch (err) {
      console.error("[AnalyticsPage] Error loading analytics data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (studentId) {
      timer = setTimeout(() => {
        void loadData();
      }, 0);
    } else if (!authLoading) {
      timer = setTimeout(() => {
        setIsLoading(false);
      }, 0);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [studentId, authLoading, loadData]);

  // Derived available options for filters (Section 4)
  const availableSemesters = useMemo(() => {
    const sems = new Set<number>();
    records.forEach((r) => sems.add(r.semester));
    if (currentSemester) sems.add(currentSemester);
    return Array.from(sems).sort((a, b) => a - b);
  }, [records, currentSemester]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    if (currentYear) years.add(`Year ${currentYear}`);
    records.forEach((r) => {
      if (r.academic_year) {
        years.add(r.academic_year);
      } else if (r.created_at) {
        const y = new Date(r.created_at).getFullYear().toString();
        years.add(y);
      }
    });
    return Array.from(years).sort();
  }, [records, currentYear]);

  // Handle filter changes with smooth transition (Section 5)
  const handleSemesterChange = (val: string) => {
    setIsFiltering(true);
    setSelectedSemester(val);
    setTimeout(() => setIsFiltering(false), 150);
  };

  const handleYearChange = (val: string) => {
    setIsFiltering(true);
    setSelectedYear(val);
    setTimeout(() => setIsFiltering(false), 150);
  };

  const handleSubjectChange = (val: string) => {
    setIsFiltering(true);
    setSelectedSubjectId(val);
    setTimeout(() => setIsFiltering(false), 150);
  };

  const handleResetFilters = () => {
    setIsFiltering(true);
    setSelectedSemester("all");
    setSelectedYear("all");
    setSelectedSubjectId("all");
    setTimeout(() => setIsFiltering(false), 150);
  };

  // Filtered records based on active user selections (Section 40: Global Filter Behavior)
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedSemester !== "all" && r.semester !== Number(selectedSemester)) {
        return false;
      }
      if (selectedSubjectId !== "all" && r.subject_id !== selectedSubjectId) {
        return false;
      }
      if (selectedYear !== "all") {
        if (r.academic_year && r.academic_year !== selectedYear) return false;
        if (r.created_at) {
          const y = new Date(r.created_at).getFullYear().toString();
          if (y !== selectedYear && `Year ${studentProfile?.year}` !== selectedYear) {
            return false;
          }
        }
      }
      return true;
    });
  }, [records, selectedSemester, selectedSubjectId, selectedYear, studentProfile?.year]);

  // Filtered study activities
  const filteredActivities = useMemo(() => {
    return activities;
  }, [activities]);

  // 1. KPI Calculations (Section 7, 8, 9)
  const averageScore = useMemo(() => {
    return calculateAverageScore(filteredRecords);
  }, [filteredRecords]);

  const cgpaValue = useMemo(() => {
    return calculateCGPA(filteredRecords, subjects);
  }, [filteredRecords, subjects]);

  const averageAttendance = useMemo(() => {
    return calculateAverageAttendance(filteredRecords);
  }, [filteredRecords]);

  const totalStudyHours = useMemo(() => {
    const sum = filteredActivities.reduce((acc, a) => acc + (Number(a.study_hours) || 0), 0);
    return Math.round(sum * 10) / 10;
  }, [filteredActivities]);

  // Period progress comparison (Section 8 & 35)
  const periodProgress = useMemo(() => {
    if (records.length === 0) {
      return {
        scoreChange: null,
        attendanceChange: null,
        studyHoursChange: null,
        hasPreviousPeriod: false,
      };
    }

    const currentSem =
      selectedSemester !== "all"
        ? Number(selectedSemester)
        : Math.max(...records.map((r) => r.semester));

    const currentRecs = records.filter((r) => r.semester === currentSem);
    const previousRecs = records.filter((r) => r.semester === currentSem - 1);

    const halfLen = Math.floor(activities.length / 2);
    const currHours = activities
      .slice(0, halfLen || activities.length)
      .reduce((sum, a) => sum + (Number(a.study_hours) || 0), 0);
    const prevHours = activities
      .slice(halfLen)
      .reduce((sum, a) => sum + (Number(a.study_hours) || 0), 0);

    const res = calculatePeriodProgress(currentRecs, previousRecs, currHours, prevHours);

    const currAvg = calculateAverageScore(currentRecs);
    const prevAvg = calculateAverageScore(previousRecs);

    return {
      ...res,
      currentPeriodLabel: `Semester ${currentSem}`,
      previousPeriodLabel: `Semester ${currentSem - 1}`,
      currentScore: currAvg,
      previousScore: prevAvg,
    };
  }, [records, activities, selectedSemester]);

  // 2. Performance Trend (Section 12, 13)
  const trendData: TrendDataPoint[] = useMemo(() => {
    if (records.length === 0) return [];

    const grouped: Record<number, AcademicRecord[]> = {};
    records.forEach((r) => {
      if (!grouped[r.semester]) grouped[r.semester] = [];
      grouped[r.semester].push(r);
    });

    let sems = Object.keys(grouped).map(Number).sort((a, b) => a - b);

    if (trendTimeframe === "1_sem" && sems.length > 0) {
      sems = [sems[sems.length - 1]];
    } else if (trendTimeframe === "2_sem" && sems.length > 1) {
      sems = sems.slice(-2);
    }

    return sems.map((sem) => {
      const semRecords = grouped[sem] || [];
      const score = calculateAverageScore(semRecords) || 0;
      const att = calculateAverageAttendance(semRecords) || 0;
      return {
        period: `Semester ${sem}`,
        semester: sem,
        score,
        attendance: att,
        count: semRecords.length,
      };
    });
  }, [records, trendTimeframe]);

  // 3. Subject Comparison & Sorting (Sections 17, 18)
  const canCalculateImprovement = useMemo(() => {
    const counts: Record<string, number> = {};
    records.forEach((r) => {
      counts[r.subject_id] = (counts[r.subject_id] || 0) + 1;
    });
    return Object.values(counts).some((c) => c >= 2);
  }, [records]);

  const subjectComparisonData: SubjectComparisonItem[] = useMemo(() => {
    const items = filteredRecords.map((r) => {
      const sub = subjects.find((s) => s.id === r.subject_id) || r.subject;
      // Calculate improvement if historical evaluations exist
      const allForSub = records
        .filter((rec) => rec.subject_id === r.subject_id)
        .sort((a, b) => (a.semester || 0) - (b.semester || 0));

      let trend: number | null = null;
      if (allForSub.length >= 2) {
        const last = allForSub[allForSub.length - 1];
        const prev = allForSub[allForSub.length - 2];
        trend = Math.round((Number(last.total_marks) - Number(prev.total_marks)) * 10) / 10;
      }

      return {
        id: r.subject_id,
        name: sub?.subject_name || "Course",
        code: sub?.subject_code || "",
        score: Number(r.total_marks) || 0,
        attendance: Number(r.attendance_percentage) || 0,
        credits: sub?.credits || 3,
        grade: r.grade || "—",
        trend,
      };
    });

    if (subjectSort === "highest") {
      return [...items].sort((a, b) => b.score - a.score);
    } else if (subjectSort === "lowest") {
      return [...items].sort((a, b) => a.score - b.score);
    } else if (subjectSort === "alphabetical") {
      return [...items].sort((a, b) => a.name.localeCompare(b.name));
    } else if (subjectSort === "improved") {
      return [...items].sort((a, b) => (b.trend ?? -999) - (a.trend ?? -999));
    }
    return items;
  }, [filteredRecords, subjects, records, subjectSort]);

  // 4. Study Activity Analytics & Consistency (Sections 24, 25)
  const studyAnalytics = useMemo(() => {
    const total = filteredActivities.reduce((acc, a) => acc + (Number(a.study_hours) || 0), 0);
    const avgDaily = Math.round((total / (filteredActivities.length || 1)) * 10) / 10;
    const avgWeekly = Math.round(((total * 7) / (filteredActivities.length || 7)) * 10) / 10;

    const dayTotals: Record<string, number> = {
      Sun: 0,
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
    };
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    filteredActivities.forEach((a) => {
      if (a.study_date) {
        const d = new Date(a.study_date);
        const day = dayNames[d.getDay()];
        if (day) dayTotals[day] += Number(a.study_hours) || 0;
      }
    });

    let peakDay = "—";
    let peakHours = 0;
    Object.entries(dayTotals).forEach(([day, hrs]) => {
      if (hrs > peakHours) {
        peakHours = hrs;
        peakDay = day;
      }
    });

    const weeklyChartData = Object.entries(dayTotals).map(([day, hours]) => ({
      day,
      hours: Math.round(hours * 10) / 10,
    }));

    return {
      total: Math.round(total * 10) / 10,
      avgDaily,
      avgWeekly,
      peakDay,
      weeklyChartData,
    };
  }, [filteredActivities]);

  const studyConsistency = useMemo(() => {
    return calculateStudyConsistency(filteredActivities, 30);
  }, [filteredActivities]);

  // 5. Grade & Score Distribution (Sections 27, 28)
  const gradeDistribution = useMemo(() => {
    const raw = calculateGradeDistribution(filteredRecords);
    const colors: Record<string, string> = {
      "A+": "#2563eb",
      A: "#3b82f6",
      "B+": "#60a5fa",
      B: "#93c5fd",
      C: "#94a3b8",
      D: "#f59e0b",
      F: "#ef4444",
    };

    return Object.entries(raw).map(([grade, count]) => ({
      grade,
      count,
      color: colors[grade] || "#64748b",
    }));
  }, [filteredRecords]);

  const scoreDistribution = useMemo(() => {
    return calculateScoreDistribution(filteredRecords);
  }, [filteredRecords]);

  // 6. Exploratory Scatters (Sections 30, 31)
  const attendanceVsScoreData = useMemo(() => {
    return filteredRecords.map((r) => {
      const sub = subjects.find((s) => s.id === r.subject_id) || r.subject;
      return {
        subject: sub?.subject_name || "Course",
        attendance: Number(r.attendance_percentage) || 0,
        score: Number(r.total_marks) || 0,
      };
    });
  }, [filteredRecords, subjects]);

  const studyHoursVsScoreData = useMemo(() => {
    // Current model does not pair individual study sessions with subjects unless explicitly logged
    return [] as Array<{ subject: string; hours: number; score: number }>;
  }, []);

  // 7. Correlation Matrix (Section 32)
  const correlationMatrix = useMemo(() => {
    return calculateCorrelationMatrix(filteredRecords);
  }, [filteredRecords]);

  // 8. Personal Bests (Section 36)
  const personalBests = useMemo(() => {
    return calculatePersonalBests(records, activities, subjects);
  }, [records, activities, subjects]);

  // 9. Completeness (Section 37)
  const completeness = useMemo(() => {
    return calculateDataCompleteness(subjects, records, activities);
  }, [subjects, records, activities]);

  // 10. Connected Intelligence (Sections 69, 70, 71)
  const latestPrediction = predictions[0] || null;
  const activeGoal = goals[0] || null;

  const insightSnippet = useMemo(() => {
    if (periodProgress.hasPreviousPeriod && periodProgress.scoreChange !== null) {
      if (periodProgress.scoreChange > 0) {
        return `Your average score increased by ${periodProgress.scoreChange.toFixed(
          1
        )}% between ${periodProgress.previousPeriodLabel} and ${periodProgress.currentPeriodLabel}.`;
      } else if (periodProgress.scoreChange < 0) {
        return `Average score adjusted by ${periodProgress.scoreChange.toFixed(
          1
        )}% relative to ${periodProgress.previousPeriodLabel}. Focus on high-weight assessments.`;
      }
    }
    if (averageAttendance !== null && averageAttendance >= attendanceTarget) {
      return `Attendance across your recorded courses (${averageAttendance}%) meets the institutional ${attendanceTarget}% standard.`;
    }
    if (averageScore !== null && averageScore >= 75) {
      return `Academic baseline is strong at ${averageScore}%. Continuous study activity helps sustain this performance bracket.`;
    }
    return null;
  }, [periodProgress, averageAttendance, attendanceTarget, averageScore]);

  // Real timestamp from latest record (Section 43)
  const lastUpdatedText = useMemo(() => {
    if (records.length > 0) {
      const sorted = [...records].sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      const first = sorted[0];
      if (first?.created_at) {
        return `Updated ${new Date(first.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
      }
    }
    return "Updated from active student records";
  }, [records]);

  if (isLoading || authLoading) {
    return <AnalyticsPageSkeleton />;
  }

  const hasAnyRecords = records.length > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header (Sections 2 & 3) */}
      <AnalyticsHeader
        hasRecords={hasAnyRecords}
        onOpenReportModal={() => setIsReportModalOpen(true)}
      />

      {/* 2. Welcome State if user has 0 records (Section 68) */}
      {!hasAnyRecords && (
        <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <div className="space-y-0.5">
              <h4 className="font-bold text-blue-950">Your analytics workspace is ready</h4>
              <p className="text-blue-800">
                Add your first academic evaluation to start building your longitudinal performance profile.
              </p>
            </div>
          </div>

          <Link href="/performance">
            <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
              Add Academic Record
            </Button>
          </Link>
        </div>
      )}

      {/* 3. Analytics Context Bar (Sections 4, 5, 6) */}
      <AnalyticsContextBar
        currentSemester={studentProfile?.semester || 1}
        currentYear={studentProfile?.year ? `Year ${studentProfile.year}` : "2025–2026"}
        lastUpdatedText={lastUpdatedText}
        selectedSemester={selectedSemester}
        selectedYear={selectedYear}
        selectedSubjectId={selectedSubjectId}
        onSemesterChange={handleSemesterChange}
        onYearChange={handleYearChange}
        onSubjectChange={handleSubjectChange}
        onResetFilters={handleResetFilters}
        availableSemesters={availableSemesters}
        availableYears={availableYears}
        subjects={subjects}
        totalRecordsCount={records.length}
        filteredRecordsCount={filteredRecords.length}
        isFiltering={isFiltering}
      />

      {/* 4. Top KPI Cards Row (Sections 7–11) */}
      <AnalyticsKpiCards
        averageScore={averageScore}
        cgpa={cgpaValue}
        averageAttendance={averageAttendance}
        totalStudyHours={totalStudyHours}
        filteredRecordsCount={filteredRecords.length}
        filteredActivitiesCount={filteredActivities.length}
        attendanceTarget={attendanceTarget}
        hasPreviousPeriod={periodProgress.hasPreviousPeriod}
        scoreChange={periodProgress.scoreChange}
        attendanceChange={periodProgress.attendanceChange}
        studyHoursChange={periodProgress.studyHoursChange}
      />

      {/* 5. Performance Trend Hero Visualization (Sections 12–16) */}
      <PerformanceTrendCard
        trendData={trendData}
        trendTimeframe={trendTimeframe}
        onTimeframeChange={setTrendTimeframe}
      />

      {/* 6. Subject Performance Comparison (Sections 17–20) */}
      <SubjectPerformanceCard
        subjects={subjectComparisonData}
        subjectSort={subjectSort}
        onSortChange={setSubjectSort}
        canCalculateImprovement={canCalculateImprovement}
      />

      {/* 7. Attendance Analysis & Study Activity Row (Sections 21–26) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <AttendanceAnalysisCard
          averageAttendance={averageAttendance}
          attendanceTarget={attendanceTarget}
          onTargetChange={setAttendanceTarget}
          records={filteredRecords}
          subjects={subjects}
        />

        <StudyActivityCard
          studyAnalytics={studyAnalytics}
          studyConsistency={studyConsistency}
          activities={filteredActivities}
        />
      </div>

      {/* 8. Grade Distribution & Score Distribution (Sections 27–28) */}
      <GradeAndScoreDistributionCards
        gradeDistribution={gradeDistribution}
        scoreDistribution={scoreDistribution}
        totalRecordsCount={filteredRecords.length}
      />

      {/* 9. Exploratory Relationships: Attendance & Study Hours Scatter (Sections 29–31) */}
      <ExploratoryScatterCards
        attendanceVsScoreData={attendanceVsScoreData}
        studyHoursVsScoreData={studyHoursVsScoreData}
      />

      {/* 10. Statistical Relationships: Correlation Matrix (Sections 32–34) */}
      <StatisticalCorrelationCard
        correlationMatrix={correlationMatrix}
        sampleSize={filteredRecords.length}
        minimumObservations={4}
      />

      {/* 11. Period Comparison & Personal Bests (Sections 35–36) */}
      <PeriodComparisonAndPersonalBests
        periodProgress={periodProgress}
        personalBests={personalBests}
      />

      {/* 12. Analytics Readiness (Data Completeness) (Sections 37–39) */}
      <AnalyticsReadinessCard
        completeness={completeness}
        hasSubjects={subjects.length > 0}
        hasRecords={records.length > 0}
        hasAttendance={records.some((r) => Number(r.attendance_percentage) > 0)}
        hasActivities={activities.length > 0}
      />

      {/* 13. Connected Intelligence & Quick Actions (Sections 46, 69, 70, 71) */}
      <ConnectedWorkspacesBar
        latestPrediction={latestPrediction}
        activeGoal={activeGoal}
        insightSnippet={insightSnippet}
      />

      {/* 14. Report Generation Modal (Section 44) */}
      <ReportGenerationModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        studentName={
          (user?.user_metadata?.full_name as string) ||
          user?.email?.split("@")[0] ||
          "Student"
        }
        semesterText={
          selectedSemester === "all" ? "All Semesters" : `Semester ${selectedSemester}`
        }
        totalRecords={filteredRecords.length}
      />
    </div>
  );
}
