"""
LearnTrack ML: Experiment Tracking & Model Registry Schemas
Defines request and response models for /experiments and /registry endpoints.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ExperimentRunSummary(BaseModel):
    run_id: str
    run_name: str
    model_name: str
    dataset_version: str
    dataset_hash: str
    status: str
    start_time: Optional[int] = None
    end_time: Optional[int] = None
    metrics: Dict[str, Optional[float]] = Field(default_factory=dict)
    params: Dict[str, str] = Field(default_factory=dict)
    tags: Dict[str, str] = Field(default_factory=dict)
    is_champion: bool = False

class ExperimentDetail(BaseModel):
    run_id: str
    run_name: str
    model_name: str
    dataset_version: str
    dataset_hash: str
    status: str
    start_time: Optional[int] = None
    end_time: Optional[int] = None
    metrics: Dict[str, float] = Field(default_factory=dict)
    params: Dict[str, str] = Field(default_factory=dict)
    tags: Dict[str, str] = Field(default_factory=dict)
    artifacts: List[str] = Field(default_factory=list)
    artifact_uri: Optional[str] = None

class ModelVersionItem(BaseModel):
    version: str
    current_stage: str
    run_id: str
    status: str
    creation_timestamp: Optional[int] = None

class RegisteredModelSummary(BaseModel):
    name: str
    creation_timestamp: Optional[int] = None
    last_updated_timestamp: Optional[int] = None
    description: Optional[str] = None
    latest_versions: List[ModelVersionItem] = Field(default_factory=list)

class ProductionModelInfo(BaseModel):
    model_name: str
    model_version: str
    stage: str
    lifecycle: str
    is_configured: bool
    run_id: Optional[str] = None
    status: Optional[str] = None
    creation_timestamp: Optional[int] = None
