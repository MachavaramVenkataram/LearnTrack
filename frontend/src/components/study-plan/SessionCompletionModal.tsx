"use client";

import React, { useState } from "react";
import { Check, BookOpen } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { StudyPlanSession } from "@/types/academic";

interface SessionCompletionModalProps {
  session: StudyPlanSession | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (session: StudyPlanSession, autoLog: boolean) => Promise<void>;
}

export function SessionCompletionModal({
  session,
  isOpen,
  onClose,
  onConfirm,
}: SessionCompletionModalProps) {
  const [autoLog, setAutoLog] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!session) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(session, autoLog);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting) onClose();
      }}
      title="Complete Study Session"
      description="Mark this session completed and record your progress."
      maxWidth="md"
    >
      <div className="space-y-4 text-xs text-slate-700 py-1">
        {/* Session details card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Session Details
            </span>
            <span className="font-mono text-xs font-bold text-slate-600">
              {session.duration_minutes}m
            </span>
          </div>

          <h4 className="text-sm font-bold text-[#0F172A]">
            {session.topic}
          </h4>

          <div className="flex items-center gap-2 text-slate-600 text-xs pt-0.5">
            <span className="inline-flex items-center gap-1 font-medium text-[#2563EB]">
              <BookOpen className="w-3.5 h-3.5" />
              {session.subject_name || "General Coursework"}
            </span>
            <span>•</span>
            <span className="font-mono text-slate-500">
              {session.start_time}
            </span>
          </div>
        </div>

        {/* Auto log checkbox */}
        <label className="flex items-start gap-2.5 p-3.5 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50/80 transition-colors cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoLog}
            onChange={(e) => setAutoLog(e.target.checked)}
            className="mt-0.5 rounded border-blue-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <div className="text-xs">
            <span className="font-bold text-blue-900 block">
              Add {session.duration_minutes} mins to your Study Activity record
            </span>
            <span className="text-blue-700/80 text-[11px] leading-relaxed block mt-0.5">
              Automatically updates your weekly study cadence and dashboard statistics.
            </span>
          </div>
        </label>

        {/* Modal actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            leftIcon={<Check className="w-3.5 h-3.5" />}
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
          >
            Confirm Completion
          </Button>
        </div>
      </div>
    </Modal>
  );
}
