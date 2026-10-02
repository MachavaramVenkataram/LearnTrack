/**
 * LearnTrack ML Operations & Monitoring API Client
 * Provides typed access to MLflow experiments, model registry, real-time prediction
 * telemetry, feedback error monitoring, and data drift detection endpoints.
 */

import { ML_CONFIG } from "@/lib/ml/config";

const API_BASE_URL = ML_CONFIG.baseUrl;

export interface ExperimentSummary {
  run_id: string;
  run_name: string | null;
  model_name: string;
  dataset_version: string;
  dataset_hash?: string | null;
  status: string;
  start_time: string | number | null;
  end_time?: string | number | null;
  val_mae: number | null;
  val_rmse: number | null;
  val_r2: number | null;
  test_mae: number | null;
  test_rmse: number | null;
  test_r2: number | null;
  metrics?: Record<string, number>;
  parameters: Record<string, unknown>;
  params?: Record<string, unknown>;
  tags: Record<string, string>;
  is_champion?: boolean;
}

export interface ExperimentArtifact {
  path: string;
  is_dir: boolean;
  file_size?: number;
}

export interface ExperimentDetail {
  run_id: string;
  run_name: string | null;
  model_name: string;
  dataset_version: string;
  dataset_hash: string | null;
  status: string;
  start_time: number | string | null;
  end_time: number | string | null;
  params?: Record<string, string>;
  parameters?: Record<string, unknown>;
  metrics: Record<string, number>;
  tags: Record<string, string>;
  artifacts: Array<string | { path: string; is_dir?: boolean }>;
  artifact_uri?: string | null;
  is_champion?: boolean;
}

export interface ExperimentComparison {
  runs: ExperimentDetail[];
  metric_keys: string[];
  parameter_keys: string[];
}

export interface ModelVersionSummary {
  name: string;
  version: string;
  run_id: string;
  current_stage: string;
  status: string;
  creation_timestamp?: number;
  last_updated_timestamp?: number;
  description?: string;
  source?: string;
}

export interface ProductionModelInfo {
  model_name: string;
  model_version: string;
  dataset_version: string;
  run_id: string;
  stage: string;
  is_production: boolean;
  status: string;
  source: string;
}

export interface ErrorMetrics {
  mae: number | null;
  rmse: number | null;
  r2: number | null;
  mean_error: number | null;
  median_absolute_error: number | null;
  max_error: number | null;
  insufficient_data: boolean;
  message: string | null;
}

export interface LatencyMetrics {
  avg_latency_ms: number;
  median_latency_ms: number;
  p95_latency_ms: number;
  sample_count: number;
}

export interface MonitoringSummary {
  window_days: number;
  prediction_count: number;
  feedback_count: number;
  coverage_percentage: number;
  error_metrics: ErrorMetrics | null;
  latency_metrics: LatencyMetrics | null;
  alert_level: "NORMAL" | "WARNING" | "CRITICAL";
  insufficient_data: boolean;
  message: string | null;
}

export interface FeatureDriftItem {
  feature_name: string;
  feature_type: string;
  drift_metric: string;
  metric_value: number | null;
  ks_statistic: number | null;
  p_value: number | null;
  status: "Low Drift" | "Moderate Drift" | "High Drift" | "Insufficient Data";
  reference_mean: number | null;
  current_mean: number | null;
}

export interface PredictionDriftSummary {
  reference_mean: number;
  reference_std: number;
  current_mean: number | null;
  current_std: number | null;
  mean_difference: number | null;
  drift_status: "Low Drift" | "Moderate Drift" | "High Drift" | "Insufficient Data";
}

export interface DriftReport {
  window_days: number;
  observations_count: number;
  feature_drifts: FeatureDriftItem[];
  prediction_drift: PredictionDriftSummary;
  overall_status: "NORMAL" | "WARNING" | "CRITICAL";
  insufficient_data: boolean;
  message: string | null;
}

export interface PredictionLogItem {
  prediction_id: string;
  timestamp: string;
  model_name: string;
  model_version: string;
  dataset_version: string;
  prediction: number;
  latency_ms: number;
  actual_value: number | null;
  error: number | null;
  has_feedback: boolean;
}

export interface FeedbackSubmissionRequest {
  prediction_id: string;
  actual_score: number;
  notes?: string;
}

export interface FeedbackSubmissionResponse {
  prediction_id: string;
  actual_score: number;
  error: number;
  absolute_error: number;
  timestamp: string;
  status: string;
}

// -----------------------------------------------------------------------------
// API CALLS
// -----------------------------------------------------------------------------

/**
 * Fetch all experiment runs from MLflow tracking.
 */
