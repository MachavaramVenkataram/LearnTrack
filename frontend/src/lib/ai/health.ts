/**
 * LearnTrack Live AI Provider Connectivity & Health Diagnostics (Server-Only)
 *
 * Implements real end-to-end provider verification:
 * - testGeminiConnection(): Sends minimal "OK" test probe via @google/genai
 * - testGroqConnection(): Sends minimal "OK" test probe via groq-sdk
 * - checkAIHealth(): Aggregated cached probe with cost protection (60s TTL)
 *
 * Distinguishes:
 * - HEALTHY
 * - NOT_CONFIGURED
 * - INVALID_CREDENTIALS
 * - INVALID_MODEL
 * - RATE_LIMITED
 * - NETWORK_ERROR
 * - PROVIDER_ERROR
 *
 * Strictly server-only: NEVER exposes API keys, tokens, or sensitive credentials.
 */

import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";
import { getGeminiConfig, getGroqConfig, AI_CONFIG } from "./config";
import { logProviderError, normalizeProviderError } from "./errors";

if (typeof window !== "undefined") {
  throw new Error("AI Health diagnostics are server-only.");
}

export type ProviderHealthStatus =
  | "HEALTHY"
  | "NOT_CONFIGURED"
  | "INVALID_CREDENTIALS"
  | "INVALID_MODEL"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "PROVIDER_ERROR";

export interface ProviderHealthResult {
  configured: boolean;
  reachable: boolean;
  status: ProviderHealthStatus;
  model: string;
  latencyMs?: number;
  lastChecked: string;
  error?: string;
}

export interface AISystemFullHealthReport {
  success: boolean;
  overallStatus: "healthy" | "degraded" | "unavailable";
  primaryProvider: string;
  fallbackProvider: string;
  fallbackEnabled: boolean;
  cached: boolean;
  providers: {
    gemini: ProviderHealthResult;
    groq: ProviderHealthResult;
  };
  timestamp: string;
}

// ---------------------------------------------------------------------------
// 1. Direct Gemini Connection Probe
// ---------------------------------------------------------------------------
export async function testGeminiConnection(): Promise<ProviderHealthResult> {
  const config = getGeminiConfig();
  const timestamp = new Date().toISOString();

  if (!config.isConfigured) {
    return {
      configured: false,
      reachable: false,
      status: "NOT_CONFIGURED",
      model: config.model,
      lastChecked: timestamp,
      error: "GEMINI_API_KEY is not configured.",
    };
  }

  const startTime = Date.now();
  try {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const response = await ai.models.generateContent({
      model: config.model,
      contents: "Respond with exactly: OK",
    });

    const text = (response.text || "").trim();
    if (!text) {
      throw new Error("Empty response received from Gemini.");
    }

    return {
      configured: true,
      reachable: true,
      status: "HEALTHY",
      model: config.model,
      latencyMs: Date.now() - startTime,
      lastChecked: timestamp,
    };
  } catch (err: any) {
    const normalized = normalizeProviderError("gemini", err);
    logProviderError("gemini", err);

    let status: ProviderHealthStatus = "PROVIDER_ERROR";
    if (normalized.code === "AI_AUTHENTICATION_ERROR") status = "INVALID_CREDENTIALS";
    else if (normalized.code === "AI_INVALID_MODEL") status = "INVALID_MODEL";
    else if (normalized.code === "AI_RATE_LIMITED") status = "RATE_LIMITED";
    else if (normalized.code === "AI_NETWORK_ERROR" || normalized.code === "AI_TIMEOUT") status = "NETWORK_ERROR";

    return {
      configured: true,
      reachable: false,
      status,
      model: config.model,
      latencyMs: Date.now() - startTime,
      lastChecked: timestamp,
      error: normalized.message,
    };
  }
}

// ---------------------------------------------------------------------------
// 2. Direct Groq Connection Probe
// ---------------------------------------------------------------------------
export async function testGroqConnection(): Promise<ProviderHealthResult> {
  const config = getGroqConfig();
  const timestamp = new Date().toISOString();

  if (!config.isConfigured) {
    return {
      configured: false,
      reachable: false,
      status: "NOT_CONFIGURED",
      model: config.model,
      lastChecked: timestamp,
      error: "GROQ_API_KEY is not configured.",
    };
  }

  const startTime = Date.now();
  try {
    const groq = new Groq({ apiKey: config.apiKey });
    const response = await groq.chat.completions.create({
      model: config.model,
      messages: [{ role: "user", content: "Respond with exactly: OK" }],
      max_tokens: 10,
    });

    const text = (response.choices?.[0]?.message?.content || "").trim();
    if (!text) {
      throw new Error("Empty response received from Groq.");
    }

    return {
      configured: true,
      reachable: true,
      status: "HEALTHY",
      model: config.model,
      latencyMs: Date.now() - startTime,
      lastChecked: timestamp,
    };
  } catch (err: any) {
    const normalized = normalizeProviderError("groq", err);
    logProviderError("groq", err);

    let status: ProviderHealthStatus = "PROVIDER_ERROR";
    if (normalized.code === "AI_AUTHENTICATION_ERROR") status = "INVALID_CREDENTIALS";
    else if (normalized.code === "AI_INVALID_MODEL") status = "INVALID_MODEL";
    else if (normalized.code === "AI_RATE_LIMITED") status = "RATE_LIMITED";
    else if (normalized.code === "AI_NETWORK_ERROR" || normalized.code === "AI_TIMEOUT") status = "NETWORK_ERROR";

    return {
      configured: true,
      reachable: false,
      status,
      model: config.model,
      latencyMs: Date.now() - startTime,
      lastChecked: timestamp,
      error: normalized.message,
    };
  }
}

// ---------------------------------------------------------------------------
// 3. Short-Lived Cache (Cost & Quota Protection)
// ---------------------------------------------------------------------------
const CACHE_TTL_MS = 60 * 1000; // 60 seconds
let cachedReport: { report: AISystemFullHealthReport; expiresAt: number } | null = null;

export async function checkAIHealth(forceRefresh = false): Promise<AISystemFullHealthReport> {
  const now = Date.now();

  if (!forceRefresh && cachedReport && now < cachedReport.expiresAt) {
    return {
      ...cachedReport.report,
      cached: true,
    };
  }

  // Probe both providers independently in parallel
  const [geminiResult, groqResult] = await Promise.all([
    testGeminiConnection(),
    testGroqConnection(),
  ]);

  let overallStatus: "healthy" | "degraded" | "unavailable" = "unavailable";
  if (geminiResult.status === "HEALTHY" && groqResult.status === "HEALTHY") {
    overallStatus = "healthy";
  } else if (geminiResult.status === "HEALTHY" || groqResult.status === "HEALTHY") {
    overallStatus = "degraded"; // One provider works, redundancy is reduced
  }

  const report: AISystemFullHealthReport = {
    success: true,
    overallStatus,
    primaryProvider: AI_CONFIG.primaryProvider,
    fallbackProvider: AI_CONFIG.fallbackProvider,
    fallbackEnabled: AI_CONFIG.enableFallback,
    cached: false,
    providers: {
      gemini: geminiResult,
      groq: groqResult,
    },
    timestamp: new Date().toISOString(),
  };

  cachedReport = {
    report,
    expiresAt: now + CACHE_TTL_MS,
  };

  return report;
}

export function invalidateHealthCache(): void {
  cachedReport = null;
}
