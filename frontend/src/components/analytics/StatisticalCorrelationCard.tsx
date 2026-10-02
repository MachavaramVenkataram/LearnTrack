"use client";

import React, { useState } from "react";
import { GitCommit, Info, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

export interface CorrelationItem {
  variableA: string;
  variableB: string;
  coefficient: number;
  sampleSize: number;
  direction: "positive" | "negative" | "none";
  strength: "strong" | "moderate" | "weak";
}

export interface StatisticalCorrelationCardProps {
  correlationMatrix: CorrelationItem[];
  sampleSize: number;
  minimumObservations?: number;
}

export function StatisticalCorrelationCard({
  correlationMatrix,
  sampleSize,
  minimumObservations = 4,
}: StatisticalCorrelationCardProps) {
  const isSufficient = sampleSize >= minimumObservations && correlationMatrix.length > 0;
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <Card className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-150">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <GitCommit className="w-3.5 h-3.5" />
              </span>
              Statistical Relationships
            </CardTitle>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              Pearson r (n = {sampleSize})
            </span>
          </div>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Pearson linear correlation coefficient across eligible numeric assessment features.
          </CardDescription>
        </div>

        {/* Statistical safety disclaimer (Section 33) */}
        <div className="text-[11px] text-slate-500 italic max-w-sm self-start sm:self-auto leading-snug">
          &ldquo;Correlation indicates statistical association, not causation.&rdquo;
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-5">
        {!isSufficient ? (
          /* Insufficient Observations Safe State (Section 33) */
          <div className="p-6 rounded-xl bg-slate-50/70 border border-slate-200/80 text-center max-w-xl mx-auto space-y-2">
            <div className="w-8 h-8 rounded-xl bg-slate-200/70 text-slate-600 flex items-center justify-center mx-auto">
              <Info className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-800">
                Insufficient observations for correlation analysis
              </h4>
              <p className="text-[11.5px] text-slate-500 leading-relaxed">
                At least <strong>{minimumObservations} paired academic records</strong> are required to calculate meaningful Pearson correlation coefficients and avoid spurious artifacts. Currently recorded: <strong>{sampleSize}</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {correlationMatrix.map((item, idx) => {
              const isHovered = hoveredIdx === idx;
              const isPositive = item.coefficient > 0;
              const absVal = Math.abs(item.coefficient);

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={cn(
                    "p-3.5 rounded-xl border transition-all duration-150 text-xs space-y-2",
                    isHovered
                      ? "bg-slate-50/90 border-blue-300 shadow-2xs"
                      : "bg-white border-slate-200/80 hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center justify-between text-slate-700 font-medium">
                    <span className="truncate pr-1">
                      {item.variableA} &times; {item.variableB}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      n = {item.sampleSize || sampleSize}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-lg font-black text-slate-900">
                        r = {isPositive ? `+${item.coefficient}` : item.coefficient}
                      </span>
                    </div>

                    <span
                      className={cn(
                        "text-[10.5px] font-semibold px-2 py-0.5 rounded-md border capitalize",
                        item.strength === "strong"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : item.strength === "moderate"
                          ? "bg-slate-100 text-slate-700 border-slate-200"
                          : "bg-slate-50 text-slate-500 border-slate-200/60"
                      )}
                    >
                      {item.strength} {item.direction}
                    </span>
                  </div>

                  {/* Visual intensity meter */}
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        isPositive ? "bg-blue-600" : "bg-rose-500"
                      )}
                      style={{ width: `${Math.min(100, Math.max(10, absVal * 100))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
