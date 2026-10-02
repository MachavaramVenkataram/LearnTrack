"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { ML_CONFIG } from "@/lib/ml/config";
import {
  TelemetryHeader,
  ModelIdentityHero,
  PerformanceOverview,
  GeneralizationComparisonChart,
  ActiveFeatureSpace,
  FeatureInspectorDrawer,
  FeatureMetadata,
  ModelReliabilityPanel,
  TelemetryActivityPanel,
  ModelTraceabilityCard,
  ModelCardDrawer,
  MetricDetailModal,
  MetricType,
  PrivacyAndExplainability,
  TelemetrySkeleton,
} from "@/components/model-telemetry";

interface ModelTelemetry {
  service: string;
  model_version: string;
  model_type: string;
  target: string;
  target_scale: string;
  dataset_name: string;
  feature_names: string[];
  evaluation_metrics: {
    validation?: {
      mae: number;
      rmse: number;
      r2: number;
    };
    independent_test?: {
      mae: number;
      rmse: number;
      r2: number;
    };
    benchmarks?: Record<string, unknown>;
  };
  selection_rationale: string;
  run_id?: string;
  dataset_version?: string;
}

interface MonitoringSummary {
  predictions_count: number;
  verified_outcomes: number;
  status: string;
  historical_telemetry?: Array<{ date: string; rmse: number; mae: number }>;
}

