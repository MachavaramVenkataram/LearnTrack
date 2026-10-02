"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Cpu,
  Clock,
  Layers,
  RefreshCw,
  Info,
  Send,
  Sliders,
  TrendingDown,
  Database,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Server,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";

// Telemetry & API definitions
import {
  getMonitoringSummary,
  getDriftReport,
  getProductionModel,
  getRecentPredictions,
  getExperiments,
  getLatestDataQualityReport,
  MonitoringSummary,
  DriftReport,
  ProductionModelInfo,
  PredictionLogItem,
  FeatureDriftItem,
  ExperimentSummary,
  DataQualityReport,
} from "@/lib/api/mlOps";

// Modular Observability Components
import { ModelHealthHero } from "@/components/ml-monitoring/ModelHealthHero";
import { MonitoringKpiGrid, KpiKey } from "@/components/ml-monitoring/MonitoringKpiGrid";
import { FeatureDriftPanel } from "@/components/ml-monitoring/FeatureDriftPanel";
import { PredictionDistributionPanel } from "@/components/ml-monitoring/PredictionDistributionPanel";
import { ModelPerformanceSection } from "@/components/ml-monitoring/ModelPerformanceSection";
import { VerifyPredictionCard } from "@/components/ml-monitoring/VerifyPredictionCard";
import { SystemHealthPanel } from "@/components/ml-monitoring/SystemHealthPanel";
import { MonitoringActivityTimeline } from "@/components/ml-monitoring/MonitoringActivityTimeline";
import { MonitoringAlertCenter, AlertItem } from "@/components/ml-monitoring/MonitoringAlertCenter";
import { ModelCardDrawer } from "@/components/ml-monitoring/ModelCardDrawer";
import { FeatureDriftDrawer } from "@/components/ml-monitoring/FeatureDriftDrawer";
import { KpiDetailDrawer } from "@/components/ml-monitoring/KpiDetailDrawer";
import { AlertDetailDrawer } from "@/components/ml-monitoring/AlertDetailDrawer";
import { PlatformConnectionsRow } from "@/components/ml-monitoring/PlatformConnectionsRow";

