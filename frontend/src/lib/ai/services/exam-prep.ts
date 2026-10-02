/**
 * LearnTrack Exam Prep Service
 *
 * Generates high-yield exam revision summaries, formula cheat-sheets,
 * and high-priority checklists grounded in curriculum topics.
 */

import { routerGenerateStructured } from "../router";
import { GEMINI_PROMPTS } from "../gemini/prompts";
import { ExamPrepSchema } from "../validation/schemas";
import { ExamPrepInput, ExamPrepOutput } from "../types";

export async function generateExamPrepGuide(
  input: ExamPrepInput
): Promise<ExamPrepOutput> {
  const {
    subject,
    examDate,
    topics,
    currentGrade,
    focusArea,
  } = input;

  const prompt = `Generate a high-yield exam preparation guide.
Subject: ${subject}
${examDate ? `Exam Date: ${examDate}` : "Upcoming Final Exam"}
Covered Topics: ${topics.join(", ")}
${currentGrade ? `Target Baseline Grade: ${currentGrade}` : ""}
${focusArea ? `Student Focus Area: ${focusArea}` : ""}

Return a JSON object strictly following this structure:
{
  "highYieldSummary": "Comprehensive high-yield overview of the core concepts most likely to appear on the exam",
  "keyFormulasAndRules": ["Key definitions, formulas, or theorems students must memorize"],
  "commonPitfalls": ["Frequently penalized exam mistakes and subtle misconceptions"],
  "practiceChecklist": ["Specific types of problems or proofs to practice before test day"],
  "suggestedRevisionOrder": ["Optimal order of topic review to maximize retention"]
}`;

  const result = await routerGenerateStructured<ExamPrepOutput>({
    prompt,
    systemInstruction: GEMINI_PROMPTS.practiceSystem,
    validator: (data) => ExamPrepSchema.parse(data) as ExamPrepOutput,
    temperature: 0.2,
    maxTokens: 4096,
    feature: "exam_prep_generation",
  });

  return result.data;
}
