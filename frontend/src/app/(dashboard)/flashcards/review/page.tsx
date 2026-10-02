"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Pause,
  Play,
  Settings,
  Clock,
  CheckCircle2,
  RotateCw,
  Sparkles,
  Award,
  Zap,
  BookOpen,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getFlashcards,
  getDeck,
  recordCardReview,
} from "@/lib/flashcards/service";
import { CardFlip } from "@/components/flashcards/CardFlip";
import {
  Flashcard,
  FlashcardRating,
  FlashcardDeck,
} from "@/types/learning";
import {
  estimateReviewTimeMinutes,
  calculateSessionRetention,
  isCardDue,
} from "@/lib/flashcards/scheduler";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";

function FlashcardReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = searchParams.get("deckId");
  const filterParam = searchParams.get("filter") || "due";
  const topicParam = searchParams.get("topic");

  const { user } = useAuth();
  const userId = user?.id || "demo-student";
  const { showToast } = useToast();

  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Session State
  const [isPaused, setIsPaused] = useState(false);
  const [sessionStartTime] = useState<number>(Date.now());
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  // Review Outcomes
  const [outcomes, setOutcomes] = useState<{
    again: number;
    hard: number;
    good: number;
    easy: number;
  }>({ again: 0, hard: 0, good: 0, easy: 0 });

  const [difficultCards, setDifficultCards] = useState<Flashcard[]>([]);
  const [newCardsLearnedCount, setNewCardsLearnedCount] = useState(0);

  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(true);

  // Timer loop
  useEffect(() => {
    if (sessionCompleted || isPaused) return;
    const timer = setInterval(() => {
      setSessionElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionCompleted, isPaused]);

  // Load target review cards
  const loadReviewSession = useCallback(async () => {
    setIsLoading(true);
    try {
      if (deckId) {
        const d = await getDeck(deckId, userId);
        setDeck(d);
      }

      const all = await getFlashcards(userId, {
        deckId: deckId || undefined,
        topic: topicParam || undefined,
        filter: filterParam === "all" ? undefined : (filterParam as any),
      });

      // If user requested 'due', ensure filter is applied; if none due, allow reviewing deck cards
      let sessionQueue = all;
      if (filterParam === "due") {
        const dueOnly = all.filter((c) => isCardDue(c));
        sessionQueue = dueOnly.length > 0 ? dueOnly : all;
      }

      setCards(sessionQueue);
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionCompleted(false);
    } catch (e) {
      console.error("Failed to load review session:", e);
      showToast("Error", "Could not load review session.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [deckId, filterParam, topicParam, userId, showToast]);

  useEffect(() => {
    void loadReviewSession();
  }, [loadReviewSession]);

  // Handle Card Rating
  const handleRateCard = async (rating: FlashcardRating) => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    const normRating =
      rating === "know" ? "easy" : rating === "review" ? "good" : (rating as "again" | "hard" | "good" | "easy");

    // Track outcome counts
    setOutcomes((prev) => ({
      ...prev,
      [normRating]: prev[normRating] + 1,
    }));

    if (currentCard.state === "new") {
      setNewCardsLearnedCount((prev) => prev + 1);
    }

    if (normRating === "again" || normRating === "hard") {
      setDifficultCards((prev) => [...prev, currentCard]);
    }

    // Persist to service & database
    try {
      await recordCardReview(currentCard.id, normRating, 0, userId);
    } catch (err) {
      console.error("Failed to record card review:", err);
    }

    // Advance to next card or complete session
    if (currentIndex + 1 < cards.length) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 100);
    } else {
      setSessionCompleted(true);
    }
  };

  // Start Difficult Cards Review
  const handleReviewDifficultCards = () => {
    if (difficultCards.length === 0) return;
    setCards(difficultCards);
    setDifficultCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setOutcomes({ again: 0, hard: 0, good: 0, easy: 0 });
  };

  const currentCard = cards[currentIndex];
  const progressPercent = cards.length > 0 ? Math.round(((currentIndex) / cards.length) * 100) : 0;
  const remainingCards = cards.length - currentIndex;
  const estimatedRemainingMinutes = estimateReviewTimeMinutes(remainingCards);

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins} min ${secs > 0 ? `${secs}s` : ""}`;
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-between max-w-4xl mx-auto px-4 py-4 sm:py-6">
      {/* ============================================================ */}
      {/* 1. TOP HEADER & SESSION CONTROLS */}
      {/* ============================================================ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.push(deckId ? `/flashcards/deck/${deckId}` : "/flashcards")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Exit</span>
            </button>

            <div className="h-4 w-px bg-slate-200" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {deck?.subject || "Machine Learning"}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {deck?.title || "Daily Spaced Review"}
                </span>
              </div>
            </div>
          </div>

          {/* Right Session Utilities */}
          <div className="flex items-center gap-2">
            {!sessionCompleted && (
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-mono bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/70">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>~{estimatedRemainingMinutes} min remaining</span>
              </div>
            )}

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isPaused ? "Resume Session" : "Pause Session"}
            >
              {isPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Session Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Counter */}
        {!sessionCompleted && cards.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="font-semibold text-slate-700">
                Card {currentIndex + 1} of {cards.length}
              </span>
              <span>{progressPercent}% Complete</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 2. PAUSE OVERLAY */}
      {/* ============================================================ */}
      {isPaused && !sessionCompleted && (
        <div className="my-auto py-16 text-center space-y-4 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200 p-8 shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
            <Pause className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Session Paused</h3>
            <p className="text-xs text-slate-500 mt-1">
              Time elapsed: {formatSessionTime(sessionElapsedSeconds)} • {remainingCards} cards remaining
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsPaused(false)}
            className="bg-blue-600 hover:bg-blue-700 mx-auto"
          >
            <Play className="w-3.5 h-3.5 mr-1.5" />
            <span>Resume Session</span>
          </Button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. CENTER ACTIVE FLASHCARD */}
      {/* ============================================================ */}
      {!sessionCompleted && !isPaused && (
        <div className="my-auto py-4">
          {isLoading ? (
            <div className="text-center py-20 space-y-3">
              <RotateCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Preparing active-recall session...</p>
            </div>
          ) : currentCard ? (
            <CardFlip
              key={currentCard.id}
              card={currentCard}
              isFlipped={isFlipped}
              onFlip={setIsFlipped}
              onRate={handleRateCard}
              showKeyboardShortcuts={showShortcuts}
            />
          ) : (
            /* Empty State */
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-soft-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">You&apos;re All Caught Up!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  No flashcards are due for review right now under the spaced repetition schedule.
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => router.push("/flashcards")}>
                  Back to Dashboard
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push(`/flashcards/review?deckId=${deckId || ""}&filter=all`)}
                >
                  Practice Entire Deck
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. SESSION COMPLETE SCREEN */}
      {/* ============================================================ */}
      {sessionCompleted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="my-auto bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-elevated text-center space-y-6 max-w-xl mx-auto w-full"
        >
          {/* Trophy Header */}
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-soft-sm">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              Session Complete
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">Excellent Work!</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              You reviewed <span className="font-bold text-slate-800">{cards.length} flashcards</span> in this spaced repetition session.
            </p>
          </div>

          {/* Results Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-left">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
              <span className="text-[10px] font-bold text-emerald-600 uppercase block">Easy</span>
              <span className="text-xl font-bold text-slate-900">{outcomes.easy}</span>
              <span className="text-[10px] text-slate-400 block font-mono">Mastery advance</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
              <span className="text-[10px] font-bold text-blue-600 uppercase block">Good</span>
              <span className="text-xl font-bold text-slate-900">{outcomes.good}</span>
              <span className="text-[10px] text-slate-400 block font-mono">Retained</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
              <span className="text-[10px] font-bold text-amber-600 uppercase block">Hard</span>
              <span className="text-xl font-bold text-slate-900">{outcomes.hard}</span>
              <span className="text-[10px] text-slate-400 block font-mono">Reinforce soon</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-slate-200/70">
              <span className="text-[10px] font-bold text-rose-600 uppercase block">Again</span>
              <span className="text-xl font-bold text-slate-900">{outcomes.again}</span>
              <span className="text-[10px] text-slate-400 block font-mono">Lapsed (1d)</span>
            </div>
          </div>

          {/* Session Insight Banner */}
          <div className="grid grid-cols-3 gap-2 text-xs py-1">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block">Study Time</span>
              <span className="font-bold text-slate-800">{formatSessionTime(sessionElapsedSeconds)}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block">Session Retention</span>
              <span className="font-bold text-emerald-600">
                {calculateSessionRetention(outcomes)}%
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block">New Learned</span>
              <span className="font-bold text-purple-600">{newCardsLearnedCount}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            {difficultCards.length > 0 && (
              <Button
                variant="primary"
                size="md"
                onClick={handleReviewDifficultCards}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
              >
                <RotateCw className="w-3.5 h-3.5 mr-1.5" />
                <span>Review Difficult Cards ({difficultCards.length})</span>
              </Button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => router.push(deckId ? `/flashcards/deck/${deckId}` : "/flashcards")}
                className="w-full text-xs font-semibold"
              >
                Back to Flashcards
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={() => void loadReviewSession()}
                className="w-full text-xs font-bold bg-blue-600 hover:bg-blue-700"
              >
                Start Another Session
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ============================================================ */}
      {/* 5. SETTINGS DRAWER / MODAL */}
      {/* ============================================================ */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Review Preferences</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">Keyboard Shortcuts</span>
                  <span className="text-[11px] text-slate-400">Keys: Space (Reveal), 1-4 (Ratings)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowShortcuts(!showShortcuts)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    showShortcuts ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      showShortcuts ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">Spaced Algorithm</span>
                  <span className="text-[11px] text-slate-400">Deterministic SuperMemo SM-2</span>
                </div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                  SM-2 Active
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(false)}
              className="w-full text-xs font-semibold"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FlashcardReviewPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-400 text-sm font-medium">Preparing review session...</p>
        </div>
      }
    >
      <FlashcardReviewContent />
    </React.Suspense>
  );
}
