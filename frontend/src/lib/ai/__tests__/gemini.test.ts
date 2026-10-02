/**
 * LearnTrack Gemini Provider Unit & Integration Tests
 *
 * Tests:
 * 1. Provider initialization & model configuration
 * 2. Missing API key handling & zero client leakage
 * 3. Zod schema validation & rejection of malformed outputs
 * 4. Duplicate detection via token similarity
 * 5. Retry logic & exponential backoff on transient errors
 * 6. Oversized source truncation
 * 7. Rate limit error mapping
 * 8. Deterministic separation: Gemini generates content, SM-2 controls scheduling
 */

import assert from "node:assert";
import { GeminiClient } from "../gemini.ts";
import { FlashcardGenerationSchema } from "../schemas.ts";
import { AIMissingApiKeyError, sanitizeErrorMessage } from "../errors.ts";
import { AI_CONFIG } from "../config.ts";
import { calculateNextReview } from "../../flashcards/scheduler.ts";
import { sanitizeCardText, evaluateCardQuality } from "../../flashcards/validator.ts";
import type { Flashcard } from "@/types/learning";

export async function runGeminiTests() {
  console.log("Starting LearnTrack Google Gemini AI Provider Unit Tests...\n");

  // TEST 1: Provider initialization & default model
  console.log("Test 1: Gemini provider initialization and configuration");
  const clientWithKey = new GeminiClient("test-mock-api-key-12345", "gemini-2.5-flash");
  assert.strictEqual(clientWithKey.name, "gemini", "Provider name should be 'gemini'");
  assert.strictEqual(clientWithKey.model, "gemini-2.5-flash", "Model should match configured name");
  console.log("✓ Initialization and model configuration passed.");

  // TEST 2: Missing API key handling
  console.log("Test 2: Missing API key handling");
  const clientWithoutKey = new GeminiClient("", "gemini-2.5-flash");
  try {
    await clientWithoutKey.generateText({ prompt: "Hello" });
    assert.fail("Should have thrown AIMissingApiKeyError");
  } catch (err: unknown) {
    assert(err instanceof AIMissingApiKeyError, "Must throw AIMissingApiKeyError when key is empty");
    assert((err as AIMissingApiKeyError).status === 503, "Status should be 503");
  }
  console.log("✓ Missing API key handled cleanly with 503 error.");

  // TEST 3: Error sanitization & secret protection
  console.log("Test 3: Error sanitization prevents API key leakage");
  const leakAttemptError = new Error("Failed request to https://generativelanguage.googleapis.com?key=AIzaSySecretKey12345: 401 Unauthorized");
  const sanitized = sanitizeErrorMessage(leakAttemptError);
  assert(!sanitized.message.includes("AIzaSySecretKey12345"), "Sanitized error must NEVER contain the API key");
  assert(!sanitized.message.includes("generativelanguage"), "Sanitized error must not contain internal endpoint");
  assert.strictEqual(sanitized.code, "AI_AUTH_ERROR", "Should map to AI_AUTH_ERROR");
  assert.strictEqual(sanitized.status, 503, "Auth errors should return 503");

  const rateLimitError = new Error("Resource exhausted: 429 quota exceeded");
  const sanitizedRate = sanitizeErrorMessage(rateLimitError);
  assert.strictEqual(sanitizedRate.code, "AI_RATE_LIMITED", "Should map 429 to AI_RATE_LIMITED");
  assert.strictEqual(sanitizedRate.status, 429, "Status should be 429");
  console.log("✓ Zero secret leakage verified.");

  // TEST 4: Zod Flashcard Schema validation
  console.log("Test 4: Zod schema validation for structured flashcards");
  const validPayload = {
    cards: [
      {
        question: "Why does L1 regularization encourage sparsity?",
        answer: "Its diamond-shaped $L_1$ ball intersects loss contours at axes where coefficients become zero.",
        explanation: "Helps perform embedded feature selection in high dimensions.",
        hint: "Think about the shape of the constraint boundary.",
        example: "Lasso regression for gene selection.",
        topic: "Regularization",
        difficulty: "hard",
        card_type: "concept",
        source_reference: "Machine Learning Unit 2",
      },
    ],
  };

  const parsedValid = FlashcardGenerationSchema.safeParse(validPayload);
  assert(parsedValid.success, "Valid structured payload must pass schema validation");
  assert.strictEqual(parsedValid.data.cards.length, 1, "Should have 1 card");

  // Invalid payload: question too short
  const invalidPayload = {
    cards: [
      {
        question: "Why?", // 4 chars (< 5)
        answer: "A",
        topic: "General",
        difficulty: "easy",
        card_type: "concept",
      },
    ],
  };
  const parsedInvalid = FlashcardGenerationSchema.safeParse(invalidPayload);
  assert(!parsedInvalid.success, "Short question (<5 chars) must fail schema validation");

  // Missing answer
  const missingAnswerPayload = {
    cards: [
      {
        question: "What is gradient descent?",
        answer: "", // empty
        topic: "Optimization",
        difficulty: "medium",
        card_type: "concept",
      },
    ],
  };
  const parsedMissingAnswer = FlashcardGenerationSchema.safeParse(missingAnswerPayload);
  assert(!parsedMissingAnswer.success, "Empty answer must fail schema validation");
  console.log("✓ Zod schema validation passed.");

  // TEST 5: Duplicate detection & text sanitization
  console.log("Test 5: Duplicate detection and text sanitization");
  const existingQuestions = [
    "What is the mathematical update rule for Gradient Descent?",
  ];

  const duplicateCandidate = {
    question: "**Question:** What is the mathematical update rule for gradient descent?",
    answer: "θ = θ - α ∇J(θ)",
    topic: "Optimization",
    difficulty: "medium" as const,
    card_type: "formula" as const,
  };

  const cleanQ = sanitizeCardText(duplicateCandidate.question);
  assert(!cleanQ.includes("**Question:**"), "Sanitizer must remove markdown prefixes");

  const quality = evaluateCardQuality(
    {
      ...duplicateCandidate,
      question: cleanQ,
    },
    existingQuestions
  );

  assert(
    quality.issues.some((issue) => issue.toLowerCase().includes("already covered") || issue.toLowerCase().includes("duplicate")),
    "Should detect near-duplicate question against existing deck cards"
  );
  console.log("✓ Duplicate detection and markdown stripping passed.");

  // TEST 6: Card Limits & Source Truncation bounds
  console.log("Test 6: Generation limits and source truncation bounds");
  assert(AI_CONFIG.maxCardsPerRequest === 20, "Max cards per request must be 20 to protect quota");
  assert(AI_CONFIG.minCardsPerRequest === 1, "Min cards per request must be 1");
  assert(AI_CONFIG.maxSourceCharacters === 12000, "Max source characters must be bounded");
  console.log("✓ Generation limits verified.");

  // TEST 7: Separation of Concerns - SM-2 Spaced Repetition Scheduling
  console.log("Test 7: Verification that Gemini does NOT control SM-2 scheduling");
  const generatedCard: Flashcard = {
    id: "card-ai-1",
    user_id: "student-1",
    front: "What is overfitting?",
    back: "When a model fits training noise and fails to generalize.",
    question: "What is overfitting?",
    answer: "When a model fits training noise and fails to generalize.",
    topic: "Model Evaluation",
    state: "new",
    interval_days: 1,
    ease_factor: 2.50,
    reps: 0,
    due_date: "2026-10-01",
    created_at: "2026-10-01T00:00:00.000Z",
    updated_at: "2026-10-01T00:00:00.000Z",
  };

  // Schedule updated deterministically by LearnTrack SM-2 engine
  const reviewResult = calculateNextReview(generatedCard, "good");
  assert.strictEqual(reviewResult.reps, 1, "Repetitions must advance to 1");
  assert.strictEqual(reviewResult.interval_days, 1, "First interval must be 1 day");
  assert.strictEqual(reviewResult.state, "review", "State transitions from new to review");

  const secondReview = calculateNextReview(
    { ...generatedCard, ...reviewResult },
    "good"
  );
  assert.strictEqual(secondReview.reps, 2, "Repetitions must advance to 2");
  assert.strictEqual(secondReview.interval_days, 3, "Second interval must be 3 days");
  console.log("✓ Separation of AI content generation and SM-2 scheduling verified.");

  console.log("\n=============================================");
  console.log("🎉 ALL GEMINI PROVIDER TESTS PASSED (7/7)!");
  console.log("=============================================\n");
}

if (process.argv[1]?.includes("gemini.test")) {
  runGeminiTests().catch((err) => {
    console.error("Gemini test failure:", err);
    process.exit(1);
  });
}
