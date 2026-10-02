/**
 * LearnTrack AI Error Normalization & Hierarchy
 *
 * Provides safe, actionable errors without exposing API keys, internal endpoints,
 * or raw stack traces to the client or browser logs.
 *
 * Normalizes all provider-specific errors (Google GenAI & Groq SDK) into unified types:
 * - AI_NOT_CONFIGURED
 * - AI_AUTHENTICATION_ERROR
 * - AI_INVALID_MODEL
 * - AI_RATE_LIMITED
 * - AI_TIMEOUT
 * - AI_NETWORK_ERROR
 * - AI_PROVIDER_ERROR
 * - AI_INVALID_RESPONSE
 */

export type AIErrorCode =
  | "AI_NOT_CONFIGURED"
  | "AI_AUTHENTICATION_ERROR"
  | "AI_INVALID_MODEL"
  | "AI_RATE_LIMITED"
  | "AI_TIMEOUT"
  | "AI_NETWORK_ERROR"
  | "AI_PROVIDER_ERROR"
  | "AI_INVALID_RESPONSE"
  | "AI_VALIDATION_ERROR"
  | "AI_AUTH_ERROR";

export class AIError extends Error {
  public readonly code: AIErrorCode;
  public readonly status: number;
  public readonly isTransient: boolean;

  constructor(message: string, code: AIErrorCode = "AI_PROVIDER_ERROR", status = 500, isTransient = false) {
    super(message);
    this.name = "AIError";
    this.code = code;
    this.status = status;
    this.isTransient = isTransient;
  }

  public get statusCode(): number {
    return this.status;
  }
}

export class AINotConfiguredError extends AIError {
  constructor(
    message = "AI generation is not configured yet. Add a GEMINI_API_KEY or GROQ_API_KEY in the server environment."
  ) {
    super(message, "AI_NOT_CONFIGURED", 503, false);
    this.name = "AINotConfiguredError";
  }
}

// Backward-compatible alias
export class AIMissingApiKeyError extends AINotConfiguredError {
  constructor(message?: string) {
    super(message);
    this.name = "AIMissingApiKeyError";
  }
}

export class AIAuthenticationError extends AIError {
  constructor(message = "AI credentials are unauthorized or invalid. Please check the server configuration.") {
    super(message, "AI_AUTHENTICATION_ERROR", 401, false);
    this.name = "AIAuthenticationError";
  }
}

export class AIAuthError extends AIError {
  constructor(message = "Unauthorized: Please log in to use LearnTrack AI.") {
    super(message, "AI_AUTH_ERROR", 401, false);
    this.name = "AIAuthError";
  }
}

export class AIInvalidModelError extends AIError {
  constructor(message = "The requested AI model is not supported or not available on the provider.") {
    super(message, "AI_INVALID_MODEL", 400, false);
    this.name = "AIInvalidModelError";
  }
}

export class AIRateLimitError extends AIError {
  constructor(message = "AI is temporarily rate-limited. Please try again shortly.") {
    super(message, "AI_RATE_LIMITED", 429, true);
    this.name = "AIRateLimitError";
  }
}

export class AITimeoutError extends AIError {
  constructor(message = "The AI service timed out while generating your response. Please try again.") {
    super(message, "AI_TIMEOUT", 504, true);
    this.name = "AITimeoutError";
  }
}

export class AINetworkError extends AIError {
  constructor(message = "Unable to reach the AI service. Please check your connection and try again.") {
    super(message, "AI_NETWORK_ERROR", 502, true);
    this.name = "AINetworkError";
  }
}

export class AIProviderError extends AIError {
  constructor(message = "The AI provider returned a server error. Please try again in a moment.") {
    super(message, "AI_PROVIDER_ERROR", 503, true);
    this.name = "AIProviderError";
  }
}

export class AIInvalidResponseError extends AIError {
  constructor(message = "The AI returned an invalid response. No changes were saved.") {
    super(message, "AI_INVALID_RESPONSE", 502, false);
    this.name = "AIInvalidResponseError";
  }
}

// Backward-compatible alias
export class AIInvalidOutputError extends AIInvalidResponseError {
  constructor(message?: string) {
    super(message);
    this.name = "AIInvalidOutputError";
  }
}

export class AIValidationError extends AIError {
  constructor(message = "The request or generated AI output failed schema validation.") {
    super(message, "AI_VALIDATION_ERROR", 400, false);
    this.name = "AIValidationError";
  }
}

export class AIInsufficientSourceError extends AIError {
  constructor(
    message = "Not enough learning material was found to generate reliable academic output. Please provide notes, text, or a topic."
  ) {
    super(message, "AI_INVALID_RESPONSE", 422, false);
    this.name = "AIInsufficientSourceError";
  }
}

/**
 * Normalizes any provider-specific error into unified LearnTrack AIError.
 * Maps Google GenAI and Groq SDK errors safely without secret leakage.
 */
