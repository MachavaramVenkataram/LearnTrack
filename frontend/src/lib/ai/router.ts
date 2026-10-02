/**
 * LearnTrack Central AI Router
 *
 * All AI requests flow through this router. It handles:
 * 1. Provider selection (primary → fallback)
 * 2. Transient error detection and failover
 * 3. Unified response normalization with AIResult<T>
 * 4. Telemetry recording (provider used, fallback triggered, latency)
 * 5. Free-tier protection: only calls fallback when primary genuinely fails
 * 6. Request timeout protection (prevents hanging requests)
 * 7. Safe error logging without credential leakage
 *
 * Architecture:
 *   Feature Service → Router → Primary (Gemini) → validate → return
 *                                ↓ (transient failure: 429/503/timeout)
 *                             Fallback (Groq) → validate → return
 *                                ↓ (both fail)
 *                             Throw user-friendly error
 */

import { AI_CONFIG, AIProviderName, isGeminiConfigured, isGroqConfigured } from "./config";
import { generateGeminiText, GenerateTextOptions } from "./gemini/generate";
import { generateGeminiStructured, GenerateStructuredOptions } from "./gemini/structured";
import { generateGroqText, GroqTextOptions, generateGroqStructured, GroqStructuredOptions } from "./groq";
import { getActiveModel } from "./gemini/models";
import { getGroqModel } from "./groq";
import {
  AIError,
  AIRateLimitError,
  AINetworkError,
  AITimeoutError,
  AIMissingApiKeyError,
  AIValidationError,
  AIInvalidOutputError,
  normalizeProviderError,
  logProviderError,
} from "./errors";
import { logAIEvent } from "./telemetry";
import { AIResult, GenerateAIParams } from "./types";

// ---------------------------------------------------------------------------
// Provider Health Tracking (in-memory, server-side only)
// ---------------------------------------------------------------------------
interface ProviderHealthState {
  requests: number;
  successes: number;
  failures: number;
  totalLatencyMs: number;
  fallbackCount: number;
  lastError?: string;
  lastUsed?: string;
}

const healthState: Record<AIProviderName, ProviderHealthState> = {
  gemini: { requests: 0, successes: 0, failures: 0, totalLatencyMs: 0, fallbackCount: 0 },
  groq: { requests: 0, successes: 0, failures: 0, totalLatencyMs: 0, fallbackCount: 0 },
};

function recordSuccess(provider: AIProviderName, latencyMs: number): void {
  const s = healthState[provider];
  s.requests++;
  s.successes++;
  s.totalLatencyMs += latencyMs;
  s.lastUsed = new Date().toISOString();
}

function recordFailure(provider: AIProviderName, errorMsg: string): void {
  const s = healthState[provider];
  s.requests++;
  s.failures++;
  s.lastError = errorMsg;
  s.lastUsed = new Date().toISOString();
}

function recordFallback(): void {
  healthState[AI_CONFIG.fallbackProvider].fallbackCount++;
}

// ---------------------------------------------------------------------------
// Error Classification
// ---------------------------------------------------------------------------
/**
 * Returns true when the error is transient and a fallback attempt is appropriate.
 * Configuration errors (missing keys, bad schemas) are NOT retryable across providers
 * unless fallback is independently configured.
 */
function isTransientError(err: unknown): boolean {
  if (err instanceof AIRateLimitError) return true;
  if (err instanceof AINetworkError) return true;
  if (err instanceof AITimeoutError) return true;

  const msg = String((err as any)?.message || "");
  const status = (err as any)?.status || (err as any)?.statusCode;

  return (
    status === 429 ||
    status === 503 ||
    status === 502 ||
    status === 504 ||
    msg.includes("429") ||
    msg.includes("503") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("overloaded") ||
    msg.includes("fetch failed") ||
    msg.includes("network") ||
    msg.includes("timed out") ||
    msg.includes("TIMEOUT") ||
    msg.includes("ECONNRESET")
  );
}

