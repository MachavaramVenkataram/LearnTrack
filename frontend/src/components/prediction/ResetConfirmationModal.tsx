"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { RotateCcw, AlertCircle } from "lucide-react";

export interface ResetConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResetConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: ResetConfirmationModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset Academic Inputs?"
      description="This will restore the default academic parameters and baseline values."
      maxWidth="sm"
    >
      <div className="space-y-4 pt-1">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Any unsaved custom adjustments you made to attendance, assessment scores, or study hours will be restored to your latest baseline.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Inputs
          </Button>
        </div>
      </div>
    </Modal>
  );
}
