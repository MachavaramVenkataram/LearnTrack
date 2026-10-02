"""
LearnTrack ML: Model Registry Route
Exposes MLflow Model Registry metadata, version history, and production model configuration.
"""

from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.experiments import (
    RegisteredModelSummary,
    ModelVersionItem,
    ProductionModelInfo,
)
from ml.tracking.mlflow_tracker import mlflow_tracker
from app.services.model_service import model_service
from app.core.config import settings

router = APIRouter(prefix="/registry", tags=["Model Registry"])

@router.get("/models", response_model=List[RegisteredModelSummary])
def list_models() -> List[RegisteredModelSummary]:
    """
    Returns registered models in the MLflow Model Registry.
    """
    try:
        models = mlflow_tracker.get_registered_models()
        return [RegisteredModelSummary(**m) for m in models]
    except Exception as e:
        print(f"[Registry Models Error] {e}")
        return []


@router.get("/models/{name}/versions", response_model=List[ModelVersionItem])
def get_model_versions(name: str) -> List[ModelVersionItem]:
    """
    Returns all registered versions for a specified model.
    """
    try:
        versions = mlflow_tracker.get_model_versions(name)
        return [ModelVersionItem(**v) for v in versions]
    except Exception as e:
        print(f"[Registry Versions Error] {e}")
        return []


@router.get("/production", response_model=ProductionModelInfo)
def get_production_model() -> ProductionModelInfo:
    """
    Returns safe metadata for the active production model serving user predictions.
    """
    try:
        meta = model_service.get_metadata()
        prod_info = mlflow_tracker.get_production_model()

        return ProductionModelInfo(
            model_name=meta.get("model_name", settings.PRODUCTION_MODEL_NAME),
            model_version=meta.get("model_version", settings.PRODUCTION_MODEL_VERSION),
            stage="Production",
            lifecycle="Production",
            is_configured=True,
            run_id=meta.get("run_id", prod_info.get("run_id")),
            status=prod_info.get("status", "READY"),
            creation_timestamp=prod_info.get("creation_timestamp"),
        )
    except Exception as e:
        print(f"[Registry Production Error] {e}")
        return ProductionModelInfo(
            model_name=settings.PRODUCTION_MODEL_NAME,
            model_version=settings.PRODUCTION_MODEL_VERSION,
            stage="Production",
            lifecycle="Production",
            is_configured=True,
        )
