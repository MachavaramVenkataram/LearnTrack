"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Sparkles,
  GitBranch,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

interface ModelCardDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  modelVersion: string;
  modelType: string;
  target: string;
  targetScale: string;
  datasetName: string;
  featureCount: number;
  valMetrics?: { mae: number; rmse: number; r2: number };
  testMetrics?: { mae: number; rmse: number; r2: number };
  runId?: string;
  selectionRationale?: string;
}

export function ModelCardDrawer({
  isOpen,
  onClose,
  modelVersion,
  modelType,
  target,
  targetScale,
  datasetName,
  featureCount,
  valMetrics,
  testMetrics,
  runId = "candidate-8963bdf8",
  selectionRationale,
}: ModelCardDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer */}
          <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="pointer-events-auto w-full max-w-lg bg-white border-l border-slate-200 h-full shadow-2xl flex flex-col justify-between overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="model-card-drawer-title"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                      Production Specification
                    </span>
                    <h2
                      id="model-card-drawer-title"
                      className="text-sm font-bold text-slate-900"
                    >
                      LearnTrack Model Card
                    </h2>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Close model card"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* 1. Model & Architecture */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400">
                      Model Identity
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Production Champion
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{modelType}</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Artifact: {modelVersion}
                    </p>
                  </div>

                  {selectionRationale && (
                    <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600 leading-relaxed">
                      <strong>Selection Rationale:</strong> {selectionRationale}
                    </div>
                  )}
                </div>

                {/* 2. Target & Dataset */}
                <div className="space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                    Dataset &amp; Target Variable
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl border border-slate-200 bg-white">
                      <span className="text-[10px] font-mono text-slate-400 block mb-0.5">
                        Target Name
                      </span>
                      <span className="font-mono font-bold text-slate-900">{target}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                        {targetScale}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-white">
                      <span className="text-[10px] font-mono text-slate-400 block mb-0.5">
                        Feature Dimension
                      </span>
                      <span className="font-bold text-slate-900">{featureCount} Regressors</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                        Standardized inputs
                      </span>
                    </div>

                    <div className="col-span-2 p-3 rounded-xl border border-slate-200 bg-white">
                      <span className="text-[10px] font-mono text-slate-400 block mb-0.5">
                        Benchmark Dataset
                      </span>
                      <span className="font-semibold text-slate-800">{datasetName}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                        Partitioned into 80% train-val (N=519) and 20% independent test (N=130)
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Evaluation Benchmarks */}
                <div className="space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                    Verified Evaluation Summary
                  </span>
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] font-mono text-slate-400 block">MAE</span>
                        <span className="font-mono font-bold text-slate-900">
                          {testMetrics?.mae?.toFixed(2) ?? "4.49"}
                        </span>
                        <span className="text-[9px] text-slate-400 block">Holdout</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] font-mono text-slate-400 block">RMSE</span>
                        <span className="font-mono font-bold text-slate-900">
                          {testMetrics?.rmse?.toFixed(2) ?? "7.68"}
                        </span>
                        <span className="text-[9px] text-slate-400 block">Holdout</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white border border-slate-200">
                        <span className="text-[10px] font-mono text-slate-400 block">R² Score</span>
                        <span className="font-mono font-bold text-blue-600">
                          {testMetrics?.r2?.toFixed(3) ?? "0.839"}
                        </span>
                        <span className="text-[9px] text-slate-400 block">Holdout</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono text-center">
                      Cross-Validation: MAE {valMetrics?.mae?.toFixed(2) ?? "4.28"} &bull; RMSE{" "}
                      {valMetrics?.rmse?.toFixed(2) ?? "6.30"} &bull; R²{" "}
                      {valMetrics?.r2?.toFixed(3) ?? "0.845"}
                    </div>
                  </div>
                </div>

                {/* 4. Explainability & Lineage */}
                <div className="space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                    Explainability &amp; Lineage
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <div>
                          <span className="font-semibold text-slate-900 block">SHAP Engine</span>
                          <span className="text-[10.5px] text-slate-400 font-mono">
                            Local attribution via linear model coefficient product
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        Active
                      </span>
                    </div>

                    <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-blue-600" />
                        <div>
                          <span className="font-semibold text-slate-900 block">MLflow Tracking</span>
                          <span className="text-[10.5px] text-slate-400 font-mono">
                            Run ID: {runId}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        Logged
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Statistical Disclaimer (Section 21) */}
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 text-xs text-amber-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    Statistical Disclaimer &amp; Human-in-the-Loop Policy
                  </div>
                  <p className="text-amber-800 leading-relaxed text-[11.5px]">
                    Model outputs are statistical estimates and do not guarantee academic outcomes.
                    Attributions and predictions are intended strictly to support academic mentoring
                    and early proactive intervention under educator discretion.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">
                  LearnTrack Governance &bull; RFC-014
                </span>
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  Close Model Card
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
