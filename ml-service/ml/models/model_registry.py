"""
LearnTrack ML: Model Registry & Artifact Manager
Loads and registers model artifacts, preprocessing pipelines, and versioned metadata.
"""

import os
import json
import joblib
from typing import Dict, Any, Tuple, Optional

DEFAULT_ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "..", "artifacts")

class ModelRegistry:
    def __init__(self, artifact_dir: str = DEFAULT_ARTIFACT_DIR):
        self.artifact_dir = os.path.abspath(artifact_dir)
        self.model_path = os.path.join(self.artifact_dir, "performance_model.pkl")
        self.metadata_path = os.path.join(self.artifact_dir, "metadata.json")
        self._pipeline: Optional[Any] = None
        self._metadata: Optional[Dict[str, Any]] = None

    def save_artifact(self, pipeline: Any, metadata: Dict[str, Any]) -> None:
        os.makedirs(self.artifact_dir, exist_ok=True)
        joblib.dump(pipeline, self.model_path)
        with open(self.metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)
        self._pipeline = pipeline
        self._metadata = metadata

    def load_artifact(self) -> Tuple[Any, Dict[str, Any]]:
        if self._pipeline is not None and self._metadata is not None:
            return self._pipeline, self._metadata

        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model artifact not found at {self.model_path}. Please run train.py first.")
        if not os.path.exists(self.metadata_path):
            raise FileNotFoundError(f"Model metadata not found at {self.metadata_path}.")

        self._pipeline = joblib.load(self.model_path)
        with open(self.metadata_path, "r", encoding="utf-8") as f:
            self._metadata = json.load(f)

        return self._pipeline, self._metadata

    def get_metadata(self) -> Dict[str, Any]:
        if self._metadata is None:
            _, meta = self.load_artifact()
            return meta
        return self._metadata
