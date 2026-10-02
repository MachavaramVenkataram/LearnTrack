"""
LearnTrack ML: Data Quality Report Persistence & History Manager
Stores, retrieves, and versions Data Quality & Validation reports.
"""

import os
import json
import datetime
from typing import Dict, Any, List, Optional

try:
    from app.core.config import settings
    DEFAULT_STORAGE_DIR = os.path.join(settings.ARTIFACTS_DIR, "data_quality")
except Exception:
    DEFAULT_STORAGE_DIR = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "artifacts", "data_quality")
    )


class DataQualityReportStore:
    def __init__(self, storage_dir: Optional[str] = None):
        self.storage_dir = storage_dir or DEFAULT_STORAGE_DIR
        os.makedirs(self.storage_dir, exist_ok=True)
        self.latest_report_path = os.path.join(self.storage_dir, "latest_report.json")
        self.history_index_path = os.path.join(self.storage_dir, "history_index.json")

    def save_report(self, report: Dict[str, Any]) -> str:
        """
        Saves a validated Data Quality Report as latest and appends to versioned history.
        """
        timestamp_str = datetime.datetime.now(datetime.timezone.utc).strftime("%Y%m%d_%H%M%S")
        version = report.get("dataset_version", "1.0.0")
        filename = f"report_{version}_{timestamp_str}.json"
        filepath = os.path.join(self.storage_dir, filename)

        # Write versioned report
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)

        # Write latest report pointer
        with open(self.latest_report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)

        # Update history index
        history = self.get_history_summary()
        summary_entry = {
            "timestamp": report.get("timestamp"),
            "dataset_version": report.get("dataset_version"),
            "status": report.get("overall_status") or report.get("status"),
            "total_rows": report.get("total_rows"),
            "total_columns": report.get("total_columns"),
            "missing_values": report.get("missing_values", 0),
            "duplicate_rows": report.get("duplicate_rows", 0),
            "issues_count": len(report.get("issues", [])),
            "warnings_count": len(report.get("warnings", [])),
            "filename": filename,
        }
        # Prepend latest
        history.insert(0, summary_entry)
        # Limit history index to 50 entries
        history = history[:50]

        with open(self.history_index_path, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=2)

        return filepath

    def get_latest_report(self) -> Optional[Dict[str, Any]]:
        """Retrieves the latest available data quality report."""
        if os.path.exists(self.latest_report_path):
            try:
                with open(self.latest_report_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[DataQualityReportStore] Error loading latest report: {e}")
        return None

    def get_history_summary(self) -> List[Dict[str, Any]]:
        """Retrieves summary listing of historical data quality reports."""
        if os.path.exists(self.history_index_path):
            try:
                with open(self.history_index_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[DataQualityReportStore] Error loading history index: {e}")
        return []


data_quality_report_store = DataQualityReportStore()
