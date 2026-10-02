"""
LearnTrack ML: Dataset Drift & Distribution Validation
Computes Population Stability Index (PSI) and Kolmogorov-Smirnov distribution distance
between candidate datasets or production samples and the baseline training reference.
"""

from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from scipy import stats

try:
    from app.core.config import settings
    DEFAULT_WARNING_THRESHOLD = settings.DRIFT_WARNING_THRESHOLD
    DEFAULT_CRITICAL_THRESHOLD = settings.DRIFT_CRITICAL_THRESHOLD
except Exception:
    DEFAULT_WARNING_THRESHOLD = 0.10
    DEFAULT_CRITICAL_THRESHOLD = 0.25


def calculate_psi(expected: np.ndarray, actual: np.ndarray, num_bins: int = 5) -> float:
    """
    Calculates Population Stability Index (PSI) between baseline expected and current actual.
    PSI = sum((Actual% - Expected%) * ln(Actual% / Expected%))
    """
    if len(expected) == 0 or len(actual) == 0:
        return 0.0

    quantiles = np.linspace(0, 100, num_bins + 1)
    bin_edges = np.percentile(expected, quantiles)
    bin_edges[0] = -np.inf
    bin_edges[-1] = np.inf

    expected_counts, _ = np.histogram(expected, bins=bin_edges)
    actual_counts, _ = np.histogram(actual, bins=bin_edges)

    eps = 1e-4
    expected_pct = (expected_counts + eps) / (len(expected) + eps * num_bins)
    actual_pct = (actual_counts + eps) / (len(actual) + eps * num_bins)

    psi_val = np.sum((actual_pct - expected_pct) * np.log(actual_pct / expected_pct))
    return float(round(psi_val, 4))


class DataDriftValidator:
    def __init__(
        self,
        warning_threshold: float = DEFAULT_WARNING_THRESHOLD,
        critical_threshold: float = DEFAULT_CRITICAL_THRESHOLD,
    ):
        self.warning_threshold = warning_threshold
        self.critical_threshold = critical_threshold

    def evaluate_drift(
        self,
        reference_df: pd.DataFrame,
        current_df: pd.DataFrame,
        features: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Evaluates drift for each shared numerical feature between reference and current dataframes.
        """
        if features is None:
            # Shared numerical columns
            ref_num = [c for c in reference_df.columns if pd.api.types.is_numeric_dtype(reference_df[c])]
            curr_num = [c for c in current_df.columns if pd.api.types.is_numeric_dtype(current_df[c])]
            features = [c for c in ref_num if c in curr_num]

        feature_drifts = []
        max_psi = 0.0
        drifted_features = []

        for feat in features:
            ref_vals = reference_df[feat].dropna().values
            curr_vals = current_df[feat].dropna().values

            if len(ref_vals) < 5 or len(curr_vals) < 5:
                continue

            psi_val = calculate_psi(ref_vals, curr_vals)
            max_psi = max(max_psi, psi_val)

            ks_stat, ks_pval = stats.ks_2samp(ref_vals, curr_vals)

            if psi_val < self.warning_threshold:
                tier = "Low Drift"
            elif psi_val < self.critical_threshold:
                tier = "Moderate Drift"
                drifted_features.append(feat)
            else:
                tier = "High Drift"
                drifted_features.append(feat)

            feature_drifts.append({
                "feature": feat,
                "psi": psi_val,
                "ks_statistic": round(float(ks_stat), 4),
                "ks_pvalue": round(float(ks_pval), 4),
                "status": tier,
                "reference_mean": round(float(np.mean(ref_vals)), 2),
                "current_mean": round(float(np.mean(curr_vals)), 2),
                "reference_std": round(float(np.std(ref_vals)), 2),
                "current_std": round(float(np.std(curr_vals)), 2),
            })

        if max_psi >= self.critical_threshold:
            overall_drift_status = "CRITICAL"
        elif max_psi >= self.warning_threshold:
            overall_drift_status = "WARNING"
        else:
            overall_drift_status = "NORMAL"

        return {
            "overall_drift_status": overall_drift_status,
            "max_psi": max_psi,
            "warning_threshold": self.warning_threshold,
            "critical_threshold": self.critical_threshold,
            "drifted_features_count": len(drifted_features),
            "drifted_features": drifted_features,
            "feature_reports": feature_drifts,
        }


data_drift_validator = DataDriftValidator()
