"""
LearnTrack ML: Data Preprocessing & Validation Pipeline
Handles range checks, missing value imputation, and train/val/test splits without data leakage.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from typing import Tuple, Dict, Any

RAW_FEATURE_RANGES = {
    "attendance_percentage": (0.0, 100.0),
    "assignment_score": (0.0, 100.0),
    "internal_marks": (0.0, 100.0),
    "previous_score": (0.0, 100.0),
    "study_hours": (0.0, 168.0),
    "assignments_completed": (0, 100),
}

def validate_raw_features(data: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Validates that incoming student features conform to expected academic boundaries.
    """
    for feature, (min_val, max_val) in RAW_FEATURE_RANGES.items():
        if feature not in data:
            return False, f"Missing required feature: '{feature}'"
        val = data[feature]
        if not isinstance(val, (int, float)):
            return False, f"Feature '{feature}' must be numeric, got {type(val).__name__}"
        if np.isnan(val):
            return False, f"Feature '{feature}' cannot be NaN"
        if val < min_val or val > max_val:
            return False, f"Feature '{feature}' value {val} is outside allowed range [{min_val}, {max_val}]"
    return True, ""


def split_academic_data(
    df: pd.DataFrame,
    target_col: str = "final_score",
    test_size: float = 0.15,
    val_size: float = 0.15,
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.Series, pd.DataFrame, pd.Series, pd.DataFrame, pd.Series]:
    """
    Splits dataset into 70% Train, 15% Validation, and 15% Test.
    Strictly prevents data leakage by holding out validation and test partitions.
    """
    X = df.drop(columns=[target_col])
    y = df[target_col]

    # First split off test set (15%)
    X_temp, X_test, y_temp, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    # Next split remaining into train (70% total) and validation (15% total)
    val_ratio_adjusted = val_size / (1.0 - test_size)
    X_train, X_val, y_train, y_val = train_test_split(
        X_temp, y_temp, test_size=val_ratio_adjusted, random_state=random_state
    )

    return X_train, y_train, X_val, y_val, X_test, y_test
