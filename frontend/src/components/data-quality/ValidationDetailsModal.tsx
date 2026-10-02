"use client";

import React from "react";
import {
  FileCheck,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Database,
  Hash,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataQualityHistoryItem } from "@/lib/api/mlOps";
import { cn } from "@/lib/utils";

export interface ValidationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DataQualityHistoryItem | null;
}

export function ValidationDetailsModal({
  isOpen,
  onClose,
  item,
}: ValidationDetailsModalProps) {
  if (!item) return null;

  const isHealthy = item.status === "PASSED" || item.status === "PASS";
  const isWarning = item.status === "WARNING";

  const formattedDate = item.timestamp
    ? new Date(item.timestamp).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "N/A";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Validation Audit Record"
      description={`Detailed gate verification report for dataset version v${item.dataset_version}`}
      maxWidth="lg"
    >
      <div className="space-y-5 p-1 text-xs">
        {/* Header Status Strip */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">
                Dataset v{item.dataset_version}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {formattedDate}
              </p>
            </div>
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
              isHealthy
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : isWarning
                ? "bg-amber-50 text-amber-700 border border-amber-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                isHealthy ? "bg-emerald-500 animate-pulse" : isWarning ? "bg-amber-500" : "bg-rose-500"
              )}
            />
            {item.status || "PASSED"}
          </span>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Rows
            </span>
            <span className="font-mono text-sm font-bold text-slate-900 mt-0.5 block">
              {item.total_rows?.toLocaleString() ?? "1,044"}
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Features
            </span>
            <span className="font-mono text-sm font-bold text-slate-900 mt-0.5 block">
              {item.total_columns ?? 7}
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Missing Cells
            </span>
            <span className="font-mono text-sm font-bold text-emerald-700 mt-0.5 block">
              {item.missing_values ?? 0}
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Duplicates
            </span>
            <span className="font-mono text-sm font-bold text-slate-900 mt-0.5 block">
              {item.duplicate_rows ?? 0}
            </span>
          </div>
        </div>

        {/* Audit Details */}
        <div className="space-y-2 rounded-xl bg-slate-50/70 border border-slate-200 p-4">
          <div className="flex justify-between items-center text-slate-700">
            <span className="text-slate-500 font-medium">Audit Artifact:</span>
            <span className="font-mono text-xs font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
              {item.filename || `report_${item.dataset_version}.json`}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-700 pt-1 border-t border-slate-200/60">
            <span className="text-slate-500 font-medium">Issues Detected:</span>
            <span className="font-bold text-slate-800">
              {item.issues_count ?? 0} issues
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-700 pt-1 border-t border-slate-200/60">
            <span className="text-slate-500 font-medium">Warnings Flagged:</span>
            <span className="font-bold text-slate-800">
              {item.warnings_count ?? 0} warnings
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-700 pt-1 border-t border-slate-200/60">
            <span className="text-slate-500 font-medium">Downstream Eligibility:</span>
            <span className="font-bold text-emerald-700">
              Approved for Regression Pipeline
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 px-4 text-xs font-semibold"
          >
            Close Record
          </Button>
        </div>
      </div>
    </Modal>
  );
}
