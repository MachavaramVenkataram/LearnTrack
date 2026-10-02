/**
 * LearnTrack Centralized ML Service API Client
 * Provides typed access to FastAPI ML prediction, model telemetry, and health endpoints.
 * All UI components MUST consume ML services through this layer.
 */

import {
  PredictionFeatureInput,
  ExplanationItem,
  SimulationRequest,
  SimulationResponse,
  InsightGenerationRequest,
  InsightGenerationResponse,
} from "@/types/academic";
import { ML_CONFIG, getMLApiUrl, logML } from "@/lib/ml/config";

export interface MLPredictionResponse {
  prediction?: number;
  predicted_score: number;
  predicted_grade: string;
  risk_level: "Low" | "Medium" | "High";
  model_name?: string;
  model_version: string;
  dataset_version?: string;
  run_id?: string;
  prediction_id?: string;
  latency_ms?: number;
  explanations: ExplanationItem[];
  disclaimer: string;
}

export type MLHealthState = "ONLINE" | "OFFLINE" | "MODEL_ERROR" | "CHECKING";

export interface MLHealthStatus {
  state: MLHealthState;
  status: "healthy" | "unhealthy" | "offline" | "error";
  service: string;
  model_loaded: boolean;
  model_name?: string;
  model_version?: string;
  dataset_version?: string;
  run_id?: string;
  error_code?: MLErrorCode;
  error_message?: string;
  error_details?: string;
  api_url: string;
}

export interface MLModelInfo {
  service: string;
  model_version: string;
  model_type: string;
  target: string;
  target_scale: string;
  dataset_name: string;
  feature_names: string[];
  evaluation_metrics: {
    validation: {
      mae: number;
      rmse: number;
      r2: number;
      cv_rmse_5fold?: number;
    };
    independent_test: {
      mae: number;
      rmse: number;
      r2: number;
    };
    benchmarks: Record<string, unknown>;
  };
  selection_rationale: string;
}

export type MLErrorCode =
  | "CONNECTION_REFUSED"
  | "TIMEOUT"
  | "CORS_ERROR"
  | "HTTP_404"
  | "HTTP_500"
  | "404_NOT_FOUND"
  | "422_VALIDATION_ERROR"
  | "500_SERVER_ERROR"
  | "MODEL_LOAD_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "INVALID_RESPONSE"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR";

export class MLError extends Error {
  code: MLErrorCode;
  statusCode?: number;
  details?: unknown;

