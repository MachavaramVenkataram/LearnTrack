/**
 * LearnTrack Frontend Client API for Centralized Gemini AI
 *
 * Calls secure Next.js internal API routes (`/api/ai/...`) ensuring zero API key exposure.
 */

import {
  StudentAIContext,
  StudyPlanGenerationInput,
  GeneratedStudyPlanOutput,
} from "@/types/academic";
import type {
  GeneratedCardOutput,
  PracticeQuizOutput,
  HintOutput,
  AIInsightsOutput,
  ExamPrepOutput,
  PerformanceExplanationOutput,
  SimulatorExplanationOutput,
} from "@/lib/ai/types";

export interface AIChatResponse {
  content: string;
  model: string;
}

export async function sendAIChatMessage(params: {
  userId: string;
  studentId?: string;
  studentName?: string;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  context?: StudentAIContext;
}): Promise<AIChatResponse> {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.error || "LearnTrack AI is temporarily unavailable."
    );
  }

  return await res.json();
}

export async function requestStudyPlanGeneration(params: {
  userId: string;
  studentId?: string;
  studentName?: string;
  input: StudyPlanGenerationInput;
  startDateStr?: string;
  context?: StudentAIContext;
}): Promise<GeneratedStudyPlanOutput> {
  const res = await fetch("/api/ai/study-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody.error || "Failed to generate personalized study plan."
    );
  }

  return await res.json();
}

export interface AIFlashcardGenerationRequest {
  subject: string;
  topic: string;
  difficulty?: string;
  count?: number;
  cardType?: string;
  learningGoal?: string;
  sourceType?: string;
  sourceId?: string;
  customText?: string;
  existingQuestions?: string[];
}

export interface AIFlashcardGenerationResponse {
  success: boolean;
  cards: GeneratedCardOutput[];
  metadata?: {
    provider: string;
    model: string;
    generatedCount: number;
    validCount: number;
    rejectedCount: number;
    duplicateCount: number;
    durationMs: number;
  };
  error?: string;
}

export async function requestFlashcardGeneration(
  params: AIFlashcardGenerationRequest
): Promise<AIFlashcardGenerationResponse> {
  const res = await fetch("/api/ai/flashcards/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Flashcard generation failed.");
  }
  return data;
}

export async function requestAcademicInsights(params?: {
  averageScore?: number | null;
  averageAttendance?: number | null;
  cgpa?: number | null;
  weakSubjects?: string[];
  strongSubjects?: string[];
}): Promise<AIInsightsOutput> {
  const res = await fetch("/api/ai/insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params || {}),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to generate academic insights.");
  }
  return data;
}

export async function requestPracticeQuiz(params: {
  subject: string;
  topic: string;
  difficulty?: string;
  count?: number;
  questionType?: string;
  contextText?: string;
}): Promise<PracticeQuizOutput> {
  const res = await fetch("/api/ai/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to generate practice assessment.");
  }
  return data;
}

export async function requestPracticeHint(params: {
  question: string;
  studentAttempt?: string;
  topic?: string;
}): Promise<HintOutput> {
  const res = await fetch("/api/ai/practice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...params, action: "hint" }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to generate hint.");
  }
  return data;
}

export async function requestExamPrepGuide(params: {
  subject: string;
  examDate?: string;
  topics: string[];
  currentGrade?: string;
  focusArea?: string;
}): Promise<ExamPrepOutput> {
  const res = await fetch("/api/ai/exam-prep", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to generate exam prep guide.");
  }
  return data;
}

export async function requestAcademicExplanation(params: {
  type?: "concept" | "performance";
  topic?: string;
  subject?: string;
  level?: string;
  predictedScore?: number;
  previousScore?: number;
  attendanceRate?: number;
  studyHoursWeekly?: number;
}): Promise<{ explanation?: string } & Partial<PerformanceExplanationOutput>> {
  const res = await fetch("/api/ai/explanation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to generate explanation.");
  }
  return data;
}

export async function requestSimulationExplanation(params: {
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
}): Promise<SimulatorExplanationOutput> {
  const res = await fetch("/api/ai/simulator", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Failed to generate simulator explanation.");
  }
  return data;
}
