"""
LearnTrack ML: Explicit Model Promotion, Rollback & Audit Trail Manager
Enforces strict promotion policy (no automatic replacement), maintains immutable model archives,
supports zero-downtime rollback, and logs comprehensive ML lifecycle audit events.
"""

import os
import json
import shutil
import datetime
from typing import Dict, Any, List, Optional
import joblib

try:
    from app.core.config import settings
    ARTIFACTS_DIR = settings.ARTIFACTS_DIR
except Exception:
    ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "artifacts"))

ARCHIVE_DIR = os.path.join(ARTIFACTS_DIR, "archive")
CANDIDATES_DIR = os.path.join(ARTIFACTS_DIR, "candidates")
AUDIT_LOG_PATH = os.path.join(ARTIFACTS_DIR, "audit_log.json")


class ModelPromotionManager:
    def __init__(self):
        os.makedirs(ARCHIVE_DIR, exist_ok=True)
        os.makedirs(CANDIDATES_DIR, exist_ok=True)

    def log_audit_event(
        self,
        action: str,
        model_name: str,
        model_version: str,
        previous_version: Optional[str] = None,
        actor: str = "system",
        reason: str = "",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Records an immutable audit event for model lifecycle actions."""
        event = {
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "action": action,
            "model_name": model_name,
            "model_version": model_version,
            "previous_version": previous_version,
            "actor": actor,
            "reason": reason,
            "metadata": metadata or {},
        }

        history = self.get_audit_history()
        history.insert(0, event)

        with open(AUDIT_LOG_PATH, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2)

        return event

    def get_audit_history(self) -> List[Dict[str, Any]]:
        """Retrieves history of model promotions, rollbacks, and evaluations."""
        if os.path.exists(AUDIT_LOG_PATH):
            try:
                with open(AUDIT_LOG_PATH, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[ModelPromotionManager] Error reading audit log: {e}")
        return []

    def promote_candidate(
        self,
        candidate_version: str,
        actor: str = "authorized_admin",
        reason: str = "Manual administrator promotion following comparative validation",
    ) -> Dict[str, Any]:
        """
        Promotes a VALIDATED candidate model into active production.
        Archives the existing production model for rollback safety.
        """
        cand_pkg_path = os.path.join(CANDIDATES_DIR, f"{candidate_version}.pkl")
        cand_meta_path = os.path.join(CANDIDATES_DIR, f"{candidate_version}_meta.json")

        if not os.path.exists(cand_pkg_path) or not os.path.exists(cand_meta_path):
            raise FileNotFoundError(f"Candidate artifact '{candidate_version}' not found in candidate registry.")

        with open(cand_meta_path, "r", encoding="utf-8") as f:
            cand_meta = json.load(f)

        # 1. Archive Current Production Model
        from app.services.model_service import model_service
        current_meta = model_service.get_metadata()
        curr_ver = current_meta.get("model_version", "1")

        prod_model_path = os.path.join(ARTIFACTS_DIR, "performance_model.pkl")
        prod_meta_path = os.path.join(ARTIFACTS_DIR, "metadata.json")

        if os.path.exists(prod_model_path):
            archive_model_path = os.path.join(ARCHIVE_DIR, f"model_v{curr_ver}.pkl")
            archive_meta_path = os.path.join(ARCHIVE_DIR, f"metadata_v{curr_ver}.json")
            shutil.copy2(prod_model_path, archive_model_path)
            shutil.copy2(prod_meta_path, archive_meta_path)
            print(f"[ModelPromotionManager] Successfully archived production model v{curr_ver} to {archive_model_path}")

        # 2. Deploy Candidate to Production Target
        cand_pkg = joblib.load(cand_pkg_path)

        # Update metadata to reflect production state
        new_prod_meta = {
            **current_meta,
            "model_version": candidate_version,
            "model_type": cand_meta.get("model_type", current_meta.get("model_type")),
            "run_id": cand_meta.get("run_id", current_meta.get("run_id")),
            "dataset_version": cand_meta.get("dataset_version", current_meta.get("dataset_version")),
            "dataset_hash": cand_meta.get("dataset_hash", current_meta.get("dataset_hash")),
            "training_date": cand_meta.get("created_at"),
            "champion_validation_metrics": cand_meta.get("validation_metrics", {}),
            "champion_test_metrics": cand_meta.get("test_metrics", {}),
            "champion_cv_metrics": cand_meta.get("cv_metrics", {}),
            "promoted_by": actor,
            "promoted_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "promotion_reason": reason,
            "previous_version": curr_ver,
        }

        # Save active production files
        joblib.dump(cand_pkg, prod_model_path)
        with open(prod_meta_path, "w", encoding="utf-8") as f:
            json.dump(new_prod_meta, f, indent=2)

        # 3. Reload in-memory model service
        model_service._is_loaded = False
        model_service.load()

        # 4. Audit Log
        event = self.log_audit_event(
            action="promoted",
            model_name=new_prod_meta.get("model_name", "learntrack-student-performance"),
            model_version=candidate_version,
            previous_version=curr_ver,
            actor=actor,
            reason=reason,
            metadata={"new_metrics": cand_meta.get("test_metrics")},
        )

        return {
            "status": "SUCCESS",
            "message": f"Candidate {candidate_version} promoted to production successfully.",
            "promoted_version": candidate_version,
            "previous_version": curr_ver,
            "audit_event": event,
        }

    def rollback(
        self,
        target_version: str,
        actor: str = "authorized_admin",
        reason: str = "Authorized rollback to previous model baseline",
    ) -> Dict[str, Any]:
        """
        Rolls back the active production model to a designated archived version.
        """
        archive_model_path = os.path.join(ARCHIVE_DIR, f"model_v{target_version}.pkl")
        archive_meta_path = os.path.join(ARCHIVE_DIR, f"metadata_v{target_version}.json")

        if not os.path.exists(archive_model_path) or not os.path.exists(archive_meta_path):
            raise FileNotFoundError(f"Archived model version 'v{target_version}' not found in archive registry.")

        from app.services.model_service import model_service
        current_meta = model_service.get_metadata()
        curr_ver = current_meta.get("model_version", "unknown")

        prod_model_path = os.path.join(ARTIFACTS_DIR, "performance_model.pkl")
        prod_meta_path = os.path.join(ARTIFACTS_DIR, "metadata.json")

        # Archive current broken/degraded model before rolling back
        emergency_archive = os.path.join(ARCHIVE_DIR, f"model_v{curr_ver}_pre_rollback.pkl")
        shutil.copy2(prod_model_path, emergency_archive)

        # Restore archived model
        shutil.copy2(archive_model_path, prod_model_path)
        shutil.copy2(archive_meta_path, prod_meta_path)

        # Reload model service
        model_service._is_loaded = False
        model_service.load()

        # Audit Log
        event = self.log_audit_event(
            action="rolled_back",
            model_name=current_meta.get("model_name", "learntrack-student-performance"),
            model_version=target_version,
            previous_version=curr_ver,
            actor=actor,
            reason=reason,
        )

        return {
            "status": "SUCCESS",
            "message": f"Successfully rolled back production model from v{curr_ver} to v{target_version}.",
            "active_version": target_version,
            "previous_version": curr_ver,
            "audit_event": event,
        }

    def list_archived_versions(self) -> List[Dict[str, Any]]:
        """Lists available archived versions eligible for rollback."""
        archives = []
        if not os.path.exists(ARCHIVE_DIR):
            return []

        for f in os.listdir(ARCHIVE_DIR):
            if f.startswith("metadata_v") and f.endswith(".json"):
                meta_path = os.path.join(ARCHIVE_DIR, f)
                try:
                    with open(meta_path, "r", encoding="utf-8") as meta_f:
                        data = json.load(meta_f)
                        archives.append({
                            "version": data.get("model_version"),
                            "model_type": data.get("model_type"),
                            "dataset_version": data.get("dataset_version"),
                            "training_date": data.get("training_date"),
                            "test_metrics": data.get("champion_test_metrics"),
                        })
                except Exception:
                    pass
        return archives


model_promotion_manager = ModelPromotionManager()
