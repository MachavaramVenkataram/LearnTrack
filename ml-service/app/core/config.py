"""
LearnTrack ML: Configuration Settings
Loads environment variables for server host, port, CORS origins, artifact directories,
MLflow experiment tracking, model registry, and monitoring thresholds.
"""

import os
from typing import List

class Settings:
    PROJECT_NAME: str = "LearnTrack ML Prediction Engine"
    VERSION: str = "v1.0.0"
    SERVICE_NAME: str = "learntrack-ml"

    # Server binding
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8001"))

    # CORS configuration
    ALLOWED_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:8001"
        ).split(",")
        if origin.strip()
    ]

    # Artifact paths
    BASE_DIR: str = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    ARTIFACTS_DIR: str = os.getenv("ARTIFACTS_DIR", os.path.join(BASE_DIR, "ml", "artifacts"))
    DATA_DIR: str = os.getenv("DATA_DIR", os.path.join(BASE_DIR, "ml", "data"))

    # MLflow Tracking & Registry
    MLFLOW_TRACKING_URI: str = os.getenv(
        "MLFLOW_TRACKING_URI",
        f"sqlite:///{os.path.join(BASE_DIR, 'mlruns.db').replace(os.sep, '/')}"
    )
    MLFLOW_EXPERIMENT_NAME: str = os.getenv(
        "MLFLOW_EXPERIMENT_NAME", "learntrack-student-performance"
    )
    PRODUCTION_MODEL_NAME: str = os.getenv(
        "PRODUCTION_MODEL_NAME", "learntrack-student-performance"
    )
    PRODUCTION_MODEL_VERSION: str = os.getenv("PRODUCTION_MODEL_VERSION", "1")

    # Monitoring & Drift Thresholds (Population Stability Index - PSI)
    DRIFT_WARNING_THRESHOLD: float = float(os.getenv("DRIFT_WARNING_THRESHOLD", "0.10"))
    DRIFT_CRITICAL_THRESHOLD: float = float(os.getenv("DRIFT_CRITICAL_THRESHOLD", "0.25"))
    MIN_OBSERVATIONS_FOR_DRIFT: int = int(os.getenv("MIN_OBSERVATIONS_FOR_DRIFT", "10"))
    MIN_OBSERVATIONS_FOR_ERROR_METRICS: int = int(os.getenv("MIN_OBSERVATIONS_FOR_ERROR_METRICS", "5"))

settings = Settings()
