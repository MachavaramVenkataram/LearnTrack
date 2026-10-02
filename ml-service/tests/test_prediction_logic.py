"""
Unit tests for deterministic grading, risk tiers, and model prediction logic.
"""

import pytest
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.prediction_service import (
    map_score_to_grade,
    classify_performance_risk,
    predict_student_performance
)
from app.schemas.prediction import PredictionRequest
from app.services.model_service import model_service

def test_grade_mapping_boundaries():
    assert map_score_to_grade(95.0) == "A+"
    assert map_score_to_grade(85.0) == "A"
    assert map_score_to_grade(75.0) == "B+"
    assert map_score_to_grade(65.0) == "B"
    assert map_score_to_grade(55.0) == "C"
    assert map_score_to_grade(45.0) == "D"
    assert map_score_to_grade(30.0) == "F"

def test_risk_classification():
    # High score & high attendance = Low risk
    assert classify_performance_risk(85.0, 90.0) == "Low"
    # Medium score = Medium risk
    assert classify_performance_risk(68.0, 80.0) == "Medium"
    # Low attendance (< 70) = High risk even with decent score
    assert classify_performance_risk(75.0, 65.0) == "High"
    # Low score (< 55) = High risk
    assert classify_performance_risk(50.0, 90.0) == "High"

def test_model_inference_and_shap_output():
    model_service.load()
    req = PredictionRequest(
        attendance_percentage=88.0,
        assignment_score=85.0,
        internal_marks=80.0,
        previous_score=78.0,
        study_hours=15.0,
        assignments_completed=9,
    )
    res = predict_student_performance(req)

    assert 0.0 <= res.predicted_score <= 100.0
    assert res.predicted_grade in ["A+", "A", "B+", "B", "C", "D", "F"]
    assert res.risk_level in ["Low", "Medium", "High"]
    assert isinstance(res.model_version, str) and len(res.model_version) > 0
    assert res.prediction == res.predicted_score
    assert len(res.explanations) > 0

    # Verify SHAP explanation items
    first_exp = res.explanations[0]
    assert first_exp.direction in ["positive", "negative", "neutral"]
    assert "was associated with" in first_exp.description
