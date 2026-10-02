"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  Layers,
  ArrowLeft,
  RefreshCw,
  ChevronRight,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface TelemetryHeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  isTelemetryActive: boolean;
  lastUpdated?: string | null;
}

export function TelemetryHeader({
  onRefresh,
  isRefreshing,
  isTelemetryActive,
  lastUpdated,
}: TelemetryHeaderProps) {
  return (
    <div className="space-y-3 pb-2 border-b border-slate-200">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium select-none" aria-label="Breadcrumb">
        <Link href="/analytics" className="hover:text-slate-900 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <span className="text-slate-500">Developer &amp; Admin</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <span className="text-slate-900 font-bold">Model Telemetry</span>
      </nav>

      {/* Main Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              ML Observability
            </span>

            {/* Live Production Telemetry Indicator */}
            {isTelemetryActive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Production Telemetry Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Baseline Cache
              </span>
            )}

            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <Shield className="w-3 h-3 text-slate-500" />
              Restricted Developer View
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Model Performance &amp; Telemetry
          </h1>

          <p className="text-sm text-slate-500 max-w-2xl">
            Monitor model quality, generalization, feature behavior, and production reliability.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
          <Link href="/ml-monitoring">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Activity className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
              className="h-9 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 border-[#E2E8F0] hover:border-slate-300 rounded-[10px]"
              tooltip="Navigate to live production ML monitoring"
            >
              ML Monitoring
            </Button>
          </Link>

          <Link href="/experiments">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Layers className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
              className="h-9 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 border-[#E2E8F0] hover:border-slate-300 rounded-[10px]"
              tooltip="Inspect reproducible MLflow experiment runs"
            >
              MLflow Experiments
            </Button>
          </Link>

          <Link href="/analytics">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
              className="h-9 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 border-[#E2E8F0] hover:border-slate-300 rounded-[10px]"
            >
              Analytics
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            tooltip="Reload live telemetry from ML cluster"
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 transition-transform duration-500 ease-out ${
                  isRefreshing ? "animate-spin text-blue-600" : "text-slate-500"
                }`}
              />
            }
            className="h-9 px-3 text-xs font-semibold text-slate-700 hover:text-slate-900 border-[#E2E8F0] hover:border-slate-300 rounded-[10px]"
            aria-label="Refresh model telemetry"
          >
            {isRefreshing ? "Refreshing…" : lastUpdated ? "Updated" : "Refresh"}
          </Button>
        </div>
      </div>
    </div>
  );
}
