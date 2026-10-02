"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  BookOpen,
  ArrowLeft,
  GraduationCap,
  CalendarCheck,
  TrendingUp,
  Sparkles,
  Bot,
  AlertCircle,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  BarChart3,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingState, EmptyState } from "@/components/ui/States";
import { useAuth } from "@/lib/auth-context";
import { Subject, AcademicRecord } from "@/types/academic";
import { getSubjectWithAnalytics } from "@/lib/academic/service";

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { studentProfile, isLoading: authLoading } = useAuth();

  const subjectId = params?.id as string;

  const [data, setData] = useState<{
    subject: Subject | null;
    records: AcademicRecord[];
    allStudentRecords: AcademicRecord[];
    summary: {
      latestScore: number | null;
      latestAttendance: number | null;
      latestGrade: string | null;
      averageMarks: number | null;
      isAboveAverage: boolean;
    };
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!studentProfile || !subjectId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const result = await getSubjectWithAnalytics(studentProfile.id, subjectId);
        setData(result);
      } catch (err) {
        console.error("Failed to load subject details:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (studentProfile) {
      load();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [studentProfile, subjectId, authLoading]);

  // Insights derived strictly from real records
  const insights = useMemo(() => {
    if (!data || !data.subject) return [];
    const list: string[] = [];
    const { summary, records } = data;

    if (summary.latestScore !== null && summary.averageMarks !== null) {
      if (summary.latestScore >= summary.averageMarks) {
        const diff = Math.round((summary.latestScore - summary.averageMarks) * 10) / 10;
        list.push(
          `Your recorded score (${summary.latestScore}%) is ${diff}% above your overall academic average (${summary.averageMarks}%).`
        );
      } else {
        const diff = Math.round((summary.averageMarks - summary.latestScore) * 10) / 10;
        list.push(
          `Your recorded score (${summary.latestScore}%) is ${diff}% below your overall academic average (${summary.averageMarks}%).`
        );
      }
    }

    if (summary.latestAttendance !== null) {
      if (summary.latestAttendance < 75) {
        list.push(
          `Attendance is at ${summary.latestAttendance}%, which is below your configured 75% target baseline.`
        );
      } else {
        list.push(
          `Attendance is healthy at ${summary.latestAttendance}%, meeting your target baseline.`
        );
      }
    }

    if (records.length >= 2) {
      const prev = records[records.length - 2];
      const curr = records[records.length - 1];
      if (curr.total_marks > prev.total_marks) {
        const diff = Math.round((curr.total_marks - prev.total_marks) * 10) / 10;
        list.push(
          `Your latest recorded score is higher than your previous record by +${diff} points (Sem ${prev.semester}: ${prev.total_marks}% \u2192 Sem ${curr.semester}: ${curr.total_marks}%).`
        );
      } else if (curr.total_marks < prev.total_marks) {
        const diff = Math.round((prev.total_marks - curr.total_marks) * 10) / 10;
        list.push(
          `Your latest recorded score dropped by -${diff} points relative to the previous evaluation (Sem ${prev.semester}: ${prev.total_marks}% \u2192 Sem ${curr.semester}: ${curr.total_marks}%).`
        );
      }
    }

    return list;
  }, [data]);

  // Chart data
  const trendData = useMemo(() => {
    if (!data || data.records.length === 0) return [];
    return data.records.map((r) => ({
      period: `Semester ${r.semester}`,
      semester: r.semester,
      score: r.total_marks,
      attendance: r.attendance_percentage,
      internal: r.internal_marks,
      assignment: r.assignment_marks,
      exam: r.exam_marks,
    }));
  }, [data]);

  if (isLoading || authLoading) {
    return <LoadingState message="Loading subject academic intelligence..." />;
  }

  if (!data || !data.subject) {
    return (
      <div className="space-y-6">
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Subjects", href: "/subjects" },
            { label: "Course Details" },
          ]}
          title="Course Not Found"
        />
        <EmptyState
          title="Subject Not Found"
          description="The requested course does not exist or does not belong to your academic profile."
          actionLabel="Back to Subjects"
          onAction={() => router.push("/subjects")}
          icon={<BookOpen className="w-6 h-6 text-blue-600" />}
        />
      </div>
    );
  }

  const { subject, records, summary } = data;
  const latestRec = records.length > 0 ? records[records.length - 1] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* 1. Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Subjects", href: "/subjects" },
          { label: subject.subject_name },
        ]}
        title={subject.subject_name}
        subtitle={`${subject.subject_code ? `${subject.subject_code} • ` : ""}${subject.credits} Credits • Semester ${subject.semester}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/subjects">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
                All Subjects
              </Button>
            </Link>
            {/* Requirement 24: Ask LearnTrack AI about this subject */}
            <Link
              href={`/assistant?subject=${encodeURIComponent(subject.id)}&name=${encodeURIComponent(subject.subject_name)}`}
            >
              <Button variant="primary" size="sm" leftIcon={<Bot className="w-3.5 h-3.5" />}>
                Ask LearnTrack AI about this subject
              </Button>
            </Link>
          </div>
        }
      />

      {/* 2. Key Academic Metrics (Score, Attendance, Internal, Assignment, Exam, Grade) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Score */}
        <Card className="p-4 border-slate-200 bg-white">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Total Score
          </span>
          <div className="text-xl font-bold text-slate-900 font-sans">
            {latestRec ? `${latestRec.total_marks}%` : "—"}
          </div>
          <span className="text-[10px] text-slate-500">Overall evaluation</span>
        </Card>

        {/* Attendance */}
        <Card className="p-4 border-slate-200 bg-white">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Attendance
          </span>
          <div className="text-xl font-bold text-slate-900 font-sans">
            {latestRec ? `${latestRec.attendance_percentage}%` : "—"}
          </div>
          <span className="text-[10px] text-slate-500">Recorded sessions</span>
        </Card>

        {/* Grade & Points */}
        <Card className="p-4 border-slate-200 bg-white">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Grade
          </span>
          <div className="text-xl font-bold text-blue-600 font-sans">
            {latestRec?.grade || "—"}
          </div>
          <span className="text-[10px] text-slate-500">
            {latestRec ? `${latestRec.grade_point} Points` : "Unassigned"}
          </span>
        </Card>

        {/* Internal Marks */}
        <Card className="p-4 border-slate-200 bg-white">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Internal
          </span>
          <div className="text-xl font-bold text-slate-900 font-sans">
            {latestRec ? `${latestRec.internal_marks}/30` : "—"}
          </div>
          <span className="text-[10px] text-slate-500">Continuous test</span>
        </Card>

        {/* Assignment Marks */}
        <Card className="p-4 border-slate-200 bg-white">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Assignment
          </span>
          <div className="text-xl font-bold text-slate-900 font-sans">
            {latestRec ? `${latestRec.assignment_marks}/20` : "—"}
          </div>
          <span className="text-[10px] text-slate-500">Homework & sets</span>
        </Card>

        {/* Exam Marks */}
        <Card className="p-4 border-slate-200 bg-white">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            End Exam
          </span>
          <div className="text-xl font-bold text-slate-900 font-sans">
            {latestRec ? `${latestRec.exam_marks}/50` : "—"}
          </div>
          <span className="text-[10px] text-slate-500">Final evaluation</span>
        </Card>
      </div>

      {/* 3. Deterministic Subject Insights (Requirement #23) */}
      <Card className="border-blue-100 bg-gradient-to-r from-blue-50/70 to-indigo-50/30">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 font-sans">Subject Intelligence</h3>
          </div>

          <div className="space-y-1.5 text-xs text-slate-700">
            {insights.length === 0 ? (
              <p className="text-slate-500">
                Log academic scores in Performance to activate deterministic subject insights.
              </p>
            ) : (
              insights.map((insight, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span>{insight}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 4. Score & Attendance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base text-slate-900">Score Progression</CardTitle>
            <CardDescription>
              Recorded marks across academic semesters for this course
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {trendData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-slate-400">
                No evaluation records logged for this course yet.
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="subjectScoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="period"
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, "Recorded Score"]}
                      contentStyle={{ borderRadius: "8px", fontSize: "11px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      fill="url(#subjectScoreGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Trend */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base text-slate-900">Attendance Trend</CardTitle>
            <CardDescription>Presence percentage across evaluation cycles</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {trendData.length === 0 ? (
              <div className="h-56 flex items-center justify-center text-xs text-slate-400">
                No attendance logs found for this course.
              </div>
            ) : (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="period"
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, "Attendance"]}
                      contentStyle={{ borderRadius: "8px", fontSize: "11px" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 5. Historical Records Table */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base text-slate-900">Course Assessment Records</CardTitle>
          <CardDescription>
            Chronological breakdown of recorded evaluations for this subject
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {records.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
              No continuous assessment entries logged. Add coursework scores in Performance.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                    <th className="py-2.5 px-3">Semester</th>
                    <th className="py-2.5 px-3">Internal (30)</th>
                    <th className="py-2.5 px-3">Assignment (20)</th>
                    <th className="py-2.5 px-3">Exam (50)</th>
                    <th className="py-2.5 px-3">Total Marks</th>
                    <th className="py-2.5 px-3">Attendance</th>
                    <th className="py-2.5 px-3">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        Semester {r.semester}
                      </td>
                      <td className="py-3 px-3">{r.internal_marks}</td>
                      <td className="py-3 px-3">{r.assignment_marks}</td>
                      <td className="py-3 px-3">{r.exam_marks}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{r.total_marks}%</td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-medium ${
                            r.attendance_percentage >= 75 ? "text-emerald-600" : "text-amber-600"
                          }`}
                        >
                          {r.attendance_percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-blue-600 px-2 py-0.5 rounded bg-blue-50">
                          {r.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
