# LearnTrack ML: Academic Performance Prediction Engine

## 1. Problem Definition

The primary objective of the LearnTrack Machine Learning Engine is to estimate an enrolled student's expected academic score (0.0 to 100.0) based on continuous assessment indicators, study habits, and historical academic trajectory.

By estimating final performance before high-stakes term examinations, LearnTrack provides early alerts to students and academic advisors, highlighting areas needing intervention and consistency improvements.

---

## 2. Dataset & Ethical Constraints

* **Benchmark Source**: UCI Machine Learning Repository - Student Performance Data Set (P. Cortez and A. Silva, 2008).
* **Sample Size**: 1,044 curated academic records across Mathematics ($N=395$) and Portuguese Language ($N=649$).
* **Target Variable**: Continuous numerical final score (`final_score`, 0.0 to 100.0).
* **Ethical AI Policy**:
  * **Strictly Excluded**: All socio-demographic personal attributes (gender, age, address, relationship status, family background) have been excluded from training.
  * **Grounded in Academic Effort**: Only direct educational metrics (attendance, assignment evaluations, internal assessments, study hours, and previous academic scores) are used.

---

## 3. Feature Engineering & Preprocessing

* **Base Features**:
  1. `attendance_percentage`: Institutional class presence rate (0.0% to 100.0%).
  2. `assignment_score`: Continuous evaluation on coursework assignments (0.0 to 100.0).
  3. `internal_marks`: Continuous assessment / midterm marks (0.0 to 100.0).
  4. `previous_score`: Prior term academic achievement (0.0 to 100.0).
  5. `study_hours`: Weekly dedicated focused study hours ($\ge 0.0$).
  6. `assignments_completed`: Count of mandatory coursework assignments completed ($\ge 0$).
* **Engineered Features**:
  * `average_assessment_score`: Weighted composite of internal marks and assignment score.
  * `previous_performance_trend`: Trajectory between current internal marks and previous score.
  * `attendance_risk_flag`: Binary indicator flagging attendance below 75%.
  * `study_intensity_ratio`: Focused hours relative to assignments completed.
  * `weighted_academic_score`: Multi-factor composite baseline.
* **Leakage Prevention**:
  * Data is split into 70% Train ($N=730$), 15% Validation ($N=157$), and 15% Test ($N=157$).
  * Feature scaling (`StandardScaler`) is fitted strictly on the training partition.

---

## 4. Models Benchmarking & Selection

Four candidate regression architectures were benchmarked using 5-fold cross-validation and evaluated on the held-out validation set:

| Model Architecture | 5-Fold CV RMSE | Validation MAE | Validation RMSE | Validation $R^2$ |
| :--- | :--- | :--- | :--- | :--- |
| **Linear Regression** *(Champion)* | **6.512** | **4.358** | **6.357** | **0.8422** |
| Random Forest Regressor | 6.840 | 4.602 | 6.670 | 0.8262 |
| Gradient Boosting Regressor | 6.782 | 4.709 | 6.643 | 0.8277 |
| XGBoost Regressor | 6.815 | 4.477 | 6.699 | 0.8248 |

### Selection Rationale

Linear Regression was selected as the champion model on empirical evidence: it achieved the lowest Validation RMSE (6.357) and highest $R^2$ (0.8422) while avoiding overfitting risks common to tree ensembles on tabular academic records. On the independent held-out test set ($N=157$), it confirmed high generalizability:

* **Test MAE**: 4.605 points
* **Test RMSE**: 7.740 points
* **Test $R^2$**: 0.8366

---

## 5. SHAP Explainability & Causal Disclaimer

* **Explainability Engine**: Integrated with SHAP (`shap.LinearExplainer`) to compute local feature attributions for every individual student prediction.
* **Non-Causal Language Policy**:
  * SHAP values indicate **statistical correlation**, not causation.
  * Explanations are strictly phrased as: *"Higher attendance was associated with a +X point adjustment in the model's estimate."*
  * Never stated as: *"Attendance caused your score to increase."*

---

## 6. Critical Model Limitations

1. **Estimates, Not Guarantees**: Predictions are statistical estimates generated from historical patterns. They do not determine or guarantee future academic outcomes.
2. **Context Variance**: Grading strictness and curricular difficulty vary across departments and institutions.
3. **Unobserved Factors**: External variables such as personal health, exam anxiety, and instructor variances are unobserved by the model.
4. **Advisory Tool**: Predictions should support student self-reflection and proactive study planning, never administrative punitive actions.

---

## 7. API Specification & Deployment

* **Microservice Framework**: FastAPI + Uvicorn
* **Default Port**: 8001 (configurable via `PORT` environment variable)

### Endpoints

* `GET /health`: Health verification and model loading state.
* `GET /model/info`: Model metadata, version, and benchmark metrics.
* `POST /predict`: Structured inference with validation and SHAP attributions.

### Local Development

```bash
cd ml-service
pip install -r requirements.txt
python ml/data/process_dataset.py
python ml/models/train.py
python -m pytest tests
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

### Docker Deployment

```bash
docker build -t learntrack-ml:v1.0.0 .
docker run -p 8001:8001 learntrack-ml:v1.0.0
```
