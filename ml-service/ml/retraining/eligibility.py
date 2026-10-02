"""
LearnTrack ML: Retraining Eligibility & Dry-Run Inspector
Validates triggers, sample volume thresholds, data quality checks,
drift conditions, and current production model readiness before any training executes.
"""

import os
import json
import datetime
from typing import Dict, Any, List, Optional
import pandas as pd

from ml.validation.quality import data_quality_validator
from ml.validation.drift import data_drift_validator
from ml.monitoring.monitor import prediction_monitor

try:
    from app.core.config import settings
    RETRAIN_MIN_NEW_SAMPLES = int(os.getenv("RETRAIN_MIN_NEW_SAMPLES", "10"))
    RETRAIN_DRIFT_THRESHOLD = float(os.getenv("RETRAIN_DRIFT_THRESHOLD", str(settings.DRIFT_CRITICAL_THRESHOLD)))
    RETRAIN_PERFORMANCE_THRESHOLD = float(os.getenv("RETRAIN_PERFORMANCE_THRESHOLD", "15.0"))
except Exception:
    RETRAIN_MIN_NEW_SAMPLES = 10
    RETRAIN_DRIFT_THRESHOLD = 0.25
    RETRAIN_PERFORMANCE_THRESHOLD = 15.0


class RetrainingEligibilityChecker:
    def __init__(
        self,
        min_new_samples: int = RETRAIN_MIN_NEW_SAMPLES,
        drift_threshold: float = RETRAIN_DRIFT_THRESHOLD,
        perf_threshold: float = RETRAIN_PERFORMANCE_THRESHOLD,
    ):
        self.min_new_samples = min_new_samples
        self.drift_threshold = drift_threshold
        self.perf_threshold = perf_threshold

    def check_eligibility(
        self,
        trigger: str = "manual",
        candidate_df: Optional[pd.DataFrame] = None,
        production_metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Executes a safe dry-run check of all retraining prerequisites.
        Returns a structured explanation of eligibility and action recommendations.
        """
        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
        checks: Dict[str, Any] = {}
        ineligible_reasons: List[str] = []

        # 1. New Labeled Data Availability
        summary = prediction_monitor.get_summary(days=90)
        feedback_count = summary.get("feedback_count", 0)
        new_samples_pass = feedback_count >= self.min_new_samples

        checks["labeled_samples"] = {
            "available_feedback_samples": feedback_count,
            "min_required_samples": self.min_new_samples,
            "status": "PASS" if new_samples_pass else ("INFO" if trigger == "manual" else "FAIL"),
            "message": (
                f"{feedback_count}/{self.min_new_samples} operational feedback observations available."
                if not new_samples_pass else f"Sufficient observations collected ({feedback_count})."
            )
        }

        # If trigger is specifically new_labeled_data, enforce threshold strictly
        if trigger == "new_labeled_data" and not new_samples_pass:
            ineligible_reasons.append(
                f"Insufficient new labeled observations ({feedback_count}/{self.min_new_samples} required)."
            )

        # 2. Production Model Readiness
        if production_metadata is None:
            from app.services.model_service import model_service
            try:
                production_metadata = model_service.get_metadata()
            except Exception:
                production_metadata = None

        has_prod_model = production_metadata is not None
        checks["production_model"] = {
            "model_version": production_metadata.get("model_version") if has_prod_model else None,
            "model_name": production_metadata.get("model_name") if has_prod_model else None,
            "status": "PASS" if has_prod_model else "FAIL",
            "message": "Production model metadata verified." if has_prod_model else "Active production model not found."
        }
        if not has_prod_model:
            ineligible_reasons.append("Active production model metadata is missing.")

        # 3. Data Quality & Schema Check
        if candidate_df is None:
            # Check reference dataset
            ref_path = os.path.join(settings.DATA_DIR, "processed", "academic_performance.csv")
            if os.path.exists(ref_path):
                try:
                    candidate_df = pd.read_csv(ref_path)
                except Exception as e:
                    candidate_df = None

        if candidate_df is None or len(candidate_df) == 0:
            checks["data_quality"] = {
                "status": "FAIL",
                "message": "Dataset not found or empty."
            }
            ineligible_reasons.append("Dataset is unavailable or empty.")
        else:
            val_report = data_quality_validator.validate(candidate_df)
            val_status = val_report.get("overall_status", "FAILED")
            checks["data_quality"] = {
                "status": val_status,
                "rows": val_report.get("total_rows"),
                "columns": val_report.get("total_columns"),
                "issues": val_report.get("issues", []),
                "warnings": val_report.get("warnings", []),
                "message": f"Data quality validation status: {val_status}."
            }
            if val_status == "FAILED":
                ineligible_reasons.append("Dataset failed critical data quality checks.")

        # 4. Drift Check
        drift_report = prediction_monitor.get_drift_report()
        drift_level = drift_report.get("alert_level", "NORMAL")
        checks["drift_status"] = {
            "alert_level": drift_level,
            "threshold": self.drift_threshold,
            "message": f"Operational drift level: {drift_level}."
        }
        if trigger == "data_drift" and drift_level == "NORMAL":
            ineligible_reasons.append("No significant data drift detected to justify drift-triggered retraining.")

        # 5. Performance Check
        error_metrics = summary.get("error_metrics", {})
        current_mae = error_metrics.get("mae")
        checks["performance_status"] = {
            "current_production_mae": current_mae,
            "benchmark_mae": production_metadata.get("champion_test_metrics", {}).get("mae") if has_prod_model else None,
            "status": "PASS" if current_mae is not None else "PENDING_FEEDBACK",
        }
        if trigger == "performance_degradation" and current_mae is None:
            ineligible_reasons.append("Insufficient feedback to compute performance degradation.")

        # Final Eligibility Determination
        is_eligible = len(ineligible_reasons) == 0
        overall_reason = (
            "All retraining criteria satisfied."
            if is_eligible else
            "; ".join(ineligible_reasons)
        )

        return {
            "eligible": is_eligible,
            "timestamp": timestamp,
            "trigger": trigger,
            "reason": overall_reason,
            "checks": checks,
            "new_samples_count": feedback_count,
            "min_required_samples": self.min_new_samples,
            "drift_status": drift_level,
            "candidate_action": (
                "Proceed with controlled candidate model training and validation."
                if is_eligible else "Hold retraining until prerequisites are satisfied."
            ),
        }


retraining_eligibility_checker = RetrainingEligibilityChecker()
