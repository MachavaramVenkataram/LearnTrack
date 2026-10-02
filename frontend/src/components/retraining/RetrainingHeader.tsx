"use client";

import React from "react";
import { PlayCircle, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface RetrainingHeaderProps {
  onCheckEligibility: () => void;
  onOpenRetrainModal: () => void;
  onRefresh: () => void;
  isCheckingEligibility: boolean;
  isRetraining: boolean;
  isRefreshing: boolean;
  productionActive: boolean;
  productionModelName?: string;
}

export function RetrainingHeader({
  onCheckEligibility,
  onOpenRetrainModal,
  onRefresh,
  isCheckingEligibility,
  isRetraining,
  isRefreshing,
  productionActive,
}: RetrainingHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
      {/* Title & Category Kicker */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              Model Lifecycle
            </span>
          </div>

          {/* Real Production Status Indicator */}
          {productionActive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Production Model Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Evaluation Mode
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Automated Model Retraining
        </h1>

        <p className="text-sm text-slate-500 max-w-2xl">
          Continuous reliability, drift-aware retraining eligibility, and explicit model promotion.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto shrink-0">
        {/* Refresh Action */}
        <Button
          variant="secondary"
          size="md"
          onClick={onRefresh}
          disabled={isCheckingEligibility || isRetraining || isRefreshing}
          tooltip="Refresh lifecycle state and registry"
          leftIcon={
            <RefreshCw
              className={`w-3.5 h-3.5 transition-transform duration-500 ease-out ${
                isRefreshing ? "animate-spin text-blue-600" : ""
              }`}
            />
          }
          className="h-10 px-3.5 rounded-[10px] text-xs font-semibold text-slate-700 hover:text-slate-900 border-[#E2E8F0] hover:border-[#CBD5E1]"
          aria-label="Refresh retraining status"
        >
          <span>{isRefreshing ? "Refreshing…" : "Refresh"}</span>
        </Button>

        {/* Check Eligibility Button (Secondary) */}
        <Button
          variant="secondary"
          size="md"
          onClick={onCheckEligibility}
          disabled={isCheckingEligibility || isRetraining}
          tooltip="Run pre-flight check of drift, sample volume, and data quality"
          leftIcon={
            <ShieldCheck
              className={`w-4 h-4 text-blue-600 ${
                isCheckingEligibility ? "animate-spin text-blue-500" : ""
              }`}
            />
          }
          className="h-10 px-4 rounded-[10px] text-xs font-semibold text-slate-700 hover:text-slate-900 border-[#E2E8F0] hover:border-[#CBD5E1]"
        >
          <span>{isCheckingEligibility ? "Evaluating…" : "Check Eligibility"}</span>
        </Button>

        {/* Run Retraining Button (Primary) */}
        <Button
          variant="primary"
          size="md"
          onClick={onOpenRetrainModal}
          disabled={isRetraining || isCheckingEligibility}
          tooltip="Launch controlled candidate model generation pipeline"
          leftIcon={
            <PlayCircle
              className={`w-4 h-4 text-white ${
                isRetraining ? "animate-spin" : ""
              }`}
            />
          }
          className="h-10 px-4 rounded-[10px] text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow-sm"
        >
          <span>{isRetraining ? "Retraining Candidates…" : "Run Retraining"}</span>
        </Button>
      </div>
    </div>
  );
}
