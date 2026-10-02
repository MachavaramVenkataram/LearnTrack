/**
 * LearnTrack Flashcard Quality & Duplicate Validation Engine
 *
 * Implements the 10 pedagogical quality rules, response sanitization,
 * and duplicate detection for active-recall flashcards.
 */

import { FlashcardDifficulty, FlashcardType } from "@/types/learning";

export interface CardQualityAssessment {
  isValid: boolean;
  status: "high_quality" | "needs_review" | "invalid";
  score: number; // 0 to 100
  issues: string[];
  rulesPassed: number;
  totalRules: number;
}

export interface CandidateCardInput {
  question: string;
  answer: string;
  explanation?: string;
  example?: string;
  hint?: string;
  difficulty?: string;
  card_type?: string;
  topic?: string;
  source_reference?: string;
}

const VALID_DIFFICULTIES: FlashcardDifficulty[] = ["easy", "medium", "hard"];
const VALID_TYPES: FlashcardType[] = [
  "concept",
  "definition",
  "application",
  "comparison",
  "problem_solving",
  "cause_effect",
  "scenario",
  "formula",
  "exam_style",
  "code",
  "mixed",
];

/**
 * Normalizes text: trims, collapses multiple spaces, strips surrounding quotes,
 * and removes accidental markdown bold/italic headers like "**Question:**".
 */
