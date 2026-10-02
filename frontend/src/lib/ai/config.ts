/**
 * LearnTrack Central AI Configuration (Server-Side Only)
 *
 * Centralizes all AI provider settings, models, rate limits, timeouts, and thresholds.
 * Multi-provider failover architecture: Gemini (Primary) + Groq (Fallback).
 * Server-side only: never expose secrets to client components.
 */

if (typeof window !== "undefined") {
  throw new Error("LearnTrack AI configuration is server-only and must never be imported in client components.");
}

export type AIProviderName = "gemini" | "groq";

function getTrimmedEnv(name: string, fallback = ""): string {
  const val = process.env[name];
  if (!val) return fallback;
  return val.trim();
}

export function getGeminiConfig() {
  const apiKey = getTrimmedEnv("GEMINI_API_KEY", getTrimmedEnv("AI_API_KEY", ""));
  const model = getTrimmedEnv("GEMINI_MODEL", getTrimmedEnv("AI_MODEL", "gemini-flash-latest"));
  return {
    apiKey,
    model,
    isConfigured: apiKey.length > 0,
    hasWhitespace: (process.env.GEMINI_API_KEY || "") !== apiKey,
  };
}

export function getGroqConfig() {
  const apiKey = getTrimmedEnv("GROQ_API_KEY", "");
  const model = getTrimmedEnv("GROQ_MODEL", "qwen/qwen3.8-27b");
  return {
    apiKey,
    model,
    isConfigured: apiKey.length > 0,
    hasWhitespace: (process.env.GROQ_API_KEY || "") !== apiKey,
  };
}

export const AI_CONFIG = {
  // Provider Hierarchy & Failover
  primaryProvider: (getTrimmedEnv("AI_PRIMARY_PROVIDER", "gemini")).toLowerCase() as AIProviderName,
  fallbackProvider: (getTrimmedEnv("AI_FALLBACK_PROVIDER", "groq")).toLowerCase() as AIProviderName,
  enableFallback: process.env.AI_ENABLE_FALLBACK !== "false",
  fallbackEnabled: process.env.AI_ENABLE_FALLBACK !== "false",

  // Development simulation: force primary failure to test Groq failover
  forcePrimaryFailure: process.env.NODE_ENV !== "production" && process.env.AI_TEST_FORCE_PRIMARY_FAILURE === "true",

  // Google Gemini Configuration
  geminiModel: getTrimmedEnv("GEMINI_MODEL", getTrimmedEnv("AI_MODEL", "gemini-flash-latest")),
  geminiApiKey: getTrimmedEnv("GEMINI_API_KEY", getTrimmedEnv("AI_API_KEY", "")),

  // Groq Configuration
  groqModel: getTrimmedEnv("GROQ_MODEL", "qwen/qwen3.8-27b"),
  groqApiKey: getTrimmedEnv("GROQ_API_KEY", ""),

  // Legacy aliases
  model: getTrimmedEnv("GEMINI_MODEL", getTrimmedEnv("AI_MODEL", "gemini-flash-latest")),
  fallbackModel: getTrimmedEnv("GEMINI_FALLBACK_MODEL", "gemini-flash-latest"),
  apiKey: getTrimmedEnv("GEMINI_API_KEY", getTrimmedEnv("AI_API_KEY", "")),

  // Generation timeouts (ms) - prevents requests from hanging
  requestTimeoutMs: 15000,

  // Flashcard generation limits (protect quota & ensure focused cards)
  minCardsPerRequest: 1,
  maxCardsPerRequest: 20,
  defaultCardCount: 5,

  // Practice & Quiz generation limits
  minQuestionsPerRequest: 1,
  maxQuestionsPerRequest: 20,
  defaultQuestionCount: 5,

  // Text grounding limits
  maxSourceCharacters: 12000,
  maxPromptTokens: 8192,

  // Retry configuration for transient failures (429, 503)
  // Maximum 2 attempts per provider (initial + 1 retry)
  maxRetries: 1,
  retryInitialDelayMs: 600,
  retryMaxDelayMs: 2500,

  // User-level rate limiting
  rateLimitPerMinute: 20,
} as const;

export function isGeminiConfigured(): boolean {
  return getGeminiConfig().isConfigured;
}

export function isGroqConfigured(): boolean {
  return getGroqConfig().isConfigured;
}

/**
 * Returns true if the system has at least one configured AI provider capable of serving requests.
 */
export function isAIConfigured(): boolean {
  return isGeminiConfigured() || isGroqConfigured();
}

/**
 * Returns the operational health status of the AI subsystem.
 */
export function getAIStatus(): "connected" | "not_configured" | "degraded" {
  const geminiOk = isGeminiConfigured();
  const groqOk = isGroqConfigured();

  if (geminiOk && groqOk) {
    return "connected";
  }
  if (geminiOk || groqOk) {
    return "degraded"; // One provider is active, but failover redundancy is reduced
  }
  return "not_configured";
}

/**
 * Returns safe non-sensitive configuration summary for UI status views.
 */
export function getAIProviderConfigSummary() {
  return {
    primaryProvider: AI_CONFIG.primaryProvider,
    fallbackProvider: AI_CONFIG.fallbackProvider,
    fallbackEnabled: AI_CONFIG.enableFallback,
    gemini: {
      configured: isGeminiConfigured(),
      model: AI_CONFIG.geminiModel,
    },
    groq: {
      configured: isGroqConfigured(),
      model: AI_CONFIG.groqModel,
    },
    status: getAIStatus(),
  };
}
