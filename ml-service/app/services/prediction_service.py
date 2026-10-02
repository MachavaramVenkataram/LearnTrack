"""
LearnTrack ML: Prediction Orchestration Service
Orchestrates feature engineering, model inference, deterministic grade mapping,
transparent risk assessment, SHAP explainability, and operational prediction logging.
"""

import time
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional

from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    ExplanationItem,
    SimulationRequest,
    SimulationResponse,
)
from app.services.model_service import model_service
from ml.features.feature_engineering import engineer_features_dict
from ml.monitoring.monitor import prediction_monitor


def map_score_to_grade(score: float) -> str:
    """
    Maps continuous 0-100 predicted score to standard collegiate letter grade.
    Configurable institutional reference scale.
    """
    if score >= 90.0:
        return "A+"
    elif score >= 80.0:
        return "A"
    elif score >= 70.0:
        return "B+"
    elif score >= 60.0:
        return "B"
    elif score >= 50.0:
        return "C"
    elif score >= 40.0:
        return "D"
    else:
        return "F"


def classify_performance_risk(score: float, attendance: float) -> str:
    """
    Transparent rule-based Performance Risk Indicator.
    Clearly distinguishes rule-based heuristic indicator from ML regression target.
    """
    if score < 55.0 or attendance < 70.0:
        return "High"
    elif score < 72.0 or attendance < 75.0:
        return "Medium"
    else:
        return "Low"


def predict_student_performance(request: PredictionRequest) -> PredictionResponse:
    """
    Executes full inference lifecycle:
    1. Feature Engineering
    2. Scaling
    3. Regression Prediction
    4. Grade & Risk Mapping
    5. SHAP Feature Attribution
    6. Operational Monitoring Logging & Latency Tracking
    """
    start_time = time.time()

    pipeline = model_service.get_pipeline()
    metadata = model_service.get_metadata()
    shap_service = model_service.get_shap_service()

    raw_dict = request.model_dump()

    # 1. Feature Engineering
    features_df = engineer_features_dict(raw_dict)

    # 2. Preprocessing Scaling
    scaler = pipeline["scaler"]
    X_scaled = scaler.transform(features_df)

    # 3. Model Regression Inference
    model = pipeline["model"]
    raw_pred = float(model.predict(X_scaled)[0])
    predicted_score = float(np.clip(np.round(raw_pred, 1), 0.0, 100.0))

    # 4. Grade & Risk Mapping
    predicted_grade = map_score_to_grade(predicted_score)
    risk_level = classify_performance_risk(predicted_score, request.attendance_percentage)

    # 5. SHAP Explainability
    shap_explanations = shap_service.explain_instance(
        scaled_features=X_scaled,
        raw_features=raw_dict,
        top_k=5
    )

    explanation_items = [
        ExplanationItem(
            feature=exp["feature"],
            label=exp["label"],
            impact=exp["impact"],
            raw_impact=exp["raw_impact"],
            direction=exp["direction"],
            description=exp["description"],
        )
        for exp in shap_explanations
    ]

    duration_ms = round((time.time() - start_time) * 1000, 2)

    model_name = metadata.get("model_name", "learntrack-student-performance")
    model_version = metadata.get("model_version", "1")
    dataset_version = metadata.get("dataset_version", "1.0.0")
    run_id = metadata.get("run_id", "")

    # 6. Operational Prediction Monitoring Logging
    pred_id = prediction_monitor.log_prediction(
        model_name=model_name,
        model_version=model_version,
        dataset_version=dataset_version,
        run_id=run_id,
        prediction=predicted_score,
        features=raw_dict,
        latency_ms=duration_ms,
    )

    return PredictionResponse(
        prediction=predicted_score,
        predicted_score=predicted_score,
        predicted_grade=predicted_grade,
        risk_level=risk_level,
        model_name=model_name,
        model_version=model_version,
        dataset_version=dataset_version,
        run_id=run_id,
        prediction_id=pred_id,
        latency_ms=duration_ms,
        explanations=explanation_items,
        disclaimer=(
            "Predictions are estimates generated from the information provided and model training data. "
            "They are not guaranteed outcomes."
        )
    )


def simulate_performance_change(request: SimulationRequest) -> SimulationResponse:
    """
    Executes What-If Performance Simulation:
    Runs inference on baseline features and hypothetical simulated features
    using the identical trained regression champion pipeline, computing predicted deltas
    and grade transitions.
    """
    baseline_result = predict_student_performance(request.baseline)
    simulated_result = predict_student_performance(request.simulated)

    difference = round(simulated_result.predicted_score - baseline_result.predicted_score, 1)

    return SimulationResponse(
        current_prediction=baseline_result.predicted_score,
        simulated_prediction=simulated_result.predicted_score,
        difference=difference,
        current_grade=baseline_result.predicted_grade,
        simulated_grade=simulated_result.predicted_grade,
        current_risk=baseline_result.risk_level,
        simulated_risk=simulated_result.risk_level,
        model_version=baseline_result.model_version,
        disclaimer=(
            "Simulation only: These results are model estimates based on the selected inputs. "
            "They are not guaranteed academic outcomes."
        )
    )
