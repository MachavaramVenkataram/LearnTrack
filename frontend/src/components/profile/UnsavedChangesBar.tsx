"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Check, RotateCcw, Loader2 } from "lucide-react";

interface UnsavedChangesBarProps {
  hasChanges: boolean;
  onDiscard: () => void;
  onSave: () => void;
  isSaving: boolean;
  isSavedSuccess: boolean;
}

export function UnsavedChangesBar({
  hasChanges,
  onDiscard,
  onSave,
  isSaving,
  isSavedSuccess,
}: UnsavedChangesBarProps) {
  return (
    <AnimatePresence>
      {(hasChanges || isSaving || isSavedSuccess) && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl bg-slate-900 text-white rounded-2xl p-3 sm:p-4 shadow-2xl border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
              {isSavedSuccess ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400" />
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-white tracking-wide">
                {isSavedSuccess
                  ? "Changes Persisted Successfully"
                  : isSaving
                  ? "Saving Academic Profile..."
                  : "Unsaved Profile Modifications"}
              </p>
              <p className="text-[11px] text-slate-400 leading-tight">
                {isSavedSuccess
                  ? "Your academic identity vector has been updated in database."
                  : "Careful — you have modifications that have not been written to Supabase."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onDiscard}
              disabled={isSaving}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard</span>
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={isSaving || isSavedSuccess}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
                isSavedSuccess
                  ? "bg-emerald-600 text-white"
                  : "bg-blue-600 hover:bg-blue-500 text-white active:scale-95"
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : isSavedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Profile Saved!</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
