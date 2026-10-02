"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AuditEventItem } from "@/lib/api/mlOps";

export interface AuditEventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: AuditEventItem | null;
}

export function AuditEventDetailModal({
  isOpen,
  onClose,
  event,
}: AuditEventDetailModalProps) {
  if (!event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Audit Event Details"
      description="Cryptographically tracked model lifecycle transition record."
    >
      <div className="space-y-4 py-2 text-xs">
        {/* Core Event Summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Lifecycle Action</span>
            <span className="font-bold uppercase tracking-wider text-xs px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {event.action}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Model & Version</span>
            <span className="font-semibold text-slate-900">
              {event.model_name} (v{event.model_version})
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 font-medium">Authorizing Actor</span>
            <span className="font-mono text-slate-800 font-medium">{event.actor}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Timestamp</span>
            <span className="font-mono text-slate-600">
              {new Date(event.timestamp).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Documented Rationale */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-950 space-y-1">
          <span className="font-bold uppercase tracking-wider text-[10px] text-blue-800 block">
            Documented Rationale
          </span>
          <p className="text-xs text-slate-800 leading-relaxed">
            {event.reason || "Operational lifecycle transition recorded."}
          </p>
        </div>

        {/* Metadata JSON if available */}
        {event.metadata && Object.keys(event.metadata).length > 0 && (
          <div className="space-y-1.5">
            <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block">
              Event Metadata Payload
            </span>
            <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-48 leading-tight">
              {JSON.stringify(event.metadata, null, 2)}
            </pre>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs h-9">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
