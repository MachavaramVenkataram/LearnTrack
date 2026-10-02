"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";

import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import {
  predictPerformance,
  checkMLHealth,
  getModelInfo,
  MLPredictionResponse,
  MLModelInfo,
  MLHealthStatus,
  MLError,
} from "@/lib/api/ml";
import { savePredictionRecord, getDashboardData } from "@/lib/academic/service";
import { PredictionFeatureInput } from "@/types/academic";

import { PredictionHeader } from "@/components/prediction/PredictionHeader";
import { PredictionWorkflowProgress } from "@/components/prediction/PredictionWorkflowProgress";
import { AcademicInputsCard } from "@/components/prediction/AcademicInputsCard";
import { PredictionWorkspacePanel } from "@/components/prediction/PredictionWorkspacePanel";
import { ShapExplanationPanel } from "@/components/prediction/ShapExplanationPanel";
import { PredictionPageSkeleton } from "@/components/prediction/PredictionSkeletons";

const DEFAULT_INPUTS: PredictionFeatureInput = {
  attendance_percentage: 85.0,
  assignment_score: 82.0,
  internal_marks: 78.0,
  previous_score: 75.0,
  study_hours: 14.0,
  assignments_completed: 8,
};

export default function PredictionPage() {
  const { user, studentProfile } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<PredictionFeatureInput>(DEFAULT_INPUTS);
  const [initialBaseline, setInitialBaseline] = useState<PredictionFeatureInput>(DEFAULT_INPUTS);

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const [prediction, setPrediction] = useState<MLPredictionResponse | null>(null);
  const [mlServiceHealthy, setMlServiceHealthy] = useState<boolean | null>(null);
  const [healthStatus, setHealthStatus] = useState<MLHealthStatus | null>(null);
  const [modelInfo, setModelInfo] = useState<MLModelInfo | null>(null);

  const [dataSource, setDataSource] = useState<"supabase" | "manual">("manual");
  const [hasAcademicRecords, setHasAcademicRecords] = useState(false);
  const [latestRecordDate, setLatestRecordDate] = useState<string | null>(null);

  const explanationRef = useRef<HTMLDivElement>(null);

  // 1. Check ML service health and telemetry
  const verifyMLHealth = useCallback(async () => {
    setIsCheckingHealth(true);
    try {
      const [status, info] = await Promise.all([checkMLHealth(), getModelInfo()]);
      setHealthStatus(status);
      setMlServiceHealthy(status.state === "ONLINE");
      setModelInfo(info);
    } catch (err) {
      console.warn("[Prediction] Health check failed:", err);
      setMlServiceHealthy(false);
      setHealthStatus({
        state: "OFFLINE",
        status: "offline",
        service: "LearnTrack ML",
        model_loaded: false,
        error_code: "CONNECTION_REFUSED",
        error_message: "Failed to connect to ML prediction service.",
        api_url: "http://127.0.0.1:8001",
      });
    } finally {
      setIsCheckingHealth(false);
    }
  }, []);

  // 2. Fetch authenticated student's real academic records if available
  const loadStudentRecordData = useCallback(async (userId: string, isSilent = false) => {
    try {
      const dash = await getDashboardData(userId);
      if (dash && (dash.records.length > 0 || dash.summary.averageAttendance !== null)) {
        const avgAtt = dash.summary.averageAttendance ?? 85.0;
        const avgScore = dash.summary.averageMarks ?? 78.0;
        const totalHours = dash.summary.totalStudyHours > 0 ? dash.summary.totalStudyHours : 14.0;
        const completed = dash.activities.reduce(
          (acc, a) => acc + (a.assignments_completed || 0),
          0
        );

        const loadedValues: PredictionFeatureInput = {
          attendance_percentage: Math.round(avgAtt * 10) / 10,
          previous_score: Math.round(avgScore * 10) / 10,
          internal_marks: Math.round(avgScore * 10) / 10,
          assignment_score: Math.round(Math.min(100, avgScore + 4) * 10) / 10,
          study_hours: Math.round(totalHours * 10) / 10,
          assignments_completed: Math.max(1, Math.min(25, completed || 8)),
        };

        setFormData(loadedValues);
        setInitialBaseline(loadedValues);
        setDataSource("supabase");
        setHasAcademicRecords(true);

        // Find latest academic record date
        if (dash.records.length > 0) {
          const sorted = [...dash.records].sort(
            (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          );
          const firstRecord = sorted[0];
          const date = firstRecord?.created_at
            ? new Date(firstRecord.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "Current semester";
          setLatestRecordDate(date);
        } else {
          setLatestRecordDate("Current semester");
        }

        if (!isSilent) {
          showToast(
            "Academic Records Loaded",
            "Inputs have been prefilled with your latest verified coursework and attendance.",
            "success"
          );
        }
      } else {
        setHasAcademicRecords(false);
        setDataSource("manual");
      }
    } catch (err) {
      console.warn("[Prediction] Error prefilling student records:", err);
      setHasAcademicRecords(false);
      setDataSource("manual");
    }
  }, [showToast]);

  // Initial mount load
  useEffect(() => {
    let isCancelled = false;

    async function initPage() {
      setIsInitialLoading(true);
      await verifyMLHealth();
      if (user?.id && !isCancelled) {
        await loadStudentRecordData(user.id, true);
      }
      if (!isCancelled) {
        setIsInitialLoading(false);
      }
    }

    initPage();

    return () => {
      isCancelled = true;
    };
  }, [user?.id, verifyMLHealth, loadStudentRecordData]);

  // Handle field input changes
  const handleChange = (field: keyof PredictionFeatureInput, value: string) => {
    const num = parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      [field]: isNaN(num) ? 0 : num,
    }));
    // When manually edited, tag as manual inputs
    setDataSource("manual");
  };

  // Reset to initial baseline
  const handleReset = () => {
    setFormData(initialBaseline);
    setDataSource(hasAcademicRecords ? "supabase" : "manual");
    showToast("Inputs Restored", "Academic values have been reset to baseline.", "info");
  };

  // Autofill button handler
  const handleAutofillFromRecords = () => {
    if (user?.id) {
      loadStudentRecordData(user.id, false);
    }
  };

  // Run prediction submission
  const executePrediction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    try {
      // 1. Send to FastAPI ML inference engine
      const result = await predictPerformance(formData);
      setPrediction(result);

      // Celebrate high predicted performance
      if (result.predicted_score >= 80) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }

      // 2. Persist prediction to Supabase for authenticated student
      if (studentProfile?.id) {
        await savePredictionRecord({
          student_id: studentProfile.id,
          predicted_score: result.predicted_score,
          predicted_grade: result.predicted_grade,
          risk_level: result.risk_level,
          model_version: result.model_version,
          features: formData,
          explanations: result.explanations,
        });
      }

      showToast(
        "Prediction Generated",
        `Projected ${result.predicted_score.toFixed(1)}% (Grade ${result.predicted_grade}) • ${result.risk_level} Risk tier.`,
        "success"
      );
    } catch (err: unknown) {
      console.error("[Prediction Submission Error]", err);
      let title = "Prediction Error";
      let message = "Failed to connect to LearnTrack ML microservice. Ensure backend is running.";

      if (err instanceof MLError) {
        switch (err.code) {
          case "NETWORK_ERROR":
            title = "Prediction Engine Offline";
            message = "Could not connect to the ML service. Check if FastAPI is running at http://127.0.0.1:8001.";
            setMlServiceHealthy(false);
            break;
          case "422_VALIDATION_ERROR":
            title = "Invalid Academic Inputs";
            message = err.message || "Please check that all academic values are within allowed ranges.";
            break;
          case "TIMEOUT":
            title = "Inference Timed Out";
            message = "The prediction request took too long to complete. Please try again.";
            break;
          case "SERVICE_UNAVAILABLE":
            title = "Model Unavailable";
            message = "The machine learning model weights are currently offline or reloading.";
            break;
          case "500_SERVER_ERROR":
            title = "Model Server Error";
            message = "The prediction engine encountered an internal calculation error.";
            break;
          default:
            title = "Inference Request Failed";
            message = err.message || "An unexpected error occurred while generating your prediction.";
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      showToast(title, message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScrollToExplanation = () => {
    explanationRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Determine current pipeline workflow step
  const workflowStage = isLoading
    ? "analyzing"
    : prediction
    ? "explained"
    : "input";

  const hasChanged = JSON.stringify(formData) !== JSON.stringify(initialBaseline);

  if (isInitialLoading) {
    return <PredictionPageSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header (Sections 2 & 3) */}
      <PredictionHeader
        mlServiceHealthy={mlServiceHealthy}
        healthState={healthStatus?.state}
        modelVersion={modelInfo?.model_version || healthStatus?.model_version}
        onRetryHealthCheck={verifyMLHealth}
        isCheckingHealth={isCheckingHealth}
      />

      {/* 2. ML Workflow Pipeline Banner (Section 50) */}
      <PredictionWorkflowProgress currentStage={workflowStage} />

      {/* 3. Main Workspace Grid: Left ~55% / Right ~45% (Section 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Academic Inputs Card (Sections 5–12) */}
        <div className="lg:col-span-7">
          <AcademicInputsCard
            formData={formData}
            onChange={handleChange}
            onSubmit={executePrediction}
            onReset={handleReset}
            onAutofillFromRecords={handleAutofillFromRecords}
            hasChanged={hasChanged}
            dataSource={dataSource}
            hasAcademicRecords={hasAcademicRecords}
            latestRecordDate={latestRecordDate}
            isLoading={isLoading}
            isMLHealthy={mlServiceHealthy}
          />
        </div>

        {/* Right Column: Prediction Workspace (Sections 13–19, 48) */}
        <div className="lg:col-span-5 space-y-6">
          <PredictionWorkspacePanel
            prediction={prediction}
            formData={formData}
            isLoading={isLoading}
            isMLHealthy={mlServiceHealthy}
            healthState={healthStatus?.state}
            healthStatus={healthStatus}
            onRunPrediction={() => executePrediction()}
            onRetryHealthCheck={verifyMLHealth}
            isCheckingHealth={isCheckingHealth}
            modelInfo={modelInfo}
            onScrollToExplanation={handleScrollToExplanation}
          />
        </div>
      </div>

      {/* 4. SHAP Explanation Section (Sections 20, 21, 22) */}
      {prediction && (
        <div ref={explanationRef} className="pt-2">
          <ShapExplanationPanel explanations={prediction.explanations} />
        </div>
      )}
    </div>
  );
}
