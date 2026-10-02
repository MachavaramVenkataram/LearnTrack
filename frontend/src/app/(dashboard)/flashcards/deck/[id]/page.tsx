"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Plus,
  Play,
  RotateCw,
  Clock,
  Award,
  Flame,
  CheckCircle2,
  Trash2,
  Search,
  Filter,
  Layers,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getDeck,
  getFlashcards,
  deleteFlashcard,
  getDecks,
} from "@/lib/flashcards/service";
import { Flashcard, FlashcardDeck } from "@/types/learning";
import { isCardDue, formatInterval } from "@/lib/flashcards/scheduler";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GenerateFlashcardsModal } from "@/components/flashcards/GenerateFlashcardsModal";
import { CreateCardModal } from "@/components/flashcards/CreateCardModal";

export default function DeckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const deckId = resolvedParams.id;

  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id || "demo-student";
  const { showToast } = useToast();

  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [allDecks, setAllDecks] = useState<FlashcardDeck[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");

  // Modals
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [d, allD, deckCards] = await Promise.all([
        getDeck(deckId, userId),
        getDecks(userId),
        getFlashcards(userId, { deckId }),
      ]);
      setDeck(d);
      setAllDecks(allD);
      setCards(deckCards);
    } catch (e) {
      console.error("Failed to load deck:", e);
      showToast("Error", "Could not load deck details.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [deckId, userId, showToast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const todayStr = new Date().toISOString().split("T")[0];
  const dueCards = cards.filter((c) => isCardDue(c, todayStr));
  const masteredCards = cards.filter((c) => c.state === "mastered");
  const learningCards = cards.filter((c) => c.state === "learning");
  const inReviewCards = cards.filter((c) => c.state === "review");

  // Average interval
  const avgInterval =
    cards.length > 0
      ? Math.round(cards.reduce((sum, c) => sum + (c.interval_days || 1), 0) / cards.length)
      : 1;

  // Filtered Cards
  const filteredCards = cards.filter((card) => {
    if (difficultyFilter !== "all" && card.difficulty !== difficultyFilter) return false;
    if (stateFilter !== "all" && card.state !== stateFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchQ = card.front.toLowerCase().includes(q) || card.question?.toLowerCase().includes(q);
      const matchA = card.back.toLowerCase().includes(q) || card.answer?.toLowerCase().includes(q);
      const matchT = card.topic.toLowerCase().includes(q);
      if (!matchQ && !matchA && !matchT) return false;
    }
    return true;
  });

  const handleDeleteCard = async (cardId: string) => {
    await deleteFlashcard(cardId);
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    showToast("Card Removed", "Removed from deck.", "info");
  };

  const handleCardsAdded = (newCards: Flashcard[]) => {
    setCards((prev) => [...newCards, ...prev]);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RotateCw className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading deck workspace...</p>
      </div>
    );
  }

  if (!deck && !isLoading) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-slate-900">Deck Not Found</h2>
        <p className="text-xs text-slate-500">The requested flashcard deck could not be located.</p>
        <Button variant="primary" size="sm" onClick={() => router.push("/flashcards")}>
          Back to Flashcards
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Breadcrumb & Exit */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link
          href="/flashcards"
          className="inline-flex items-center gap-1 hover:text-slate-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Flashcard Decks</span>
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800 truncate">{deck?.title}</span>
      </div>

      {/* ============================================================ */}
      {/* 1. DECK HEADER BANNER */}
      {/* ============================================================ */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: deck?.color || "#2563eb" }}
            />
            <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-slate-500">
              {deck?.subject || "Subject"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {deck?.title}
          </h1>

          {deck?.description && (
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              {deck.description}
            </p>
          )}

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <span className="font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
              {cards.length} Cards Total
            </span>
            <span className="font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
              {dueCards.length} Due Today
            </span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
              {masteredCards.length} Mastered
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsCreateOpen(true)}
            className="text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add Card</span>
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => setIsGenerateOpen(true)}
            className="text-xs font-semibold bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            <span>Generate More</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => router.push(`/flashcards/review?deckId=${deckId}&filter=due`)}
            className="text-xs font-bold bg-blue-600 hover:bg-blue-700 shadow-soft-sm"
          >
            <Play className="w-3.5 h-3.5 mr-1.5" />
            <span>{dueCards.length > 0 ? `Review Due (${dueCards.length})` : "Practice Deck"}</span>
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. REAL STATISTICS GRID */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Retention</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{deck?.retention_rate || 90}%</p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">Based on recall accuracy</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Due Today</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{dueCards.length}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            {dueCards.length > 0 ? "Requires active recall" : "All caught up"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Mastered</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{masteredCards.length}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">High stability &gt; 14 days</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Interval</span>
            <RotateCw className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{formatInterval(avgInterval)}</p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">SuperMemo SM-2 spacing</p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. SEARCH & CARDS LISTING */}
      {/* ============================================================ */}
      <div className="space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cards in this deck..."
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>

            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700"
            >
              <option value="all">All Stages</option>
              <option value="new">New</option>
              <option value="learning">Learning</option>
              <option value="review">In Review</option>
              <option value="mastered">Mastered</option>
            </select>
          </div>
        </div>

        {/* Cards Grid */}
        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCards.map((card) => {
              const isDue = isCardDue(card, todayStr);
              return (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 hover:border-blue-200 hover:shadow-card transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10.5px] font-semibold truncate max-w-[140px]">
                        {card.topic}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {isDue && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Due
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            card.state === "mastered"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : card.state === "review"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-orange-50 text-orange-700 border-orange-200"
                          }`}
                        >
                          {card.state}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Question
                      </span>
                      <p className="text-xs font-bold text-slate-900 line-clamp-3 leading-snug">
                        {card.front || card.question}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-xs line-clamp-3 leading-relaxed">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                        Answer
                      </span>
                      {card.back || card.answer}
                    </div>

                    {card.hint && (
                      <p className="text-[11px] text-amber-700 truncate">
                        <span className="font-semibold">Hint:</span> {card.hint}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Next: {card.due_date}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(card.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-1"
                      title="Delete card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Flashcards Match Filters</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search query or generate new cards for this deck.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsGenerateOpen(true)}
              className="mt-2"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              <span>Generate Cards with AI</span>
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <GenerateFlashcardsModal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        userId={userId}
        deckId={deckId}
        existingCards={cards}
        onCardsGenerated={handleCardsAdded}
      />

      <CreateCardModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        userId={userId}
        decks={allDecks}
        defaultDeckId={deckId}
        onCardCreated={(c) => setCards((prev) => [c, ...prev])}
      />
    </div>
  );
}