  constructor(message: string, code: MLErrorCode, statusCode?: number, details?: unknown) {
    super(message);
    this.name = "MLError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Validates academic feature ranges before dispatching prediction requests.
 */
export function validateAcademicInputs(features: PredictionFeatureInput): { valid: boolean; error?: string } {
  if (features.attendance_percentage < 0 || features.attendance_percentage > 100) {
    return { valid: false, error: "Attendance must be between 0% and 100%." };
  }
  if (features.internal_marks < 0 || features.internal_marks > 100) {
    return { valid: false, error: "Internal marks must be between 0 and 100." };
  }
  if (features.previous_score < 0 || features.previous_score > 100) {
    return { valid: false, error: "Previous score must be between 0 and 100." };
  }
  if (features.assignment_score < 0 || features.assignment_score > 100) {
    return { valid: false, error: "Assignment score must be between 0 and 100." };
  }
  if (features.assignments_completed < 0) {
    return { valid: false, error: "Assignments completed must be non-negative." };
  }
  if (features.study_hours < 0 || features.study_hours > 60) {
    return { valid: false, error: "Weekly study hours must be between 0 and 60 hours." };
  }
  return { valid: true };
}

/**
 * Timeout-guarded fetch wrapper with explicit error classification for ML service requests.
 */
async function fetchML(endpoint: string, options: RequestInit = {}, timeoutMs = ML_CONFIG.timeoutMs): Promise<Response> {
  const url = getMLApiUrl(endpoint);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error: unknown) {
    clearTimeout(timer);
    const err = error as Error | undefined;
    if (err?.name === "AbortError") {
      logML(`Request to ${endpoint} timed out after ${timeoutMs}ms`);
      throw new MLError("Request to prediction engine timed out. Please try again.", "TIMEOUT");
    }

    const isNetworkOrCors = error instanceof TypeError || Boolean(err?.message?.includes("fetch"));
    const code: MLErrorCode = isNetworkOrCors ? "CONNECTION_REFUSED" : "NETWORK_ERROR";
    logML(`Network error calling ${endpoint}`, { error: String(error) });
    throw new MLError(
      "ML prediction service is not running or unreachable.",
      code,
      undefined,
      error
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    let code: MLErrorCode = "UNKNOWN_ERROR";
    let message: string = typeof errorBody.detail === "string" ? errorBody.detail : "";

    if (res.status === 404) {
      code = "HTTP_404";
      message = message || "Prediction endpoint not found on ML service.";
    } else if (res.status === 422) {
      code = "422_VALIDATION_ERROR";
      message = message || "Prediction request contains invalid inputs.";
    } else if (res.status === 503) {
      code = "MODEL_LOAD_ERROR";
      message = message || "Prediction model artifact is currently unavailable.";
    } else if (res.status >= 500) {
      code = "HTTP_500";
      message = message || "Prediction engine encountered an internal calculation error.";
    } else {
      message = message || `Prediction request failed with status ${res.status}`;
    }

    logML(`HTTP ${res.status} [${code}] from ${endpoint}`, errorBody);
    throw new MLError(message, code, res.status, errorBody);
  }

  return res;
}

/**
 * Checks connectivity and model artifact readiness of the Python ML microservice.
 * Distinguishes between ONLINE, OFFLINE, and MODEL_ERROR.
 */
export async function checkMLHealth(): Promise<MLHealthStatus> {
  const url = getMLApiUrl(ML_CONFIG.endpoints.health);
  logML("Health check started", { target: url });

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ML_CONFIG.healthTimeoutMs);

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));

    if (!res.ok) {
      logML(`Health check returned HTTP ${res.status}`);
      return {
        state: "MODEL_ERROR",
        status: "error",
        service: ML_CONFIG.serviceName,
        model_loaded: false,
        error_code: res.status >= 500 ? "HTTP_500" : "MODEL_LOAD_ERROR",
        error_message: `ML service returned status ${res.status}`,
        api_url: ML_CONFIG.baseUrl,
      };
    }

    const data = await res.json();
    const modelLoaded = Boolean(data.model_loaded);

    if (!modelLoaded) {
      logML("Health check: service reachable but model is NOT loaded");
      return {
        state: "MODEL_ERROR",
        status: "unhealthy",
        service: data.service || ML_CONFIG.serviceName,
        model_loaded: false,
        model_name: data.model_name,
        model_version: data.model_version,
        dataset_version: data.dataset_version,
        run_id: data.run_id,
        error_code: "MODEL_LOAD_ERROR",
        error_message: "FastAPI service is running, but model artifacts failed to load.",
        error_details: "Verify performance_model.pkl exists in artifacts directory.",
        api_url: ML_CONFIG.baseUrl,
      };
    }

    logML("Health check successful", {
      model_loaded: true,
      model_version: data.model_version,
      model_name: data.model_name,
    });

    return {
      state: "ONLINE",
      status: "healthy",
      service: data.service || ML_CONFIG.serviceName,
      model_loaded: true,
      model_name: data.model_name,
      model_version: data.model_version,
      dataset_version: data.dataset_version,
      run_id: data.run_id,
      api_url: ML_CONFIG.baseUrl,
    };
  } catch (error: unknown) {
    const err = error as Error | undefined;
    const isTimeout = err?.name === "AbortError";
    const errorCode: MLErrorCode = isTimeout ? "TIMEOUT" : "CONNECTION_REFUSED";
    logML("Health check failed", { code: errorCode, error: String(error) });

    return {
      state: "OFFLINE",
      status: "offline",
      service: ML_CONFIG.serviceName,
      model_loaded: false,
      error_code: errorCode,
      error_message: isTimeout
        ? "Health check timed out. ML service may be starting up."
        : "ML prediction service is not running or unreachable.",
      error_details: `Failed to connect to ${url}`,
      api_url: ML_CONFIG.baseUrl,
    };
  }
}

/**
 * Retrieves public telemetry, training metadata, and benchmark evidence.
 */
export async function getModelInfo(): Promise<MLModelInfo | null> {
  try {
    const res = await fetchML(ML_CONFIG.endpoints.modelInfo, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    return await res.json();
  } catch (error) {
    logML("Error fetching model info", { error: String(error) });
    return null;
  }
}

/**
 * Sends student academic parameters to the FastAPI ML service for regression prediction
 * and SHAP feature attribution generation.
 */
export async function predictPerformance(
  features: PredictionFeatureInput
): Promise<MLPredictionResponse> {
  // Client-side validation prior to sending
  const validation = validateAcademicInputs(features);
  if (!validation.valid) {
    throw new MLError(validation.error || "Invalid academic inputs.", "422_VALIDATION_ERROR", 422);
  }

  logML("Prediction request started");
  const res = await fetchML(ML_CONFIG.endpoints.predict, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(features),
  });

  const data: MLPredictionResponse = await res.json();
  logML("Prediction successful", {
    predicted_score: data.predicted_score,
    grade: data.predicted_grade,
    risk: data.risk_level,
    model_version: data.model_version,
  });

  return data;
}

/**
 * Executes What-If Performance Simulation:
 * Sends baseline and hypothetical features to FastAPI /simulate endpoint.
 */
export async function simulatePerformance(
  request: SimulationRequest
): Promise<SimulationResponse> {
  logML("Simulation request started");
  const res = await fetchML(ML_CONFIG.endpoints.simulate, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  const data: SimulationResponse = await res.json();
  logML("Simulation successful", {
    difference: data.difference,
    simulated_prediction: data.simulated_prediction,
  });

  return data;
}

/**
 * Generates structured, evidence-based academic insights across Strengths,
 * Improvement Areas, Trends, and Recommendations.
 */
export async function generateMLInsights(
  request: InsightGenerationRequest
): Promise<InsightGenerationResponse> {
  const res = await fetchML(ML_CONFIG.endpoints.insightsGenerate, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  return await res.json();
}
