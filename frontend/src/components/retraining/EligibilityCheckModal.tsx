"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, PlayCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { RetrainingCheckResponse } from "@/lib/api/mlOps";

export interface EligibilityCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: RetrainingCheckResponse | null;
  onProceedToRetrain?: () => void;
}

export function EligibilityCheckModal({
  isOpen,
  onClose,
  result,
  onProceedToRetrain,
}: EligibilityCheckModalProps) {
  const isEligible = result?.eligible ?? false;

  const getCheckStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    if (s === "PASS" || s === "PASSED" || s === "NORMAL") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          PASSED
        </span>
      );
    }
    if (s === "INFO" || s === "PENDING_FEEDBACK" || s === "ACCUMULATING") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          PENDING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle className="w-3 h-3 text-rose-600" />
        WARNING
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Retraining Eligibility Pre-Flight Analysis"
      description="Non-destructive evaluation of data quality, feature drift, sample volume, and model health."
    >
      <div className="space-y-4 py-2 text-xs">
        {/* Overall Status Banner */}
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between ${
            isEligible
              ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
              : "bg-amber-50/80 border-amber-200 text-amber-950"
          }`}
        >
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider block">
              System Verdict
            </span>
            <span className="font-bold text-base mt-0.5 block">
              {isEligible ? "ELIGIBLE FOR RETRAINING" : "REQUIREMENTS NOT YET MET"}
            </span>
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold ${
              isEligible
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {isEligible ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5" />
            )}
            {isEligible ? "PASSED" : "PENDING"}
          </span>
        </div>

        {/* Reason / Recommendation */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-slate-700 space-y-1">
          <p className="font-bold text-blue-950 text-[11px] uppercase tracking-wider">
            Analysis & Recommendation:
          </p>
          <p className="text-xs text-blue-900 leading-relaxed">
            {result?.reason || "Pre-flight checks evaluated against model operational thresholds."}
          </p>
        </div>

        {/* Pre-Flight Checklist Breakdown */}
        <div className="space-y-2">
          <p className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
            Pre-Flight Checklist Breakdown
          </p>

          {result?.checks &&
            Object.entries(result.checks).map(([key, check]: [string, any]) => (
              <div
                key={key}
                className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
              >
                <div>
                  <span className="font-bold capitalize text-slate-900 text-xs block">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    {check.message || "Condition verified against system threshold."}
                  </span>
                </div>
                <div className="shrink-0">
                  {getCheckStatusBadge(check.status)}
                </div>
              </div>
            ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-9">
            Close
          </Button>

          {isEligible && onProceedToRetrain && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onProceedToRetrain();
              }}
              className="text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              leftIcon={<PlayCircle className="w-3.5 h-3.5" />}
            >
              Start Retraining
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
