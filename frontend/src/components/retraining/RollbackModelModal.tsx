"use client";

import React, { useState } from "react";
import { RotateCcw, AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface RollbackModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion?: string;
  defaultTargetVersion?: string;
  onConfirmRollback: (targetVersion: string, reason: string) => Promise<void>;
  isSubmitting: boolean;
}

export function RollbackModelModal({
  isOpen,
  onClose,
  currentVersion = "candidate-8963bdf8",
  defaultTargetVersion = "1",
  onConfirmRollback,
  isSubmitting,
}: RollbackModelModalProps) {
  const [targetVersion, setTargetVersion] = useState<string>(defaultTargetVersion);
  const [rollbackReason, setRollbackReason] = useState<string>(
    "Restoring prior baseline due to operational requirements"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirmRollback(targetVersion, rollbackReason);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Production Model Rollback"
      description="Restore a designated previous model baseline in the event of production performance anomalies."
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
        {/* Warning Banner */}
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-xs">Caution: Live Production Action</span>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Rollback immediately switches the active inference pointer to the designated historical version and archives the current champion.
            </p>
          </div>
        </div>

        {/* Current vs Target */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Production
            </span>
            <span className="font-mono font-bold text-slate-900 text-xs mt-1 block">
              v{currentVersion}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
              Rollback Target
            </span>
            <span className="font-mono font-bold text-blue-900 text-xs mt-1 block">
              v{targetVersion || "1"}
            </span>
          </div>
        </div>

        {/* Target Version Input */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Target Model Version to Restore
          </label>
          <input
            type="text"
            required
            value={targetVersion}
            onChange={(e) => setTargetVersion(e.target.value)}
            placeholder="e.g., 1"
            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 font-mono text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />
          <span className="text-[11px] text-slate-400 mt-1 block">
            Original benchmark baseline: <strong>v1</strong> (Ridge Regression).
          </span>
        </div>

        {/* Operational Rationale */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Operational Rollback Rationale
          </label>
          <textarea
            required
            rows={3}
            value={rollbackReason}
            onChange={(e) => setRollbackReason(e.target.value)}
            placeholder="Document reason for reverting production baseline..."
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
            className="text-xs h-9 bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-2xs"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            {isSubmitting ? "Restoring Target Version…" : "Execute Rollback"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
