import sys
import os
import pytest

# Ensure ml-service root is in sys.path
ml_service_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ml_service_dir not in sys.path:
    sys.path.insert(0, ml_service_dir)


@pytest.fixture(scope="session", autouse=True)
def setup_test_mlflow_runs():
    """Ensure baseline MLflow experiment runs exist in clean test environments."""
    from ml.tracking.mlflow_tracker import mlflow_tracker
    from sklearn.linear_model import Ridge

    existing = mlflow_tracker.list_runs(limit=2)
    if len(existing) < 2:
        for i in range(2 - len(existing)):
            mlflow_tracker.log_training_run(
                model_name=f"Ridge_Baseline_{i+1}",
                model_obj=Ridge(alpha=1.0 * (i + 1)),
                params={"alpha": 1.0 * (i + 1), "solver": "auto"},
                train_metrics={"rmse": 6.5, "mae": 4.8, "r2": 0.82},
                val_metrics={"rmse": 6.8, "mae": 5.0, "r2": 0.80},
                cv_metrics={"rmse": 6.7, "mae": 4.9, "r2": 0.81},
                test_metrics={"rmse": 7.0, "mae": 5.2, "r2": 0.79},
                dataset_meta={"dataset_version": "1.0.0", "dataset_hash": "test_hash"},
                is_champion=False,
            )

