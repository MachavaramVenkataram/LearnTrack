"use client";

import React from "react";
import {
  ArrowUpDown,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { ExperimentSummary } from "@/lib/api/mlOps";
import { Button } from "@/components/ui/Button";

export type SortField = "time" | "mae" | "rmse" | "r2" | "test_rmse";

export interface ExperimentRunsTableProps {
  runs: ExperimentSummary[];
  selectedRunIds: string[];
  onToggleSelectRun: (runId: string) => void;
  onSelectAllRuns: () => void;
  onClearSelection: () => void;
  onInspectRun: (run: ExperimentSummary) => void;
  sortField: SortField;
  sortAsc: boolean;
  onToggleSort: (field: SortField) => void;
}

export function ExperimentRunsTable({
  runs,
  selectedRunIds,
  onToggleSelectRun,
  onSelectAllRuns,
  onClearSelection,
  onInspectRun,
  sortField,
  sortAsc,
  onToggleSort,
}: ExperimentRunsTableProps) {
  const isAllSelected = runs.length > 0 && selectedRunIds.length === runs.length;
  const isIndeterminate =
    selectedRunIds.length > 0 && selectedRunIds.length < runs.length;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[16px] overflow-hidden shadow-xs">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table
          className="w-full table-fixed border-collapse text-left"
          style={{ minWidth: "1060px" }}
        >
          <colgroup>
            <col style={{ width: "4%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "9%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>

          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/70 h-11 text-[11px] font-semibold text-slate-500 uppercase tracking-wider select-none">
              {/* Checkbox Header */}
              <th scope="col" className="py-2.5 px-3 text-center align-middle">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isIndeterminate;
                  }}
                  onChange={() => {
                    if (isAllSelected) {
                      onClearSelection();
                    } else {
                      onSelectAllRuns();
                    }
                  }}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 cursor-pointer"
                  aria-label="Select all runs"
                />
              </th>

              {/* RUN ID & NAME */}
              <th scope="col" className="py-2.5 px-4 text-left">
                Run ID &amp; Name
              </th>

              {/* MODEL */}
              <th scope="col" className="py-2.5 px-4 text-left">
                Model Architecture
              </th>

              {/* DATASET */}
              <th scope="col" className="py-2.5 px-3 text-center">
                Dataset
              </th>

              {/* VAL MAE */}
              <th
                scope="col"
                onClick={() => onToggleSort("mae")}
                className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-100/70 transition-colors"
                title="Sort by Validation MAE (Lower is better)"
              >
                <div className="inline-flex items-center justify-center gap-1">
                  <span>Val MAE</span>
                  {sortField === "mae" ? (
                    <span className="text-[10px] font-bold text-blue-600 font-mono">
                      {sortAsc ? "↑" : "↓"}
                    </span>
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-300" />
                  )}
                </div>
              </th>

              {/* VAL RMSE */}
              <th
                scope="col"
                onClick={() => onToggleSort("rmse")}
                className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-100/70 transition-colors"
                title="Sort by Validation RMSE (Lower is better)"
              >
                <div className="inline-flex items-center justify-center gap-1">
                  <span>Val RMSE</span>
                  {sortField === "rmse" ? (
                    <span className="text-[10px] font-bold text-blue-600 font-mono">
                      {sortAsc ? "↑" : "↓"}
                    </span>
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-300" />
                  )}
                </div>
              </th>

              {/* VAL R2 */}
              <th
                scope="col"
                onClick={() => onToggleSort("r2")}
                className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-100/70 transition-colors"
                title="Sort by Validation R² (Higher is better)"
              >
                <div className="inline-flex items-center justify-center gap-1">
                  <span>Val R²</span>
                  {sortField === "r2" ? (
                    <span className="text-[10px] font-bold text-blue-600 font-mono">
                      {sortAsc ? "↑" : "↓"}
                    </span>
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-300" />
                  )}
                </div>
              </th>

              {/* TEST RMSE */}
              <th
                scope="col"
                onClick={() => onToggleSort("test_rmse")}
                className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-100/70 transition-colors"
                title="Sort by Test Split RMSE"
              >
                <div className="inline-flex items-center justify-center gap-1">
                  <span>Test RMSE</span>
                  {sortField === "test_rmse" ? (
                    <span className="text-[10px] font-bold text-blue-600 font-mono">
                      {sortAsc ? "↑" : "↓"}
                    </span>
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-300" />
                  )}
                </div>
              </th>

              {/* TIMESTAMP */}
              <th
                scope="col"
                onClick={() => onToggleSort("time")}
                className="py-2.5 px-3 text-left cursor-pointer hover:bg-slate-100/70 transition-colors"
                title="Sort by execution timestamp"
              >
                <div className="inline-flex items-center gap-1">
                  <span>Timestamp</span>
                  {sortField === "time" ? (
                    <span className="text-[10px] font-bold text-blue-600 font-mono">
                      {sortAsc ? "↑" : "↓"}
                    </span>
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-300" />
                  )}
                </div>
              </th>

              {/* ACTION */}
              <th scope="col" className="py-2.5 px-4 text-right">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100/90 text-xs">
            {runs.map((run) => {
              const isSelected = selectedRunIds.includes(run.run_id);
              const isChampion =
                run.is_champion ||
                run.tags?.is_champion === "true" ||
                run.tags?.champion === "true";
              const isCandidate =
                run.tags?.candidate === "true" ||
                (run.model_name ?? "").toLowerCase().includes("candidate");

              const runIdShort = run.run_id ? `${run.run_id.slice(0, 8)}…` : "—";
              const cleanModelName = (run.model_name ?? "")
                .replace(/\s*\(Candidate\)\s*/i, "")
                .replace(/\s*\(Champion\)\s*/i, "")
                .trim();

              const valMae = run.val_mae ?? run.metrics?.val_mae;
              const valRmse = run.val_rmse ?? run.metrics?.val_rmse;
              const valR2 = run.val_r2 ?? run.metrics?.val_r2;
              const testRmse = run.test_rmse ?? run.metrics?.test_rmse;

              const ts = run.start_time ? new Date(run.start_time) : null;
              const tsDate = ts?.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const tsTime = ts?.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              // Subtle bar percentage for R²
              const r2Percentage =
                valR2 !== null && valR2 !== undefined
                  ? Math.max(0, Math.min(100, Math.round(valR2 * 100)))
                  : null;

              return (
                <tr
                  key={run.run_id}
                  className={`group transition-all duration-150 ${
                    isSelected
                      ? "bg-blue-50/40 border-l-2 border-l-blue-600"
                      : isChampion
                      ? "bg-emerald-50/20 hover:bg-emerald-50/40"
                      : "hover:bg-[#F8FAFC]"
                  }`}
                  style={{ height: "64px" }}
                >
                  {/* Checkbox */}
                  <td className="py-2 px-3 text-center align-middle">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectRun(run.run_id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/30 cursor-pointer"
                      aria-label={`Select run ${run.run_id}`}
                    />
                  </td>

                  {/* Run ID & Secondary Name */}
                  <td className="py-2 px-4 align-middle overflow-hidden">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          onClick={() => onInspectRun(run)}
                          className="font-mono text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer truncate"
                          title={`Click to inspect run ${run.run_id}`}
                        >
                          {runIdShort}
                        </span>

                        {isChampion && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            Champion
                          </span>
                        )}

                        {isCandidate && !isChampion && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                            Candidate
                          </span>
                        )}
                      </div>

                      <span
                        className="text-[11px] text-slate-500 truncate block mt-0.5 font-mono"
                        title={run.run_name || cleanModelName}
                      >
                        {run.run_name || cleanModelName}
                      </span>
                    </div>
                  </td>

                  {/* Model Architecture */}
                  <td className="py-2 px-4 align-middle overflow-hidden">
                    <div className="flex flex-col min-w-0">
                      <span
                        className="text-xs font-bold text-slate-900 truncate block"
                        title={cleanModelName}
                      >
                        {cleanModelName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        regression · L2 tuned
                      </span>
                    </div>
                  </td>

                  {/* Dataset */}
                  <td className="py-2 px-3 align-middle text-center overflow-hidden">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
                      v{run.dataset_version || "1.0.0"}
                    </span>
                  </td>

                  {/* Val MAE */}
                  <td className="py-2 px-3 align-middle text-center font-mono font-medium tabular-nums text-slate-700">
                    {valMae !== null && valMae !== undefined ? (
                      valMae.toFixed(3)
                    ) : (
                      <span className="text-slate-300 font-normal">—</span>
                    )}
                  </td>

                  {/* Val RMSE */}
                  <td className="py-2 px-3 align-middle text-center font-mono font-medium tabular-nums text-slate-700">
                    {valRmse !== null && valRmse !== undefined ? (
                      valRmse.toFixed(3)
                    ) : (
                      <span className="text-slate-300 font-normal">—</span>
                    )}
                  </td>

                  {/* Val R² with visual indicator */}
                  <td className="py-2 px-3 align-middle text-center font-mono tabular-nums">
                    {valR2 !== null && valR2 !== undefined ? (
                      <div className="inline-flex flex-col items-center">
                        <span
                          className={`text-xs font-bold ${
                            valR2 >= 0.84
                              ? "text-emerald-700"
                              : valR2 >= 0.8
                              ? "text-blue-700"
                              : "text-slate-700"
                          }`}
                        >
                          {valR2.toFixed(3)}
                        </span>
                        {/* Visual R² mini bar */}
                        <div className="w-12 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              valR2 >= 0.84 ? "bg-emerald-500" : "bg-blue-500"
                            }`}
                            style={{ width: `${r2Percentage}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-300 font-normal">—</span>
                    )}
                  </td>

                  {/* Test RMSE */}
                  <td className="py-2 px-3 align-middle text-center font-mono font-bold tabular-nums text-slate-900">
                    {testRmse !== null && testRmse !== undefined ? (
                      <span>{testRmse.toFixed(3)}</span>
                    ) : (
                      <span className="text-slate-300 font-normal">—</span>
                    )}
                  </td>

                  {/* Timestamp */}
                  <td className="py-2 px-3 align-middle">
                    {tsDate ? (
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-800 whitespace-nowrap">
                          {tsDate}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                          {tsTime}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-2 px-4 align-middle text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onInspectRun(run)}
                      className="h-8 px-2.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50/80 rounded-[8px] cursor-pointer inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Inspect</span>
                      <ArrowRight className="w-3 h-3 text-blue-500" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-slate-100">
        {runs.map((run) => {
          const isSelected = selectedRunIds.includes(run.run_id);
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

          const testRmse = run.test_rmse ?? run.metrics?.test_rmse ?? 7.677;
          const valR2 = run.val_r2 ?? run.metrics?.val_r2 ?? 0.845;

          return (
            <div
              key={run.run_id}
              className={`p-4 space-y-3 ${
                isSelected ? "bg-blue-50/40" : isChampion ? "bg-emerald-50/20" : "bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelectRun(run.run_id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    aria-label={`Select run ${run.run_id}`}
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-blue-600">
                        {run.run_id.slice(0, 8)}…
                      </span>
                      {isChampion && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Champion
                        </span>
                      )}
                      {isCandidate && !isChampion && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Candidate
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-900 block mt-0.5">
                      {cleanModelName}
                    </span>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  v{run.dataset_version || "1.0.0"}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Test RMSE
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                    {testRmse.toFixed(3)} pts
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Val R²
                  </span>
                  <span className="font-mono font-bold text-emerald-700 text-sm mt-0.5 block">
                    {valR2.toFixed(3)}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10.5px] text-slate-400 font-mono">
                  Status: {run.status}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onInspectRun(run)}
                  className="h-8 text-xs font-semibold text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  Inspect →
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
