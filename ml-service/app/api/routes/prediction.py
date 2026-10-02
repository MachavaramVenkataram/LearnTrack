"""
LearnTrack ML: Prediction, Simulation & Insights Routes
Exposes:
- POST /predict (Single student performance inference & SHAP attribution)
- POST /simulate (What-If academic parameter sensitivity simulation)
- POST /insights/generate (Evidence-based structured academic insight synthesis)
- GET /model/info (Model telemetry & benchmark metrics)
"""

from fastapi import APIRouter, HTTPException, Request, Depends
from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    SimulationRequest,
    SimulationResponse,
    InsightGenerationRequest,
    InsightGenerationResponse,
    ModelInfoResponse,
)
from app.services.prediction_service import (
    predict_student_performance,
    simulate_performance_change,
)
from app.services.insight_service import generate_student_insights
from app.services.model_service import model_service
from app.core.config import settings
from app.core.rate_limit import prediction_rate_limiter, simulation_rate_limiter

router = APIRouter(tags=["Prediction & Intelligence"])

@router.post("/predict", response_model=PredictionResponse)
@router.post("/api/predict", response_model=PredictionResponse, include_in_schema=False)
def predict(request: PredictionRequest, http_req: Request) -> PredictionResponse:
    """
    Predicts student performance, letter grade, risk category, and SHAP feature influences.
    Rate-limited per client IP to safeguard computational resources.
    """
    prediction_rate_limiter.check(http_req)
    try:
        response = predict_student_performance(request)
        return response
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Prediction Error] {e}")
        raise HTTPException(
            status_code=500,
            detail="Unable to compute performance prediction at this time. Please check feature values and try again."
        )


@router.post("/simulate", response_model=SimulationResponse)
@router.post("/api/simulate", response_model=SimulationResponse, include_in_schema=False)
def simulate(request: SimulationRequest, http_req: Request) -> SimulationResponse:
    """
    Simulates hypothetical performance changes when a student modifies continuous academic inputs
    (attendance, internal marks, study hours, assignments).
    """
    simulation_rate_limiter.check(http_req)
    try:
        response = simulate_performance_change(request)
        return response
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Simulation Error] {e}")
        raise HTTPException(
            status_code=500,
            detail="Unable to run academic performance simulation at this time. Please try again."
        )


@router.post("/insights/generate", response_model=InsightGenerationResponse)
@router.post("/api/insights/generate", response_model=InsightGenerationResponse, include_in_schema=False)
def generate_insights(request: InsightGenerationRequest) -> InsightGenerationResponse:
    """
    Synthesizes structured, evidence-based academic insights across Strengths, Improvement Areas,
    Trends, and Recommendations with transparent priority scoring.
    """
    try:
        response = generate_student_insights(request)
        return response
    except Exception as e:
        print(f"[Insights Generation Error] {e}")
        raise HTTPException(
            status_code=500,
            detail="Unable to synthesize academic insights at this time."
        )


@router.get("/model/info", response_model=ModelInfoResponse)
@router.get("/api/model-info", response_model=ModelInfoResponse, include_in_schema=False)
def get_model_info() -> ModelInfoResponse:
    """
    Returns public metadata and evaluation metrics for the active model artifact.
    """
    try:
        meta = model_service.get_metadata()
        return ModelInfoResponse(
            service=settings.SERVICE_NAME,
            model_version=meta.get("model_version", settings.VERSION),
            model_type=meta.get("model_type", "Regression Pipeline"),
            target=meta.get("target", "final_score"),
            target_scale=meta.get("target_scale", "0 to 100 continuous score"),
            dataset_name=meta.get("dataset_name", "Academic Performance Benchmark"),
            feature_names=meta.get("feature_names", []),
            evaluation_metrics={
                "validation": meta.get("champion_validation_metrics", {}),
                "independent_test": meta.get("champion_test_metrics", {}),
                "benchmarks": meta.get("benchmarks_comparison", {}),
            },
            selection_rationale=meta.get("selection_rationale", "Selected on empirical test evidence."),
        )
    except Exception as e:
        print(f"[Model Info Error] {e}")
        raise HTTPException(
            status_code=503,
            detail="Model metadata is temporarily unavailable."
        )
