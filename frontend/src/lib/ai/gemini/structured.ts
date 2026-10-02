/**
 * LearnTrack Gemini Structured JSON Generation Engine
 *
 * Employs native @google/genai structured outputs (responseMimeType: "application/json",
 * responseJsonSchema) with strict Zod validation and safe error wrapping.
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
  AIValidationError,
} from "../errors";
import { logAIEvent } from "../telemetry";

export interface GenerateStructuredOptions<T> {
  prompt: string;
  systemInstruction?: string;
  schema?: Record<string, unknown>;
  validator?: (data: unknown) => T;
  temperature?: number;
  maxTokens?: number;
  feature?: string;
}

/**
 * Strips markdown code blocks (```json ... ```) if present in raw text.
 */
function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Generates structured JSON adhering to a schema and validates it.
 */
export async function generateGeminiStructured<T>(
  options: GenerateStructuredOptions<T>
): Promise<T> {
  const {
    prompt,
    systemInstruction,
    schema,
    validator,
    temperature = 0.2,
    maxTokens = 8192,
    feature = "structured_generation",
  } = options;

  const client = getGeminiClient();
  const model = getActiveModel();
  const startTime = Date.now();

  let attempt = 0;
  let lastError: unknown = null;

  while (attempt <= AI_CONFIG.maxRetries) {
    try {
      const config: Record<string, unknown> = {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: "application/json",
      };

      if (systemInstruction) {
        config.systemInstruction = systemInstruction;
      }

      if (schema) {
        config.responseJsonSchema = schema;
      }

      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: config as any,
      });

      const rawText = response.text?.trim() || "";
      if (!rawText) {
        throw new AIInvalidOutputError("Gemini returned an empty structured response.");
      }

      // Safe JSON parse
      let parsed: unknown;
      try {
        parsed = JSON.parse(cleanJsonString(rawText));
      } catch (parseErr) {
        throw new AIInvalidOutputError("Gemini output could not be parsed as valid JSON.");
      }

      // Schema / Validator execution
      let validated: T;
      if (validator) {
        try {
          validated = validator(parsed);
        } catch (valErr: any) {
          throw new AIValidationError(
            `Output failed validation: ${valErr?.message || "Invalid schema structure"}`
          );
        }
      } else {
        validated = parsed as T;
      }

      logAIEvent({
        feature,
        provider: "gemini",
        model,
        durationMs: Date.now() - startTime,
        success: true,
        inputChars: prompt.length,
        outputChars: rawText.length,
        timestamp: new Date().toISOString(),
      });

      return validated;
    } catch (err: unknown) {
      lastError = err;
      const errorMsg = String((err as any)?.message || err || "");

      // Do NOT retry validation errors (permanent prompt/schema failure)
      if (err instanceof AIValidationError || err instanceof AIInvalidOutputError) {
        break;
      }

      const isTransient =
        errorMsg.includes("429") ||
        errorMsg.includes("503") ||
        errorMsg.includes("RESOURCE_EXHAUSTED") ||
        errorMsg.includes("overloaded") ||
        errorMsg.includes("fetch failed");

      if (isTransient && attempt < AI_CONFIG.maxRetries) {
        attempt++;
        const delay =
          Math.min(
            AI_CONFIG.retryInitialDelayMs * Math.pow(2, attempt - 1),
            AI_CONFIG.retryMaxDelayMs
          ) + Math.random() * 200;
        console.warn(
          `[Gemini Structured] Transient error (attempt ${attempt}/${AI_CONFIG.maxRetries}). Retrying in ${Math.round(delay)}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      break;
    }
  }

  // Handle final failure
  const durationMs = Date.now() - startTime;
  const rawMsg = String((lastError as any)?.message || lastError || "");

  logAIEvent({
    feature,
    provider: "gemini",
    model,
    durationMs,
    success: false,
    errorCode: rawMsg.includes("429") ? "AI_RATE_LIMIT" : "AI_INVALID_RESPONSE",
    inputChars: prompt.length,
    timestamp: new Date().toISOString(),
  });

  if (lastError instanceof AIError) {
    throw lastError;
  }

  if (rawMsg.includes("429") || rawMsg.includes("RESOURCE_EXHAUSTED")) {
    throw new AIRateLimitError("Gemini AI is temporarily rate-limited. Please retry shortly.");
  }

  if (rawMsg.includes("503") || rawMsg.includes("overloaded")) {
    throw new AINetworkError("Gemini AI service is temporarily overloaded. Please retry in a few moments.");
  }

  if (rawMsg.includes("timed out") || rawMsg.includes("TIMEOUT")) {
    throw new AITimeoutError();
  }

  throw new AIInvalidOutputError("The AI returned an invalid response structure.");
}
