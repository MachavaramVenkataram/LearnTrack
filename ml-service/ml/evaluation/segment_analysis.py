"""
LearnTrack ML: Segment-Level Error Analysis
Analyzes prediction accuracy and errors across target performance bands
and academic feature segments (attendance, study hours, previous scores).
"""

from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd

MIN_OBSERVATIONS_PER_SEGMENT = 5


def analyze_performance_ranges(
    actual: np.ndarray,
    predicted: np.ndarray,
    min_observations: int = MIN_OBSERVATIONS_PER_SEGMENT,
) -> List[Dict[str, Any]]:
    """
    Segments predictions into standard academic performance ranges:
    0–40 (At Risk), 40–60 (Developing), 60–80 (Proficient), 80–100 (Advanced).
    Computes count, MAE, RMSE, Mean Error per segment.
    """
    actual = np.asarray(actual, dtype=float)
    predicted = np.asarray(predicted, dtype=float)

    ranges = [
        {"label": "0–40 (At Risk)", "min": 0.0, "max": 40.0, "inclusive_max": False},
        {"label": "40–60 (Developing)", "min": 40.0, "max": 60.0, "inclusive_max": False},
        {"label": "60–80 (Proficient)", "min": 60.0, "max": 80.0, "inclusive_max": False},
        {"label": "80–100 (Advanced)", "min": 80.0, "max": 100.0, "inclusive_max": True},
    ]

    results = []
    for r in ranges:
        if r["inclusive_max"]:
            mask = (actual >= r["min"]) & (actual <= r["max"])
        else:
            mask = (actual >= r["min"]) & (actual < r["max"])

        count = int(np.sum(mask))
        if count < min_observations:
            results.append({
                "range_label": r["label"],
                "range_min": r["min"],
                "range_max": r["max"],
                "prediction_count": count,
                "insufficient_observations": True,
                "message": "Insufficient observations",
                "mae": None,
                "rmse": None,
                "mean_error": None,
            })
        else:
            act_subset = actual[mask]
            pred_subset = predicted[mask]
            err = act_subset - pred_subset
            abs_err = np.abs(err)

            results.append({
                "range_label": r["label"],
                "range_min": r["min"],
                "range_max": r["max"],
                "prediction_count": count,
                "insufficient_observations": False,
                "message": None,
                "mae": round(float(np.mean(abs_err)), 2),
                "rmse": round(float(np.sqrt(np.mean(err ** 2))), 2),
                "mean_error": round(float(np.mean(err)), 2),
            })

    return results


def analyze_feature_segments(
    actual: np.ndarray,
    predicted: np.ndarray,
    features_df: pd.DataFrame,
    min_observations: int = MIN_OBSERVATIONS_PER_SEGMENT,
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Evaluates error patterns across meaningful academic feature ranges:
    - Attendance percentage
    - Weekly study hours
    - Internal marks
    - Previous score
    """
    actual = np.asarray(actual, dtype=float)
    predicted = np.asarray(predicted, dtype=float)

    feature_definitions = {
        "attendance_percentage": [
            {"label": "0–60% (Low Attendance)", "min": 0.0, "max": 60.0, "inc_max": False},
            {"label": "60–75% (Below Target)", "min": 60.0, "max": 75.0, "inc_max": False},
            {"label": "75–90% (Satisfactory)", "min": 75.0, "max": 90.0, "inc_max": False},
            {"label": "90–100% (High Attendance)", "min": 90.0, "max": 100.0, "inc_max": True},
        ],
        "study_hours": [
            {"label": "< 2 hrs/wk (Minimal)", "min": 0.0, "max": 2.0, "inc_max": False},
            {"label": "2–5 hrs/wk (Moderate)", "min": 2.0, "max": 5.0, "inc_max": False},
            {"label": "5–8 hrs/wk (Focused)", "min": 5.0, "max": 8.0, "inc_max": False},
            {"label": "8+ hrs/wk (High)", "min": 8.0, "max": 60.0, "inc_max": True},
        ],
        "internal_marks": [
            {"label": "0–40 pts (At Risk)", "min": 0.0, "max": 40.0, "inc_max": False},
            {"label": "40–60 pts (Average)", "min": 40.0, "max": 60.0, "inc_max": False},
            {"label": "60–80 pts (Good)", "min": 60.0, "max": 80.0, "inc_max": False},
            {"label": "80–100 pts (Distinction)", "min": 80.0, "max": 100.0, "inc_max": True},
        ],
        "previous_score": [
            {"label": "0–40 pts", "min": 0.0, "max": 40.0, "inc_max": False},
            {"label": "40–60 pts", "min": 40.0, "max": 60.0, "inc_max": False},
            {"label": "60–80 pts", "min": 60.0, "max": 80.0, "inc_max": False},
            {"label": "80–100 pts", "min": 80.0, "max": 100.0, "inc_max": True},
        ],
    }

    results: Dict[str, List[Dict[str, Any]]] = {}

    for feat_col, bins in feature_definitions.items():
        if feat_col not in features_df.columns:
            continue

        feat_vals = features_df[feat_col].values
        segment_list = []

        for b in bins:
            if b["inc_max"]:
                mask = (feat_vals >= b["min"]) & (feat_vals <= b["max"])
            else:
                mask = (feat_vals >= b["min"]) & (feat_vals < b["max"])

            count = int(np.sum(mask))
            if count < min_observations:
                segment_list.append({
                    "segment_label": b["label"],
                    "min": b["min"],
                    "max": b["max"],
                    "count": count,
                    "insufficient_observations": True,
                    "message": "Insufficient observations",
                    "mae": None,
                    "rmse": None,
                    "mean_error": None,
                })
            else:
                act_sub = actual[mask]
                pred_sub = predicted[mask]
                err = act_sub - pred_sub
                abs_err = np.abs(err)

                segment_list.append({
                    "segment_label": b["label"],
                    "min": b["min"],
                    "max": b["max"],
                    "count": count,
                    "insufficient_observations": False,
                    "message": None,
                    "mae": round(float(np.mean(abs_err)), 2),
                    "rmse": round(float(np.sqrt(np.mean(err ** 2))), 2),
                    "mean_error": round(float(np.mean(err)), 2),
                })

        results[feat_col] = segment_list

    return results
