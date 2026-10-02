"use client";

import React, { useMemo } from "react";
import { Zap, ArrowRight, Sparkles, CheckCircle2, Flame, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Flashcard, FlashcardDeck } from "@/types/learning";
import { estimateReviewTimeMinutes } from "@/lib/flashcards/scheduler";

interface LearningCommandBarProps {
  cards: Flashcard[];
  decks: FlashcardDeck[];
  dueCards: Flashcard[];
  learningCards: Flashcard[];
  onStartReview: (deckId?: string, filter?: string) => void;
  onOpenGenerate: (deckId?: string) => void;
}

export function LearningCommandBar({
  cards,
  decks,
  dueCards,
  learningCards,
  onStartReview,
  onOpenGenerate,
}: LearningCommandBarProps) {
  // Deterministic recommendation derived from real database counts
  const recommendation = useMemo(() => {
    // 1. High priority: Due cards need immediate review
    if (dueCards.length > 0) {
      const estMinutes = estimateReviewTimeMinutes(dueCards.length);
      // Find the deck with the most due cards to be specific if applicable
      const deckWithMostDue = decks
        .filter((d) => (d.due_count || 0) > 0)
        .sort((a, b) => (b.due_count || 0) - (a.due_count || 0))[0];

      return {
        badge: "Due Today",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
        title: `${dueCards.length} flashcard${dueCards.length === 1 ? "" : "s"} due for active recall`,
        description:
          deckWithMostDue && deckWithMostDue.due_count === dueCards.length
            ? `Complete a ${estMinutes}-minute review of "${deckWithMostDue.title}" to protect your memory retention.`
            : `Complete a ${estMinutes}-minute review session across your decks to halt forgetting curve degradation.`,
        actionLabel: "Start Review",
        actionIcon: <ArrowRight className="w-3.5 h-3.5 ml-1.5" />,
        actionVariant: "primary" as const,
        actionClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-soft-sm",
        onClick: () => onStartReview(undefined, "due"),
      };
    }

    // 2. Medium priority: Cards in learning stage that could use reinforcement
    if (learningCards.length > 0) {
      return {
        badge: "Learning Phase",
        badgeColor: "bg-orange-50 text-orange-700 border-orange-200",
        title: "All scheduled cards completed! Reinforce learning items",
        description: `You have ${learningCards.length} card${learningCards.length === 1 ? "" : "s"} in the short-interval learning stage. Practice them now to accelerate mastery.`,
        actionLabel: "Practice Learning Cards",
        actionIcon: <Flame className="w-3.5 h-3.5 ml-1.5 text-orange-400" />,
        actionVariant: "primary" as const,
        actionClass: "bg-orange-600 hover:bg-orange-700 text-white shadow-soft-sm",
        onClick: () => onStartReview(undefined, "learning"),
      };
    }

    // 3. Lowest retention deck needs attention
    const lowestMasteryDeck = decks
      .filter((d) => (d.card_count || 0) > 0)
      .map((d) => ({
        ...d,
        masteryPct: Math.round(((d.mastered_count || 0) / (d.card_count || 1)) * 100),
      }))
      .sort((a, b) => a.masteryPct - b.masteryPct)[0];

    if (lowestMasteryDeck && lowestMasteryDeck.masteryPct < 70) {
      return {
        badge: "Strengthen Deck",
        badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
        title: `Strengthen "${lowestMasteryDeck.title}" (Mastery: ${lowestMasteryDeck.masteryPct}%)`,
        description: `This deck currently has lower retention. Run an extra practice session to reinforce difficult topics.`,
        actionLabel: `Practice ${lowestMasteryDeck.title}`,
        actionIcon: <ArrowRight className="w-3.5 h-3.5 ml-1.5" />,
        actionVariant: "outline" as const,
        actionClass: "bg-white text-purple-700 border-purple-200 hover:bg-purple-50",
        onClick: () => onStartReview(lowestMasteryDeck.id, "all"),
      };
    }

    // 4. Default: All caught up! Suggest adding or synthesizing new material
    return {
      badge: "Caught Up",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      title: "You're completely on track with your spaced repetition schedule!",
      description: "All cards are retained past their optimal interval. Synthesize new concept cards or generate a deck with AI.",
      actionLabel: "Generate New Cards",
      actionIcon: <Sparkles className="w-3.5 h-3.5 ml-1.5 text-purple-500" />,
      actionVariant: "primary" as const,
      actionClass: "bg-purple-600 hover:bg-purple-700 text-white shadow-soft-sm",
      onClick: () => onOpenGenerate(),
    };
  }, [dueCards, learningCards, decks, onStartReview, onOpenGenerate]);

  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/40 via-indigo-50/20 to-white p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Your Next Best Action
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${recommendation.badgeColor}`}>
                {recommendation.badge}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {recommendation.title}
            </h3>

            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              {recommendation.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center pl-12 sm:pl-0">
          <Button
            size="sm"
            onClick={recommendation.onClick}
            className={`text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center ${recommendation.actionClass}`}
          >
            <span>{recommendation.actionLabel}</span>
            {recommendation.actionIcon}
          </Button>
        </div>
      </div>
    </div>
  );
}
