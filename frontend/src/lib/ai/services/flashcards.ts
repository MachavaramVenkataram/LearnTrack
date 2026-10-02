/**
 * LearnTrack Flashcard Generation Service
 *
 * Generates active-recall, source-grounded flashcards using the central AI router.
 * Performs 10-rule quality filtering and duplicate deduplication before returning.
 */

import { routerGenerateStructured } from "../router";
import { GEMINI_PROMPTS } from "../gemini/prompts";
import { FlashcardGenerationSchema } from "../validation/schemas";
import { FlashcardGenerationInput, FlashcardGenerationOutput, GeneratedCardOutput } from "../types";
import { AI_CONFIG } from "../config";
import { evaluateCardQuality, sanitizeCardText } from "@/lib/flashcards/validator";

function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateFlashcards(
  input: FlashcardGenerationInput
): Promise<FlashcardGenerationOutput> {
  const {
    subject,
    topic,
    difficulty = "medium",
    count = AI_CONFIG.defaultCardCount,
    cardType = "concept",
    learningGoal = "understand",
    sourceText = "",
    sourceReference = "",
    existingQuestions = [],
  } = input;

  const startTime = Date.now();
  const safeCount = Math.max(
    AI_CONFIG.minCardsPerRequest,
    Math.min(count, AI_CONFIG.maxCardsPerRequest)
  );

  const cleanSubject = subject.trim() || "General Subject";
  const cleanTopic = topic.trim() || "General Topic";

  const userPrompt = `Generate exactly ${safeCount} high-yield active-recall flashcards.
Target Subject: ${cleanSubject}
Core Topic: ${cleanTopic}
Requested Difficulty: ${difficulty}
Requested Card Type: ${cardType}
Primary Learning Objective: ${learningGoal}
${sourceReference ? `Source Reference: ${sourceReference}` : ""}

${sourceText ? `### Grounding Source Material:\n${sourceText.slice(0, AI_CONFIG.maxSourceCharacters)}\n` : ""}

Return a JSON object strictly adhering to this structure:
{
  "cards": [
    {
      "question": "Clear, specific recall question testing one concept",
      "answer": "Accurate, concise, and complete answer",
      "explanation": "Brief explanation of why the answer is correct",
      "hint": "Subtle memory cue that does not reveal the answer",
      "example": "Brief practical example or formula if relevant",
      "topic": "${cleanTopic}",
      "difficulty": "${difficulty === "mixed" ? "medium" : difficulty}",
      "card_type": "${cardType === "mixed" ? "concept" : cardType}",
      "source_reference": "${sourceReference || cleanTopic}"
    }
  ]
}`;

  const result = await routerGenerateStructured<{ cards: GeneratedCardOutput[] }>({
    prompt: userPrompt,
    systemInstruction: GEMINI_PROMPTS.flashcardSystem,
    validator: (data) => FlashcardGenerationSchema.parse(data) as { cards: GeneratedCardOutput[] },
    temperature: 0.2,
    maxTokens: 8192,
    feature: "flashcard_generation",
  });

  const rawCards = result.data.cards || [];
  const normalizedExisting = new Set(existingQuestions.map(normalizeForComparison));
  const seenInBatch = new Set<string>();

  const validCards: GeneratedCardOutput[] = [];
  let rejectedCount = 0;
  let duplicateCount = 0;

  for (const card of rawCards) {
    const normQ = normalizeForComparison(card.question);

    if (normalizedExisting.has(normQ) || seenInBatch.has(normQ)) {
      duplicateCount++;
      continue;
    }

    const quality = evaluateCardQuality({
      question: card.question,
      answer: card.answer,
      topic: card.topic || cleanTopic,
      difficulty: card.difficulty,
    });

    if (!quality.isValid) {
      rejectedCount++;
      continue;
    }

    seenInBatch.add(normQ);
    validCards.push({
      question: sanitizeCardText(card.question),
      answer: sanitizeCardText(card.answer),
      explanation: card.explanation ? sanitizeCardText(card.explanation) : undefined,
      hint: card.hint ? sanitizeCardText(card.hint) : undefined,
      example: card.example ? sanitizeCardText(card.example) : undefined,
      topic: card.topic || cleanTopic,
      difficulty: card.difficulty,
      card_type: card.card_type,
      source_reference: sourceReference || card.source_reference,
      front: sanitizeCardText(card.question),
      back: sanitizeCardText(card.answer),
    });
  }

  return {
    cards: validCards,
    metadata: {
      provider: result.provider,
      model: result.model,
      generatedCount: rawCards.length,
      validCount: validCards.length,
      rejectedCount,
      duplicateCount,
      durationMs: Date.now() - startTime,
    },
  };
}