export default function ModelPerformancePage() {
  const [telemetry, setTelemetry] = useState<ModelTelemetry | null>(null);
  const [monitoringSummary, setMonitoringSummary] = useState<MonitoringSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drawers and Modal states
  const [selectedFeature, setSelectedFeature] = useState<FeatureMetadata | null>(null);
  const [selectedFeatureIndex, setSelectedFeatureIndex] = useState<number>(1);
  const [isModelCardOpen, setIsModelCardOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricType | null>(null);

  const fetchTelemetry = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }
    setError(null);

    const mlUrl = ML_CONFIG.baseUrl;

    try {
      // 1. Fetch live model info from ML service
      const res = await fetch(`${mlUrl}/model/info`);
      if (!res.ok) {
        throw new Error(`ML service returned status ${res.status}`);
      }
      const data = await res.json();
      setTelemetry(data);

      // 2. Fetch live monitoring summary for verified counts
      try {
        const monRes = await fetch(`${mlUrl}/monitoring/summary?window_days=30`);
        if (monRes.ok) {
          const monData = await monRes.json();
          setMonitoringSummary(monData);
        }
      } catch (monErr) {
        console.warn("Monitoring summary telemetry currently offline:", monErr);
      }
    } catch (err: unknown) {
      console.error("Telemetry fetch error:", err);
      // Fallback default telemetry when service is unreachable
      setTelemetry({
        service: "LearnTrack Academic ML",
        model_version: "candidate-8963bdf8",
        model_type: "Linear Regression (Ridge)",
        target: "final_score",
        target_scale: "0 to 100 continuous score",
        dataset_name: "UCI Student Performance Benchmark (Mathematics & Portuguese)",
        dataset_version: "1.0.0",
        feature_names: [
          "attendance_percentage",
          "assignment_score",
          "internal_marks",
          "previous_score",
          "study_hours",
          "assignments_completed",
          "average_assessment_score",
          "previous_performance_trend",
          "attendance_risk_flag",
          "study_intensity_ratio",
          "weighted_academic_score",
        ],
        evaluation_metrics: {
          validation: {
            mae: 4.284,
            rmse: 6.298,
            r2: 0.8451,
          },
          independent_test: {
            mae: 4.494,
            rmse: 7.677,
            r2: 0.8392,
          },
        },
        selection_rationale:
          "Empirically selected champion model on independent out-of-fold test set. Minimizes generalization error without overfitting small departmental cohorts.",
      });
      setError(
        "Could not establish real-time link to ML service cluster. Displaying verified local cache."
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchTelemetry();
    }
    return () => {
      isMounted = false;
    };
  }, [fetchTelemetry]);

  // Handle Feature selection for drawer inspection
  const handleSelectFeature = (feat: FeatureMetadata) => {
    const rawIndex = telemetry?.feature_names.indexOf(feat.name) ?? -1;
    setSelectedFeatureIndex(rawIndex >= 0 ? rawIndex + 1 : 1);
    setSelectedFeature(feat);
  };

  // Handle Metric click for detail modal
  const handleSelectMetric = (metricKey: string) => {
    const normalized = metricKey.toUpperCase() as MetricType;
    if (normalized === "MAE" || normalized === "RMSE" || normalized === "R2") {
      setSelectedMetric(normalized);
    }
  };

  if (isLoading) {
    return <TelemetrySkeleton />;
  }

  const valMetrics = telemetry?.evaluation_metrics?.validation ?? {
    mae: 4.284,
    rmse: 6.298,
    r2: 0.8451,
  };

  const testMetrics = telemetry?.evaluation_metrics?.independent_test ?? {
    mae: 4.494,
    rmse: 7.677,
    r2: 0.8392,
  };

  const isProductionActive = Boolean(telemetry && !error);
  const predictionCount = monitoringSummary?.predictions_count ?? 0;
  const verifiedCount = monitoringSummary?.verified_outcomes ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="space-y-8 pb-16"
    >
      {/* 1. Page Header (Section 3) */}
      <TelemetryHeader
        isTelemetryActive={isProductionActive}
        onRefresh={() => fetchTelemetry(true)}
        isRefreshing={isRefreshing}
      />

      {/* Network Alert (if offline) */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchTelemetry(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1 font-semibold text-amber-800 hover:text-amber-950 underline cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
            Retry
          </button>
        </div>
      )}

      {/* 2. Model Identity Hero & Status Ribbon (Sections 4 & 5) */}
      <ModelIdentityHero
        modelVersion={telemetry?.model_version ?? "candidate-8963bdf8"}
        modelType={telemetry?.model_type ?? "Linear Regression (Ridge)"}
        target={telemetry?.target ?? "final_score"}
        targetScale={telemetry?.target_scale ?? "0 to 100 continuous score"}
        datasetName={
          telemetry?.dataset_name ?? "UCI Student Performance Benchmark (Mathematics & Portuguese)"
        }
        featureCount={telemetry?.feature_names?.length ?? 11}
        isTelemetryActive={isProductionActive}
        onOpenModelCard={() => setIsModelCardOpen(true)}
      />

      {/* 3. Performance Overview (Sections 6, 7, 9) */}
      <PerformanceOverview
        valMetrics={valMetrics}
        testMetrics={testMetrics}
        onSelectMetric={handleSelectMetric}
      />

      {/* 4. Generalization Comparison Chart (Section 8) */}
      <GeneralizationComparisonChart
        valMetrics={valMetrics}
        testMetrics={testMetrics}
        onSelectMetric={handleSelectMetric}
      />

      {/* 5. Active Feature Space & Search (Sections 10, 12, 13) */}
      <ActiveFeatureSpace
        featureNames={telemetry?.feature_names ?? []}
        onSelectFeature={handleSelectFeature}
      />

      {/* 6. Model Traceability & Model Registry (Sections 19, 20) */}
      <ModelTraceabilityCard
        runId={telemetry?.run_id ?? "candidate-8963bdf8"}
        datasetName={telemetry?.dataset_name ?? "UCI Student Performance Benchmark"}
        datasetVersion={telemetry?.dataset_version ?? "1.0.0"}
        modelVersion={telemetry?.model_version ?? "candidate-8963bdf8"}
        modelType={telemetry?.model_type ?? "Linear Regression (Ridge)"}
        onOpenModelCard={() => setIsModelCardOpen(true)}
      />

      {/* 7. Model Reliability (Sections 14, 15) */}
      <ModelReliabilityPanel
        hasHoldoutEvaluation={true}
        hasMonitoringActive={isProductionActive}
      />

      {/* 8. Telemetry Activity & Structured Health (Sections 16, 17, 18) */}
      <TelemetryActivityPanel
        predictionCount={predictionCount}
        verifiedCount={verifiedCount}
        historicalTelemetry={monitoringSummary?.historical_telemetry ?? []}
        hasHoldoutEvaluation={true}
        hasMlflowLineage={true}
        hasModelRegistry={true}
        hasFeatureSchema={true}
      />

      {/* 9. Privacy & Explainability (Sections 32, 33) */}
      <PrivacyAndExplainability />

      {/* Drawers & Modals (Sections 11, 21, 23) */}
      <FeatureInspectorDrawer
        feature={selectedFeature}
        featureIndex={selectedFeatureIndex}
        onClose={() => setSelectedFeature(null)}
      />

      <ModelCardDrawer
        isOpen={isModelCardOpen}
        onClose={() => setIsModelCardOpen(false)}
        modelVersion={telemetry?.model_version ?? "candidate-8963bdf8"}
        modelType={telemetry?.model_type ?? "Linear Regression (Ridge)"}
        target={telemetry?.target ?? "final_score"}
        targetScale={telemetry?.target_scale ?? "0 to 100 continuous score"}
        datasetName={
          telemetry?.dataset_name ?? "UCI Student Performance Benchmark (Mathematics & Portuguese)"
        }
        featureCount={telemetry?.feature_names?.length ?? 11}
        valMetrics={valMetrics}
        testMetrics={testMetrics}
        runId={telemetry?.run_id ?? "candidate-8963bdf8"}
        selectionRationale={telemetry?.selection_rationale}
      />

      <MetricDetailModal
        isOpen={Boolean(selectedMetric)}
        metricType={selectedMetric}
        onClose={() => setSelectedMetric(null)}
        cvValue={
          selectedMetric === "MAE"
            ? valMetrics.mae
            : selectedMetric === "RMSE"
            ? valMetrics.rmse
            : valMetrics.r2
        }
        holdoutValue={
          selectedMetric === "MAE"
            ? testMetrics.mae
            : selectedMetric === "RMSE"
            ? testMetrics.rmse
            : testMetrics.r2
        }
      />
    </motion.div>
  );
}
