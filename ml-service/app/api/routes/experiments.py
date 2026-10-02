"""
LearnTrack ML: Experiments Route
Exposes MLflow experiment runs, detailed run metadata, and cross-model run comparison.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.experiments import ExperimentRunSummary, ExperimentDetail
from ml.tracking.mlflow_tracker import mlflow_tracker

router = APIRouter(prefix="/experiments", tags=["Experiment Tracking"])

@router.get("", response_model=List[ExperimentRunSummary])
@router.get("/", response_model=List[ExperimentRunSummary], include_in_schema=False)
def list_experiments(limit: int = Query(50, ge=1, le=200)) -> List[ExperimentRunSummary]:
    """
    Returns real experiment runs logged under 'learntrack-student-performance'.
    Includes run IDs, model names, dataset versions, validation/test metrics, and hyperparameters.
    """
    try:
        runs = mlflow_tracker.list_runs(limit=limit)
        return [ExperimentRunSummary(**r) for r in runs]
    except Exception as e:
        print(f"[Experiments List Error] {e}")
        raise HTTPException(status_code=500, detail="Unable to retrieve experiment runs at this time.")


@router.get("/compare", response_model=List[ExperimentDetail])
def compare_runs(run_ids: str = Query(..., description="Comma-separated run IDs to compare")) -> List[ExperimentDetail]:
    """
    Returns side-by-side metric and parameter comparisons for multiple experiment runs.
    """
    ids = [r.strip() for r in run_ids.split(",") if r.strip()]
    if not ids:
        raise HTTPException(status_code=400, detail="Please provide at least one run ID to compare.")

    try:
        comparison = mlflow_tracker.compare_runs(ids)
        return [ExperimentDetail(**c) for c in comparison]
    except Exception as e:
        print(f"[Experiments Compare Error] {e}")
        raise HTTPException(status_code=500, detail="Failed to compare experiment runs.")


@router.get("/{run_id}", response_model=ExperimentDetail)
def get_experiment_detail(run_id: str) -> ExperimentDetail:
    """
    Returns comprehensive details for a specific MLflow run:
    parameters, training/validation/test metrics, artifacts, git commit, and tags.
    """
    detail = mlflow_tracker.get_run_detail(run_id)
    if detail is None:
        raise HTTPException(status_code=404, detail=f"Experiment run '{run_id}' not found.")
    return ExperimentDetail(**detail)
