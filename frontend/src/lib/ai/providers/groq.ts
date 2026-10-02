/**
 * LearnTrack Groq Provider Implementation
 *
 * Implements the centralized AIProvider interface using Groq SDK.
 */

import { AIProvider } from "../provider";
import {
  AITextRequest,
  AITextResponse,
  AIStructuredRequest,
  AIConversationRequest,
  AIConversationResponse,
} from "../types";
import { isGroqConfigured } from "../config";
import { getGroqModel, generateGroqText, generateGroqStructured } from "../groq";

export class GroqProvider implements AIProvider {
  readonly name = "groq";

  get model(): string {
    return getGroqModel();
  }

  isConfigured(): boolean {
    return isGroqConfigured();
  }

  async generateText(request: AITextRequest): Promise<AITextResponse> {
    const startTime = Date.now();
    const text = await generateGroqText({
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
    return await generateGroqStructured<T>({
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
    const text = await generateGroqText({
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
