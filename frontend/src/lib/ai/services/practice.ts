/**
 * LearnTrack Practice & Quiz Generation Service
 *
 * Generates active diagnostic quizzes and adaptive hints grounded in curriculum topics.
 */

import { routerGenerateStructured } from "../router";
import { GEMINI_PROMPTS } from "../gemini/prompts";
import { PracticeQuizSchema, HintOutputSchema } from "../validation/schemas";
import {
  PracticeGenerationInput,
  PracticeQuizOutput,
  HintGenerationInput,
  HintOutput,
} from "../types";
import { AI_CONFIG } from "../config";

export async function generatePracticeQuestions(
  input: PracticeGenerationInput
): Promise<PracticeQuizOutput> {
  const {
    subject,
    topic,
    difficulty = "medium",
    count = AI_CONFIG.defaultQuestionCount,
    questionType = "mcq",
    contextText = "",
  } = input;

  const safeCount = Math.max(
    AI_CONFIG.minQuestionsPerRequest,
    Math.min(count, AI_CONFIG.maxQuestionsPerRequest)
  );

  const prompt = `Generate an academic practice assessment with ${safeCount} questions.
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}
Question Type: ${questionType}

${contextText ? `Source Grounding:\n${contextText.slice(0, AI_CONFIG.maxSourceCharacters)}\n\n` : ""}

Return a JSON object matching this schema:
{
  "title": "${subject}: ${topic} Practice Lab",
  "topic": "${topic}",
  "subject": "${subject}",
  "questions": [
    {
      "id": "q1",
      "question": "Clear, challenging question prompt",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Detailed pedagogical explanation of why this answer is correct and others are wrong.",
      "hint": "Subtle clue",
      "difficulty": "${difficulty === "mixed" ? "medium" : difficulty}",
      "type": "${questionType === "mixed" ? "mcq" : questionType}",
      "topic": "${topic}",
      "source_citation": "${topic} Curriculum"
    }
  ]
}
Ensure multiple-choice options have exactly 4 plausible choices with the correct_index between 0 and 3.`;

  const result = await routerGenerateStructured<PracticeQuizOutput>({
    prompt,
    systemInstruction: GEMINI_PROMPTS.practiceSystem,
    validator: (data) => PracticeQuizSchema.parse(data) as PracticeQuizOutput,
    temperature: 0.2,
    maxTokens: 8192,
    feature: "practice_generation",
  });

  return result.data;
}

export async function generateHint(input: HintGenerationInput): Promise<HintOutput> {
  const { question, studentAttempt = "", topic = "" } = input;

  const prompt = `Generate a pedagogical hint for a student struggling with this question.
Question: ${question}
${studentAttempt ? `Student's Incorrect Attempt: ${studentAttempt}` : ""}
${topic ? `Topic: ${topic}` : ""}

Return a JSON object:
{
  "hint": "A subtle, thoughtful nudge that activates conceptual memory without directly giving away the answer",
  "guidingQuestion": "A leading question to encourage self-discovery",
  "relevantConcept": "The foundational principle at play"
}`;

  const result = await routerGenerateStructured<HintOutput>({
    prompt,
    systemInstruction:
      "You are an expert Socratic tutor. Provide guidance that helps students think for themselves without revealing the answer.",
    validator: (data) => HintOutputSchema.parse(data) as HintOutput,
    temperature: 0.3,
    maxTokens: 1024,
    feature: "hint_generation",
  });

  return result.data;
}
