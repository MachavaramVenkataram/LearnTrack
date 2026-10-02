"""
Model Training and Comparison Pipeline for LearnTrack.
Compares Linear Regression, Random Forest, Gradient Boosting, and XGBoost.
Selects the best performing model based on R², RMSE, and MAE.
Saves model artifacts, SHAP explainer, and performance metadata.
"""

import json
import os
import sys

# Ensure ml directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from dataset import generate_academic_dataset

try:
    import xgboost as xgb
    XGB_AVAILABLE = True
except ImportError:
    XGB_AVAILABLE = False

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False


def train_and_evaluate():
    print("[LearnTrack ML] Generating synthetic calibrated academic dataset...")
    df = generate_academic_dataset(n_samples=2000, random_state=42)

    feature_cols = [
        "attendance",
        "study_hours_per_week",
        "internal_marks",
        "assignment_completion_rate",
        "previous_cgpa",
        "extracurricular_hours",
        "sleep_hours_avg",
        "practice_tests_taken",
        "backlogs_count",
    ]

    X = df[feature_cols]
    y = df["final_score"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    models = {
        "Linear Regression": LinearRegression(),
        "Random Forest": RandomForestRegressor(
            n_estimators=120, max_depth=8, min_samples_split=4, random_state=42
        ),
        "Gradient Boosting": GradientBoostingRegressor(
            n_estimators=150, learning_rate=0.08, max_depth=5, random_state=42
        ),
    }

    if XGB_AVAILABLE:
        models["XGBoost"] = xgb.XGBRegressor(
            n_estimators=150,
            learning_rate=0.08,
            max_depth=5,
            subsample=0.85,
            colsample_bytree=0.85,
            random_state=42,
            verbosity=0,
        )

    results = {}
    fitted_models = {}

    print("\n--- MODEL BENCHMARKING RESULTS ---")
    print(f"{'Model':<22} | {'MAE':<8} | {'RMSE':<8} | {'R2':<8}")
    print("-" * 54)

    best_r2 = -float("inf")
    champion_name = None

    for name, model in models.items():
        model.fit(X_train, y_train)
        preds = model.predict(X_test)

        mae = float(mean_absolute_error(y_test, preds))
        rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
        r2 = float(r2_score(y_test, preds))

        results[name] = {
            "mae": round(mae, 3),
            "rmse": round(rmse, 3),
            "r2": round(r2, 4),
        }
        fitted_models[name] = model

        print(f"{name:<22} | {mae:<8.3f} | {rmse:<8.3f} | {r2:<8.4f}")

        if r2 > best_r2:
            best_r2 = r2
            champion_name = name

    print("-" * 54)
    print(f">> Champion Model Selected: {champion_name} (R2 = {best_r2:.4f})")

    champion_model = fitted_models[champion_name]

    # Calculate feature importances
    feature_importances = {}
    if hasattr(champion_model, "feature_importances_"):
        raw_importances = champion_model.feature_importances_
        for col, imp in zip(feature_cols, raw_importances):
            feature_importances[col] = round(float(imp), 4)
    elif hasattr(champion_model, "coef_"):
        raw_coefs = np.abs(champion_model.coef_)
        total = np.sum(raw_coefs)
        for col, coef in zip(feature_cols, raw_coefs / total):
            feature_importances[col] = round(float(coef), 4)

    # Sort feature importances descending
    sorted_importances = sorted(
        [{"feature": k, "importance": v} for k, v in feature_importances.items()],
        key=lambda x: x["importance"],
        reverse=True,
    )

    # SHAP Explainer
    explainer = None
    if SHAP_AVAILABLE and (
        isinstance(champion_model, (RandomForestRegressor, GradientBoostingRegressor))
        or (XGB_AVAILABLE and isinstance(champion_model, xgb.XGBRegressor))
    ):
        try:
            print("[LearnTrack ML] Initializing SHAP TreeExplainer...")
            explainer = shap.TreeExplainer(champion_model)
        except Exception as e:
            print(f"[LearnTrack ML] Warning: SHAP initialization deferred: {e}")

    # Save artifacts
    artifacts_dir = os.path.join(os.path.dirname(__file__), "artifacts")
    os.makedirs(artifacts_dir, exist_ok=True)

    model_path = os.path.join(artifacts_dir, "champion_model.joblib")
    joblib.dump(champion_model, model_path)
    print(f"Saved champion model to: {model_path}")

    if explainer is not None:
        explainer_path = os.path.join(artifacts_dir, "shap_explainer.joblib")
        try:
            joblib.dump(explainer, explainer_path)
            print(f"Saved SHAP explainer to: {explainer_path}")
        except Exception as e:
            print(f"Notice: Could not serialize tree explainer directly: {e}")

    # Dataset baselines for reference
    feature_baselines = {
        col: {
            "mean": round(float(X[col].mean()), 2),
            "std": round(float(X[col].std()), 2),
            "min": round(float(X[col].min()), 2),
            "max": round(float(X[col].max()), 2),
        }
        for col in feature_cols
    }

    metadata = {
        "champion_model": champion_name,
        "champion_metrics": results[champion_name],
        "all_models_benchmarks": results,
        "feature_importances": sorted_importances,
        "feature_cols": feature_cols,
        "feature_baselines": feature_baselines,
        "dataset_samples": len(df),
        "version": "1.4.0-production",
    }

    metadata_path = os.path.join(artifacts_dir, "metrics.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved model metadata and benchmark records to: {metadata_path}")

    return metadata


if __name__ == "__main__":
    train_and_evaluate()
