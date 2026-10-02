"""
LearnTrack ML: Evaluation & Error Analysis Package
"""
from ml.evaluation.residuals import analyze_residuals, compute_residuals
from ml.evaluation.segment_analysis import analyze_performance_ranges, analyze_feature_segments
from ml.evaluation.error_analysis import error_analysis_engine

__all__ = [
    "analyze_residuals",
    "compute_residuals",
    "analyze_performance_ranges",
    "analyze_feature_segments",
    "error_analysis_engine",
]
