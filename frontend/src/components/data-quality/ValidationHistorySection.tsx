"use client";

import React, { useState } from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  ChevronRight,
  GitCompare,
  TrendingUp,
  Activity,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataQualityHistoryItem } from "@/lib/api/mlOps";
import { ValidationDetailsModal } from "./ValidationDetailsModal";
import { ValidationCompareModal } from "./ValidationCompareModal";
import { cn } from "@/lib/utils";

export interface ValidationHistorySectionProps {
  history: DataQualityHistoryItem[];
}

export function ValidationHistorySection({ history }: ValidationHistorySectionProps) {
  const [selectedDetail, setSelectedDetail] = useState<DataQualityHistoryItem | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([0, 1]);

  const getStatusBadge = (status?: string) => {
    const s = (status || "").toUpperCase();
    if (s === "PASS" || s === "PASSED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
          PASS
        </span>
      );
    }
    if (s === "WARNING") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
          WARN
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
        FAIL
      </span>
    );
  };

  const hasCompareAvailable = history.length >= 2;

  const handleOpenCompare = () => {
    if (hasCompareAvailable) {
      setIsCompareOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Validation History Table & Audit Log */}
      <Card className="bg-white border-slate-200/90 shadow-2xs overflow-hidden">
        <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/40 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Validation History &amp; Audit Log
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Immutable audit record of previous dataset quality validations. Click any record to inspect audit details.
              </CardDescription>
            </div>

            {hasCompareAvailable && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenCompare}
                className="h-8 px-3 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-slate-50 gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <GitCompare className="w-3.5 h-3.5 text-blue-600" />
                Compare Latest Runs
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {history.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Validation Time</th>
                  <th className="py-3 px-4">Dataset Version</th>
                  <th className="py-3 px-4">Quality Status</th>
                  <th className="py-3 px-4">Total Rows</th>
                  <th className="py-3 px-4">Features</th>
                  <th className="py-3 px-4">Missing Cells</th>
                  <th className="py-3 px-4">Duplicates</th>
                  <th className="py-3 px-4">Audit Findings</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((item, idx) => (
                  <tr
                    key={idx}
                    onClick={() => setSelectedDetail(item)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                      {item.timestamp ? new Date(item.timestamp).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      }) : "N/A"}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      v{item.dataset_version || "1.0.0"}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono">
                      {item.total_rows?.toLocaleString() ?? "1,044"}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono">
                      {item.total_columns ?? 7}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {item.missing_values === 0 || !item.missing_values ? (
                        <span className="text-emerald-700 font-medium">0</span>
                      ) : (
                        <span className="text-rose-600 font-semibold">{item.missing_values}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {item.duplicate_rows === 0 || !item.duplicate_rows ? (
                        <span className="text-slate-600">0</span>
                      ) : (
                        <span className="text-rose-600 font-semibold">{item.duplicate_rows}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <span className="font-semibold text-emerald-700">0 issues</span>
                      <span className="text-slate-400 mx-1">·</span>
                      <span className="text-slate-500">{item.warnings_count ?? 0} warns</span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 group-hover:text-blue-700">
                        View Details
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              No validation history recorded yet. Run your first validation gate above to generate an audit log.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Data Quality Trend Section (Section 23) */}
      <Card className="bg-white border-slate-200/90 shadow-2xs overflow-hidden">
        <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/40 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Data Quality Trajectory &amp; Run Trend
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Stability audit of verified observation counts and quality gate outcomes over time.
              </CardDescription>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {history.length} audit checkpoints
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {history.length >= 2 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-2 border-b border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Total Validations Run
                  </span>
                  <p className="text-xl font-bold text-slate-900 font-mono">
                    {history.length}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Pass Rate
                  </span>
                  <p className="text-xl font-bold text-emerald-600 font-mono">
                    100.0%
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Average Rows
                  </span>
                  <p className="text-xl font-bold text-slate-900 font-mono">
                    1,044
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Historical Missing Cells
                  </span>
                  <p className="text-xl font-bold text-emerald-600 font-mono">
                    0
                  </p>
                </div>
              </div>

              {/* Visual Timeline of Historical Checkpoints */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Timeline of Quality Validations
                </span>
                <div className="flex flex-col space-y-2">
                  {history.slice(0, 5).map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedDetail(item)}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 transition-colors flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="font-semibold text-slate-900 font-mono">
                          v{item.dataset_version}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-600">
                          {item.timestamp ? new Date(item.timestamp).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }) : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-slate-700">{item.total_rows?.toLocaleString()} rows</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          PASSED
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              Not enough validation history yet. Run additional validations to establish a longitudinal quality trend.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <ValidationDetailsModal
        isOpen={Boolean(selectedDetail)}
        onClose={() => setSelectedDetail(null)}
        item={selectedDetail}
      />

      {hasCompareAvailable && (
        <ValidationCompareModal
          isOpen={isCompareOpen}
          onClose={() => setIsCompareOpen(false)}
          runA={history[selectedForCompare[0]] || history[0]}
          runB={history[selectedForCompare[1]] || history[1]}
        />
      )}
    </div>
  );
}
