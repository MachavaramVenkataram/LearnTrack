/**
 * LearnTrack Centralized ML Service Configuration
 * Single source of truth for FastAPI ML backend URL and settings.
 * All frontend components and API clients must consume ML endpoints through this configuration.
 */

export const ML_CONFIG = {
  /**
   * Primary ML Service Base URL.
   * Priority:
   * 1. NEXT_PUBLIC_ML_API_URL
   * 2. NEXT_PUBLIC_ML_SERVICE_URL
   * 3. NEXT_PUBLIC_API_URL
   * 4. Default: http://127.0.0.1:8001
   */
  get baseUrl(): string {
    const rawUrl =
      process.env.NEXT_PUBLIC_ML_API_URL ||
      process.env.NEXT_PUBLIC_ML_SERVICE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8001";
    return rawUrl.trim().replace(/\/$/, "");
  },

  /**
   * Request timeout in milliseconds (10s default)
   */
  timeoutMs: 10000,

  /**
   * Health check timeout in milliseconds (4s fast fail)
   */
  healthTimeoutMs: 4000,

  /**
   * Service identification metadata
   */
  serviceName: "LearnTrack ML",
  defaultModelVersion: "v1.0.0",

  /**
   * Canonical endpoint paths for FastAPI ML service
   */
  endpoints: {
    health: "/health",
    modelInfo: "/model/info",
    predict: "/predict",
    simulate: "/simulate",
    insightsGenerate: "/insights/generate",
    monitoringSummary: "/monitoring/summary",
    dataQualityLatest: "/data-quality/latest",
  },
} as const;

/**
 * Returns full absolute URL for a given ML endpoint path.
 */
export function getMLApiUrl(endpoint: string): string {
  const normalizedPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${ML_CONFIG.baseUrl}${normalizedPath}`;
}

/**
 * Safe development diagnostic logger.
 * Never logs credentials, private tokens, or sensitive student details.
 */
export function logML(event: string, meta?: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== "production") {
    if (meta) {
      console.log(`[ML] ${event}`, meta);
    } else {
      console.log(`[ML] ${event}`);
    }
  }
}
