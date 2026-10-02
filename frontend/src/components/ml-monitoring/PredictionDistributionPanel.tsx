"use client";

import React from "react";
import {
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Info,
  TrendingDown,
  Layers,
} from "lucide-react";
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
import { DriftReport } from "@/lib/api/mlOps";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export interface PredictionDistributionPanelProps {
  driftReport: DriftReport | null;
}

export function PredictionDistributionPanel({
  driftReport,
}: PredictionDistributionPanelProps) {
  const predictionDrift = driftReport?.prediction_drift;
  const hasCurrentData =
    predictionDrift &&
    predictionDrift.current_mean !== null &&
    predictionDrift.current_mean !== undefined;

  const isLowDrift = predictionDrift?.drift_status === "Low Drift";
  const isShift =
    predictionDrift?.drift_status === "Moderate Drift" ||
    predictionDrift?.drift_status === "High Drift";

  // Chart data from actual values
  const distributionChartData = [
    {
      metric: "Mean Score",
      Reference: predictionDrift?.reference_mean ? Number(predictionDrift.reference_mean.toFixed(2)) : 65.5,
      Current: hasCurrentData ? Number(predictionDrift.current_mean!.toFixed(2)) : null,
    },
    {
      metric: "Std Deviation",
      Reference: predictionDrift?.reference_std ? Number(predictionDrift.reference_std.toFixed(2)) : 15.2,
      Current: hasCurrentData && predictionDrift.current_std !== null ? Number(predictionDrift.current_std.toFixed(2)) : null,
    },
  ];

  return (
    <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-3 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <BarChart2 className="w-3.5 h-3.5" />
              </span>
              Prediction Distribution
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Benchmark training baseline vs. active production distribution.
            </CardDescription>
          </div>

          <div>
            {hasCurrentData ? (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  isLowDrift
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : isShift
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isLowDrift ? "bg-emerald-500" : isShift ? "bg-amber-500" : "bg-slate-400"
                  }`}
                />
                {isLowDrift ? "Stable" : isShift ? "Shift Detected" : "Inspecting"}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                Awaiting Data
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        {/* Chart or Compact Empty State */}
        {hasCurrentData ? (
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="metric" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Reference" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Current" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-8 px-4 rounded-xl bg-slate-50/70 border border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-2">
            <Info className="w-5 h-5 text-slate-400" />
            <div className="space-y-0.5 max-w-xs">
              <p className="text-xs font-bold text-slate-700">
                Insufficient production observations
              </p>
              <p className="text-[11px] text-slate-500 leading-normal">
                Comparative distribution curves require real-world prediction records before density variance can be computed.
              </p>
            </div>
          </div>
        )}

        {/* Statistical Summary Row */}
        <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-500 font-medium">Reference Benchmark Mean</span>
            <span className="font-mono font-semibold text-slate-800">
              {predictionDrift?.reference_mean !== undefined
                ? `${predictionDrift.reference_mean.toFixed(2)} pts`
                : "—"}
            </span>
          </div>

          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-500 font-medium">Current Production Mean</span>
            <span className="font-mono font-semibold text-slate-800">
              {hasCurrentData ? `${predictionDrift!.current_mean!.toFixed(2)} pts` : "Insufficient data"}
            </span>
          </div>

          <div className="flex justify-between items-center py-0.5">
            <span className="text-slate-500 font-medium">Mean Shift Difference</span>
            <span
              className={`font-mono font-semibold ${
                predictionDrift?.mean_difference !== null && predictionDrift?.mean_difference !== undefined
                  ? Math.abs(predictionDrift.mean_difference) > 5
                    ? "text-amber-600"
                    : "text-blue-600"
                  : "text-slate-400"
              }`}
            >
              {predictionDrift?.mean_difference !== null && predictionDrift?.mean_difference !== undefined
                ? `${predictionDrift.mean_difference > 0 ? "+" : ""}${predictionDrift.mean_difference.toFixed(2)} pts`
                : "—"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
