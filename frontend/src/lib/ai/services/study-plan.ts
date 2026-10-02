/**
 * LearnTrack Study Plan Service
 *
 * Generates personalized, realistic study plans grounded in the student's
 * actual enrolled subjects, academic targets, and time budgets.
 */

import { routerGenerateStructured } from "../router";
import { getStudyPlanSystemPrompt } from "../prompts/studyPlanPrompt";
import {
  StudentAIContext,
  StudyPlanGenerationInput,
  GeneratedStudyPlanOutput,
} from "../types";
import { AIInvalidOutputError } from "../errors";

export async function generateStudyPlan(
  userId: string,
  input: StudyPlanGenerationInput,
  context: StudentAIContext,
  startDateStr: string
): Promise<GeneratedStudyPlanOutput> {
  const prompt = getStudyPlanSystemPrompt(input, context, startDateStr);

  const result = await routerGenerateStructured<GeneratedStudyPlanOutput>({
    prompt: `${prompt}\n\nPlease generate the JSON study plan following the schema strictly. Return only valid JSON:`,
    temperature: 0.2,
    maxTokens: 8192,
    validator: (data: unknown) => {
      const parsed = data as GeneratedStudyPlanOutput;
      if (!parsed || !Array.isArray(parsed.days) || parsed.days.length === 0) {
        throw new AIInvalidOutputError("Generated study plan is missing days array.");
      }
      return parsed;
    },
    feature: "study_plan_generation",
  });

  return result.data;
}
