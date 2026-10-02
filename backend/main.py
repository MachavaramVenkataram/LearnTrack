"""
LearnTrack - FastAPI Production Backend
Exposes endpoints for performance prediction, what-if simulations,
model benchmarking telemetry, and SHAP explainability.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import datetime
import os
import sys

# Ensure backend/ml is in path
sys.path.append(os.path.join(os.path.dirname(__file__), "ml"))

from predictor import predict_performance, load_artifacts

app = FastAPI(
    title="LearnTrack AI Analytics API",
    description="Production-grade AI inference engine for student performance analytics",
    version="1.4.0",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows local dev and production frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AcademicFeatures(BaseModel):
    attendance: float = Field(..., ge=0.0, le=100.0, description="Attendance percentage")
    study_hours_per_week: float = Field(..., ge=0.0, le=60.0, description="Weekly focused study hours")
    internal_marks: float = Field(..., ge=0.0, le=100.0, description="Internal assessment average")
    assignment_completion_rate: float = Field(..., ge=0.0, le=100.0, description="Assignment completion rate %")
    previous_cgpa: float = Field(..., ge=0.0, le=10.0, description="Cumulative GPA scale of 10.0")
    extracurricular_hours: Optional[float] = Field(4.0, ge=0.0, le=30.0)
    sleep_hours_avg: Optional[float] = Field(7.0, ge=3.0, le=12.0)
    practice_tests_taken: Optional[int] = Field(4, ge=0, le=25)
    backlogs_count: Optional[int] = Field(0, ge=0, le=10)


class SimulationRequest(BaseModel):
    baseline: AcademicFeatures
    simulated: AcademicFeatures


@app.on_event("startup")
async def startup_event():
    print("[LearnTrack API] Initializing ML models and checking artifacts...")
    load_artifacts()
    print("[LearnTrack API] Ready to serve inference requests.")


@app.get("/")
def read_root():
    return {
        "service": "LearnTrack AI Prediction Engine",
        "status": "operational",
        "version": "1.4.0",
        "docs_url": "/docs",
        "timestamp": datetime.datetime.utcnow().isoformat(),
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "runtime": "FastAPI + Scikit-Learn/XGBoost",
    }


@app.get("/api/model-info")
def get_model_info():
    _, metrics, _ = load_artifacts()
    if not metrics:
        raise HTTPException(status_code=503, detail="Model metadata is still warming up.")
    return {
        "champion_model": metrics.get("champion_model"),
        "champion_metrics": metrics.get("champion_metrics"),
        "benchmarks": metrics.get("all_models_benchmarks"),
        "feature_importances": metrics.get("feature_importances"),
        "dataset_samples": metrics.get("dataset_samples"),
        "version": metrics.get("version"),
    }


@app.post("/api/predict")
def predict(payload: AcademicFeatures):
    try:
        result = predict_performance(payload.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@app.post("/api/simulate")
def simulate(payload: SimulationRequest):
    try:
        baseline_res = predict_performance(payload.baseline.dict())
        simulated_res = predict_performance(payload.simulated.dict())

        delta = round(simulated_res["predicted_score"] - baseline_res["predicted_score"], 1)

        # Highlight which changes contributed the most
        b_dict = payload.baseline.dict()
        s_dict = payload.simulated.dict()
        drivers = []
        labels = {
            "attendance": ("Attendance", "%"),
            "study_hours_per_week": ("Study Hours", " hrs/wk"),
            "internal_marks": ("Internal Marks", " pts"),
            "assignment_completion_rate": ("Assignment Rate", "%"),
            "previous_cgpa": ("Prior CGPA", " pts"),
            "practice_tests_taken": ("Mock Exams", " tests"),
            "backlogs_count": ("Backlogs", " count"),
        }

        for k, (human_name, unit) in labels.items():
            diff = s_dict.get(k, 0) - b_dict.get(k, 0)
            if abs(diff) > 0.01:
                drivers.append({
                    "factor": human_name,
                    "change": round(diff, 1),
                    "unit": unit,
                    "from_val": b_dict.get(k),
                    "to_val": s_dict.get(k),
                })

        # Generate simulation summary advice
        if delta > 3.0:
            advice = f"Substantial projected improvement (+{delta}%). This trajectory shifts your grade from {baseline_res['predicted_grade']} to {simulated_res['predicted_grade']}."
        elif delta > 0.0:
            advice = f"Incremental improvement (+{delta}%). Solidifies your current performance band and decreases academic risk."
        elif delta < -3.0:
            advice = f"Projected performance decline ({delta}%). Risk level increases; consider maintaining baseline study habits."
        else:
            advice = "Neutral projection. Minor feature variations do not significantly destabilize your academic trajectory."

        return {
            "baseline": {
                "score": baseline_res["predicted_score"],
                "grade": baseline_res["predicted_grade"],
                "risk_level": baseline_res["risk_level"],
                "confidence": baseline_res["confidence"],
            },
            "simulated": {
                "score": simulated_res["predicted_score"],
                "grade": simulated_res["predicted_grade"],
                "risk_level": simulated_res["risk_level"],
                "confidence": simulated_res["confidence"],
            },
            "score_delta": delta,
            "drivers": drivers,
            "simulated_contributions": simulated_res["contributions"],
            "advice": advice,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
