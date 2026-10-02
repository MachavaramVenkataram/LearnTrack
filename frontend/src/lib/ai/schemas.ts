/**
 * LearnTrack AI Schemas
 * Strict Zod validation schemas for structured AI outputs.
 * Enforces data contracts before model responses reach database or client.
 */

import { z } from "zod";

export const FlashcardCardSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters long"),
  answer: z.string().min(1, "Answer cannot be empty"),
  explanation: z.string().optional().default(""),
  hint: z.string().optional().default(""),
  example: z.string().optional().default(""),
  topic: z.string().min(1, "Topic is required"),
  difficulty: z.enum(["easy", "medium", "hard"]).catch("medium"),
  card_type: z.enum([
    "definition",
    "concept",
    "comparison",
    "application",
    "cause_effect",
    "formula",
    "scenario",
    "exam",
    "exam_style",
    "code",
    "problem_solving",
    "mixed",
  ]).catch("concept"),
  source_reference: z.string().optional().default(""),
});

export const FlashcardGenerationSchema = z.object({
  cards: z.array(FlashcardCardSchema).min(1, "At least one card must be generated"),
});

export type ValidatedCard = z.infer<typeof FlashcardCardSchema>;
export type ValidatedFlashcardPayload = z.infer<typeof FlashcardGenerationSchema>;

export const StudyPlanSessionSchema = z.object({
  time_slot: z.string(),
  subject_id: z.string(),
  subject_name: z.string(),
  topic: z.string(),
  activity_type: z.enum(["review", "practice", "deep_study", "assignment", "exam_prep"]),
  duration_minutes: z.number().min(15).max(360),
  objective: z.string(),
});

export const StudyPlanDaySchema = z.object({
  date: z.string(),
  day_label: z.string(),
  total_minutes: z.number(),
  sessions: z.array(StudyPlanSessionSchema),
});

export const StudyPlanOutputSchema = z.object({
  plan_title: z.string(),
  total_days: z.number(),
  total_hours: z.number(),
  start_date: z.string(),
  days: z.array(StudyPlanDaySchema),
  pedagogical_rationale: z.string().optional(),
});
