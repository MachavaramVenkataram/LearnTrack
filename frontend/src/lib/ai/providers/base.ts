/**
 * LearnTrack AI Provider Abstraction Interface
 * Allows swapping between Gemini, OpenAI, or Local Academic Engine seamlessly.
 */

import {
  StudentAIContext,
  StudyPlanGenerationInput,
  GeneratedStudyPlanOutput,
} from "@/types/academic";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatResult {
  content: string;
  model: string;
}

export interface AIProvider {
  name: string;
  chat(
    messages: ChatMessage[],
    context?: StudentAIContext
  ): Promise<ChatResult>;
  generateStudyPlan(
    input: StudyPlanGenerationInput,
    context: StudentAIContext,
    startDateStr: string
  ): Promise<GeneratedStudyPlanOutput>;
}
