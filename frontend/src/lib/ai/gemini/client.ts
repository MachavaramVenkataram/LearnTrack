/**
 * LearnTrack Central Google Gemini Client
 *
 * Singleton instance of Google's official @google/genai SDK.
 * Strictly server-side only: never expose or import in browser components.
 */

import { GoogleGenAI } from "@google/genai";
import { AI_CONFIG } from "../config";
import { AIMissingApiKeyError } from "../errors";

let client: GoogleGenAI | null = null;

/**
 * Returns the singleton GoogleGenAI client instance.
 * Throws a typed AIMissingApiKeyError if GEMINI_API_KEY is missing.
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey =
    AI_CONFIG.apiKey ||
    process.env.GEMINI_API_KEY ||
    process.env.AI_API_KEY ||
    "";

  if (!apiKey || apiKey.trim().length === 0) {
    throw new AIMissingApiKeyError(
      "GEMINI_API_KEY is not configured. Add it to the server environment."
    );
  }

  if (!client) {
    client = new GoogleGenAI({
      apiKey: apiKey.trim(),
    });
  }

  return client;
}

/**
 * Resets the cached singleton client (useful for unit tests or credential rotation).
 */
export function resetGeminiClient(): void {
  client = null;
}
