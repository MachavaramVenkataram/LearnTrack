"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  BarChart2,
  Info,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
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
  ReferenceLine,
} from "recharts";
import { Badge } from "@/components/ui/Badge";
import { PerformancePrediction, ExplanationItem } from "@/types/academic";

interface ShapExplainabilitySectionProps {
  prediction: PerformancePrediction | null;
  hasCurrentAcademicData: boolean;
}

export function ShapExplainabilitySection({
  prediction,
  hasCurrentAcademicData,
}: ShapExplainabilitySectionProps) {
  const [sortOrder, setSortOrder] = useState<"absolute" | "positive" | "negative">("absolute");
  const [showCausalityTooltip, setShowCausalityTooltip] = useState(false);
  const [showBaselineTooltip, setShowBaselineTooltip] = useState(false);

  // Process and sort SHAP explanations
  const chartData = useMemo(() => {
    if (!prediction?.explanations || prediction.explanations.length === 0) {
      return [];
    }

    const items = [...prediction.explanations];

    if (sortOrder === "absolute") {
      items.sort((a, b) => b.impact - a.impact);
    } else if (sortOrder === "positive") {
      items.sort((a, b) => b.raw_impact - a.raw_impact);
    } else if (sortOrder === "negative") {
      items.sort((a, b) => a.raw_impact - b.raw_impact);
    }

    return items.map((exp) => ({
      feature: exp.feature,
      label: exp.label,
      impact: exp.raw_impact,
      absImpact: exp.impact,
      direction: exp.direction,
      fill: exp.direction === "positive" ? "#2563eb" : exp.direction === "negative" ? "#e11d48" : "#94a3b8",
      description: exp.description,
    }));
  }, [prediction, sortOrder]);

  const formattedTimestamp = useMemo(() => {
    if (!prediction?.created_at) return null;
    try {
      const d = new Date(prediction.created_at);
      return d.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  }, [prediction?.created_at]);

  // Determine state:
  // STATE A: hasCurrentAcademicData && prediction
  // STATE B: !prediction (insufficient)
  // STATE C: !hasCurrentAcademicData && prediction (stale/historical snapshot)
  const isHistoricalSnapshot = !hasCurrentAcademicData && prediction !== null;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
      {/* 1. Header with Title, Non-Causality Tooltip & Sorting Segmented Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-sans tracking-tight">
              Why did LearnTrack predict this score?
            </h2>

            {/* Non-causality tooltip (Requirement #11, #55) */}
            <div className="relative inline-block">
              <button
                type="button"
                onMouseEnter={() => setShowCausalityTooltip(true)}
                onMouseLeave={() => setShowCausalityTooltip(false)}
                onClick={() => setShowCausalityTooltip((prev) => !prev)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
                title="Non-causal interpretation note"
                aria-label="SHAP explanation notes"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {showCausalityTooltip && (
                <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl z-30 leading-relaxed pointer-events-none">
                  <p className="font-semibold text-slate-200 mb-1">Model Contribution, Not Causation</p>
                  SHAP values describe model feature influence and show how each input adjusted the prediction. They should not be interpreted as direct causal proof.
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-0.5">
            SHAP feature attribution showing how each model input contributed to the prediction.
          </p>
        </div>

        {/* Segmented Sort Controls (Requirement #10, #17) */}
        {chartData.length > 0 && (
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100/90 border border-slate-200/60 text-xs self-start lg:self-auto shrink-0">
            <button
              onClick={() => setSortOrder("absolute")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                sortOrder === "absolute"
                  ? "bg-white text-blue-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Absolute Impact
            </button>
            <button
              onClick={() => setSortOrder("positive")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                sortOrder === "positive"
                  ? "bg-white text-blue-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Positive First
            </button>
            <button
              onClick={() => setSortOrder("negative")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                sortOrder === "negative"
                  ? "bg-white text-rose-700 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Negative First
            </button>
          </div>
        )}
      </div>

      {/* 2. Model Summary Strip (Requirement #12, #13, #20) */}
      {prediction && chartData.length > 0 ? (
        <div className="p-4 sm:p-5 space-y-5">
          {/* Consistency Alert for STATE C (Historical Snapshot) */}
          {isHistoricalSnapshot && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900">Historical Prediction Snapshot</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  This explanation was generated from an earlier valid dataset on{" "}
                  <strong>{formattedTimestamp || "recent run"}</strong>. Current semester coursework is not yet recorded.
                </p>
              </div>
            </div>
          )}

          {/* Model Status & Metadata Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Latest Model Estimate:
              </span>
              <span className="font-bold text-slate-900 font-mono text-sm">
                {prediction.predicted_score.toFixed(1)} pts
              </span>
              <Badge variant="default" size="sm">
                Grade {prediction.predicted_grade}
              </Badge>
              <Badge
                variant={
                  prediction.risk_level === "Low"
                    ? "success"
                    : prediction.risk_level === "Medium"
                    ? "warning"
                    : "danger"
                }
                size="sm"
              >
                {prediction.risk_level} Risk
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
              <span>Model: Ridge Regression</span>
              <span className="text-slate-300">•</span>
              <span>Version: {prediction.model_version || "v1.0.0"}</span>
              <span className="text-slate-300">•</span>
              <span>Dataset: v1.0.0</span>
              {formattedTimestamp && (
                <>
                  <span className="text-slate-300">•</span>
                  <span>{formattedTimestamp}</span>
                </>
              )}
            </div>
          </div>

          {/* 3. Compact Horizontal SHAP Contribution Bar Chart (Requirements #14, #15, #16) */}
          <div className="space-y-3">
            <div className="h-56 sm:h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 8, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    domain={[-10, 10]}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickFormatter={(v) => `${v > 0 ? `+${v}` : v} pts`}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "#1e293b", fontWeight: 500 }}
                    width={150}
                  />
                  <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={1.5} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl space-y-1.5 max-w-xs border border-slate-800">
                            <p className="font-bold text-slate-100">{d.label}</p>
                            <p className="font-mono text-blue-300 font-semibold">
                              SHAP contribution: {d.impact > 0 ? `+${d.impact.toFixed(1)}` : d.impact.toFixed(1)} pts
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Direction: {d.impact > 0 ? "Positive model influence" : "Downward adjustment"}
                            </p>
                            <p className="text-[11px] text-slate-300 leading-snug pt-0.5 border-t border-slate-800">
                              {d.impact > 0
                                ? `Adjusted the model output upward by ${d.impact.toFixed(1)} points.`
                                : `Adjusted the model output downward by ${Math.abs(d.impact).toFixed(1)} points.`}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 4. Baseline Info & Footnotes (Requirement #18, #19) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" />
                  Positive model influence
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-600" />
                  Downward model adjustment
                </span>
              </div>

              {/* Baseline information with tooltip */}
              <div className="flex items-center gap-1.5 relative">
                <span className="font-mono text-slate-600 font-medium">Model baseline: 71.4 pts</span>
                <button
                  type="button"
                  onMouseEnter={() => setShowBaselineTooltip(true)}
                  onMouseLeave={() => setShowBaselineTooltip(false)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  aria-label="Baseline note"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>

                {showBaselineTooltip && (
                  <div className="absolute right-0 bottom-full mb-1.5 w-64 p-2.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-lg z-30 pointer-events-none">
                    Baseline represents the expected model output across the training population before applying feature-level SHAP contributions.
                  </div>
                )}
              </div>
            </div>

            <p className="text-[10.5px] text-slate-400 italic text-center pt-1">
              SHAP values describe model influence and should not be interpreted as causal effects.
            </p>
          </div>
        </div>
      ) : (
        /* Empty / Insufficient SHAP State */
        <div className="p-8 text-center bg-slate-50/50 rounded-b-2xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-800">
              No Prediction Attributions Available
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Run an academic performance prediction to compute SHAP feature contributions and inspect the factors driving the model&apos;s estimate.
            </p>
          </div>
          <Link href="/prediction" className="inline-block pt-1">
            <button className="h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors">
              Run First Prediction
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
