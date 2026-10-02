"""
Unit and API integration tests for Operational Monitoring, Feedback, and Drift Detection.
"""

import pytest
import numpy as np
from fastapi.testclient import TestClient
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from ml.monitoring.monitor import PredictionMonitor, calculate_psi

client = TestClient(app)

def test_calculate_psi_identical():
    """PSI of identical distributions should be ~0.0."""
    data = np.random.normal(50, 10, 500)
    psi = calculate_psi(data, data)
    assert 0.0 <= psi <= 0.01

def test_calculate_psi_drifted():
    """PSI of shifted distributions should indicate moderate or high drift."""
    expected = np.random.normal(50, 10, 500)
    actual = np.random.normal(70, 10, 500)
    psi = calculate_psi(expected, actual)
    assert psi > 0.10

def test_prediction_logging_and_feedback():
    """Verify logging a prediction and later recording actual feedback outcome."""
    mon = PredictionMonitor()
    pred_id = mon.log_prediction(
        model_name="learntrack-student-performance",
        model_version="1",
        dataset_version="1.0.0",
        run_id="test-run-123",
        prediction=78.5,
        features={"attendance_percentage": 85.0, "study_hours": 12.0},
        latency_ms=8.5,
    )
    assert pred_id.startswith("pred-")

    # Add feedback
    updated = mon.add_feedback(pred_id, actual_value=80.0)
    assert updated is not None
    assert updated["actual_value"] == 80.0
    assert updated["error"] == 1.5  # 80.0 - 78.5

def test_monitoring_summary_insufficient_data():
    """Verify clean message when feedback count is below threshold."""
    mon = PredictionMonitor()
    # Log 2 predictions with feedback (below default threshold of 5)
    p1 = mon.log_prediction("model", "1", "1.0.0", "run", 70.0, {})
    p2 = mon.log_prediction("model", "1", "1.0.0", "run", 80.0, {})
    mon.add_feedback(p1, 72.0)
    mon.add_feedback(p2, 78.0)

    summary = mon.get_summary(days=30)
    assert summary["prediction_count"] >= 2
    assert summary["feedback_count"] >= 2
    # Should report insufficient observations without fabricating metrics
    assert summary["error_metrics"]["mae"] is None
    assert "Insufficient observations" in summary["error_metrics"]["status"]

def test_monitoring_summary_sufficient_data():
    """Verify dynamic error metric calculation when sufficient feedback is provided."""
    mon = PredictionMonitor()
    for i in range(6):
        pid = mon.log_prediction("model", "1", "1.0.0", "run", 70.0 + i, {})
        mon.add_feedback(pid, 72.0 + i)

    summary = mon.get_summary(days=30)
    assert summary["feedback_count"] >= 6
    assert summary["error_metrics"]["mae"] is not None
    assert summary["error_metrics"]["rmse"] is not None
    assert summary["error_metrics"]["mean_error"] is not None

def test_api_experiments_endpoints():
    """Verify /experiments, /experiments/{run_id}, and /experiments/compare endpoints."""
    # List runs
    res = client.get("/experiments")
    assert res.status_code == 200
    runs = res.json()
    assert isinstance(runs, list)
    assert len(runs) > 0

    run_id = runs[0]["run_id"]

    # Run detail
    res_detail = client.get(f"/experiments/{run_id}")
    assert res_detail.status_code == 200
    detail = res_detail.json()
    assert detail["run_id"] == run_id

    # Compare
    res_comp = client.get(f"/experiments/compare?run_ids={run_id}")
    assert res_comp.status_code == 200
    assert len(res_comp.json()) == 1

def test_api_registry_endpoints():
    """Verify /registry/models and /registry/production endpoints."""
    res_prod = client.get("/registry/production")
    assert res_prod.status_code == 200
    data = res_prod.json()
    assert data["model_name"] == "learntrack-student-performance"
    assert isinstance(data["model_version"], str) and len(data["model_version"]) > 0

def test_api_monitoring_endpoints():
    """Verify /monitoring/summary and /monitoring/drift endpoints."""
    res_sum = client.get("/monitoring/summary?days=30")
    assert res_sum.status_code == 200
    sdata = res_sum.json()
    assert "prediction_count" in sdata
    assert "latency" in sdata

    res_drift = client.get("/monitoring/drift")
    assert res_drift.status_code == 200
    ddata = res_drift.json()
    assert "alert_level" in ddata
    assert ddata["alert_level"] in ["NORMAL", "WARNING", "CRITICAL"]

def test_api_monitoring_feedback_lifecycle():
    """Verify full loop: predict -> capture prediction_id -> submit feedback -> verify error."""
    payload = {
        "attendance_percentage": 90.0,
        "assignment_score": 85.0,
        "internal_marks": 82.0,
        "previous_score": 80.0,
        "study_hours": 16.0,
        "assignments_completed": 10,
    }
    pred_res = client.post("/predict", json=payload)
    assert pred_res.status_code == 200
    pred_data = pred_res.json()
    assert "prediction_id" in pred_data
    assert pred_data["prediction_id"] is not None
    assert "prediction" in pred_data
    assert "run_id" in pred_data

    # Submit feedback
    fb_payload = {
        "prediction_id": pred_data["prediction_id"],
        "actual_score": 84.0,
    }
    fb_res = client.post("/monitoring/feedback", json=fb_payload)
    assert fb_res.status_code == 200
    fb_data = fb_res.json()
    assert fb_data["prediction_id"] == pred_data["prediction_id"]
    assert fb_data["actual_score"] == 84.0
    expected_error = round(84.0 - pred_data["predicted_score"], 2)
    assert fb_data["error"] == expected_error
