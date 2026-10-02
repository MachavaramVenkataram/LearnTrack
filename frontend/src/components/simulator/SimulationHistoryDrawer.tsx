"use client";

import React from "react";
import {
  History,
  Trash2,
  RotateCcw,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SimulationRecord, PredictionFeatureInput } from "@/types/academic";
import { cn } from "@/lib/utils";

export interface SimulationHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedSimulations: SimulationRecord[];
  onDelete: (id: string) => void;
  onRestore: (features: PredictionFeatureInput) => void;
}

export function SimulationHistoryDrawer({
  isOpen,
  onClose,
  savedSimulations,
  onDelete,
  onRestore,
}: SimulationHistoryDrawerProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Saved Simulation History"
      description="Review previously archived hypothetical trajectory scenarios and restore them to the simulator."
      maxWidth="lg"
    >
      <div className="space-y-4 pt-2">
        {savedSimulations.length > 0 ? (
          <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto pr-1 space-y-1">
            {savedSimulations.map((rec) => {
              const diff = rec.difference ?? 0;
              const isPositive = diff > 0;
              return (
                <div key={rec.id} className="py-3.5 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm font-sans">
                        {rec.current_prediction.toFixed(1)}% → {rec.simulated_prediction.toFixed(1)}%
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full font-mono",
                          isPositive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : diff < 0
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        )}
                      >
                        {diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)} pts
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-[11px] text-slate-400">
                        {new Date(rec.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {/* Restore action */}
                      {rec.simulated_features && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onRestore(rec.simulated_features);
                            onClose();
                          }}
                          leftIcon={<RotateCcw className="w-3 h-3 text-blue-600" />}
                          className="h-7 px-2 text-[11px] text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          Restore
                        </Button>
                      )}

                      {/* Delete action */}
                      <button
                        type="button"
                        onClick={() => onDelete(rec.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete simulation record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Summary of simulated parameters */}
                  {rec.simulated_features && (
                    <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-600 font-mono">
                      <span className="bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md">
                        Attendance: {rec.simulated_features.attendance_percentage}%
                      </span>
                      <span className="bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md">
                        Study: {rec.simulated_features.study_hours}h/wk
                      </span>
                      <span className="bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md">
                        Internal: {rec.simulated_features.internal_marks} pts
                      </span>
                      <span className="bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md">
                        Assignments: {rec.simulated_features.assignments_completed} tasks
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 text-xs space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <History className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500">
              No saved simulations yet. Click &quot;Save Scenario&quot; on any projection to record it here.
            </p>
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs font-semibold">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
