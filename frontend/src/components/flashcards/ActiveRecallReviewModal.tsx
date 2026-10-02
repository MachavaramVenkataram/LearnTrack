"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  RotateCw,
  Clock,
  Sparkles,
  Award,
  Flame,
  Zap,
  BookOpen,
  Lightbulb,
  X,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Flashcard, FlashcardRating, FlashcardDeck } from "@/types/learning";
import { recordCardReview } from "@/lib/flashcards/service";
import { calculateNextReview, calculateSessionRetention } from "@/lib/flashcards/scheduler";

interface ActiveRecallReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Flashcard[];
  deckTitle?: string;
  userId: string;
  onCardReviewed?: (updatedCard: Flashcard) => void;
  onSessionComplete?: () => void;
}

export function ActiveRecallReviewModal({
  isOpen,
  onClose,
  cards,
  deckTitle = "Active Recall Session",
  userId,
  onCardReviewed,
  onSessionComplete,
}: ActiveRecallReviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [cardStartTime, setCardStartTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Session Statistics
  const [completedSession, setCompletedSession] = useState(false);
  const [outcomes, setOutcomes] = useState<{
    again: number;
    hard: number;
    good: number;
    easy: number;
  }>({ again: 0, hard: 0, good: 0, easy: 0 });

  // Reset state when opened with new cards
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setIsRevealed(false);
      setCompletedSession(false);
      setCardStartTime(Date.now());
      setOutcomes({ again: 0, hard: 0, good: 0, easy: 0 });
    }
  }, [isOpen, cards]);

  const currentCard: Flashcard | undefined = cards[currentIndex];
  const totalCount = cards.length;
  const progressPercent =
    totalCount > 0 ? Math.round(((currentIndex + (completedSession ? 1 : 0)) / totalCount) * 100) : 0;

  // Handle Answer Reveal
  const handleReveal = useCallback(() => {
    if (!isRevealed) {
      setIsRevealed(true);
    }
  }, [isRevealed]);

  // Handle SM-2 Rating Submission
  const handleRate = useCallback(
    async (rating: FlashcardRating) => {
      if (!currentCard || isSubmitting) return;
      setIsSubmitting(true);

      const responseTimeMs = Date.now() - cardStartTime;

      try {
        const result = await recordCardReview(currentCard.id, rating, responseTimeMs, userId);
        if (onCardReviewed && result?.card) {
          onCardReviewed(result.card);
        }

        // Update session counters
        setOutcomes((prev) => {
          const key = rating === "again" ? "again" : rating === "hard" ? "hard" : rating === "good" ? "good" : "easy";
          return { ...prev, [key]: prev[key] + 1 };
        });

        // Advance to next card or finish
        if (currentIndex + 1 < totalCount) {
          setCurrentIndex((prev) => prev + 1);
          setIsRevealed(false);
          setCardStartTime(Date.now());
        } else {
          setCompletedSession(true);
          if (onSessionComplete) {
            onSessionComplete();
          }
        }
      } catch (err) {
        console.error("Failed to record flashcard review:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [currentCard, isSubmitting, cardStartTime, userId, onCardReviewed, currentIndex, totalCount, onSessionComplete]
  );

  // Keyboard Shortcuts: Space / Enter to reveal, 1-4 to rate
  useEffect(() => {
    if (!isOpen || completedSession) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!isRevealed) {
          handleReveal();
        }
      } else if (isRevealed) {
        if (e.key === "1") {
          e.preventDefault();
          void handleRate("again");
        } else if (e.key === "2") {
          e.preventDefault();
          void handleRate("hard");
        } else if (e.key === "3") {
          e.preventDefault();
          void handleRate("good");
        } else if (e.key === "4") {
          e.preventDefault();
          void handleRate("easy");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isRevealed, completedSession, handleReveal, handleRate]);

  if (!isOpen) return null;

  // Session Retention calculation
  const totalReviewed = outcomes.again + outcomes.hard + outcomes.good + outcomes.easy;
  const sessionAccuracy =
    totalReviewed > 0
      ? Math.round(((outcomes.good + outcomes.easy) / totalReviewed) * 100)
      : 100;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="p-4 sm:px-6 sm:py-4 border-b border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Review</span>
          </button>

          <div className="text-center">
            <span className="text-xs font-bold text-slate-900">{deckTitle}</span>
          </div>

          <div className="text-right">
            {!completedSession && (
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                {currentIndex + 1} / {totalCount}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar Track */}
        {!completedSession && (
          <div className="w-full h-1 bg-slate-100">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-6 sm:p-10 flex-1 flex flex-col justify-center">
          {!completedSession && currentCard ? (
            <div className="space-y-6">
              {/* Question Card Front */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                    {currentCard.topic || "General Concept"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 capitalize">
                    {currentCard.difficulty} difficulty
                  </span>
                </div>

                <div className="pt-2 pb-1">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Question
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                    {currentCard.front || currentCard.question}
                  </h3>
                </div>
              </div>

              {/* Before Reveal: Reveal Answer Button */}
              {!isRevealed ? (
                <div className="pt-8 pb-4 text-center space-y-4">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleReveal}
                    className="w-full sm:w-auto px-10 py-3.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-soft-sm cursor-pointer"
                  >
                    <span>Reveal Answer</span>
                  </Button>
                  <p className="text-xs text-slate-400 font-mono">
                    ← Think before revealing (Press Space)
                  </p>
                </div>
              ) : (
                /* After Reveal: Answer & SM-2 Rating Controls */
                <div className="space-y-6 animate-in fade-in duration-200">
                  <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100/80 space-y-2">
                    <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-blue-700 block">
                      Answer
                    </span>
                    <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                      {currentCard.back || currentCard.answer}
                    </p>

                    {currentCard.explanation && (
                      <div className="pt-2 text-xs text-slate-600 border-t border-blue-100/60 leading-relaxed">
                        <span className="font-bold text-slate-800">Explanation: </span>
                        {currentCard.explanation}
                      </div>
                    )}

                    {currentCard.hint && (
                      <div className="text-[11px] text-amber-700 flex items-center gap-1.5 pt-1">
                        <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                        <span>{currentCard.hint}</span>
                      </div>
                    )}
                  </div>

                  {/* SM-2 Spaced Repetition Buttons */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 block text-center">
                      Rate Recall Difficulty (Keys 1 - 4)
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {/* 1. Again */}
                      <button
                        onClick={() => void handleRate("again")}
                        disabled={isSubmitting}
                        className="p-3 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/80 hover:border-rose-300 text-rose-800 transition-all text-center cursor-pointer group disabled:opacity-50"
                      >
                        <span className="text-xs font-bold block">Again (1)</span>
                        <span className="text-[10px] text-rose-600 block mt-0.5 font-mono">
                          &lt; 10 min
                        </span>
                      </button>

                      {/* 2. Hard */}
                      <button
                        onClick={() => void handleRate("hard")}
                        disabled={isSubmitting}
                        className="p-3 rounded-xl border border-orange-200 bg-orange-50/60 hover:bg-orange-100/80 hover:border-orange-300 text-orange-800 transition-all text-center cursor-pointer group disabled:opacity-50"
                      >
                        <span className="text-xs font-bold block">Hard (2)</span>
                        <span className="text-[10px] text-orange-600 block mt-0.5 font-mono">
                          1 day
                        </span>
                      </button>

                      {/* 3. Good */}
                      <button
                        onClick={() => void handleRate("good")}
                        disabled={isSubmitting}
                        className="p-3 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 hover:border-blue-300 text-blue-800 transition-all text-center cursor-pointer group disabled:opacity-50"
                      >
                        <span className="text-xs font-bold block">Good (3)</span>
                        <span className="text-[10px] text-blue-600 block mt-0.5 font-mono">
                          3 days
                        </span>
                      </button>

                      {/* 4. Easy */}
                      <button
                        onClick={() => void handleRate("easy")}
                        disabled={isSubmitting}
                        className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 hover:border-emerald-300 text-emerald-800 transition-all text-center cursor-pointer group disabled:opacity-50"
                      >
                        <span className="text-xs font-bold block">Easy (4)</span>
                        <span className="text-[10px] text-emerald-600 block mt-0.5 font-mono">
                          7 days
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : completedSession ? (
            /* Session Completion Screen */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-250">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
                <Award className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">Session Complete!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Excellent active recall work! Your SM-2 memory intervals have been safely recalculated.
                </p>
              </div>

              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Reviewed
                  </span>
                  <span className="text-lg font-bold text-slate-900">{totalReviewed}</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-800">
                  <span className="text-[10px] font-bold uppercase block">Accuracy</span>
                  <span className="text-lg font-bold">{sessionAccuracy}%</span>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-800">
                  <span className="text-[10px] font-bold uppercase block">Mastered</span>
                  <span className="text-lg font-bold">{outcomes.easy + outcomes.good}</span>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  variant="primary"
                  size="md"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-soft-sm cursor-pointer"
                >
                  Return to Workspace
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-xs">
              No flashcards in this review session.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
