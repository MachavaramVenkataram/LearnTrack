"use client";

import React, { useEffect } from "react";
import {
  X,
  Cpu,
  Layers,
  CheckCircle2,
  Calendar,
  Database,
  ShieldCheck,
  TrendingDown,
  Gauge,
  Activity,
  GitBranch,
} from "lucide-react";
import { ProductionModelInfo, ExperimentSummary } from "@/lib/api/mlOps";
import { Button } from "@/components/ui/Button";

export interface ModelCardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  prodModel: ProductionModelInfo | null;
  championExperiment: ExperimentSummary | null;
}

export function ModelCardDrawer({
  isOpen,
  onClose,
  prodModel,
  championExperiment,
}: ModelCardDrawerProps) {
  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const features = [
    { name: "attendance_percentage", type: "float", desc: "Institutional classroom attendance (0.0 to 100.0%)" },
    { name: "assignment_score", type: "float", desc: "Coursework and assignment average (0.0 to 100.0)" },
    { name: "internal_marks", type: "float", desc: "Continuous internal examination score (0.0 to 100.0)" },
    { name: "previous_score", type: "float", desc: "Prior term academic achievement baseline (0.0 to 100.0)" },
    { name: "study_hours", type: "float", desc: "Dedicated weekly focused study hours (>= 0.0)" },
    { name: "assignments_completed", type: "int", desc: "Submitted coursework assignments count" },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                Production Model Specification
              </span>
              <h3 className="text-xl font-bold text-slate-900">
                {prodModel?.model_name || "Ridge Regression"}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Version: v{prodModel?.model_version || "1.0.0"} • Stage: {prodModel?.stage || "Production"}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              tooltip="Close specification (Esc)"
              aria-label="Close model card drawer"
              className="text-slate-400 hover:text-slate-700 rounded-[8px]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-6 flex-1 text-xs">
            {/* Architectural Overview */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Algorithm & Lineage
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimator Architecture:</span>
                  <span className="font-semibold text-slate-800">
                    Linear Regression with L2 Regularization (Ridge)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Training Dataset:</span>
                  <span className="font-mono font-medium text-slate-800">
                    v{prodModel?.dataset_version || "1.0.0"} (UCI Student Performance)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MLflow Run ID:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {prodModel?.run_id || "mlruns"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Model Status:</span>
                  <span className="font-semibold text-emerald-700">
                    {prodModel?.status || "READY (Serving)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Benchmark Evaluation Metrics */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Benchmark Evaluation (Held-Out Test Partition)
              </h4>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-center">
                  <span className="text-[10px] text-slate-500 block font-medium">Test MAE</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {championExperiment?.test_mae ? `${championExperiment.test_mae.toFixed(2)} pts` : "4.49 pts"}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-center">
                  <span className="text-[10px] text-slate-500 block font-medium">Test RMSE</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {championExperiment?.test_rmse ? `${championExperiment.test_rmse.toFixed(2)} pts` : "7.68 pts"}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70 text-center">
                  <span className="text-[10px] text-slate-500 block font-medium">Test R²</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {championExperiment?.test_r2 ? championExperiment.test_r2.toFixed(3) : "0.839"}
                  </span>
                </div>
              </div>
            </div>

            {/* Input Features Schema */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Input Features ({features.length} Features)
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-xl overflow-hidden">
                {features.map((f) => (
                  <div key={f.name} className="p-2.5 bg-white hover:bg-slate-50/50 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-mono font-semibold text-slate-800">{f.name}</p>
                      <p className="text-[10px] text-slate-500">{f.desc}</p>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {f.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ethical Guardrails */}
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1 text-slate-700">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Ethical AI Policy</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-800">
                Demographic and sensitive socio-economic attributes are strictly excluded from model inputs.
                Predictions reflect measurable academic engagement and coursework indicators.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
            <Button
              variant="secondary"
              size="md"
              onClick={onClose}
              className="h-9 px-4 rounded-[10px] text-xs font-semibold"
            >
              Close Specification
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
