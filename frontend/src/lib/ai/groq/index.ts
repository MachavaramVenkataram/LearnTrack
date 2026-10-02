/**
 * LearnTrack Groq AI Provider
 *
 * Server-side Groq SDK integration providing text generation
 * and structured JSON output via chat completions API.
 * Acts as fallback provider behind the central AI router.
 *
 * Provider SDK: groq-sdk (official Groq JavaScript SDK)
 */

import Groq from "groq-sdk";
import { AI_CONFIG, isGroqConfigured } from "../config";
import {
  AIError,
  AIRateLimitError,
  AINetworkError,
  AITimeoutError,
  AIInvalidOutputError,
  AIValidationError,
  AIMissingApiKeyError,
} from "../errors";
import { logAIEvent } from "../telemetry";

// Singleton Groq client
let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  const apiKey = AI_CONFIG.groqApiKey || process.env.GROQ_API_KEY || "";

  if (!apiKey || apiKey.trim().length === 0) {
    throw new AIMissingApiKeyError(
      "GROQ_API_KEY is not configured. Add it to the server environment."
    );
  }

  if (!groqClient) {
    groqClient = new Groq({ apiKey: apiKey.trim() });
  }

  return groqClient;
}

export function resetGroqClient(): void {
  groqClient = null;
}

export function getGroqModel(): string {
  return AI_CONFIG.groqModel || "llama-3.3-70b-versatile";
}

// ---------------------------------------------------------------------------
// Text Generation
// ---------------------------------------------------------------------------
export interface GroqTextOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  feature?: string;
}

/**
 * Generates text using the Groq chat completions API with retry on transient errors.
 */
