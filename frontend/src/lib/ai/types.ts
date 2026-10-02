/**
 * LearnTrack Central AI Type Definitions
 *
 * Unified types across all Gemini AI features in LearnTrack.
 */

import { FlashcardDifficulty, FlashcardType } from "@/types/learning";
import {
  StudentAIContext,
  StudyPlanGenerationInput,
  GeneratedStudyPlanOutput,
  AcademicGoal,
} from "@/types/academic";

export type {
  StudentAIContext,
  StudyPlanGenerationInput,
  GeneratedStudyPlanOutput,
};

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatResult {
  content: string;
  model: string;
}

export interface AITextRequest {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AITextResponse {
  text: string;
  model: string;
  durationMs: number;
}

export interface AIStructuredRequest<T = unknown> {
  prompt: string;
  systemInstruction?: string;
  schema?: Record<string, unknown>;
  temperature?: number;
  maxTokens?: number;
  validator?: (data: unknown) => T;
}

export interface AIConversationRequest {
  messages: ChatMessage[];
  systemInstruction?: string;
  context?: StudentAIContext;
  temperature?: number;
}

export interface AIConversationResponse {
  message: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
  };
}

// -----------------------------------------------------------------------------
// 1. Flashcards
// -----------------------------------------------------------------------------
export interface FlashcardGenerationInput {
  subject: string;
  topic: string;
  difficulty?: FlashcardDifficulty | "mixed";
  count?: number;
  cardType?: FlashcardType | "mixed";
  learningGoal?: string;
  sourceType?: "notes" | "knowledge_base" | "subject" | "topic" | "custom_text";
  sourceId?: string;
  sourceText?: string;
  sourceReference?: string;
  existingQuestions?: string[];
  userId?: string;
}

export interface GeneratedCardOutput {
  question: string;
  answer: string;
  explanation?: string;
  hint?: string;
  example?: string;
  topic: string;
  difficulty: FlashcardDifficulty;
  card_type: FlashcardType;
  source_reference?: string;
  front?: string;
  back?: string;
}

export interface FlashcardGenerationOutput {
  success?: boolean;
  cards: GeneratedCardOutput[];
  metadata: {
    provider: string;
    model: string;
    generatedCount: number;
    validCount: number;
    rejectedCount: number;
    duplicateCount: number;
    durationMs: number;
  };
}

// -----------------------------------------------------------------------------
// 2. Practice & Quiz Generation
// -----------------------------------------------------------------------------
export type PracticeQuestionType = "mcq" | "true_false" | "short_answer" | "coding";

export interface PracticeQuestion {
  id: string;
  question: string;
  options?: string[];
  correct_index?: number;
  sample_answer?: string;
  explanation: string;
  hint?: string;
  difficulty: "easy" | "medium" | "hard";
  type: PracticeQuestionType;
  topic: string;
  source_citation?: string;
}

export interface PracticeQuizOutput {
  title: string;
  topic: string;
  subject: string;
  questions: PracticeQuestion[];
}

export interface PracticeGenerationInput {
  subject: string;
  topic: string;
  difficulty?: "easy" | "medium" | "hard" | "mixed";
  count?: number;
  questionType?: PracticeQuestionType | "mixed";
  contextText?: string;
  sourceReference?: string;
}

// -----------------------------------------------------------------------------
// 3. Hint Generation
// -----------------------------------------------------------------------------
export interface HintGenerationInput {
  question: string;
  studentAttempt?: string;
  topic?: string;
  difficulty?: string;
}

export interface HintOutput {
  hint: string;
  guidingQuestion?: string;
  relevantConcept?: string;
}

// -----------------------------------------------------------------------------
// 4. Academic Explanations & Performance Analysis
// -----------------------------------------------------------------------------
export interface ExplanationInput {
  topic: string;
  concept?: string;
  subject?: string;
  level?: "beginner" | "intermediate" | "advanced";
  format?: "concise" | "detailed" | "socratic";
  style?: string;
  context?: string;
  contextText?: string;
}

export interface PerformanceExplanationInput {
  studentName?: string;
  predictedScore: number;
  previousScore?: number;
  attendanceRate?: number;
  studyHoursWeekly?: number;
  topFactors?: Array<{ factor: string; impact: string }>;
  strengths?: string[];
  weaknesses?: string[];
}

export interface PerformanceExplanationOutput {
  summary: string;
  keyDrivers: string[];
  actionableSteps: string[];
  encouragement: string;
}

