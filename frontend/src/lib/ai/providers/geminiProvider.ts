/**
 * LearnTrack Google Gemini AI Provider (Base Adapter)
 * Adapts the centralized GeminiClient (@google/genai SDK) to the base AIProvider interface.
 */

import {
  StudentAIContext,
  StudyPlanGenerationInput,
  GeneratedStudyPlanOutput,
} from "@/types/academic";
import { AIProvider, ChatMessage, ChatResult } from "./base";
import { GeminiClient } from "../gemini";

export class GeminiProvider implements AIProvider {
  name = "gemini";
  private client: GeminiClient;

  constructor(apiKey?: string, model: string = "gemini-2.5-flash") {
    this.client = new GeminiClient(apiKey, model);
  }

  async chat(
    messages: ChatMessage[],
    context?: StudentAIContext
  ): Promise<ChatResult> {
    return await this.client.chat(messages, context);
  }

  async generateStudyPlan(
    input: StudyPlanGenerationInput,
    context: StudentAIContext,
    startDateStr: string
  ): Promise<GeneratedStudyPlanOutput> {
    return await this.client.generateStudyPlan(input, context, startDateStr);
  }
}

