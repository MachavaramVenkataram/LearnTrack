"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/lib/auth-context";
import {
  getDashboardData,
  saveSimulationRecord,
  getSimulationHistory,
  deleteSimulationRecord,
} from "@/lib/academic/service";
import {
  simulatePerformance,
  checkMLHealth,
  getModelInfo,
  MLModelInfo,
} from "@/lib/api/ml";
import {
  PredictionFeatureInput,
  SimulationResponse,
  SimulationRecord,
} from "@/types/academic";

// Modular Simulator Components
import { SimulatorHeader } from "@/components/simulator/SimulatorHeader";
import { SimulationInputsPanel } from "@/components/simulator/SimulationInputsPanel";
import {
  ProjectionOutcomeCard,
  SensitivityDeltaItem,
} from "@/components/simulator/ProjectionOutcomeCard";
import { SimulationHistoryDrawer } from "@/components/simulator/SimulationHistoryDrawer";
import { SimulatorWorkspaceSkeleton } from "@/components/simulator/SimulatorSkeletons";

const DEFAULT_BASELINE: PredictionFeatureInput = {
  attendance_percentage: 80.0,
  assignment_score: 78.0,
  internal_marks: 75.0,
  previous_score: 74.0,
  study_hours: 12.0,
  assignments_completed: 8,
};

