"""
LearnTrack ML: MLflow Tracking & Model Registry Integration
Encapsulates MLflow experiment management, run tracking, parameter/metric logging,
model registry operations, and artifact management.
"""

import os
import sys
import hashlib
import platform
import subprocess
from typing import Dict, Any, List, Optional
import mlflow
from mlflow.tracking import MlflowClient

# Ensure ml package modules can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
try:
    from app.core.config import settings
except ImportError:
    from core.config import settings


def get_git_commit_hash() -> Optional[str]:
    """Retrieve active git commit hash if git repository is available."""
    try:
        commit = subprocess.check_output(
            ["git", "rev-parse", "HEAD"],
            cwd=settings.BASE_DIR,
            stderr=subprocess.DEVNULL
        ).decode("ascii").strip()
        return commit
    except Exception:
        return None


def calculate_file_sha256(filepath: str) -> str:
    """Calculates deterministic SHA-256 hash of a file for dataset versioning."""
    if not os.path.exists(filepath):
        return "file_not_found"
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            sha256.update(chunk)
    return sha256.hexdigest()


class MLflowTracker:
    def __init__(self, tracking_uri: Optional[str] = None, experiment_name: Optional[str] = None):
        self.tracking_uri = tracking_uri or settings.MLFLOW_TRACKING_URI
        self.experiment_name = experiment_name or settings.MLFLOW_EXPERIMENT_NAME
        mlflow.set_tracking_uri(self.tracking_uri)
        self.client = MlflowClient(tracking_uri=self.tracking_uri)
        self._ensure_experiment()

    def _ensure_experiment(self) -> str:
        """Ensures that the experiment exists in the tracking store and returns experiment_id."""
        experiment = self.client.get_experiment_by_name(self.experiment_name)
        if experiment is None:
            exp_id = self.client.create_experiment(name=self.experiment_name)
            return exp_id
        return experiment.experiment_id

    def get_experiment_id(self) -> str:
        return self._ensure_experiment()

    def log_training_run(
        self,
        model_name: str,
        model_obj: Any,
        params: Dict[str, Any],
        train_metrics: Dict[str, float],
        val_metrics: Dict[str, float],
        cv_metrics: Dict[str, float],
        test_metrics: Dict[str, float],
        dataset_meta: Dict[str, Any],
        artifacts: Optional[List[str]] = None,
        is_champion: bool = False,
    ) -> str:
        """
        Executes an end-to-end MLflow run logging parameters, metrics, tags, and artifacts.
        """
        exp_id = self.get_experiment_id()
        git_hash = get_git_commit_hash()

        # Build clean tags without nulls
        tags = {
            "model_name": model_name,
            "dataset_version": dataset_meta.get("dataset_version", "1.0.0"),
            "dataset_hash": dataset_meta.get("dataset_hash", ""),
            "is_champion": str(is_champion).lower(),
            "python_version": platform.python_version(),
            "mlflow_version": mlflow.__version__,
        }
        if git_hash:
            tags["git_commit"] = git_hash

        with mlflow.start_run(experiment_id=exp_id, run_name=model_name, tags=tags) as run:
            run_id = run.info.run_id

            # 1. Log actual non-null parameters
            clean_params = {
                k: str(v) for k, v in params.items()
                if v is not None and not str(k).startswith("_")
            }
            clean_params["model_type"] = model_name
            mlflow.log_params(clean_params)

            # 2. Log actual dynamic metrics
            for k, v in train_metrics.items():
                mlflow.log_metric(f"train_{k}", float(v))
            for k, v in val_metrics.items():
                mlflow.log_metric(f"val_{k}", float(v))
            for k, v in cv_metrics.items():
                mlflow.log_metric(f"cv_{k}", float(v))
            for k, v in test_metrics.items():
                mlflow.log_metric(f"test_{k}", float(v))

            # 3. Log artifacts if available
            if artifacts:
                for art_path in artifacts:
                    if os.path.exists(art_path):
                        if os.path.isdir(art_path):
                            mlflow.log_artifacts(art_path)
                        else:
                            mlflow.log_artifact(art_path)

            # 4. If champion, log scikit-learn/xgboost model to MLflow model registry
            if is_champion:
                try:
                    import sklearn
                    tags["registered_as_champion"] = "true"
                    mlflow.sklearn.log_model(
                        sk_model=model_obj,
                        artifact_path="model",
                        registered_model_name=settings.PRODUCTION_MODEL_NAME,
                    )
                except Exception as e:
                    print(f"[MLflowTracker] Note on registry logging: {e}")

            return run_id

    def list_runs(self, limit: int = 50) -> List[Dict[str, Any]]:
        """List all runs from the experiment with formatted metrics and parameters."""
        exp_id = self.get_experiment_id()
        runs = self.client.search_runs(
            experiment_ids=[exp_id],
            max_results=limit,
            order_by=["attribute.start_time DESC"],
        )

        results = []
        for r in runs:
            data = r.data
            info = r.info
            results.append({
                "run_id": info.run_id,
                "run_name": data.tags.get("mlflow.runName", "run"),
                "model_name": data.tags.get("model_name", data.params.get("model_type", "Unknown")),
                "dataset_version": data.tags.get("dataset_version", "1.0.0"),
                "dataset_hash": data.tags.get("dataset_hash", ""),
                "status": info.status,
                "start_time": info.start_time,
                "end_time": info.end_time,
                "metrics": {
                    "val_mae": data.metrics.get("val_mae"),
                    "val_rmse": data.metrics.get("val_rmse"),
                    "val_r2": data.metrics.get("val_r2"),
                    "test_mae": data.metrics.get("test_mae"),
                    "test_rmse": data.metrics.get("test_rmse"),
                    "test_r2": data.metrics.get("test_r2"),
                    "cv_mean_rmse": data.metrics.get("cv_mean_rmse"),
                },
                "params": data.params,
                "tags": {k: v for k, v in data.tags.items() if not k.startswith("mlflow.")},
                "is_champion": data.tags.get("is_champion") == "true",
            })
        return results

    def get_run_detail(self, run_id: str) -> Optional[Dict[str, Any]]:
        """Returns comprehensive details for a specific run."""
        try:
            r = self.client.get_run(run_id)
            data = r.data
            info = r.info
            artifacts = [a.path for a in self.client.list_artifacts(run_id)]
            return {
                "run_id": info.run_id,
                "run_name": data.tags.get("mlflow.runName", "run"),
                "model_name": data.tags.get("model_name", data.params.get("model_type", "Unknown")),
                "dataset_version": data.tags.get("dataset_version", "1.0.0"),
                "dataset_hash": data.tags.get("dataset_hash", ""),
                "status": info.status,
                "start_time": info.start_time,
                "end_time": info.end_time,
                "metrics": data.metrics,
                "params": data.params,
                "tags": {k: v for k, v in data.tags.items() if not k.startswith("mlflow.")},
                "artifacts": artifacts,
                "artifact_uri": info.artifact_uri,
            }
        except Exception as e:
            print(f"[MLflowTracker] Error fetching run {run_id}: {e}")
            return None

    def compare_runs(self, run_ids: List[str]) -> List[Dict[str, Any]]:
        """Fetches multiple runs for side-by-side comparison."""
        runs_data = []
        for rid in run_ids:
            detail = self.get_run_detail(rid)
            if detail:
                runs_data.append(detail)
        return runs_data

    def get_registered_models(self) -> List[Dict[str, Any]]:
        """Lists registered models from MLflow Model Registry."""
        try:
            models = self.client.search_registered_models()
            result = []
            for m in models:
                latest_versions = [
                    {
                        "version": v.version,
                        "current_stage": v.current_stage,
                        "run_id": v.run_id,
                        "status": v.status,
                        "creation_timestamp": v.creation_timestamp,
                    }
                    for v in m.latest_versions
                ]
                result.append({
                    "name": m.name,
                    "creation_timestamp": m.creation_timestamp,
                    "last_updated_timestamp": m.last_updated_timestamp,
                    "description": m.description,
                    "latest_versions": latest_versions,
                })
            return result
        except Exception as e:
            print(f"[MLflowTracker] Model registry search: {e}")
            return []

    def get_model_versions(self, model_name: str) -> List[Dict[str, Any]]:
        """Lists all versions for a given registered model."""
        try:
            versions = self.client.search_model_versions(f"name='{model_name}'")
            return [
                {
                    "name": v.name,
                    "version": v.version,
                    "current_stage": v.current_stage,
                    "run_id": v.run_id,
                    "status": v.status,
                    "creation_timestamp": v.creation_timestamp,
                }
                for v in versions
            ]
        except Exception as e:
            print(f"[MLflowTracker] Versions fetch: {e}")
            return []

    def get_production_model(self) -> Dict[str, Any]:
        """
        Returns metadata for the explicitly configured production model.
        Falls back safely to local artifact metadata if registry query returns empty.
        """
        prod_name = settings.PRODUCTION_MODEL_NAME
        prod_version = settings.PRODUCTION_MODEL_VERSION

        meta = {
            "model_name": prod_name,
            "model_version": prod_version,
            "stage": "Production",
            "lifecycle": "Production",
            "is_configured": True,
        }

        try:
            versions = self.client.search_model_versions(f"name='{prod_name}'")
            for v in versions:
                if str(v.version) == str(prod_version) or v.current_stage.lower() == "production":
                    meta.update({
                        "run_id": v.run_id,
                        "status": v.status,
                        "creation_timestamp": v.creation_timestamp,
                    })
                    break
        except Exception:
            pass

        return meta

mlflow_tracker = MLflowTracker()
