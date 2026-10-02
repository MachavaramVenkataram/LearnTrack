"""
Unit tests for feature engineering transformations.
"""

import pytest
import pandas as pd
import numpy as np
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.features.feature_engineering import engineer_features_dict, FEATURE_NAMES

def test_engineer_features_columns_and_values():
    raw_data = {
        "attendance_percentage": 70.0,
        "assignment_score": 80.0,
        "internal_marks": 85.0,
        "previous_score": 75.0,
        "study_hours": 10.0,
        "assignments_completed": 5,
    }

    df_engineered = engineer_features_dict(raw_data)

    # Verify column count and exact expected names
    assert list(df_engineered.columns) == FEATURE_NAMES

    # Verify derived calculations
    # average_assessment_score = 0.55 * 85 + 0.45 * 80 = 46.75 + 36.0 = 82.75
    assert df_engineered["average_assessment_score"].iloc[0] == 82.75

    # previous_performance_trend = 85 - 75 = 10.0
    assert df_engineered["previous_performance_trend"].iloc[0] == 10.0

    # attendance_risk_flag = 70.0 < 75.0 -> 1.0
    assert df_engineered["attendance_risk_flag"].iloc[0] == 1.0

    # study_intensity_ratio = 10.0 / 5 = 2.0
    assert df_engineered["study_intensity_ratio"].iloc[0] == 2.0
