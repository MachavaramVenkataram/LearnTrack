"""
LearnTrack ML: Production FastAPI Application
Exposes health checks, model telemetry, SHAP-backed academic performance predictions,
MLflow experiment tracking, model registry inspection, and operational drift monitoring.
"""

import time
import datetime
import os
import sys
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Add parent directory to sys.path for local module resolution
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.services.model_service import model_service
from app.api.routes import health, prediction, experiments, registry, monitoring, data_quality, error_analysis, retraining

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load ML artifacts and initialize SHAP baseline
    print(f"[{datetime.datetime.now(datetime.timezone.utc).isoformat()}] [LearnTrack ML] Initializing model artifacts...")
    success = model_service.load()
    if success:
        print(f"[{datetime.datetime.now(datetime.timezone.utc).isoformat()}] [LearnTrack ML] Model service ready.")
    else:
        print(f"[{datetime.datetime.now(datetime.timezone.utc).isoformat()}] [LearnTrack ML] Warning: Model artifacts not found. Run train.py first.")
    yield
    # Shutdown
    print(f"[{datetime.datetime.now(datetime.timezone.utc).isoformat()}] [LearnTrack ML] Shutting down service.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="LearnTrack Machine Learning Prediction Engine, Data Quality, Error Analysis, Retraining, MLflow Tracking, Model Registry & Drift Monitoring Service",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware (Configured origins, credentials support)
_default_dev_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:8001",
    "http://127.0.0.1:8001",
]
_configured_origins = list(set(_default_dev_origins + (settings.ALLOWED_ORIGINS if settings.ALLOWED_ORIGINS else [])))

app.add_middleware(
    CORSMiddleware,
    allow_origins=_configured_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Structured Logging Middleware (Excludes sensitive student academic data)
@app.middleware("http")
async def logging_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)

    # Log timestamp, method, endpoint, status, and duration only
    print(
        f"[{datetime.datetime.now(datetime.timezone.utc).isoformat()}] "
        f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms)"
    )
    return response

# Register API Routers
app.include_router(health.router)
app.include_router(prediction.router)
app.include_router(experiments.router)
app.include_router(registry.router)
app.include_router(monitoring.router)
app.include_router(data_quality.router)
app.include_router(error_analysis.router)
app.include_router(retraining.router)

@app.get("/", tags=["Root"])
def root():
    return {
        "service": settings.SERVICE_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "documentation": "/docs",
        "endpoints": {
            "health": "/health",
            "model_info": "/model/info",
            "predict": "/predict",
            "simulate": "/simulate",
            "insights_generate": "/insights/generate",
            "experiments": "/experiments",
            "model_registry": "/registry/models",
            "production_model": "/registry/production",
            "monitoring_summary": "/monitoring/summary",
            "drift_report": "/monitoring/drift",
            "prediction_logs": "/monitoring/predictions",
            "data_quality_latest": "/data-quality/latest",
            "data_quality_validate": "/data-quality/validate",
            "data_quality_history": "/data-quality/history",
            "error_analysis_summary": "/error-analysis/summary",
            "error_analysis_segments": "/error-analysis/segments",
            "error_analysis_residuals": "/error-analysis/residuals",
            "error_analysis_largest": "/error-analysis/largest-errors",
            "retraining_status": "/retraining/status",
            "retraining_check": "/retraining/check",
            "retraining_run": "/retraining/run",
            "retraining_history": "/retraining/history",
            "model_validate": "/models/{model_id}/validate",
            "model_promote": "/models/{model_id}/promote",
            "model_rollback": "/models/rollback",
            "model_audit_log": "/models/audit-log"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
