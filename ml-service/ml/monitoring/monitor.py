"""
LearnTrack ML: Operational Monitoring & Drift Detection Engine
Tracks runtime predictions, feedback errors, operational latency,
and computes Population Stability Index (PSI) and Kolmogorov-Smirnov (KS) drift statistics.
"""

import os
import sys
import uuid
import datetime
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from scipy import stats

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
try:
    from app.core.config import settings
except ImportError:
    from core.config import settings


def calculate_psi(expected: np.ndarray, actual: np.ndarray, num_bins: int = 5) -> float:
    """
    Calculates Population Stability Index (PSI) between reference and current distributions.
    PSI = sum((Actual% - Expected%) * ln(Actual% / Expected%))
    """
    if len(expected) == 0 or len(actual) == 0:
        return 0.0

    # Quantile bin edges based on expected baseline
    quantiles = np.linspace(0, 100, num_bins + 1)
    bin_edges = np.percentile(expected, quantiles)
    # Ensure strictly increasing bin edges
    bin_edges[0] = -np.inf
    bin_edges[-1] = np.inf

    expected_counts, _ = np.histogram(expected, bins=bin_edges)
    actual_counts, _ = np.histogram(actual, bins=bin_edges)

    # Convert to proportions with epsilon smoothing
    eps = 1e-4
    expected_pct = (expected_counts + eps) / (len(expected) + eps * num_bins)
    actual_pct = (actual_counts + eps) / (len(actual) + eps * num_bins)

    psi_val = np.sum((actual_pct - expected_pct) * np.log(actual_pct / expected_pct))
    return float(round(psi_val, 4))


