/**
 * LearnTrack What-If Simulator Explanation Service
 *
 * Explains Machine Learning prediction shifts and SHAP feature importances.
 * Strictly decoupled from prediction computation (which is handled by FastAPI/Scikit-learn).
 */

import { routerGenerateStructured } from "../router";
import { GEMINI_PROMPTS } from "../gemini/prompts";
import { SimulatorExplanationSchema } from "../validation/schemas";
import {
  SimulatorExplanationInput,
  SimulatorExplanationOutput,
} from "../types";

export async function explainSimulation(
  input: SimulatorExplanationInput
): Promise<SimulatorExplanationOutput> {
  const {
    originalInputs,
    modifiedInputs,
    originalPrediction,
    newPrediction,
    shapValues,
  } = input;

  const delta = Number((newPrediction - originalPrediction).toFixed(2));

  const prompt = `Analyze this simulated academic scenario computed by our Machine Learning model.

Baseline Inputs:
- Study Hours/Week: ${originalInputs.studyHours}
- Attendance: ${originalInputs.attendance}%
- Previous Score: ${originalInputs.previousScore}%
${originalInputs.internalMarks !== undefined ? `- Internal Marks: ${originalInputs.internalMarks}` : ""}
${originalInputs.assignmentsCompleted !== undefined ? `- Assignments: ${originalInputs.assignmentsCompleted}` : ""}

Simulated (Modified) Inputs:
- Study Hours/Week: ${modifiedInputs.studyHours}
- Attendance: ${modifiedInputs.attendance}%
- Previous Score: ${modifiedInputs.previousScore}%
${modifiedInputs.internalMarks !== undefined ? `- Internal Marks: ${modifiedInputs.internalMarks}` : ""}
${modifiedInputs.assignmentsCompleted !== undefined ? `- Assignments: ${modifiedInputs.assignmentsCompleted}` : ""}

Computed ML Predictions:
- Baseline Prediction: ${originalPrediction.toFixed(1)}%
- Simulated Prediction: ${newPrediction.toFixed(1)}%
- Score Delta: ${delta >= 0 ? `+${delta}` : delta}%

${shapValues ? `Key Feature Weights (SHAP):\n${JSON.stringify(shapValues, null, 2)}\n` : ""}

Explain to the student:
1. Why the score shifted in this direction.
2. Which parameter change had the most leverage according to academic learning dynamics.
3. Realistic, encouraging study advice.

Return a JSON object:
{
  "scoreDelta": ${delta},
  "explanation": "Clear, student-friendly explanation of why the prediction shifted",
  "mostImpactfulChanges": ["Itemized list of changes that made the biggest difference"],
  "practicalAdvice": "Concrete recommendation on how the student can achieve this improvement"
}`;

  const result = await routerGenerateStructured<SimulatorExplanationOutput>({
    prompt,
    systemInstruction: GEMINI_PROMPTS.simulatorSystem,
    validator: (data) =>
      SimulatorExplanationSchema.parse(data) as SimulatorExplanationOutput,
    temperature: 0.2,
    maxTokens: 2048,
    feature: "simulator_explanation",
  });

  return result.data;
}
