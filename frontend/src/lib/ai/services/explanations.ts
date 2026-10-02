/**
 * LearnTrack Academic Explanations Service
 *
 * Provides conceptual tutoring and explains calculated performance metrics
 * and report breakdowns using the central AI router.
 */

import { routerGenerateText, routerGenerateStructured } from "../router";
import { GEMINI_PROMPTS } from "../gemini/prompts";
import { PerformanceExplanationSchema } from "../validation/schemas";
import {
  ExplanationInput,
  PerformanceExplanationInput,
  PerformanceExplanationOutput,
} from "../types";

export async function generateConceptExplanation(
  input: ExplanationInput
): Promise<string> {
  const {
    topic,
    subject = "Academic Subject",
    level = "intermediate",
    format = "detailed",
    context = "",
  } = input;

  const prompt = `Provide a comprehensive academic explanation for the concept: "${topic}" (${subject}).
Target Understanding Level: ${level}
Desired Format: ${format}

${context ? `Source Notes / Context:\n${context.slice(0, 4000)}\n\n` : ""}

Structure your explanation clearly:
1. **Core Intuition**: Plain-English mental model.
2. **Formal Definition / Mechanism**: Mathematical or technical foundation.
3. **Worked Example / Application**: Concrete demonstration.
4. **Common Student Misconceptions**: Pitfalls to avoid on exams.`;

  const result = await routerGenerateText({
    prompt,
    systemInstruction: GEMINI_PROMPTS.assistantSystem,
    temperature: 0.3,
    maxTokens: 3072,
    feature: "concept_explanation",
  });

  return result.data;
}

export async function explainPerformanceMetrics(
  input: PerformanceExplanationInput
): Promise<PerformanceExplanationOutput> {
  const {
    studentName = "Student",
    predictedScore,
    previousScore,
    attendanceRate,
    studyHoursWeekly,
    topFactors = [],
    strengths = [],
    weaknesses = [],
  } = input;

  const prompt = `Analyze and explain the calculated academic performance metrics for ${studentName}:
- Current Predicted Final Score: ${predictedScore.toFixed(1)}%
${previousScore !== undefined ? `- Previous Score: ${previousScore.toFixed(1)}%` : ""}
${attendanceRate !== undefined ? `- Attendance Rate: ${attendanceRate.toFixed(1)}%` : ""}
${studyHoursWeekly !== undefined ? `- Weekly Study Hours: ${studyHoursWeekly} hrs` : ""}
${topFactors.length > 0 ? `- Top SHAP Contributing Factors: ${topFactors.map((f) => `${f.factor} (${f.impact})`).join(", ")}` : ""}
${strengths.length > 0 ? `- Subject Strengths: ${strengths.join(", ")}` : ""}
${weaknesses.length > 0 ? `- Weak Areas: ${weaknesses.join(", ")}` : ""}

Explain what these numbers mean without inventing new values. Return a JSON object:
{
  "summary": "Clear, encouraging overview of the student's current trajectory",
  "keyDrivers": ["Primary factors influencing this score"],
  "actionableSteps": ["Concrete high-leverage steps to improve performance"],
  "encouragement": "Supportive closing motivational statement"
}`;

  const result = await routerGenerateStructured<PerformanceExplanationOutput>({
    prompt,
    systemInstruction: GEMINI_PROMPTS.insightsSystem,
    validator: (data) =>
      PerformanceExplanationSchema.parse(data) as PerformanceExplanationOutput,
    temperature: 0.2,
    maxTokens: 2048,
    feature: "performance_explanation",
  });

  return result.data;
}
