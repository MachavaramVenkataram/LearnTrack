"use client";

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  ArrowUpRight,
  ChevronRight,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface SubjectComparisonItem {
  id: string;
  name: string;
  code: string;
  score: number;
  attendance: number;
  credits: number;
  grade: string;
  trend?: number | null; // improvement if calculated
}

export interface SubjectPerformanceCardProps {
  subjects: SubjectComparisonItem[];
  subjectSort: "highest" | "lowest" | "alphabetical" | "improved";
  onSortChange: (sort: "highest" | "lowest" | "alphabetical" | "improved") => void;
  canCalculateImprovement: boolean;
}

export function SubjectPerformanceCard({
  subjects,
  subjectSort,
  onSortChange,
  canCalculateImprovement,
}: SubjectPerformanceCardProps) {
  const hasSubjects = subjects.length > 0;

  const getGradeBadgeStyle = (grade: string) => {
    if (grade.startsWith("A")) return "text-emerald-700 bg-emerald-50 border-emerald-200/80";
    if (grade.startsWith("B")) return "text-blue-700 bg-blue-50 border-blue-200/80";
    if (grade.startsWith("C")) return "text-amber-700 bg-amber-50 border-amber-200/80";
    if (grade === "—") return "text-slate-500 bg-slate-100 border-slate-200";
    return "text-rose-700 bg-rose-50 border-rose-200/80";
  };

  const getScoreBarStyle = (score: number) => {
    if (score >= 80) return "bg-blue-600";
    if (score >= 65) return "bg-indigo-600";
    if (score >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <Card className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-150">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <BookOpen className="w-3.5 h-3.5" />
            </span>
            Subject Performance
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Compare academic performance across your registered subjects. Click any course to view details.
          </CardDescription>
        </div>

        {/* Sort Controls (Section 17) */}
        {hasSubjects && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-400 font-medium">Sort by:</span>
            <select
              className="h-8 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 text-xs font-medium text-slate-700 focus:outline-hidden focus:bg-white focus:border-blue-600 cursor-pointer"
              value={subjectSort}
              onChange={(e) => onSortChange(e.target.value as any)}
              aria-label="Sort subjects by"
            >
              <option value="highest">Highest Score</option>
              <option value="lowest">Lowest Score</option>
              <option value="alphabetical">Alphabetical</option>
              {canCalculateImprovement && (
                <option value="improved">Most Improved</option>
              )}
            </select>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4 pb-5">
        {!hasSubjects ? (
          /* Empty State (Section 20: No subject performance available) */
          <div className="py-12 px-4 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">No subject performance available</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Register your subjects and add evaluation records to compare academic performance.
              </p>
            </div>
            <div className="pt-1">
              <Link href="/subjects">
                <Button variant="primary" size="sm" leftIcon={<PlusCircle className="w-3.5 h-3.5" />}>
                  Add Subject
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {subjects.map((sub) => (
              <Link
                key={sub.id}
                href={`/subjects/${sub.id}`}
                className={cn(
                  "group block p-3.5 sm:p-4 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/60 hover:border-blue-200",
                  "transition-all duration-160 ease-out hover:-translate-y-0.5 hover:shadow-2xs cursor-pointer"
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Code, Name, Credits */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {sub.code && (
                        <span className="font-mono text-[11px] font-bold text-slate-500 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 shrink-0">
                          {sub.code}
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                        {sub.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>{sub.credits} credits</span>
                      {sub.attendance > 0 && (
                        <>
                          <span>•</span>
                          <span>{sub.attendance}% attendance</span>
                        </>
                      )}
                      {sub.trend !== undefined && sub.trend !== null && (
                        <>
                          <span>•</span>
                          <span
                            className={cn(
                              "font-medium flex items-center gap-0.5",
                              sub.trend > 0
                                ? "text-emerald-600"
                                : sub.trend < 0
                                ? "text-rose-600"
                                : "text-slate-500"
                            )}
                          >
                            {sub.trend > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : sub.trend < 0 ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : null}
                            {sub.trend > 0 ? `+${sub.trend}%` : `${sub.trend}%`} trend
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Score, Grade Pill, Progress Bar */}
                  <div className="flex items-center gap-4 sm:gap-6 shrink-0 justify-between sm:justify-end">
                    <div className="w-28 sm:w-36 hidden sm:block">
                      <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                        <span>Score</span>
                        <span className="font-bold text-slate-700">{sub.score}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all duration-300", getScoreBarStyle(sub.score))}
                          style={{ width: `${Math.min(100, Math.max(0, sub.score))}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right sm:hidden">
                        <span className="text-sm font-bold text-slate-900">{sub.score}%</span>
                      </div>

                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-lg border text-xs font-black min-w-[34px] text-center",
                          getGradeBadgeStyle(sub.grade)
                        )}
                      >
                        {sub.grade}
                      </span>

                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
