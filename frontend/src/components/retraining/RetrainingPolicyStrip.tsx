"use client";

import React from "react";
import { ShieldCheck, Lock } from "lucide-react";

export function RetrainingPolicyStrip() {
  return (
    <div className="p-4 sm:p-4.5 rounded-[14px] bg-slate-50/90 border border-[#E2E8F0] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/60 text-blue-700 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4.5 h-4.5" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-tight uppercase text-[11px]">
              Retraining Policy
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Lock className="w-2.5 h-2.5" />
              Protected Pipeline
            </span>
          </div>
          <p className="text-slate-600 text-xs leading-relaxed max-w-3xl">
            Candidate models are evaluated through 5-fold cross-validation and independent test splits with regression protection.
            Candidate models are <strong className="text-slate-900">never automatically deployed</strong> to production; promotion remains an explicit, auditable administrator action.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pl-11 sm:pl-0">
        <span className="text-[11px] text-slate-500 font-mono">Tolerance: 5.0% RMSE</span>
      </div>
    </div>
  );
}
