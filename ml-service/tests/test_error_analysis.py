"""
Unit Tests for LearnTrack Model Error Analysis Layer
Tests error calculations, residual diagnostics, range segmentation,
feature segmentation, insufficient observation handling, and error tier classification.
"""

import pytest
import numpy as np
import pandas as pd

from ml.evaluation.residuals import compute_residuals, analyze_residuals
from ml.evaluation.segment_analysis import analyze_performance_ranges, analyze_feature_segments
from ml.evaluation.error_analysis import error_analysis_engine, classify_error_tier


def test_compute_residuals():
    actual = np.array([80.0, 60.0, 90.0])
    predicted = np.array([75.0, 65.0, 90.0])

    res = compute_residuals(actual, predicted)
    np.testing.assert_array_almost_equal(res["error"], np.array([5.0, -5.0, 0.0]))
    np.testing.assert_array_almost_equal(res["absolute_error"], np.array([5.0, 5.0, 0.0]))
    np.testing.assert_array_almost_equal(res["squared_error"], np.array([25.0, 25.0, 0.0]))


def test_classify_error_tier():
    assert classify_error_tier(5.0) == "Typical Error"
    assert classify_error_tier(8.0) == "Typical Error"
    assert classify_error_tier(10.0) == "Elevated Error"
    assert classify_error_tier(15.0) == "Elevated Error"
    assert classify_error_tier(18.0) == "Large Error"


def test_analyze_residuals_output():
    actual = np.linspace(40, 90, 50)
    # Add minor noise
    predicted = actual + np.random.RandomState(42).normal(0, 3, 50)

    res_data = analyze_residuals(actual, predicted)
    assert res_data["status"] == "COMPLETED"
    assert "mean_residual" in res_data
    assert "median_residual" in res_data
    assert "distribution_bins" in res_data
    assert len(res_data["distribution_bins"]) == 10
    assert "scatter_points" in res_data
    assert len(res_data["scatter_points"]) <= 100
    assert len(res_data["guidance"]) >= 1


def test_analyze_performance_ranges():
    actual = np.array([30.0, 35.0, 38.0, 50.0, 55.0, 70.0, 75.0, 85.0, 90.0, 95.0])
    predicted = actual + 2.0

    ranges = analyze_performance_ranges(actual, predicted, min_observations=3)
    assert len(ranges) == 4
    range_map = {r["range_label"]: r for r in ranges}

    # Range 0-40 has 3 items -> should compute metrics
    assert not range_map["0–40 (At Risk)"]["insufficient_observations"]
    assert range_map["0–40 (At Risk)"]["mae"] == 2.0

    # Range 40-60 has 2 items (< 3 min) -> should flag insufficient observations
    assert range_map["40–60 (Developing)"]["insufficient_observations"]
    assert range_map["40–60 (Developing)"]["message"] == "Insufficient observations"
    assert range_map["40–60 (Developing)"]["mae"] is None


def test_analyze_feature_segments():
    df = pd.DataFrame({
        "attendance_percentage": [50.0, 55.0, 70.0, 80.0, 95.0, 96.0, 98.0, 99.0],
        "study_hours": [1.0, 1.5, 3.0, 4.0, 6.0, 7.0, 10.0, 12.0],
    })
    actual = np.array([60, 65, 70, 75, 80, 85, 90, 95])
    predicted = actual + 1.0

    feat_segments = analyze_feature_segments(actual, predicted, df, min_observations=2)
    assert "attendance_percentage" in feat_segments
    assert "study_hours" in feat_segments

    # Check high attendance segment (90-100%) has 4 observations -> sufficient
    high_att = [s for s in feat_segments["attendance_percentage"] if "90–100%" in s["segment_label"]][0]
    assert not high_att["insufficient_observations"]
    assert high_att["count"] == 4
    assert high_att["mae"] == 1.0


def test_error_analysis_engine_end_to_end():
    actual = np.random.RandomState(42).uniform(40, 95, 80)
    predicted = actual + np.random.RandomState(42).normal(0, 4, 80)
    features_df = pd.DataFrame({
        "attendance_percentage": np.random.RandomState(42).uniform(60, 100, 80),
        "study_hours": np.random.RandomState(42).uniform(1, 15, 80),
    })

    report = error_analysis_engine.analyze(
        actual=actual,
        predicted=predicted,
        features_df=features_df,
        model_name="Test Model",
        model_version="1",
        dataset_version="1.0.0",
        evaluation_type="BENCHMARK",
    )

    assert report["evaluation_type"] == "BENCHMARK"
    assert report["status"] == "COMPLETED"
    assert report["sample_count"] == 80
    assert report["metrics"]["mae"] > 0
    assert report["metrics"]["rmse"] > 0
    assert "r2" in report["metrics"]
    assert len(report["largest_errors"]) <= 15
    # Largest errors should be sorted descending by absolute error
    errors = [e["absolute_error"] for e in report["largest_errors"]]
    assert errors == sorted(errors, reverse=True)
