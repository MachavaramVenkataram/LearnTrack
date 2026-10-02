"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  BarChart2,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MLPredictionResponse, MLModelInfo, MLHealthState, MLHealthStatus } from "@/lib/api/ml";
import { PredictionFeatureInput } from "@/types/academic";
import { ModelCardMicroPanel } from "./ModelCardMicroPanel";
import { cn } from "@/lib/utils";

export interface PredictionWorkspacePanelProps {
  prediction: MLPredictionResponse | null;
  formData: PredictionFeatureInput;
  isLoading: boolean;
  isMLHealthy: boolean | null;
  healthState?: MLHealthState;
  healthStatus?: MLHealthStatus | null;
  onRunPrediction: () => void;
  onRetryHealthCheck: () => void;
  isCheckingHealth: boolean;
  modelInfo?: MLModelInfo | null;
  onScrollToExplanation?: () => void;
}

/**
 * Subtle number animation for predicted score (Section 17: 500-700ms easing curve)
 */
function AnimatedScore({ value }: { value: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 600;
    let animFrame: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const val = ease * value;
      setCurrent(Math.round(val * 10) / 10);

      if (progress < 1) {
        animFrame = requestAnimationFrame(step);
      } else {
        setCurrent(value);
      }
    };

    animFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrame);
  }, [value]);

  return <span>{current.toFixed(1)}</span>;
}