export function normalizeProviderError(provider: "gemini" | "groq", err: unknown): AIError {
  if (err instanceof AIError) return err;

  const status = (err as any)?.status || (err as any)?.statusCode;
  const rawMsg = String((err as any)?.message || err || "");
  const lowerMsg = rawMsg.toLowerCase();

  // 1. Missing or invalid credentials
  if (
    status === 401 ||
    status === 403 ||
    lowerMsg.includes("api key not valid") ||
    lowerMsg.includes("api_key_invalid") ||
    lowerMsg.includes("invalid_api_key") ||
    lowerMsg.includes("unauthorized")
  ) {
    return new AIAuthenticationError(
      `${provider === "gemini" ? "Google Gemini" : "Groq"} authentication failed. Verify server API credentials.`
    );
  }

  // 2. Invalid or decommissioned model
  if (
    status === 400 &&
    (lowerMsg.includes("model_not_found") ||
      lowerMsg.includes("does not exist") ||
      lowerMsg.includes("not found for api version") ||
      lowerMsg.includes("no longer available") ||
      lowerMsg.includes("not supported"))
  ) {
    return new AIInvalidModelError(
      `${provider === "gemini" ? "Gemini" : "Groq"} model is invalid or unavailable on this provider tier.`
    );
  }

  // 3. Rate limiting and quota exhaustion
  if (
    status === 429 ||
    lowerMsg.includes("429") ||
    lowerMsg.includes("quota") ||
    lowerMsg.includes("resource_exhausted") ||
    lowerMsg.includes("rate limit")
  ) {
    return new AIRateLimitError(
      `${provider === "gemini" ? "Google Gemini" : "Groq"} is currently rate-limited or quota is exceeded.`
    );
  }

  // 4. Timeout
  if (lowerMsg.includes("timed out") || lowerMsg.includes("timeout") || status === 504) {
    return new AITimeoutError(
      `Request to ${provider === "gemini" ? "Google Gemini" : "Groq"} timed out.`
    );
  }

  // 5. Network / Socket failure
  if (
    lowerMsg.includes("fetch failed") ||
    lowerMsg.includes("econnreset") ||
    lowerMsg.includes("enotfound") ||
    status === 502
  ) {
    return new AINetworkError(
      `Unable to reach ${provider === "gemini" ? "Google Gemini" : "Groq"} network endpoint.`
    );
  }

  // 6. Temporary server outage / 503
  if (
    status === 503 ||
    status === 500 ||
    lowerMsg.includes("high demand") ||
    lowerMsg.includes("unavailable") ||
    lowerMsg.includes("overloaded")
  ) {
    return new AIProviderError(
      `${provider === "gemini" ? "Google Gemini" : "Groq"} is temporarily unavailable or experiencing high demand.`
    );
  }

  // Default provider error
  return new AIError(
    `${provider === "gemini" ? "Gemini" : "Groq"} generation failed.`,
    "AI_PROVIDER_ERROR",
    status || 500,
    status === 503 || status === 502
  );
}

/**
 * Safely logs provider operational errors without secret leakage.
 * Example format: [AI][Gemini] status=429 type=AI_RATE_LIMITED
 */
export function logProviderError(provider: "gemini" | "groq", err: unknown): void {
  const normalized = err instanceof AIError ? err : normalizeProviderError(provider, err);
  const tag = provider === "gemini" ? "Gemini" : "Groq";
  console.error(`[AI][${tag}] status=${normalized.status} type=${normalized.code}`);
}

/**
 * Sanitizes any raw error to ensure zero secret leakage and clean user messaging.
 */
export function sanitizeErrorMessage(err: unknown): {
  message: string;
  code: AIErrorCode;
  status: number;
} {
  if (err instanceof AIError) {
    return {
      message: err.message,
      code: err.code,
      status: err.status,
    };
  }

  const rawMsg = String((err as any)?.message || err || "");

  // Detect sensitive tokens or API keys and redact them
  const isKeyLeak =
    rawMsg.includes("AIzaSy") ||
    rawMsg.includes("gsk_") ||
    rawMsg.includes("key=") ||
    rawMsg.includes("API_KEY") ||
    rawMsg.includes("Bearer ");

  if (isKeyLeak) {
    return {
      message: "An internal authentication error occurred while connecting to the AI service.",
      code: "AI_AUTH_ERROR",
      status: 503,
    };
  }

  if (
    rawMsg.includes("429") ||
    rawMsg.toLowerCase().includes("quota") ||
    rawMsg.toLowerCase().includes("rate limit") ||
    rawMsg.includes("RESOURCE_EXHAUSTED")
  ) {
    return {
      message: "AI is temporarily rate-limited. Please try again shortly.",
      code: "AI_RATE_LIMITED",
      status: 429,
    };
  }

  if (rawMsg.includes("timed out") || rawMsg.includes("TIMEOUT")) {
    return {
      message: "The AI service timed out while processing your request. Please try again.",
      code: "AI_TIMEOUT",
      status: 504,
    };
  }

  if (
    rawMsg.includes("503") ||
    rawMsg.toLowerCase().includes("overloaded") ||
    rawMsg.toLowerCase().includes("unavailable")
  ) {
    return {
      message: "The AI service is temporarily overloaded. Please retry in a few moments.",
      code: "AI_PROVIDER_ERROR",
      status: 503,
    };
  }

  return {
    message: "LearnTrack AI is temporarily unavailable. Please try again later.",
    code: "AI_PROVIDER_ERROR",
    status: 500,
  };
}
