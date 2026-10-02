"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2, ArrowUpRight, Lock, Eye } from "lucide-react";

export function PrivacyAndExplainability() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. Privacy & Statistical Integrity (Section 32) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft-sm flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                Data Governance
              </span>
              <h3 className="text-sm font-bold text-slate-900">
                Privacy &amp; Statistical Integrity
              </h3>
            </div>
          </div>

          <div className="space-y-3 pt-3.5 text-xs text-slate-600">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-800">Student PII Excluded:</strong> Student personal
                identifiers (names, emails, IDs) are permanently excluded from aggregate model
                telemetry and feature spaces.
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-800">Local Mathematical Attribution:</strong> Model
                explanations are computed deterministically from numerical regressors on isolated
                infrastructure without external API egress.
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-800">Continuous Quality Surveillance:</strong> Real-time
                telemetry is used strictly for model calibration and prospective drift detection.
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Compliance: FERPA &amp; GDPR Aligned</span>
          <span className="text-emerald-700 font-semibold">Verified Safe</span>
        </div>
      </div>

      {/* 2. Model Explainability & SHAP (Section 33) */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-soft-sm flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                  Model Interpretability
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  SHAP Explainability Engine
                </h3>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <Eye className="w-3 h-3" />
              Available
            </span>
          </div>

          <div className="pt-3.5 space-y-3 text-xs">
            <p className="text-slate-600 leading-relaxed">
              TreeSHAP and Linear additive attributions calculate exact feature contribution deltas
              for every prediction. Instructors can inspect why the model expects specific scores.
            </p>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 text-[11.5px] leading-relaxed">
              <strong className="font-semibold text-slate-900 block mb-1">
                Attribution vs Causation:
              </strong>
              Feature attribution describes how input features influenced the statistical estimate;
              attribution does not establish direct real-world causality.
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono text-[11px]">
            Explainer: Linear Coefficient Product
          </span>

          <Link
            href="/insights"
            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <span>Open Insights</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
