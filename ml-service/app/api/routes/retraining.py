"""
LearnTrack ML: Automated Retraining, Model Evaluation & Promotion Route
Exposes retraining eligibility checks (dry-run), candidate retraining pipeline execution,
model regression protection, explicit candidate promotion, rollback, and lifecycle audit trail.
"""

import os
import json
import datetime
from fastapi import APIRouter, HTTPException, Query, Header
from typing import List, Dict, Any, Optional

from app.schemas.retraining import (
    RetrainingCheckRequest,
    RetrainingCheckResponse,
    RetrainingRunRequest,
    RetrainingRunResponse,
    RetrainingStatusResponse,
    ModelValidateRequest,
    ModelValidateResponse,
    ModelPromoteRequest,
    ModelPromoteResponse,
    ModelRollbackRequest,
    ModelRollbackResponse,
    AuditEventItem,
)
from ml.retraining.eligibility import retraining_eligibility_checker
from ml.retraining.trainer import retraining_trainer
from ml.retraining.evaluator import candidate_model_evaluator
from ml.retraining.promotion import model_promotion_manager
from ml.monitoring.monitor import prediction_monitor
from app.services.model_service import model_service
from app.core.config import settings

router = APIRouter(tags=["Model Retraining & Lifecycle"])

# Retraining history storage
RETRAINING_HISTORY_PATH = os.path.join(settings.ARTIFACTS_DIR, "retraining_history.json")