export async function getExperiments(): Promise<ExperimentSummary[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/experiments`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    return data.map((item: ExperimentSummary & { metrics?: Record<string, number>; params?: Record<string, unknown> }) => ({
      ...item,
      val_mae: item.val_mae ?? item.metrics?.val_mae ?? null,
      val_rmse: item.val_rmse ?? item.metrics?.val_rmse ?? null,
      val_r2: item.val_r2 ?? item.metrics?.val_r2 ?? null,
      test_mae: item.test_mae ?? item.metrics?.test_mae ?? null,
      test_rmse: item.test_rmse ?? item.metrics?.test_rmse ?? null,
      test_r2: item.test_r2 ?? item.metrics?.test_r2 ?? null,
      parameters: item.parameters ?? item.params ?? {},
      tags: item.tags ?? {},
      is_champion: item.is_champion === true || item.tags?.is_champion === "true" || item.tags?.champion === "true",
    }));
  } catch (err) {
    console.error("[MLOps] Failed to fetch experiments:", err);
    return [];
  }
}

/**
 * Fetch detailed metrics, parameters, tags, and artifacts for a single run.
 */
export async function getExperimentDetail(runId: string): Promise<ExperimentDetail | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/experiments/${encodeURIComponent(runId)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`[MLOps] Failed to fetch experiment ${runId}:`, err);
    return null;
  }
}

/**
 * Compare multiple runs side-by-side.
 */
export async function compareExperiments(runIds: string[]): Promise<ExperimentComparison | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/experiments/compare?run_ids=${encodeURIComponent(runIds.join(","))}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[MLOps] Failed to compare experiments:", err);
    return null;
  }
}

/**
 * Fetch all registered models from MLflow Model Registry.
 */
export async function getRegisteredModels(): Promise<ModelVersionSummary[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/registry/models`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[MLOps] Failed to fetch registered models:", err);
    return [];
  }
}

/**
 * Fetch active production model metadata.
 */
export async function getProductionModel(): Promise<ProductionModelInfo | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/registry/production`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[MLOps] Failed to fetch production model:", err);
    return null;
  }
}

/**
 * Fetch production monitoring summary over a rolling day window.
 */
export async function getMonitoringSummary(days: number = 30): Promise<MonitoringSummary | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/monitoring/summary?days=${days}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[MLOps] Failed to fetch monitoring summary:", err);
    return null;
  }
}

/**
 * Fetch PSI & KS feature drift and prediction drift report.
 */
export async function getDriftReport(windowDays: number = 30): Promise<DriftReport | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/monitoring/drift?window_days=${windowDays}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[MLOps] Failed to fetch drift report:", err);
    return null;
  }
}

/**
 * Record actual student grade / exam outcome to track real-world error.
 */
export async function submitPredictionFeedback(
  data: FeedbackSubmissionRequest
): Promise<FeedbackSubmissionResponse> {
  const res = await fetch(`${API_BASE_URL}/monitoring/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.detail || `Feedback submission failed (status ${res.status})`);
  }
  return await res.json();
}

/**
 * Fetch recent production prediction logs (with privacy safeguards).
 */
export async function getRecentPredictions(limit: number = 50): Promise<PredictionLogItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/monitoring/predictions?limit=${limit}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[MLOps] Failed to fetch prediction logs:", err);
    return [];
  }
}

// ==============================================================================
// 1. DATA QUALITY & SCHEMA VALIDATION TYPES & API
// ==============================================================================

export interface DataQualityReport {
  status: string;
  overall_status: string;
  timestamp: string;
  dataset_version: string;
  total_rows: number;
  total_columns: number;
  numeric_columns: string[];
  categorical_columns: string[];
  missing_values: number;
  duplicate_rows: number;
  checks: {
    schema?: {
      status: string;
      missing_columns: string[];
      dtype_mismatches: Record<string, unknown>;
      target_present: boolean;
      required_columns_count: number;
      present_columns_count: number;
    };
    missing_values?: {
      status: string;
      total_missing_cells: number;
      missing_percentage_overall: number;
      feature_breakdown: Record<string, { missing_count: number; missing_percentage: number }>;
    };
    duplicates?: {
      status: string;
      duplicate_rows: number;
      duplicate_percentage: number;
    };
    ranges?: {
      status: string;
      violation_columns_count: number;
      details: Record<string, {
        min_allowed: number;
        max_allowed: number;
        below_min_count: number;
        above_max_count: number;
        violation_count: number;
        violation_percentage: number;
      }>;
    };
    categories?: {
      status: string;
      violations: Record<string, unknown>;
    };
    outliers?: {
      status: string;
      method: string;
      total_outliers: number;
      feature_details: Record<string, {
        q1: number;
        q3: number;
        iqr: number;
        lower_bound: number;
        upper_bound: number;
        outlier_count: number;
        outlier_percentage: number;
      }>;
    };
    target?: {
      status: string;
      statistics: {
        target_column: string;
        count: number;
        min: number;
        max: number;
        mean: number;
        median: number;
        std: number;
      };
    };
  };
  issues: string[];
  warnings: string[];
}

