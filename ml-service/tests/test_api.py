"""
Integration tests for FastAPI endpoints (/health, /model/info, /predict).
"""

import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "learntrack-ml"
    assert data["model_loaded"] is True

def test_model_info_endpoint():
    response = client.get("/model/info")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "learntrack-ml"
    assert "model_version" in data
    assert "feature_names" in data
    assert "evaluation_metrics" in data

def test_predict_endpoint_valid():
    payload = {
        "attendance_percentage": 86.0,
        "assignment_score": 82.0,
        "internal_marks": 78.0,
        "previous_score": 75.0,
        "study_hours": 14.5,
        "assignments_completed": 8
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_score" in data
    assert "predicted_grade" in data
    assert "risk_level" in data
    assert "model_version" in data
    assert "explanations" in data
    assert len(data["explanations"]) > 0

def test_predict_endpoint_invalid_attendance_negative():
    payload = {
        "attendance_percentage": -5.0, # Invalid
        "assignment_score": 82.0,
        "internal_marks": 78.0,
        "previous_score": 75.0,
        "study_hours": 14.5,
        "assignments_completed": 8
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422 # Unprocessable Entity

def test_predict_endpoint_invalid_study_hours_negative():
    payload = {
        "attendance_percentage": 85.0,
        "assignment_score": 82.0,
        "internal_marks": 78.0,
        "previous_score": 75.0,
        "study_hours": -2.0, # Invalid
        "assignments_completed": 8
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 422


def test_simulate_endpoint_valid():
    payload = {
        "baseline": {
            "attendance_percentage": 75.0,
            "assignment_score": 70.0,
            "internal_marks": 68.0,
            "previous_score": 70.0,
            "study_hours": 10.0,
            "assignments_completed": 6
        },
        "simulated": {
            "attendance_percentage": 88.0,
            "assignment_score": 85.0,
            "internal_marks": 80.0,
            "previous_score": 70.0,
            "study_hours": 18.0,
            "assignments_completed": 9
        }
    }
    response = client.post("/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "current_prediction" in data
    assert "simulated_prediction" in data
    assert "difference" in data
    assert "current_grade" in data
    assert "simulated_grade" in data
    assert "disclaimer" in data
    # Higher academic metrics should improve or maintain score
    assert data["difference"] > 0


def test_simulate_endpoint_invalid_bounds():
    payload = {
        "baseline": {
            "attendance_percentage": 75.0,
            "assignment_score": 70.0,
            "internal_marks": 68.0,
            "previous_score": 70.0,
            "study_hours": 10.0,
            "assignments_completed": 6
        },
        "simulated": {
            "attendance_percentage": 125.0,  # Invalid: > 100
            "assignment_score": 85.0,
            "internal_marks": 80.0,
            "previous_score": 70.0,
            "study_hours": 18.0,
            "assignments_completed": 9
        }
    }
    response = client.post("/simulate", json=payload)
    assert response.status_code == 422


def test_insights_generate_endpoint():
    payload = {
        "academic_records": [
            {"subject_name": "Machine Learning", "total_marks": 88.0, "semester": 5},
            {"subject_name": "Database Systems", "total_marks": 68.0, "semester": 5},
            {"subject_name": "Algorithms", "total_marks": 72.0, "semester": 4},
        ],
        "attendance_percentage": 74.0,
        "study_hours": 9.5,
        "latest_prediction": {"predicted_score": 72.5, "predicted_grade": "B"},
        "shap_explanations": [
            {
                "feature": "attendance_percentage",
                "label": "Attendance Rate",
                "impact": 3.2,
                "raw_impact": -3.2,
                "direction": "negative",
                "description": "Lower attendance reduced projected mark."
            }
        ]
    }
    response = client.post("/insights/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "insights" in data
    assert "summary" in data
    assert len(data["insights"]) > 0

    # Ensure insights have transparent score and valid types
    valid_types = {"strength", "improvement", "trend", "recommendation"}
    for item in data["insights"]:
        assert item["type"] in valid_types
        assert item["importance"] in {"high", "medium", "low"}
        assert 0.0 <= item["score"] <= 100.0
        assert len(item["title"]) > 0
        assert len(item["description"]) > 0

