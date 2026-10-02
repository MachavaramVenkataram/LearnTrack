"use client";

import React from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Database,
  Calendar,
} from "lucide-react";
import { PredictionLogItem } from "@/lib/api/mlOps";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export interface MonitoringActivityTimelineProps {
  recentPredictions: PredictionLogItem[];
}

export function MonitoringActivityTimeline({
  recentPredictions,
}: MonitoringActivityTimelineProps) {
  const hasEvents = recentPredictions && recentPredictions.length > 0;

  return (
    <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Clock className="w-3.5 h-3.5" />
              </span>
              MONITORING ACTIVITY
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Chronological feed of inference requests and ground-truth verification events.
            </CardDescription>
          </div>

          <span className="text-xs font-mono text-slate-500">
            {recentPredictions.length} events logged
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {!hasEvents ? (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            No monitoring events recorded yet.
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {recentPredictions.slice(0, 8).map((p) => {
              const hasFeedback = p.has_feedback && p.actual_value !== null;
              const dateStr = new Date(p.timestamp).toLocaleDateString();
              const timeStr = new Date(p.timestamp).toLocaleTimeString();

              return (
                <div key={p.prediction_id} className="relative text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  {/* Timeline node */}
                  <span
                    className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-white ring-2 ${
                      hasFeedback ? "bg-emerald-500 ring-emerald-100" : "bg-blue-500 ring-blue-100"
                    }`}
                  />

                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-900 flex items-center gap-2">
                      <span>Model Inference Recorded</span>
                      <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        {p.prediction_id.slice(0, 8)}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Predicted Score: <span className="font-mono font-bold text-slate-800">{p.prediction.toFixed(1)} pts</span>
                      {hasFeedback && (
                        <span className="ml-2 text-emerald-700 font-medium">
                          • Verified Actual: <span className="font-mono font-bold">{p.actual_value!.toFixed(1)} pts</span>
                        </span>
                      )}
                      {p.latency_ms > 0 && (
                        <span className="ml-2 text-slate-400">
                          • {p.latency_ms.toFixed(1)}ms
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 shrink-0 font-mono">
                    <span>{dateStr} {timeStr}</span>
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
