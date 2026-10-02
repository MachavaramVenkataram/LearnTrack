"use client";

import React from "react";
import { ShieldCheck, Activity, Lock, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface ModelReliabilityPanelProps {
  hasHoldoutEvaluation?: boolean;
  hasMonitoringActive?: boolean;
}

export function ModelReliabilityPanel({
  hasHoldoutEvaluation = true,
  hasMonitoringActive = true,
}: ModelReliabilityPanelProps) {
  const reliabilitySignals = [
    {
      id: "out-of-sample",
      title: "Out-of-Sample Evaluation",
      badge: hasHoldoutEvaluation ? "Verified" : "Pending",
      badgeStyle: hasHoldoutEvaluation
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-slate-100 text-slate-600 border-slate-200",
      icon: ShieldCheck,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 border-blue-100",
      description:
        "Evaluated strictly on independent holdout data (N=130) isolated prior to hyperparameter search. Training observations are never re-used to report optimistic accuracy.",
      metadata: "Methodology: 5-Fold Stratified Split + Test Partition",
      actionLink: null,
    },
    {
      id: "prediction-error",
      title: "Prediction Error Surveillance",
      badge: hasMonitoringActive ? "Active" : "Idle",
      badgeStyle: hasMonitoringActive
        ? "bg-blue-50 text-blue-700 border-blue-200"
        : "bg-slate-100 text-slate-600 border-slate-200",
      icon: Activity,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50 border-indigo-100",
      description:
        "Prospective residual tracking compares live inference outputs against verified official semester grades. Automated anomaly alarms trigger if drift exceeds 1.5× baseline RMSE.",
      metadata: "Threshold: ±10.0 pts residual drift alarm",
      actionLink: {
        label: "Open ML Monitoring",
        href: "/ml-monitoring",
      },
    },
    {
      id: "privacy-protection",
      title: "Data & Privacy Protection",
      badge: "Enforced",
      badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Lock,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50 border-emerald-100",
      description:
        "Student personal identifiers (PII) are permanently excluded from feature space. All SHAP attributions compute strictly on mathematical tensors within isolated infrastructure.",
      metadata: "Compliance: Zero external LLM egress & local feature tensors",
      actionLink: null,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Model Reliability
          </h2>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          Monitoring signals that protect model quality across the LearnTrack lifecycle.
        </p>
      </div>

      {/* 3 Signal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reliabilitySignals.map((signal) => {
          const Icon = signal.icon;
          return (
            <div
              key={signal.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl ${signal.iconBg} border flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-4 h-4 ${signal.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {signal.title}
                      </h3>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold border shrink-0 ${signal.badgeStyle}`}
                  >
                    {signal.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {signal.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono text-[10.5px]">
                  {signal.metadata}
                </span>

                {signal.actionLink && (
                  <Link
                    href={signal.actionLink.href}
                    className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <span>{signal.actionLink.label}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
