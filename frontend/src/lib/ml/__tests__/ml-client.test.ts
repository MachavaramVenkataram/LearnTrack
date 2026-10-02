/**
 * LearnTrack ML API Client & Integration Test Suite
 * Tests:
 * 1. Configuration & URL normalization
 * 2. Academic feature validation rules
 * 3. Live FastAPI /health verification
 * 4. Live FastAPI /model/info verification
 * 5. Live FastAPI /predict inference & SHAP feature attribution
 * 6. Live FastAPI /simulate sensitivity analysis
 * 7. Offline state and error classification
 * 8. Invalid input rejection (422)
 */

import {
  checkMLHealth,
  getModelInfo,
  predictPerformance,
  simulatePerformance,
  validateAcademicInputs,
  MLError,
} from "@/lib/api/ml";
import { ML_CONFIG, getMLApiUrl } from "@/lib/ml/config";

async function runTests() {
  console.log("==================================================================");
  console.log("🚀 STARTING LEARNTRACK ML CLIENT & FASTAPI INTEGRATION TEST SUITE");
  console.log("==================================================================");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, message: string) {
    total++;
    if (!condition) {
      console.error(`  ✗ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
    console.log(`  ✓ ${message}`);
    passed++;
  }

  // -------------------------------------------------------------
  // TEST 1: Centralized Configuration
  // -------------------------------------------------------------
  console.log("\nTEST 1: ML Service Configuration & Base URL");
  assert(typeof ML_CONFIG.baseUrl === "string" && ML_CONFIG.baseUrl.length > 0, "Base URL is configured");
  assert(!ML_CONFIG.baseUrl.endsWith("/"), "Base URL has trailing slash stripped");
  assert(getMLApiUrl("/health").endsWith("/health"), "getMLApiUrl builds correct absolute path");
  assert(getMLApiUrl("predict").endsWith("/predict"), "getMLApiUrl handles paths without leading slash");

  // -------------------------------------------------------------
  // TEST 2: Client-Side Academic Input Validation
  // -------------------------------------------------------------
  console.log("\nTEST 2: Client-Side Input Boundary Validation");
  const validInputs = {
    attendance_percentage: 85,
    assignment_score: 82,
    internal_marks: 78,
    previous_score: 75,
    study_hours: 14,
    assignments_completed: 8,
  };
  assert(validateAcademicInputs(validInputs).valid === true, "Accepts valid academic inputs");

  assert(validateAcademicInputs({ ...validInputs, attendance_percentage: -5 }).valid === false, "Rejects negative attendance");
  assert(validateAcademicInputs({ ...validInputs, attendance_percentage: 105 }).valid === false, "Rejects attendance > 100%");
  assert(validateAcademicInputs({ ...validInputs, internal_marks: 120 }).valid === false, "Rejects internal marks > 100");
  assert(validateAcademicInputs({ ...validInputs, previous_score: -1 }).valid === false, "Rejects negative previous score");
  assert(validateAcademicInputs({ ...validInputs, study_hours: 75 }).valid === false, "Rejects impossible weekly study hours (>60h)");
  assert(validateAcademicInputs({ ...validInputs, assignments_completed: -2 }).valid === false, "Rejects negative assignments completed");

  // -------------------------------------------------------------
  // TEST 3: Live FastAPI Health & Model State Check
  // -------------------------------------------------------------
  console.log("\nTEST 3: Live FastAPI Health & Model Readiness");
  const health = await checkMLHealth();
  assert(health.state === "ONLINE", `Service health state is ONLINE (actual: ${health.state})`);
  assert(health.status === "healthy", "Health status is 'healthy'");
  assert(health.model_loaded === true, "Model artifact is confirmed loaded in FastAPI");
  assert(Boolean(health.model_version), `Model version reported by backend: ${health.model_version}`);
  assert(Boolean(health.service), `Service name: ${health.service}`);

  // -------------------------------------------------------------
  // TEST 4: Live Model Telemetry & Evaluation Benchmarks
  // -------------------------------------------------------------
  console.log("\nTEST 4: Live Model Telemetry (/model/info)");
  const info = await getModelInfo();
  assert(info !== null, "Model info retrieved successfully");
  assert(Boolean(info?.model_type), `Model type: ${info?.model_type}`);
  assert(Array.isArray(info?.feature_names) && info.feature_names.length >= 6, "Exposes feature names list");
  assert(typeof info?.evaluation_metrics?.validation?.rmse === "number", "Exposes validation RMSE metric");
  assert(typeof info?.evaluation_metrics?.independent_test?.r2 === "number", "Exposes independent test R2 metric");

  // -------------------------------------------------------------
  // TEST 5: Live Inference & Real SHAP Explainability (/predict)
  // -------------------------------------------------------------
  console.log("\nTEST 5: Real Model Prediction & SHAP Explanations (/predict)");
  const prediction = await predictPerformance(validInputs);
  assert(typeof prediction.predicted_score === "number", `Predicted score is a number (${prediction.predicted_score})`);
  assert(prediction.predicted_score >= 0 && prediction.predicted_score <= 100, "Predicted score is within 0-100 range");
  assert(["A+", "A", "B+", "B", "C", "D", "F"].includes(prediction.predicted_grade), `Valid letter grade assigned (${prediction.predicted_grade})`);
  assert(["Low", "Medium", "High"].includes(prediction.risk_level), `Valid risk category assigned (${prediction.risk_level})`);
  assert(Boolean(prediction.model_version), `Real model version attached: ${prediction.model_version}`);
  assert(Array.isArray(prediction.explanations) && prediction.explanations.length > 0, "Real SHAP explanations generated");

  const topExp = prediction.explanations[0];
  assert(Boolean(topExp.feature), `Top SHAP feature: ${topExp.feature}`);
  assert(typeof topExp.impact === "number", `Top SHAP impact magnitude: ${topExp.impact}`);
  assert(["positive", "negative", "neutral"].includes(topExp.direction), `Valid direction: ${topExp.direction}`);
  assert(topExp.description.includes("associated with"), "Enforces non-causal statistical correlation language policy");

  // -------------------------------------------------------------
  // TEST 6: Live What-If Sensitivity Simulation (/simulate)
  // -------------------------------------------------------------
  console.log("\nTEST 6: Live What-If Performance Simulation (/simulate)");
  const simResult = await simulatePerformance({
    baseline: validInputs,
    simulated: {
      attendance_percentage: 90,
      assignment_score: 92,
      internal_marks: 88,
      previous_score: 85,
      study_hours: 16,
      assignments_completed: 10,
    },
  });
  assert(typeof simResult.current_prediction === "number", `Baseline prediction: ${simResult.current_prediction}`);
  assert(typeof simResult.simulated_prediction === "number", `Simulated prediction: ${simResult.simulated_prediction}`);
  assert(typeof simResult.difference === "number", `Score delta: ${simResult.difference}`);
  assert(simResult.difference > 0, `Improved study inputs resulted in positive projected trajectory (+${simResult.difference})`);

  // -------------------------------------------------------------
  // TEST 7: Input Boundary Validation Rejection (Client-Side)
  // -------------------------------------------------------------
  console.log("\nTEST 7: Client-Side Rejection of Malformed Prediction");
  let caughtValidationError = false;
  try {
    await predictPerformance({
      ...validInputs,
      attendance_percentage: -10, // Invalid
    });
  } catch (err: unknown) {
    if (err instanceof MLError && err.code === "422_VALIDATION_ERROR") {
      caughtValidationError = true;
    }
  }
  assert(caughtValidationError, "Client-side validation rejects malformed features before sending");

  console.log("\n==================================================================");
  console.log(`🎉 ALL ${passed}/${total} ML CLIENT & FASTAPI INTEGRATION TESTS PASSED!`);
  console.log("==================================================================");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