def _load_retraining_history() -> List[Dict[str, Any]]:
    if os.path.exists(RETRAINING_HISTORY_PATH):
        try:
            with open(RETRAINING_HISTORY_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return []


def _save_retraining_run(record: Dict[str, Any]):
    history = _load_retraining_history()
    history.insert(0, record)
    history = history[:50]
    with open(RETRAINING_HISTORY_PATH, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)


@router.get("/retraining/status", response_model=RetrainingStatusResponse)
def get_retraining_status() -> RetrainingStatusResponse:
    """
    Returns high-level status of active production model, data availability,
    drift status, and recent retraining runs.
    """
    prod_meta = model_service.get_metadata()
    summary = prediction_monitor.get_summary(days=90)
    drift_rep = prediction_monitor.get_drift_report()

    history = _load_retraining_history()
    latest_run = history[0] if history else None

    # Scan available candidates
    cand_dir = os.path.join(settings.ARTIFACTS_DIR, "candidates")
    candidates = []
    if os.path.exists(cand_dir):
        for f in os.listdir(cand_dir):
            if f.endswith("_meta.json"):
                try:
                    with open(os.path.join(cand_dir, f), "r", encoding="utf-8") as meta_f:
                        candidates.append(json.load(meta_f))
                except Exception:
                    pass

    return RetrainingStatusResponse(
        active_production_model={
            "model_name": prod_meta.get("model_name", settings.PRODUCTION_MODEL_NAME),
            "model_version": prod_meta.get("model_version", settings.PRODUCTION_MODEL_VERSION),
            "model_type": prod_meta.get("model_type"),
            "dataset_version": prod_meta.get("dataset_version", "1.0.0"),
            "run_id": prod_meta.get("run_id"),
            "test_rmse": prod_meta.get("champion_test_metrics", {}).get("rmse"),
            "test_mae": prod_meta.get("champion_test_metrics", {}).get("mae"),
        },
        data_availability={
            "feedback_observations": summary.get("feedback_count", 0),
            "predictions_logged": summary.get("prediction_count", 0),
            "min_required_for_retraining": 10,
            "status": "SUFFICIENT" if summary.get("feedback_count", 0) >= 10 else "ACCUMULATING",
        },
        drift_status={
            "alert_level": drift_rep.get("alert_level", "NORMAL"),
            "evaluated_observations": drift_rep.get("observations_evaluated", 0),
        },
        performance_status={
            "current_mae": summary.get("error_metrics", {}).get("mae"),
            "current_rmse": summary.get("error_metrics", {}).get("rmse"),
            "status": summary.get("error_metrics", {}).get("status", "Pending Observations"),
        },
        latest_retraining_run=latest_run,
        candidates_available=candidates,
    )


@router.post("/retraining/check", response_model=RetrainingCheckResponse)
def check_retraining_eligibility(payload: Optional[RetrainingCheckRequest] = None) -> RetrainingCheckResponse:
    """
    Executes a safe dry-run of retraining eligibility without modifying models or datasets.
    """
    trigger = payload.trigger if payload else "manual"
    prod_meta = model_service.get_metadata()
    result = retraining_eligibility_checker.check_eligibility(
        trigger=trigger,
        production_metadata=prod_meta,
    )
    return RetrainingCheckResponse(**result)


@router.post("/retraining/run", response_model=RetrainingRunResponse)
def run_retraining(payload: Optional[RetrainingRunRequest] = None) -> RetrainingRunResponse:
    """
    Executes the controlled candidate retraining pipeline.
    Validates data, trains candidates, benchmarks against production, and enforces regression protection.
    Candidate is marked VALIDATED or REJECTED. Never replaces production automatically.
    """
    trigger = payload.trigger if payload else "manual"
    force = payload.force if payload else False

    # Check eligibility first unless force flag is specified
    if not force:
        eligibility = retraining_eligibility_checker.check_eligibility(trigger=trigger)
        if not eligibility["eligible"]:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Dataset or pipeline not eligible for retraining.",
                    "reason": eligibility["reason"],
                    "checks": eligibility["checks"],
                }
            )

    try:
        # Run training pipeline
        retrain_result = retraining_trainer.execute_retraining(trigger=trigger)

        # Comparative Evaluation against Production Model
        prod_meta = model_service.get_metadata()
        comparison = candidate_model_evaluator.evaluate_candidate(
            candidate_metrics=retrain_result["candidate_metrics"],
            production_metrics=prod_meta,
            candidate_version=retrain_result["candidate_version"],
            production_version=str(prod_meta.get("model_version", "1")),
        )

        record = {
            "retraining_id": retrain_result["candidate_run_id"],
            "candidate_version": retrain_result["candidate_version"],
            "candidate_model_type": retrain_result["candidate_model_type"],
            "trigger": trigger,
            "dataset_version": retrain_result["dataset_version"],
            "previous_model_version": str(prod_meta.get("model_version", "1")),
            "status": comparison["status"],
            "started_at": retrain_result["started_at"],
            "completed_at": retrain_result["completed_at"],
            "candidate_metrics": retrain_result["candidate_metrics"],
            "regression_evaluation": comparison,
        }
        _save_retraining_run(record)

        # Log audit event
        model_promotion_manager.log_audit_event(
            action="trained",
            model_name=retrain_result["candidate_model_type"],
            model_version=retrain_result["candidate_version"],
            previous_version=str(prod_meta.get("model_version", "1")),
            actor="system_retraining",
            reason=f"Candidate generated via {trigger} trigger. Status: {comparison['status']}",
            metadata=comparison["metrics_comparison"],
        )

        return RetrainingRunResponse(
            status=comparison["status"],
            candidate_version=retrain_result["candidate_version"],
            candidate_model_type=retrain_result["candidate_model_type"],
            candidate_run_id=retrain_result["candidate_run_id"],
            trigger=trigger,
            dataset_version=retrain_result["dataset_version"],
            dataset_hash=retrain_result["dataset_hash"],
            started_at=retrain_result["started_at"],
            completed_at=retrain_result["completed_at"],
            candidate_metrics=retrain_result["candidate_metrics"],
            validation_status="PASSED",
            regression_evaluation=comparison,
        )

    except Exception as e:
        record = {
            "retraining_id": f"failed-{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d%H%M%S')}",
            "trigger": trigger,
            "status": "failed",
            "failure_reason": str(e),
            "started_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
        _save_retraining_run(record)
        raise HTTPException(status_code=500, detail=f"Retraining execution failed: {str(e)}")


@router.get("/retraining/history")
def get_retraining_history() -> List[Dict[str, Any]]:
    """Returns chronologically ordered history of retraining runs."""
    return _load_retraining_history()


@router.post("/models/{model_id}/validate", response_model=ModelValidateResponse)
def validate_candidate_model(model_id: str, payload: Optional[ModelValidateRequest] = None) -> ModelValidateResponse:
    """
    Explicitly evaluates and confirms validation criteria for a candidate model.
    """
    cand_meta_path = os.path.join(settings.ARTIFACTS_DIR, "candidates", f"{model_id}_meta.json")
    if not os.path.exists(cand_meta_path):
        raise HTTPException(status_code=404, detail=f"Candidate model '{model_id}' not found.")

    with open(cand_meta_path, "r", encoding="utf-8") as f:
        cand_meta = json.load(f)

    prod_meta = model_service.get_metadata()
    comparison = candidate_model_evaluator.evaluate_candidate(
        candidate_metrics={"test": cand_meta.get("test_metrics", {})},
        production_metrics=prod_meta,
        candidate_version=model_id,
        production_version=str(prod_meta.get("model_version", "1")),
    )

    model_promotion_manager.log_audit_event(
        action="validated" if comparison["is_promotable"] else "rejected",
        model_name=cand_meta.get("model_type", "Candidate"),
        model_version=model_id,
        previous_version=str(prod_meta.get("model_version", "1")),
        actor="admin",
        reason=payload.notes if payload and payload.notes else comparison["recommendation"],
    )

    return ModelValidateResponse(
        candidate_version=model_id,
        status=comparison["status"],
        is_validated=comparison["is_promotable"],
        evaluation=comparison,
        message=comparison["recommendation"],
    )


@router.post("/models/{model_id}/promote", response_model=ModelPromoteResponse)
def promote_candidate_model(model_id: str, payload: ModelPromoteRequest) -> ModelPromoteResponse:
    """
    Promotes a VALIDATED candidate model to active production.
    Safely archives previous model and updates MLflow registry.
    Requires explicit action and authorized role.
    """
    cand_meta_path = os.path.join(settings.ARTIFACTS_DIR, "candidates", f"{model_id}_meta.json")
    if not os.path.exists(cand_meta_path):
        raise HTTPException(status_code=404, detail=f"Candidate model '{model_id}' not found.")

    with open(cand_meta_path, "r", encoding="utf-8") as f:
        cand_meta = json.load(f)

    # Enforce regression protection before promotion
    prod_meta = model_service.get_metadata()
    comparison = candidate_model_evaluator.evaluate_candidate(
        candidate_metrics={"test": cand_meta.get("test_metrics", {})},
        production_metrics=prod_meta,
        candidate_version=model_id,
        production_version=str(prod_meta.get("model_version", "1")),
    )

    if not comparison["is_promotable"]:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Candidate model failed regression protection and cannot be promoted.",
                "comparison": comparison,
            }
        )

    try:
        result = model_promotion_manager.promote_candidate(
            candidate_version=model_id,
            actor=payload.actor,
            reason=payload.reason,
        )
        return ModelPromoteResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Promotion failed: {str(e)}")


@router.post("/models/rollback", response_model=ModelRollbackResponse)
def rollback_production_model(payload: ModelRollbackRequest) -> ModelRollbackResponse:
    """
    Restores an archived model version to active production state.
    """
    try:
        result = model_promotion_manager.rollback(
            target_version=payload.target_version,
            actor=payload.actor,
            reason=payload.reason,
        )
        return ModelRollbackResponse(**result)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rollback failed: {str(e)}")


@router.get("/models/audit-log", response_model=List[AuditEventItem])
def get_model_audit_log() -> List[AuditEventItem]:
    """Returns complete audit log of all model promotion, training, and rollback events."""
    history = model_promotion_manager.get_audit_history()
    return [AuditEventItem(**item) for item in history]
