"use client";

import React from "react";
import { cn, getGradeBadgeVariant } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { SubjectRecord } from "@/lib/types";

export interface DataTableProps {
  subjects: SubjectRecord[];
  onRowClick?: (subject: SubjectRecord) => void;
  className?: string;
}

export function SubjectTable({ subjects, onRowClick, className }: DataTableProps) {
  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/60">
            <th className="py-3 px-4 rounded-l-xl">Subject</th>
            <th className="py-3 px-4">Credits</th>
            <th className="py-3 px-4">Score</th>
            <th className="py-3 px-4">Grade</th>
            <th className="py-3 px-4">Attendance</th>
            <th className="py-3 px-4 rounded-r-xl text-center">Trend</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {subjects.map((item) => {
            const gradeStyles = getGradeBadgeVariant(item.grade);
            return (
              <tr
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "hover:bg-slate-50/80 transition-colors group",
                  onRowClick && "cursor-pointer"
                )}
              >
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.subject}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {item.code}
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-600 font-medium">
                  {item.credits}
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900 font-sans">
                  {item.score}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border",
                      gradeStyles.bg,
                      gradeStyles.color,
                      gradeStyles.border
                    )}
                  >
                    {item.grade}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs font-semibold",
                        item.attendance >= 85
                          ? "text-emerald-700"
                          : item.attendance >= 75
                          ? "text-blue-700"
                          : "text-rose-700"
                      )}
                    >
                      {item.attendance}%
                    </span>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          item.attendance >= 85
                            ? "bg-emerald-500"
                            : item.attendance >= 75
                            ? "bg-blue-600"
                            : "bg-rose-500"
                        )}
                        style={{ width: `${item.attendance}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                      item.trend === "up" && "bg-emerald-50 text-emerald-700",
                      item.trend === "down" && "bg-rose-50 text-rose-700",
                      item.trend === "stable" && "bg-slate-100 text-slate-600"
                    )}
                  >
                    {item.trend === "up" && <TrendingUp className="w-3.5 h-3.5" />}
                    {item.trend === "down" && <TrendingDown className="w-3.5 h-3.5" />}
                    {item.trend === "stable" && <Minus className="w-3.5 h-3.5" />}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
