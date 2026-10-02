"""
LearnTrack ML: Data Quality & Schema Validation Route
Exposes dataset integrity verification, missing values, duplicates, numeric ranges,
outliers, target distribution, and historical validation audit reports.
"""

import os
import pandas as pd
from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional

from app.schemas.data_quality import (
    DataQualityReportResponse,
    DataQualityValidateRequest,
    DataQualityHistoryItem,
)
from ml.validation.quality import data_quality_validator, DataValidationError
from ml.validation.report import data_quality_report_store
from app.core.config import settings

router = APIRouter(prefix="/data-quality", tags=["Data Quality & Validation"])


@router.get("/latest", response_model=DataQualityReportResponse)
def get_latest_data_quality_report() -> DataQualityReportResponse:
    """
    Returns the most recent validated Data Quality Report.
    If no report exists, executes validation on the active academic dataset and saves it.
    """
    report = data_quality_report_store.get_latest_report()
    if report:
        return DataQualityReportResponse(**report)

    # Generate initial validation report on reference dataset
    data_path = os.path.join(settings.DATA_DIR, "processed", "academic_performance.csv")
    if not os.path.exists(data_path):
        raise HTTPException(
            status_code=404,
            detail="Processed academic performance dataset is missing from data directory."
        )

    df = pd.read_csv(data_path)
    report = data_quality_validator.validate(df, dataset_version="1.0.0")
    data_quality_report_store.save_report(report)
    return DataQualityReportResponse(**report)


@router.post("/validate", response_model=DataQualityReportResponse)
def run_data_validation(payload: Optional[DataQualityValidateRequest] = None) -> DataQualityReportResponse:
    """
    Executes dataset integrity verification on demand across all 6 validation dimensions.
    Stops and returns structured validation error if critical requirements fail.
    """
    version = payload.dataset_version if payload else "1.0.0"
    data_path = os.path.join(settings.DATA_DIR, "processed", "academic_performance.csv")
    if not os.path.exists(data_path):
        raise HTTPException(
            status_code=404,
            detail=f"Dataset not found at {data_path}."
        )

    try:
        df = pd.read_csv(data_path)
        if payload and payload.enforce_strict:
            report = data_quality_validator.validate_and_enforce(df, dataset_version=version)
        else:
            report = data_quality_validator.validate(df, dataset_version=version)

        data_quality_report_store.save_report(report)
        return DataQualityReportResponse(**report)
    except DataValidationError as e:
        data_quality_report_store.save_report(e.report)
        raise HTTPException(
            status_code=422,
            detail={
                "error": "Dataset failed critical validation.",
                "message": e.message,
                "report": e.report,
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data validation error: {str(e)}")


@router.get("/history", response_model=List[DataQualityHistoryItem])
def get_validation_history() -> List[DataQualityHistoryItem]:
    """
    Returns timeline index of past data quality and schema validation reports.
    """
    history = data_quality_report_store.get_history_summary()
    return [DataQualityHistoryItem(**h) for h in history]
