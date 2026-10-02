"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Save,
  CheckCircle2,
  Info,
  Award,
  ArrowRight,
  Shield,
  Layers,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SimulationResponse, PredictionFeatureInput } from "@/types/academic";
import { cn } from "@/lib/utils";

export interface SensitivityDeltaItem {
  label: string;
  baselineVal: number;
  simVal: number;
  unit: string;
  diff: number;
}

export interface ProjectionOutcomeCardProps {
  simulation: SimulationResponse | null;
  deltas: SensitivityDeltaItem[];
  onSave: () => void;
  isSaving: boolean;
  baseline: PredictionFeatureInput;
  simulated: PredictionFeatureInput;
}

export function ProjectionOutcomeCard({
  simulation,
  deltas,
  onSave,
  isSaving,
  baseline,
  simulated,
}: ProjectionOutcomeCardProps) {
  const delta = simulation ? simulation.difference : 0;
  const isPositive = delta > 0;
  const isNeutral = delta === 0;

  // Chart data for current vs simulated
  const chartData = React.useMemo(() => {
    if (!simulation) return [];
    return [
      {
        name: "Current Baseline",
        score: simulation.current_prediction,
        grade: simulation.current_grade,
        fill: "#94a3b8",
      },
      {
        name: "Simulated Projection",
        score: simulation.simulated_prediction,
        grade: simulation.simulated_grade,
        fill: isPositive ? "#2563eb" : isNeutral ? "#64748b" : "#e11d48",
      },
    ];
  }, [simulation, isPositive, isNeutral]);

  return (
    <Card className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            Projection Outcome
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Model-estimated comparison based on selected inputs.
          </CardDescription>
        </div>

        {simulation && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            isLoading={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5 text-slate-600" />}
            className="h-8 px-3 text-xs font-semibold rounded-xl border-slate-200 hover:bg-slate-50 shadow-2xs"
            title="Save this simulation scenario to your history"
          >
            Save Scenario
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {simulation ? (
          <>
            {/* 1. Comparison Score Tiles (Section 12 & 13) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Baseline Tile */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Current Baseline
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-800 font-sans tracking-tight">
                  {simulation.current_prediction.toFixed(1)}%
                </div>
                <div className="flex items-center justify-center gap-1 text-xs text-slate-500 pt-0.5">
                  <span>Grade:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {simulation.current_grade}
                  </span>
                </div>
              </div>

              {/* Simulated Tile */}
              <div
                className={cn(
                  "p-4 rounded-xl text-center space-y-1 border transition-all",
                  isPositive
                    ? "bg-blue-50/60 border-blue-200 text-blue-900"
                    : isNeutral
                    ? "bg-slate-50 border-slate-200 text-slate-800"
                    : "bg-rose-50/60 border-rose-200 text-rose-900"
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
                  Simulated Projection
                </span>
                <motion.div
                  key={simulation.simulated_prediction}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className={cn(
                    "text-2xl sm:text-3xl font-extrabold font-sans tracking-tight",
                    isPositive ? "text-blue-700" : isNeutral ? "text-slate-800" : "text-rose-700"
                  )}
                >
                  {simulation.simulated_prediction.toFixed(1)}%
                </motion.div>
                <div className="flex items-center justify-center gap-1.5 text-xs pt-0.5">
                  <span className="text-slate-500">Grade:</span>
                  <span className="font-bold font-mono text-slate-900">
                    {simulation.simulated_grade}
                  </span>
                  {simulation.simulated_risk && (
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.2 rounded-full border",
                        simulation.simulated_risk === "Low"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : simulation.simulated_risk === "Medium"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      )}
                    >
                      {simulation.simulated_risk} Risk
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Estimated Change Banner (Section 14) */}
            <div
              className={cn(
                "p-3.5 rounded-xl border flex items-center justify-between",
                isPositive
                  ? "bg-emerald-50/80 border-emerald-200/90 text-emerald-900"
                  : isNeutral
                  ? "bg-slate-100/80 border-slate-200 text-slate-700"
                  : "bg-rose-50/80 border-rose-200/90 text-rose-900"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-white/80 border border-current/20 flex items-center justify-center shrink-0">
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : isNeutral ? (
                    <CheckCircle2 className="w-4 h-4 text-slate-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-600" />
                  )}
                </span>
                <div>
                  <span className="text-xs font-bold block leading-tight">
                    {isPositive
                      ? "Estimated Score Improvement"
                      : isNeutral
                      ? "No Estimated Change"
                      : "Estimated Score Decline"}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-none">
                    Based on the selected hypothetical inputs.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-base font-black">
                  {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)} pts
                </span>
              </div>
            </div>

            {/* 3. Score Trajectory Comparison Visualization (Section 15) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Score Trajectory Comparison
              </span>
              <div className="h-40 w-full bg-slate-50/60 rounded-xl p-2 border border-slate-200/70">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={{ stroke: "#cbd5e1" }}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg space-y-0.5">
                              <p className="font-bold">{d.name}</p>
                              <p className="font-mono text-blue-300">
                                Projected Score: {d.score.toFixed(1)}% (Grade: {d.grade})
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Parameter Sensitivity Deltas Table (Section 19) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Parameter Sensitivity Deltas
                </span>
                <span className="text-[10px] text-slate-400">Baseline → Simulated</span>
              </div>

              <div className="space-y-1">
                {deltas.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 border border-slate-200/60 text-xs"
                  >
                    <span className="text-slate-700 font-medium">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px] font-mono">
                        {item.baselineVal} → {item.simVal} {item.unit}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                          item.diff > 0
                            ? "bg-emerald-100/70 text-emerald-800"
                            : item.diff < 0
                            ? "bg-rose-100/70 text-rose-800"
                            : "bg-slate-200/60 text-slate-500"
                        )}
                      >
                        {item.diff > 0 ? `+${item.diff}` : item.diff}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Scientific Disclaimer (Section 22) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 block">Simulation only</span>
                <p>
                  These results are statistical model estimates based on hypothetical inputs. They
                  do not guarantee future academic outcomes and do not establish causal relationships.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-slate-400 space-y-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1 max-w-xs mx-auto">
              <h4 className="text-xs font-bold text-slate-700">No Simulation Run Yet</h4>
              <p className="text-xs text-slate-500">
                Adjust academic variables on the left and click &quot;Run Simulation&quot; to inspect the
                model&apos;s sensitivity and projected trajectory.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