export interface DataQualityHistoryItem {
  timestamp?: string;
  dataset_version?: string;
  status?: string;
  total_rows?: number;
  total_columns?: number;
  missing_values?: number;
  duplicate_rows?: number;
  issues_count?: number;
  warnings_count?: number;
  filename?: string;
}

export async function getLatestDataQualityReport(): Promise<DataQualityReport | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/data-quality/latest`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[MLOps] Failed to fetch latest data quality report:", err);
    return null;
  }
}

export async function runDataQualityValidation(
  version: string = "1.0.0",
  enforceStrict: boolean = false
): Promise<DataQualityReport> {
  const res = await fetch(`${API_BASE_URL}/data-quality/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataset_version: version, enforce_strict: enforceStrict }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail?.message || err.detail || `Validation failed with status ${res.status}`);
  }
  return await res.json();
}

export async function getDataQualityHistory(): Promise<DataQualityHistoryItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/data-quality/history`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[MLOps] Failed to fetch data quality history:", err);
    return [];
  }
}

// ==============================================================================
// 2. MODEL ERROR ANALYSIS TYPES & API
// ==============================================================================

export interface RangeSegmentItem {
  range_label: string;
  range_min: number;
  range_max: number;
  prediction_count: number;
  insufficient_observations: boolean;
  message?: string | null;
  mae?: number | null;
  rmse?: number | null;
  mean_error?: number | null;
}

export interface FeatureSegmentItem {
  segment_label: string;
  min: number;
  max: number;
  count: number;
  insufficient_observations: boolean;
  message?: string | null;
  mae?: number | null;
  rmse?: number | null;
  mean_error?: number | null;
}

export interface DistributionBin {
  bin_label: string;
  bin_min: number;
  bin_max: number;
  count: number;
  percentage: number;
}

export interface ScatterPoint {
  actual: number;
  predicted: number;
  residual: number;
  absolute_error: number;
}

export interface ResidualAnalysisData {
  status: string;
  sample_count?: number;
  mean_residual?: number | null;
  median_residual?: number | null;
  std_residual?: number | null;
  skewness?: number | null;
  distribution_bins: DistributionBin[];
  scatter_points: ScatterPoint[];
  guidance: string[];
}

export interface LargestErrorItem {
  rank: number;
  actual: number;
  predicted: number;
  error: number;
  absolute_error: number;
  error_tier: string;
  model_version: string;
  timestamp: string;
}

export interface ErrorAnalysisReport {
  evaluation_type: "BENCHMARK" | "PRODUCTION";
  status: string;
  timestamp: string;
  sample_count: number;
  model_name: string;
  model_version: string;
  dataset_version: string;
  run_id?: string | null;
  message?: string | null;
  thresholds: {
    warning_threshold: number;
    large_threshold: number;
  };
  metrics: {
    mae?: number | null;
    rmse?: number | null;
    r2?: number | null;
    mean_error?: number | null;
    median_error?: number | null;
    median_absolute_error?: number | null;
    max_absolute_error?: number | null;
    sample_count: number;
  };
  performance_ranges: RangeSegmentItem[];
  feature_segments: Record<string, FeatureSegmentItem[]>;
  residual_analysis: ResidualAnalysisData;
  largest_errors: LargestErrorItem[];
}

export async function getErrorAnalysisSummary(
  evaluationType: "BENCHMARK" | "PRODUCTION" = "BENCHMARK"
): Promise<ErrorAnalysisReport | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/error-analysis/summary?evaluation_type=${evaluationType}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[MLOps] Failed to fetch error analysis summary:", err);
    return null;
  }
}

export async function getLargestErrors(
  evaluationType: "BENCHMARK" | "PRODUCTION" = "BENCHMARK",
  limit: number = 15
): Promise<LargestErrorItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/error-analysis/largest-errors?evaluation_type=${evaluationType}&limit=${limit}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[MLOps] Failed to fetch largest errors:", err);
    return [];
  }
}

// ==============================================================================
// 3. RETRAINING & MODEL LIFECYCLE TYPES & API
// ==============================================================================

export interface RetrainingCheckResponse {
  eligible: boolean;
  timestamp: string;
  trigger: string;
  reason: string;
  checks: Record<string, unknown>;
  new_samples_count: number;
  min_required_samples: number;
  drift_status: string;
  candidate_action: string;
}

export interface RetrainingRunResponse {
  status: string;
  candidate_version?: string | null;
  candidate_model_type?: string | null;
  candidate_run_id?: string | null;
  trigger: string;
  dataset_version: string;
  dataset_hash?: string | null;
  started_at: string;
  completed_at?: string | null;
  candidate_metrics: Record<string, unknown>;
  validation_status?: string | null;
  regression_evaluation?: Record<string, unknown> | null;
  failure_reason?: string | null;
}

export interface RetrainingStatusResponse {
  active_production_model: {
    model_name: string;
    model_version: string;
    model_type?: string;
    dataset_version: string;
    run_id?: string;
    test_rmse?: number;
    test_mae?: number;
  };
  data_availability: {
    feedback_observations: number;
    predictions_logged: number;
    min_required_for_retraining: number;
    status: string;
  };
  drift_status: {
    alert_level: string;
    evaluated_observations: number;
  };
  performance_status: {
    current_mae?: number | null;
    current_rmse?: number | null;
    status: string;
  };
  latest_retraining_run?: Record<string, unknown>;
  candidates_available: CandidateModelInfo[];
}

export interface CandidateModelInfo {
  candidate_version?: string;
  candidate_run_id?: string;
  model_type?: string;
  dataset_version?: string;
  test_metrics?: {
    rmse?: number;
    mae?: number;
    r2?: number;
  };
  metrics?: Record<string, number>;
  status?: string;
  [key: string]: unknown;
}

export interface ModelValidateResponse {
  candidate_version: string;
  status: string;
  is_validated: boolean;
  evaluation: Record<string, unknown>;
  message: string;
}

export interface ModelPromoteResponse {
  status: string;
  message: string;
  promoted_version: string;
  previous_version: string;
  audit_event: Record<string, unknown>;
}

export interface ModelRollbackResponse {
  status: string;
  message: string;
  active_version: string;
  previous_version: string;
  audit_event: Record<string, unknown>;
}

export interface AuditEventItem {
  timestamp: string;
  action: string;
  model_name: string;
  model_version: string;
  previous_version?: string | null;
  actor: string;
  reason: string;
  metadata: Record<string, unknown>;
}

export async function getRetrainingStatus(): Promise<RetrainingStatusResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/retraining/status`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[MLOps] Failed to fetch retraining status:", err);
    return null;
  }
}

