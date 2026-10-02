"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  CheckCircle2,
  Download,
  ExternalLink,
  Printer,
  Sparkles,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export interface ReportGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  semesterText: string;
  totalRecords: number;
}

export function ReportGenerationModal({
  isOpen,
  onClose,
  studentName = "Student",
  semesterText,
  totalRecords,
}: ReportGenerationModalProps) {
  const [stage, setStage] = useState<"idle" | "preparing" | "building" | "finalizing" | "ready">("idle");

  useEffect(() => {
    if (!isOpen) {
      setStage("idle");
      return;
    }

    setStage("preparing");
    const t1 = setTimeout(() => setStage("building"), 500);
    const t2 = setTimeout(() => setStage("finalizing"), 1100);
    const t3 = setTimeout(() => setStage("ready"), 1700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Academic Report"
      description="Compiles verified coursework evaluations, attendance records, and longitudinal progress."
      maxWidth="md"
    >
      <div className="space-y-5 pt-1">
        {stage !== "ready" ? (
          <div className="py-8 px-4 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FileText className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                {stage === "preparing" && "Preparing student analytics..."}
                {stage === "building" && "Compiling subject performance & attendance..."}
                {stage === "finalizing" && "Finalizing comprehensive report..."}
              </h4>
              <p className="text-xs text-slate-500">
                Gathering active evaluation metrics across {totalRecords} records for {semesterText}.
              </p>
            </div>

            <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{
                  width:
                    stage === "preparing"
                      ? "35%"
                      : stage === "building"
                      ? "70%"
                      : "95%",
                }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-bold text-emerald-950">Academic Report Ready</h4>
                <p className="text-emerald-800 leading-relaxed">
                  Your academic analytics dossier has been compiled with verified performance data, CGPA calculation, and attendance statistics.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Profile:</span>
                <span className="font-semibold text-slate-800">{studentName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Scope:</span>
                <span className="font-semibold text-slate-800">{semesterText}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Records Included:</span>
                <span className="font-semibold text-slate-800">{totalRecords} evaluations</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Generated:</span>
                <span className="font-mono text-slate-700">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                className="w-full sm:w-auto justify-center"
              >
                Print / Save PDF
              </Button>

              <Link href="/reports" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  className="w-full justify-center"
                >
                  View Full Reports Workspace
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
