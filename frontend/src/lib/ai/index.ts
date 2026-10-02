/**
 * LearnTrack Centralized AI Platform
 *
 * Single entry point for all AI services across the entire website.
 * Multi-provider architecture: Gemini (Primary) + Groq (Fallback).
 *
 * Features:
 * - Server-only execution with zero secret leakage
 * - Automatic primary → fallback failover on transient errors
 * - Automatic rate-limiting and transient-error exponential backoff
 * - Multi-tenant RLS isolation
 * - Clean provider abstraction: Gemini & Groq behind single router
 */

import {
  routerGenerateText,
  routerGenerateStructured,
  getAISystemHealth,
  generateAI,
} from "./router";
import { isAIConfigured, isGeminiConfigured, isGroqConfigured, getAIStatus, AI_CONFIG } from "./config";
import { getAIProvider, registerAIProvider, GeminiProvider, GroqProvider } from "./providers";
import { chatWithAssistant } from "./services/assistant";
import { generateFlashcards } from "./services/flashcards";
import { generateStudyPlan } from "./services/study-plan";
import { generatePracticeQuestions, generateHint } from "./services/practice";
import { generateExamPrepGuide } from "./services/exam-prep";
import {
  generateConceptExplanation,
  explainPerformanceMetrics,
} from "./services/explanations";
import { generateAcademicInsights } from "./services/insights";
import { generateCommandCenterBrief } from "./services/recommendations";
import { askNotebook, summarizeNote, transformNoteText } from "./services/notebook";
import { summarizeKnowledgeDocument } from "./services/knowledge-base";
import { explainSimulation } from "./services/simulator";
import { analyzeResume, generateInterviewQuestions } from "./services/career";
import {
  GenerateAIParams,
  AITextRequest,
  AIStructuredRequest,
  AIConversationRequest,
  AIConversationResponse,
  AIResult,
} from "./types";
import { AIRateLimitError } from "./errors";

export { generateAI };

/**
 * Centralized AI Service Object.
 * Every AI feature in LearnTrack accesses AI through this facade.
 * All calls are routed through the multi-provider router (Gemini → Groq fallback).
 */
export const ai = {
  // Core primitives (routed through the central AI router)
  generateText: async (request: AITextRequest): Promise<string> => {
    const result = await routerGenerateText({
      prompt: request.prompt,
      systemInstruction: request.systemInstruction,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
    });
    return result.data;
  },

  generateStructured: async <T>(request: AIStructuredRequest<T>): Promise<T> => {
    const result = await routerGenerateStructured<T>({
      prompt: request.prompt,
      systemInstruction: request.systemInstruction,
      schema: request.schema,
      validator: request.validator,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
    });
    return result.data;
  },

  // Domain features (all use the router internally)
  chat: chatWithAssistant,
  generateFlashcards,
  generateStudyPlan,
  generatePracticeQuestions,
  generateExamQuestions: generateExamPrepGuide,
  generateExplanation: generateConceptExplanation,
  generateInsights: generateAcademicInsights,
  generateRecommendations: generateCommandCenterBrief,
  generateLearningPlan: generateStudyPlan,
  generateHint,
  summarize: summarizeNote,
  summarizeDocument: summarizeKnowledgeDocument,
  analyzeAcademicPerformance: explainPerformanceMetrics,
  explainSimulation,
  transformNoteText,
  askNotebook,
  analyzeResume,
  generateInterviewQuestions,

  // Status & Health (multi-provider aware)
  isConfigured: isAIConfigured,
  isGeminiConfigured,
  isGroqConfigured,
  getStatus: getAIStatus,
  getSystemHealth: getAISystemHealth,
  getProvider: getAIProvider,
};

export { getAIProvider, registerAIProvider, GeminiProvider, GroqProvider };
export default ai;
