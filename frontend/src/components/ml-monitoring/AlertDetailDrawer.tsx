"use client";

import React, { useEffect } from "react";
import {
  X,
  AlertTriangle,
  AlertOctagon,
  Info,
  Clock,
  Gauge,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { AlertItem } from "./MonitoringAlertCenter";
import { Button } from "@/components/ui/Button";

export interface AlertDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alert: AlertItem | null;
}

export function AlertDetailDrawer({
  isOpen,
  onClose,
  alert,
}: AlertDetailDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !alert) return null;

  const isCrit = alert.severity === "CRITICAL";
  const isWarn = alert.severity === "WARNING";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 bg-slate-50/60 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isCrit ? "bg-rose-100 text-rose-700" : isWarn ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {isCrit ? <AlertOctagon className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                </span>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    isCrit ? "text-rose-700" : isWarn ? "text-amber-700" : "text-blue-700"
                  }`}
                >
                  {alert.severity} Severity Alert
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 leading-snug">
                {alert.title}
              </h2>
            </div>

            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              tooltip="Close alert (Esc)"
              aria-label="Close alert details drawer"
              className="text-slate-400 hover:text-slate-700 rounded-[8px]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Metadata Fields */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Telemetry Diagnostics
              </h3>

              <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-slate-500">Monitored Metric</span>
                  <span className="font-semibold text-slate-900">{alert.metric}</span>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-slate-500">Current Measured Value</span>
                  <span className="font-mono font-bold text-slate-900">{alert.currentValue}</span>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-slate-500">Configured Threshold</span>
                  <span className="font-mono font-medium text-slate-700">{alert.threshold}</span>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <span className="text-slate-500">Detected At</span>
                  <span className="text-slate-700">{alert.detectedAt}</span>
                </div>
              </div>
            </div>

            {/* Recommended Action */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                Recommended Remediation
              </h3>
              <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-950 space-y-1">
                <p className="font-bold">Next Steps</p>
                <p className="text-[11px] text-blue-900 leading-relaxed">
                  {alert.recommendedAction}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-end">
            <Button
              variant="secondary"
              size="md"
              onClick={onClose}
              className="h-9 px-4 rounded-[10px] text-xs font-semibold"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
