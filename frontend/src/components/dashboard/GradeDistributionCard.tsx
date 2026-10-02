"use client";

import React, { useMemo } from "react";
import { Award, PieChart as PieIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

export interface GradeDistributionCardProps {
  distribution: Record<string, number>;
  totalRecords: number;
}

export function GradeDistributionCard({
  distribution,
  totalRecords,
}: GradeDistributionCardProps) {
  const chartData = useMemo(() => {
    const grades = ["A+", "A", "B+", "B", "C", "D", "F"];
    const colors: Record<string, string> = {
      "A+": "#2563eb",
      A: "#3b82f6",
      "B+": "#60a5fa",
      B: "#93c5fd",
      C: "#cbd5e1",
      D: "#f59e0b",
      F: "#ef4444",
    };

    return grades.map((g) => ({
      grade: g,
      count: distribution[g] || 0,
      percentage: totalRecords > 0 ? Math.round(((distribution[g] || 0) / totalRecords) * 100) : 0,
      color: colors[g] || "#94a3b8",
    }));
  }, [distribution, totalRecords]);

  const hasData = totalRecords > 0;

  return (
    <Card className="border-slate-200/90 shadow-card flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Award className="w-4 h-4 text-blue-600" />
          Grade Distribution
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 mt-0.5">
          {hasData
            ? `Coursework grade spread across ${totalRecords} record${totalRecords !== 1 ? "s" : ""}`
            : "Breakdown of completed course grades"}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        {!hasData ? (
          <div className="py-8 px-4 text-center flex flex-col items-center justify-center space-y-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <PieIcon className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-slate-900 font-sans">No grades recorded yet</h4>
              <p className="text-[11.5px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                Completed course marks will populate this grade tier breakdown (A+ to F).
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Horizontal Bar Chart */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="grade"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }}
                    width={28}
                  />
                  <Tooltip
                    formatter={(val: any) => [`${val} courses`, "Total"]}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      fontSize: "11px",
                      padding: "6px 10px",
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={14}>
                    {chartData.map((entry) => (
                      <Cell key={entry.grade} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Compact Breakdown Tags */}
            <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100 text-center">
              {chartData.slice(0, 4).map((item) => (
                <div key={item.grade} className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-600">{item.grade}</div>
                  <div className="text-xs font-extrabold text-slate-900 mt-0.5">{item.count}</div>
                  <div className="text-[9px] text-slate-400">{item.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
