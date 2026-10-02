"""
Unit Tests for LearnTrack Data Quality & Validation Engine
Tests schema enforcement, range checks, missing values, duplicates, outliers,
target distribution, and critical stop-training behavior.
"""

import pytest
import pandas as pd
import numpy as np

from ml.validation.schema import ACADEMIC_DATASET_SCHEMA
from ml.validation.quality import data_quality_validator, DataValidationError, DataQualityValidator


@pytest.fixture
def valid_dataset():
    """Provides valid academic performance dataframe."""
    np.random.seed(42)
    n = 100
    return pd.DataFrame({
        "attendance_percentage": np.random.uniform(70.0, 100.0, n),
        "assignment_score": np.random.uniform(40.0, 95.0, n),
        "internal_marks": np.random.uniform(35.0, 90.0, n),
        "previous_score": np.random.uniform(40.0, 95.0, n),
        "study_hours": np.random.uniform(2.0, 25.0, n),
        "assignments_completed": np.random.randint(4, 10, n),
        "final_score": np.random.uniform(40.0, 95.0, n),
    })


def test_valid_dataset_passes(valid_dataset):
    report = data_quality_validator.validate(valid_dataset)
    assert report["overall_status"] in ["PASSED", "WARNING"]
    assert report["total_rows"] == 100
    assert report["total_columns"] == 7
    assert report["checks"]["schema"]["status"] == "PASS"
    assert report["checks"]["target"]["status"] == "PASS"


def test_missing_column_fails_validation(valid_dataset):
    broken_df = valid_dataset.drop(columns=["internal_marks"])
    report = data_quality_validator.validate(broken_df)
    assert report["overall_status"] == "FAILED"
    assert "Missing required column: 'internal_marks'" in report["issues"]


def test_validate_and_enforce_raises_error_on_critical_failure(valid_dataset):
    broken_df = valid_dataset.drop(columns=["final_score"])  # Missing target
    with pytest.raises(DataValidationError) as exc_info:
        data_quality_validator.validate_and_enforce(broken_df)
    assert "validation failed" in str(exc_info.value).lower()
    assert exc_info.value.report["overall_status"] == "FAILED"


def test_empty_dataset_fails():
    empty_df = pd.DataFrame()
    report = data_quality_validator.validate(empty_df)
    assert report["overall_status"] == "FAILED"
    assert report["total_rows"] == 0


def test_critical_missing_values_fails(valid_dataset):
    corrupt_df = valid_dataset.copy()
    # Null out 60% of attendance
    corrupt_df.loc[:60, "attendance_percentage"] = np.nan
    report = data_quality_validator.validate(corrupt_df)
    assert report["overall_status"] == "FAILED"
    assert any("Critical missing values" in issue for issue in report["issues"])


def test_moderate_missing_values_triggers_warning(valid_dataset):
    warn_df = valid_dataset.copy()
    # Null out 25% of study_hours (exceeds 20% max threshold but < 50%)
    warn_df.loc[:25, "study_hours"] = np.nan
    report = data_quality_validator.validate(warn_df)
    assert report["checks"]["missing_values"]["status"] in ["WARNING", "FAIL"]
    assert any("High missing values" in w for w in report["warnings"])


def test_duplicate_rows_triggers_warning(valid_dataset):
    dup_df = pd.concat([valid_dataset, valid_dataset.iloc[:20]], ignore_index=True)
    report = data_quality_validator.validate(dup_df)
    assert report["checks"]["duplicates"]["duplicate_rows"] == 20
    assert report["checks"]["duplicates"]["status"] == "WARNING"


def test_out_of_bounds_range_violations_detected(valid_dataset):
    range_df = valid_dataset.copy()
    # Set 20% of attendance to 150% (max allowed is 100%)
    range_df.loc[:20, "attendance_percentage"] = 150.0
    report = data_quality_validator.validate(range_df)
    assert report["overall_status"] == "FAILED"
    assert any("range violations" in issue for issue in report["issues"])


def test_iqr_outlier_detection(valid_dataset):
    outlier_df = valid_dataset.copy()
    # Inject high outliers in study_hours
    outlier_df.loc[0, "study_hours"] = 55.0
    report = data_quality_validator.validate(outlier_df)
    outlier_check = report["checks"]["outliers"]
    assert outlier_check["total_outliers"] >= 1
    assert "study_hours" in outlier_check["feature_details"]


def test_target_distribution_statistics(valid_dataset):
    report = data_quality_validator.validate(valid_dataset)
    target_stats = report["checks"]["target"]["statistics"]
    assert "mean" in target_stats
    assert "median" in target_stats
    assert "std" in target_stats
    assert "min" in target_stats
    assert "max" in target_stats
    assert target_stats["min"] >= 0.0
    assert target_stats["max"] <= 100.0
