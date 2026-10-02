import { PredictionResult, SimulationResult } from "./types";
import { ML_CONFIG } from "./ml/config";

const API_BASE = ML_CONFIG.baseUrl;

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getModelInfo(): Promise<Record<string, unknown>> {
  const res = await fetch(`${API_BASE}/model/info`, { signal: AbortSignal.timeout(4000) });
  if (!res.ok) throw new Error("Failed to fetch model info");
  return await res.json();
}

export async function predictStudentPerformance(features: {
  attendance: number;
  study_hours_per_week: number;
  internal_marks: number;
  assignment_completion_rate: number;
  previous_cgpa: number;
  extracurricular_hours?: number;
  sleep_hours_avg?: number;
  practice_tests_taken?: number;
  backlogs_count?: number;
}): Promise<PredictionResult> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(features),
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    throw new Error(`Inference API error: ${res.statusText}`);
  }

  return await res.json();
}

export async function simulateWhatIf(
  baseline: Record<string, number>,
  simulated: Record<string, number>
): Promise<SimulationResult> {
  const res = await fetch(`${API_BASE}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ baseline, simulated }),
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) throw new Error("Simulation endpoint error: " + res.statusText);
  return await res.json();
}