/**
 * Returns true if the error is a configuration-level problem that usually won't
 * resolve by switching to a different provider (unless the other provider is
 * independently configured).
 */
function isConfigurationError(err: unknown): boolean {
  if (err instanceof AIMissingApiKeyError) return true;
  if (err instanceof AIValidationError) return true;
  if (err instanceof AIInvalidOutputError) return true;

  const msg = String((err as any)?.message || "");
  return msg.includes("API_KEY") || msg.includes("not configured") || msg.includes("invalid key");
}

/**
 * Determines whether a fallback attempt should be made.
 */
function shouldFallback(err: unknown): boolean {
  if (!AI_CONFIG.enableFallback) return false;

  // Always allow fallback on transient errors
  if (isTransientError(err)) return true;

  // For config errors (e.g. missing primary key), allow fallback ONLY if
  // the fallback provider is independently configured
  if (isConfigurationError(err)) {
    if (err instanceof AIMissingApiKeyError) {
      return isFallbackConfigured();
    }
    // Validation errors: the prompt/schema is likely bad for both providers
    return false;
  }

  // Unknown errors: attempt fallback once
  return true;
}

function isPrimaryConfigured(): boolean {
  return AI_CONFIG.primaryProvider === "gemini" ? isGeminiConfigured() : isGroqConfigured();
}

function isFallbackConfigured(): boolean {
  return AI_CONFIG.fallbackProvider === "groq" ? isGroqConfigured() : isGeminiConfigured();
}

// ---------------------------------------------------------------------------
// Request Timeout & Development Simulation Helpers
// ---------------------------------------------------------------------------
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, provider: AIProviderName): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new AITimeoutError(`${provider === "gemini" ? "Gemini" : "Groq"} request timed out after ${timeoutMs}ms.`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

function shouldSimulatePrimaryFailure(provider: AIProviderName): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return (
    provider === AI_CONFIG.primaryProvider &&
    (AI_CONFIG.forcePrimaryFailure || process.env.AI_TEST_FORCE_PRIMARY_FAILURE === "true")
  );
}

// ---------------------------------------------------------------------------
// Unified Text Generation via Router
// ---------------------------------------------------------------------------
export interface RouterTextOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  feature?: string;
}

async function callTextProvider(provider: AIProviderName, options: RouterTextOptions): Promise<string> {
  if (shouldSimulatePrimaryFailure(provider)) {
    throw new AIRateLimitError("[DEV_SIMULATION] Simulated Primary 429 Rate Limit for failover testing.");
  }

  const timeoutMs = AI_CONFIG.requestTimeoutMs || 15000;
  const task =
    provider === "gemini"
      ? generateGeminiText(options as GenerateTextOptions)
      : generateGroqText(options as GroqTextOptions);

  return withTimeout(task, timeoutMs, provider);
}

/**
 * Generates text through the central router with primary → fallback failover.
 */
