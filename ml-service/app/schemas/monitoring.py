"""
LearnTrack ML: Monitoring & Drift Schemas
Defines request and response models for /monitoring endpoints.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class FeedbackRequest(BaseModel):
    prediction_id: str = Field(..., description="ID of the previous prediction to associate with actual outcome")
    actual_score: float = Field(..., ge=0.0, le=100.0, description="Actual recorded academic outcome score")

class FeedbackResponse(BaseModel):
    prediction_id: str
    predicted_score: float
    actual_score: float
    error: float
    message: str

class LatencyStats(BaseModel):
    average_ms: float
    median_ms: float
    p95_ms: float

class ErrorMetrics(BaseModel):
    status: str
    mae: Optional[float] = None
    rmse: Optional[float] = None
    r2: Optional[float] = None
    mean_error: Optional[float] = None
    median_absolute_error: Optional[float] = None
    max_error: Optional[float] = None

class MonitoringSummaryResponse(BaseModel):
    monitoring_window_days: int
    prediction_count: int
    feedback_count: int
    feedback_coverage_pct: float
    latency: LatencyStats
    error_metrics: ErrorMetrics
    minimum_feedback_required: int

class FeatureDriftItem(BaseModel):
    feature_name: str
    feature_type: str
    metric_name: str
    metric_value: float
    ks_statistic: float
    ks_pvalue: float
    status: str
    reference_mean: float
    current_mean: float
    reference_std: float
    current_std: float

class PredictionDriftSummary(BaseModel):
    metric_name: str
    metric_value: float
    reference_mean: float
    reference_std: float
    reference_median: float
    reference_min: float
    reference_max: float
    current_mean: float
    current_std: float
    current_median: float
    current_min: float
    current_max: float
    mean_shift: float
    status: str

class DriftReportResponse(BaseModel):
    status: str
    alert_level: str
    observations_evaluated: Optional[int] = None
    message: Optional[str] = None
    warning_threshold: float = 0.10
    critical_threshold: float = 0.25
    feature_drift: List[FeatureDriftItem] = Field(default_factory=list)
    prediction_drift: Optional[PredictionDriftSummary] = None

class PredictionLogItem(BaseModel):
    prediction_id: str
    timestamp: str
    model_name: str
    model_version: str
    dataset_version: str
    run_id: str
    prediction: float
    actual_value: Optional[float] = None
    error: Optional[float] = None
    latency_ms: Optional[float] = None
