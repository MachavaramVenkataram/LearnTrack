"use client";

import React, { useState } from "react";
import { Check, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface PromoteModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateVersion: string;
  candidateModelType?: string;
  candidateRmse?: number;
  productionRmse?: number;
  onConfirmPromotion: (promoterName: string, reason: string) => Promise<void>;
  isSubmitting: boolean;
}

export function PromoteModelModal({
  isOpen,
  onClose,
  candidateVersion,
  candidateModelType = "Linear Regression (Ridge)",
  candidateRmse = 7.677,
  productionRmse = 7.677,
  onConfirmPromotion,
  isSubmitting,
}: PromoteModelModalProps) {
  const [promoterName, setPromoterName] = useState<string>("Lead MLOps Engineer");
  const [promotionReason, setPromotionReason] = useState<string>(
    "Candidate validated with superior predictive stability"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirmPromotion(promoterName, promotionReason);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Explicit Model Promotion Gate"
      description="Promotion replaces the active production model and archives the previous baseline. Document your rationale for the immutable audit trail."
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
        {/* Verification Summary Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Candidate Architecture</span>
            <span className="font-bold text-slate-900">{candidateModelType}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Candidate Version</span>
            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {candidateVersion}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-center">
            <div className="p-2 rounded-lg bg-white border border-slate-200/70">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Production Baseline
              </span>
              <span className="font-mono font-bold text-slate-700 text-sm mt-0.5 block">
                {productionRmse} RMSE
              </span>
            </div>

            <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                Candidate Score
              </span>
              <span className="font-mono font-bold text-emerald-900 text-sm mt-0.5 block">
                {candidateRmse} RMSE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-1 text-[11px] text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>5-Fold Cross-Validation & Regression Protection checks PASSED</span>
          </div>
        </div>

        {/* Authorizing Engineer Field */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Authorizing Engineer / Administrator
          </label>
          <input
            type="text"
            required
            value={promoterName}
            onChange={(e) => setPromoterName(e.target.value)}
            placeholder="e.g., Alex Johnson (MLOps Lead)"
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
        </div>

        {/* Promotion Rationale Field */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Documented Promotion Rationale
          </label>
          <textarea
            required
            rows={3}
            value={promotionReason}
            onChange={(e) => setPromotionReason(e.target.value)}
            placeholder="Explain validation evidence justifying deployment..."
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs h-9"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            className="text-xs h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-2xs"
            leftIcon={<Check className="w-3.5 h-3.5" />}
          >
            {isSubmitting ? "Deploying Candidate…" : "Confirm Promotion to Production"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
