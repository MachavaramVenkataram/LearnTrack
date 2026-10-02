"""
LearnTrack ML: Feature Engineering Layer
Computes derived educational features for both training and real-time inference.
Guarantees identical feature transformations across environments.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List

FEATURE_NAMES: List[str] = [
    # Base Academic Features
    "attendance_percentage",
    "assignment_score",
    "internal_marks",
    "previous_score",
    "study_hours",
    "assignments_completed",
    # Derived Engineered Features
    "average_assessment_score",
    "previous_performance_trend",
    "attendance_risk_flag",
    "study_intensity_ratio",
    "weighted_academic_score",
]

def engineer_features(data: pd.DataFrame) -> pd.DataFrame:
    """
    Transforms raw input features into full feature matrix for ML inference and training.
    """
    df = data.copy()

    # 1. Composite assessment score (proximal coursework)
    df["average_assessment_score"] = np.round(
        0.55 * df["internal_marks"] + 0.45 * df["assignment_score"], 2
    )

    # 2. Performance trajectory / trend between internal marks and previous score
    df["previous_performance_trend"] = np.round(
        df["internal_marks"] - df["previous_score"], 2
    )

    # 3. Attendance below critical institutional 75% threshold
    df["attendance_risk_flag"] = (df["attendance_percentage"] < 75.0).astype(float)

    # 4. Study intensity ratio (hours per completed assignment)
    assignments_safe = np.maximum(1.0, df["assignments_completed"].astype(float))
    df["study_intensity_ratio"] = np.round(df["study_hours"] / assignments_safe, 2)

    # 5. Longitudinal weighted composite academic indicator
    df["weighted_academic_score"] = np.round(
        0.40 * df["previous_score"] +
        0.35 * df["internal_marks"] +
        0.15 * df["assignment_score"] +
        0.10 * df["attendance_percentage"], 2
    )

    # Ensure consistent column ordering
    return df[FEATURE_NAMES]


def engineer_features_dict(raw: Dict[str, Any]) -> pd.DataFrame:
    """
    Convenience helper for single-record prediction payloads.
    """
    df_single = pd.DataFrame([raw])
    return engineer_features(df_single)
