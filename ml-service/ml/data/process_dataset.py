"""
Process raw UCI student datasets into clean, processed academic records.
Strictly excludes all demographic/personal attributes.
"""

import os
import numpy as np
import pandas as pd

def build_processed_dataset():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    raw_dir = os.path.join(base_dir, "raw")
    processed_dir = os.path.join(base_dir, "processed")
    os.makedirs(processed_dir, exist_ok=True)

    mat_path = os.path.join(raw_dir, "student-mat.csv")
    por_path = os.path.join(raw_dir, "student-por.csv")

    if not os.path.exists(mat_path) or not os.path.exists(por_path):
        raise FileNotFoundError("Raw UCI CSV files missing in raw/ directory.")

    df_mat = pd.read_csv(mat_path, sep=";")
    df_por = pd.read_csv(por_path, sep=";")

    df_mat["course_type"] = "mathematics"
    df_por["course_type"] = "portuguese"

    combined = pd.concat([df_mat, df_por], ignore_index=True)
    np.random.seed(42)

    # 1. Academic Target & Assessment conversions (0-20 to 0-100)
    internal_marks = np.clip(np.round(combined["G1"] * 5.0, 1), 0.0, 100.0)
    previous_score = np.clip(np.round(combined["G2"] * 5.0, 1), 0.0, 100.0)
    final_score = np.clip(np.round(combined["G3"] * 5.0, 1), 0.0, 100.0)

    # 2. Attendance percentage (90 instructional days per standard semester)
    attendance_raw = 100.0 - (combined["absences"] / 90.0) * 100.0
    attendance_percentage = np.clip(np.round(attendance_raw, 1), 25.0, 100.0)

    # 3. Weekly study hours mapped from studytime tiers (1: <2h, 2: 2-5h, 3: 5-10h, 4: >10h)
    study_tier_hours = {1: 1.8, 2: 3.8, 3: 7.2, 4: 12.5}
    base_hours = combined["studytime"].map(study_tier_hours).fillna(3.5).values
    jitter = np.random.normal(0, 0.4, len(combined))
    study_hours = np.clip(np.round(base_hours + jitter, 1), 0.5, 30.0)

    # 4. Continuous Assignment Score & Completed count
    assignment_latent = 0.52 * internal_marks + 0.48 * previous_score + np.random.normal(0, 3.2, len(combined))
    assignment_score = np.clip(np.round(assignment_latent, 1), 0.0, 100.0)

    # 10 assignments per semester
    completion_rate = (assignment_score / 100.0) * 0.7 + (attendance_percentage / 100.0) * 0.3
    assignments_completed = np.clip(np.round(completion_rate * 10 + np.random.normal(0, 0.5, len(combined))), 0, 10).astype(int)

    processed_df = pd.DataFrame({
        "attendance_percentage": attendance_percentage,
        "assignment_score": assignment_score,
        "internal_marks": internal_marks,
        "previous_score": previous_score,
        "study_hours": study_hours,
        "assignments_completed": assignments_completed,
        "final_score": final_score,
    })

    # Drop any potential duplicates or nulls
    processed_df = processed_df.drop_duplicates().dropna().reset_index(drop=True)

    output_path = os.path.join(processed_dir, "academic_performance.csv")
    processed_df.to_csv(output_path, index=False)
    print(f"Processed dataset written to {output_path} with {len(processed_df)} valid samples.")
    print("\nSummary Statistics:")
    print(processed_df.describe().round(2))

    return processed_df

if __name__ == "__main__":
    build_processed_dataset()
