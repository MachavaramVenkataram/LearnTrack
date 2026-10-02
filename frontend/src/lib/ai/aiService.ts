/**
 * LearnTrack Unified AI Service
 * Server-side AI orchestration layer:
 * - Selects provider (Gemini or Local Academic Engine)
 * - Enforces rate limiting per authenticated student
 * - Validates structured outputs (Study Plan JSON schema)
 * - Masks internal provider errors to ensure zero secret leakage
 */

import {
  StudentAIContext,
  StudyPlanGenerationInput,
  GeneratedStudyPlanOutput,
} from "@/types/academic";
import { AIProvider, ChatMessage, ChatResult } from "./providers/base";
import { GeminiProvider } from "./providers/geminiProvider";
import { LocalEngineProvider } from "./providers/localEngineProvider";

// In-memory rate limiting bucket per user (requests per minute window)
interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const userRateLimits = new Map<string, RateLimitBucket>();
const MAX_REQUESTS_PER_MINUTE = 20;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const bucket = userRateLimits.get(userId) || {
    tokens: MAX_REQUESTS_PER_MINUTE,
    lastRefill: now,
  };

  // Refill tokens based on elapsed time (60,000ms window)
  const elapsed = now - bucket.lastRefill;
  if (elapsed > 60000) {
    bucket.tokens = MAX_REQUESTS_PER_MINUTE;
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) {
    return false;
  }

  bucket.tokens -= 1;
  userRateLimits.set(userId, bucket);
  return true;
}

class AIService {
  private localProvider = new LocalEngineProvider();

  private getProvider(): AIProvider {
    const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
    const model = process.env.AI_MODEL || "gemini-2.5-flash";
    const providerName = (process.env.AI_PROVIDER || "gemini").toLowerCase();

    if (apiKey && providerName === "gemini") {
      return new GeminiProvider(apiKey, model);
    }

    return this.localProvider;
  }

  /**
   * Dispatches chat request to configured provider with automatic local fallback
   */
  async chatWithAssistant(
    userId: string,
    messages: ChatMessage[],
    context?: StudentAIContext
  ): Promise<ChatResult> {
    if (!checkRateLimit(userId)) {
      throw new Error("You're making requests too quickly. Please try again shortly.");
    }

    const provider = this.getProvider();

    try {
      return await provider.chat(messages, context);
    } catch (err) {
      console.warn(`[AIService] Primary provider (${provider.name}) failed, falling back to local academic engine:`, err);
      try {
        return await this.localProvider.chat(messages, context);
      } catch (fallbackErr) {
        console.error("[AIService] Critical AI error:", fallbackErr);
        throw new Error("LearnTrack AI is temporarily unavailable. Please try again in a few moments.");
      }
    }
  }

  /**
   * Generates and validates structured study plan JSON
   */
  async generatePersonalizedStudyPlan(
    userId: string,
    input: StudyPlanGenerationInput,
    context: StudentAIContext,
    startDateStr: string
  ): Promise<GeneratedStudyPlanOutput> {
    if (!checkRateLimit(userId)) {
      throw new Error("You're making requests too quickly. Please try again shortly.");
    }

    const provider = this.getProvider();
    let rawPlan: GeneratedStudyPlanOutput | null = null;

    try {
      rawPlan = await provider.generateStudyPlan(input, context, startDateStr);
    } catch (err) {
      console.warn(`[AIService] Primary provider (${provider.name}) plan generation failed, using local engine:`, err);
      rawPlan = await this.localProvider.generateStudyPlan(input, context, startDateStr);
    }

    // Schema Validation & Safe Recovery
    if (!rawPlan || !Array.isArray(rawPlan.days) || rawPlan.days.length === 0) {
      console.warn("[AIService] Output validation failed for study plan, recovering via local engine.");
      rawPlan = await this.localProvider.generateStudyPlan(input, context, startDateStr);
    }

    // Verify time constraints: no day exceeds user's daily hours + 15 min buffer
    const maxDayMinutes = Math.round(input.daily_hours * 60) + 15;
    rawPlan.days.forEach((day) => {
      let daySum = 0;
      day.sessions = (day.sessions || []).filter((s) => {
        daySum += s.duration_minutes || 60;
        return daySum <= maxDayMinutes;
      });
    });

    return rawPlan;
  }

  /**
   * Generates high-yield active-recall flashcards grounded in academic sources
   */
  async generateFlashcards(
    userId: string,
    input: import("./types").FlashcardGenerationInput
  ): Promise<import("./types").FlashcardGenerationOutput> {
    if (!checkRateLimit(userId)) {
      throw new Error("You're making requests too quickly. Please try again shortly.");
    }
    const { ai } = await import("./index");
    return await ai.generateFlashcards(input);
  }
}

export const aiService = new AIService();

