"""
Unit and integration tests for MLflow Experiment Tracking & Model Registry in LearnTrack.
"""

import pytest
import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.tracking.mlflow_tracker import mlflow_tracker, calculate_file_sha256
from app.core.config import settings

def test_experiment_initialization():
    """Verify that the experiment exists and has a valid ID."""
    exp_id = mlflow_tracker.get_experiment_id()
    assert exp_id is not None
    assert len(str(exp_id)) > 0

def test_dataset_sha256_hashing():
    """Verify that deterministic dataset hashing works correctly."""
    data_path = os.path.join(settings.DATA_DIR, "processed", "academic_performance.csv")
    if os.path.exists(data_path):
        sha = calculate_file_sha256(data_path)
        assert len(sha) == 64
        # Verify idempotency
        assert sha == calculate_file_sha256(data_path)

def test_list_runs_returns_valid_data():
    """Verify that list_runs retrieves actual runs with metrics and parameters."""
    runs = mlflow_tracker.list_runs(limit=10)
    assert isinstance(runs, list)
    assert len(runs) > 0

    first = runs[0]
    assert "run_id" in first
    assert "model_name" in first
    assert "dataset_version" in first
    assert "metrics" in first
    assert "params" in first
    assert "status" in first

def test_run_detail_retrieval():
    """Verify detailed retrieval for a specific run."""
    runs = mlflow_tracker.list_runs(limit=1)
    assert len(runs) > 0
    run_id = runs[0]["run_id"]

    detail = mlflow_tracker.get_run_detail(run_id)
    assert detail is not None
    assert detail["run_id"] == run_id
    assert "metrics" in detail
    assert "params" in detail
    assert "tags" in detail

def test_compare_runs():
    """Verify comparing multiple runs side-by-side."""
    runs = mlflow_tracker.list_runs(limit=2)
    if len(runs) >= 2:
        ids = [runs[0]["run_id"], runs[1]["run_id"]]
        comparison = mlflow_tracker.compare_runs(ids)
        assert len(comparison) == 2
        assert comparison[0]["run_id"] == ids[0]
        assert comparison[1]["run_id"] == ids[1]

def test_model_registry_production_info():
    """Verify production model retrieval."""
    prod = mlflow_tracker.get_production_model()
    assert "model_name" in prod
    assert "model_version" in prod
    assert prod["stage"] == "Production"
    assert prod["is_configured"] is True