export default function MLMonitoringPage() {
  const { showToast } = useToast();

  // Time window state (7D, 30D, 90D)
  const [windowDays, setWindowDays] = useState<number>(30);

  // Core monitoring telemetry states
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);
  const [driftReport, setDriftReport] = useState<DriftReport | null>(null);
  const [prodModel, setProdModel] = useState<ProductionModelInfo | null>(null);
  const [recentPredictions, setRecentPredictions] = useState<PredictionLogItem[]>([]);
  const [championExperiment, setChampionExperiment] = useState<ExperimentSummary | null>(null);
  const [dataQuality, setDataQuality] = useState<DataQualityReport | null>(null);

  // Loading & error handling
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

  // Slide-over drawer states
  const [isModelCardOpen, setIsModelCardOpen] = useState<boolean>(false);
  const [selectedFeature, setSelectedFeature] = useState<FeatureDriftItem | null>(null);
  const [selectedKpi, setSelectedKpi] = useState<KpiKey | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);

  // Ref for smooth scrolling to feedback verification card
  const feedbackCardRef = useRef<HTMLDivElement>(null);

  const handleScrollToFeedback = () => {
    if (feedbackCardRef.current) {
      feedbackCardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  /**
   * Fetch all real monitoring telemetry from FastAPI & Supabase backends.
   */
  const fetchData = useCallback(
    async (days = windowDays, isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setServiceError(null);

      try {
        const [sum, drift, prod, preds, exps, dq] = await Promise.all([
          getMonitoringSummary(days),
          getDriftReport(days),
          getProductionModel(),
          getRecentPredictions(50),
          getExperiments(),
          getLatestDataQualityReport(),
        ]);

        setSummary(sum);
        setDriftReport(drift);
        setProdModel(prod);
        setRecentPredictions(preds);

        // Find champion experiment for model card & evaluations
        const champ = exps.find((e) => e.is_champion) || exps[0] || null;
        setChampionExperiment(champ);
        setDataQuality(dq);
      } catch (err: any) {
        console.error("[MLOps Monitoring] Failed to load telemetry:", err);
        setServiceError(
          err.message || "Failed to connect to the ML monitoring service. Ensure FastAPI server is active."
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [windowDays]
  );

  useEffect(() => {
    fetchData(windowDays);
  }, [fetchData, windowDays]);

  // Determine actual monitoring activity state
  const hasMonitoringData = summary !== null && summary.prediction_count > 0;
  const observationsCount = driftReport?.observations_count ?? 0;

  return (
    <div className="space-y-8 pb-16 min-h-screen">
      {/* ========================================================================= */}
      {/* 1. PAGE HEADER & TIME RANGE FILTER                                        */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              ML Monitoring
            </h1>

            {/* Compact Real Status Badge */}
            {hasMonitoringData ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Monitoring Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                No Monitoring Data
              </span>
            )}
          </div>

          <p className="text-sm text-slate-500 max-w-2xl">
            Monitor prediction performance, data quality, drift, and model behavior in production.
          </p>
        </div>

        {/* Top-Right: Unified Range Segmented Control + Refresh Action */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          {/* Segmented Control Container (Section 12, 13, 14) */}
          <div
            className="flex items-center bg-[#F1F5F9] p-[3px] rounded-[11px] border border-[#E2E8F0] shadow-2xs"
            role="group"
            aria-label="Time window selector"
          >
            {[
              { days: 7, label: "7D", tip: "Last 7 days of monitoring telemetry" },
              { days: 30, label: "30D", tip: "Last 30 days (standard evaluation window)" },
              { days: 90, label: "90D", tip: "Last 90 days quarterly trend" },
            ].map(({ days, label, tip }) => (
              <button
                key={days}
                onClick={() => setWindowDays(days)}
                disabled={isLoading || isRefreshing}
                title={tip}
                className={`h-[32px] px-3.5 rounded-[8px] text-xs font-medium transition-all duration-180 ease-out select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 ${
                  windowDays === days
                    ? "bg-white text-[#2563EB] shadow-xs font-semibold scale-[1.01]"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-slate-200/50"
                }`}
                aria-pressed={windowDays === days}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Refresh Action Button (Section 10, 11) */}
          <Button
            variant="secondary"
            size="md"
            onClick={() => fetchData(windowDays, true)}
            disabled={isLoading || isRefreshing}
            tooltip="Refresh monitoring telemetry"
            leftIcon={
              <RefreshCw
                className={`w-3.5 h-3.5 transition-transform duration-500 ease-out ${
                  isRefreshing ? "animate-spin text-blue-600" : "group-hover:rotate-45"
                }`}
              />
            }
            className="h-10 px-3.5 rounded-[10px] text-xs font-semibold text-slate-700 hover:text-slate-900 border-[#E2E8F0] hover:border-[#CBD5E1]"
            aria-label="Refresh monitoring telemetry"
          >
            <span>{isRefreshing ? "Refreshing…" : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SERVICE FAILURE ERROR CALLOUT                                          */}
      {/* ========================================================================= */}
      {serviceError && (
        <div
          role="alert"
          className="p-4 rounded-2xl border border-rose-200 bg-rose-50/80 text-rose-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
              <XCircle className="w-4 h-4" />
            </span>
            <div>
              <p className="font-bold text-sm">Monitoring service unavailable</p>
              <p className="text-rose-700 mt-0.5">{serviceError}</p>
            </div>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => fetchData(windowDays, true)}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            tooltip="Retry connecting to ML monitoring service"
            className="self-start sm:self-auto text-xs shrink-0"
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SKELETON LOADING STATE                                                 */}
      {/* ========================================================================= */}
      {isLoading ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Hero skeleton */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          </div>

          {/* KPI grid skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>

          {/* Panels skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-80 w-full lg:col-span-2 rounded-2xl" />
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* ========================================================================= */}
          {/* 4. MODEL HEALTH HERO (Section 3 & 4)                                      */}
          {/* ========================================================================= */}
          <section aria-labelledby="model-health-heading">
            <h2 id="model-health-heading" className="sr-only">
              Production Model Health
            </h2>
            <ModelHealthHero
              prodModel={prodModel}
              summary={summary}
              driftReport={driftReport}
              onOpenModelCard={() => setIsModelCardOpen(true)}
            />
          </section>

          {/* ========================================================================= */}
          {/* 5. MONITORING KPI GRID (Sections 6 & 7)                                   */}
          {/* ========================================================================= */}
          <section aria-labelledby="kpi-grid-heading">
            <h2 id="kpi-grid-heading" className="sr-only">
              Monitoring KPIs
            </h2>
            <MonitoringKpiGrid
              summary={summary}
              driftReport={driftReport}
              windowDays={windowDays}
              onSelectKpi={(key) => setSelectedKpi(key)}
            />
          </section>

          {/* ========================================================================= */}
          {/* 6. DATA OBSERVABILITY: FEATURE DRIFT & PREDICTION DISTRIBUTION            */}
          {/*    (Sections 8, 9, 11, 12)                                                */}
          {/* ========================================================================= */}
          <section
            aria-labelledby="data-observability-heading"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <h2 id="data-observability-heading" className="sr-only">
              Data & Prediction Observability
            </h2>

            {/* Feature Drift Panel (2/3 width) */}
            <div className="lg:col-span-2">
              <FeatureDriftPanel
                driftReport={driftReport}
                onSelectFeature={(feature) => setSelectedFeature(feature)}
              />
            </div>

            {/* Prediction Distribution Panel (1/3 width) */}
            <div>
              <PredictionDistributionPanel driftReport={driftReport} />
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 7. MODEL PERFORMANCE & GROUND-TRUTH VERIFICATION (Sections 13, 14, 15, 16)*/}
          {/* ========================================================================= */}
          <section
            aria-labelledby="performance-heading"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <h2 id="performance-heading" className="sr-only">
              Model Performance and Ground Truth
            </h2>

            {/* Model Performance Tracking (2/3 width) */}
            <div className="lg:col-span-2">
              <ModelPerformanceSection
                summary={summary}
                recentPredictions={recentPredictions}
                onOpenFeedback={handleScrollToFeedback}
              />
            </div>

            {/* Verify a Prediction Card (1/3 width) */}
            <div ref={feedbackCardRef}>
              <VerifyPredictionCard
                recentPredictions={recentPredictions}
                onFeedbackRecorded={() => fetchData(windowDays, true)}
              />
            </div>
          </section>

          {/* ========================================================================= */}
          {/* 8. SYSTEM HEALTH & INFERENCE LATENCY (Sections 17, 18, 19)                */}
          {/* ========================================================================= */}
          <section aria-labelledby="system-health-heading">
            <h2 id="system-health-heading" className="sr-only">
              System Health & Latency Metrics
            </h2>
            <SystemHealthPanel
              summary={summary}
              driftReport={driftReport}
              prodModel={prodModel}
            />
          </section>

          {/* ========================================================================= */}
          {/* 9. OBSERVABILITY TIMELINE & ALERT CENTER (Sections 20, 21, 22)            */}
          {/* ========================================================================= */}
          <section
            aria-labelledby="activity-and-alerts-heading"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <h2 id="activity-and-alerts-heading" className="sr-only">
              Monitoring Activity and Alerts
            </h2>

            {/* Chronological Activity Timeline */}
            <MonitoringActivityTimeline recentPredictions={recentPredictions} />

            {/* Alert Center */}
            <MonitoringAlertCenter
              summary={summary}
              driftReport={driftReport}
              onSelectAlert={(alert) => setSelectedAlert(alert)}
            />
          </section>

          {/* ========================================================================= */}
          {/* 10. PLATFORM CONNECTIONS (Sections 26, 28, 29)                            */}
          {/* ========================================================================= */}
          <section aria-labelledby="platform-connections-heading" className="pt-2">
            <div className="mb-3">
              <h3
                id="platform-connections-heading"
                className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2"
              >
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Integrated MLOps Platform Workspaces
              </h3>
              <p className="text-xs text-slate-500">
                Connected data quality pipelines, experiment registries, and retraining workflows.
              </p>
            </div>

            <PlatformConnectionsRow
              dataQuality={dataQuality}
              championExperiment={championExperiment}
            />
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. SLIDE-OVER INSPECTION DRAWERS (Sections 5, 7, 10, 22, 25)              */}
      {/* ========================================================================= */}

      {/* Model Card Drawer */}
      <ModelCardDrawer
        isOpen={isModelCardOpen}
        onClose={() => setIsModelCardOpen(false)}
        prodModel={prodModel}
        championExperiment={championExperiment}
      />

      {/* Feature Drift Detail Drawer */}
      <FeatureDriftDrawer
        isOpen={selectedFeature !== null}
        onClose={() => setSelectedFeature(null)}
        feature={selectedFeature}
        observationsCount={observationsCount}
      />

      {/* KPI Definition & Formula Drawer */}
      <KpiDetailDrawer
        isOpen={selectedKpi !== null}
        onClose={() => setSelectedKpi(null)}
        kpiKey={selectedKpi}
        summary={summary}
        driftReport={driftReport}
        windowDays={windowDays}
      />

      {/* Alert Investigation Drawer */}
      <AlertDetailDrawer
        isOpen={selectedAlert !== null}
        onClose={() => setSelectedAlert(null)}
        alert={selectedAlert}
      />
    </div>
  );
}