export async function checkRetrainingEligibility(
  trigger: string = "manual"
): Promise<RetrainingCheckResponse> {
  const res = await fetch(`${API_BASE_URL}/retraining/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trigger }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Eligibility check failed with status ${res.status}`);
  }
  return await res.json();
}

export async function runRetraining(
  trigger: string = "manual",
  force: boolean = false
): Promise<RetrainingRunResponse> {
  const res = await fetch(`${API_BASE_URL}/retraining/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ trigger, force }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail?.reason || err.detail || `Retraining failed with status ${res.status}`);
  }
  return await res.json();
}

export async function getRetrainingHistory(): Promise<Array<Record<string, unknown>>> {
  try {
    const res = await fetch(`${API_BASE_URL}/retraining/history`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[MLOps] Failed to fetch retraining history:", err);
    return [];
  }
}

export async function validateCandidateModel(
  modelId: string,
  notes?: string
): Promise<ModelValidateResponse> {
  const res = await fetch(`${API_BASE_URL}/models/${modelId}/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Model validation failed with status ${res.status}`);
  }
  return await res.json();
}

export async function promoteCandidateModel(
  modelId: string,
  actor: string = "admin",
  reason: string = "Explicit administrator promotion"
): Promise<ModelPromoteResponse> {
  const res = await fetch(`${API_BASE_URL}/models/${modelId}/promote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ actor, reason }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail?.error || err.detail || `Promotion failed with status ${res.status}`);
  }
  return await res.json();
}

export async function rollbackModel(
  targetVersion: string,
  actor: string = "admin",
  reason: string = "Rollback to designated previous baseline"
): Promise<ModelRollbackResponse> {
  const res = await fetch(`${API_BASE_URL}/models/rollback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target_version: targetVersion, actor, reason }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Rollback failed with status ${res.status}`);
  }
  return await res.json();
}

export async function getModelAuditLog(): Promise<AuditEventItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/models/audit-log`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("[MLOps] Failed to fetch model audit log:", err);
    return [];
  }
}

