"""
LearnTrack ML: Operational Monitoring & Drift Detection Route
Exposes operational prediction metrics, Population Stability Index (PSI) drift reports,
latency percentiles, and feedback error ingestion.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.schemas.monitoring import (
    FeedbackRequest,
    FeedbackResponse,
    MonitoringSummaryResponse,
    DriftReportResponse,
    PredictionLogItem,
)
from ml.monitoring.monitor import prediction_monitor

router = APIRouter(prefix="/monitoring", tags=["ML Monitoring & Drift"])

@router.get("/summary", response_model=MonitoringSummaryResponse)
def get_monitoring_summary(days: int = Query(30, ge=1, le=365)) -> MonitoringSummaryResponse:
    """
    Returns operational summary: prediction counts, feedback coverage,
    real-world error metrics (MAE, RMSE, R²), and latency percentiles (avg, median, p95).
    """
    summary = prediction_monitor.get_summary(days=days)
    return MonitoringSummaryResponse(**summary)


@router.get("/drift", response_model=DriftReportResponse)
def get_drift_report() -> DriftReportResponse:
    """
    Calculates feature drift (PSI and KS-test) comparing baseline training dataset
    against recent production predictions. Includes prediction distribution drift and alert level.
    """
    report = prediction_monitor.get_drift_report()
    return DriftReportResponse(**report)


@router.post("/feedback", response_model=FeedbackResponse)
def submit_prediction_feedback(request: FeedbackRequest) -> FeedbackResponse:
    """
    Associates an actual recorded student grade with a previous prediction.
    Enables tracking of real-world generalization error.
    """
    updated = prediction_monitor.add_feedback(
        prediction_id=request.prediction_id,
        actual_value=request.actual_score,
    )
    if not updated:
        raise HTTPException(
            status_code=404,
            detail=f"Prediction ID '{request.prediction_id}' was not found in active operational logs."
        )

    return FeedbackResponse(
        prediction_id=updated["prediction_id"],
        predicted_score=updated["prediction"],
        actual_score=updated["actual_value"],
        error=updated["error"],
        message="Feedback logged successfully. Error metric recorded.",
    )


@router.get("/predictions", response_model=List[PredictionLogItem])
def get_recent_prediction_logs(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> List[PredictionLogItem]:
    """
    Returns safe, paginated operational prediction logs.
    Excludes sensitive student identity information.
    """
    logs = prediction_monitor.get_predictions(limit=limit, offset=offset)
    return [PredictionLogItem(**log) for log in logs]
