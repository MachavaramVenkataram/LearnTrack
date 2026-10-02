"use client";

import React from "react";
import { Sparkles, Info } from "lucide-react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Tooltip as UiTooltip } from "@/components/ui/Tooltip";
import { ScatterPoint } from "@/lib/api/mlOps";

export interface ResidualScatterCardProps {
  points?: ScatterPoint[];
}

// Custom privacy-safe tooltip (strictly NO student PII) declared outside component
function ScatterCustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isPositive = data.residual >= 0;

    return (
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 shadow-lg text-xs space-y-1.5 min-w-[190px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Sample Point
          </span>
          <span
            className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
              Math.abs(data.residual) <= 5
                ? "bg-emerald-50 text-emerald-700"
                : Math.abs(data.residual) <= 12
                ? "bg-amber-50 text-amber-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            |e| = {data.absError} pts
          </span>
        </div>

        <div className="space-y-1 pt-0.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Predicted Score:</span>
            <span className="font-mono font-bold text-slate-900">
              {data.predicted} pts
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Actual Score:</span>
            <span className="font-mono font-bold text-slate-900">
              {data.actual} pts
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-slate-500 font-medium">Residual (Actual − Pred):</span>
            <span
              className={`font-mono font-bold ${
                isPositive ? "text-blue-600" : "text-indigo-600"
              }`}
            >
              {isPositive ? `+${data.residual}` : data.residual} pts
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

export function ResidualScatterCard({ points = [] }: ResidualScatterCardProps) {
  const formattedPoints = points.map((p) => ({
    predicted: p.predicted,
    residual: p.residual,
    actual: p.actual,
    absError: p.absolute_error,
  }));

  const hasData = formattedPoints.length > 0;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-5 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Residuals vs. Predicted Score
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
              Heteroscedasticity Check
            </span>
            <UiTooltip content="Residual points plotted against Predicted values. Random, uniform dispersion along the zero reference line indicates homoscedasticity (constant error variance).">
              <span className="cursor-help text-slate-400 hover:text-slate-600">
                <Info className="w-3.5 h-3.5" />
              </span>
            </UiTooltip>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-9">
            Residual points (Actual − Predicted) vs. Predicted value. Desired pattern is random dispersion along zero line.
          </p>
        </div>
      </div>

      {/* Scatter Canvas */}
      <div className="pt-2 flex-1 min-h-[280px]">
        {hasData ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 20, left: -20, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  type="number"
                  dataKey="predicted"
                  name="Predicted"
                  domain={[20, 100]}
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  unit=" pts"
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="residual"
                  name="Residual"
                  domain={[-20, 20]}
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  unit=" pts"
                  axisLine={{ stroke: "#E2E8F0" }}
                  tickLine={false}
                />
                <Tooltip content={<ScatterCustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
                <ReferenceLine
                  y={0}
                  stroke="#94A3B8"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: "Zero Bias (e = 0)",
                    position: "right",
                    fill: "#94A3B8",
                    fontSize: 10,
                    fontWeight: 500,
                  }}
                />
                <Scatter
                  name="Observations"
                  data={formattedPoints}
                  fill="#2563EB"
                  fillOpacity={0.65}
                  stroke="#1D4ED8"
                  strokeWidth={1}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-72 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <Sparkles className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-600">No residual scatter observations</p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs">
              Predicted versus residual points will render when ground-truth outcomes are available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
