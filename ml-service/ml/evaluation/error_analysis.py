"""
LearnTrack ML: Comprehensive Model Error Analysis Engine
Coordinates global error metrics, residual distributions, performance range segments,
feature segments, and largest prediction errors table for Benchmark and Production regimes.
"""

import os
import json
import datetime
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd

from ml.evaluation.residuals import analyze_residuals, compute_residuals
from ml.evaluation.segment_analysis import analyze_performance_ranges, analyze_feature_segments

try:
    from app.core.config import settings
    STORAGE_DIR = os.path.join(settings.ARTIFACTS_DIR, "error_analysis")
except Exception:
    STORAGE_DIR = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "artifacts", "error_analysis")
    )

ERROR_WARNING_THRESHOLD = 8.0
ERROR_LARGE_THRESHOLD = 15.0


def classify_error_tier(abs_error: float) -> str:
    """Neutral error categorization without pejorative labeling."""
    if abs_error <= ERROR_WARNING_THRESHOLD:
        return "Typical Error"
    elif abs_error <= ERROR_LARGE_THRESHOLD:
        return "Elevated Error"
    else:
        return "Large Error"


class ErrorAnalysisEngine:
    def __init__(self, storage_dir: Optional[str] = None):
        self.storage_dir = storage_dir or STORAGE_DIR
        os.makedirs(self.storage_dir, exist_ok=True)
        self.benchmark_report_path = os.path.join(self.storage_dir, "benchmark_report.json")
        self.production_report_path = os.path.join(self.storage_dir, "production_report.json")

    def analyze(
        self,
        actual: np.ndarray,
        predicted: np.ndarray,
        features_df: Optional[pd.DataFrame] = None,
        model_name: str = "Champion Model",
        model_version: str = "1",
        dataset_version: str = "1.0.0",
        run_id: Optional[str] = None,
        evaluation_type: str = "BENCHMARK",
        max_largest_errors: int = 15,
        timestamps: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Executes end-to-end model error analysis across all dimensions.
        """
        actual = np.asarray(actual, dtype=float)
        predicted = np.asarray(predicted, dtype=float)

        sample_count = len(actual)
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

        if sample_count == 0:
            return {
                "evaluation_type": evaluation_type,
                "status": "INSUFFICIENT_DATA",
                "sample_count": 0,
                "message": "No labeled observations available for error analysis.",
                "timestamp": now_iso,
                "model_name": model_name,
                "model_version": model_version,
                "run_id": run_id,
                "metrics": {},
                "performance_ranges": [],
                "feature_segments": {},
                "residual_analysis": {},
                "largest_errors": [],
            }

        # 1. Error Arrays
        res_calc = compute_residuals(actual, predicted)
        errors = res_calc["error"]
        abs_errors = res_calc["absolute_error"]

        mae = float(np.mean(abs_errors))
        rmse = float(np.sqrt(np.mean(errors ** 2)))
        mean_err = float(np.mean(errors))
        median_err = float(np.median(errors))
        median_abs_err = float(np.median(abs_errors))
        max_abs_err = float(np.max(abs_errors))

        # R² Calculation
        tot_var = float(np.sum((actual - np.mean(actual)) ** 2))
        res_var = float(np.sum(errors ** 2))
        r2 = round(float(1 - (res_var / tot_var)), 4) if tot_var > 0 else 0.0

        global_metrics = {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "r2": r2,
            "mean_error": round(mean_err, 2),
            "median_error": round(median_err, 2),
            "median_absolute_error": round(median_abs_err, 2),
            "max_absolute_error": round(max_abs_err, 2),
            "sample_count": sample_count,
        }

        # 2. Performance Range Segments
        range_segments = analyze_performance_ranges(actual, predicted)

        # 3. Feature Segments (if features provided)
        if features_df is not None and len(features_df) == sample_count:
            feature_segments = analyze_feature_segments(actual, predicted, features_df)
        else:
            feature_segments = {}

        # 4. Residual Distribution & Diagnostics
        residual_data = analyze_residuals(actual, predicted)

        # 5. Largest Prediction Errors (Anonymized, PII-protected)
        sorted_indices = np.argsort(abs_errors)[::-1][:max_largest_errors]
        largest_errors = []
        for rank, idx in enumerate(sorted_indices, 1):
            act_val = round(float(actual[idx]), 1)
            pred_val = round(float(predicted[idx]), 1)
            e_val = round(float(errors[idx]), 1)
            ae_val = round(float(abs_errors[idx]), 1)
            ts = timestamps[idx] if (timestamps and idx < len(timestamps)) else now_iso

            largest_errors.append({
                "rank": rank,
                "actual": act_val,
                "predicted": pred_val,
                "error": e_val,
                "absolute_error": ae_val,
                "error_tier": classify_error_tier(ae_val),
                "model_version": model_version,
                "timestamp": ts,
            })

        report = {
            "evaluation_type": evaluation_type,
            "status": "COMPLETED",
            "timestamp": now_iso,
            "sample_count": sample_count,
            "model_name": model_name,
            "model_version": model_version,
            "dataset_version": dataset_version,
            "run_id": run_id,
            "thresholds": {
                "warning_threshold": ERROR_WARNING_THRESHOLD,
                "large_threshold": ERROR_LARGE_THRESHOLD,
            },
            "metrics": global_metrics,
            "performance_ranges": range_segments,
            "feature_segments": feature_segments,
            "residual_analysis": residual_data,
            "largest_errors": largest_errors,
        }

        # Persist report
        target_path = self.benchmark_report_path if evaluation_type == "BENCHMARK" else self.production_report_path
        with open(target_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)

        return report

    def get_benchmark_report(self) -> Optional[Dict[str, Any]]:
        """Retrieves cached benchmark test set error analysis."""
        if os.path.exists(self.benchmark_report_path):
            try:
                with open(self.benchmark_report_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[ErrorAnalysisEngine] Error loading benchmark report: {e}")
        return None

    def get_production_report(self) -> Optional[Dict[str, Any]]:
        """Retrieves cached production operational error analysis."""
        if os.path.exists(self.production_report_path):
            try:
                with open(self.production_report_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[ErrorAnalysisEngine] Error loading production report: {e}")
        return None


error_analysis_engine = ErrorAnalysisEngine()
