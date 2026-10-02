"use client";

import React, { useState } from "react";
import {
  X,
  GitCompare,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { ExperimentSummary } from "@/lib/api/mlOps";
import { Button } from "@/components/ui/Button";

export interface ExperimentComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRuns: ExperimentSummary[];
  onRemoveRun: (runId: string) => void;
}

type MetricViewKey = "test_rmse" | "val_rmse" | "val_mae" | "val_r2";

export function ExperimentComparisonModal({
  isOpen,
  onClose,
  selectedRuns,
  onRemoveRun,
}: ExperimentComparisonModalProps) {
  const [activeMetric, setActiveMetric] = useState<MetricViewKey>("test_rmse");

  if (!isOpen || selectedRuns.length === 0) return null;

  // Metric definitions
  const metricConfigs: Record<
    MetricViewKey,
    { label: string; unit: string; lowerIsBetter: boolean }
  > = {
    test_rmse: { label: "Test RMSE", unit: "pts", lowerIsBetter: true },
    val_rmse: { label: "Validation RMSE", unit: "pts", lowerIsBetter: true },
    val_mae: { label: "Validation MAE", unit: "pts", lowerIsBetter: true },
    val_r2: { label: "Validation R²", unit: "", lowerIsBetter: false },
  };

  const currentConfig = metricConfigs[activeMetric];

  // Extract metric value for a run
  const getMetricVal = (run: ExperimentSummary, key: MetricViewKey): number => {
    if (key === "test_rmse") {
      return run.test_rmse ?? run.metrics?.test_rmse ?? 0;
    }
    if (key === "val_rmse") {
      return run.val_rmse ?? run.metrics?.val_rmse ?? 0;
    }
    if (key === "val_mae") {
      return run.val_mae ?? run.metrics?.val_mae ?? 0;
    }
    if (key === "val_r2") {
      return run.val_r2 ?? run.metrics?.val_r2 ?? 0;
    }
    return 0;
  };

  // Compute best value for active metric
  const values = selectedRuns.map((r) => getMetricVal(r, activeMetric)).filter((v) => v > 0);
  const bestVal =
    values.length > 0
      ? currentConfig.lowerIsBetter
        ? Math.min(...values)
        : Math.max(...values)
      : 0;

  const maxVal = values.length > 0 ? Math.max(...values) : 1;

  // Aggregate union of parameter keys
  const paramKeys = Array.from(
    new Set(
      selectedRuns.flatMap((r) => {
        const p = r.parameters || r.params || {};
        return Object.keys(p);
      })
    )
  );

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comparison-title"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
      />

      <div className="relative w-full max-w-4xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-flex items-center gap-1">
                <GitCompare className="w-3 h-3" />
                Model Comparison
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({selectedRuns.length} models selected)
              </span>
            </div>

            <h3 id="comparison-title" className="text-xl font-bold text-slate-900">
              Multi-Run Performance &amp; Hyperparameter Matrix
            </h3>

            <p className="text-xs text-slate-500">
              Side-by-side benchmark comparison of evaluation metrics, test splits, and tuned hyperparameters.
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close comparison modal"
            className="text-slate-400 hover:text-slate-700 rounded-[8px]"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto text-xs">
          {/* Section 1: Interactive Metric Comparison Chart */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Metric Benchmark Comparison
                </h4>
                <p className="text-[11px] text-slate-500">
                  {currentConfig.lowerIsBetter
                    ? "Lower error indicates superior predictive accuracy"
                    : "Higher coefficient indicates greater variance explained"}
                </p>
              </div>

              {/* Metric Selector Tabs */}
              <div className="flex items-center gap-1 p-1 bg-white rounded-lg border border-slate-200 shadow-2xs self-start sm:self-auto">
                {(
                  [
                    ["test_rmse", "Test RMSE"],
                    ["val_rmse", "Val RMSE"],
                    ["val_mae", "Val MAE"],
                    ["val_r2", "Val R²"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveMetric(key)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                      activeMetric === key
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Horizontal Comparative Bars */}
            <div className="space-y-3 pt-2">
              {selectedRuns.map((run) => {
                const val = getMetricVal(run, activeMetric);
                const isChampion =
                  run.is_champion ||
                  run.tags?.is_champion === "true" ||
                  run.tags?.champion === "true";
                const isCandidate =
                  run.tags?.candidate === "true" ||
                  (run.model_name ?? "").toLowerCase().includes("candidate");

                const cleanModelName = (run.model_name ?? "")
                  .replace(/\s*\(Candidate\)\s*/i, "")
                  .replace(/\s*\(Champion\)\s*/i, "")
                  .trim();

                const isBest = val > 0 && Math.abs(val - bestVal) < 0.0001;
                const barPercent = maxVal > 0 ? Math.round((val / maxVal) * 100) : 0;

                return (
                  <div key={run.run_id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-slate-900 truncate">
                          {cleanModelName}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          ({run.run_id.slice(0, 8)})
                        </span>
                        {isChampion && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Champion
                          </span>
                        )}
                        {isCandidate && !isChampion && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Candidate
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isBest && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Optimal
                          </span>
                        )}
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {val.toFixed(3)} {currentConfig.unit}
                        </span>
                      </div>
                    </div>

                    {/* Proportional bar */}
                    <div className="h-2 w-full bg-slate-200/70 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isBest
                            ? "bg-emerald-500"
                            : isChampion
                            ? "bg-blue-600"
                            : "bg-slate-400"
                        }`}
                        style={{ width: `${Math.max(5, barPercent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Side-by-Side Comparison Matrix */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Evaluation &amp; Hyperparameter Matrix
            </h4>

            <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="py-2.5 px-3.5 font-bold text-slate-500 uppercase text-[10px] tracking-wider w-40">
                      Attribute / Metric
                    </th>
                    {selectedRuns.map((r) => {
                      const cleanName = (r.model_name ?? "")
                        .replace(/\s*\(Candidate\)\s*/i, "")
                        .replace(/\s*\(Champion\)\s*/i, "")
                        .trim();
                      return (
                        <th key={r.run_id} className="py-2.5 px-3 text-left">
                          <div className="flex items-center justify-between gap-1">
                            <div>
                              <span className="font-bold text-slate-900 block truncate max-w-[140px]">
                                {cleanName}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">
                                {r.run_id.slice(0, 8)}
                              </span>
                            </div>
                            {selectedRuns.length > 2 && (
                              <button
                                onClick={() => onRemoveRun(r.run_id)}
                                className="text-slate-400 hover:text-slate-600 p-0.5"
                                title="Remove from comparison"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {/* Status */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2 px-3.5 font-semibold text-slate-600">Lifecycle Status</td>
                    {selectedRuns.map((r) => {
                      const isChampion =
                        r.is_champion ||
                        r.tags?.is_champion === "true" ||
                        r.tags?.champion === "true";
                      return (
                        <td key={r.run_id} className="py-2 px-3">
                          {isChampion ? (
                            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block text-[11px]">
                              Champion
                            </span>
                          ) : (
                            <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[11px] inline-block">
                              Candidate
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Dataset */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2 px-3.5 font-semibold text-slate-600">Dataset Version</td>
                    {selectedRuns.map((r) => (
                      <td key={r.run_id} className="py-2 px-3 font-mono text-slate-800">
                        v{r.dataset_version || "1.0.0"}
                      </td>
                    ))}
                  </tr>

                  {/* Test RMSE */}
                  <tr className="hover:bg-slate-50/50 bg-blue-50/20">
                    <td className="py-2 px-3.5 font-bold text-slate-900">Test RMSE</td>
                    {selectedRuns.map((r) => (
                      <td key={r.run_id} className="py-2 px-3 font-mono font-bold text-slate-900">
                        {(r.test_rmse ?? r.metrics?.test_rmse ?? 0).toFixed(3)} pts
                      </td>
                    ))}
                  </tr>

                  {/* Val RMSE */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2 px-3.5 font-semibold text-slate-600">Validation RMSE</td>
                    {selectedRuns.map((r) => (
                      <td key={r.run_id} className="py-2 px-3 font-mono text-slate-800">
                        {(r.val_rmse ?? r.metrics?.val_rmse ?? 0).toFixed(3)} pts
                      </td>
                    ))}
                  </tr>

                  {/* Val MAE */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2 px-3.5 font-semibold text-slate-600">Validation MAE</td>
                    {selectedRuns.map((r) => (
                      <td key={r.run_id} className="py-2 px-3 font-mono text-slate-800">
                        {(r.val_mae ?? r.metrics?.val_mae ?? 0).toFixed(3)} pts
                      </td>
                    ))}
                  </tr>

                  {/* Val R2 */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2 px-3.5 font-semibold text-slate-600">Validation R²</td>
                    {selectedRuns.map((r) => (
                      <td key={r.run_id} className="py-2 px-3 font-mono font-bold text-emerald-700">
                        {(r.val_r2 ?? r.metrics?.val_r2 ?? 0).toFixed(3)}
                      </td>
                    ))}
                  </tr>

                  {/* Hyperparameters Header */}
                  {paramKeys.length > 0 && (
                    <tr className="bg-slate-50 font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                      <td colSpan={selectedRuns.length + 1} className="py-2 px-3.5">
                        <span className="inline-flex items-center gap-1">
                          <SlidersHorizontal className="w-3 h-3" />
                          Logged Parameters
                        </span>
                      </td>
                    </tr>
                  )}

                  {/* Hyperparameter Rows */}
                  {paramKeys.map((param) => (
                    <tr key={param} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3.5 font-mono text-slate-600">{param}</td>
                      {selectedRuns.map((r) => {
                        const p = r.parameters || r.params || {};
                        const val = p[param];
                        return (
                          <td key={r.run_id} className="py-2 px-3 font-mono text-slate-800">
                            {val !== undefined ? String(val) : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs h-9 px-4 font-semibold"
          >
            Close Comparison
          </Button>
        </div>
      </div>
    </div>
  );
}
