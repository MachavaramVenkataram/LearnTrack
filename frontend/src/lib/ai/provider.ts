/**
 * LearnTrack Central AI Provider Interface
 *
 * Defines the unified contract for all LLM providers (Gemini, Groq, Local Engine, etc.).
 * Allows seamless multi-provider failover without modifying frontend UI or API routes.
 */

import { StudentAIContext, StudyPlanGenerationInput, GeneratedStudyPlanOutput } from "@/types/academic";
import {
  ChatMessage,
  ChatResult,
  AITextRequest,
  AITextResponse,
  AIStructuredRequest,
  AIConversationRequest,
  AIConversationResponse,
  FlashcardGenerationInput,
  FlashcardGenerationOutput,
  ExplanationInput,
} from "./types";

export interface AIProvider {
  /** Identifier name of the provider (e.g. 'gemini', 'groq', 'local') */
  readonly name: string;

  /** Primary model name in use */
  readonly model: string;

  /** Checks if credentials and configuration are present */
  isConfigured(): boolean;

  /** Free-form text generation returning normalized text and metadata */
  generateText(request: AITextRequest): Promise<AITextResponse>;

  /** JSON-schema-enforced structured generation with schema validation */
  generateStructured<T>(request: AIStructuredRequest<T>): Promise<T>;

  /** Interactive multi-turn academic conversation */
  generateConversation(request: AIConversationRequest): Promise<AIConversationResponse>;

  /** Interactive chat with student academic context (compatibility helper) */
  chat?(messages: ChatMessage[], context?: StudentAIContext): Promise<ChatResult>;

  /** Student-tailored weekly or multi-week study plan generation (compatibility helper) */
  generateStudyPlan?(
    input: StudyPlanGenerationInput,
    context: StudentAIContext,
    startDateStr: string
  ): Promise<GeneratedStudyPlanOutput>;

  /** Source-grounded academic active-recall flashcard synthesis (optional helper) */
  generateFlashcards?(input: FlashcardGenerationInput): Promise<FlashcardGenerationOutput>;

  /** Academic concept explanation with pedagogy options (optional helper) */
  generateExplanation?(input: ExplanationInput): Promise<string>;
}
