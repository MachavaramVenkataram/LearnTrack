"use client";

import React, { useState, useMemo } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
  Clock,
} from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { LargestErrorItem } from "@/lib/api/mlOps";

export interface LargestErrorsReviewTableProps {
  errors: LargestErrorItem[];
}

export function LargestErrorsReviewTable({ errors = [] }: LargestErrorsReviewTableProps) {
  const [tierFilter, setTierFilter] = useState<string>("all");

  const filteredErrors = useMemo(() => {
    if (tierFilter === "all") return errors;
    return errors.filter((e) => e.error_tier === tierFilter);
  }, [errors, tierFilter]);

  const getTierBadge = (tier: string) => {
    if (tier === "Typical Error") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Typical Error
        </span>
      );
    }
    if (tier === "Elevated Error") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          Elevated Error
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle className="w-3 h-3 text-rose-600" />
        Large Error
      </span>
    );
  };

  const getRowAccent = (tier: string) => {
    if (tier === "Large Error") return "group-hover:bg-rose-500 bg-rose-300";
    if (tier === "Elevated Error") return "group-hover:bg-amber-500 bg-amber-300";
    return "group-hover:bg-emerald-500 bg-slate-200";
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[14px] shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase">
              Largest Prediction Errors (Review Queue)
            </h2>
            <Tooltip content="Privacy-safeguarded internal audit. Student identities and sensitive credentials are strictly excluded.">
              <span className="cursor-help text-slate-400 hover:text-slate-600">
                <Info className="w-3.5 h-3.5" />
              </span>
            </Tooltip>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-9">
            Review the highest absolute prediction errors. Investigate edge cases and anomalous target deviations.
          </p>
        </div>

        {/* Tier Filter Toolbar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#F1F5F9] p-[2px] rounded-[8px] border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setTierFilter("all")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-[6px] transition-all cursor-pointer ${
                tierFilter === "all"
                  ? "bg-white text-blue-700 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All ({errors.length})
            </button>
            <button
              type="button"
              onClick={() => setTierFilter("Large Error")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-[6px] transition-all cursor-pointer ${
                tierFilter === "Large Error"
                  ? "bg-white text-rose-700 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Large
            </button>
            <button
              type="button"
              onClick={() => setTierFilter("Elevated Error")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-[6px] transition-all cursor-pointer ${
                tierFilter === "Elevated Error"
                  ? "bg-white text-amber-700 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Elevated
            </button>
            <button
              type="button"
              onClick={() => setTierFilter("Typical Error")}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-[6px] transition-all cursor-pointer ${
                tierFilter === "Typical Error"
                  ? "bg-white text-emerald-700 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Typical
            </button>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] text-slate-600 font-semibold border-b border-slate-200/80">
              <th className="py-3 px-4 text-slate-700">Rank</th>
              <th className="py-3 px-4 text-slate-700">Actual Score</th>
              <th className="py-3 px-4 text-slate-700">Predicted Score</th>
              <th className="py-3 px-4 text-slate-700">Residual (e)</th>
              <th className="py-3 px-4 text-slate-700">Absolute Error</th>
              <th className="py-3 px-4 text-slate-700">Error Tier</th>
              <th className="py-3 px-4 text-slate-700">Model Version</th>
              <th className="py-3 px-4 text-slate-700">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredErrors.length > 0 ? (
              filteredErrors.map((err) => (
                <tr
                  key={err.rank}
                  className="group hover:bg-[#F8FAFC] transition-colors duration-150 relative"
                >
                  <td className="py-3 px-4 font-mono font-bold text-slate-600">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1 h-3.5 rounded-full transition-colors ${getRowAccent(
                          err.error_tier
                        )}`}
                      />
                      <span>#{err.rank}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {err.actual} pts
                  </td>

                  <td className="py-3 px-4 font-mono text-slate-700">
                    {err.predicted} pts
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold">
                    <span
                      className={
                        err.error > 0
                          ? "text-blue-700 font-medium"
                          : "text-indigo-700 font-medium"
                      }
                    >
                      {err.error > 0 ? `+${err.error}` : err.error} pts
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {err.absolute_error} pts
                  </td>

                  <td className="py-3 px-4">{getTierBadge(err.error_tier)}</td>

                  <td className="py-3 px-4 font-mono text-slate-600">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[11px]">
                      v{err.model_version}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>
                        {new Date(err.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs text-slate-500">
                  No prediction errors match the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
