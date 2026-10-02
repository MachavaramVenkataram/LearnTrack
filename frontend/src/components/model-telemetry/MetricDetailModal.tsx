"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart3, CheckCircle2 } from "lucide-react";

export type MetricType = "MAE" | "RMSE" | "R2";

interface MetricDetailModalProps {
  isOpen: boolean;
  metricType: MetricType | null;
  onClose: () => void;
  cvValue: number;
  holdoutValue: number;
}

const METRIC_DEFINITIONS: Record<
  MetricType,
  {
    fullName: string;
    description: string;
    formula: string;
    interpretation: string;
    unit: string;
    source: string;
  }
> = {
  MAE: {
    fullName: "Mean Absolute Error",
    description:
      "The average magnitude of errors between predicted marks and true student marks, giving equal weight to all individual differences.",
    formula: "MAE = (1/N) * Σ |y_actual - y_predicted|",
    interpretation:
      "Lower values indicate closer individual predictions on average. On a 0–100 academic score scale, an MAE of 4.49 indicates that predictions typically deviate by under 4.5 points.",
    unit: "score points (0–100)",
    source: "Stratified 5-Fold Cross-Validation & Independent Test Split (N=130)",
  },
  RMSE: {
    fullName: "Root Mean Squared Error",
    description:
      "The square root of the mean squared differences between predictions and actuals. Because errors are squared before averaging, RMSE penalizes larger outliers more heavily.",
    formula: "RMSE = √[(1/N) * Σ (y_actual - y_predicted)²]",
    interpretation:
      "Essential for academic alert models because severe misses (e.g. failing to detect a student failing by 20 marks) are penalized significantly more than several minor 2-point deviations.",
    unit: "score points (0–100)",
    source: "Stratified 5-Fold Cross-Validation & Independent Test Split (N=130)",
  },
  R2: {
    fullName: "Coefficient of Determination (R²)",
    description:
      "The proportion of variance in the dependent variable (final score) that is predictable from the independent regressors.",
    formula: "R² = 1 - [SS_residual / SS_total]",
    interpretation:
      "A score of 0.839 means that 83.9% of the variability in final student performance is explained by the 11 engineered features in this model.",
    unit: "dimensionless ratio (0.0 to 1.0)",
    source: "Stratified 5-Fold Cross-Validation & Independent Test Split (N=130)",
  },
};

export function MetricDetailModal({
  isOpen,
  metricType,
  onClose,
  cvValue,
  holdoutValue,
}: MetricDetailModalProps) {
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

  if (!metricType) return null;
  const def = METRIC_DEFINITIONS[metricType];
  const delta = holdoutValue - cvValue;
  const deltaStr = delta >= 0 ? `+${delta.toFixed(3)}` : delta.toFixed(3);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="metric-detail-title"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                    Metric Intelligence
                  </span>
                  <h2 id="metric-detail-title" className="text-base font-bold text-slate-900">
                    {def.fullName} ({metricType})
                  </h2>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Close metric details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5 text-xs">
              {/* Values Comparison Strip */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Cross-Validation
                  </span>
                  <span className="font-mono text-xl font-bold text-slate-900">
                    {metricType === "R2" ? cvValue.toFixed(3) : cvValue.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">5-Fold Avg</span>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Holdout Test
                  </span>
                  <span className="font-mono text-xl font-bold text-blue-600">
                    {metricType === "R2" ? holdoutValue.toFixed(3) : holdoutValue.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Independent N=130</span>
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Generalization Δ
                  </span>
                  <span className="font-mono text-xl font-bold text-slate-700">
                    {deltaStr}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Holdout - CV</span>
                </div>
              </div>

              {/* Definition */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                  Definition &amp; Methodology
                </span>
                <p className="text-slate-700 leading-relaxed p-3.5 rounded-xl border border-slate-200 bg-white">
                  {def.description}
                </p>
              </div>

              {/* Mathematical Formula */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                  Mathematical Representation
                </span>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-900 text-slate-100 font-mono text-xs">
                  <code>{def.formula}</code>
                </div>
              </div>

              {/* Interpretation */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                  Academic Interpretation
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {def.interpretation}
                </p>
              </div>

              {/* Source */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Units: {def.unit}</span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified on Split
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
