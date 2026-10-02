"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowUpDown,
  Plus,
  TrendingUp,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SubjectPerformanceItem } from "@/lib/academic/calculations";

export interface SubjectPerformanceSectionProps {
  subjects: SubjectPerformanceItem[];
}

export function SubjectPerformanceSection({ subjects }: SubjectPerformanceSectionProps) {
  const [sortBy, setSortBy] = useState<"highest" | "lowest" | "alphabetical">("highest");

  const sortedSubjects = useMemo(() => {
    return [...subjects].sort((a, b) => {
      if (sortBy === "highest") return b.score - a.score;
      if (sortBy === "lowest") return a.score - b.score;
      return a.subjectName.localeCompare(b.subjectName);
    });
  }, [subjects, sortBy]);

  const getGradeVariant = (grade: string) => {
    if (grade === "A+" || grade === "A") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (grade === "B+" || grade === "B") return "bg-blue-50 text-blue-700 border-blue-200";
    if (grade === "C" || grade === "D") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  return (
    <Card className="border-slate-200/90 shadow-card flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Subject Performance
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Continuous evaluation and attendance breakdown by course
          </CardDescription>
        </div>

        {subjects.length > 0 && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="highest">Highest Score</option>
              <option value="lowest">Lowest Score</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {subjects.length === 0 ? (
          <div className="m-4 py-8 px-4 text-center flex flex-col items-center justify-center space-y-2.5 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-slate-900 font-sans">No enrolled subjects yet</h4>
              <p className="text-[11.5px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                Add your semester courses to track continuous evaluation scores and attendance.
              </p>
            </div>
            <Link href="/subjects" className="pt-1">
              <Button variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-white">
                Add Subject
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedSubjects.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                {/* Course Name & Code */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm truncate">
                      {item.subjectName}
                    </span>
                    {item.subjectCode && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {item.subjectCode}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {item.credits} Credits • Semester {item.semester}
                  </div>
                </div>

                {/* Score & Attendance Metrics */}
                <div className="flex items-center gap-6 self-end sm:self-center shrink-0">
                  {/* Attendance Bar */}
                  <div className="w-28 space-y-1">
                    <div className="flex justify-between text-[11px] font-medium text-slate-500">
                      <span>Attendance</span>
                      <span
                        className={`font-semibold ${
                          item.attendance >= 75 ? "text-slate-800" : "text-rose-600"
                        }`}
                      >
                        {item.attendance}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.attendance >= 85
                            ? "bg-emerald-500"
                            : item.attendance >= 75
                            ? "bg-blue-600"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, item.attendance))}%` }}
                      />
                    </div>
                  </div>

                  {/* Total Score & Grade Badge */}
                  <div className="text-right min-w-[70px]">
                    <div className="font-bold text-sm text-slate-900 font-mono">
                      {item.score > 0 ? `${item.score}%` : "—"}
                    </div>
                    <div className="pt-0.5">
                      {item.score > 0 ? (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getGradeVariant(
                            item.grade
                          )}`}
                        >
                          Grade {item.grade}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">No record</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
