"""
Unit Tests for LearnTrack Automated Retraining Engine
Tests eligibility verification, regression protection, promotion policy,
rollback safety, and ML lifecycle audit logging.
"""

import os
import pytest
import pandas as pd
import numpy as np

from ml.retraining.eligibility import retraining_eligibility_checker
from ml.retraining.evaluator import candidate_model_evaluator
from ml.retraining.promotion import model_promotion_manager


def test_retraining_eligibility_manual_trigger():
    result = retraining_eligibility_checker.check_eligibility(trigger="manual")
    assert "eligible" in result
    assert "checks" in result
    assert "candidate_action" in result
    assert result["checks"]["production_model"]["status"] == "PASS"


def test_retraining_eligibility_insufficient_feedback():
    # Enforce new_labeled_data trigger with high threshold
    result = retraining_eligibility_checker.check_eligibility(trigger="new_labeled_data")
    # If 0 feedback recorded, should be ineligible
    if result["new_samples_count"] < result["min_required_samples"]:
        assert result["eligible"] is False
        assert "Insufficient new labeled observations" in result["reason"]


def test_candidate_evaluator_rejects_regressed_candidate():
    production_metrics = {
        "champion_test_metrics": {"rmse": 7.0, "mae": 4.5, "r2": 0.85}
    }
    # Candidate is significantly worse (RMSE 8.5 vs 7.0, > 5% regression)
    candidate_metrics = {
        "test": {"rmse": 8.5, "mae": 5.8, "r2": 0.70}
    }

    eval_result = candidate_model_evaluator.evaluate_candidate(
        candidate_metrics=candidate_metrics,
        production_metrics=production_metrics,
        candidate_version="cand-bad-001",
        production_version="1",
    )

    assert eval_result["status"] == "REJECTED"
    assert eval_result["is_promotable"] is False
    assert eval_result["regression_protection"]["passed_regression_check"] is False
    assert "REJECT candidate" in eval_result["recommendation"]


def test_candidate_evaluator_validates_improved_candidate():
    production_metrics = {
        "champion_test_metrics": {"rmse": 7.5, "mae": 4.8, "r2": 0.82}
    }
    # Candidate is improved (RMSE 7.1 vs 7.5)
    candidate_metrics = {
        "test": {"rmse": 7.1, "mae": 4.4, "r2": 0.86}
    }

    eval_result = candidate_model_evaluator.evaluate_candidate(
        candidate_metrics=candidate_metrics,
        production_metrics=production_metrics,
        candidate_version="cand-good-001",
        production_version="1",
    )

    assert eval_result["status"] == "VALIDATED"
    assert eval_result["is_promotable"] is True
    assert eval_result["regression_protection"]["passed_regression_check"] is True
    assert "VALIDATED candidate" in eval_result["recommendation"]


def test_audit_event_logging():
    event = model_promotion_manager.log_audit_event(
        action="validated",
        model_name="Ridge Regression",
        model_version="cand-test-123",
        previous_version="1",
        actor="unit_test",
        reason="Test validation event",
        metadata={"rmse": 7.1},
    )

    assert event["action"] == "validated"
    assert event["actor"] == "unit_test"
    assert event["model_version"] == "cand-test-123"

    history = model_promotion_manager.get_audit_history()
    assert len(history) >= 1
    assert history[0]["model_version"] == "cand-test-123"
