import assert from "node:assert/strict";
import {
  calculateNextReview,
  formatInterval,
  isCardDue,
  estimateReviewTimeMinutes,
  calculateSessionRetention,
  MIN_EASE_FACTOR,
  MAX_EASE_FACTOR,
} from "../scheduler";
import { Flashcard } from "@/types/learning";

console.log("Starting LearnTrack Spaced Repetition Engine Unit Tests...");

// Base test card
const baseCard: Flashcard = {
  id: "test-card-1",
  user_id: "user-1",
  front: "What is overfitting?",
  back: "When a model learns training data noise too closely and fails to generalize.",
  topic: "Machine Learning",
  state: "new",
  interval_days: 1,
  ease_factor: 2.50,
  reps: 0,
  lapses: 0,
  due_date: "2026-10-01",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const fixedDate = new Date("2026-10-01T12:00:00Z");

// TEST 1: New card rated "good"
{
  const next = calculateNextReview(baseCard, "good", fixedDate);
  assert.equal(next.reps, 1, "Reps should increment to 1");
  assert.equal(next.interval_days, 1, "First good review interval should be 1 day");
  assert.equal(next.ease_factor, 2.50, "Ease factor should be maintained on good");
  assert.equal(next.state, "review", "State should transition to review");
  assert.equal(next.due_date, "2026-10-02", "Due date should be +1 day");
  assert.equal(next.lapses, 0, "Lapses should be 0");
  console.log("✓ Test 1: New card rated 'good' passed");
}

// TEST 2: Second and third "good" review interval expansion
{
  let current = { ...baseCard, reps: 1, interval_days: 1, state: "review" as const };
  let next = calculateNextReview(current, "good", fixedDate);
  assert.equal(next.reps, 2);
  assert.equal(next.interval_days, 3, "Second good review should be 3 days");
  assert.equal(next.state, "review");

  current = { ...current, reps: 2, interval_days: 3 };
  next = calculateNextReview(current, "good", fixedDate);
  assert.equal(next.reps, 3);
  assert.equal(next.interval_days, 7, "Third good review should be 7 days");
  assert.equal(next.state, "review");

  // Fourth good review: 7 * 2.5 = ~18 days -> triggers mastered!
  current = { ...current, reps: 3, interval_days: 7, ease_factor: 2.50 };
  next = calculateNextReview(current, "good", fixedDate);
  assert.equal(next.reps, 4);
  assert.ok(next.interval_days >= 14, "Interval should be >= 14 days");
  assert.equal(next.state, "mastered", "Card should transition to mastered after 4 reps and >=14 days");
  console.log("✓ Test 2: Standard SM-2 interval progression & mastery passed");
}

// TEST 3: Card rated "again" (lapse)
{
  const matureCard = {
    ...baseCard,
    state: "mastered" as const,
    reps: 5,
    interval_days: 28,
    ease_factor: 2.50,
    lapses: 1,
  };

  const next = calculateNextReview(matureCard, "again", fixedDate);
  assert.equal(next.reps, 0, "Reps must reset to 0 upon lapse");
  assert.equal(next.lapses, 2, "Lapses count must increment");
  assert.equal(next.interval_days, 1, "Interval must reset to 1 day");
  assert.equal(next.ease_factor, 2.30, "Ease factor must drop by 0.20");
  assert.equal(next.state, "learning", "State must drop back to learning");
  assert.equal(next.due_date, "2026-10-02");
  console.log("✓ Test 3: Card lapse ('again') reset behavior passed");
}

// TEST 4: Card rated "hard"
{
  const card = {
    ...baseCard,
    reps: 2,
    interval_days: 4,
    ease_factor: 2.50,
  };

  const next = calculateNextReview(card, "hard", fixedDate);
  assert.equal(next.reps, 3);
  assert.equal(next.ease_factor, 2.35, "Ease factor must decrease by 0.15 on hard");
  assert.equal(next.interval_days, 5, "Hard should apply gentle 1.2x multiplier (4 * 1.2 = 5)");
  console.log("✓ Test 4: Hard rating adjustment passed");
}

// TEST 5: Card rated "easy"
{
  const card = {
    ...baseCard,
    reps: 0,
    ease_factor: 2.50,
  };

  const next = calculateNextReview(card, "easy", fixedDate);
  assert.equal(next.reps, 1);
  assert.equal(next.interval_days, 3, "Initial easy review should jump to 3 days");
  assert.equal(next.ease_factor, 2.65, "Ease factor must increase by 0.15 on easy");

  // Reaching mastery in 3 easy steps
  const card2 = { ...card, reps: 2, interval_days: 6, ease_factor: 2.65 };
  const next2 = calculateNextReview(card2, "easy", fixedDate);
  assert.equal(next2.reps, 3);
  assert.ok(next2.interval_days >= 14);
  assert.equal(next2.state, "mastered");
  console.log("✓ Test 5: Easy rating bonus & accelerated mastery passed");
}

// TEST 6: Minimum and Maximum Ease Factor clamping
{
  const lowEaseCard = { ...baseCard, ease_factor: 1.35 };
  const nextLow = calculateNextReview(lowEaseCard, "again");
  assert.equal(nextLow.ease_factor, MIN_EASE_FACTOR, "Ease factor must not drop below MIN_EASE_FACTOR (1.30)");

  const highEaseCard = { ...baseCard, ease_factor: 2.95 };
  const nextHigh = calculateNextReview(highEaseCard, "easy");
  assert.equal(nextHigh.ease_factor, MAX_EASE_FACTOR, "Ease factor must not exceed MAX_EASE_FACTOR (3.00)");
  console.log("✓ Test 6: Ease factor clamping bounds passed");
}

// TEST 7: Due date check & format helpers
{
  assert.equal(isCardDue({ state: "new", due_date: "2026-10-10" }), true, "New cards are always due");
  assert.equal(isCardDue({ state: "review", due_date: "2026-10-01" }, "2026-10-01"), true, "Today's cards are due");
  assert.equal(isCardDue({ state: "review", due_date: "2026-10-05" }, "2026-10-01"), false, "Future cards are not due");

  assert.equal(formatInterval(1), "1 day");
  assert.equal(formatInterval(3), "3 days");
  assert.equal(formatInterval(14), "2 weeks");
  assert.equal(formatInterval(60), "2 months");

  assert.equal(estimateReviewTimeMinutes(10), 4, "10 cards ~4 minutes");
  assert.equal(estimateReviewTimeMinutes(20), 8, "20 cards ~8 minutes");

  const retention = calculateSessionRetention({ again: 1, hard: 2, good: 5, easy: 2 });
  assert.equal(retention, 70, "7 / 10 retained = 70%");
  console.log("✓ Test 7: Helper utilities & retention math passed");
}

console.log("\n=======================================================");
console.log("🎉 ALL LEARNTRACK SPACED REPETITION ENGINE TESTS PASSED!");
console.log("=======================================================\n");
