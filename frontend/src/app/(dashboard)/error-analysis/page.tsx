"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, type Variants } from "framer-motion";
import { Info, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import {
  getErrorAnalysisSummary,
  getLargestErrors,
  ErrorAnalysisReport,
  LargestErrorItem,
} from "@/lib/api/mlOps";
import {
  ErrorAnalysisHeader,
  ErrorKpiGrid,
  ModelContextStrip,
  ResidualDistributionCard,
  ErrorByScoreRangeCard,
  ResidualScatterCard,
  ModelReliabilityCard,
  FeatureSegmentsTable,
  LargestErrorsReviewTable,
  ErrorAnalysisSkeleton,
} from "@/components/error-analysis";

export default function ErrorAnalysisPage() {
  const { showToast } = useToast();

  const [evaluationType, setEvaluationType] = useState<"BENCHMARK" | "PRODUCTION">("BENCHMARK");
  const [report, setReport] = useState<ErrorAnalysisReport | null>(null);
  const [largestErrors, setLargestErrors] = useState<LargestErrorItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadData = useCallback(
    async (type: "BENCHMARK" | "PRODUCTION" = evaluationType, isManualRefresh: boolean = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setFetchError(null);

      try {
        const [rep, topErrors] = await Promise.all([
          getErrorAnalysisSummary(type),
          getLargestErrors(type, 15),
        ]);
        setReport(rep);
        setLargestErrors(topErrors);
      } catch (err: any) {
        console.error("Failed to load error analysis:", err);
        const msg = err.message || "Failed to contact ML service";
        setFetchError(msg);
        showToast("Error loading Model Error Analysis", msg, "error");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [evaluationType, showToast]
  );

  useEffect(() => {
    loadData(evaluationType, false);
  }, [evaluationType, loadData]);

  const handleToggleEvaluation = (type: "BENCHMARK" | "PRODUCTION") => {
    if (type !== evaluationType) {
      setEvaluationType(type);
    }
  };

  const handleRefresh = () => {
    loadData(evaluationType, true);
  };

  if (isLoading && !report) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <ErrorAnalysisSkeleton />
      </div>
    );
  }

  const isProduction = evaluationType === "PRODUCTION";
  const hasInsufficientData = report?.status === "INSUFFICIENT_DATA";

  // Motion variants for smooth staggered reveal
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-7xl mx-auto space-y-6 pb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 1. Premium Header (Title, Status Indicator, Regime Control, Refresh Action) */}
        <motion.div variants={itemVariants}>
          <ErrorAnalysisHeader
            evaluationType={evaluationType}
            onToggleEvaluation={handleToggleEvaluation}
            onRefresh={handleRefresh}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
            status={report?.status || "READY"}
          />
        </motion.div>

        {/* Inline Error State if fetch failed */}
        {fetchError && (
          <motion.div
            variants={itemVariants}
            className="p-4 rounded-[14px] bg-rose-50 border border-rose-200 text-rose-900 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-rose-950">Unable to load error analysis</p>
                <p className="text-rose-700 mt-0.5">{fetchError}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="bg-white text-rose-700 border-rose-200 hover:bg-rose-50 shrink-0 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Retry
            </Button>
          </motion.div>
        )}

        {/* 2. Insufficient Production Feedback Alert Banner */}
        {isProduction && hasInsufficientData && (
          <motion.div
            variants={itemVariants}
            className="p-4 sm:p-5 rounded-[14px] bg-blue-50/70 border border-blue-200 text-blue-950 flex items-start gap-3.5 shadow-2xs"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="text-xs flex-1">
              <p className="font-bold text-sm text-blue-950">
                Insufficient observations for reliable production error analysis
              </p>
              <p className="mt-1 text-slate-600 leading-relaxed max-w-3xl">
                {report?.message ||
                  `Only ${report?.sample_count ?? 0} feedback observations have been collected. Production error analytics activate automatically once at least 5 verified outcomes are recorded.`}
              </p>
              <div className="mt-3.5 flex items-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleToggleEvaluation("BENCHMARK")}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3 rounded-[8px]"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5 ml-1" />}
                >
                  Switch to Benchmark / Test Split Analysis
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 3. KPI Metrics Grid (Section 5, 6, 7) */}
        <motion.section variants={itemVariants} aria-label="Key Performance Indicators">
          <ErrorKpiGrid report={report} evaluationType={evaluationType} />
        </motion.section>

        {/* 4. Model Metadata Lineage Context Strip (Section 8) */}
        <motion.section variants={itemVariants} aria-label="Model Context">
          <ModelContextStrip report={report} evaluationType={evaluationType} />
        </motion.section>

        {/* 5. Primary Visual Analytics: Residual Distribution & Error by Score Range (Section 9, 10, 11, 12) */}
        <motion.section variants={itemVariants} aria-label="Error Distributions">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResidualDistributionCard bins={report?.residual_analysis?.distribution_bins} />
            <ErrorByScoreRangeCard ranges={report?.performance_ranges} />
          </div>
        </motion.section>

        {/* 6. Centerpiece: Residuals vs Predicted Score & Model Reliability (Section 13, 14, 15, 16) */}
        <motion.section variants={itemVariants} aria-label="Residual Diagnostic Analysis">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ResidualScatterCard points={report?.residual_analysis?.scatter_points} />
            </div>
            <div className="lg:col-span-1">
              <ModelReliabilityCard report={report} />
            </div>
          </div>
        </motion.section>

        {/* 7. Error by Feature Segment Exploration Table (Section 17, 18, 19, 20) */}
        {report?.feature_segments && Object.keys(report.feature_segments).length > 0 && (
          <motion.section variants={itemVariants} aria-label="Feature Segment Errors">
            <FeatureSegmentsTable featureSegments={report.feature_segments} />
          </motion.section>
        )}

        {/* 8. Largest Prediction Errors Review Queue (Section 21, 22, 23, 24, 25) */}
        <motion.section variants={itemVariants} aria-label="Largest Errors Audit Queue">
          <LargestErrorsReviewTable errors={largestErrors} />
        </motion.section>
      </motion.div>
    </div>
  );
}