export default function SimulatorPage() {
  const { user, studentProfile, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id;
  const studentProfileId = studentProfile?.id;
  const { showToast } = useToast();

  const [baseline, setBaseline] = useState<PredictionFeatureInput>(DEFAULT_BASELINE);
  const [simulated, setSimulated] = useState<PredictionFeatureInput>(DEFAULT_BASELINE);
  const [simulation, setSimulation] = useState<SimulationResponse | null>(null);

  // Model telemetry & status
  const [modelInfo, setModelInfo] = useState<MLModelInfo | null>(null);
  const [mlStatus, setMlStatus] = useState<"healthy" | "unhealthy" | "offline" | "loading">("loading");
  const [mlError, setMlError] = useState<string | null>(null);

  // UI States
  const [isLoadingBaseline, setIsLoadingBaseline] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  // History State
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [savedSimulations, setSavedSimulations] = useState<SimulationRecord[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Check ML Backend Health and Model Information
  const verifyMLBackend = useCallback(async () => {
    try {
      const [health, info] = await Promise.all([
        checkMLHealth(),
        getModelInfo().catch(() => null),
      ]);

      if (health.state === "ONLINE") {
        setMlStatus("healthy");
        setMlError(null);
      } else if (health.state === "MODEL_ERROR") {
        setMlStatus("unhealthy");
        setMlError(health.error_message || "ML prediction model is not loaded.");
      } else {
        setMlStatus("offline");
        setMlError(health.error_message || "LearnTrack ML service is offline.");
      }
      if (info) {
        setModelInfo(info);
      }
    } catch {
      setMlStatus("offline");
      setMlError("LearnTrack ML service is unreachable.");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void verifyMLBackend();
    }, 0);
    return () => clearTimeout(timer);
  }, [verifyMLBackend]);

  // 2. Load Real Student Baseline from Supabase & URL parameters
  const loadStudentBaseline = useCallback(async () => {
    try {
      // Check query params if redirected from prediction / insights
      const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const qAtt = searchParams?.get("attendance");
      const qAssign = searchParams?.get("assignment");
      const qInt = searchParams?.get("internal");
      const qPrev = searchParams?.get("previous");
      const qHours = searchParams?.get("study_hours");
      const qComp = searchParams?.get("completed");

      if (qAtt || qAssign || qInt || qPrev || qHours || qComp) {
        const initial: PredictionFeatureInput = {
          attendance_percentage: qAtt ? parseFloat(qAtt) : 80.0,
          assignment_score: qAssign ? parseFloat(qAssign) : 78.0,
          internal_marks: qInt ? parseFloat(qInt) : 75.0,
          previous_score: qPrev ? parseFloat(qPrev) : 74.0,
          study_hours: qHours ? parseFloat(qHours) : 12.0,
          assignments_completed: qComp ? parseInt(qComp, 10) : 8,
        };

        setBaseline(initial);
        setSimulated(initial);

        try {
          const res = await simulatePerformance({
            baseline: initial,
            simulated: initial,
          });
          setSimulation(res);
        } catch (err: unknown) {
          console.warn("[Simulator] Initial simulation error:", err);
          if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "NETWORK_ERROR") {
            setMlStatus("offline");
          }
        }
        return;
      }

      if (userId) {
        const dash = await getDashboardData(userId);
        if (dash) {
          const avgAtt = dash.summary.averageAttendance ?? 80.0;
          const avgScore = dash.summary.averageMarks ?? 78.4;
          const studyH = dash.summary.totalStudyHours > 0 ? dash.summary.totalStudyHours : 12.0;
          const completed = dash.activities.reduce(
            (acc, a) => acc + (a.assignments_completed || 0),
            0
          );

          const initial: PredictionFeatureInput = {
            attendance_percentage: Math.round(avgAtt * 10) / 10,
            assignment_score: Math.round(Math.min(100, avgScore + 2) * 10) / 10,
            internal_marks: Math.round(avgScore * 10) / 10,
            previous_score: Math.round(avgScore * 10) / 10,
            study_hours: Math.round(studyH * 10) / 10,
            assignments_completed: Math.max(1, Math.min(15, completed || 8)),
          };

          setBaseline(initial);
          setSimulated(initial);

          // Run initial baseline comparison
          try {
            const res = await simulatePerformance({
              baseline: initial,
              simulated: initial,
            });
            setSimulation(res);
          } catch (err: unknown) {
            console.warn("[Simulator] Baseline simulation error:", err);
            if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "NETWORK_ERROR") {
              setMlStatus("offline");
            }
          }
        }
      }
    } catch (err: unknown) {
      console.error("[Simulator] Error loading baseline:", err);
    } finally {
      setIsLoadingBaseline(false);
    }
  }, [userId]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (userId) {
      timer = setTimeout(() => {
        void loadStudentBaseline();
      }, 0);
    } else if (!isAuthLoading) {
      timer = setTimeout(() => {
        setIsLoadingBaseline(false);
      }, 0);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [userId, isAuthLoading, loadStudentBaseline]);

  // 3. Load Simulation History from Supabase
  const refreshHistory = useCallback(async () => {
    if (studentProfileId) {
      try {
        const history = await getSimulationHistory(studentProfileId);
        setSavedSimulations(history);
      } catch (err: unknown) {
        console.warn("[Simulator] Could not load history:", err);
      }
    }
  }, [studentProfileId]);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    if (studentProfileId) {
      timer = setTimeout(() => {
        void refreshHistory();
      }, 0);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [studentProfileId, refreshHistory]);

  // 4. Handle Parameter Adjustments (Synchronized Slider & Exact Numeric Input)
  const handleSliderChange = (field: keyof PredictionFeatureInput, val: number) => {
    setSimulated((prev) => ({ ...prev, [field]: val }));
    setHasChanged(true);
  };

  const handleInputChange = (
    field: keyof PredictionFeatureInput,
    valStr: string,
    maxVal: number
  ) => {
    const parsed = parseFloat(valStr);
    const clamped = isNaN(parsed) ? 0 : Math.min(maxVal, Math.max(0, parsed));
    setSimulated((prev) => ({ ...prev, [field]: clamped }));
    setHasChanged(true);
  };

  // 5. Run Simulation via FastAPI Backend
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setMlError(null);
    try {
      const res = await simulatePerformance({
        baseline,
        simulated,
      });
      setSimulation(res);
      setHasChanged(false);
      setMlStatus("healthy");
    } catch (err: unknown) {
      console.error("[Simulator] Run Simulation Error:", err);
      let title = "Simulation Error";
      let msg = err instanceof Error ? err.message : "Failed to compute simulated prediction.";
      const errorCode = typeof err === "object" && err !== null && "code" in err ? (err as { code: string }).code : undefined;

      if (errorCode === "NETWORK_ERROR") {
        title = "Prediction Engine Offline";
        msg = "The Python ML service could not be reached. Ensure the backend is running.";
        setMlStatus("offline");
      } else if (errorCode === "422_VALIDATION_ERROR") {
        title = "Invalid Input Values";
        msg = "Please verify your input parameters.";
      }

      setMlError(msg);
      showToast(title, msg, "error");
    } finally {
      setIsSimulating(false);
    }
  };

  // 6. Reset to Baseline
  const handleResetToBaseline = () => {
    setSimulated(baseline);
    setHasChanged(false);
    // If simulation was run, re-run with baseline
    simulatePerformance({ baseline, simulated: baseline })
      .then((res) => setSimulation(res))
      .catch(() => {});
    showToast("Reset to Baseline", "Restored all inputs to current student baseline values.", "info");
  };

  // 7. Save Simulation Scenario to Supabase
  const handleSaveSimulation = async () => {
    if (!studentProfileId || !simulation) {
      showToast("Cannot Save", "Please ensure your student profile is active.", "info");
      return;
    }

    setIsSaving(true);
    try {
      const data = await saveSimulationRecord({
        student_id: studentProfileId,
        original_features: baseline,
        simulated_features: simulated,
        current_prediction: simulation.current_prediction,
        simulated_prediction: simulation.simulated_prediction,
        difference: simulation.difference,
        model_version: simulation.model_version,
      });

      if (!data) throw new Error("Could not save simulation record.");

      showToast(
        "Simulation Saved",
        "Your hypothetical scenario has been archived to history.",
        "success"
      );
      await refreshHistory();
    } catch (err: unknown) {
      showToast("Save Failed", err instanceof Error ? err.message : "Could not save simulation.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // 8. Delete History Record
  const handleDeleteSaved = async (id: string) => {
    const success = await deleteSimulationRecord(id);
    if (success) {
      setSavedSimulations((prev) => prev.filter((s) => s.id !== id));
      showToast("Deleted", "Saved simulation removed.", "info");
    }
  };

  // 9. Restore Scenario from History
  const handleRestoreSimulation = (features: PredictionFeatureInput) => {
    setSimulated(features);
    setHasChanged(true);
    showToast(
      "Scenario Restored",
      "Loaded historical parameters. Click 'Run Simulation' to execute.",
      "info"
    );
  };

  // Compute Sensitivity Deltas
  const deltas: SensitivityDeltaItem[] = useMemo(() => {
    return [
      {
        label: "Attendance Rate",
        baselineVal: baseline.attendance_percentage,
        simVal: simulated.attendance_percentage,
        unit: "%",
        diff: +(simulated.attendance_percentage - baseline.attendance_percentage).toFixed(1),
      },
      {
        label: "Study Hours",
        baselineVal: baseline.study_hours,
        simVal: simulated.study_hours,
        unit: "h",
        diff: +(simulated.study_hours - baseline.study_hours).toFixed(1),
      },
      {
        label: "Internal Assessment",
        baselineVal: baseline.internal_marks,
        simVal: simulated.internal_marks,
        unit: "pts",
        diff: +(simulated.internal_marks - baseline.internal_marks).toFixed(1),
      },
      {
        label: "Assignment Score",
        baselineVal: baseline.assignment_score,
        simVal: simulated.assignment_score,
        unit: "pts",
        diff: +(simulated.assignment_score - baseline.assignment_score).toFixed(1),
      },
      {
        label: "Previous Score",
        baselineVal: baseline.previous_score,
        simVal: simulated.previous_score,
        unit: "pts",
        diff: +(simulated.previous_score - baseline.previous_score).toFixed(1),
      },
      {
        label: "Assignments Completed",
        baselineVal: baseline.assignments_completed,
        simVal: simulated.assignments_completed,
        unit: "tasks",
        diff: simulated.assignments_completed - baseline.assignments_completed,
      },
    ];
  }, [baseline, simulated]);

  // Check if inputs differ from baseline
  const canReset = useMemo(() => {
    return (
      simulated.attendance_percentage !== baseline.attendance_percentage ||
      simulated.study_hours !== baseline.study_hours ||
      simulated.internal_marks !== baseline.internal_marks ||
      simulated.assignment_score !== baseline.assignment_score ||
      simulated.previous_score !== baseline.previous_score ||
      simulated.assignments_completed !== baseline.assignments_completed
    );
  }, [baseline, simulated]);

  if (isLoadingBaseline || isAuthLoading) {
    return <SimulatorWorkspaceSkeleton />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16 max-w-7xl mx-auto">
      {/* 1. Page Header with Status Strip (Sections 2 & 3) */}
      <SimulatorHeader
        modelType={modelInfo?.model_type || "Ridge Regression"}
        modelVersion={modelInfo?.model_version || simulation?.model_version || "v1.0.0"}
        mlStatus={mlStatus}
        baselineScore={simulation ? simulation.current_prediction : null}
        historyCount={savedSimulations.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onReset={handleResetToBaseline}
        canReset={canReset}
      />

      {/* Offline ML Error Banner if prediction engine is unreachable */}
      {mlStatus === "offline" && (
        <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs text-rose-800 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-rose-900">
                Simulation Engine Offline
              </span>
              <p className="text-rose-700 mt-0.5 leading-relaxed">
                {mlError || "The LearnTrack ML microservice is currently unreachable. Simulation requires the live FastAPI service on port 8001."}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={verifyMLBackend}
            className="h-8 px-3 text-xs border-rose-200 text-rose-800 hover:bg-rose-100 shrink-0"
          >
            Retry Connection
          </Button>
        </div>
      )}

      {/* 2. Main 2-Column Workspace (Section 4: Left ~60%, Right ~40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Simulation Inputs (Sections 5, 6, 7, 8, 9, 10) */}
        <section aria-label="Simulation Controls" className="lg:col-span-7 space-y-4">
          <SimulationInputsPanel
            baseline={baseline}
            simulated={simulated}
            onSliderChange={handleSliderChange}
            onInputChange={handleInputChange}
            onRunSimulation={handleRunSimulation}
            isSimulating={isSimulating}
            hasChanged={hasChanged}
          />
        </section>

        {/* RIGHT COLUMN: Projection Outcome & Sensitivity (Sections 12, 13, 14, 15, 17, 18, 19, 22) */}
        <section aria-label="Simulation Results" className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          <ProjectionOutcomeCard
            simulation={simulation}
            deltas={deltas}
            onSave={handleSaveSimulation}
            isSaving={isSaving}
            baseline={baseline}
            simulated={simulated}
          />
        </section>
      </div>

      {/* 3. Saved Simulation History Modal / Side Drawer (Sections 23 & 24) */}
      <SimulationHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedSimulations={savedSimulations}
        onDelete={handleDeleteSaved}
        onRestore={handleRestoreSimulation}
      />
    </div>
  );
}
