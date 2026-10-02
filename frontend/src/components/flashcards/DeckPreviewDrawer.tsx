"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  ArrowRight,
  Clock,
  Award,
  Flame,
  RotateCw,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Edit,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Flashcard, FlashcardDeck } from "@/types/learning";
import { isCardDue, formatInterval } from "@/lib/flashcards/scheduler";

interface DeckPreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  deck: FlashcardDeck | null;
  cards: Flashcard[];
  onStartReview: (deckId: string) => void;
  onOpenGenerate: (deckId: string) => void;
  onEditDeck: (deck: FlashcardDeck) => void;
}

export function DeckPreviewDrawer({
  isOpen,
  onClose,
  deck,
  cards,
  onStartReview,
  onOpenGenerate,
  onEditDeck,
}: DeckPreviewDrawerProps) {
  const [revealedCardIds, setRevealedCardIds] = useState<Record<string, boolean>>({});

  if (!isOpen || !deck) return null;

  const deckCards = cards.filter((c) => c.deck_id === deck.id);
  const totalCards = deck.card_count || deckCards.length;
  const dueCards = deckCards.filter((c) => isCardDue(c));
  const learningCards = deckCards.filter((c) => c.state === "learning");
  const inReviewCards = deckCards.filter((c) => c.state === "review");
  const masteredCards = deckCards.filter((c) => c.state === "mastered");

  const masteryPercent =
    totalCards > 0 ? Math.min(100, Math.round((masteredCards.length / totalCards) * 100)) : 0;

  // Next review date
  const todayStr = new Date().toISOString().split("T")[0];
  const dueDates = deckCards
    .map((c) => c.due_date)
    .filter(Boolean)
    .sort();
  const nextDueDate = dueDates.length > 0 ? dueDates[0] : "None scheduled";

  // Last reviewed date
  const lastReviewedDates = deckCards
    .map((c) => c.last_reviewed_at)
    .filter(Boolean)
    .sort()
    .reverse();
  const lastReviewedText =
    lastReviewedDates.length > 0
      ? new Date(lastReviewedDates[0]!).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : "Never";

  const toggleReveal = (id: string) => {
    setRevealedCardIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Preview up to 5 real cards
  const previewCards = deckCards.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-lg bg-white shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-250 border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full ring-2 ring-slate-100"
                style={{ backgroundColor: deck.color || "#2563eb" }}
              />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                {deck.subject || "General Deck"}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{deck.title}</h2>

            {deck.description && (
              <p className="text-xs text-slate-500 leading-relaxed">{deck.description}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 1. Quick KPI Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Cards
              </span>
              <span className="text-lg font-bold text-slate-900">{totalCards}</span>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                dueCards.length > 0
                  ? "bg-amber-50/70 border-amber-200 text-amber-800"
                  : "bg-slate-50 border-slate-100 text-slate-700"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block">
                Due Today
              </span>
              <span className="text-lg font-bold">{dueCards.length}</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-emerald-800">
              <span className="text-[10px] font-bold uppercase tracking-wider block">Mastered</span>
              <span className="text-lg font-bold">{masteredCards.length}</span>
            </div>
          </div>

          {/* 2. Spaced Repetition Learning Pipeline */}
          <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Memory Stage Breakdown</span>
              </span>
              <span className="font-mono font-bold text-emerald-600">{masteryPercent}% Mastery</span>
            </div>

            {/* Visual Mastery Bar */}
            <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 transition-all duration-300"
                style={{ width: `${masteryPercent}%` }}
                title={`Mastered: ${masteredCards.length}`}
              />
              <div
                className="bg-blue-500 transition-all duration-300"
                style={{
                  width: `${
                    totalCards > 0 ? Math.round((inReviewCards.length / totalCards) * 100) : 0
                  }%`,
                }}
                title={`In Review: ${inReviewCards.length}`}
              />
              <div
                className="bg-orange-500 transition-all duration-300"
                style={{
                  width: `${
                    totalCards > 0 ? Math.round((learningCards.length / totalCards) * 100) : 0
                  }%`,
                }}
                title={`Learning: ${learningCards.length}`}
              />
            </div>

            {/* Stage Badges */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[11px] font-mono">
              <div className="p-1.5 rounded-lg bg-orange-50/80 text-orange-700 border border-orange-100">
                <span className="font-bold">{learningCards.length}</span> Learning
              </div>
              <div className="p-1.5 rounded-lg bg-blue-50/80 text-blue-700 border border-blue-100">
                <span className="font-bold">{inReviewCards.length}</span> In Review
              </div>
              <div className="p-1.5 rounded-lg bg-emerald-50/80 text-emerald-700 border border-emerald-100">
                <span className="font-bold">{masteredCards.length}</span> Mastered
              </div>
            </div>
          </div>

          {/* 3. Scheduling & Review Metrics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                  Last Reviewed
                </span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                  {lastReviewedText}
                </span>
              </div>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                  Next Scheduled
                </span>
                <span className="font-bold text-slate-800 text-xs mt-0.5 block">
                  {dueCards.length > 0 ? "Today" : nextDueDate}
                </span>
              </div>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* 4. Real Cards Preview */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Deck Cards Preview ({previewCards.length} of {totalCards})</span>
              </h3>
            </div>

            {previewCards.length > 0 ? (
              <div className="space-y-2.5">
                {previewCards.map((card, idx) => {
                  const isRevealed = Boolean(revealedCardIds[card.id]);
                  return (
                    <div
                      key={card.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {card.topic}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold capitalize ${
                              card.difficulty === "hard"
                                ? "bg-rose-50 text-rose-700"
                                : card.difficulty === "easy"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {card.difficulty}
                          </span>
                        </div>
                      </div>

                      <p className="font-bold text-slate-900 leading-snug">
                        {card.front || card.question}
                      </p>

                      {/* Interactive Reveal Toggle */}
                      {isRevealed ? (
                        <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100/80 text-[11.5px] text-slate-800 leading-relaxed space-y-1">
                          <p className="font-medium text-slate-900">{card.back || card.answer}</p>
                          {card.explanation && (
                            <p className="text-[10.5px] text-slate-500 font-sans">{card.explanation}</p>
                          )}
                          <button
                            onClick={() => toggleReveal(card.id)}
                            className="text-[10px] text-blue-600 font-semibold hover:underline flex items-center gap-1 pt-1"
                          >
                            <EyeOff className="w-3 h-3" />
                            <span>Hide Answer</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => toggleReveal(card.id)}
                          className="text-[11px] text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 pt-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Show Answer Preview</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                This deck does not have any cards yet.
              </p>
            )}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEditDeck(deck)}
            className="text-xs font-semibold py-2 px-3 border-slate-200 text-slate-700"
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            <span>Edit Deck</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenGenerate(deck.id)}
              className="text-xs font-semibold py-2 px-3 bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
              <span>Generate Cards</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => onStartReview(deck.id)}
              className="text-xs font-bold py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white shadow-soft-sm"
            >
              <span>Start Review</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
