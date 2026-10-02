"use client";

import React from "react";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileCheck,
  Send,
  ArrowRight,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { MonitoringSummary, PredictionLogItem } from "@/lib/api/mlOps";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export interface ModelPerformanceSectionProps {
  summary: MonitoringSummary | null;
  recentPredictions: PredictionLogItem[];
  onOpenFeedback: () => void;
}

export function ModelPerformanceSection({
  summary,
  recentPredictions,
  onOpenFeedback,
}: ModelPerformanceSectionProps) {
  const verifiedPredictions = recentPredictions.filter((p) => p.has_feedback && p.actual_value !== null);
  const errorMetrics = summary?.error_metrics;
  const hasErrorData = errorMetrics && !errorMetrics.insufficient_data && errorMetrics.mae !== null;

  const minRequiredFeedback = 5;
  const feedbackCount = summary?.feedback_count ?? 0;

  return (
    <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
              </span>
              <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
                Model Performance & Prediction Error
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Empirical accuracy derived from student exam results compared against active model estimates.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="md"
              variant="secondary-blue"
              onClick={onOpenFeedback}
              tooltip="Record the actual outcome for a prediction"
              leftIcon={
                <ShieldCheck className="w-4 h-4 text-blue-600 transition-transform duration-180 ease-out group-hover:scale-110" />
              }
              className="h-10 px-3.5 rounded-[10px] text-[13px] font-semibold text-blue-600 hover:text-blue-700 border-[#BFDBFE] hover:border-[#93C5FD] hover:bg-blue-50/70"
            >
              Verify a Prediction
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* Metric Badges Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Mean Absolute Error (MAE)
            </span>
            <p className="text-xl font-bold font-mono text-slate-900">
              {errorMetrics?.mae !== null && errorMetrics?.mae !== undefined
                ? errorMetrics.mae.toFixed(2)
                : "—"}
            </p>
            <span className="text-[10px] text-slate-500 block">
              {errorMetrics?.mae !== null && errorMetrics?.mae !== undefined ? "Average point error" : "Awaiting verified data"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Root Mean Squared Error (RMSE)
            </span>
            <p className="text-xl font-bold font-mono text-slate-900">
              {errorMetrics?.rmse !== null && errorMetrics?.rmse !== undefined
                ? errorMetrics.rmse.toFixed(2)
                : "—"}
            </p>
            <span className="text-[10px] text-slate-500 block">
              {errorMetrics?.rmse !== null && errorMetrics?.rmse !== undefined ? "Outlier-penalized metric" : "Awaiting verified data"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Verified Outcomes
            </span>
            <p className="text-xl font-bold font-mono text-slate-900">
              {feedbackCount}
            </p>
            <span className="text-[10px] text-slate-500 block">
              Min {minRequiredFeedback} for error metrics
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Feedback Coverage
            </span>
            <p className="text-xl font-bold font-mono text-slate-900">
              {summary && summary.coverage_percentage !== undefined
                ? `${summary.coverage_percentage.toFixed(1)}%`
                : "—"}
            </p>
            <span className="text-[10px] text-slate-500 block">
              Of total recorded predictions
            </span>
          </div>
        </div>

        {/* Verified Outcomes List or Compact Empty State */}
        {!hasErrorData && verifiedPredictions.length === 0 ? (
          <div className="py-8 px-5 rounded-xl bg-slate-50/60 border border-dashed border-slate-200 text-center flex flex-col items-center justify-center space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-2xs">
              <FileCheck className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-1 max-w-md">
              <h4 className="text-xs font-bold text-slate-800">
                More verified outcomes are required to calculate production error metrics
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Empirical MAE and RMSE require at least {minRequiredFeedback} verified student exam results
                (currently {feedbackCount}/{minRequiredFeedback}). Record student outcomes below to activate
                empirical error tracking.
              </p>
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="secondary-blue"
                  onClick={onOpenFeedback}
                  tooltip="Record the actual outcome for a prediction"
                  leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-blue-600" />}
                  className="rounded-[9px] text-xs font-semibold text-blue-600 hover:text-blue-700 border-[#BFDBFE] hover:border-[#93C5FD] hover:bg-blue-50/70"
                >
                  Verify a Prediction
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Verified Predictions Sample Log
              </span>
              <span className="text-xs font-mono text-slate-500">
                {verifiedPredictions.length} verified observations
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3.5">Prediction ID</th>
                    <th className="py-2.5 px-3.5">Model Estimate</th>
                    <th className="py-2.5 px-3.5">Verified Actual</th>
                    <th className="py-2.5 px-3.5">Residual Error</th>
                    <th className="py-2.5 px-3.5">Recorded At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {verifiedPredictions.slice(0, 5).map((pred) => {
                    const err = pred.error ?? (pred.actual_value! - pred.prediction);
                    const absErr = Math.abs(err);
                    const isAcceptable = absErr <= 8;
                    const isWarning = absErr > 8 && absErr <= 15;

                    return (
                      <tr key={pred.prediction_id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3.5 font-mono text-slate-700">
                          {pred.prediction_id.slice(0, 10)}...
                        </td>
                        <td className="py-2.5 px-3.5 font-mono font-semibold text-slate-900">
                          {pred.prediction.toFixed(1)} pts
                        </td>
                        <td className="py-2.5 px-3.5 font-mono font-semibold text-emerald-700">
                          {pred.actual_value!.toFixed(1)} pts
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span
                            className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                              isAcceptable
                                ? "bg-emerald-50 text-emerald-700"
                                : isWarning
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {err > 0 ? `+${err.toFixed(1)}` : err.toFixed(1)} pts
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-500 text-[11px]">
                          {new Date(pred.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
