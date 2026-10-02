"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompare, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface FloatingComparisonBarProps {
  selectedCount: number;
  onOpenComparison: () => void;
  onClearSelection: () => void;
}

export function FloatingComparisonBar({
  selectedCount,
  onOpenComparison,
  onClearSelection,
}: FloatingComparisonBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
        >
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-semibold">
                <strong className="text-white font-bold">{selectedCount}</strong>{" "}
                {selectedCount === 1 ? "run" : "runs"} selected for comparison
              </span>
            </div>

            <div className="h-4 w-px bg-slate-700" />

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={onOpenComparison}
                disabled={selectedCount < 2}
                leftIcon={<GitCompare className="w-3.5 h-3.5 text-white" />}
                className="h-8 px-3.5 rounded-[9px] text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-xs disabled:opacity-50"
                tooltip={selectedCount < 2 ? "Select at least 2 runs to compare" : "Open side-by-side run comparison"}
              >
                Compare {selectedCount > 1 ? `${selectedCount} Runs` : "Runs"}
              </Button>

              <button
                onClick={onClearSelection}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Clear selected runs"
                aria-label="Clear selected runs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
