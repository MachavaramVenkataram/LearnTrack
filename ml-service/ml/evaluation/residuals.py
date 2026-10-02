"""
LearnTrack ML: Residual Analysis Module
Computes residual distributions, bias statistics, heteroscedasticity indicators,
and domain-grounded diagnostic guidance.
"""

from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import pandas as pd
from scipy import stats


def compute_residuals(actual: np.ndarray, predicted: np.ndarray) -> Dict[str, np.ndarray]:
    """
    Computes mathematical errors:
    error = actual - predicted
    absolute_error = abs(error)
    squared_error = error^2
    """
    actual = np.asarray(actual, dtype=float)
    predicted = np.asarray(predicted, dtype=float)

    error = actual - predicted
    abs_error = np.abs(error)
    sq_error = error ** 2

    return {
        "error": error,
        "absolute_error": abs_error,
        "squared_error": sq_error,
    }


def analyze_residuals(
    actual: np.ndarray,
    predicted: np.ndarray,
    num_bins: int = 10,
    max_scatter_points: int = 100,
) -> Dict[str, Any]:
    """
    Performs residual distribution analysis, error histogram binning,
    and diagnostic interpretation.
    """
    if len(actual) == 0 or len(predicted) == 0:
        return {
            "status": "INSUFFICIENT_DATA",
            "message": "Insufficient observations for residual analysis.",
        }

    res_data = compute_residuals(actual, predicted)
    errors = res_data["error"]
    abs_errors = res_data["absolute_error"]

    mean_res = float(np.mean(errors))
    median_res = float(np.median(errors))
    std_res = float(np.std(errors)) if len(errors) > 1 else 0.0
    skewness = float(stats.skew(errors)) if len(errors) > 2 else 0.0

    # Diagnostic Interpretation Guidance (Avoid automated over-diagnosis)
    guidance: List[str] = []
    if abs(mean_res) > 2.0:
        direction = "under-predicting" if mean_res > 0 else "over-predicting"
        guidance.append(
            f"Systematic bias detected: Average residual is {round(mean_res, 2)} pts, indicating the model tends toward {direction} outcomes."
        )
    else:
        guidance.append("Mean residual is close to zero, showing balanced predictions across the target range.")

    # Heteroscedasticity correlation check: correlation between predicted score and absolute error
    if len(predicted) > 10 and np.std(predicted) > 0 and np.std(abs_errors) > 0:
        corr, pval = stats.pearsonr(predicted, abs_errors)
        if pval < 0.05 and abs(corr) > 0.25:
            trend = "higher" if corr > 0 else "lower"
            guidance.append(
                f"Concentration of error: Absolute errors moderately correlate with predicted score (r={round(corr, 2)}), with wider dispersion at {trend} predicted marks."
            )
        else:
            guidance.append("Residual variance is relatively stable across lower and higher score regimes.")

    # Histogram Distribution
    min_err = float(np.min(errors))
    max_err = float(np.max(errors))
    # Ensure distinct bin edges
    if min_err == max_err:
        min_err -= 1.0
        max_err += 1.0

    counts, bin_edges = np.histogram(errors, bins=num_bins, range=(min_err, max_err))
    distribution_bins = []
    for i in range(len(counts)):
        b_min = round(float(bin_edges[i]), 1)
        b_max = round(float(bin_edges[i + 1]), 1)
        distribution_bins.append({
            "bin_label": f"{b_min} to {b_max}",
            "bin_min": b_min,
            "bin_max": b_max,
            "count": int(counts[i]),
            "percentage": round(float(counts[i] / len(errors) * 100), 1),
        })

    # Sample points for Actual vs Predicted and Residual vs Predicted charts
    n_samples = len(actual)
    if n_samples > max_scatter_points:
        indices = np.random.RandomState(42).choice(n_samples, max_scatter_points, replace=False)
    else:
        indices = np.arange(n_samples)

    scatter_points = []
    for idx in indices:
        scatter_points.append({
            "actual": round(float(actual[idx]), 1),
            "predicted": round(float(predicted[idx]), 1),
            "residual": round(float(errors[idx]), 1),
            "absolute_error": round(float(abs_errors[idx]), 1),
        })

    return {
        "status": "COMPLETED",
        "sample_count": n_samples,
        "mean_residual": round(mean_res, 3),
        "median_residual": round(median_res, 3),
        "std_residual": round(std_res, 3),
        "skewness": round(skewness, 3),
        "distribution_bins": distribution_bins,
        "scatter_points": scatter_points,
        "guidance": guidance,
    }
