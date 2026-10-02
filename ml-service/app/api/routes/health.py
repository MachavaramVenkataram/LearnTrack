"""
LearnTrack ML: Health Check Route
Exposes /health endpoint indicating service status, model version, and MLflow connectivity.
"""

from fastapi import APIRouter
from app.services.model_service import model_service
from app.core.config import settings

router = APIRouter(tags=["Health"])

@router.get("/health")
@router.get("/api/health", include_in_schema=False)
def get_health():
    """
    Returns service health status without exposing system secrets.
    Accurately indicates whether model artifacts are loaded.
    """
    meta = {}
    is_loaded = False
    try:
        is_loaded = model_service.is_loaded
        if is_loaded:
            meta = model_service.get_metadata()
    except Exception as e:
        print(f"[Health Check Error] Model status check failed: {e}")
        is_loaded = False

    return {
        "status": "healthy" if is_loaded else "model_error",
        "service": settings.SERVICE_NAME,
        "model_loaded": is_loaded,
        "model_name": meta.get("model_name", settings.PRODUCTION_MODEL_NAME),
        "model_version": meta.get("model_version", settings.PRODUCTION_MODEL_VERSION),
        "dataset_version": meta.get("dataset_version", "1.0.0"),
        "run_id": meta.get("run_id", ""),
        "mlflow_tracking_configured": bool(settings.MLFLOW_TRACKING_URI),
    }
