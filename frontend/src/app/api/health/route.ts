import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateSupabaseEnv } from "@/lib/env";
import { ML_CONFIG } from "@/lib/ml/config";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  const mlServiceUrl = ML_CONFIG.baseUrl;
  
  // 1. Supabase database check
  let supabaseConnected = false;
  let supabaseLatencyMs: number | null = null;
  try {
    validateSupabaseEnv();
    const supabase = await createClient();
    const t0 = Date.now();
    const { error } = await supabase.from("profiles").select("id", { head: true, count: "exact" });
    if (!error) {
      supabaseConnected = true;
      supabaseLatencyMs = Date.now() - t0;
    }
  } catch {
    supabaseConnected = false;
  }

  // 2. ML service check
  let mlHealthy = false;
  let mlModelLoaded = false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${mlServiceUrl}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      mlHealthy = data.status === "healthy";
      mlModelLoaded = Boolean(data.model_loaded);
    }
  } catch {
    mlHealthy = false;
    mlModelLoaded = false;
  }

  // 3. AI provider check
  const aiConfigured = Boolean(process.env.GEMINI_API_KEY || process.env.AI_API_KEY);

  const overallHealthy = supabaseConnected;

  return NextResponse.json(
    {
      status: overallHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      services: {
        frontend: "healthy",
        supabase: {
          connected: supabaseConnected,
          latency_ms: supabaseLatencyMs,
        },
        ml_service: {
          connected: mlHealthy,
          model_loaded: mlModelLoaded,
        },
        ai_service: {
          configured: aiConfigured,
        },
      },
    },
    { status: overallHealthy ? 200 : 503 }
  );
}
