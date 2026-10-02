/**
 * LearnTrack Central Zod Validation Schemas
 *
 * Enforces strict typing and data validation across all Gemini structured outputs.
 */

import { z } from "zod";

// -----------------------------------------------------------------------------
// 1. Flashcards Schema
// -----------------------------------------------------------------------------
export const FlashcardCardSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters long"),
  answer: z.string().min(1, "Answer cannot be empty"),
  explanation: z.string().optional(),
  hint: z.string().optional(),
  example: z.string().optional(),
  topic: z.string().min(1, "Topic is required"),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  card_type: z
    .enum([
      "definition",
      "concept",
      "comparison",
      "application",
      "cause_effect",
      "formula",
      "scenario",
      "exam",
      "code",
    ])
    .default("concept"),
  source_reference: z.string().optional(),
});

export const FlashcardGenerationSchema = z.object({
  cards: z.array(FlashcardCardSchema).min(1, "At least one card must be generated"),
});

// -----------------------------------------------------------------------------
// 2. Study Plan Schema
// -----------------------------------------------------------------------------
export const StudyPlanSessionSchema = z.object({
  date: z.string(),
  subject: z.string().min(1),
  topic: z.string().min(1),
  duration_minutes: z.number().int().min(15).max(360),
  activity: z.string().min(5),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
});

export const StudyPlanOutputSchema = z.object({
  plan: z.array(StudyPlanSessionSchema),
  weekly_goal: z.string().optional(),
  rationale: z.string().optional(),
});

// -----------------------------------------------------------------------------
// 3. Practice & Quiz Schema
// -----------------------------------------------------------------------------
export const PracticeQuestionSchema = z.object({
  id: z.string().default(() => `q_${Math.random().toString(36).slice(2, 9)}`),
  question: z.string().min(8, "Question prompt is too short"),
  options: z.array(z.string()).min(2).max(6).optional(),
  correct_index: z.number().int().min(0).max(5).optional(),
  sample_answer: z.string().optional(),
  explanation: z.string().min(5, "Explanation must clarify why the answer is correct"),
  hint: z.string().optional(),
  difficulty: z.preprocess((val) => {
    const s = String(val || "").toLowerCase();
    if (s.includes("easy")) return "easy";
    if (s.includes("hard")) return "hard";
    return "medium";
  }, z.enum(["easy", "medium", "hard"])),
  type: z.preprocess((val) => {
    const s = String(val || "").toLowerCase();
    if (s.includes("true") || s.includes("false")) return "true_false";
    if (s.includes("short") || s.includes("essay")) return "short_answer";
    if (s.includes("code") || s.includes("coding")) return "coding";
    return "mcq";
  }, z.enum(["mcq", "true_false", "short_answer", "coding"])),
  topic: z.string().default("General"),
  source_citation: z.string().optional(),
});

export const PracticeQuizSchema = z.object({
  title: z.string(),
  topic: z.string(),
  subject: z.string(),
  questions: z.array(PracticeQuestionSchema).min(1),
});

// -----------------------------------------------------------------------------
// 4. Hint Schema
// -----------------------------------------------------------------------------
export const HintOutputSchema = z.object({
  hint: z.string().min(5),
  guidingQuestion: z.string().optional(),
  relevantConcept: z.string().optional(),
});

// -----------------------------------------------------------------------------
// 5. AI Insights Schema
// -----------------------------------------------------------------------------
export const AIInsightItemSchema = z.object({
  id: z.string().default(() => `ins_${Math.random().toString(36).slice(2, 9)}`),
  title: z.string().min(3),
  category: z.enum(["performance", "attendance", "study_habit", "goal_alignment"]),
  observation: z.string().min(10),
  impact: z.enum(["positive", "warning", "neutral"]),
  recommendation: z.string().min(10),
});

export const AIInsightsOutputSchema = z.object({
  insights: z.array(AIInsightItemSchema),
  overview: z.string().min(10),
});

// -----------------------------------------------------------------------------
// 6. What-If Simulator Explanation Schema
// -----------------------------------------------------------------------------
export const SimulatorExplanationSchema = z.object({
  scoreDelta: z.number(),
  explanation: z.string().min(15),
  mostImpactfulChanges: z.array(z.string()).min(1),
  practicalAdvice: z.string().min(10),
});

// -----------------------------------------------------------------------------
// 7. Academic Performance Explanation Schema
// -----------------------------------------------------------------------------
export const PerformanceExplanationSchema = z.object({
  summary: z.string().min(15),
  keyDrivers: z.array(z.string()).min(1),
  actionableSteps: z.array(z.string()).min(1),
  encouragement: z.string().min(5),
});

// -----------------------------------------------------------------------------
// 8. Exam Prep Schema
// -----------------------------------------------------------------------------
export const ExamPrepSchema = z.object({
  highYieldSummary: z.string().min(20),
  keyFormulasAndRules: z.array(z.string()),
  commonPitfalls: z.array(z.string()),
  practiceChecklist: z.array(z.string()),
  suggestedRevisionOrder: z.array(z.string()),
});

// -----------------------------------------------------------------------------
// 9. Career & Interview Schemas
// -----------------------------------------------------------------------------
export const ResumeAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  skillGaps: z.array(z.string()),
  bulletImprovements: z.array(
    z.object({
      original: z.string(),
      suggested: z.string(),
      rationale: z.string(),
    })
  ),
  recommendedCertifications: z.array(z.string()),
});

export const InterviewPrepSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().min(10),
      category: z.enum(["technical", "behavioral", "system_design"]),
      keyPointsToCover: z.array(z.string()),
      idealResponseStructure: z.string(),
    })
  ),
});
