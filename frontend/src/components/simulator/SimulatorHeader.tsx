"use client";

import React from "react";
import Link from "next/link";
import {
  Sliders,
  Sparkles,
  History,
  RotateCcw,
  ChevronRight,
  Cpu,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export interface SimulatorHeaderProps {
  modelType: string;
  modelVersion: string;
  mlStatus: "healthy" | "unhealthy" | "offline" | "loading";
  baselineScore: number | null;
  historyCount: number;
  onOpenHistory: () => void;
  onReset: () => void;
  canReset: boolean;
}

export function SimulatorHeader({
  modelType,
  modelVersion,
  mlStatus,
  baselineScore,
  historyCount,
  onOpenHistory,
  onReset,
  canReset,
}: SimulatorHeaderProps) {
  return (
    <div className="space-y-4">
      {/* 1. Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Link
          href="/dashboard"
          className="hover:text-slate-900 transition-colors duration-150"
        >
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
        <span className="text-slate-900 font-semibold">What-If Simulator</span>
      </nav>

      {/* 2. Main Title Row with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              What-If Simulator
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
              <Sparkles className="w-3 h-3 text-blue-600" />
              ML Simulation
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Explore how changes in your academic inputs influence the model&apos;s projected performance.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenHistory}
            leftIcon={<History className="w-3.5 h-3.5 text-slate-500" />}
            className="h-9 px-3 text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-all active:scale-[0.98]"
            title="View previously saved simulation scenarios"
          >
            History ({historyCount})
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onReset}
            disabled={!canReset}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className={cn(
              "h-9 px-3.5 text-xs font-semibold rounded-xl shadow-2xs transition-all active:scale-[0.98]",
              !canReset && "opacity-50 cursor-not-allowed"
            )}
            title="Reset all inputs to current student baseline"
          >
            Reset to Baseline
          </Button>
        </div>
      </div>

      {/* 3. Hero Status Strip (Section 3: Model, Version, Status, Baseline) */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 divide-x divide-slate-100">
          {/* Model Name */}
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Cpu className="w-3.5 h-3.5" />
            </span>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
                Model Architecture
              </span>
              <span className="font-bold text-slate-900 mt-0.5 block leading-tight">
                {modelType || "Ridge Regression"}
              </span>
            </div>
          </div>

          {/* Model Version */}
          <div className="pl-4 sm:pl-6">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
              Version
            </span>
            <span className="font-mono font-semibold text-slate-700 mt-0.5 block leading-tight">
              {modelVersion || "v1.0.0"}
            </span>
          </div>

          {/* Real Health Status */}
          <div className="pl-4 sm:pl-6 flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider leading-none">
              Service Status:
            </span>
            {mlStatus === "healthy" ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ready
              </span>
            ) : mlStatus === "loading" ? (
              <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                Connecting...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Offline
              </span>
            )}
          </div>
        </div>

        {/* Baseline Performance Index */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-xs">Current Student Baseline:</span>
          <span className="font-mono text-sm font-extrabold text-slate-900 bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 rounded-lg shadow-2xs">
            {baselineScore !== null ? `${baselineScore.toFixed(1)}%` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
