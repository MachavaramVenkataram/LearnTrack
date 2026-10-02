/**
 * LearnTrack Spaced Repetition Engine (SM-2 / Leitner Hybrid)
 *
 * Deterministic scheduling engine calculating interval progressions, ease factors,
 * repetition counts, lapses, and learning state transitions for active-recall flashcards.
 *
 * States:
 * - 'new': Card created, never reviewed.
 * - 'learning': Short interval learning phase (reset or newly introduced).
 * - 'review': Active retention phase with expanding intervals.
 * - 'mastered': High-retention cards (repetitions >= 4 and interval >= 14 days).
 *
 * Ratings:
 * - 'again' (1): Failed recall ("I forgot"). Reps reset, interval = 1d, ease penalty -0.20, lapse incremented.
 * - 'hard'  (2): Strenuous recall ("I barely remembered"). Reps incremented, interval gentle 1.2x, ease penalty -0.15.
 * - 'good'  (3): Successful recall ("I remembered"). Reps incremented, interval SM-2 scaled, ease factor maintained.
 * - 'easy'  (4): Effortless recall ("I knew it immediately"). Reps incremented, interval boosted 1.3x, ease bonus +0.15.
 */

import { Flashcard, FlashcardRating, FlashcardState } from "@/types/learning";

export const MIN_EASE_FACTOR = 1.30;
export const DEFAULT_EASE_FACTOR = 2.50;
export const MAX_EASE_FACTOR = 3.00;

export interface SchedulingResult {
  state: FlashcardState;
  interval_days: number;
  ease_factor: number;
  reps: number;
  lapses: number;
  due_date: string; // YYYY-MM-DD
  due_at: string;   // ISO timestamp
  last_reviewed_at: string;
}

/**
 * Standardize rating strings for backwards compatibility.
 */
export function normalizeRating(rating: FlashcardRating): "again" | "hard" | "good" | "easy" {
  if (rating === "again") return "again";
  if (rating === "hard") return "hard";
  if (rating === "good" || rating === "review") return "good";
  if (rating === "easy" || rating === "know") return "easy";
  return "good";
}

/**
 * Calculates the next spaced repetition schedule for a flashcard.
 */
export function calculateNextReview(
  card: Pick<Flashcard, "state" | "interval_days" | "ease_factor" | "reps" | "lapses">,
  rating: FlashcardRating,
  currentDate: Date = new Date()
): SchedulingResult {
  const normRating = normalizeRating(rating);

  let interval_days = card.interval_days || 1;
  let ease_factor = card.ease_factor || DEFAULT_EASE_FACTOR;
  let reps = card.reps || 0;
  let lapses = card.lapses || 0;
  let state: FlashcardState = card.state || "new";

  switch (normRating) {
    case "again": {
      // Complete lapse: reset repetitions, increment lapse count, drop ease factor
      reps = 0;
      lapses += 1;
      interval_days = 1;
      ease_factor = Math.max(MIN_EASE_FACTOR, Math.round((ease_factor - 0.20) * 100) / 100);
      state = "learning";
      break;
    }

    case "hard": {
      // Strenuous recall: increment repetition, reduce ease factor, shorter interval growth
      reps += 1;
      ease_factor = Math.max(MIN_EASE_FACTOR, Math.round((ease_factor - 0.15) * 100) / 100);

      if (reps <= 1) {
        interval_days = 1;
      } else if (reps === 2) {
        interval_days = 2;
      } else {
        interval_days = Math.max(1, Math.round(interval_days * 1.20));
      }

      state = reps >= 2 ? "review" : "learning";
      break;
    }

    case "good": {
      // Successful recall: standard SM-2 intervals (1d -> 3d -> 7d -> interval * ease)
      reps += 1;

      if (reps === 1) {
        interval_days = 1;
      } else if (reps === 2) {
        interval_days = 3;
      } else if (reps === 3) {
        interval_days = 7;
      } else {
        interval_days = Math.max(1, Math.round(interval_days * ease_factor));
      }

      // Check mastery condition
      if (reps >= 4 && interval_days >= 14) {
        state = "mastered";
      } else {
        state = "review";
      }
      break;
    }

    case "easy": {
      // Effortless recall: accelerated interval + ease bonus (+0.15)
      reps += 1;
      ease_factor = Math.min(MAX_EASE_FACTOR, Math.round((ease_factor + 0.15) * 100) / 100);

      if (reps === 1) {
        interval_days = 3;
      } else if (reps === 2) {
        interval_days = 6;
      } else if (reps === 3) {
        interval_days = 14;
      } else {
        interval_days = Math.max(1, Math.round(interval_days * ease_factor * 1.30));
      }

      // Reaching mastery faster with easy ratings
      if (reps >= 3 && interval_days >= 14) {
        state = "mastered";
      } else {
        state = "review";
      }
      break;
    }
  }

  // Calculate target due date
  const nextDueDate = new Date(currentDate.getTime());
  nextDueDate.setDate(nextDueDate.getDate() + interval_days);
  const due_date = nextDueDate.toISOString().split("T")[0];
  const due_at = nextDueDate.toISOString();
  const last_reviewed_at = currentDate.toISOString();

  return {
    state,
    interval_days,
    ease_factor,
    reps,
    lapses,
    due_date,
    due_at,
    last_reviewed_at,
  };
}

