"""
LearnTrack ML: Model Lifecycle Service
Manages artifact caching, pipeline components, and SHAP explainer instantiation.
"""

import os
import sys
import numpy as np
import pandas as pd
from typing import Dict, Any, Optional

# Ensure ml modules are reachable
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

try:
    from app.core.config import settings
except ImportError:
    from core.config import settings
from ml.models.model_registry import ModelRegistry
from ml.explainability.shap_service import ShapExplainabilityService
from ml.features.feature_engineering import engineer_features

class ModelService:
    def __init__(self):
        self.registry = ModelRegistry(artifact_dir=settings.ARTIFACTS_DIR)
        self.pipeline: Optional[Dict[str, Any]] = None
        self.metadata: Optional[Dict[str, Any]] = None
        self.shap_service: Optional[ShapExplainabilityService] = None
        self._is_loaded: bool = False

    def load(self) -> bool:
        if self._is_loaded:
            return True

        try:
            self.pipeline, self.metadata = self.registry.load_artifact()

            # Prepare background dataset for SHAP explainer
            data_csv = os.path.join(settings.DATA_DIR, "processed", "academic_performance.csv")
            if os.path.exists(data_csv):
                df_bg = pd.read_csv(data_csv)
                X_feat = engineer_features(df_bg.drop(columns=["final_score"]))
                scaler = self.pipeline["scaler"]
                bg_scaled = scaler.transform(X_feat)
                # Sample 100 points for efficient baseline
                if len(bg_scaled) > 100:
                    indices = np.random.RandomState(42).choice(len(bg_scaled), 100, replace=False)
                    bg_sample = bg_scaled[indices]
                else:
                    bg_sample = bg_scaled
            else:
                bg_sample = np.zeros((10, len(self.pipeline["feature_names"])))

            self.shap_service = ShapExplainabilityService(
                model=self.pipeline["model"],
                background_data=bg_sample,
                feature_names=self.pipeline["feature_names"],
            )

            self._is_loaded = True
            print(f"[ModelService] Loaded {self.metadata.get('model_type')} version {self.metadata.get('model_version')}")
            return True

        except Exception as e:
            print(f"[ModelService] Failed to load model artifact: {e}")
            self._is_loaded = False
            return False

    @property
    def is_loaded(self) -> bool:
        if not self._is_loaded:
            self.load()
        return self._is_loaded

    def get_pipeline(self) -> Dict[str, Any]:
        if not self._is_loaded:
            self.load()
        if not self.pipeline:
            raise RuntimeError("Model pipeline is not loaded.")
        return self.pipeline

    def get_metadata(self) -> Dict[str, Any]:
        if not self._is_loaded:
            self.load()
        if not self.metadata:
            raise RuntimeError("Model metadata is not loaded.")
        return self.metadata

    def get_shap_service(self) -> ShapExplainabilityService:
        if not self._is_loaded:
            self.load()
        if not self.shap_service:
            raise RuntimeError("SHAP service is not initialized.")
        return self.shap_service

model_service = ModelService()
