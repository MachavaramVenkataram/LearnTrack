"""
LearnTrack ML: Model Error Analysis Schemas
Defines request and response models for /error-analysis endpoints.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ErrorGlobalMetrics(BaseModel):
    mae: Optional[float] = None
    rmse: Optional[float] = None
    r2: Optional[float] = None
    mean_error: Optional[float] = None
    median_error: Optional[float] = None
    median_absolute_error: Optional[float] = None
    max_absolute_error: Optional[float] = None
    sample_count: int = 0

class RangeSegmentItem(BaseModel):
    range_label: str
    range_min: float
    range_max: float
    prediction_count: int
    insufficient_observations: bool = False
    message: Optional[str] = None
    mae: Optional[float] = None
    rmse: Optional[float] = None
    mean_error: Optional[float] = None

class FeatureSegmentItem(BaseModel):
    segment_label: str
    min: float
    max: float
    count: int
    insufficient_observations: bool = False
    message: Optional[str] = None
    mae: Optional[float] = None
    rmse: Optional[float] = None
    mean_error: Optional[float] = None

class DistributionBin(BaseModel):
    bin_label: str
    bin_min: float
    bin_max: float
    count: int
    percentage: float

class ScatterPoint(BaseModel):
    actual: float
    predicted: float
    residual: float
    absolute_error: float

class ResidualAnalysisData(BaseModel):
    status: str
    sample_count: Optional[int] = 0
    mean_residual: Optional[float] = None
    median_residual: Optional[float] = None
    std_residual: Optional[float] = None
    skewness: Optional[float] = None
    distribution_bins: List[DistributionBin] = Field(default_factory=list)
    scatter_points: List[ScatterPoint] = Field(default_factory=list)
    guidance: List[str] = Field(default_factory=list)

class LargestErrorItem(BaseModel):
    rank: int
    actual: float
    predicted: float
    error: float
    absolute_error: float
    error_tier: str
    model_version: str
    timestamp: str

class ErrorAnalysisReportResponse(BaseModel):
    evaluation_type: str  # "BENCHMARK" | "PRODUCTION"
    status: str
    timestamp: str
    sample_count: int
    model_name: str
    model_version: str
    dataset_version: str
    run_id: Optional[str] = None
    message: Optional[str] = None
    thresholds: Dict[str, float] = Field(default_factory=dict)
    metrics: Dict[str, Any] = Field(default_factory=dict)
    performance_ranges: List[RangeSegmentItem] = Field(default_factory=list)
    feature_segments: Dict[str, List[FeatureSegmentItem]] = Field(default_factory=dict)
    residual_analysis: Optional[ResidualAnalysisData] = None
    largest_errors: List[LargestErrorItem] = Field(default_factory=list)
