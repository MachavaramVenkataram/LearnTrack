"""
LearnTrack ML: Data Quality & Schema Validation Schemas
Defines request and response models for /data-quality endpoints.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ColumnValidationDetail(BaseModel):
    name: str
    dtype: str
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    allowed_values: Optional[List[str]] = None
    allow_null: bool = False
    is_target: bool = False

class DataQualityCheckSummary(BaseModel):
    status: str
    details: Optional[Dict[str, Any]] = None

class DataQualityReportResponse(BaseModel):
    status: str
    overall_status: str
    timestamp: str
    dataset_version: str
    total_rows: int
    total_columns: int
    numeric_columns: List[str] = Field(default_factory=list)
    categorical_columns: List[str] = Field(default_factory=list)
    missing_values: int = 0
    duplicate_rows: int = 0
    checks: Dict[str, Any] = Field(default_factory=dict)
    issues: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)

class DataQualityValidateRequest(BaseModel):
    dataset_version: Optional[str] = "1.0.0"
    enforce_strict: bool = False

class DataQualityHistoryItem(BaseModel):
    timestamp: Optional[str] = None
    dataset_version: Optional[str] = None
    status: Optional[str] = None
    total_rows: Optional[int] = None
    total_columns: Optional[int] = None
    missing_values: Optional[int] = 0
    duplicate_rows: Optional[int] = 0
    issues_count: Optional[int] = 0
    warnings_count: Optional[int] = 0
    filename: Optional[str] = None
