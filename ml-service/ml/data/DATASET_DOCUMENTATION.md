# LearnTrack ML Dataset Documentation

## 1. Overview & Provenance

* **Dataset Name**: Student Performance Benchmark Dataset (Mathematics & Portuguese Courses)
* **Original Creators**: Paulo Cortez and Alice Maria Gonçalves Silva (University of Minho, Portugal)
* **Original Publication**: Cortez, P., & Silva, A. (2008). *Using Data Mining to Predict Secondary School Student Performance*. In Proceedings of the 5th Annual Future Business Technology Conference (FUBUTEC 2008), pp. 5–12.
* **Repository Source**: [UCI Machine Learning Repository: Student Performance Data Set](https://archive.ics.uci.edu/dataset/320/student+performance)
* **License**: Creative Commons Attribution 4.0 International ([CC BY 4.0](https://creativecommons.org/licenses/by/4.0/))
* **Sample Count**: Total of **1,044 student records** across Mathematics ($N=395$) and Portuguese Language ($N=649$).

---

## 2. Ethical AI Design & Feature Filtering

In accordance with ethical educational data mining standards and LearnTrack's core privacy guidelines:

* **Excluded Demographics**: Sensitive personal, socio-demographic, and personal relationship attributes from the original survey (including gender, age, residential address type, romantic status, family size, parental cohabitation status, and alcohol consumption) were **strictly excluded** from model training to prevent biased or discriminatory inferences.
* **Included Features**: Only directly measurable academic engagement and performance indicators are utilized:
  1. `attendance_percentage`: Continuous measure (0.0% to 100.0%) derived from institutional session records.
  2. `assignment_score`: Average coursework and assignment evaluation (0.0 to 100.0).
  3. `internal_marks`: Continuous assessment and midterm examination evaluations (0.0 to 100.0, derived from $G1 \times 5$).
  4. `previous_score`: Prior academic term/course achievement marks (0.0 to 100.0, derived from $G2 \times 5$).
  5. `study_hours`: Dedicated weekly focused self-study hours ($\ge 0.0$).
  6. `assignments_completed`: Count of mandatory and elective assignments submitted on time ($\ge 0$).

---

## 3. Target Variable

* **Target Name**: `final_score`
* **Scale**: Numerical continuous score from **0.0 to 100.0** (standard academic percentage scale, normalized from the original 0–20 scale via $G3 \times 5$).
* **Task Type**: **Supervised Regression**.
* **Grade Derivation**: Final letter grades and risk categories are mapped deterministically from the predicted score via a configurable institutional grading scale rather than an opaque black-box classifier.

---

## 4. Dataset Directory Structure

```text
ml-service/ml/data/
├── raw/
│   ├── student-mat.csv    # Original UCI Math course records (N=395)
│   └── student-por.csv    # Original UCI Portuguese course records (N=649)
├── processed/
│   └── academic_performance.csv  # Curated, validated dataset (N=1,044)
└── DATASET_DOCUMENTATION.md      # This specification
```

---

## 5. Statistical Characteristics

* **Target Mean**: ~58.2 / 100
* **Target Standard Deviation**: ~19.5
* **Attendance Mean**: ~89.4%
* **Study Hours Mean**: ~4.2 hours/week
* **Missing Values**: 0 null entries in cleaned processed set.

---

## 6. Known Limitations

1. **Contextual Specificity**: The raw source data originated from secondary education in the Alentejo region of Portugal. While fundamental study habits, attendance, and internal marks correlate universally with academic performance, distribution baselines may shift across international collegiate curricula.
2. **Correlation vs. Causation**: Regression weights and SHAP values describe statistical associations learned by the model from historical cohorts. They do not prove that altering an isolated factor will automatically guarantee a specific grade.
3. **No Private Student Leakage**: LearnTrack never uses private student Supabase records for public training without explicit institutional consent and differential privacy safeguards.
