"use client";

import React, { useState } from "react";
import { BarChart2, Info } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Tooltip as UiTooltip } from "@/components/ui/Tooltip";
import { DistributionBin } from "@/lib/api/mlOps";

export interface ResidualDistributionCardProps {
  bins?: DistributionBin[];
}

// Custom rich tooltip declared outside component to prevent re-creation during render
function ResidualDistributionTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-lg text-xs space-y-1.5 min-w-[170px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Residual Range
          </span>
          <span className="font-mono font-bold text-slate-900">
            {data.range} pts
          </span>
        </div>
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-slate-500">Observations:</span>
          <span className="font-mono font-bold text-blue-600">
            {data.count} {data.count === 1 ? "sample" : "samples"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Share of Total:</span>
          <span className="font-mono font-semibold text-slate-700">
            {data.percentage}%
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export function ResidualDistributionCard({ bins = [] }: ResidualDistributionCardProps) {
  const [activeMetric, setActiveMetric] = useState<"count" | "percentage">("count");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const formattedData = bins.map((b, idx) => ({
    index: idx,
    range: `${b.bin_min} to ${b.bin_max}`,
    count: b.count,
    percentage: b.percentage,
    bin_min: b.bin_min,
    bin_max: b.bin_max,
  }));

  const hasData = formattedData.length > 0;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Residual Error Distribution
            </h2>
            <UiTooltip content="Histogram of residuals (Actual − Predicted). A symmetrical curve centered near 0 indicates unbiased calibration.">
              <span className="cursor-help text-slate-400 hover:text-slate-600">
                <Info className="w-3.5 h-3.5" />
              </span>
            </UiTooltip>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-9">
            Distribution of residuals (Actual − Predicted). Centered at 0 indicates unbiased calibration.
          </p>
        </div>

        {/* Chart View Toggle Toolbar */}
        {hasData && (
          <div className="flex items-center bg-[#F1F5F9] p-[2px] rounded-[8px] border border-[#E2E8F0] self-start shrink-0">
            <button
              type="button"
              onClick={() => setActiveMetric("count")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-[6px] transition-all cursor-pointer ${
                activeMetric === "count"
                  ? "bg-white text-blue-700 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Frequency
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric("percentage")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-[6px] transition-all cursor-pointer ${
                activeMetric === "percentage"
                  ? "bg-white text-blue-700 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Percentage (%)
            </button>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="pt-2 flex-1 min-h-[260px]">
        {hasData ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedData}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                onMouseMove={(state) => {
                  if (state && state.activeTooltipIndex !== undefined && state.activeTooltipIndex !== null) {
                    setHoveredIndex(Number(state.activeTooltipIndex));
                  }
                }}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  unit={activeMetric === "percentage" ? "%" : ""}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ResidualDistributionTooltip />} />
                <Bar
                  dataKey={activeMetric}
                  radius={[4, 4, 0, 0]}
                  animationDuration={700}
                >
                  {formattedData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        hoveredIndex === index
                          ? "#2563EB"
                          : hoveredIndex !== null
                          ? "#93C5FD"
                          : "#3B82F6"
                      }
                      className="transition-colors duration-150"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <BarChart2 className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">No histogram data available</p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
              Observations required to generate error frequency bins.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
