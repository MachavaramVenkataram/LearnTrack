"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Info,
  ChevronRight,
  ShieldCheck,
  X,
} from "lucide-react";
import { DriftReport, MonitoringSummary } from "@/lib/api/mlOps";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";

export interface AlertItem {
  id: string;
  title: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  detectedAt: string;
  metric: string;
  currentValue: string;
  threshold: string;
  recommendedAction: string;
}

export interface MonitoringAlertCenterProps {
  summary: MonitoringSummary | null;
  driftReport: DriftReport | null;
  onSelectAlert: (alert: AlertItem) => void;
}

export function MonitoringAlertCenter({
  summary,
  driftReport,
  onSelectAlert,
}: MonitoringAlertCenterProps) {
  const alertStatus = driftReport?.overall_status || summary?.alert_level || "NORMAL";
  const observationsCount = driftReport?.observations_count ?? 0;

  // Compile real alerts based strictly on actual telemetry conditions
  const alerts: AlertItem[] = [];

  if (driftReport?.prediction_drift?.drift_status === "High Drift") {
    alerts.push({
      id: "alert-pred-drift-critical",
      title: "Prediction Distribution Shift Detected",
      severity: "CRITICAL",
      detectedAt: "Active window evaluation",
      metric: "Prediction Drift (PSI)",
      currentValue: `Mean shift: ${driftReport.prediction_drift.mean_difference?.toFixed(2) ?? "—"} pts`,
      threshold: "PSI >= 0.25 (Critical shift)",
      recommendedAction: "Review feature input distributions and consider preparing a candidate retraining run.",
    });
  } else if (driftReport?.prediction_drift?.drift_status === "Moderate Drift") {
    alerts.push({
      id: "alert-pred-drift-warning",
      title: "Moderate Prediction Distribution Drift",
      severity: "WARNING",
      detectedAt: "Active window evaluation",
      metric: "Prediction Drift (PSI)",
      currentValue: `Mean shift: ${driftReport.prediction_drift.mean_difference?.toFixed(2) ?? "—"} pts`,
      threshold: "0.10 <= PSI < 0.25 (Warning)",
      recommendedAction: "Monitor incoming student feature segments over the next examination cohort.",
    });
  }

  // Feature-level drift alerts
  if (driftReport?.feature_drifts) {
    driftReport.feature_drifts.forEach((f) => {
      if (f.status === "High Drift") {
        alerts.push({
          id: `alert-feat-${f.feature_name}-high`,
          title: `Significant Drift in ${f.feature_name}`,
          severity: "CRITICAL",
          detectedAt: "Active window evaluation",
          metric: `${f.feature_name} (${f.drift_metric})`,
          currentValue: f.metric_value !== null ? f.metric_value.toFixed(4) : "—",
          threshold: "PSI >= 0.25",
          recommendedAction: `Inspect recent values for ${f.feature_name} to check for student cohort behavioral shifts.`,
        });
      } else if (f.status === "Moderate Drift") {
        alerts.push({
          id: `alert-feat-${f.feature_name}-mod`,
          title: `Moderate Drift in ${f.feature_name}`,
          severity: "WARNING",
          detectedAt: "Active window evaluation",
          metric: `${f.feature_name} (${f.drift_metric})`,
          currentValue: f.metric_value !== null ? f.metric_value.toFixed(4) : "—",
          threshold: "PSI >= 0.10",
          recommendedAction: `Evaluate data collection consistency for ${f.feature_name}.`,
        });
      }
    });
  }

  // Coverage alert
  if (summary && summary.prediction_count >= 20 && summary.feedback_count < 3) {
    alerts.push({
      id: "alert-coverage-low",
      title: "Ground-Truth Coverage Low",
      severity: "WARNING",
      detectedAt: "Coverage calculation",
      metric: "Feedback Coverage Ratio",
      currentValue: `${summary.coverage_percentage.toFixed(1)}% (${summary.feedback_count}/${summary.prediction_count})`,
      threshold: "Coverage >= 10.0%",
      recommendedAction: "Record more verified student exam outcomes to maintain reliable empirical error tracking.",
    });
  }

  // Latency alert
  if (summary?.latency_metrics?.p95_latency_ms && summary.latency_metrics.p95_latency_ms > 200) {
    alerts.push({
      id: "alert-latency-high",
      title: "Inference Latency Threshold Exceeded",
      severity: "WARNING",
      detectedAt: "Recent latency telemetry",
      metric: "P95 Inference Latency",
      currentValue: `${summary.latency_metrics.p95_latency_ms.toFixed(1)}ms`,
      threshold: "P95 Latency <= 200ms",
      recommendedAction: "Verify FastAPI microservice resource utilization and database query latency.",
    });
  }

  return (
    <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
              ALERT CENTER
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Active operational alerts, drift thresholds, and recommended remediation.
            </CardDescription>
          </div>

          <span className="text-xs font-mono text-slate-500">
            {alerts.length} active alerts
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {alerts.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-emerald-900">
                ✓ All monitored metrics are within configured thresholds.
              </p>
              <p className="text-emerald-700">
                Feature drift (PSI &lt; 0.10), prediction drift, and response latency remain within nominal limits.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {alerts.map((alert) => {
              const isCrit = alert.severity === "CRITICAL";
              return (
                <div
                  key={alert.id}
                  onClick={() => onSelectAlert(alert)}
                  className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isCrit
                      ? "bg-rose-50/60 border-rose-200/80 hover:bg-rose-50"
                      : "bg-amber-50/60 border-amber-200/80 hover:bg-amber-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isCrit ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {isCrit ? <AlertOctagon className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    </span>
                    <div>
                      <p className={`font-bold ${isCrit ? "text-rose-950" : "text-amber-950"}`}>
                        {alert.title}
                      </p>
                      <p className={`text-[11px] ${isCrit ? "text-rose-700" : "text-amber-800"}`}>
                        {alert.metric} • Current: <span className="font-mono font-semibold">{alert.currentValue}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAlert(alert);
                    }}
                    className="inline-flex items-center gap-1 h-7 px-2.5 rounded-[8px] text-[11px] font-semibold text-slate-600 bg-white border border-slate-200/80 hover:border-slate-300 hover:text-slate-900 shadow-2xs hover:shadow-xs transition-all duration-160 group/btn shrink-0"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3 text-slate-400 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