export async function generateGroqText(options: GroqTextOptions): Promise<string> {
  const {
    prompt,
    systemInstruction,
    temperature = 0.4,
    maxTokens = 4096,
    feature = "text_generation",
  } = options;

  const client = getGroqClient();
  const model = getGroqModel();
  const startTime = Date.now();

  let attempt = 0;
  let lastError: unknown = null;

  while (attempt <= AI_CONFIG.maxRetries) {
    try {
      const messages: Array<{ role: "system" | "user"; content: string }> = [];

      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }

      messages.push({ role: "user", content: prompt });

      const response = await client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      const text = response.choices?.[0]?.message?.content?.trim() || "";
      if (!text) {
        throw new AIInvalidOutputError("Groq returned an empty text response.");
      }

      logAIEvent({
        feature,
        provider: "groq",
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

      // Don't retry our own typed errors
      if (err instanceof AIInvalidOutputError) break;

      const errorMsg = String((err as any)?.message || err || "");
      const statusCode = (err as any)?.status || (err as any)?.statusCode;

      const isTransient =
        statusCode === 429 ||
        statusCode === 503 ||
        errorMsg.includes("429") ||
        errorMsg.includes("503") ||
        errorMsg.includes("rate_limit") ||
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
          `[Groq Generate] Transient error (attempt ${attempt}/${AI_CONFIG.maxRetries}). Retrying in ${Math.round(delay)}ms...`
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
  const statusCode = (lastError as any)?.status || (lastError as any)?.statusCode;

  logAIEvent({
    feature,
    provider: "groq",
    model,
    durationMs,
    success: false,
    errorCode: statusCode === 429 ? "AI_RATE_LIMIT" : "AI_PROVIDER_ERROR",
    inputChars: prompt.length,
    timestamp: new Date().toISOString(),
  });

  if (statusCode === 429 || rawMsg.includes("429") || rawMsg.includes("rate_limit")) {
    throw new AIRateLimitError("Groq AI is temporarily rate-limited. Please retry shortly.");
  }

  if (statusCode === 503 || rawMsg.includes("503") || rawMsg.includes("overloaded")) {
    throw new AINetworkError("Groq AI service is temporarily overloaded. Please retry in a few moments.");
  }

  if (rawMsg.includes("timed out") || rawMsg.includes("TIMEOUT")) {
    throw new AITimeoutError();
  }

  if (lastError instanceof AIError) throw lastError;

  throw new AIError("Failed to generate text from Groq AI.", "AI_PROVIDER_ERROR", 500);
}

// ---------------------------------------------------------------------------
// Structured JSON Generation
// ---------------------------------------------------------------------------
export interface GroqStructuredOptions<T> {
  prompt: string;
  systemInstruction?: string;
  schema?: Record<string, unknown>;
  validator?: (data: unknown) => T;
  temperature?: number;
  maxTokens?: number;
  feature?: string;
}

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
 * Generates structured JSON via Groq chat completions with JSON response format.
 */
export async function generateGroqStructured<T>(
  options: GroqStructuredOptions<T>
): Promise<T> {
  const {
    prompt,
    systemInstruction,
    validator,
    temperature = 0.2,
    maxTokens = 8192,
    feature = "structured_generation",
  } = options;

  const client = getGroqClient();
  const model = getGroqModel();
  const startTime = Date.now();

  let attempt = 0;
  let lastError: unknown = null;

  while (attempt <= AI_CONFIG.maxRetries) {
    try {
      const messages: Array<{ role: "system" | "user"; content: string }> = [];

      const jsonSystemPreamble =
        "You are an AI that MUST return ONLY a valid JSON object. No markdown, no explanation, no text outside the JSON. Respond with raw JSON only.";

      if (systemInstruction) {
        messages.push({
          role: "system",
          content: `${jsonSystemPreamble}\n\n${systemInstruction}`,
        });
      } else {
        messages.push({ role: "system", content: jsonSystemPreamble });
      }

      messages.push({ role: "user", content: prompt });

      const response = await client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      });

      const rawText = response.choices?.[0]?.message?.content?.trim() || "";
      if (!rawText) {
        throw new AIInvalidOutputError("Groq returned an empty structured response.");
      }

      // Safe JSON parse
      let parsed: unknown;
      try {
        parsed = JSON.parse(cleanJsonString(rawText));
      } catch {
        throw new AIInvalidOutputError("Groq output could not be parsed as valid JSON.");
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
        provider: "groq",
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

      // Do NOT retry validation errors (permanent prompt/schema failure)
      if (err instanceof AIValidationError || err instanceof AIInvalidOutputError) {
        break;
      }

      const errorMsg = String((err as any)?.message || err || "");
      const statusCode = (err as any)?.status || (err as any)?.statusCode;

      const isTransient =
        statusCode === 429 ||
        statusCode === 503 ||
        errorMsg.includes("429") ||
        errorMsg.includes("503") ||
        errorMsg.includes("rate_limit") ||
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
          `[Groq Structured] Transient error (attempt ${attempt}/${AI_CONFIG.maxRetries}). Retrying in ${Math.round(delay)}ms...`
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
  const statusCode = (lastError as any)?.status || (lastError as any)?.statusCode;

  logAIEvent({
    feature,
    provider: "groq",
    model,
    durationMs,
    success: false,
    errorCode: statusCode === 429 ? "AI_RATE_LIMIT" : "AI_INVALID_RESPONSE",
    inputChars: prompt.length,
    timestamp: new Date().toISOString(),
  });

  if (lastError instanceof AIError) throw lastError;

  if (statusCode === 429 || rawMsg.includes("429") || rawMsg.includes("rate_limit")) {
    throw new AIRateLimitError("Groq AI is temporarily rate-limited. Please retry shortly.");
  }

  if (statusCode === 503 || rawMsg.includes("503") || rawMsg.includes("overloaded")) {
    throw new AINetworkError("Groq AI service is temporarily overloaded. Please retry in a few moments.");
  }

  if (rawMsg.includes("timed out") || rawMsg.includes("TIMEOUT")) {
    throw new AITimeoutError();
  }

  throw new AIInvalidOutputError("The Groq AI returned an invalid response structure.");
}
