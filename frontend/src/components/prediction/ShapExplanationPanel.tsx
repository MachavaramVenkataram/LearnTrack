"use client";

import React, { useState } from "react";
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { ExplanationItem } from "@/types/academic";
import { cn } from "@/lib/utils";

export interface ShapExplanationPanelProps {
  explanations: ExplanationItem[];
  defaultExpanded?: boolean;
}

export function ShapExplanationPanel({
  explanations,
  defaultExpanded = true,
}: ShapExplanationPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!explanations || explanations.length === 0) {
    return null;
  }

  // Calculate maximum absolute impact to scale the horizontal bars relative to the zero axis
  const maxImpact = Math.max(...explanations.map((e) => Math.abs(e.impact)), 1.0);

  return (
    <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white overflow-hidden transition-all duration-150">
      <CardHeader className="pb-3 border-b border-slate-100/90">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left group"
        >
          <div className="min-w-0">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <BarChart2 className="w-3.5 h-3.5" />
              </span>
              Why did the model predict this?
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Shapley feature contributions relative to benchmark academic baseline.
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-slate-600 shrink-0 pl-2">
            <span>{isExpanded ? "Collapse" : "View Explanation"}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-5 space-y-5">
          {/* Centered zero-axis explanation visualization */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              <span>Academic Feature</span>
              <div className="flex items-center gap-6">
                <span>Negative Impact (-)</span>
                <span className="w-px h-3 bg-slate-300" />
                <span>Positive Impact (+)</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {explanations.map((exp, idx) => {
                const isPositive = exp.direction === "positive";
                const isNegative = exp.direction === "negative";
                const barWidth = Math.min(100, Math.max(8, (Math.abs(exp.impact) / maxImpact) * 100));

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className={cn(
                      "p-3 rounded-xl border transition-all duration-150 text-xs",
                      hoveredIdx === idx
                        ? "bg-slate-50 border-slate-300/80 shadow-2xs"
                        : "bg-slate-50/50 border-slate-100"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold text-slate-800 truncate">{exp.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({exp.feature})</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {isPositive ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] border border-emerald-100 font-mono">
                            <TrendingUp className="w-3 h-3 text-emerald-600" />
                            +{exp.impact.toFixed(1)} pts
                          </span>
                        ) : isNegative ? (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md text-[11px] border border-rose-100 font-mono">
                            <TrendingDown className="w-3 h-3 text-rose-600" />
                            -{exp.impact.toFixed(1)} pts
                          </span>
                        ) : (
                          <span className="font-medium text-slate-500 text-[11px] px-2 py-0.5 rounded-md bg-slate-100">
                            Neutral
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Central Zero Axis Bar Visualization */}
                    <div className="relative w-full h-3 bg-slate-100 rounded-md overflow-hidden flex items-center">
                      {/* Zero axis divider */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-300 z-10" />

                      {/* Negative half (left of center) */}
                      <div className="w-1/2 h-full flex justify-end">
                        {isNegative && (
                          <div
                            className="h-full bg-rose-500 rounded-l-sm transition-all duration-300"
                            style={{ width: `${barWidth}%` }}
                          />
                        )}
                      </div>

                      {/* Positive half (right of center) */}
                      <div className="w-1/2 h-full flex justify-start">
                        {isPositive && (
                          <div
                            className="h-full bg-blue-600 rounded-r-sm transition-all duration-300"
                            style={{ width: `${barWidth}%` }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Explanation description / tooltip */}
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Explanation Language Disclaimer (Section 22) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11.5px] text-slate-500 flex items-start gap-2.5 leading-relaxed">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong className="text-slate-700 font-semibold">Note on explainability:</strong>{" "}
              SHAP values describe model feature contribution relative to sample baselines and should not be interpreted as causal effects.
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
