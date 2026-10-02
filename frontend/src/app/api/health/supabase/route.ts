import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();

  try {
    // 1. Verify configuration
    validateSupabaseEnv();

    // 2. Perform genuine server-side database ping query
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .select("id", { head: true, count: "exact" });

    const latencyMs = Date.now() - startTime;

    if (error) {
      console.error("[Supabase Health] Database query error:", error.message);
      return NextResponse.json(
        {
          status: "unhealthy",
          supabase: {
            connected: false,
            error_category: "database_query_error",
            message: "Unable to query Supabase database",
          },
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: "healthy",
        supabase: {
          connected: true,
          latency_ms: latencyMs,
          service: "PostgreSQL Database & Auth",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[Supabase Health] Connection error:", err.message);
    const isConfigError = err.message?.includes("Configuration");

    return NextResponse.json(
      {
        status: "unhealthy",
        supabase: {
          connected: false,
          error_category: isConfigError ? "configuration_missing" : "network_or_connection_failure",
          message: isConfigError
            ? "Supabase environment configuration is missing or invalid"
            : "Failed to establish connection to Supabase instance",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
