"""
LearnTrack ML: SHAP Explainability Service
Computes Shapley feature attributions for individual student predictions.
Enforces non-causal statistical correlation language.
"""

import numpy as np
import pandas as pd
import shap
from typing import List, Dict, Any

FRIENDLY_NAMES = {
    "attendance_percentage": "Attendance Rate",
    "assignment_score": "Assignment Marks",
    "internal_marks": "Internal Assessment",
    "previous_score": "Previous Academic Score",
    "study_hours": "Weekly Study Hours",
    "assignments_completed": "Completed Assignments",
    "average_assessment_score": "Coursework Average",
    "previous_performance_trend": "Performance Trajectory",
    "attendance_risk_flag": "Attendance Threshold",
    "study_intensity_ratio": "Study Consistency",
    "weighted_academic_score": "Composite Academic Index",
}

class ShapExplainabilityService:
    def __init__(self, model: Any, background_data: np.ndarray, feature_names: List[str]):
        self.model = model
        self.feature_names = feature_names

        # Use LinearExplainer for linear models or TreeExplainer for tree models
        model_type_str = str(type(model)).lower()
        if "linear" in model_type_str:
            self.explainer = shap.LinearExplainer(model, background_data)
        else:
            self.explainer = shap.TreeExplainer(model, data=background_data)

    def explain_instance(
        self,
        scaled_features: np.ndarray,
        raw_features: Dict[str, Any],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Computes local Shapley feature attributions for a single student.
        Strictly frames results as statistical associations rather than causal outcomes.
        """
        # Ensure 2D array
        if len(scaled_features.shape) == 1:
            scaled_features = scaled_features.reshape(1, -1)

        shap_values = self.explainer.shap_values(scaled_features)
        if isinstance(shap_values, list):
            vals = shap_values[0][0]
        elif len(shap_values.shape) > 1:
            vals = shap_values[0]
        else:
            vals = shap_values

        explanations = []
        for name, val in zip(self.feature_names, vals):
            impact = float(np.round(val, 2))
            direction = "positive" if impact > 0 else ("negative" if impact < 0 else "neutral")
            friendly_name = FRIENDLY_NAMES.get(name, name.replace("_", " ").title())

            # Retrieve raw contextual value if available
            raw_val = raw_features.get(name, None)
            if raw_val is not None:
                desc = (
                    f"{friendly_name} ({raw_val}) was associated with a {impact:+.1f} point adjustment in the model's estimate."
                )
            else:
                desc = (
                    f"{friendly_name} was associated with a {impact:+.1f} point adjustment in the model's estimate."
                )

            explanations.append({
                "feature": name,
                "label": friendly_name,
                "impact": abs(impact),
                "raw_impact": impact,
                "direction": direction,
                "description": desc,
            })

        # Sort by absolute impact descending
        explanations.sort(key=lambda x: x["impact"], reverse=True)
        return explanations[:top_k]
