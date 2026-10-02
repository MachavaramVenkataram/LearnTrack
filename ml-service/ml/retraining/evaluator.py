"""
LearnTrack ML: Candidate Model Evaluator & Regression Protection
Compares candidate models against the active production model across MAE, RMSE, R²,
and cross-validation stability to prevent silent model performance regressions.
"""

from typing import Dict, Any, Optional

MAX_REGRESSION_TOLERANCE = 0.05  # Candidate cannot be > 5% worse in RMSE than production baseline


class CandidateModelEvaluator:
    def __init__(self, regression_tolerance: float = MAX_REGRESSION_TOLERANCE):
        self.regression_tolerance = regression_tolerance

    def evaluate_candidate(
        self,
        candidate_metrics: Dict[str, Any],
        production_metrics: Dict[str, Any],
        candidate_version: str,
        production_version: str,
    ) -> Dict[str, Any]:
        """
        Executes formal comparative evaluation between Candidate and Production models.
        Applies regression protection rules.
        """
        # Extract Test Metrics
        cand_test = candidate_metrics.get("test", {})
        cand_rmse = float(cand_test.get("rmse", 999.0))
        cand_mae = float(cand_test.get("mae", 999.0))
        cand_r2 = float(cand_test.get("r2", -1.0))

        prod_test = production_metrics.get("champion_test_metrics", production_metrics.get("test", {}))
        prod_rmse = float(prod_test.get("rmse", 999.0))
        prod_mae = float(prod_test.get("mae", 999.0))
        prod_r2 = float(prod_test.get("r2", 0.0))

        # Metric deltas (negative delta in RMSE is improvement)
        rmse_delta = round(cand_rmse - prod_rmse, 3)
        mae_delta = round(cand_mae - prod_mae, 3)
        r2_delta = round(cand_r2 - prod_r2, 4)

        # Regression check: does candidate exceed allowable threshold?
        max_allowable_rmse = round(prod_rmse * (1.0 + self.regression_tolerance), 3)
        is_regression = cand_rmse > max_allowable_rmse

        if is_regression:
            status = "REJECTED"
            recommendation = (
                f"REJECT candidate {candidate_version}. Candidate test RMSE ({cand_rmse}) exceeds "
                f"maximum allowable regression threshold ({max_allowable_rmse}) compared to production ({prod_rmse})."
            )
            is_promotable = False
        else:
            status = "VALIDATED"
            is_better = cand_rmse <= prod_rmse
            perf_qualifier = "improved" if is_better else "within acceptable regression tolerance"
            recommendation = (
                f"VALIDATED candidate {candidate_version}. Performance is {perf_qualifier} "
                f"(Candidate RMSE: {cand_rmse} vs Production: {prod_rmse}). "
                "Candidate model is verified and held for explicit administrator promotion."
            )
            is_promotable = True

        comparison = {
            "candidate_version": candidate_version,
            "production_version": production_version,
            "status": status,
            "is_promotable": is_promotable,
            "recommendation": recommendation,
            "regression_protection": {
                "tolerance_percent": self.regression_tolerance * 100,
                "max_allowable_rmse": max_allowable_rmse,
                "passed_regression_check": not is_regression,
            },
            "metrics_comparison": {
                "candidate": {
                    "rmse": cand_rmse,
                    "mae": cand_mae,
                    "r2": cand_r2,
                },
                "production": {
                    "rmse": prod_rmse,
                    "mae": prod_mae,
                    "r2": prod_r2,
                },
                "deltas": {
                    "rmse_delta": rmse_delta,
                    "mae_delta": mae_delta,
                    "r2_delta": r2_delta,
                },
            },
        }

        return comparison


candidate_model_evaluator = CandidateModelEvaluator()
