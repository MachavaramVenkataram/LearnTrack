"""
LearnTrack ML: Data Schema & Validation Constraints
Defines mathematical and domain boundaries for student performance datasets.
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field

@dataclass
class ColumnConstraint:
    name: str
    dtype: str  # "float", "int", "str"
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    allowed_values: Optional[List[str]] = None
    allow_null: bool = False
    is_target: bool = False
    description: str = ""

# Standard LearnTrack Academic Performance Dataset Schema
ACADEMIC_DATASET_SCHEMA: Dict[str, ColumnConstraint] = {
    "attendance_percentage": ColumnConstraint(
        name="attendance_percentage",
        dtype="float",
        min_value=0.0,
        max_value=100.0,
        allow_null=False,
        description="Classroom attendance percentage (0.0 to 100.0%)"
    ),
    "assignment_score": ColumnConstraint(
        name="assignment_score",
        dtype="float",
        min_value=0.0,
        max_value=100.0,
        allow_null=False,
        description="Continuous assessment assignment marks (0.0 to 100.0)"
    ),
    "internal_marks": ColumnConstraint(
        name="internal_marks",
        dtype="float",
        min_value=0.0,
        max_value=100.0,
        allow_null=False,
        description="Midterm / internal examination marks (0.0 to 100.0)"
    ),
    "previous_score": ColumnConstraint(
        name="previous_score",
        dtype="float",
        min_value=0.0,
        max_value=100.0,
        allow_null=False,
        description="Prior academic semester / test performance score (0.0 to 100.0)"
    ),
    "study_hours": ColumnConstraint(
        name="study_hours",
        dtype="float",
        min_value=0.0,
        max_value=60.0,
        allow_null=False,
        description="Self-directed weekly study hours (0.0 to 60.0 hours)"
    ),
    "assignments_completed": ColumnConstraint(
        name="assignments_completed",
        dtype="int",
        min_value=0,
        max_value=30,
        allow_null=False,
        description="Total submitted coursework assignments (0 to 30)"
    ),
    "final_score": ColumnConstraint(
        name="final_score",
        dtype="float",
        min_value=0.0,
        max_value=100.0,
        allow_null=False,
        is_target=True,
        description="Target variable: final continuous course marks (0.0 to 100.0)"
    ),
}

# Thresholds for Data Quality Checks
DATA_QUALITY_MAX_MISSING_PERCENT = 20.0  # Flag warning if any feature exceeds 20% missing
DATA_QUALITY_CRITICAL_MISSING_PERCENT = 50.0  # Fail validation if missing > 50%
DATA_QUALITY_MAX_DUPLICATE_PERCENT = 10.0  # Flag warning if exact duplicates > 10%
DATA_QUALITY_OUTLIER_IQR_MULTIPLIER = 1.5  # Standard Tukey IQR fences
