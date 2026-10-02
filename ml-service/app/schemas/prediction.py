"""
LearnTrack ML: Pydantic Validation Schemas
Defines request and response schemas with strict boundary constraints.
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any, Optional

class PredictionRequest(BaseModel):
    attendance_percentage: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Course attendance percentage (0 to 100)"
    )
    assignment_score: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Average assignment evaluation mark (0 to 100)"
    )
    internal_marks: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Internal assessment and continuous evaluation marks (0 to 100)"
    )
    previous_score: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Previous semester or prerequisite academic performance (0 to 100)"
    )
    study_hours: float = Field(
        ...,
        ge=0.0,
        le=168.0,
        description="Weekly focused study hours (>= 0)"
    )
    assignments_completed: int = Field(
        ...,
        ge=0,
        le=100,
        description="Total completed academic assignments count (>= 0)"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "attendance_percentage": 86.0,
                "assignment_score": 82.0,
                "internal_marks": 78.0,
                "previous_score": 75.0,
                "study_hours": 14.5,
                "assignments_completed": 8
            }
        }
    }


class ExplanationItem(BaseModel):
    feature: str = Field(..., description="Feature identifier")
    label: str = Field(..., description="Human-readable feature name")
    impact: float = Field(..., description="Absolute impact score")
    raw_impact: float = Field(..., description="Signed impact score (+/-)")
    direction: str = Field(..., description="'positive', 'negative', or 'neutral'")
    description: str = Field(..., description="Non-causal descriptive summary")


class PredictionResponse(BaseModel):
    prediction: float = Field(..., description="Model estimated final score (0 to 100)")
    predicted_score: float = Field(..., description="Model estimated final score (0 to 100)")
    predicted_grade: str = Field(..., description="Deterministic grade classification (e.g. A, B+)")
    risk_level: str = Field(..., description="Performance risk tier: 'Low', 'Medium', or 'High'")
    model_name: str = Field(default="learntrack-student-performance", description="Model name")
    model_version: str = Field(default="1", description="Model artifact semantic version")
    dataset_version: str = Field(default="1.0.0", description="Dataset version used for training")
    run_id: str = Field(default="", description="MLflow experiment run ID")
    prediction_id: Optional[str] = Field(default=None, description="Unique prediction event log ID")
    latency_ms: Optional[float] = Field(default=None, description="Operational inference latency in ms")
    explanations: List[ExplanationItem] = Field(default_factory=list, description="SHAP feature attributions")
    disclaimer: str = Field(
        default="Predictions are estimates generated from the information provided and model training data. They are not guaranteed outcomes.",
        description="Academic disclaimer"
    )


class ModelInfoResponse(BaseModel):
    service: str
    model_version: str
    model_type: str
    model_name: str = "learntrack-student-performance"
    run_id: str = ""
    dataset_version: str = "1.0.0"
    dataset_hash: str = ""
    target: str
    target_scale: str
    dataset_name: str
    feature_names: List[str]
    evaluation_metrics: Dict[str, Any]
    selection_rationale: str



# ==============================================================================
# WHAT-IF SIMULATOR SCHEMAS
# ==============================================================================

class SimulationRequest(BaseModel):
    baseline: PredictionRequest = Field(..., description="Baseline academic features")
    simulated: PredictionRequest = Field(..., description="Hypothetical simulated academic features")


class SimulationResponse(BaseModel):
    current_prediction: float = Field(..., description="Baseline predicted score")
    simulated_prediction: float = Field(..., description="Simulated predicted score")
    difference: float = Field(..., description="Delta score (simulated - baseline)")
    current_grade: str = Field(..., description="Baseline estimated grade")
    simulated_grade: str = Field(..., description="Simulated estimated grade")
    current_risk: str = Field(..., description="Baseline risk tier")
    simulated_risk: str = Field(..., description="Simulated risk tier")
    model_version: str = Field(..., description="Model version")
    disclaimer: str = Field(
        default="Simulation only: These results are model estimates based on the selected inputs. They are not guaranteed academic outcomes.",
        description="Academic simulation disclaimer"
    )


# ==============================================================================
# EXPLAINABLE AI INSIGHT SCHEMAS
# ==============================================================================

class InsightItem(BaseModel):
    type: str = Field(..., description="'strength', 'improvement', 'trend', or 'recommendation'")
    title: str = Field(..., description="Insight heading")
    description: str = Field(..., description="Evidence-based non-causal summary")
    importance: str = Field(..., description="'high', 'medium', or 'low'")
    score: float = Field(..., description="Transparent prioritization ranking score")
    supporting_value: Optional[float] = Field(None, description="Numeric indicator")
    supporting_label: Optional[str] = Field(None, description="Label for supporting value")
    action_label: Optional[str] = Field(None, description="Recommended user action text")
    action_route: Optional[str] = Field(None, description="Internal routing destination")


class InsightGenerationRequest(BaseModel):
    academic_records: List[Dict[str, Any]] = Field(default_factory=list, description="Recent course evaluations")
    attendance_percentage: Optional[float] = Field(None, description="Average institutional attendance")
    study_hours: Optional[float] = Field(None, description="Weekly or recent study hours")
    latest_prediction: Optional[Dict[str, Any]] = Field(None, description="Latest model prediction record")
    shap_explanations: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Latest SHAP attributions")


class InsightGenerationResponse(BaseModel):
    insights: List[InsightItem]
    summary: Dict[str, Any]
