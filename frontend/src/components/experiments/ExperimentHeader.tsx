"use client";

import React from "react";
import Link from "next/link";
import { RefreshCw, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ExperimentHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  isConnected: boolean;
}

export function ExperimentHeader({
  onRefresh,
  isRefreshing,
  isConnected,
}: ExperimentHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
      {/* Title & Category Kicker */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              Experimentation
            </span>
          </div>

          {/* Live MLflow Connection Indicator */}
          {isConnected ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              MLflow Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Offline Mode
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          MLflow Experiment Tracking
        </h1>

        <p className="text-sm text-slate-500 max-w-3xl">
          Trace model experiments, benchmark metrics, hyperparameters, datasets, and artifacts across reproducible pipeline runs.
        </p>
      </div>

      {/* Right-Side Actions */}
      <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto shrink-0">
        <Link href="/ml-monitoring">
          <Button
            variant="outline"
            size="md"
            leftIcon={<BarChart2 className="w-4 h-4 text-blue-600 shrink-0" />}
            className="h-10 px-4 rounded-[10px] text-xs font-semibold text-slate-700 hover:text-slate-900 border-[#E2E8F0] hover:border-[#CBD5E1]"
            tooltip="Navigate to live production ML monitoring telemetry"
          >
            <span>ML Monitoring</span>
          </Button>
        </Link>

        <Button
          variant="secondary"
          size="md"
          onClick={onRefresh}
          disabled={isRefreshing}
          tooltip="Reload experiment runs and telemetry from MLflow server"
          leftIcon={
            <RefreshCw
              className={`w-3.5 h-3.5 transition-transform duration-500 ease-out ${
                isRefreshing ? "animate-spin text-blue-600" : "text-slate-500"
              }`}
            />
          }
          className="h-10 px-4 rounded-[10px] text-xs font-semibold text-slate-700 hover:text-slate-900 border-[#E2E8F0] hover:border-[#CBD5E1]"
          aria-label="Refresh experiment runs"
        >
          <span>{isRefreshing ? "Refreshing…" : "Refresh"}</span>
        </Button>
      </div>
    </div>
  );
}
