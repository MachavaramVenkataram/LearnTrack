"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  GraduationCap,
  Plus,
  BookOpen,
  TrendingUp,
  Clock,
  BarChart3,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Student } from "@/types/academic";

export interface WelcomeHeaderProps {
  fullName?: string;
  student: Student | null;
  trendDirection?: string;
  subjectsCount?: number;
  recordsCount?: number;
  activitiesCount?: number;
  onAddSubject?: () => void;
  onAddRecord?: () => void;
  onLogStudy?: () => void;
}

export function WelcomeHeader({
  fullName = "Student",
  student,
  trendDirection,
  subjectsCount = 0,
  recordsCount = 0,
  activitiesCount = 0,
}: WelcomeHeaderProps) {
  const firstName = fullName.split(" ")[0] || "Student";

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  // Formatted date string
  const dateString = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  // Format clean department string if duplicated
  const cleanDepartment = useMemo(() => {
    if (!student?.department) return "";
    const dept = student.department.trim();
    const half = Math.floor(dept.length / 2);
    if (dept.length >= 6 && dept.substring(0, half) === dept.substring(half)) {
      return dept.substring(0, half);
    }
    return dept;
  }, [student?.department]);

  // Onboarding setup steps progress (Section 30 & 31)
  const setupSteps = [
    { id: "subjects", title: "Add Subjects", isDone: subjectsCount > 0, href: "/subjects" },
    { id: "records", title: "Academic Records", isDone: recordsCount > 0, href: "/performance" },
    { id: "activity", title: "Study Activity", isDone: activitiesCount > 0, href: "/study" },
  ];
  const completedCount = setupSteps.filter((s) => s.isDone).length;
  const isSetupIncomplete = completedCount < 3;

  return (
    <div className="space-y-4 pb-1">
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Title & Metadata */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{dateString}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            {greeting}, {firstName}.
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            {trendDirection === "up"
              ? "Your performance is trending upward this semester."
              : "Your academic workspace at a glance."}
          </p>

          {student && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
              <span className="font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100/80 text-[11px]">
                Semester {student.semester}
              </span>
              {cleanDepartment && (
                <span className="font-medium text-slate-600 px-2 py-0.5 rounded-md bg-slate-100 text-[11px]">
                  {cleanDepartment}
                </span>
              )}
              <span className="text-slate-500 px-2 py-0.5 rounded-md bg-slate-100 text-[11px]">
                Year {student.year} {student.section ? `• Sec ${student.section}` : ""}
              </span>
              {student.university && (
                <span className="text-slate-500 hidden sm:inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[11px] truncate max-w-[240px]">
                  {student.university}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions (Section 13 & 52) */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <Link href="/performance">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="shadow-sm"
            >
              Add Academic Record
            </Button>
          </Link>

          <Link href="/subjects">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<BookOpen className="w-3.5 h-3.5 text-slate-600" />}
              className="hover:border-blue-300 hover:text-blue-700 bg-white"
            >
              Add Subject
            </Button>
          </Link>

          <Link href="/study">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Clock className="w-3.5 h-3.5 text-slate-600" />}
              className="hover:border-indigo-300 hover:text-indigo-700 bg-white"
            >
              Record Study Session
            </Button>
          </Link>

          <Link href="/analytics" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 transition-colors">
            <span>View Analytics</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Onboarding State: Progress Setup Banner (Sections 30 & 31) */}
      {isSetupIncomplete && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50/60 border border-blue-100/90 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 font-sans">
                Complete your LearnTrack setup
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-mono text-[10.5px] font-semibold">
                {completedCount} of 3 completed
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Add your coursework subjects, records, and study routines to unlock predictive intelligence and trajectory forecasts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {setupSteps.map((step, idx) => (
              <Link
                key={step.id}
                href={step.href}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                  step.isDone
                    ? "bg-emerald-50/80 text-emerald-800 border-emerald-200"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-700 shadow-2xs"
                }`}
              >
                {step.isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[9px] font-mono text-slate-500">
                    {idx + 1}
                  </span>
                )}
                <span>{step.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

