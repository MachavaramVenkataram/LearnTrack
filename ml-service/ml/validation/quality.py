"""
LearnTrack ML: Data Quality & Validation Engine
Performs rigorous schema validation, missing value analysis, duplicate detection,
domain-range boundary checks, IQR outlier detection, and target distribution validation.
"""

from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
import datetime
from ml.validation.schema import (
    ACADEMIC_DATASET_SCHEMA,
    DATA_QUALITY_MAX_MISSING_PERCENT,
    DATA_QUALITY_CRITICAL_MISSING_PERCENT,
    DATA_QUALITY_MAX_DUPLICATE_PERCENT,
    DATA_QUALITY_OUTLIER_IQR_MULTIPLIER,
)

class DataValidationError(Exception):
    """Raised when a dataset fails critical data quality and schema requirements."""
    def __init__(self, message: str, report: Dict[str, Any]):
        super().__init__(message)
        self.message = message
        self.report = report

class DataQualityValidator:
    def __init__(self, schema=None):
        self.schema = schema or ACADEMIC_DATASET_SCHEMA

    def validate(self, df: pd.DataFrame, dataset_version: str = "1.0.0") -> Dict[str, Any]:
        """
        Validates dataset integrity across 6 critical dimensions and generates
        a comprehensive, reproducible Data Quality Report.
        """
        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
        total_rows, total_cols = df.shape

        issues: List[str] = []
        warnings: List[str] = []

        if total_rows == 0:
            return {
                "status": "FAILED",
                "timestamp": timestamp,
                "dataset_version": dataset_version,
                "total_rows": 0,
                "total_columns": total_cols,
                "overall_status": "FAILED",
                "critical_error": "Dataset is empty (0 rows).",
                "checks": {},
                "issues": ["Dataset is empty."],
                "warnings": [],
            }

        # -------------------------------------------------------------
        # 1. Schema Validation (Required columns, types, target)
        # -------------------------------------------------------------
        schema_status = "PASS"
        missing_columns: List[str] = []
        dtype_mismatches: Dict[str, Dict[str, str]] = {}
        target_found = False

        for col_name, constraint in self.schema.items():
            if constraint.is_target:
                target_col = col_name

            if col_name not in df.columns:
                missing_columns.append(col_name)
                issues.append(f"Missing required column: '{col_name}'")
                schema_status = "FAIL"
            else:
                if constraint.is_target:
                    target_found = True
                # Type sanity check
                actual_dtype = str(df[col_name].dtype)
                if constraint.dtype in ["float", "int"]:
                    if not pd.api.types.is_numeric_dtype(df[col_name]):
                        dtype_mismatches[col_name] = {
                            "expected": constraint.dtype,
                            "actual": actual_dtype
                        }
                        issues.append(f"Column '{col_name}' has non-numeric type: {actual_dtype}")
                        schema_status = "FAIL"

        if not target_found and "final_score" not in df.columns:
            issues.append("Target column 'final_score' is missing.")
            schema_status = "FAIL"

        schema_check = {
            "status": schema_status,
            "missing_columns": missing_columns,
            "dtype_mismatches": dtype_mismatches,
            "target_present": target_found,
            "required_columns_count": len(self.schema),
            "present_columns_count": sum(1 for c in self.schema if c in df.columns)
        }

        # -------------------------------------------------------------
        # 2. Missing Value Analysis
        # -------------------------------------------------------------
        missing_status = "PASS"
        missing_by_feature: Dict[str, Dict[str, Any]] = {}
        total_missing = int(df.isnull().sum().sum())

        for col in df.columns:
            miss_count = int(df[col].isnull().sum())
            miss_pct = round((miss_count / total_rows) * 100, 2)
            missing_by_feature[col] = {
                "missing_count": miss_count,
                "missing_percentage": miss_pct,
            }

            if miss_pct >= DATA_QUALITY_CRITICAL_MISSING_PERCENT:
                issues.append(f"Critical missing values in '{col}': {miss_pct}%")
                missing_status = "FAIL"
            elif miss_pct >= DATA_QUALITY_MAX_MISSING_PERCENT:
                warnings.append(f"High missing values in '{col}': {miss_pct}%")
                if missing_status != "FAIL":
                    missing_status = "WARNING"

        missing_check = {
            "status": missing_status,
            "total_missing_cells": total_missing,
            "missing_percentage_overall": round((total_missing / (total_rows * max(total_cols, 1))) * 100, 2),
            "feature_breakdown": missing_by_feature,
        }

        # -------------------------------------------------------------
        # 3. Duplicate Record Detection
        # -------------------------------------------------------------
        duplicates_count = int(df.duplicated().sum())
        duplicate_pct = round((duplicates_count / total_rows) * 100, 2)
        duplicate_status = "PASS"

        if duplicate_pct > DATA_QUALITY_MAX_DUPLICATE_PERCENT:
            warnings.append(f"Elevated duplicate row rate: {duplicate_pct}% ({duplicates_count} rows)")
            duplicate_status = "WARNING"

        duplicates_check = {
            "status": duplicate_status,
            "duplicate_rows": duplicates_count,
            "duplicate_percentage": duplicate_pct,
        }

        # -------------------------------------------------------------
        # 4. Numeric Range Validation
        # -------------------------------------------------------------
        ranges_status = "PASS"
        range_violations: Dict[str, Dict[str, Any]] = {}

        for col_name, constraint in self.schema.items():
            if col_name in df.columns and pd.api.types.is_numeric_dtype(df[col_name]):
                col_series = df[col_name].dropna()
                below_min = int((col_series < constraint.min_value).sum()) if constraint.min_value is not None else 0
                above_max = int((col_series > constraint.max_value).sum()) if constraint.max_value is not None else 0
                total_violations = below_min + above_max

                if total_violations > 0:
                    violation_pct = round((total_violations / max(len(col_series), 1)) * 100, 2)
                    range_violations[col_name] = {
                        "min_allowed": constraint.min_value,
                        "max_allowed": constraint.max_value,
                        "below_min_count": below_min,
                        "above_max_count": above_max,
                        "violation_count": total_violations,
                        "violation_percentage": violation_pct,
                    }
                    if violation_pct > 10.0:
                        issues.append(f"Significant range violations in '{col_name}': {violation_pct}% out of bounds")
                        ranges_status = "FAIL"
                    else:
                        warnings.append(f"Minor out-of-range observations in '{col_name}': {total_violations} rows")
                        if ranges_status != "FAIL":
                            ranges_status = "WARNING"

        ranges_check = {
            "status": ranges_status,
            "violation_columns_count": len(range_violations),
            "details": range_violations,
        }

        # -------------------------------------------------------------
        # 5. Categorical Validation
        # -------------------------------------------------------------
        categories_status = "PASS"
        categorical_violations: Dict[str, Dict[str, Any]] = {}

        for col_name, constraint in self.schema.items():
            if constraint.allowed_values and col_name in df.columns:
                invalid_cats = df[~df[col_name].isin(constraint.allowed_values)][col_name].dropna().unique().tolist()
                if len(invalid_cats) > 0:
                    categorical_violations[col_name] = {
                        "allowed": constraint.allowed_values,
                        "invalid_values": invalid_cats
                    }
                    warnings.append(f"Unexpected categorical values in '{col_name}': {invalid_cats}")
                    categories_status = "WARNING"

        categories_check = {
            "status": categories_status,
            "violations": categorical_violations
        }

        # -------------------------------------------------------------
        # 6. Outlier Detection (Tukey's IQR Method)
        # -------------------------------------------------------------
        outliers_status = "PASS"
        outlier_details: Dict[str, Dict[str, Any]] = {}
        total_outliers_found = 0

        numeric_cols = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]

        for col in numeric_cols:
            col_series = df[col].dropna()
            if len(col_series) >= 4:
                q1 = float(col_series.quantile(0.25))
                q3 = float(col_series.quantile(0.75))
                iqr = q3 - q1
                lower_bound = round(q1 - DATA_QUALITY_OUTLIER_IQR_MULTIPLIER * iqr, 2)
                upper_bound = round(q3 + DATA_QUALITY_OUTLIER_IQR_MULTIPLIER * iqr, 2)

                outlier_mask = (col_series < lower_bound) | (col_series > upper_bound)
                outlier_count = int(outlier_mask.sum())
                outlier_pct = round((outlier_count / len(col_series)) * 100, 2)

                total_outliers_found += outlier_count
                outlier_details[col] = {
                    "q1": round(q1, 2),
                    "q3": round(q3, 2),
                    "iqr": round(iqr, 2),
                    "lower_bound": lower_bound,
                    "upper_bound": upper_bound,
                    "outlier_count": outlier_count,
                    "outlier_percentage": outlier_pct,
                }

                if outlier_pct > 15.0:
                    warnings.append(f"Elevated outlier rate in '{col}': {outlier_pct}%")
                    if outliers_status != "FAIL":
                        outliers_status = "WARNING"

        outliers_check = {
            "status": outliers_status,
            "method": "IQR (Tukey's Fences 1.5x)",
            "total_outliers": total_outliers_found,
            "feature_details": outlier_details,
        }

        # -------------------------------------------------------------
        # 7. Target Distribution Check
        # -------------------------------------------------------------
        target_check_status = "PASS"
        target_stats: Dict[str, Any] = {}

        target_col = "final_score" if "final_score" in df.columns else None
        if target_col and pd.api.types.is_numeric_dtype(df[target_col]):
            t_series = df[target_col].dropna()
            t_min = float(t_series.min())
            t_max = float(t_series.max())
            t_mean = float(t_series.mean())
            t_std = float(t_series.std()) if len(t_series) > 1 else 0.0
            t_median = float(t_series.median())

            target_stats = {
                "target_column": target_col,
                "count": len(t_series),
                "min": round(t_min, 2),
                "max": round(t_max, 2),
                "mean": round(t_mean, 2),
                "median": round(t_median, 2),
                "std": round(t_std, 2),
            }

            if t_min < 0 or t_max > 100:
                issues.append(f"Target '{target_col}' contains out-of-scale values: [{t_min}, {t_max}]")
                target_check_status = "FAIL"
            elif t_std < 1.0 and len(t_series) > 10:
                warnings.append(f"Target '{target_col}' has near-zero variance (std={round(t_std, 2)})")
                target_check_status = "WARNING"
        else:
            target_check_status = "FAIL"
            issues.append("Target variable not found or non-numeric.")

        target_check = {
            "status": target_check_status,
            "statistics": target_stats,
        }

        # -------------------------------------------------------------
        # Overall Status Determination
        # -------------------------------------------------------------
        if schema_status == "FAIL" or ranges_status == "FAIL" or missing_status == "FAIL" or target_check_status == "FAIL":
            overall_status = "FAILED"
        elif (
            schema_status == "WARNING"
            or missing_status == "WARNING"
            or duplicates_check["status"] == "WARNING"
            or ranges_status == "WARNING"
            or categories_status == "WARNING"
            or outliers_status == "WARNING"
            or target_check_status == "WARNING"
        ):
            overall_status = "WARNING"
        else:
            overall_status = "PASSED"

        report = {
            "status": overall_status,
            "overall_status": overall_status,
            "timestamp": timestamp,
            "dataset_version": dataset_version,
            "total_rows": total_rows,
            "total_columns": total_cols,
            "numeric_columns": numeric_cols,
            "categorical_columns": [c for c in df.columns if c not in numeric_cols],
            "missing_values": total_missing,
            "duplicate_rows": duplicates_count,
            "checks": {
                "schema": schema_check,
                "missing_values": missing_check,
                "duplicates": duplicates_check,
                "ranges": ranges_check,
                "categories": categories_check,
                "outliers": outliers_check,
                "target": target_check,
            },
            "issues": issues,
            "warnings": warnings,
        }
        return report

    def validate_and_enforce(self, df: pd.DataFrame, dataset_version: str = "1.0.0") -> Dict[str, Any]:
        """
        Runs validation and STOPS execution if critical failure is detected.
        """
        report = self.validate(df, dataset_version=dataset_version)
        if report["overall_status"] == "FAILED":
            reasons = "; ".join(report["issues"]) if report["issues"] else "Critical data validation failed."
            raise DataValidationError(f"Dataset validation failed: {reasons}", report=report)
        return report

data_quality_validator = DataQualityValidator()
