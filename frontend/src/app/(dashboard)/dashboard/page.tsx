"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  CalendarCheck,
  Clock,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { ErrorState } from "@/components/ui/States";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { PerformanceOverviewChart } from "@/components/dashboard/PerformanceOverviewChart";
import { SubjectPerformanceSection } from "@/components/dashboard/SubjectPerformanceSection";
import { GradeDistributionCard } from "@/components/dashboard/GradeDistributionCard";
import { AttendanceOverviewCard } from "@/components/dashboard/AttendanceOverviewCard";
import { StudyActivitySection } from "@/components/dashboard/StudyActivitySection";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { DataInsightsCard } from "@/components/dashboard/DataInsightsCard";
import { TodayStudyPlanCard } from "@/components/dashboard/TodayStudyPlanCard";
import { TodaysLearningCard } from "@/components/dashboard/TodaysLearningCard";
import { DashboardCommandStrip } from "@/components/dashboard/DashboardCommandStrip";
import { YourGoalsWidget } from "@/components/dashboard/YourGoalsWidget";
import { useAuth } from "@/lib/auth-context";
import { getDashboardData, DashboardData } from "@/lib/academic/service";

export default function DashboardPage() {
  const { user, profile, studentProfile, isLoading: authLoading } = useAuth();
  const userId = user?.id;

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!userId) return;
    setError(null);
    try {
      const result = await getDashboardData(userId);
      setData(result);
    } catch (err: unknown) {
      console.error("Dashboard data load error:", err);
      setError(err instanceof Error ? err.message : "Failed to retrieve your academic data.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (!authLoading && userId) {
      timer = setTimeout(() => {
        void fetchDashboard();
      }, 0);
    } else if (!authLoading && !userId) {
      timer = setTimeout(() => {
        setIsLoading(false);
      }, 0);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [authLoading, userId, fetchDashboard]);

  // Loading State with Skeletons matching Section 24
  if (isLoading || authLoading) {
    return <DashboardSkeleton />;
  }

  // Error State with Retry Button matching Section 26
  if (error) {
    return (
      <ErrorState
        title="We couldn't load your academic data."
        description="A connectivity issue prevented retrieving your coursework records. Please retry."
        onRetry={fetchDashboard}
      />
    );
  }

  // Onboarding prompt if user has no student profile yet
  if (!studentProfile) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        <WelcomeHeader
          fullName={profile?.full_name || user?.email || "Student"}
          student={null}
        />

        <Card className="border-blue-200 bg-gradient-to-r from-blue-50/70 to-indigo-50/40 shadow-card">
          <CardContent className="p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-blue-100/80 border border-blue-200 flex items-center justify-center text-blue-700 mx-auto shadow-soft-sm">
              <GraduationCap className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-sans">
                Your academic journey starts here.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Connect your university, department, and semester standing to unlock LearnTrack&apos;s real-time analytics and predictive trajectory features.
              </p>
            </div>

            <div className="pt-2">
              <Link href="/onboarding">
                <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Set Up Academic Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Destructure real calculated data
  const summary = data?.summary;
  const trend = data?.trend;
  const subjects = data?.subjects || [];
  const records = data?.records || [];
  const activities = data?.activities || [];
  const subjectPerformance = data?.subjectPerformance || [];
  const insights = data?.insights || [];
  const recentActivities = data?.recentActivities || [];

  // Motion animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* 1. Welcome Header with Onboarding Progression Banner (Sections 12, 13, 30, 31, 52) */}
      <motion.div variants={itemVariants}>
        <WelcomeHeader
          fullName={profile?.full_name || user?.email || "Student"}
          student={studentProfile}
          trendDirection={trend?.direction}
          subjectsCount={subjects.length}
          recordsCount={records.length}
          activitiesCount={activities.length}
        />
      </motion.div>

      {/* 2. KPI Metric Strip with Primary Visual Hierarchy (Sections 14 & 15) */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Primary Metric: Overall Performance */}
        <StatCard
          title="Overall Performance"
          value={summary?.averageMarks !== null && summary?.averageMarks !== undefined ? `${summary.averageMarks}%` : "—"}
          trendText={trend?.label || "No previous data"}
          trend={trend?.direction || "flat"}
          subtitle={
            summary?.averageMarks !== null && summary?.averageMarks !== undefined
              ? `Across ${records.length} course evaluation${records.length !== 1 ? "s" : ""}`
              : "Add academic records to calculate"
          }
          icon={<TrendingUp className="w-4 h-4" />}
          iconBg="bg-blue-600 text-white shadow-2xs"
          className="border-blue-200/90 bg-gradient-to-b from-white to-blue-50/20"
        />

        {/* Secondary KPI: Current CGPA */}
        <StatCard
          title="Current CGPA"
          value={summary?.cgpa !== null && summary?.cgpa !== undefined ? summary.cgpa.toFixed(2) : "—"}
          subtitle={
            summary?.cgpa !== null && summary?.cgpa !== undefined
              ? "Credit-weighted (10.0 scale)"
              : "Insufficient credit data"
          }
          icon={<GraduationCap className="w-4 h-4" />}
          iconBg="bg-indigo-50 text-indigo-600"
        />

        {/* Secondary KPI: Attendance */}
        <StatCard
          title="Attendance"
          value={
            summary?.averageAttendance !== null && summary?.averageAttendance !== undefined
              ? `${summary.averageAttendance}%`
              : "—"
          }
          trendText={
            summary?.averageAttendance !== null && summary?.averageAttendance !== undefined
              ? summary.averageAttendance >= 75
                ? "Above 75% Target"
                : "Below 75% Target"
              : undefined
          }
          trend={
            summary?.averageAttendance !== null && summary?.averageAttendance !== undefined
              ? summary.averageAttendance >= 75
                ? "up"
                : "down"
              : "flat"
          }
          subtitle={
            summary?.averageAttendance !== null && summary?.averageAttendance !== undefined
              ? "Institutional baseline: 75%"
              : "Add records to calculate"
          }
          icon={<CalendarCheck className="w-4 h-4" />}
          iconBg="bg-emerald-50 text-emerald-600"
        />

        {/* Secondary KPI: Study Hours */}
        <StatCard
          title="Study Hours"
          value={summary && summary.totalStudyHours > 0 ? `${summary.totalStudyHours}h` : "—"}
          subtitle={
            summary && summary.totalStudyHours > 0
              ? `${summary.averageDailyStudyHours}h daily avg`
              : "Record study activity to log time"
          }
          icon={<Clock className="w-4 h-4" />}
          iconBg="bg-amber-50 text-amber-600"
        />
      </motion.div>

      {/* 2.5. STUDENT COMMAND CENTER PULSE (Section 33 Premium Dashboard Integration) */}
      <motion.div variants={itemVariants}>
        <DashboardCommandStrip userId={userId || "demo-student"} />
      </motion.div>

      {/* 2.6. TODAY'S LEARNING (Section 31 AI Learning OS Expansion) */}
      <motion.div variants={itemVariants}>
        <TodaysLearningCard totalStudyHours={summary?.totalStudyHours || 0} />
      </motion.div>

      {/* 3. Primary Workspace Row: Performance Overview (2/3) + AI Performance Insights (1/3) (Sections 17, 27, 29) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceOverviewChart records={records} subjects={subjects} />
        </div>
        <div className="lg:col-span-1">
          <DataInsightsCard insights={insights} />
        </div>
      </motion.div>

      {/* 4. Coursework Performance Row: Subject Performance (2/3) + Grade Distribution (1/3) (Sections 20 & 21) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SubjectPerformanceSection subjects={subjectPerformance} />
        </div>
        <div className="lg:col-span-1">
          <GradeDistributionCard
            distribution={summary?.gradeDistribution || {}}
            totalRecords={records.length}
          />
        </div>
      </motion.div>

      {/* 5. Habits & Accountability Row: Attendance Overview (1/2) + Study Activity (1/2) (Sections 22 & 23) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <AttendanceOverviewCard
            subjects={subjectPerformance}
            averageAttendance={summary?.averageAttendance ?? null}
            targetThreshold={75}
          />
        </div>
        <div>
          <StudyActivitySection
            activities={activities}
            totalHours={summary?.totalStudyHours || 0}
            averageDailyHours={summary?.averageDailyStudyHours || 0}
          />
        </div>
      </motion.div>

      {/* 6. Execution & Action Row: Today's Study Plan (1/2) + Your Goals (1/2) (Sections 24 & 25) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <TodayStudyPlanCard />
        </div>
        <div>
          <YourGoalsWidget />
        </div>
      </motion.div>

      {/* 7. Audit & Event Trail: Recent Activity (Section 26) */}
      <motion.div variants={itemVariants}>
        <RecentActivityCard activities={recentActivities} />
      </motion.div>
    </motion.div>
  );
}
