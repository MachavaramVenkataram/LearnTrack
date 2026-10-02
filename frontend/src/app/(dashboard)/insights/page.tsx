"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import {
  getDashboardData,
  getPredictionHistory,
  savePredictionRecord,
} from "@/lib/academic/service";
import {
  predictPerformance,
  generateMLInsights,
  checkMLHealth,
} from "@/lib/api/ml";
import {
  PerformancePrediction,
  InsightCategory,
  PredictionFeatureInput,
} from "@/types/academic";

// Modular Components
import { InsightsHeader } from "@/components/insights/InsightsHeader";
import { InsightsMetricCards } from "@/components/insights/InsightsMetricCards";
import { ShapExplainabilitySection } from "@/components/insights/ShapExplainabilitySection";
import {
  PersonalizedIntelligenceFeed,
  PersonalizedInsightItem,
} from "@/components/insights/PersonalizedIntelligenceFeed";
import { InsightsEmptyState } from "@/components/insights/InsightsEmptyState";
import { InsightsLoadingSkeleton } from "@/components/insights/InsightsSkeletons";

export default function InsightsPage() {
  const { user, studentProfile, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isPredicting, setIsPredicting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Core Academic Metrics
  const [currentPerf, setCurrentPerf] = useState<number | null>(null);
  const [avgAttendance, setAvgAttendance] = useState<number | null>(null);
  const [studyHours, setStudyHours] = useState<number | null>(null);
  const [completedAssignmentsCount, setCompletedAssignmentsCount] = useState<number>(0);
  const [latestPrediction, setLatestPrediction] = useState<PerformancePrediction | null>(null);

  // Synthesized Insights
  const [insights, setInsights] = useState<PersonalizedInsightItem[]>([]);

  // Load all insights and prediction telemetry
  const loadInsightsData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    setLoadError(null);

    try {
      const [dash, preds] = await Promise.all([
        getDashboardData(user.id),
        studentProfile?.id ? getPredictionHistory(studentProfile.id) : Promise.resolve([]),
      ]);

      const latestPred = preds.length > 0 ? preds[0] : null;
      setLatestPrediction(latestPred);

      if (dash) {
        setCurrentPerf(dash.summary.averageMarks);
        setAvgAttendance(dash.summary.averageAttendance);
        setStudyHours(dash.summary.totalStudyHours > 0 ? dash.summary.totalStudyHours : null);

        const assignmentsDone = dash.activities.reduce(
          (acc, a) => acc + (a.assignments_completed || 0),
          0
        );
        setCompletedAssignmentsCount(assignmentsDone);

        // Generate personalized insights via backend ML service or deterministic logic
        try {
          const insightRes = await generateMLInsights({
            academic_records: dash.records,
            attendance_percentage: dash.summary.averageAttendance,
            study_hours: dash.summary.totalStudyHours,
            latest_prediction: latestPred
              ? {
                  predicted_score: latestPred.predicted_score,
                  predicted_grade: latestPred.predicted_grade,
                  risk_level: latestPred.risk_level,
                }
              : null,
            shap_explanations: latestPred?.explanations || [],
          });

          if (insightRes?.insights && insightRes.insights.length > 0) {
            setInsights(insightRes.insights);
          }
        } catch (e) {
          console.warn("[InsightsPage] ML insight synthesis failed, falling back gracefully:", e);
        }
      }
    } catch (err: any) {
      console.error("[InsightsPage] Error loading insights data:", err);
      setLoadError("Unable to load academic insights. Please verify your connection.");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, studentProfile?.id]);

  useEffect(() => {
    if (user?.id) {
      loadInsightsData();
    } else if (!isAuthLoading) {
      setIsLoading(false);
    }
  }, [user?.id, isAuthLoading, loadInsightsData]);

  // Handle in-page Run Prediction action (Requirement #2, #37, #38)
  const handleRunPrediction = async () => {
    if (isPredicting) return;

    // Check if underlying academic data exists
    const hasData = currentPerf !== null || avgAttendance !== null || (studyHours !== null && studyHours > 0);
    if (!hasData) {
      showToast(
        "Academic Records Required",
        "Please record at least one coursework mark or attendance percentage before running a prediction.",
        "info"
      );
      return;
    }

    setIsPredicting(true);
    try {
      const avgAtt = avgAttendance ?? 80.0;
      const avgScore = currentPerf ?? 75.0;
      const hours = studyHours && studyHours > 0 ? studyHours : 10.0;
      const assignments = Math.max(1, Math.min(10, completedAssignmentsCount || 5));

      const inputFeatures: PredictionFeatureInput = {
        attendance_percentage: Math.round(avgAtt * 10) / 10,
        assignment_score: Math.round(Math.min(100, avgScore + 4) * 10) / 10,
        internal_marks: Math.round(avgScore * 10) / 10,
        previous_score: Math.round(avgScore * 10) / 10,
        study_hours: Math.round(hours * 10) / 10,
        assignments_completed: assignments,
      };

      const result = await predictPerformance(inputFeatures);

      if (studentProfile?.id) {
        const saved = await savePredictionRecord({
          student_id: studentProfile.id,
          predicted_score: result.predicted_score,
          predicted_grade: result.predicted_grade,
          risk_level: result.risk_level,
          model_version: result.model_version,
          explanations: result.explanations,
          features: inputFeatures,
        });

        if (saved) {
          setLatestPrediction(saved);
        } else {
          setLatestPrediction({
            id: `temp-${Date.now()}`,
            student_id: studentProfile.id,
            predicted_score: result.predicted_score,
            predicted_grade: result.predicted_grade,
            risk_level: result.risk_level,
            model_version: result.model_version,
            explanations: result.explanations,
            created_at: new Date().toISOString(),
          });
        }
      }

      showToast(
        "Prediction Generated",
        `Model estimate updated to ${result.predicted_score.toFixed(1)} pts (${result.risk_level} Risk).`,
        "success"
      );

      // Refresh insights with updated prediction attributions
      loadInsightsData();
    } catch (err: any) {
      console.error("[InsightsPage] Error running prediction:", err);
      showToast(
        "Prediction Failed",
        err?.message || "Could not connect to the ML prediction engine.",
        "error"
      );
    } finally {
      setIsPredicting(false);
    }
  };

  if (isLoading) {
    return <InsightsLoadingSkeleton />;
  }

  // Critical Consistency Check:
  // Does the student have active, valid academic inputs?
  const hasCurrentAcademicData =
    currentPerf !== null ||
    avgAttendance !== null ||
    (studyHours !== null && studyHours > 0);

  // Insufficient data state (STATE B): Neither academic inputs nor prediction exist
  const isInsufficientData = !hasCurrentAcademicData && !latestPrediction;

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16 max-w-7xl mx-auto">
      {/* 1. Page Header (Requirement #1, #2, #3) */}
      <InsightsHeader
        onRunPrediction={handleRunPrediction}
        isPredicting={isPredicting}
      />

      {/* Network / Supabase Failure Banner */}
      {loadError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{loadError}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadInsightsData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="h-8 text-xs bg-white text-rose-700 border-rose-300 hover:bg-rose-50"
          >
            Retry
          </Button>
        </div>
      )}

      {/* 2. Top Metric Row (4 KPI Cards) (Requirement #4, #5, #6, #7) */}
      <InsightsMetricCards
        currentPerformance={currentPerf}
        averageAttendance={avgAttendance}
        studyHours={studyHours}
        latestPrediction={latestPrediction}
      />

      {/* 3. Main Workspace Condition (STATE B vs STATE A / C) */}
      {isInsufficientData ? (
        /* Insufficient data state (STATE B) */
        <InsightsEmptyState />
      ) : (
        <>
          {/* Main Explainability Section: "Why did LearnTrack predict this score?" (Requirements #10 - #20) */}
          <ShapExplainabilitySection
            prediction={latestPrediction}
            hasCurrentAcademicData={hasCurrentAcademicData}
          />

          {/* Personalized Intelligence Feed (Requirements #21 - #31) */}
          <PersonalizedIntelligenceFeed insights={insights} />
        </>
      )}

      {/* Subtle Bottom AI Assistance Banner (Requirement #40) */}
      <div className="pt-4 text-center">
        <p className="text-[11px] text-slate-400 max-w-xl mx-auto leading-normal">
          AI insights and SHAP attributions are designed as supportive academic decision aids. Review
          important course requirements and use LearnTrack&apos;s data to guide your revision schedule.
        </p>
      </div>
    </div>
  );
}
