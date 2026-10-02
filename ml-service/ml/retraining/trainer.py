"""
LearnTrack ML: Retraining Pipeline Engine
Executes controlled retraining: data validation, dataset compilation with versioning,
feature engineering, cross-validation, candidate benchmarking, error analysis,
and MLflow run logging without touching production model artifacts.
"""

import os
import sys
import json
import uuid
import datetime
import hashlib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, Optional
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from xgboost import XGBRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import KFold, cross_validate
import joblib

from ml.validation.quality import data_quality_validator, DataValidationError
from ml.validation.report import data_quality_report_store
from ml.features.feature_engineering import engineer_features, FEATURE_NAMES
from ml.preprocessing.preprocessing import split_academic_data
from ml.models.evaluate import evaluate_predictions
from ml.evaluation.error_analysis import error_analysis_engine
from ml.tracking.mlflow_tracker import mlflow_tracker, calculate_file_sha256
from ml.monitoring.monitor import prediction_monitor

try:
    from app.core.config import settings
    CANDIDATES_DIR = os.path.join(settings.ARTIFACTS_DIR, "candidates")
except Exception:
    CANDIDATES_DIR = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "artifacts", "candidates")
    )


class RetrainingTrainer:
    def __init__(self, candidates_dir: Optional[str] = None):
        self.candidates_dir = candidates_dir or CANDIDATES_DIR
        os.makedirs(self.candidates_dir, exist_ok=True)

    def prepare_retraining_dataset(self) -> Tuple[pd.DataFrame, str, str]:
        """
        Combines baseline reference data with validated new operational feedback data.
        Generates deterministic version string and SHA-256 hash.
        """
        ref_path = os.path.join(settings.DATA_DIR, "processed", "academic_performance.csv")
        if not os.path.exists(ref_path):
            raise FileNotFoundError(f"Reference dataset missing at {ref_path}")

        df_base = pd.read_csv(ref_path)

        # Collect validated feedback from operational monitor
        feedback_records = []
        for p in prediction_monitor._predictions:
            if p.get("actual_value") is not None and p.get("features"):
                feat = p["features"]
                row = {
                    "attendance_percentage": float(feat.get("attendance_percentage", 85.0)),
                    "assignment_score": float(feat.get("assignment_score", 70.0)),
                    "internal_marks": float(feat.get("internal_marks", 70.0)),
                    "previous_score": float(feat.get("previous_score", 70.0)),
                    "study_hours": float(feat.get("study_hours", 4.0)),
                    "assignments_completed": int(feat.get("assignments_completed", 6)),
                    "final_score": float(p["actual_value"]),
                }
                feedback_records.append(row)

        if feedback_records:
            df_new = pd.DataFrame(feedback_records)
            combined_df = pd.concat([df_base, df_new], ignore_index=True)
            # Semantic dataset version increment
            dataset_version = f"1.{min(len(feedback_records), 99)}.0"
        else:
            combined_df = df_base
            dataset_version = "1.0.0"

        # Compute hash
        hash_str = hashlib.sha256(pd.util.hash_pandas_object(combined_df).values).hexdigest()
        return combined_df, dataset_version, hash_str

    def execute_retraining(self, trigger: str = "manual") -> Dict[str, Any]:
        """
        Executes end-to-end controlled candidate retraining pipeline.
        """
        started_at = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # 1. Dataset Preparation & Versioning
        df, dataset_version, dataset_hash = self.prepare_retraining_dataset()

        # 2. Strict Data Quality Validation (Stops execution if failed)
        val_report = data_quality_validator.validate_and_enforce(df, dataset_version=dataset_version)
        val_report_path = data_quality_report_store.save_report(val_report)

        # 3. Partitioning (Train 70%, Val 15%, Test 15%)
        X_train_raw, y_train, X_val_raw, y_val, X_test_raw, y_test = split_academic_data(
            df, target_col="final_score", test_size=0.15, val_size=0.15, random_state=42
        )

        # 4. Feature Engineering
        X_train_feat = engineer_features(X_train_raw)
        X_val_feat = engineer_features(X_val_raw)
        X_test_feat = engineer_features(X_test_raw)
        feature_names = FEATURE_NAMES

        # 5. Preprocessing Scaling
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train_feat)
        X_val_scaled = scaler.transform(X_val_feat)
        X_test_scaled = scaler.transform(X_test_feat)

        # 6. Candidate Models
        candidates = {
            "Linear Regression (Ridge)": (
                Ridge(alpha=12.0, random_state=42),
                {"alpha": 12.0, "random_state": 42}
            ),
            "Random Forest Regressor": (
                RandomForestRegressor(
                    n_estimators=120, max_depth=6, min_samples_split=4, min_samples_leaf=2, random_state=42
                ),
                {"n_estimators": 120, "max_depth": 6, "min_samples_split": 4, "min_samples_leaf": 2, "random_state": 42}
            ),
            "Gradient Boosting Regressor": (
                GradientBoostingRegressor(
                    n_estimators=100, max_depth=4, learning_rate=0.08, subsample=0.9, random_state=42
                ),
                {"n_estimators": 100, "max_depth": 4, "learning_rate": 0.08, "subsample": 0.9, "random_state": 42}
            ),
            "XGBoost Regressor": (
                XGBRegressor(
                    n_estimators=100, max_depth=4, learning_rate=0.08, subsample=0.85,
                    colsample_bytree=0.85, random_state=42, eval_metric="rmse"
                ),
                {"n_estimators": 100, "max_depth": 4, "learning_rate": 0.08, "subsample": 0.85, "colsample_bytree": 0.85, "random_state": 42}
            ),
        }

        kf = KFold(n_splits=5, shuffle=True, random_state=42)
        model_results = {}
        best_candidate_name = None
        lowest_val_rmse = float("inf")

        for name, (model, params) in candidates.items():
            model.fit(X_train_scaled, y_train)

            train_preds = model.predict(X_train_scaled)
            train_m = evaluate_predictions(y_train.values, train_preds)

            val_preds = model.predict(X_val_scaled)
            val_m = evaluate_predictions(y_val.values, val_preds)

            test_preds = model.predict(X_test_scaled)
            test_m = evaluate_predictions(y_test.values, test_preds)

            cv_res = cross_validate(
                model, X_train_scaled, y_train, cv=kf,
                scoring=["neg_root_mean_squared_error", "neg_mean_absolute_error", "r2"]
            )
            cv_m = {
                "mean_rmse": round(float(-cv_res["test_neg_root_mean_squared_error"].mean()), 3),
                "std_rmse": round(float(cv_res["test_neg_root_mean_squared_error"].std()), 3),
                "mean_mae": round(float(-cv_res["test_neg_mean_absolute_error"].mean()), 3),
                "std_mae": round(float(cv_res["test_neg_mean_absolute_error"].std()), 3),
                "mean_r2": round(float(cv_res["test_r2"].mean()), 4),
                "std_r2": round(float(cv_res["test_r2"].std()), 4),
            }

            model_results[name] = {
                "model_obj": model,
                "params": params,
                "train": train_m,
                "val": val_m,
                "test": test_m,
                "cv": cv_m,
                "test_preds": test_preds,
            }

            if val_m["rmse"] < lowest_val_rmse:
                lowest_val_rmse = val_m["rmse"]
                best_candidate_name = name

        champion_data = model_results[best_candidate_name]
        candidate_model = champion_data["model_obj"]

        # 7. Candidate Version String
        candidate_version = f"candidate-{uuid.uuid4().hex[:8]}"

        # 8. Run Error Analysis on Candidate Model Test Split
        candidate_error_analysis = error_analysis_engine.analyze(
            actual=y_test.values,
            predicted=champion_data["test_preds"],
            features_df=X_test_raw.reset_index(drop=True),
            model_name=best_candidate_name,
            model_version=candidate_version,
            dataset_version=dataset_version,
            evaluation_type="BENCHMARK",
        )

        # 9. MLflow Logging for Candidate Model
        dataset_meta = {
            "dataset_name": "LearnTrack Continuous Retraining Dataset",
            "dataset_version": dataset_version,
            "dataset_hash": dataset_hash,
            "row_count": len(df),
            "trigger": trigger,
        }

        try:
            candidate_run_id = mlflow_tracker.log_training_run(
                model_name=f"{best_candidate_name} (Candidate)",
                model_obj=candidate_model,
                params={**champion_data["params"], "trigger": trigger, "candidate_version": candidate_version},
                train_metrics=champion_data["train"],
                val_metrics=champion_data["val"],
                cv_metrics=champion_data["cv"],
                test_metrics=champion_data["test"],
                dataset_meta=dataset_meta,
                artifacts=[val_report_path],
                is_champion=False,  # Not champion yet!
            )
        except Exception as e:
            print(f"[RetrainingTrainer] MLflow logging note: {e}")
            candidate_run_id = f"retrain-run-{uuid.uuid4().hex[:8]}"

        # 10. Package Candidate Artifact (Saved in candidates directory, NOT production)
        candidate_package = {
            "scaler": scaler,
            "model": candidate_model,
            "feature_names": feature_names,
            "champion_name": best_candidate_name,
            "candidate_version": candidate_version,
            "dataset_version": dataset_version,
            "dataset_hash": dataset_hash,
            "run_id": candidate_run_id,
            "created_at": started_at,
        }

        candidate_meta = {
            "candidate_version": candidate_version,
            "model_type": best_candidate_name,
            "run_id": candidate_run_id,
            "dataset_version": dataset_version,
            "dataset_hash": dataset_hash,
            "trigger": trigger,
            "created_at": started_at,
            "validation_metrics": champion_data["val"],
            "test_metrics": champion_data["test"],
            "cv_metrics": champion_data["cv"],
            "benchmarks": {k: {"val_rmse": v["val"]["rmse"], "test_rmse": v["test"]["rmse"]} for k, v in model_results.items()},
            "error_analysis_summary": {
                "mae": candidate_error_analysis["metrics"]["mae"],
                "rmse": candidate_error_analysis["metrics"]["rmse"],
                "r2": candidate_error_analysis["metrics"]["r2"],
            },
        }

        # Save candidate artifact
        pkg_file = os.path.join(self.candidates_dir, f"{candidate_version}.pkl")
        meta_file = os.path.join(self.candidates_dir, f"{candidate_version}_meta.json")
        joblib.dump(candidate_package, pkg_file)
        with open(meta_file, "w", encoding="utf-8") as f:
            json.dump(candidate_meta, f, indent=2)

        completed_at = datetime.datetime.now(datetime.timezone.utc).isoformat()

        return {
            "status": "COMPLETED",
            "candidate_version": candidate_version,
            "candidate_model_type": best_candidate_name,
            "candidate_run_id": candidate_run_id,
            "trigger": trigger,
            "dataset_version": dataset_version,
            "dataset_hash": dataset_hash,
            "started_at": started_at,
            "completed_at": completed_at,
            "candidate_metrics": {
                "validation": champion_data["val"],
                "test": champion_data["test"],
                "cv": champion_data["cv"],
            },
            "validation_report_id": val_report.get("id"),
            "artifact_path": pkg_file,
            "metadata_path": meta_file,
        }


retraining_trainer = RetrainingTrainer()