/**
 * Returns human-readable label and preview for the given rating button.
 */
export function getRatingMeta(rating: FlashcardRating, card?: Pick<Flashcard, "state" | "interval_days" | "ease_factor" | "reps" | "lapses">) {
  const norm = normalizeRating(rating);
  let nextIntervalDays = 1;

  if (card) {
    const next = calculateNextReview(card, norm);
    nextIntervalDays = next.interval_days;
  }

  switch (norm) {
    case "again":
      return {
        key: "again" as const,
        label: "Again",
        subtitle: "I forgot",
        shortcut: "1",
        intervalPreview: card ? formatInterval(nextIntervalDays) : "1d",
        colorClass: "rose",
      };
    case "hard":
      return {
        key: "hard" as const,
        label: "Hard",
        subtitle: "Barely remembered",
        shortcut: "2",
        intervalPreview: card ? formatInterval(nextIntervalDays) : "2d",
        colorClass: "amber",
      };
    case "good":
      return {
        key: "good" as const,
        label: "Good",
        subtitle: "Remembered",
        shortcut: "3",
        intervalPreview: card ? formatInterval(nextIntervalDays) : "3-7d",
        colorClass: "blue",
      };
    case "easy":
      return {
        key: "easy" as const,
        label: "Easy",
        subtitle: "Instant recall",
        shortcut: "4",
        intervalPreview: card ? formatInterval(nextIntervalDays) : "6-14d",
        colorClass: "emerald",
      };
  }
}

/**
 * Human-readable interval formatting.
 */
export function formatInterval(days: number): string {
  if (days <= 0) return "< 1 day";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
  }
  const months = Math.round(days / 30);
  return `${months} ${months === 1 ? "month" : "months"}`;
}

/**
 * Determines whether a card is currently due.
 */
export function isCardDue(card: Pick<Flashcard, "due_date" | "state">, todayStr?: string): boolean {
  const today = todayStr || new Date().toISOString().split("T")[0];
  if (card.state === "new") return true;
  return Boolean(card.due_date && card.due_date <= today);
}

/**
 * Estimates remaining study time based on card count.
 * Average active-recall contemplation + flip: ~24 seconds per card.
 */
export function estimateReviewTimeMinutes(cardCount: number): number {
  if (cardCount <= 0) return 0;
  return Math.max(1, Math.round((cardCount * 25) / 60));
}

/**
 * Calculates genuine session retention percentage from review outcomes.
 * Good + Easy are considered retained; Again + Hard need reinforcement.
 */
export function calculateSessionRetention(outcomes: {
  again: number;
  hard: number;
  good: number;
  easy: number;
}): number {
  const total = outcomes.again + outcomes.hard + outcomes.good + outcomes.easy;
  if (total === 0) return 100;
  const successful = outcomes.good + outcomes.easy;
  return Math.round((successful / total) * 100);
}
