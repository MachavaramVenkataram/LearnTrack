"""
LearnTrack ML: Model Error Analysis Route
Exposes residual distributions, performance range segments, feature segments,
and largest prediction errors for Benchmark (test set) and Production (real feedback).
"""

import os
import datetime
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional

from app.schemas.error_analysis import (
    ErrorAnalysisReportResponse,
    LargestErrorItem,
    RangeSegmentItem,
    FeatureSegmentItem,
    ResidualAnalysisData,
)
from ml.evaluation.error_analysis import error_analysis_engine
from ml.monitoring.monitor import prediction_monitor
from app.services.model_service import model_service
from ml.preprocessing.preprocessing import split_academic_data
from ml.features.feature_engineering import engineer_features
from app.core.config import settings

router = APIRouter(prefix="/error-analysis", tags=["Model Error Analysis"])


def _get_or_generate_benchmark_report() -> Dict[str, Any]:
    """Retrieves cached benchmark test set error analysis, or generates one from test split."""
    cached = error_analysis_engine.get_benchmark_report()
    if cached:
        return cached

    # Run on held-out test split of reference dataset
    data_path = os.path.join(settings.DATA_DIR, "processed", "academic_performance.csv")
    if not os.path.exists(data_path):
        raise HTTPException(status_code=404, detail="Reference academic dataset not found.")

    df = pd.read_csv(data_path)
    _, _, _, _, X_test_raw, y_test = split_academic_data(
        df, target_col="final_score", test_size=0.15, val_size=0.15, random_state=42
    )

    pipeline = model_service.get_pipeline()
    scaler = pipeline["scaler"]
    model = pipeline["model"]

    X_test_feat = engineer_features(X_test_raw)
    X_test_scaled = scaler.transform(X_test_feat)
    preds = model.predict(X_test_scaled)

    report = error_analysis_engine.analyze(
        actual=y_test.values,
        predicted=preds,
        features_df=X_test_raw.reset_index(drop=True),
        model_name=pipeline.get("champion_name", "Champion Model"),
        model_version=str(pipeline.get("version", "1")),
        dataset_version="1.0.0",
        evaluation_type="BENCHMARK",
    )
    return report


def _get_or_generate_production_report() -> Dict[str, Any]:
    """Generates production error analysis from real-world feedback logged in PredictionMonitor."""
    feedback_preds = [
        p for p in prediction_monitor._predictions
        if p.get("actual_value") is not None
    ]

    min_required = settings.MIN_OBSERVATIONS_FOR_ERROR_METRICS
    if len(feedback_preds) < min_required:
        meta = model_service.get_metadata()
        return {
            "evaluation_type": "PRODUCTION",
            "status": "INSUFFICIENT_DATA",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "sample_count": len(feedback_preds),
            "model_name": meta.get("model_name", settings.PRODUCTION_MODEL_NAME),
            "model_version": meta.get("model_version", settings.PRODUCTION_MODEL_VERSION),
            "dataset_version": meta.get("dataset_version", "1.0.0"),
            "run_id": meta.get("run_id"),
            "message": (
                f"Insufficient production observations for reliable error analysis "
                f"({len(feedback_preds)}/{min_required} feedback samples collected). "
                "Production error analysis activates automatically once minimum feedback threshold is reached."
            ),
            "thresholds": {"warning_threshold": 8.0, "large_threshold": 15.0},
            "metrics": {
                "sample_count": len(feedback_preds),
                "mae": None,
                "rmse": None,
                "r2": None,
            },
            "performance_ranges": [],
            "feature_segments": {},
            "residual_analysis": {
                "status": "INSUFFICIENT_DATA",
                "sample_count": len(feedback_preds),
                "distribution_bins": [],
                "scatter_points": [],
                "guidance": ["Insufficient production observations."],
            },
            "largest_errors": [],
        }

    actuals = np.array([p["actual_value"] for p in feedback_preds])
    predicted = np.array([p["prediction"] for p in feedback_preds])
    timestamps = [p["timestamp"] for p in feedback_preds]

    # Reconstruct feature dataframe
    feature_rows = [p.get("features", {}) for p in feedback_preds]
    features_df = pd.DataFrame(feature_rows)

    meta = model_service.get_metadata()
    report = error_analysis_engine.analyze(
        actual=actuals,
        predicted=predicted,
        features_df=features_df if len(features_df) == len(actuals) else None,
        model_name=meta.get("model_name", settings.PRODUCTION_MODEL_NAME),
        model_version=meta.get("model_version", settings.PRODUCTION_MODEL_VERSION),
        dataset_version=meta.get("dataset_version", "1.0.0"),
        run_id=meta.get("run_id"),
        evaluation_type="PRODUCTION",
        timestamps=timestamps,
    )
    return report


@router.get("/summary", response_model=ErrorAnalysisReportResponse)
def get_error_analysis_summary(
    evaluation_type: str = Query("BENCHMARK", pattern="^(BENCHMARK|PRODUCTION)$")
) -> ErrorAnalysisReportResponse:
    """
    Returns full comprehensive error analysis report.
    Clearly distinguishes Benchmark/Test Error from Real-World Production Feedback Error.
    """
    if evaluation_type == "BENCHMARK":
        report = _get_or_generate_benchmark_report()
    else:
        report = _get_or_generate_production_report()

    return ErrorAnalysisReportResponse(**report)


@router.get("/segments")
def get_segment_error_breakdown(
    evaluation_type: str = Query("BENCHMARK", pattern="^(BENCHMARK|PRODUCTION)$")
) -> Dict[str, Any]:
    """
    Returns error metrics segmented across performance ranges (0-40, 40-60, 60-80, 80-100)
    and feature bands (attendance, study hours, previous scores).
    """
    report = _get_or_generate_benchmark_report() if evaluation_type == "BENCHMARK" else _get_or_generate_production_report()
    return {
        "evaluation_type": evaluation_type,
        "status": report.get("status"),
        "performance_ranges": report.get("performance_ranges", []),
        "feature_segments": report.get("feature_segments", {}),
    }


@router.get("/residuals")
def get_residual_analysis(
    evaluation_type: str = Query("BENCHMARK", pattern="^(BENCHMARK|PRODUCTION)$")
) -> Dict[str, Any]:
    """
    Returns residual distribution histogram bins, scatter points, and diagnostic interpretation guidance.
    """
    report = _get_or_generate_benchmark_report() if evaluation_type == "BENCHMARK" else _get_or_generate_production_report()
    return {
        "evaluation_type": evaluation_type,
        "status": report.get("status"),
        "residual_analysis": report.get("residual_analysis"),
    }


@router.get("/largest-errors", response_model=List[LargestErrorItem])
def get_largest_prediction_errors(
    evaluation_type: str = Query("BENCHMARK", pattern="^(BENCHMARK|PRODUCTION)$"),
    limit: int = Query(15, ge=1, le=50),
) -> List[LargestErrorItem]:
    """
    Returns the largest prediction errors sorted by absolute error descending.
    Excludes personal identifiers to protect student privacy.
    """
    report = _get_or_generate_benchmark_report() if evaluation_type == "BENCHMARK" else _get_or_generate_production_report()
    errors = report.get("largest_errors", [])[:limit]
    return [LargestErrorItem(**item) for item in errors]
