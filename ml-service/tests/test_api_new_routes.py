"""
Integration Tests for New ML Reliability Endpoints
Tests Data Quality, Model Error Analysis, and Retraining API routes.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_data_quality_latest_endpoint():
    response = client.get("/data-quality/latest")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "total_rows" in data
    assert "total_columns" in data
    assert "checks" in data
    assert "schema" in data["checks"]
    assert "missing_values" in data["checks"]


def test_data_quality_validate_endpoint():
    response = client.post("/data-quality/validate", json={"dataset_version": "1.0.0"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["PASSED", "WARNING"]


def test_data_quality_history_endpoint():
    response = client.get("/data-quality/history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_error_analysis_summary_benchmark():
    response = client.get("/error-analysis/summary?evaluation_type=BENCHMARK")
    assert response.status_code == 200
    data = response.json()
    assert data["evaluation_type"] == "BENCHMARK"
    assert "metrics" in data
    assert "mae" in data["metrics"]
    assert "rmse" in data["metrics"]
    assert "largest_errors" in data


def test_error_analysis_summary_production():
    response = client.get("/error-analysis/summary?evaluation_type=PRODUCTION")
    assert response.status_code == 200
    data = response.json()
    assert data["evaluation_type"] == "PRODUCTION"
    # Even if 0 feedback, returns structured response with status or message
    assert "status" in data
    assert "sample_count" in data


def test_error_analysis_segments_endpoint():
    response = client.get("/error-analysis/segments?evaluation_type=BENCHMARK")
    assert response.status_code == 200
    data = response.json()
    assert "performance_ranges" in data
    assert "feature_segments" in data


def test_error_analysis_residuals_endpoint():
    response = client.get("/error-analysis/residuals?evaluation_type=BENCHMARK")
    assert response.status_code == 200
    data = response.json()
    assert "residual_analysis" in data


def test_error_analysis_largest_errors_endpoint():
    response = client.get("/error-analysis/largest-errors?evaluation_type=BENCHMARK&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if data:
        assert "actual" in data[0]
        assert "predicted" in data[0]
        assert "error" in data[0]
        assert "error_tier" in data[0]


def test_retraining_status_endpoint():
    response = client.get("/retraining/status")
    assert response.status_code == 200
    data = response.json()
    assert "active_production_model" in data
    assert "data_availability" in data
    assert "drift_status" in data


def test_retraining_check_dry_run_endpoint():
    response = client.post("/retraining/check", json={"trigger": "manual"})
    assert response.status_code == 200
    data = response.json()
    assert "eligible" in data
    assert "reason" in data
    assert "checks" in data


def test_retraining_history_endpoint():
    response = client.get("/retraining/history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)


def test_model_audit_log_endpoint():
    response = client.get("/models/audit-log")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
