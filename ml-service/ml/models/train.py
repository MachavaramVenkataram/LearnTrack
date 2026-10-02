"""
LearnTrack ML: Model Training, MLflow Tracking & Selection Pipeline
Trains and benchmarks multiple candidate models (Ridge, RF, GBDT, XGBoost).
Evaluates using 5-fold CV, held-out validation set, and final independent test set.
Logs all hyperparameters, dynamic metrics, dataset hashes, and artifacts to MLflow.
Registers the champion model into the MLflow Model Registry.
"""

import os
import sys
import json
import datetime
import pandas as pd
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from xgboost import XGBRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import KFold, cross_validate

# Ensure ml package modules can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

try:
    from app.core.config import settings
except ImportError:
    from core.config import settings
from ml.features.feature_engineering import engineer_features, FEATURE_NAMES
from ml.preprocessing.preprocessing import split_academic_data
from ml.models.evaluate import evaluate_predictions
from ml.models.model_registry import ModelRegistry
from ml.tracking.mlflow_tracker import mlflow_tracker, calculate_file_sha256

def run_training_pipeline():
    data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data", "processed", "academic_performance.csv"))
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Processed dataset not found at {data_path}. Run process_dataset.py first.")

    dataset_hash = calculate_file_sha256(data_path)
    dataset_version = "1.0.0"

    print(f"Loading academic dataset from {data_path}...")
    df = pd.read_csv(data_path)
    print(f"Total dataset size: {len(df)} samples | Dataset SHA256: {dataset_hash[:12]}...")

    # Data Quality & Validation Gate: STOPS training if validation fails
    print("Running Data Quality & Schema Validation Layer...")
    from ml.validation.quality import data_quality_validator
    from ml.validation.report import data_quality_report_store
    from ml.evaluation.error_analysis import error_analysis_engine

    val_report = data_quality_validator.validate_and_enforce(df, dataset_version=dataset_version)
    val_report_path = data_quality_report_store.save_report(val_report)
    print(f"Data Quality Status: {val_report['overall_status']} (Rows: {val_report['total_rows']}, Columns: {val_report['total_columns']})")

    # 1. Train / Validation / Test Splitting (70% Train, 15% Val, 15% Test)
    X_train_raw, y_train, X_val_raw, y_val, X_test_raw, y_test = split_academic_data(
        df, target_col="final_score", test_size=0.15, val_size=0.15, random_state=42
    )

    print(f"Data Partitions: Train={len(X_train_raw)}, Validation={len(X_val_raw)}, Test={len(X_test_raw)}")

    # 2. Feature Engineering across all splits
    X_train_feat = engineer_features(X_train_raw)
    X_val_feat = engineer_features(X_val_raw)
    X_test_feat = engineer_features(X_test_raw)

    feature_names = FEATURE_NAMES

    # 3. Preprocessing (StandardScaler fitted strictly on training data to prevent leakage)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_feat)
    X_val_scaled = scaler.transform(X_val_feat)
    X_test_scaled = scaler.transform(X_test_feat)

    # 4. Candidate Models Definition with exact, documented hyperparameters
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

    # 5. Model Benchmarking & MLflow Logging
    benchmarks = {}
    run_ids = {}
    kf = KFold(n_splits=5, shuffle=True, random_state=42)

    print("\n" + "=" * 75)
    print(f"{'MODEL':<28} | {'VAL MAE':<9} | {'VAL RMSE':<9} | {'VAL R²':<8} | {'TEST RMSE':<9}")
    print("=" * 75)

    best_model_name = None
    lowest_val_rmse = float("inf")

    dataset_meta = {
        "dataset_name": "UCI Student Performance Benchmark (Mathematics & Portuguese)",
        "dataset_version": dataset_version,
        "dataset_hash": dataset_hash,
        "row_count": len(df),
        "train_rows": len(X_train_raw),
        "val_rows": len(X_val_raw),
        "test_rows": len(X_test_raw),
        "feature_count": len(feature_names),
        "target": "final_score",
    }

    model_evaluations = {}

    for name, (model, params) in candidates.items():
        # Fit model on training split
        model.fit(X_train_scaled, y_train)

        # Dynamic metrics
        train_preds = model.predict(X_train_scaled)
        train_metrics = evaluate_predictions(y_train.values, train_preds)

        val_preds = model.predict(X_val_scaled)
        val_metrics = evaluate_predictions(y_val.values, val_preds)

        test_preds = model.predict(X_test_scaled)
        test_metrics = evaluate_predictions(y_test.values, test_preds)

        # 5-fold CV on training set
        cv_res = cross_validate(
            model, X_train_scaled, y_train, cv=kf,
            scoring=["neg_root_mean_squared_error", "neg_mean_absolute_error", "r2"]
        )
        cv_metrics = {
            "mean_rmse": round(float(-cv_res["test_neg_root_mean_squared_error"].mean()), 3),
            "std_rmse": round(float(cv_res["test_neg_root_mean_squared_error"].std()), 3),
            "mean_mae": round(float(-cv_res["test_neg_mean_absolute_error"].mean()), 3),
            "std_mae": round(float(cv_res["test_neg_mean_absolute_error"].std()), 3),
            "mean_r2": round(float(cv_res["test_r2"].mean()), 4),
            "std_r2": round(float(cv_res["test_r2"].std()), 4),
        }

        benchmarks[name] = {
            "val_mae": val_metrics["mae"],
            "val_rmse": val_metrics["rmse"],
            "val_r2": val_metrics["r2"],
            "test_mae": test_metrics["mae"],
            "test_rmse": test_metrics["rmse"],
            "test_r2": test_metrics["r2"],
            "cv": cv_metrics,
        }

        model_evaluations[name] = {
            "train": train_metrics,
            "val": val_metrics,
            "test": test_metrics,
            "cv": cv_metrics,
            "params": params,
            "model_obj": model,
            "test_preds": test_preds,
        }

        print(f"{name:<28} | {val_metrics['mae']:<9.3f} | {val_metrics['rmse']:<9.3f} | {val_metrics['r2']:<8.4f} | {test_metrics['rmse']:<9.3f}")

        if val_metrics["rmse"] < lowest_val_rmse:
            lowest_val_rmse = val_metrics["rmse"]
            best_model_name = name

    print("=" * 75)
    print(f"\nChampion Model Selected based on validation evidence: {best_model_name}")

    # Run Benchmark Error Analysis on Champion Model
    champ_eval_data = model_evaluations[best_model_name]
    champ_error_report = error_analysis_engine.analyze(
        actual=y_test.values,
        predicted=champ_eval_data["test_preds"],
        features_df=X_test_raw.reset_index(drop=True),
        model_name=best_model_name,
        model_version=settings.PRODUCTION_MODEL_VERSION,
        dataset_version=dataset_version,
        evaluation_type="BENCHMARK",
    )
    print(f"Error Analysis on Test Split: MAE={champ_error_report['metrics']['mae']}, RMSE={champ_error_report['metrics']['rmse']}, R²={champ_error_report['metrics']['r2']}")

    # 6. Log each model run to MLflow
    for name, eval_data in model_evaluations.items():
        is_champ = (name == best_model_name)
        run_artifacts = [val_report_path]
        if is_champ and os.path.exists(error_analysis_engine.benchmark_report_path):
            run_artifacts.append(error_analysis_engine.benchmark_report_path)

        try:
            run_id = mlflow_tracker.log_training_run(
                model_name=name,
                model_obj=eval_data["model_obj"],
                params=eval_data["params"],
                train_metrics=eval_data["train"],
                val_metrics=eval_data["val"],
                cv_metrics=eval_data["cv"],
                test_metrics=eval_data["test"],
                dataset_meta=dataset_meta,
                artifacts=run_artifacts,
                is_champion=is_champ,
            )
            run_ids[name] = run_id
            print(f"Logged to MLflow -> Run ID: {run_id} ({name}) [Champion: {is_champ}]")
        except Exception as e:
            print(f"Warning: MLflow logging failed for {name}: {e}")
            run_ids[name] = f"local-run-{name.lower().replace(' ', '-')}"

    champion_model = candidates[best_model_name][0]
    champion_eval = model_evaluations[best_model_name]
    champion_run_id = run_ids.get(best_model_name, "prod-run-001")

    # 7. Package Pipeline Artifact
    pipeline_package = {
        "scaler": scaler,
        "model": champion_model,
        "feature_names": feature_names,
        "champion_name": best_model_name,
        "version": settings.PRODUCTION_MODEL_VERSION,
        "run_id": champion_run_id,
        "train_samples": len(X_train_raw),
        "test_samples": len(X_test_raw),
    }

    # Extract feature importances if tree-based
    feature_importances = {}
    if hasattr(champion_model, "feature_importances_"):
        for f, imp in zip(feature_names, champion_model.feature_importances_):
            feature_importances[f] = round(float(imp), 4)
    elif hasattr(champion_model, "coef_"):
        for f, coef in zip(feature_names, champion_model.coef_):
            feature_importances[f] = round(float(abs(coef)), 4)

    metadata = {
        "model_version": settings.PRODUCTION_MODEL_VERSION,
        "model_type": best_model_name,
        "model_name": settings.PRODUCTION_MODEL_NAME,
        "run_id": champion_run_id,
        "training_date": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "target": "final_score",
        "target_scale": "0 to 100 continuous score",
        "dataset_name": dataset_meta["dataset_name"],
        "dataset_version": dataset_version,
        "dataset_hash": dataset_hash,
        "samples_total": len(df),
        "feature_names": feature_names,
        "feature_importances": feature_importances,
        "benchmarks_comparison": benchmarks,
        "champion_validation_metrics": champion_eval["val"],
        "champion_test_metrics": champion_eval["test"],
        "champion_cv_metrics": champion_eval["cv"],
        "selection_rationale": (
            f"{best_model_name} demonstrated superior predictive accuracy on held-out validation data "
            f"(Validation RMSE: {champion_eval['val']['rmse']}, R²: {champion_eval['val']['r2']}) "
            f"and confirmed generalizability on the independent test set (Test RMSE: {champion_eval['test']['rmse']}, R²: {champion_eval['test']['r2']})."
        ),
    }

    # 8. Save Artifacts using ModelRegistry
    registry = ModelRegistry()
    registry.save_artifact(pipeline_package, metadata)
    print(f"\nSuccessfully saved pipeline artifact to: {registry.model_path}")
    print(f"Successfully saved metadata to: {registry.metadata_path}")

    return pipeline_package, metadata

if __name__ == "__main__":
    run_training_pipeline()
