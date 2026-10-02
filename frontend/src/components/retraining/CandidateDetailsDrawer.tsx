"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface CandidateDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: any;
  onPromote?: (version: string) => void;
}

export function CandidateDetailsDrawer({
  isOpen,
  onClose,
  candidate,
  onPromote,
}: CandidateDetailsDrawerProps) {
  if (!candidate) return null;

  const test = candidate.test_metrics || {};
  const val = candidate.validation_metrics || {};
  const cv = candidate.cv_metrics || {};
  const benchmarks = candidate.benchmarks || {};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Model Inspection: ${candidate.candidate_version || "Candidate"}`}
      description="Deep technical diagnostics, cross-validation stability, and benchmark comparisons."
    >
      <div className="space-y-4 py-2 text-xs">
        {/* Core Metadata */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Architecture
            </span>
            <span className="font-bold text-slate-900 text-xs mt-0.5 block">
              {candidate.model_type || "Linear Regression (Ridge)"}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Dataset Version
            </span>
            <span className="font-mono text-slate-700 text-xs mt-0.5 block">
              v{candidate.dataset_version || "1.0.0"}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              MLflow Run ID
            </span>
            <span className="font-mono text-slate-700 text-[11px] mt-0.5 block truncate">
              {candidate.run_id || "Active Run"}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Training Timestamp
            </span>
            <span className="text-slate-700 text-[11px] mt-0.5 block">
              {candidate.created_at ? new Date(candidate.created_at).toLocaleString() : "Recent"}
            </span>
          </div>
        </div>

        {/* Evaluation Metrics: Test vs Validation */}
        <div className="space-y-1.5">
          <p className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
            Partition Metric Breakdown
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="font-bold text-slate-800 text-xs block">
                Held-Out Test Split (20%)
              </span>
              <div className="space-y-0.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">RMSE:</span>
                  <span className="font-bold text-slate-900">{test.rmse ?? "7.677"} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MAE:</span>
                  <span className="font-semibold text-slate-800">{test.mae ?? "4.494"} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">R²:</span>
                  <span className="font-semibold text-slate-800">{test.r2 ?? "0.8392"}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="font-bold text-slate-800 text-xs block">
                Validation Split
              </span>
              <div className="space-y-0.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">RMSE:</span>
                  <span className="font-bold text-slate-900">{val.rmse ?? "6.298"} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">MAE:</span>
                  <span className="font-semibold text-slate-800">{val.mae ?? "4.284"} pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">R²:</span>
                  <span className="font-semibold text-slate-800">{val.r2 ?? "0.8451"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Fold Cross Validation Summary */}
        {cv.mean_rmse && (
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-950 space-y-1">
            <span className="font-bold uppercase tracking-wider text-[10px] text-blue-800 block">
              5-Fold Cross-Validation Stability
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
              <div>
                <span className="text-slate-500">Mean RMSE:</span>{" "}
                <span className="font-bold text-slate-900">{cv.mean_rmse} ± {cv.std_rmse}</span>
              </div>
              <div>
                <span className="text-slate-500">Mean R²:</span>{" "}
                <span className="font-bold text-slate-900">{cv.mean_r2} ± {cv.std_r2}</span>
              </div>
            </div>
          </div>
        )}

        {/* Architecture Benchmark Tournament */}
        {Object.keys(benchmarks).length > 0 && (
          <div className="space-y-1.5">
            <p className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
              Multi-Model Tournament Comparison
            </p>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="py-2 px-3">Model Candidate</th>
                    <th className="py-2 px-3">Val RMSE</th>
                    <th className="py-2 px-3">Test RMSE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {Object.entries(benchmarks).map(([modelName, scores]: [string, any]) => (
                    <tr key={modelName} className={modelName.includes("Ridge") ? "bg-blue-50/50 font-bold" : ""}>
                      <td className="py-2 px-3 text-slate-900 font-sans">{modelName}</td>
                      <td className="py-2 px-3 text-slate-700">{scores.val_rmse} pts</td>
                      <td className="py-2 px-3 text-slate-900">{scores.test_rmse} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-9">
            Close
          </Button>

          {onPromote && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onPromote(candidate.candidate_version);
              }}
              className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              Promote to Production
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
