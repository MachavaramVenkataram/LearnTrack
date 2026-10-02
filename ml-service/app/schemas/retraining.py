"""
LearnTrack ML: Automated Model Retraining & Lifecycle Schemas
Defines request and response models for /retraining and /models promotion/rollback endpoints.
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class RetrainingCheckRequest(BaseModel):
    trigger: str = Field("manual", description="Retraining trigger type: manual, scheduled, data_drift, performance_degradation, new_labeled_data")

class RetrainingCheckResponse(BaseModel):
    eligible: bool
    timestamp: str
    trigger: str
    reason: str
    checks: Dict[str, Any] = Field(default_factory=dict)
    new_samples_count: int = 0
    min_required_samples: int = 10
    drift_status: str = "NORMAL"
    candidate_action: str

class RetrainingRunRequest(BaseModel):
    trigger: str = Field("manual", description="Trigger source: manual, scheduled, data_drift, performance_degradation, new_labeled_data")
    force: bool = False

class RetrainingRunResponse(BaseModel):
    status: str
    candidate_version: Optional[str] = None
    candidate_model_type: Optional[str] = None
    candidate_run_id: Optional[str] = None
    trigger: str
    dataset_version: str
    dataset_hash: Optional[str] = None
    started_at: str
    completed_at: Optional[str] = None
    candidate_metrics: Dict[str, Any] = Field(default_factory=dict)
    validation_status: Optional[str] = None
    regression_evaluation: Optional[Dict[str, Any]] = None
    failure_reason: Optional[str] = None

class RetrainingStatusResponse(BaseModel):
    active_production_model: Dict[str, Any]
    data_availability: Dict[str, Any]
    drift_status: Dict[str, Any]
    performance_status: Dict[str, Any]
    latest_retraining_run: Optional[Dict[str, Any]] = None
    candidates_available: List[Dict[str, Any]] = Field(default_factory=list)

class ModelValidateRequest(BaseModel):
    notes: Optional[str] = None

class ModelValidateResponse(BaseModel):
    candidate_version: str
    status: str
    is_validated: bool
    evaluation: Dict[str, Any]
    message: str

class ModelPromoteRequest(BaseModel):
    actor: str = Field("admin", description="Admin user identifier or email")
    reason: str = Field("Explicit manual promotion", description="Documented rationale for promotion")

class ModelPromoteResponse(BaseModel):
    status: str
    message: str
    promoted_version: str
    previous_version: str
    audit_event: Dict[str, Any]

class ModelRollbackRequest(BaseModel):
    target_version: str
    actor: str = Field("admin", description="Admin user initiating rollback")
    reason: str = Field("Rollback to prior validated model", description="Operational rationale")

class ModelRollbackResponse(BaseModel):
    status: str
    message: str
    active_version: str
    previous_version: str
    audit_event: Dict[str, Any]

class AuditEventItem(BaseModel):
    timestamp: str
    action: str
    model_name: str
    model_version: str
    previous_version: Optional[str] = None
    actor: str
    reason: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