// -----------------------------------------------------------------------------
// 5. AI Insights
// -----------------------------------------------------------------------------
export interface AIInsightItem {
  id: string;
  title: string;
  category: "performance" | "attendance" | "study_habit" | "goal_alignment";
  observation: string;
  impact: "positive" | "warning" | "neutral";
  recommendation: string;
}

export interface AIInsightsOutput {
  insights: AIInsightItem[];
  overview: string;
}

// -----------------------------------------------------------------------------
// 6. What-If Simulator Explanation
// -----------------------------------------------------------------------------
export interface SimulatorExplanationInput {
  originalInputs: {
    studyHours: number;
    attendance: number;
    previousScore: number;
    internalMarks?: number;
    assignmentsCompleted?: number;
  };
  modifiedInputs: {
    studyHours: number;
    attendance: number;
    previousScore: number;
    internalMarks?: number;
    assignmentsCompleted?: number;
  };
  originalPrediction: number;
  newPrediction: number;
  shapValues?: Record<string, number>;
}

export interface SimulatorExplanationOutput {
  scoreDelta: number;
  explanation: string;
  mostImpactfulChanges: string[];
  practicalAdvice: string;
}

// -----------------------------------------------------------------------------
// 7. Exam Prep & High-Yield Revision
// -----------------------------------------------------------------------------
export interface ExamPrepInput {
  subject: string;
  examDate?: string;
  topics: string[];
  currentGrade?: string;
  focusArea?: string;
}

export interface ExamPrepOutput {
  highYieldSummary: string;
  keyFormulasAndRules: string[];
  commonPitfalls: string[];
  practiceChecklist: string[];
  suggestedRevisionOrder: string[];
}

// -----------------------------------------------------------------------------
// 8. Recommendations & Daily Brief
// -----------------------------------------------------------------------------
export interface DailyBriefInput {
  studentName?: string;
  activeSubjects?: string[];
  upcomingDeadlines?: Array<{ title: string; due: string }>;
  recentStudyMinutes?: number;
  cardsDueToday?: number;
}

export interface DailyBriefOutput {
  greeting: string;
  topPriority: string;
  suggestedSession: {
    subject: string;
    activity: string;
    durationMinutes: number;
  };
  motivation: string;
}

// -----------------------------------------------------------------------------
// 9. Career & Interview Intelligence
// -----------------------------------------------------------------------------
export interface ResumeAnalysisInput {
  resumeText: string;
  targetRole?: string;
}

export interface ResumeAnalysisOutput {
  overallScore: number;
  strengths: string[];
  skillGaps: string[];
  bulletImprovements: Array<{ original: string; suggested: string; rationale: string }>;
  recommendedCertifications: string[];
}

export interface InterviewPrepInput {
  role: string;
  topic: string;
  difficulty?: "junior" | "mid" | "senior";
  count?: number;
}

export interface InterviewQuestionItem {
  question: string;
  category: "technical" | "behavioral" | "system_design";
  keyPointsToCover: string[];
  idealResponseStructure: string;
}

export interface InterviewPrepOutput {
  questions: InterviewQuestionItem[];
}

// -----------------------------------------------------------------------------
// 10. Global AI Request & Telemetry
// -----------------------------------------------------------------------------
export interface GenerateAIParams<T = unknown> {
  feature: string;
  prompt: string;
  systemInstruction?: string;
  schema?: Record<string, unknown>;
  validator?: (data: unknown) => T;
  temperature?: number;
  maxTokens?: number;
  userId?: string;
}

export interface AITelemetryEvent {
  feature?: string;
  action?: string;
  provider: string;
  model: string;
  durationMs: number;
  success: boolean;
  errorCode?: string;
  fallbackUsed?: boolean;
  itemCount?: number;
  inputTokens?: number;
  outputTokens?: number;
  inputChars?: number;
  outputChars?: number;
  timestamp?: string;
}

// -----------------------------------------------------------------------------
// 11. Multi-Provider Normalized Result & System Health
// -----------------------------------------------------------------------------
export interface AIResult<T> {
  data: T;
  provider: "gemini" | "groq";
  model: string;
  fallbackUsed: boolean;
  latencyMs: number;
}

export interface AIProviderStats {
  configured: boolean;
  available: boolean;
  model: string;
  requests: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  avgLatencyMs: number;
  lastError?: string;
  lastUsed?: string;
}

export interface AISystemHealthReport {
  status: "available" | "degraded" | "unavailable";
  primaryProvider: "gemini" | "groq";
  fallbackProvider: "gemini" | "groq";
  fallbackEnabled: boolean;
  fallbackCount: number;
  totalRequests: number;
  gemini: AIProviderStats;
  groq: AIProviderStats;
}