export function sanitizeCardText(text: string | undefined | null): string {
  if (!text) return "";
  const clean = text
    .replace(/^(\*\*|__)?(question|q|front|prompt|answer|a|back|explanation|hint):(\*\*|__)?\s*/i, "")
    .replace(/^["'`]|["'`]$/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
  return clean;
}

/**
 * Simple tokenization for similarity comparison.
 */
function tokenize(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  return new Set(words);
}

/**
 * Calculates Jaccard similarity between two texts based on word tokens.
 */
export function calculateTextSimilarity(a: string, b: string): number {
  const setA = tokenize(a);
  const setB = tokenize(b);

  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Checks if a candidate question is duplicate or near-duplicate of existing questions.
 */
export function checkDuplicate(
  candidateQuestion: string,
  existingQuestions: string[],
  threshold = 0.70
): { isDuplicate: boolean; matchedQuestion?: string; similarity: number } {
  const cleanCandidate = sanitizeCardText(candidateQuestion).toLowerCase();
  if (!cleanCandidate) return { isDuplicate: false, similarity: 0 };

  for (const existing of existingQuestions) {
    const cleanExisting = sanitizeCardText(existing).toLowerCase();

    // Exact match
    if (cleanCandidate === cleanExisting) {
      return { isDuplicate: true, matchedQuestion: existing, similarity: 1.0 };
    }

    // High token similarity
    const sim = calculateTextSimilarity(cleanCandidate, cleanExisting);
    if (sim >= threshold) {
      return { isDuplicate: true, matchedQuestion: existing, similarity: Math.round(sim * 100) / 100 };
    }
  }

  return { isDuplicate: false, similarity: 0 };
}

/**
 * Evaluates a candidate flashcard against the 10 LearnTrack Card Quality Rules.
 */
export function evaluateCardQuality(
  card: CandidateCardInput,
  existingQuestions: string[] = []
): CardQualityAssessment {
  const question = sanitizeCardText(card.question);
  const answer = sanitizeCardText(card.answer);
  const explanation = sanitizeCardText(card.explanation);
  const hint = sanitizeCardText(card.hint);

  const issues: string[] = [];
  let score = 100;
  let rulesPassed = 0;
  const totalRules = 10;

  // 1. Is question present and specific?
  if (!question || question.length < 12) {
    issues.push("Question is too short or missing specific context.");
    score -= 25;
  } else if (!question.includes("?") && !/^(explain|describe|compare|state|calculate|derive|define)/i.test(question)) {
    issues.push("Question lacks a clear question mark or directive prompt.");
    score -= 10;
  } else {
    rulesPassed++;
  }

  // 2. Is there exactly one clear learning objective?
  const multiQuestionCount = (question.match(/\?/g) || []).length;
  if (multiQuestionCount > 1 || /\b(and also explain|moreover what is)\b/i.test(question)) {
    issues.push("Card combines multiple divergent questions into one.");
    score -= 15;
  } else {
    rulesPassed++;
  }

  // 3. Is the answer present and non-empty?
  if (!answer || answer.length < 5) {
    issues.push("Answer is missing or empty.");
    score -= 30;
  } else {
    rulesPassed++;
  }

  // 4. Does the question require active recall rather than verbatim copying?
  if (/^true or false:\s+/i.test(question) && answer.length < 8) {
    issues.push("Question is a shallow true/false prompt rather than active recall.");
    score -= 10;
  } else {
    rulesPassed++;
  }

  // 5. Is the answer concise? (Under 600 characters for high readability)
  if (answer.length > 600) {
    issues.push("Answer is excessively long; condense to key conceptual mechanisms.");
    score -= 10;
  } else {
    rulesPassed++;
  }

  // 6. Is the explanation useful? (Does not simply repeat the answer)
  if (explanation && calculateTextSimilarity(explanation, answer) > 0.85) {
    issues.push("Explanation simply repeats the answer without adding pedagogical context.");
    score -= 10;
  } else {
    rulesPassed++;
  }

  // 7. Is the difficulty appropriate?
  const diff = (card.difficulty || "medium").toLowerCase() as FlashcardDifficulty;
  if (!VALID_DIFFICULTIES.includes(diff)) {
    issues.push(`Difficulty "${card.difficulty}" is invalid.`);
    score -= 5;
  } else {
    rulesPassed++;
  }

  // 8. Is this card substantially different from existing cards? (Duplicate detection)
  const dupCheck = checkDuplicate(question, existingQuestions);
  if (dupCheck.isDuplicate) {
    issues.push(`This concept is already covered in your deck ("${dupCheck.matchedQuestion}").`);
    score -= 20;
  } else {
    rulesPassed++;
  }

  // 9. Does it contain enough context? Avoid trivial placeholders like "What is the principal objective of X?"
  if (
    /What is the principal objective of /i.test(question) &&
    /To model underlying patterns/i.test(answer)
  ) {
    issues.push("Generic placeholder detected. Questions must test specific concepts.");
    score -= 25;
  } else {
    rulesPassed++;
  }

  // 10. Does hint help retrieval without giving away the exact answer?
  if (hint && calculateTextSimilarity(hint, answer) > 0.80) {
    issues.push("Hint gives away the answer too directly.");
    score -= 10;
  } else {
    rulesPassed++;
  }

  score = Math.max(0, Math.min(100, score));

  const isValid = Boolean(question && answer && issues.filter((i) => i.includes("missing")).length === 0);
  let status: "high_quality" | "needs_review" | "invalid" = "high_quality";

  if (!isValid || score < 50) {
    status = "invalid";
  } else if (score < 80 || issues.length > 0) {
    status = "needs_review";
  }

  return {
    isValid,
    status,
    score,
    issues,
    rulesPassed,
    totalRules,
  };
}

/**
 * Validates and sanitizes a list of generated cards from AI.
 */
export function sanitizeAndValidateGeneratedCards(
  rawCards: Array<Record<string, unknown>>,
  existingQuestions: string[] = []
): {
  validCards: Array<CandidateCardInput & { quality: CardQualityAssessment }>;
  rejectedCount: number;
} {
  const validCards: Array<CandidateCardInput & { quality: CardQualityAssessment }> = [];
  let rejectedCount = 0;
  const seenQuestions = [...existingQuestions];

  for (const raw of rawCards) {
    const rawQ = typeof raw.question === "string" ? raw.question : typeof raw.front === "string" ? raw.front : "";
    const rawA = typeof raw.answer === "string" ? raw.answer : typeof raw.back === "string" ? raw.back : "";
    const rawExp = typeof raw.explanation === "string" ? raw.explanation : "";
    const rawEx = typeof raw.example === "string" ? raw.example : "";
    const rawH = typeof raw.hint === "string" ? raw.hint : "";
    const rawT = typeof raw.topic === "string" ? raw.topic : "General";
    const rawSrc = typeof raw.source_reference === "string" ? raw.source_reference : typeof raw.source === "string" ? raw.source : "";

    const question = sanitizeCardText(rawQ);
    const answer = sanitizeCardText(rawA);
    const explanation = sanitizeCardText(rawExp);
    const example = sanitizeCardText(rawEx);
    const hint = sanitizeCardText(rawH);
    const topic = sanitizeCardText(rawT) || "General";
    const source_reference = sanitizeCardText(rawSrc);

    const rawDiff = typeof raw.difficulty === "string" ? raw.difficulty.toLowerCase() : "medium";
    const rawType = typeof raw.card_type === "string" ? raw.card_type.toLowerCase() : "concept";
    const difficulty = rawDiff as FlashcardDifficulty;
    const card_type = rawType as FlashcardType;

    const candidate: CandidateCardInput = {
      question,
      answer,
      explanation,
      example,
      hint,
      difficulty: VALID_DIFFICULTIES.includes(difficulty) ? difficulty : "medium",
      card_type: VALID_TYPES.includes(card_type) ? card_type : "concept",
      topic,
      source_reference,
    };

    const quality = evaluateCardQuality(candidate, seenQuestions);

    if (quality.isValid && quality.status !== "invalid") {
      validCards.push({ ...candidate, quality });
      seenQuestions.push(question);
    } else {
      rejectedCount++;
    }
  }

  return { validCards, rejectedCount };
}
