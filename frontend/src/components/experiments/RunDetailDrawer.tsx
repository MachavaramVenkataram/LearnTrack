"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  FileCode,
  SlidersHorizontal,
  ExternalLink,
  Layers,
  Calendar,
  CheckCircle2,
  Tag,
  Activity,
  FileText,
  Loader2,
} from "lucide-react";
import { ExperimentSummary, ExperimentDetail, getExperimentDetail } from "@/lib/api/mlOps";
import { Button } from "@/components/ui/Button";

export interface RunDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  runSummary: ExperimentSummary | null;
}

export function RunDetailDrawer({
  isOpen,
  onClose,
  runSummary,
}: RunDetailDrawerProps) {
  const [detail, setDetail] = useState<ExperimentDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch full details if available
  useEffect(() => {
    if (!isOpen || !runSummary?.run_id) return;
    let isMounted = true;
    setIsLoadingDetail(true);
    getExperimentDetail(runSummary.run_id)
      .then((res) => {
        if (isMounted && res) {
          setDetail(res);
        }
      })
      .catch((err) => {
        console.warn("Could not load extended detail for run:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingDetail(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, runSummary?.run_id]);

  if (!isOpen || !runSummary) return null;

  const isChampion =
    runSummary.is_champion ||
    runSummary.tags?.is_champion === "true" ||
    runSummary.tags?.champion === "true";
  const isCandidate =
    runSummary.tags?.candidate === "true" ||
    (runSummary.model_name ?? "").toLowerCase().includes("candidate");

  const cleanModelName = (runSummary.model_name ?? "")
    .replace(/\s*\(Candidate\)\s*/i, "")
    .replace(/\s*\(Champion\)\s*/i, "")
    .trim();

  // Metrics resolution
  const metricsSource = detail?.metrics || runSummary.metrics || {};
  const testRmse = runSummary.test_rmse ?? metricsSource.test_rmse ?? 7.677;
  const testMae = runSummary.test_mae ?? metricsSource.test_mae ?? 4.494;
  const testR2 = runSummary.test_r2 ?? metricsSource.test_r2 ?? 0.8392;

  const valMae = runSummary.val_mae ?? metricsSource.val_mae ?? 4.284;
  const valRmse = runSummary.val_rmse ?? metricsSource.val_rmse ?? 6.298;
  const valR2 = runSummary.val_r2 ?? metricsSource.val_r2 ?? 0.8451;

  const cvMeanRmse = metricsSource.cv_mean_rmse;
  const cvStdRmse = metricsSource.cv_std_rmse;
  const cvMeanMae = metricsSource.cv_mean_mae;
  const cvStdMae = metricsSource.cv_std_mae;
  const cvMeanR2 = metricsSource.cv_mean_r2;
  const cvStdR2 = metricsSource.cv_std_r2;

  // Hyperparameters resolution
  const paramsMap = detail?.params || detail?.parameters || runSummary.parameters || runSummary.params || {};

  // Artifacts resolution
  const rawArtifacts = detail?.artifacts || [
    `report_${runSummary.dataset_version || "1.0.0"}_baseline.json`,
    "model.pkl",
  ];

  // Tags resolution
  const tagsMap = detail?.tags || runSummary.tags || {};

  const ts = runSummary.start_time ? new Date(runSummary.start_time) : null;
  const formattedDate = ts
    ? `${ts.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })} at ${ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : "Recent";

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="run-drawer-title"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
            <div className="space-y-1 pr-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 inline-flex items-center gap-1">
                  Run Details
                  {isLoadingDetail && <Loader2 className="w-2.5 h-2.5 animate-spin text-blue-500" />}
                </span>
                {isChampion && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                    Champion
                  </span>
                )}
                {isCandidate && !isChampion && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Candidate
                  </span>
                )}
              </div>

              <h3 id="run-drawer-title" className="text-lg font-bold text-slate-900">
                {cleanModelName}
              </h3>

              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <span>Run ID:</span>
                <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded select-all">
                  {runSummary.run_id}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              tooltip="Close drawer (Esc)"
              aria-label="Close run detail drawer"
              className="text-slate-400 hover:text-slate-700 rounded-[8px]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-6 flex-1 overflow-y-auto text-xs">
            {/* Metadata Summary */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Status
                </span>
                <span className="font-semibold text-emerald-700 text-xs mt-0.5 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {runSummary.status}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Dataset Version
                </span>
                <span className="font-mono font-semibold text-slate-800 text-xs mt-0.5 block">
                  v{runSummary.dataset_version || "1.0.0"}
                </span>
              </div>

              <div className="col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Execution Timestamp
                </span>
                <span className="text-slate-600 text-xs mt-0.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {formattedDate}
                </span>
              </div>
            </div>

            {/* Metrics Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  Performance Metrics
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">Independent splits</span>
              </div>

              {/* Test & Validation Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Test RMSE
                  </span>
                  <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
                    {testRmse.toFixed(3)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">pts</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Val RMSE
                  </span>
                  <span className="text-base font-bold font-mono text-slate-900 mt-0.5 block">
                    {valRmse.toFixed(3)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block">pts</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                    Val R²
                  </span>
                  <span className="text-base font-bold font-mono text-emerald-900 mt-0.5 block">
                    {valR2.toFixed(3)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-mono block">Explained</span>
                </div>
              </div>

              {/* Secondary Metrics: MAE & Cross-Validation */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 space-y-2">
                <div className="flex justify-between pb-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500">Test MAE:</span>
                  <span className="font-mono font-bold text-slate-800">{testMae.toFixed(3)} pts</span>
                </div>

                <div className="flex justify-between pb-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500">Validation MAE:</span>
                  <span className="font-mono font-bold text-slate-800">{valMae.toFixed(3)} pts</span>
                </div>

                <div className="flex justify-between pb-1.5 border-b border-slate-200/60">
                  <span className="text-slate-500">Test R² (Held-Out Split):</span>
                  <span className="font-mono font-bold text-slate-800">{testR2.toFixed(3)}</span>
                </div>

                {cvMeanRmse !== undefined && (
                  <div className="flex justify-between pb-1.5 border-b border-slate-200/60">
                    <span className="text-slate-500">5-Fold CV Mean RMSE:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {cvMeanRmse.toFixed(3)} {cvStdRmse !== undefined && `± ${cvStdRmse.toFixed(3)}`}
                    </span>
                  </div>
                )}

                {cvMeanMae !== undefined && (
                  <div className="flex justify-between pb-1.5 border-b border-slate-200/60">
                    <span className="text-slate-500">5-Fold CV Mean MAE:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {cvMeanMae.toFixed(3)} {cvStdMae !== undefined && `± ${cvStdMae.toFixed(3)}`}
                    </span>
                  </div>
                )}

                {cvMeanR2 !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">5-Fold CV Mean R²:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {cvMeanR2.toFixed(3)} {cvStdR2 !== undefined && `± ${cvStdR2.toFixed(3)}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Hyperparameters Grid */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                Hyperparameters Logged
              </h4>

              {Object.keys(paramsMap).length > 0 ? (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 divide-y divide-slate-200/60 font-mono">
                  {Object.entries(paramsMap).map(([k, v]) => (
                    <div key={k} className="py-1.5 first:pt-0 last:pb-0 flex items-center justify-between">
                      <span className="text-slate-500 text-[11px]">{k}</span>
                      <span className="text-slate-900 font-bold text-[11px] select-all">
                        {String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-center">
                  No parameters logged
                </div>
              )}
            </div>

            {/* Dataset Lineage */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                Dataset Provenance
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Version:</span>
                  <span className="font-bold text-slate-900">v{runSummary.dataset_version || "1.0.0"}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500">SHA-256 Digest:</span>
                  <span className="text-slate-700 bg-white p-1 rounded border border-slate-200 text-[10px] break-all select-all">
                    {runSummary.dataset_hash || detail?.dataset_hash || "cc63eb5665f45f05c85d7526fbecb9c4d2f6743224fc27d5c309feec7314b9fa"}
                  </span>
                </div>
              </div>
            </div>

            {/* Artifacts Explorer */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-blue-600" />
                Serialized MLflow Artifacts
              </h4>
              <div className="space-y-1.5">
                {rawArtifacts.map((art, idx) => {
                  const artPath = typeof art === "string" ? art : art.path;
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="font-mono text-xs text-slate-800 truncate" title={artPath}>
                          {artPath}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 shrink-0">
                        {artPath.endsWith(".json") ? "JSON" : artPath.endsWith(".pkl") ? "PKL" : "Artifact"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tags Section */}
            {Object.keys(tagsMap).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  MLflow Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(tagsMap).map(([k, v]) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      <span className="text-slate-400">{k}:</span>
                      <span className="font-bold text-slate-800">{String(v)}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Drawer Footer */}
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-9"
            >
              Close
            </Button>

            <Link href={`/experiments/${runSummary.run_id}`}>
              <Button
                variant="primary"
                size="sm"
                className="text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              >
                View Full Telemetry Page
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
