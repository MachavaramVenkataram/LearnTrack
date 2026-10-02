"use client";

import React from "react";
import {
  FileCheck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  Layers,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { DataQualityHistoryItem } from "@/lib/api/mlOps";
import { cn } from "@/lib/utils";

export interface ValidationCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  runA: DataQualityHistoryItem | null;
  runB: DataQualityHistoryItem | null;
}

export function ValidationCompareModal({
  isOpen,
  onClose,
  runA,
  runB,
}: ValidationCompareModalProps) {
  if (!runA || !runB) return null;

  const formatDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

  const rowsDelta = (runB.total_rows ?? 0) - (runA.total_rows ?? 0);
  const missingDelta = (runB.missing_values ?? 0) - (runA.missing_values ?? 0);
  const duplicatesDelta = (runB.duplicate_rows ?? 0) - (runA.duplicate_rows ?? 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Compare Validation Audits"
      description="Side-by-side comparison between historical validation checkpoints."
      maxWidth="lg"
    >
      <div className="space-y-5 p-1 text-xs">
        {/* Header Comparison Banners */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Baseline Run (Run A)
            </span>
            <div className="text-sm font-bold text-slate-900 mt-1">
              v{runA.dataset_version}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">{formatDate(runA.timestamp)}</div>
            <div className="mt-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {runA.status || "PASSED"}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200">
            <span className="text-[10px] uppercase font-bold text-blue-600 block tracking-wider">
              Comparison Run (Run B)
            </span>
            <div className="text-sm font-bold text-slate-900 mt-1">
              v{runB.dataset_version}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">{formatDate(runB.timestamp)}</div>
            <div className="mt-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {runB.status || "PASSED"}
              </span>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Table */}
        <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3.5">Metric</th>
                <th className="py-2.5 px-3.5">Run A</th>
                <th className="py-2.5 px-3.5">Run B</th>
                <th className="py-2.5 px-3.5 text-right">Variance / Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2.5 px-3.5 font-medium text-slate-800">Total Observations</td>
                <td className="py-2.5 px-3.5 font-mono text-slate-700">{runA.total_rows?.toLocaleString()}</td>
                <td className="py-2.5 px-3.5 font-mono text-slate-700">{runB.total_rows?.toLocaleString()}</td>
                <td className="py-2.5 px-3.5 text-right font-mono font-semibold">
                  {rowsDelta === 0 ? (
                    <span className="text-slate-400">0 rows (Equal)</span>
                  ) : rowsDelta > 0 ? (
                    <span className="text-emerald-700">+{rowsDelta} rows</span>
                  ) : (
                    <span className="text-rose-600">{rowsDelta} rows</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3.5 font-medium text-slate-800">Feature Columns</td>
                <td className="py-2.5 px-3.5 font-mono text-slate-700">{runA.total_columns ?? 7}</td>
                <td className="py-2.5 px-3.5 font-mono text-slate-700">{runB.total_columns ?? 7}</td>
                <td className="py-2.5 px-3.5 text-right font-mono text-slate-400">0 (Identical)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3.5 font-medium text-slate-800">Missing Values</td>
                <td className="py-2.5 px-3.5 font-mono text-slate-700">{runA.missing_values ?? 0}</td>
                <td className="py-2.5 px-3.5 font-mono text-slate-700">{runB.missing_values ?? 0}</td>
                <td className="py-2.5 px-3.5 text-right font-mono font-semibold">
                  {missingDelta === 0 ? (
                    <span className="text-slate-400">0 (No change)</span>
                  ) : missingDelta > 0 ? (
                    <span className="text-rose-600">+{missingDelta}</span>
                  ) : (
                    <span className="text-emerald-700">{missingDelta}</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3.5 font-medium text-slate-800">Duplicate Records</td>
                <td className="py-2.5 px-3.5 font-mono text-slate-700">{runA.duplicate_rows ?? 0}</td>
                <td className="py-2.5 px-3.5 font-mono text-slate-700">{runB.duplicate_rows ?? 0}</td>
                <td className="py-2.5 px-3.5 text-right font-mono font-semibold">
                  {duplicatesDelta === 0 ? (
                    <span className="text-slate-400">0 (No change)</span>
                  ) : (
                    <span className="text-rose-600">+{duplicatesDelta}</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3.5 font-medium text-slate-800">Issues Flagged</td>
                <td className="py-2.5 px-3.5 font-mono text-slate-700">{runA.issues_count ?? 0}</td>
                <td className="py-2.5 px-3.5 font-mono text-slate-700">{runB.issues_count ?? 0}</td>
                <td className="py-2.5 px-3.5 text-right font-mono text-emerald-700 font-semibold">
                  Zero delta
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 px-4 text-xs font-semibold"
          >
            Close Comparison
          </Button>
        </div>
      </div>
    </Modal>
  );
}
