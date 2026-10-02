"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Clock,
  Award,
  Flame,
  Edit,
  Trash2,
  ChevronRight,
  Calendar,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Flashcard, FlashcardDeck } from "@/types/learning";
import { isCardDue } from "@/lib/flashcards/scheduler";

interface DeckCardProps {
  deck: FlashcardDeck;
  deckCards?: Flashcard[];
  onReview: (deckId: string) => void;
  onOpenDetails: (deck: FlashcardDeck) => void;
  onGenerate: (deckId: string) => void;
  onEdit: (deck: FlashcardDeck) => void;
  onDelete: (deckId: string) => void;
}

export function DeckCard({
  deck,
  deckCards = [],
  onReview,
  onOpenDetails,
  onGenerate,
  onEdit,
  onDelete,
}: DeckCardProps) {
  const cardCount = deck.card_count || deckCards.length || 0;
  const dueCount = deck.due_count ?? deckCards.filter((c) => isCardDue(c)).length;
  const masteredCount = deck.mastered_count ?? deckCards.filter((c) => c.state === "mastered").length;

  const masteryPercent =
    cardCount > 0 ? Math.min(100, Math.round((masteredCount / cardCount) * 100)) : 0;

  // Compute next review date from real card data
  const nextReviewText = useMemo(() => {
    if (dueCount > 0) return "Today";

    if (deckCards.length === 0) return "No cards yet";

    // Find earliest future due date
    const todayStr = new Date().toISOString().split("T")[0];
    const futureDueDates = deckCards
      .map((c) => c.due_date)
      .filter((d) => d && d >= todayStr)
      .sort();

    if (futureDueDates.length === 0) {
      if (masteredCount === cardCount && cardCount > 0) return "All Mastered";
      return "Completed";
    }

    const earliest = futureDueDates[0];
    if (earliest === todayStr) return "Today";

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    if (earliest === tomorrowStr) return "Tomorrow";

    // Format as "Mon Day" (e.g. "Oct 8")
    try {
      const parts = earliest.split("-");
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return earliest;
    }
  }, [dueCount, deckCards, masteredCount, cardCount]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-card hover:border-blue-200/80 flex flex-col justify-between group">
      <div className="space-y-3.5">
        {/* Top: Subject Badge & Actions Menu */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full ring-2 ring-slate-100"
              style={{ backgroundColor: deck.color || "#2563eb" }}
            />
            <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500">
              {deck.subject || "General"}
            </span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(deck)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              title="Edit Deck"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(deck.id)}
              className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
              title="Delete Deck"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <button
            onClick={() => onOpenDetails(deck)}
            className="text-left w-full text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-between gap-1"
          >
            <span className="truncate">{deck.title}</span>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </button>
          {deck.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
              {deck.description}
            </p>
          )}
        </div>

        {/* Quick Stats Grid: Cards | Due | Mastered */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100/90">
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
              Cards
            </span>
            <span className="text-sm font-bold text-slate-800">{cardCount}</span>
          </div>

          <div
            className={`p-2 rounded-xl border ${
              dueCount > 0
                ? "bg-amber-50/70 border-amber-200/80 text-amber-700"
                : "bg-slate-50 border-slate-100/90 text-slate-600"
            }`}
          >
            <span className="text-[10px] font-bold block uppercase tracking-wider">Due</span>
            <span className="text-sm font-bold">{dueCount}</span>
          </div>

          <div className="p-2 rounded-xl bg-emerald-50/50 border border-emerald-100 text-emerald-700">
            <span className="text-[10px] font-bold block uppercase tracking-wider">Mastered</span>
            <span className="text-sm font-bold">{masteredCount}</span>
          </div>
        </div>

        {/* Visual Mastery Bar & Next Review */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-slate-500">Mastery</span>
            <span className="text-xs font-bold text-slate-800 font-mono">{masteryPercent}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${masteryPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Next review:</span>
            </span>
            <span
              className={`font-semibold ${
                nextReviewText === "Today"
                  ? "text-amber-600 font-bold"
                  : nextReviewText === "Tomorrow"
                  ? "text-blue-600"
                  : "text-slate-600"
              }`}
            >
              {nextReviewText}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onGenerate(deck.id)}
          className="text-[11px] font-semibold text-purple-700 hover:text-purple-800 flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
          title="Generate AI Cards for this deck"
        >
          <Sparkles className="w-3 h-3 text-purple-600" />
          <span>Generate</span>
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenDetails(deck)}
            className="text-xs font-semibold py-1 px-3 rounded-lg border-slate-200 hover:bg-slate-50 text-slate-700"
          >
            Details
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onReview(deck.id)}
            className="text-xs font-bold py-1 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-soft-sm"
          >
            Review
          </Button>
        </div>
      </div>
    </div>
  );
}
