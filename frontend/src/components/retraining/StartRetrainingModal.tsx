"use client";

import React, { useState } from "react";
import { PlayCircle, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface StartRetrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRetrain: (trigger: string, force: boolean) => Promise<void>;
  isRetraining: boolean;
  productionModelName?: string;
  datasetVersion?: string;
}

export function StartRetrainingModal({
  isOpen,
  onClose,
  onConfirmRetrain,
  isRetraining,
  productionModelName = "Linear Regression (Ridge)",
  datasetVersion = "1.0.0",
}: StartRetrainingModalProps) {
  const [force, setForce] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirmRetrain("manual", force);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Start Automated Retraining Pipeline"
      description="Launch controlled candidate model generation and cross-validation against held-out splits."
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
        {/* Pipeline Specifications */}
        <div className="space-y-2.5 bg-slate-50/80 rounded-xl p-3.5 border border-slate-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Dataset Partition</span>
            <span className="font-mono font-bold text-slate-900">v{datasetVersion} (1,044 samples)</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Model Architecture</span>
            <span className="font-semibold text-slate-900">Ridge Regression (L2 Regularized)</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Validation Strategy</span>
            <span className="font-semibold text-slate-900">5-Fold CV + 20% Held-Out Test</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Current Production Model</span>
            <span className="font-semibold text-slate-900">{productionModelName}</span>
          </div>
        </div>

        {/* Regression Safeguards Notice */}
        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-600 leading-relaxed">
            The candidate model will be verified against a maximum 5.0% RMSE regression tolerance before being held in the registry. It will <strong>not</strong> be automatically promoted.
          </p>
        </div>

        {/* Force Option */}
        <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer select-none">
          <input
            type="checkbox"
            checked={force}
            onChange={(e) => setForce(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <span className="font-bold text-slate-900 text-xs block">
              Bypass minimum sample requirement (Force Run)
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Allows regenerating a fresh candidate model on existing partition data even if feedback count is below threshold.
            </span>
          </div>
        </label>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isRetraining}
            className="text-xs h-9"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isRetraining}
            className="text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            leftIcon={<PlayCircle className="w-3.5 h-3.5" />}
          >
            {isRetraining ? "Retraining Candidates…" : "Start Retraining Pipeline"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