export async function routerGenerateText(options: RouterTextOptions): Promise<AIResult<string>> {
  const primary = AI_CONFIG.primaryProvider;
  const fallback = AI_CONFIG.fallbackProvider;
  const startTime = Date.now();

  // Attempt primary provider
  try {
    const text = await callTextProvider(primary, options);
    const latencyMs = Date.now() - startTime;
    recordSuccess(primary, latencyMs);

    return {
      data: text,
      provider: primary,
      model: primary === "gemini" ? getActiveModel() : getGroqModel(),
      fallbackUsed: false,
      latencyMs,
    };
  } catch (primaryErr: unknown) {
    const normalized = normalizeProviderError(primary, primaryErr);
    logProviderError(primary, primaryErr);
    recordFailure(primary, normalized.message);

    if (!shouldFallback(primaryErr)) {
      throw primaryErr;
    }

    if (!isFallbackConfigured()) {
      throw primaryErr;
    }

    // Attempt fallback provider
    console.warn(
      `[AI Router] Primary provider "${primary}" failed (${normalized.message.slice(0, 80)}). Falling back to "${fallback}".`
    );

    try {
      const text = await callTextProvider(fallback, options);
      const latencyMs = Date.now() - startTime;
      recordSuccess(fallback, latencyMs);
      recordFallback();

      logAIEvent({
        feature: options.feature,
        provider: fallback,
        model: fallback === "gemini" ? getActiveModel() : getGroqModel(),
        durationMs: latencyMs,
        success: true,
        fallbackUsed: true,
        timestamp: new Date().toISOString(),
      });

      return {
        data: text,
        provider: fallback,
        model: fallback === "gemini" ? getActiveModel() : getGroqModel(),
        fallbackUsed: true,
        latencyMs,
      };
    } catch (fallbackErr: unknown) {
      const normFallback = normalizeProviderError(fallback, fallbackErr);
      logProviderError(fallback, fallbackErr);
      recordFailure(fallback, normFallback.message);

      // Both providers failed — surface a user-friendly error
      throw new AIError(
        "AI is temporarily unavailable. Please try again.",
        "AI_PROVIDER_ERROR",
        503,
        true
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Unified Structured Generation via Router
// ---------------------------------------------------------------------------
export interface RouterStructuredOptions<T> {
  prompt: string;
  systemInstruction?: string;
  schema?: Record<string, unknown>;
  validator?: (data: unknown) => T;
  temperature?: number;
  maxTokens?: number;
  feature?: string;
}

async function callStructuredProvider<T>(
  provider: AIProviderName,
  options: RouterStructuredOptions<T>
): Promise<T> {
  if (shouldSimulatePrimaryFailure(provider)) {
    throw new AIRateLimitError("[DEV_SIMULATION] Simulated Primary 429 Rate Limit for failover testing.");
  }

  const timeoutMs = AI_CONFIG.requestTimeoutMs || 15000;
  const task =
    provider === "gemini"
      ? generateGeminiStructured<T>(options as GenerateStructuredOptions<T>)
      : generateGroqStructured<T>(options as GroqStructuredOptions<T>);

  return withTimeout(task, timeoutMs, provider);
}

/**
 * Generates validated structured JSON through the central router with failover.
 * Both providers are validated against the SAME Zod schema via the validator param.
 */
export async function routerGenerateStructured<T>(
  options: RouterStructuredOptions<T>
): Promise<AIResult<T>> {
  const primary = AI_CONFIG.primaryProvider;
  const fallback = AI_CONFIG.fallbackProvider;
  const startTime = Date.now();

  // Attempt primary provider
  try {
    const data = await callStructuredProvider<T>(primary, options);
    const latencyMs = Date.now() - startTime;
    recordSuccess(primary, latencyMs);

    return {
      data,
      provider: primary,
      model: primary === "gemini" ? getActiveModel() : getGroqModel(),
      fallbackUsed: false,
      latencyMs,
    };
  } catch (primaryErr: unknown) {
    const normalized = normalizeProviderError(primary, primaryErr);
    logProviderError(primary, primaryErr);
    recordFailure(primary, normalized.message);

    if (!shouldFallback(primaryErr)) {
      throw primaryErr;
    }

    if (!isFallbackConfigured()) {
      throw primaryErr;
    }

    console.warn(
      `[AI Router] Primary provider "${primary}" structured generation failed (${normalized.message.slice(0, 80)}). Falling back to "${fallback}".`
    );

    try {
      const data = await callStructuredProvider<T>(fallback, options);
      const latencyMs = Date.now() - startTime;
      recordSuccess(fallback, latencyMs);
      recordFallback();

      logAIEvent({
        feature: options.feature,
        provider: fallback,
        model: fallback === "gemini" ? getActiveModel() : getGroqModel(),
        durationMs: latencyMs,
        success: true,
        fallbackUsed: true,
        timestamp: new Date().toISOString(),
      });

      return {
        data,
        provider: fallback,
        model: fallback === "gemini" ? getActiveModel() : getGroqModel(),
        fallbackUsed: true,
        latencyMs,
      };
    } catch (fallbackErr: unknown) {
      const normFallback = normalizeProviderError(fallback, fallbackErr);
      logProviderError(fallback, fallbackErr);
      recordFailure(fallback, normFallback.message);

      // If the fallback also fails with a validation error, propagate it directly
      if (fallbackErr instanceof AIValidationError || fallbackErr instanceof AIInvalidOutputError) {
        throw fallbackErr;
      }

      throw new AIError(
        "AI is temporarily unavailable. Please try again.",
        "AI_PROVIDER_ERROR",
        503,
        true
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Rate Limiter & generateAI Facade
// ---------------------------------------------------------------------------
const userRateLimits = new Map<string, { tokens: number; lastRefill: number }>();

function checkUserRateLimit(userId: string): boolean {
  const now = Date.now();
  const bucket = userRateLimits.get(userId) || {
    tokens: AI_CONFIG.rateLimitPerMinute,
    lastRefill: now,
  };

  if (now - bucket.lastRefill > 60000) {
    bucket.tokens = AI_CONFIG.rateLimitPerMinute;
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    return false;
  }

  bucket.tokens -= 1;
  userRateLimits.set(userId, bucket);
  return true;
}

/**
 * Universal Central Router AI execution helper.
 * Routes through the central AI router with automatic primary → fallback failover.
 * Enforces rate limiting, telemetry, and structured validation.
 */
export async function generateAI<T = unknown>(params: GenerateAIParams<T>): Promise<T> {
  const {
    feature,
    prompt,
    systemInstruction,
    schema,
    validator,
    temperature = 0.3,
    maxTokens = 4096,
    userId,
  } = params;

  if (userId && !checkUserRateLimit(userId)) {
    throw new AIRateLimitError("You're making AI requests too quickly. Please pause for a moment.");
  }

  if (schema || validator) {
    const result = await routerGenerateStructured<T>({
      prompt,
      systemInstruction,
      schema,
      validator,
      temperature,
      maxTokens,
      feature,
    });
    return result.data;
  }

  const result = await routerGenerateText({
    prompt,
    systemInstruction,
    temperature,
    maxTokens,
    feature,
  });

  return result.data as unknown as T;
}

// ---------------------------------------------------------------------------
// System Health Report
// ---------------------------------------------------------------------------
import { AISystemHealthReport } from "./types";

export function getAISystemHealth(): AISystemHealthReport {
  const gs = healthState.gemini;
  const qs = healthState.groq;

  const geminiConfigured = isGeminiConfigured();
  const groqConfigured = isGroqConfigured();
  const anyAvailable = geminiConfigured || groqConfigured;

  return {
    status: anyAvailable
      ? geminiConfigured && groqConfigured
        ? "available"
        : "degraded"
      : "unavailable",
    primaryProvider: AI_CONFIG.primaryProvider,
    fallbackProvider: AI_CONFIG.fallbackProvider,
    fallbackEnabled: AI_CONFIG.enableFallback,
    fallbackCount: gs.fallbackCount + qs.fallbackCount,
    totalRequests: gs.requests + qs.requests,
    gemini: {
      configured: geminiConfigured,
      available: geminiConfigured,
      model: AI_CONFIG.geminiModel,
      requests: gs.requests,
      successCount: gs.successes,
      failureCount: gs.failures,
      successRate: gs.requests > 0 ? Math.round((gs.successes / gs.requests) * 100) : 100,
      avgLatencyMs: gs.successes > 0 ? Math.round(gs.totalLatencyMs / gs.successes) : 0,
      lastError: gs.lastError,
      lastUsed: gs.lastUsed,
    },
    groq: {
      configured: groqConfigured,
      available: groqConfigured,
      model: AI_CONFIG.groqModel,
      requests: qs.requests,
      successCount: qs.successes,
      failureCount: qs.failures,
      successRate: qs.requests > 0 ? Math.round((qs.successes / qs.requests) * 100) : 100,
      avgLatencyMs: qs.successes > 0 ? Math.round(qs.totalLatencyMs / qs.successes) : 0,
      lastError: qs.lastError,
      lastUsed: qs.lastUsed,
    },
  };
}
