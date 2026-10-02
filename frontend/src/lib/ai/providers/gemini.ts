/**
 * LearnTrack Gemini Provider Implementation
 *
 * Implements the centralized AIProvider interface using Google Gemini.
 */

import { AIProvider } from "../provider";
import {
  AITextRequest,
  AITextResponse,
  AIStructuredRequest,
  AIConversationRequest,
  AIConversationResponse,
} from "../types";
import { isGeminiConfigured } from "../config";
import { getActiveModel } from "../gemini/models";
import { generateGeminiText } from "../gemini/generate";
import { generateGeminiStructured } from "../gemini/structured";

export class GeminiProvider implements AIProvider {
  readonly name = "gemini";

  get model(): string {
    return getActiveModel();
  }

  isConfigured(): boolean {
    return isGeminiConfigured();
  }

  async generateText(request: AITextRequest): Promise<AITextResponse> {
    const startTime = Date.now();
    const text = await generateGeminiText({
      prompt: request.prompt,
      systemInstruction: request.systemInstruction,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
    });
    return {
      text,
      model: this.model,
      durationMs: Date.now() - startTime,
    };
  }

  async generateStructured<T>(request: AIStructuredRequest<T>): Promise<T> {
    return await generateGeminiStructured<T>({
      prompt: request.prompt,
      systemInstruction: request.systemInstruction,
      schema: request.schema,
      validator: request.validator,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
    });
  }

  async generateConversation(request: AIConversationRequest): Promise<AIConversationResponse> {
    const prompt = request.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");
    const text = await generateGeminiText({
      prompt,
      systemInstruction: request.systemInstruction,
      temperature: request.temperature,
      feature: "conversation",
    });
    return {
      message: text,
      model: this.model,
    };
  }
}