class PredictionMonitor:
    def __init__(self, data_dir: Optional[str] = None):
        self.data_dir = data_dir or settings.DATA_DIR
        self._predictions: List[Dict[str, Any]] = []
        self._reference_data: Optional[pd.DataFrame] = None
        self._load_reference_data()

    def _load_reference_data(self):
        """Loads baseline reference training dataset for distribution comparison."""
        ref_path = os.path.join(self.data_dir, "processed", "academic_performance.csv")
        if os.path.exists(ref_path):
            try:
                self._reference_data = pd.read_csv(ref_path)
            except Exception as e:
                print(f"[PredictionMonitor] Warning loading reference data: {e}")

    def log_prediction(
        self,
        model_name: str,
        model_version: str,
        dataset_version: str,
        run_id: str,
        prediction: float,
        features: Dict[str, Any],
        latency_ms: float = 0.0,
        student_id: Optional[str] = None,
    ) -> str:
        """Records an operational prediction event."""
        pred_id = f"pred-{uuid.uuid4().hex[:12]}"
        now = datetime.datetime.now(datetime.timezone.utc)

        record = {
            "prediction_id": pred_id,
            "student_id": student_id,
            "timestamp": now.isoformat(),
            "created_at": now,
            "model_name": model_name,
            "model_version": model_version,
            "dataset_version": dataset_version,
            "run_id": run_id,
            "prediction": round(float(prediction), 2),
            "features": features,
            "latency_ms": round(float(latency_ms), 2),
            "actual_value": None,
            "error": None,
        }
        self._predictions.append(record)
        return pred_id

    def add_feedback(self, prediction_id: str, actual_value: float) -> Optional[Dict[str, Any]]:
        """Associates actual student outcome with a previous prediction and calculates error."""
        for p in self._predictions:
            if p["prediction_id"] == prediction_id:
                p["actual_value"] = round(float(actual_value), 2)
                p["error"] = round(float(actual_value - p["prediction"]), 2)
                return p
        return None

    def get_predictions(self, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """Returns safe operational prediction logs without exposing sensitive student secrets."""
        safe_logs = []
        for p in reversed(self._predictions):
            safe_logs.append({
                "prediction_id": p["prediction_id"],
                "timestamp": p["timestamp"],
                "model_name": p["model_name"],
                "model_version": p["model_version"],
                "dataset_version": p["dataset_version"],
                "run_id": p["run_id"],
                "prediction": p["prediction"],
                "actual_value": p["actual_value"],
                "error": p["error"],
                "latency_ms": p["latency_ms"],
            })
        return safe_logs[offset:offset + limit]

    def get_summary(self, days: int = 30) -> Dict[str, Any]:
        """Calculates operational monitoring metrics over the specified time window."""
        cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=days)
        recent = [
            p for p in self._predictions
            if p.get("created_at") and p["created_at"] >= cutoff
        ]

        total_preds = len(recent)
        feedback_list = [p for p in recent if p["actual_value"] is not None]
        feedback_count = len(feedback_list)

        coverage = round((feedback_count / total_preds * 100), 1) if total_preds > 0 else 0.0

        # Latency statistics
        latencies = [p["latency_ms"] for p in recent if p.get("latency_ms") is not None]
        if latencies:
            avg_latency = round(float(np.mean(latencies)), 2)
            median_latency = round(float(np.median(latencies)), 2)
            p95_latency = round(float(np.percentile(latencies, 95)), 2)
        else:
            avg_latency = median_latency = p95_latency = 0.0

        # Error metrics (only if sufficient observations exist)
        if feedback_count >= settings.MIN_OBSERVATIONS_FOR_ERROR_METRICS:
            errors = np.array([p["error"] for p in feedback_list])
            abs_errors = np.abs(errors)
            actuals = np.array([p["actual_value"] for p in feedback_list])
            preds = np.array([p["prediction"] for p in feedback_list])

            mae = round(float(np.mean(abs_errors)), 3)
            rmse = round(float(np.sqrt(np.mean(errors ** 2))), 3)
            mean_error = round(float(np.mean(errors)), 3)
            median_abs_error = round(float(np.median(abs_errors)), 3)
            max_error = round(float(np.max(abs_errors)), 3)

            # R2 score
            total_variance = np.sum((actuals - np.mean(actuals)) ** 2)
            if total_variance > 0:
                residual_variance = np.sum(errors ** 2)
                r2 = round(float(1 - (residual_variance / total_variance)), 4)
            else:
                r2 = None

            error_status = "Available"
        else:
            mae = rmse = mean_error = median_abs_error = max_error = r2 = None
            error_status = "Insufficient observations for reliable error metrics"

        return {
            "monitoring_window_days": days,
            "prediction_count": total_preds,
            "feedback_count": feedback_count,
            "feedback_coverage_pct": coverage,
            "latency": {
                "average_ms": avg_latency,
                "median_ms": median_latency,
                "p95_ms": p95_latency,
            },
            "error_metrics": {
                "status": error_status,
                "mae": mae,
                "rmse": rmse,
                "r2": r2,
                "mean_error": mean_error,
                "median_absolute_error": median_abs_error,
                "max_error": max_error,
            },
            "minimum_feedback_required": settings.MIN_OBSERVATIONS_FOR_ERROR_METRICS,
        }

    def get_drift_report(self) -> Dict[str, Any]:
        """
        Calculates Population Stability Index (PSI) and distribution shifts across input features.
        Compares baseline training reference against current production predictions.
        """
        if self._reference_data is None:
            self._load_reference_data()

        if self._reference_data is None:
            return {
                "status": "UNAVAILABLE",
                "message": "Reference baseline dataset is not loaded.",
                "feature_drift": [],
                "prediction_drift": None,
                "alert_level": "NORMAL",
            }

        prod_count = len(self._predictions)
        if prod_count < settings.MIN_OBSERVATIONS_FOR_DRIFT:
            return {
                "status": "INSUFFICIENT_DATA",
                "message": (
                    f"Insufficient observations for reliable monitoring ({prod_count}/{settings.MIN_OBSERVATIONS_FOR_DRIFT} "
                    "predictions recorded). Monitoring will activate automatically after sufficient sample accumulation."
                ),
                "prediction_count": prod_count,
                "minimum_required": settings.MIN_OBSERVATIONS_FOR_DRIFT,
                "feature_drift": [],
                "prediction_drift": None,
                "alert_level": "NORMAL",
            }

        # Extract features from production predictions
        feat_keys = [
            "attendance_percentage",
            "internal_marks",
            "assignment_score",
            "previous_score",
            "study_hours",
            "assignments_completed",
        ]

        feature_reports = []
        max_psi = 0.0

        for key in feat_keys:
            # Map schema keys to reference dataset columns
            ref_col_map = {
                "attendance_percentage": "attendance_percentage",
                "internal_marks": "internal_marks",
                "assignment_score": "assignment_marks",
                "previous_score": "previous_score",
                "study_hours": "study_hours_per_week",
                "assignments_completed": "assignments_completed",
            }
            ref_col = ref_col_map.get(key, key)

            if ref_col not in self._reference_data.columns:
                continue

            ref_vals = self._reference_data[ref_col].dropna().values
            curr_vals = np.array([
                p["features"].get(key, 0.0) for p in self._predictions
                if p.get("features") and key in p["features"]
            ])

            if len(curr_vals) == 0:
                continue

            psi_val = calculate_psi(ref_vals, curr_vals, num_bins=5)
            max_psi = max(max_psi, psi_val)

            # Kolmogorov-Smirnov 2-sample test
            ks_stat, ks_pval = stats.ks_2samp(ref_vals, curr_vals)

            # Drift tier
            if psi_val < settings.DRIFT_WARNING_THRESHOLD:
                tier = "Low Drift"
            elif psi_val < settings.DRIFT_CRITICAL_THRESHOLD:
                tier = "Moderate Drift"
            else:
                tier = "High Drift"

            feature_reports.append({
                "feature_name": key.replace("_", " ").title(),
                "feature_type": "Numerical",
                "metric_name": "PSI",
                "metric_value": psi_val,
                "ks_statistic": round(float(ks_stat), 4),
                "ks_pvalue": round(float(ks_pval), 4),
                "status": tier,
                "reference_mean": round(float(np.mean(ref_vals)), 2),
                "current_mean": round(float(np.mean(curr_vals)), 2),
                "reference_std": round(float(np.std(ref_vals)), 2),
                "current_std": round(float(np.std(curr_vals)), 2),
            })

        # Prediction distribution drift
        ref_target = self._reference_data["final_score"].dropna().values
        curr_preds = np.array([p["prediction"] for p in self._predictions])

        pred_psi = calculate_psi(ref_target, curr_preds, num_bins=5)
        pred_drift = {
            "metric_name": "PSI",
            "metric_value": pred_psi,
            "reference_mean": round(float(np.mean(ref_target)), 2),
            "reference_std": round(float(np.std(ref_target)), 2),
            "reference_median": round(float(np.median(ref_target)), 2),
            "reference_min": round(float(np.min(ref_target)), 2),
            "reference_max": round(float(np.max(ref_target)), 2),
            "current_mean": round(float(np.mean(curr_preds)), 2),
            "current_std": round(float(np.std(curr_preds)), 2),
            "current_median": round(float(np.median(curr_preds)), 2),
            "current_min": round(float(np.min(curr_preds)), 2),
            "current_max": round(float(np.max(curr_preds)), 2),
            "mean_shift": round(float(np.mean(curr_preds) - np.mean(ref_target)), 2),
            "status": "Low Drift" if pred_psi < settings.DRIFT_WARNING_THRESHOLD else (
                "Moderate Drift" if pred_psi < settings.DRIFT_CRITICAL_THRESHOLD else "High Drift"
            ),
        }

        # Overall Alert Level
        if max_psi >= settings.DRIFT_CRITICAL_THRESHOLD or pred_psi >= settings.DRIFT_CRITICAL_THRESHOLD:
            alert_level = "CRITICAL"
        elif max_psi >= settings.DRIFT_WARNING_THRESHOLD or pred_psi >= settings.DRIFT_WARNING_THRESHOLD:
            alert_level = "WARNING"
        else:
            alert_level = "NORMAL"

        return {
            "status": "ACTIVE",
            "alert_level": alert_level,
            "observations_evaluated": prod_count,
            "warning_threshold": settings.DRIFT_WARNING_THRESHOLD,
            "critical_threshold": settings.DRIFT_CRITICAL_THRESHOLD,
            "feature_drift": feature_reports,
            "prediction_drift": pred_drift,
        }

prediction_monitor = PredictionMonitor()
