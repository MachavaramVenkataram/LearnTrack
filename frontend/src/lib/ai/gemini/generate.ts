/**
 * LearnTrack Gemini Text Generation Engine
 *
 * Provides robust text generation via the official singleton Google GenAI client,
 * featuring exponential backoff retries for transient errors and zero secret leakage.
 */

import { getGeminiClient } from "./client";
import { getActiveModel } from "./models";
import { AI_CONFIG } from "../config";
import {
  AIError,
  AIRateLimitError,
  AINetworkError,
  AITimeoutError,
  AIInvalidOutputError,
} from "../errors";
import { logAIEvent } from "../telemetry";

export interface GenerateTextOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  feature?: string;
}

/**
 * Generates text using Google Gemini with retry backoff on transient errors.
 */
export async function generateGeminiText(
  options: GenerateTextOptions
): Promise<string> {
  const {
    prompt,
    systemInstruction,
    temperature = 0.4,
    maxTokens = 4096,
    feature = "text_generation",
  } = options;

  const client = getGeminiClient();
  const model = getActiveModel();
  const startTime = Date.now();

  let attempt = 0;
  let lastError: unknown = null;

  while (attempt <= AI_CONFIG.maxRetries) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature,
          maxOutputTokens: maxTokens,
        },
      });

      const text = response.text?.trim() || "";
      if (!text) {
        throw new AIInvalidOutputError("The AI model returned an empty text response.");
      }

      logAIEvent({
        feature,
        provider: "gemini",
        model,
        durationMs: Date.now() - startTime,
        success: true,
        inputChars: prompt.length,
        outputChars: text.length,
        timestamp: new Date().toISOString(),
      });

      return text;
    } catch (err: unknown) {
      lastError = err;
      const errorMsg = String((err as any)?.message || err || "");
      const isTransient =
        errorMsg.includes("429") ||
        errorMsg.includes("503") ||
        errorMsg.includes("RESOURCE_EXHAUSTED") ||
        errorMsg.includes("overloaded") ||
        errorMsg.includes("network") ||
        errorMsg.includes("fetch failed");

      if (isTransient && attempt < AI_CONFIG.maxRetries) {
        attempt++;
        const delay =
          Math.min(
            AI_CONFIG.retryInitialDelayMs * Math.pow(2, attempt - 1),
            AI_CONFIG.retryMaxDelayMs
          ) + Math.random() * 200;
        console.warn(
          `[Gemini Generate] Transient error encountered (attempt ${attempt}/${AI_CONFIG.maxRetries}). Retrying in ${Math.round(delay)}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      break;
    }
  }

  // Handle final error
  const durationMs = Date.now() - startTime;
  const rawMsg = String((lastError as any)?.message || lastError || "");

  logAIEvent({
    feature,
    provider: "gemini",
    model,
    durationMs,
    success: false,
    errorCode: rawMsg.includes("429") ? "AI_RATE_LIMIT" : "AI_PROVIDER_ERROR",
    inputChars: prompt.length,
    timestamp: new Date().toISOString(),
  });

  if (rawMsg.includes("429") || rawMsg.includes("RESOURCE_EXHAUSTED")) {
    throw new AIRateLimitError("Gemini AI is temporarily rate-limited. Please retry shortly.");
  }

  if (rawMsg.includes("503") || rawMsg.includes("overloaded")) {
    throw new AINetworkError("Gemini AI service is temporarily overloaded. Please retry in a few moments.");
  }

  if (rawMsg.includes("timed out") || rawMsg.includes("TIMEOUT")) {
    throw new AITimeoutError();
  }

  throw new AIError(
    "Failed to generate text from LearnTrack AI.",
    "AI_PROVIDER_ERROR",
    500
  );
}
