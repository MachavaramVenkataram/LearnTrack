/**
 * LearnTrack AI System Health & Connectivity Diagnostics API
 *
 * GET /api/ai/health
 *
 * Tests live provider connectivity end-to-end:
 * - Gemini: Sends minimal test probe via @google/genai
 * - Groq: Sends minimal test probe via groq-sdk
 *
 * Protected with a 60-second cache to prevent quota exhaustion.
 * Use ?refresh=true for manual on-demand re-probe.
 *
 * Strictly server-side: NEVER exposes API keys, tokens, or sensitive credentials.
 */

import { NextRequest, NextResponse } from "next/server";
import { checkAIHealth } from "@/lib/ai/health";
import { getAISystemHealth } from "@/lib/ai/router";
import { AI_CONFIG } from "@/lib/ai/config";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const forceRefresh = searchParams.get("refresh") === "true" || searchParams.get("force") === "true";

    // Run real live provider health check (cached for 60s unless refresh requested)
    const report = await checkAIHealth(forceRefresh);

    // Get telemetry & counters from router
    const routerMetrics = getAISystemHealth();

    return NextResponse.json({
      success: true,
      overallStatus: report.overallStatus,
      providers: {
        gemini: {
          configured: report.providers.gemini.configured,
          reachable: report.providers.gemini.reachable,
          status: report.providers.gemini.status,
          model: report.providers.gemini.model,
          latencyMs: report.providers.gemini.latencyMs,
          error: report.providers.gemini.error,
          requests: routerMetrics.gemini.requests,
          successRate: routerMetrics.gemini.successRate,
        },
        groq: {
          configured: report.providers.groq.configured,
          reachable: report.providers.groq.reachable,
          status: report.providers.groq.status,
          model: report.providers.groq.model,
          latencyMs: report.providers.groq.latencyMs,
          error: report.providers.groq.error,
          requests: routerMetrics.groq.requests,
          successRate: routerMetrics.groq.successRate,
        },
      },
      router: {
        primary: AI_CONFIG.primaryProvider,
        fallback: AI_CONFIG.fallbackProvider,
        fallbackEnabled: AI_CONFIG.enableFallback,
        fallbackCount: routerMetrics.fallbackCount,
        totalRequests: routerMetrics.totalRequests,
      },
      cached: report.cached,
      timestamp: report.timestamp,
    });
  } catch (error: any) {
    console.error("[AI Health API] Unexpected diagnostic error:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: "AI diagnostic probe failed",
        status: "unavailable",
      },
      { status: 500 }
    );
  }
}
