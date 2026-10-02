"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sliders, Database, Sparkles, CheckCircle2, Cpu } from "lucide-react";
import { FeatureMetadata } from "./ActiveFeatureSpace";

interface FeatureInspectorDrawerProps {
  feature: FeatureMetadata | null;
  onClose: () => void;
  featureIndex?: number;
}

export function FeatureInspectorDrawer({
  feature,
  onClose,
  featureIndex = 1,
}: FeatureInspectorDrawerProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (feature) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [feature, onClose]);

  const indexStr = featureIndex < 10 ? `0${featureIndex}` : `${featureIndex}`;

  return (
    <AnimatePresence>
      {feature && (
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

          {/* Drawer Container */}
          <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="pointer-events-auto w-full max-w-md bg-white border-l border-slate-200 h-full shadow-2xl flex flex-col justify-between overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="feature-inspector-title"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                      Feature Inspector
                    </span>
                    <h2
                      id="feature-inspector-title"
                      className="text-sm font-bold text-slate-900 font-mono"
                    >
                      {feature.name}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Close feature inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Meta summary pill ribbon */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-blue-600 text-white font-mono font-bold text-[10px] flex items-center justify-center">
                        {indexStr}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">Registration State</span>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 text-xs">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Category</span>
                      <span className="font-semibold text-slate-800">{feature.category}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Value Type</span>
                      <span className="font-mono text-slate-800 text-[11px]">{feature.type}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Pipeline Role</span>
                      <span className="font-semibold text-slate-800">Model Input Parameter</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block mb-0.5">Standardization</span>
                      <span className="font-mono text-slate-800 text-[11px]">StandardScaler(μ, σ)</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                    Domain Definition
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed p-3.5 rounded-xl border border-slate-200 bg-white">
                    {feature.desc}
                  </p>
                </div>

                {/* Subsystem Consumers */}
                <div className="space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                    Pipeline Consumers
                  </span>
                  <div className="space-y-2">
                    {feature.usedBy.map((consumer, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-md bg-white border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                            {idx === 0 ? (
                              <Cpu className="w-3.5 h-3.5 text-blue-600" />
                            ) : idx === 1 ? (
                              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            ) : (
                              <Database className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{consumer}</span>
                            <span className="text-[10.5px] text-slate-400 font-mono">
                              Subsystem verified
                            </span>
                          </div>
                        </div>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mathematical Note */}
                <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/40 text-xs text-blue-900 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-blue-800">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Ridge Regularization Attribution
                  </div>
                  <p className="text-blue-800/80 leading-relaxed text-[11.5px]">
                    During linear Ridge regression training, L2 penalty shrinks feature weights
                    proportionally to minimize multi-collinearity without discarding valid regressors.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">
                  Schema: v1.0.0 &bull; 11 Features Active
                </span>
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
