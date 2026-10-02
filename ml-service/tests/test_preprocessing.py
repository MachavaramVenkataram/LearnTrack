"""
Unit tests for data preprocessing and validation.
"""

import pytest
import pandas as pd
import numpy as np
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.preprocessing.preprocessing import validate_raw_features, split_academic_data

def test_validate_raw_features_valid():
    valid_payload = {
        "attendance_percentage": 85.0,
        "assignment_score": 80.0,
        "internal_marks": 75.0,
        "previous_score": 70.0,
        "study_hours": 12.0,
        "assignments_completed": 8,
    }
    is_valid, msg = validate_raw_features(valid_payload)
    assert is_valid is True
    assert msg == ""

def test_validate_raw_features_out_of_bounds():
    # Attendance > 100
    invalid_payload = {
        "attendance_percentage": 105.0,
        "assignment_score": 80.0,
        "internal_marks": 75.0,
        "previous_score": 70.0,
        "study_hours": 12.0,
        "assignments_completed": 8,
    }
    is_valid, msg = validate_raw_features(invalid_payload)
    assert is_valid is False
    assert "outside allowed range" in msg

def test_validate_raw_features_missing_field():
    invalid_payload = {
        "attendance_percentage": 85.0,
        "assignment_score": 80.0,
        # Missing internal_marks
        "previous_score": 70.0,
        "study_hours": 12.0,
        "assignments_completed": 8,
    }
    is_valid, msg = validate_raw_features(invalid_payload)
    assert is_valid is False
    assert "Missing required feature" in msg

def test_split_academic_data_no_leakage():
    # Synthetic dataframe for testing split functionality
    np.random.seed(42)
    df = pd.DataFrame({
        "attendance_percentage": np.random.uniform(50, 100, 100),
        "assignment_score": np.random.uniform(50, 100, 100),
        "internal_marks": np.random.uniform(50, 100, 100),
        "previous_score": np.random.uniform(50, 100, 100),
        "study_hours": np.random.uniform(2, 20, 100),
        "assignments_completed": np.random.randint(0, 10, 100),
        "final_score": np.random.uniform(40, 100, 100),
    })

    X_train, y_train, X_val, y_val, X_test, y_test = split_academic_data(
        df, target_col="final_score", test_size=0.15, val_size=0.15, random_state=42
    )

    # Total sum is 100 with approximately 70% train, 15% val, 15% test
    assert len(X_train) + len(X_val) + len(X_test) == 100
    assert 68 <= len(X_train) <= 72
    assert 14 <= len(X_val) <= 16
    assert 14 <= len(X_test) <= 16

    # Check index mutual exclusivity (no data leakage)
    train_idx = set(X_train.index)
    val_idx = set(X_val.index)
    test_idx = set(X_test.index)

    assert len(train_idx.intersection(val_idx)) == 0
    assert len(train_idx.intersection(test_idx)) == 0
    assert len(val_idx.intersection(test_idx)) == 0
