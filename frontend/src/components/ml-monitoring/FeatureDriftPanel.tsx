"use client";

import React from "react";
import {
  Activity,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  ChevronRight,
  Info,
  Layers,
  ArrowRight,
} from "lucide-react";
import { DriftReport, FeatureDriftItem } from "@/lib/api/mlOps";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface FeatureDriftPanelProps {
  driftReport: DriftReport | null;
  onSelectFeature: (feature: FeatureDriftItem) => void;
}

export function FeatureDriftPanel({
  driftReport,
  onSelectFeature,
}: FeatureDriftPanelProps) {
  const hasDriftData =
    driftReport?.feature_drifts && driftReport.feature_drifts.length > 0;
  const observationsCount = driftReport?.observations_count ?? 0;
  const minRequired = 10;

  return (
    <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Activity className="w-3.5 h-3.5" />
              </span>
              <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
                Feature Drift
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Monitor production feature distributions against the training baseline via PSI and Kolmogorov-Smirnov test.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              Observations: {observationsCount}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {!hasDriftData ? (
          /* Premium Compact Empty State */
          <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-400">
              <Sliders className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-1 max-w-md">
              <h4 className="text-sm font-bold text-slate-800">
                No feature drift data available yet
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Feature distribution drift requires at least {minRequired} production predictions to compute reliable
                statistical tests (Population Stability Index & Kolmogorov-Smirnov).
              </p>
            </div>

            {/* Progress indicator */}
            <div className="pt-2 w-full max-w-xs space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>Production sample count</span>
                <span>
                  {observationsCount} / {minRequired}
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (observationsCount / minRequired) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Visual Drift Intensity Bars */}
            <div className="p-4 bg-slate-50/50 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                Drift Intensity Distribution
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {driftReport.feature_drifts.map((feature) => {
                  const metricVal = feature.metric_value ?? 0;
                  const isLow = feature.status === "Low Drift";
                  const isModerate = feature.status === "Moderate Drift";
                  const isHigh = feature.status === "High Drift";

                  const barPercent = Math.min(100, Math.round((metricVal / 0.3) * 100));

                  return (
                    <div
                      key={`bar-${feature.feature_name}`}
                      onClick={() => onSelectFeature(feature)}
                      className="p-2.5 rounded-lg bg-white border border-slate-200/80 hover:border-blue-300 cursor-pointer transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-slate-800 truncate">
                          {feature.feature_name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            isLow
                              ? "bg-emerald-50 text-emerald-700"
                              : isModerate
                              ? "bg-amber-50 text-amber-700"
                              : isHigh
                              ? "bg-rose-50 text-rose-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {feature.status}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isLow ? "bg-emerald-500" : isModerate ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.max(5, barPercent)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feature Drift Detailed Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Feature</th>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Metric</th>
                    <th className="py-2.5 px-4">Value</th>
                    <th className="py-2.5 px-4">KS-Test p-val</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {driftReport.feature_drifts.map((feature) => (
                    <tr
                      key={feature.feature_name}
                      onClick={() => onSelectFeature(feature)}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {feature.feature_name}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {feature.feature_type}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">
                        {feature.drift_metric}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {feature.metric_value !== null ? feature.metric_value.toFixed(4) : "—"}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {feature.p_value !== null ? feature.p_value.toFixed(4) : "—"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                            feature.status === "Low Drift"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : feature.status === "Moderate Drift"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : feature.status === "High Drift"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {feature.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectFeature(feature);
                          }}
                          className="inline-flex items-center gap-1 h-6 px-2 rounded-[6px] text-[11px] font-semibold text-slate-600 bg-white border border-slate-200/80 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/50 shadow-2xs transition-all duration-160 group/btn"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3 text-slate-400 group-hover/btn:text-blue-600 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
