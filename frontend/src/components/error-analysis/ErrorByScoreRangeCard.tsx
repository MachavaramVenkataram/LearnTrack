"use client";

import React, { useState } from "react";
import { Sliders, Info, AlertTriangle } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { Tooltip as UiTooltip } from "@/components/ui/Tooltip";
import { RangeSegmentItem } from "@/lib/api/mlOps";

export interface ErrorByScoreRangeCardProps {
  ranges?: RangeSegmentItem[];
}

// Custom rich tooltip declared outside component to prevent re-creation during render
function ScoreRangeTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-lg text-xs space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Segment Range
          </span>
          <span className="font-semibold text-slate-900">{label}</span>
        </div>

        {data.insufficient ? (
          <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>Insufficient observations (&lt; 5) for reliable calculation</span>
          </div>
        ) : (
          <div className="space-y-1 pt-0.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block" />
                Mean Absolute Error:
              </span>
              <span className="font-mono font-bold text-slate-900">
                {data.mae} pts
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 inline-block" />
                Root Mean Sq Error:
              </span>
              <span className="font-mono font-bold text-slate-900">
                {data.rmse} pts
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500">Evaluated Count:</span>
              <span className="font-mono text-slate-700 font-medium">
                {data.count} {data.count === 1 ? "sample" : "samples"}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
}

export function ErrorByScoreRangeCard({ ranges = [] }: ErrorByScoreRangeCardProps) {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const formattedData = ranges.map((r) => ({
    range: r.range_label,
    count: r.prediction_count,
    mae: r.insufficient_observations ? 0 : r.mae,
    rmse: r.insufficient_observations ? 0 : r.rmse,
    insufficient: r.insufficient_observations,
  }));

  const hasData = formattedData.length > 0;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Error by Score Range (MAE & RMSE)
            </h2>
            <UiTooltip content="Evaluates whether model accuracy remains stable or degrades in critical cohorts such as At-Risk or Advanced students.">
              <span className="cursor-help text-slate-400 hover:text-slate-600">
                <Info className="w-3.5 h-3.5" />
              </span>
            </UiTooltip>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-9">
            Evaluates whether predictive accuracy degrades in critical segments (e.g., At-Risk vs Advanced).
          </p>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="pt-2 flex-1 min-h-[260px]">
        {hasData ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedData}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  unit=" pts"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ScoreRangeTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#64748B",
                    paddingBottom: "12px",
                  }}
                />
                <Bar
                  dataKey="mae"
                  name="MAE (pts)"
                  fill="#2563EB"
                  radius={[4, 4, 0, 0]}
                  animationDuration={750}
                  opacity={hoveredBar && hoveredBar !== "mae" ? 0.35 : 1}
                  onMouseEnter={() => setHoveredBar("mae")}
                  onMouseLeave={() => setHoveredBar(null)}
                />
                <Bar
                  dataKey="rmse"
                  name="RMSE (pts)"
                  fill="#6366F1"
                  radius={[4, 4, 0, 0]}
                  animationDuration={850}
                  opacity={hoveredBar && hoveredBar !== "rmse" ? 0.35 : 1}
                  onMouseEnter={() => setHoveredBar("rmse")}
                  onMouseLeave={() => setHoveredBar(null)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Sliders className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">No score range data available</p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
              Observations required to benchmark errors across grade tiers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
