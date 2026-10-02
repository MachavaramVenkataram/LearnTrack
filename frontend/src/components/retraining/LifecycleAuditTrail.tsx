"use client";

import React from "react";
import { Clock, Info, CheckCircle2, AlertTriangle, ArrowRight, UserCheck } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { AuditEventItem } from "@/lib/api/mlOps";

export interface LifecycleAuditTrailProps {
  auditLog: AuditEventItem[];
  onSelectEvent: (event: AuditEventItem) => void;
}

export function LifecycleAuditTrail({
  auditLog = [],
  onSelectEvent,
}: LifecycleAuditTrailProps) {
  const getActionBadge = (action: string) => {
    const act = (action || "").toLowerCase();
    if (act === "promoted") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          PROMOTED
        </span>
      );
    }
    if (act === "rolled_back") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          ROLLED BACK
        </span>
      );
    }
    if (act === "validated") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
          VALIDATED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
        {action.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Governance & Compliance
              </span>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                ML Lifecycle Audit Trail
              </h2>
            </div>
            <Tooltip content="Immutable event trail documenting model generation, cross-validation, explicit promotion, and rollbacks.">
              <span className="cursor-help text-slate-400 hover:text-slate-600">
                <Info className="w-3.5 h-3.5" />
              </span>
            </Tooltip>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-10">
            Cryptographically tracked lifecycle events: training, validation, explicit promotions, and rollbacks.
          </p>
        </div>
      </div>

      {/* Table & Timeline Hybrid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] text-slate-600 font-semibold border-b border-slate-200/80">
              <th className="py-3 px-4 sm:px-6 text-slate-700">Timestamp & Timeline</th>
              <th className="py-3 px-4 text-slate-700">Action</th>
              <th className="py-3 px-4 text-slate-700">Model & Version</th>
              <th className="py-3 px-4 text-slate-700">Authorizing Actor</th>
              <th className="py-3 px-4 sm:px-6 text-slate-700">Documented Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditLog.length > 0 ? (
              auditLog.map((ev, idx) => (
                <tr
                  key={`${ev.timestamp}-${idx}`}
                  onClick={() => onSelectEvent(ev)}
                  className="group hover:bg-[#F8FAFC] transition-colors duration-150 cursor-pointer relative"
                >
                  <td className="py-3.5 px-4 sm:px-6 font-mono text-slate-600">
                    <div className="flex items-center gap-3">
                      {/* Timeline dot & indicator line */}
                      <div className="flex flex-col items-center">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                            ev.action === "promoted"
                              ? "bg-emerald-500"
                              : ev.action === "rolled_back"
                              ? "bg-amber-500"
                              : "bg-blue-500"
                          }`}
                        />
                      </div>
                      <span>
                        {new Date(ev.timestamp).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">{getActionBadge(ev.action)}</td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">
                      {ev.model_name}
                      <span className="font-mono text-[11px] font-normal text-slate-500 ml-1.5">
                        (v{ev.model_version})
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-700 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ev.actor}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 sm:px-6 text-slate-600">
                    <div className="flex items-center justify-between gap-2 max-w-md">
                      <span className="truncate text-xs" title={ev.reason}>
                        {ev.reason}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-10 text-center text-xs text-slate-500">
                  No audit trail records logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
