"use client";

import React, { useState, useEffect } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Database,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  getLatestDataQualityReport,
  runDataQualityValidation,
  getDataQualityHistory,
  DataQualityReport,
  DataQualityHistoryItem,
} from "@/lib/api/mlOps";
import { DataQualityHeader } from "@/components/data-quality/DataQualityHeader";
import { DatasetHealthHero } from "@/components/data-quality/DatasetHealthHero";
import { DataQualityKpiRow } from "@/components/data-quality/DataQualityKpiRow";
import { ValidationChecksAccordion } from "@/components/data-quality/ValidationChecksAccordion";
import { DatasetInspector } from "@/components/data-quality/DatasetInspector";
import { MLTrainingReadinessCard } from "@/components/data-quality/MLTrainingReadinessCard";
import { ValidationHistorySection } from "@/components/data-quality/ValidationHistorySection";
import { DataQualitySkeleton } from "@/components/data-quality/DataQualitySkeletons";

export default function DataQualityPage() {
  const { showToast } = useToast();

  const [report, setReport] = useState<DataQualityReport | null>(null);
  const [history, setHistory] = useState<DataQualityHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [rep, hist] = await Promise.all([
        getLatestDataQualityReport(),
        getDataQualityHistory(),
      ]);
      setReport(rep);
      setHistory(hist);
    } catch (err: any) {
      console.error("[DataQuality] Failed to load data quality data:", err);
      const msg = err.message || "Failed to reach ML data quality service on port 8001";
      setErrorMsg(msg);
      showToast("Error loading Data Quality report", msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunValidation = async () => {
    setIsValidating(true);
    try {
      const updated = await runDataQualityValidation(report?.dataset_version || "1.0.0");
      setReport(updated);
      const hist = await getDataQualityHistory();
      setHistory(hist);
      showToast(
        "Validation Completed",
        `Dataset status: ${updated.overall_status} (${updated.total_rows.toLocaleString()} rows verified)`,
        updated.overall_status === "PASSED" ? "success" : "info"
      );
    } catch (err: any) {
      showToast("Validation Failed", err.message || "Failed to validate dataset", "error");
    } finally {
      setIsValidating(false);
    }
  };

  if (isLoading) {
    return <DataQualitySkeleton />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-in fade-in duration-200">
      {/* 1. Page Header (Section 2) */}
      <DataQualityHeader
        status={report?.overall_status || null}
        isLoading={isLoading}
        isValidating={isValidating}
        onRefresh={loadData}
        onRunValidation={handleRunValidation}
      />

      {/* Backend Connectivity Error Banner (Section 37) */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50/90 border border-rose-200 text-xs text-rose-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-rose-900">
                Data Quality Service Unavailable
              </span>
              <p className="text-rose-700 mt-0.5 leading-relaxed">
                The Python ML data-quality engine could not complete the request. Ensure the backend FastAPI service is running on port 8001.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            className="h-8 px-3 text-xs border-rose-200 text-rose-800 hover:bg-rose-100 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Retry
          </Button>
        </div>
      )}

      {/* Critical Issues Banner */}
      {report?.issues && report.issues.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-rose-900">Critical Validation Issues Detected (Training Gate Blocked)</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-rose-700">
              {report.issues.map((iss, i) => (
                <li key={i}>{iss}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Warnings Banner */}
      {report?.warnings && report.warnings.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-amber-900">Data Quality Warnings ({report.warnings.length})</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-700">
              {report.warnings.map((warn, i) => (
                <li key={i}>{warn}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 2. Dataset Health Hero Summary Card (Section 3 & 7) */}
      <DatasetHealthHero report={report} />

      {/* 3. KPI Telemetry Row (Section 4 & 5) */}
      <DataQualityKpiRow report={report} />

      {/* 4. Automated Validation Checks Accordion (Section 8, 9, 10, 11, 12, 13, 14, 15, 16) */}
      <ValidationChecksAccordion report={report} />

      {/* 5. Dataset Feature Inspector (Section 17 & 18) */}
      <DatasetInspector report={report} />

      {/* 6. ML Training Readiness & Gate (Section 24 & 25) */}
      <MLTrainingReadinessCard report={report} />

      {/* 7. Validation History & Run Trend (Section 20, 21, 22, 23) */}
      <ValidationHistorySection history={history} />
    </div>
  );
}
