"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Download,
  FileCode,
  FileSpreadsheet,
  Check,
  CheckCircle2,
  Lock,
  Database,
  KeyRound,
  Loader2,
  Info,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { exportStudentAcademicData } from "@/lib/academic/service";
import { UserProfile } from "@/lib/auth-context";
import { Student } from "@/types/academic";

interface SecurityPrivacySectionProps {
  userEmail: string;
  userId: string;
  profile: UserProfile | null;
  studentProfile: Student | null;
}

export function SecurityPrivacySection({
  userEmail,
  userId,
  profile,
  studentProfile,
}: SecurityPrivacySectionProps) {
  const { showToast } = useToast();
  const [isExportingJson, setIsExportingJson] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [jsonExportSuccess, setJsonExportSuccess] = useState(false);
  const [csvExportSuccess, setCsvExportSuccess] = useState(false);

  // Real Export JSON
  const handleExportJSON = async () => {
    try {
      setIsExportingJson(true);
      setJsonExportSuccess(false);

      const targetId = studentProfile?.id || userId || "student";
      const exportData = await exportStudentAcademicData(targetId);

      const payload = {
        app: "LearnTrack Academic Intelligence",
        version: "1.0.0",
        exported_at: new Date().toISOString(),
        student: {
          id: targetId,
          roll_number: studentProfile?.roll_number || profile?.rollNumber || "LT-STUDENT",
          full_name: profile?.full_name || profile?.fullName || "Student",
          email: profile?.email || userEmail,
          university: studentProfile?.university || profile?.university || "Institute of Technology & Science",
          department: studentProfile?.department || profile?.department || "Computer Science & Engineering",
          year: studentProfile?.year || profile?.year || 1,
          semester: studentProfile?.semester || profile?.semester || 1,
        },
        academic_records: exportData.records,
        subjects: exportData.subjects,
        study_activities: exportData.study_activities,
        goals: exportData.goals,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `learntrack-academic-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setJsonExportSuccess(true);
      showToast("Export Ready", "Academic data downloaded as JSON successfully.", "success");
      setTimeout(() => setJsonExportSuccess(false), 4000);
    } catch (err: unknown) {
      console.error("Export JSON failed:", err);
      showToast("Export Failed", "Unable to compile JSON export. Please try again.", "error");
    } finally {
      setIsExportingJson(false);
    }
  };

  // Real Export CSV
  const handleExportCSV = async () => {
    try {
      setIsExportingCsv(true);
      setCsvExportSuccess(false);

      const targetId = studentProfile?.id || userId || "student";
      const exportData = await exportStudentAcademicData(targetId);

      const headers = [
        "Subject Name",
        "Subject Code",
        "Semester",
        "Credits",
        "Attendance %",
        "Assignment Marks",
        "Internal Marks",
        "Exam Marks",
        "Total Marks",
        "Grade",
      ];

      const rows = exportData.records.map((r) => {
        const sub = exportData.subjects.find((s) => s.id === r.subject_id);
        return [
          `"${(sub?.subject_name || "Unknown").replace(/"/g, '""')}"`,
          `"${sub?.subject_code || ""}"`,
          r.semester,
          sub?.credits || 3,
          r.attendance_percentage,
          r.assignment_marks,
          r.internal_marks,
          r.exam_marks ?? "",
          r.total_marks,
          `"${r.grade}"`,
        ].join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `learntrack-coursework-records-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setCsvExportSuccess(true);
      showToast("Export Ready", "Academic coursework records downloaded as CSV.", "success");
      setTimeout(() => setCsvExportSuccess(false), 4000);
    } catch (err: unknown) {
      console.error("Export CSV failed:", err);
      showToast("Export Failed", "Unable to compile CSV export. Please try again.", "error");
    } finally {
      setIsExportingCsv(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Security Overview Card */}
      <Card>
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Security Status
            </CardTitle>
            <CardDescription>
              Authenticated session protection and database isolation guarantees
            </CardDescription>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Account protected
          </span>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900">Database Isolation</p>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  PostgreSQL Row-Level Security strictly confines queries to your verified user ID.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900">Authentication</p>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Supabase JWT access token with rotating cryptographic session verification.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900">Session Security</p>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Encrypted HTTPS cookie transmission and secure client middleware boundary.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900">Encryption at Rest</p>
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                    Enforced
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Encrypted with AES-256 storage standards on Supabase managed infrastructure.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-blue-200/80 bg-blue-50/40 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900">AI Intelligence Provider</p>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded border border-blue-200">
                    Google Gemini
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Connected
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  LearnTrack AI • Server-side API key protection with zero browser credential exposure.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Privacy Policy Card */}
      <Card>
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle className="text-base text-slate-900">Your Data & Privacy</CardTitle>
          <CardDescription>
            Transparency guidelines on how your academic records are handled
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Your LearnTrack academic data is exclusively associated with your authenticated account and is protected by the application&apos;s access controls. Coursework marks, continuous assessment grades, and attendance logs are queried strictly for your predictive model inference and study planning.
          </p>
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-800 leading-relaxed">
              LearnTrack does not sell student data, expose grades to unauthenticated parties, or utilize private student transcripts to train public foundation models without explicit institutional consent.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Export My Data Card */}
      <Card>
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle className="text-base text-slate-900 flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-600" />
            Export My Data
          </CardTitle>
          <CardDescription>
            Download an unredacted copy of your complete LearnTrack academic records and study history
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* JSON Export Card */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <FileCode className="w-5 h-5" />
                </div>
                <h5 className="text-xs font-bold text-slate-900 pt-1">
                  Complete Structured JSON
                </h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Full dataset export including subject catalog, semester records, study session history, and academic target goals.
                </p>
              </div>

              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportJSON}
                  disabled={isExportingJson}
                  className="w-full text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 h-9 cursor-pointer"
                >
                  {isExportingJson ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>Preparing JSON Export...</span>
                    </>
                  ) : jsonExportSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                      <span className="text-emerald-700 font-bold">Download Ready ✓</span>
                    </>
                  ) : (
                    <span>Export as JSON (.json)</span>
                  )}
                </Button>
              </div>
            </div>

            {/* CSV Export Card */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h5 className="text-xs font-bold text-slate-900 pt-1">
                  Coursework Records CSV
                </h5>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Tabular spreadsheet format containing subject codes, credits, attendance percentages, assessment scores, and final letter grades.
                </p>
              </div>

              <div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  disabled={isExportingCsv}
                  className="w-full text-xs font-semibold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 h-9 cursor-pointer"
                >
                  {isExportingCsv ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      <span>Preparing CSV Export...</span>
                    </>
                  ) : csvExportSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
                      <span className="text-emerald-700 font-bold">Download Ready ✓</span>
                    </>
                  ) : (
                    <span>Export Coursework as CSV (.csv)</span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Export Privacy Notice */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 leading-relaxed flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Your export contains only data available to your authenticated LearnTrack account. Passwords, authentication secrets, and system credentials are never included.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