export function PredictionWorkspacePanel({
  prediction,
  formData,
  isLoading,
  isMLHealthy,
  healthState,
  healthStatus,
  onRunPrediction,
  onRetryHealthCheck,
  isCheckingHealth,
  modelInfo,
  onScrollToExplanation,
}: PredictionWorkspacePanelProps) {
  const formattedTimestamp = useMemo(() => {
    if (!prediction) return "";
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, [prediction]);

  // Construct URL to simulator with current inputs as query parameters (Section 23)
  const simulatorParams = new URLSearchParams({
    attendance: String(formData.attendance_percentage),
    assignment: String(formData.assignment_score),
    internal: String(formData.internal_marks),
    previous: String(formData.previous_score),
    study_hours: String(formData.study_hours),
    completed: String(formData.assignments_completed),
  }).toString();

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "Low":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Low Risk
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> Medium Risk
          </span>
        );
      case "High":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> High Risk
          </span>
        );
      default:
        return (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {risk} Risk
          </span>
        );
    }
  };

  const getGradeStyle = (grade: string) => {
    if (grade.startsWith("A")) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (grade.startsWith("B")) return "text-blue-700 bg-blue-50 border-blue-200";
    if (grade.startsWith("C")) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-rose-700 bg-rose-50 border-rose-200";
  };

  const [showDevDetails, setShowDevDetails] = useState(false);
  const isDevMode = process.env.NODE_ENV !== "production";

  // Effective health state
  const effectiveState: MLHealthState = isCheckingHealth
    ? "CHECKING"
    : healthState || (isMLHealthy === false ? "OFFLINE" : isMLHealthy ? "ONLINE" : "CHECKING");

  // 1. STATE: ML SERVICE OFFLINE OR MODEL ERROR (Section 28 & 30)
  if (effectiveState === "OFFLINE" || effectiveState === "MODEL_ERROR") {
    const isModelError = effectiveState === "MODEL_ERROR";
    const statusLabel = isModelError ? "Model Error" : "Offline";
    const title = isModelError ? "Prediction Engine Warning" : "Prediction Engine Offline";
    const description = isModelError
      ? "The ML service is running, but the prediction model is not currently loaded or is warming up."
      : "LearnTrack's ML service is not reachable right now.";

    return (
      <Card className="border border-rose-200/90 shadow-2xs rounded-2xl bg-white p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
              isModelError ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-rose-50 text-rose-600 border-rose-100"
            )}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-left flex-1">
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-slate-400 font-medium">Service:</span>
            <span className="font-semibold text-slate-800">LearnTrack ML</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-slate-400 font-medium">Status:</span>
            <span
              className={cn(
                "font-semibold inline-flex items-center gap-1",
                isModelError ? "text-amber-700" : "text-rose-700"
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", isModelError ? "bg-amber-500" : "bg-rose-500")} />
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onRetryHealthCheck}
            isLoading={isCheckingHealth}
            className="w-full justify-center text-xs font-semibold"
            leftIcon={<RefreshCw className={cn("w-3.5 h-3.5", isCheckingHealth && "animate-spin")} />}
          >
            {isCheckingHealth ? "Checking connection..." : "Retry Connection"}
          </Button>
        </div>

        {isDevMode && (
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowDevDetails((prev) => !prev)}
              className="text-[11px] text-slate-500 hover:text-slate-800 font-medium flex items-center justify-between w-full transition-colors"
            >
              <span>Developer details</span>
              {showDevDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDevDetails && (
              <div className="mt-2 p-2.5 rounded-lg bg-slate-900 text-slate-200 text-[11px] font-mono space-y-1.5 text-left overflow-x-auto">
                <div>
                  <span className="text-slate-500">Target URL:</span> {healthStatus?.api_url || "http://127.0.0.1:8001"}
                </div>
                <div>
                  <span className="text-slate-500">Error Code:</span>{" "}
                  <span className="text-rose-400">{healthStatus?.error_code || "CONNECTION_REFUSED"}</span>
                </div>
                {healthStatus?.error_message && (
                  <div>
                    <span className="text-slate-500">Message:</span> {healthStatus.error_message}
                  </div>
                )}
                <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400">
                  <div className="text-slate-300 font-sans font-medium mb-0.5">FastAPI Backend Command:</div>
                  <code className="text-emerald-400 block break-all">
                    cd ml-service && .venv\Scripts\python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
                  </code>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    );
  }

  // 2. STATE: LOADING PREDICTION (Section 15)
  if (isLoading) {
    return (
      <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white p-10 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
          <Sparkles className="w-7 h-7 animate-spin text-blue-600" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-slate-900">Running ML Inference...</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Consulting Ridge regression weights and generating SHAP feature attributions.
          </p>
        </div>
        <div className="w-36 h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full animate-pulse w-3/4" />
        </div>
      </Card>
    );
  }

  // 3. STATE: PREDICTION RESULTS AVAILABLE (Sections 16, 17, 18, 19, 23, 40)
  if (prediction) {
    return (
      <div className="space-y-5">
        <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-gradient-to-b from-white to-[#F8FBFF] overflow-hidden transition-all duration-150">
          <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 w-full" />

          <CardHeader className="pb-3 border-b border-slate-100/90">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10.5px] font-bold tracking-wider uppercase text-blue-600">
                  ML Prediction Output
                </span>
                <CardTitle className="text-lg font-bold text-slate-900 mt-0.5">
                  Performance Projection
                </CardTitle>
              </div>

              {/* Real Rule-Based Risk Pill (Section 35) */}
              {getRiskBadge(prediction.risk_level)}
            </div>
          </CardHeader>

          <CardContent className="pt-6 pb-6 space-y-6">
            {/* Visual Focal Point: Predicted Score (Section 18) */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
                <span>ESTIMATED ACADEMIC OUTCOME</span>
              </div>

              <div className="flex items-baseline justify-center gap-1.5 text-slate-900">
                <span className="text-5xl font-extrabold tracking-tight">
                  <AnimatedScore value={prediction.predicted_score} />
                </span>
                <span className="text-base font-semibold text-slate-400">/ 100</span>
              </div>

              <p className="text-xs font-semibold text-slate-500">Predicted Score</p>

              <div className="flex items-center justify-center gap-2 pt-2">
                <span
                  className={cn(
                    "text-xs font-extrabold px-3 py-1 rounded-lg border",
                    getGradeStyle(prediction.predicted_grade)
                  )}
                >
                  Grade {prediction.predicted_grade}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs font-semibold text-slate-600">
                  {prediction.risk_level} Risk Category
                </span>
              </div>
            </div>

            {/* Model Metadata Row (Section 19) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Model Engine:</span>
                <span className="font-semibold text-slate-800">
                  {modelInfo?.model_type || "Linear Regression (Ridge)"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-400">Version:</span>
                <span className="font-mono text-slate-700">
                  {prediction.model_version || "v1.0.0"}
                </span>
              </div>
              {formattedTimestamp && (
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Generated:</span>
                  <span className="text-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formattedTimestamp}
                  </span>
                </div>
              )}
            </div>

            {/* Actions: View Explanation & What-If (Section 23, 37) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Button
                variant="outline"
                size="md"
                onClick={onScrollToExplanation}
                className="w-full justify-center text-xs font-semibold"
                leftIcon={<BarChart2 className="w-3.5 h-3.5 text-slate-500" />}
              >
                View Explanation
              </Button>

              <Link href={`/simulator?${simulatorParams}`} className="w-full">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center text-xs font-semibold shadow-2xs"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Explore What-If
                </Button>
              </Link>
            </div>

            {/* Technical Micro Model Card (Section 48) */}
            <ModelCardMicroPanel modelInfo={modelInfo} modelVersion={prediction.model_version} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // 4. STATE: READY FOR ANALYSIS (BEFORE PREDICTION) (Section 13)
  return (
    <Card className="border border-slate-200/90 shadow-2xs rounded-2xl bg-white p-7 text-center space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Prediction Workspace
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Ready
        </span>
      </div>

      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
        <Sparkles className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-slate-900">Ready for Analysis</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Your academic inputs are ready. Run the ML model to generate a performance estimate, letter grade, risk tier, and SHAP explainability attribution.
        </p>
      </div>

      <div className="pt-2">
        <Button
          variant="primary"
          size="md"
          onClick={onRunPrediction}
          className="w-full sm:w-auto px-6 h-11 rounded-[10px] font-semibold text-xs shadow-md shadow-blue-500/10 justify-center"
          leftIcon={<Sparkles className="w-4 h-4 text-white" />}
        >
          Run Prediction
        </Button>
      </div>

      <div className="pt-3 border-t border-slate-100 text-left">
        <ModelCardMicroPanel modelInfo={modelInfo} />
      </div>
    </Card>
  );
}
