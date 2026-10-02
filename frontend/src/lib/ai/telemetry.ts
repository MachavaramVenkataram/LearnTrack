/**
 * LearnTrack AI Telemetry & Observability
 *
 * Provides structured, safe operational logging without recording
 * API keys, student private content, or sensitive credentials.
 */

import { AITelemetryEvent } from "./types";

export function logAIEvent(event: AITelemetryEvent): void {
  const status = event.success ? "SUCCESS" : `FAILED (${event.errorCode || "UNKNOWN"})`;
  const actionName = (event.action || event.feature || "OPERATION").toUpperCase();
  console.log(
    `[AI] ${actionName} | Provider: ${event.provider} | Model: ${event.model} | ` +
    `Status: ${status} | Duration: ${event.durationMs}ms` +
    (event.itemCount !== undefined ? ` | Items: ${event.itemCount}` : "") +
    (event.inputTokens !== undefined ? ` | InTokens: ${event.inputTokens}` : "") +
    (event.outputTokens !== undefined ? ` | OutTokens: ${event.outputTokens}` : "")
  );
}

export function logAIOperationStart(action: string, provider: string, model: string, details?: Record<string, unknown>): void {
  const extra = details
    ? Object.entries(details)
        .map(([k, v]) => `${k}=${v}`)
        .join(" | ")
    : "";
  console.log(`[AI] ${action.toUpperCase()} started | Provider: ${provider} | Model: ${model}${extra ? ` | ${extra}` : ""}`);
}
