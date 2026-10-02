"""
Synthetic & Calibrated Academic Dataset Generator for LearnTrack
Generates realistic multi-factor student academic performance data
grounded in empirical educational analytics.
"""

import numpy as np
import pandas as pd


def generate_academic_dataset(n_samples: int = 1600, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic student academic dataset.
    Features:
      - attendance: Percentage (45% to 99%)
      - study_hours_per_week: Weekly focused study hours (2 to 35)
      - internal_marks: Scaled score (30 to 98)
      - assignment_completion_rate: Percentage (25% to 100%)
      - previous_cgpa: Prior cumulative GPA on 10.0 scale (4.5 to 9.9)
      - extracurricular_hours: Weekly hours spent on clubs/sports (0 to 18)
      - sleep_hours_avg: Average nightly rest in hours (4.5 to 9.5)
      - practice_tests_taken: Mock quizzes and past exams completed (0 to 12)
      - backlogs_count: Active backlogs or failed prerequisites (0 to 4)
    """
    np.random.seed(random_state)

    # 1. Base latent academic aptitude factor (standard normal)
    latent_ability = np.random.normal(0, 1, n_samples)

    # 2. Correlated features based on latent aptitude + individual variance
    previous_cgpa = np.clip(6.8 + 1.2 * latent_ability + np.random.normal(0, 0.45, n_samples), 4.2, 9.95)
    attendance = np.clip(78 + 8 * latent_ability + np.random.normal(0, 7.5, n_samples), 45.0, 99.5)
    study_hours = np.clip(14 + 6 * latent_ability + np.random.normal(0, 4.0, n_samples), 2.0, 36.0)
    internal_marks = np.clip(68 + 12 * latent_ability + np.random.normal(0, 6.0, n_samples), 32.0, 98.5)
    assignment_rate = np.clip(80 + 10 * latent_ability + np.random.normal(0, 8.0, n_samples), 25.0, 100.0)
    practice_tests = np.clip(np.round(4.5 + 2.5 * latent_ability + np.random.normal(0, 1.8, n_samples)), 0, 12).astype(int)
    
    # Non-linear factors
    sleep_hours = np.clip(np.random.normal(7.0, 1.1, n_samples) - 0.1 * np.maximum(0, study_hours - 24), 4.2, 9.8)
    extracurricular_hours = np.clip(np.random.exponential(scale=4.5, size=n_samples), 0.0, 18.0)
    
    # Backlogs correlate negatively with past CGPA and attendance
    backlog_prob = 1.0 / (1.0 + np.exp(previous_cgpa - 6.2))
    backlogs_count = np.random.binomial(n=3, p=np.clip(backlog_prob * 0.7, 0.02, 0.85), size=n_samples)

    # 3. Ground truth target formula with empirical educational weights:
    # - Internal assessments (strongest proximal predictor): ~32%
    # - Previous CGPA (longitudinal baseline): ~24%
    # - Study hours (active effort): ~16%
    # - Attendance (engagement thresholding): ~14%
    # - Assignment completion (consistency): ~8%
    # - Practice tests & sleep balance: ~6%
    
    # Attendance non-linear penalty for < 75%
    attendance_penalty = np.where(attendance < 75.0, (75.0 - attendance) * 0.42, 0.0)
    
    # Sleep penalty: under 5.5 hours or over 9.5 hours reduces cognitive performance
    sleep_penalty = np.where(sleep_hours < 5.8, (5.8 - sleep_hours) * 1.8, 0.0) + \
                    np.where(sleep_hours > 9.2, (sleep_hours - 9.2) * 1.2, 0.0)
    
    # Backlog burden
    backlog_penalty = backlogs_count * 2.8

    # Diminishing returns on study hours beyond 28 hrs
    effective_study_hours = np.minimum(study_hours, 26.0) + 0.3 * np.maximum(0, study_hours - 26.0)

    score_raw = (
        0.32 * internal_marks +
        0.24 * (previous_cgpa * 10.0) +
        0.16 * (effective_study_hours * 2.8) +
        0.14 * attendance +
        0.08 * assignment_rate +
        0.04 * (practice_tests * 2.2) -
        attendance_penalty -
        sleep_penalty -
        backlog_penalty +
        np.random.normal(0, 2.8, n_samples)  # Unobserved real-world variance
    )

    final_score = np.clip(np.round(score_raw, 2), 28.0, 99.5)

    df = pd.DataFrame({
        "attendance": np.round(attendance, 1),
        "study_hours_per_week": np.round(study_hours, 1),
        "internal_marks": np.round(internal_marks, 1),
        "assignment_completion_rate": np.round(assignment_rate, 1),
        "previous_cgpa": np.round(previous_cgpa, 2),
        "extracurricular_hours": np.round(extracurricular_hours, 1),
        "sleep_hours_avg": np.round(sleep_hours, 1),
        "practice_tests_taken": practice_tests,
        "backlogs_count": backlogs_count,
        "final_score": final_score,
    })

    return df


if __name__ == "__main__":
    df = generate_academic_dataset(1600)
    print(f"Generated dataset with {len(df)} samples.")
    print(df.describe())
