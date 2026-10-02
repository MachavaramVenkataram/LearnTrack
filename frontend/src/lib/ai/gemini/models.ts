/**
 * LearnTrack Gemini Model Registry
 *
 * Configurable model parameters and fallbacks.
 */

import { AI_CONFIG } from "../config";

export const GEMINI_MODELS = {
  primary: AI_CONFIG.model,
  fallback: AI_CONFIG.fallbackModel,
  fast: "gemini-2.5-flash",
  reasoning: "gemini-2.5-flash",
} as const;

export function getActiveModel(): string {
  return AI_CONFIG.model;
}
