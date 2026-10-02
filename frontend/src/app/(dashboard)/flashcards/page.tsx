"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Plus,
  Sparkles,
  RotateCw,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  ArrowRight,
  Trash2,
  Zap,
  Tag,
  Search,
  BookOpen,
  Layers,
  TrendingUp,
  BarChart3,
  Lightbulb,
  Edit,
  FolderPlus,
  Calendar,
  Filter,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getFlashcards,
  getDecks,
  deleteFlashcard,
  deleteDeck,
  getFlashcardAnalytics,
  getAiRecommendations,
} from "@/lib/flashcards/service";
import { Flashcard, FlashcardDeck, FlashcardAnalytics } from "@/types/learning";
import { isCardDue, formatInterval, estimateReviewTimeMinutes } from "@/lib/flashcards/scheduler";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GenerateFlashcardsModal } from "@/components/flashcards/GenerateFlashcardsModal";
import { CreateCardModal } from "@/components/flashcards/CreateCardModal";
import { CreateDeckModal } from "@/components/flashcards/CreateDeckModal";
import { LearningCommandBar } from "@/components/flashcards/LearningCommandBar";
import { ReviewProgressCard } from "@/components/flashcards/ReviewProgressCard";
import { DeckCard } from "@/components/flashcards/DeckCard";
import { DeckPreviewDrawer } from "@/components/flashcards/DeckPreviewDrawer";
import { ActiveRecallReviewModal } from "@/components/flashcards/ActiveRecallReviewModal";

export default function FlashcardsDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id || "demo-student";
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"decks" | "cards" | "queue" | "insights">("decks");

  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [analytics, setAnalytics] = useState<FlashcardAnalytics | null>(null);
  const [aiRecs, setAiRecs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search for "All Cards" tab
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "due_soon" | "difficulty" | "recently_reviewed">("newest");

  // Modals & Drawers
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [deckToEdit, setDeckToEdit] = useState<FlashcardDeck | null>(null);
  const [targetDeckIdForGenerate, setTargetDeckIdForGenerate] = useState<string | null>(null);

  // Side Drawer Preview
  const [previewDeck, setPreviewDeck] = useState<FlashcardDeck | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Active Recall Review Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewCardsQueue, setReviewCardsQueue] = useState<Flashcard[]>([]);
  const [reviewModalTitle, setReviewModalTitle] = useState("Active Recall Session");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allCards, allDecks, stats, recs] = await Promise.all([
        getFlashcards(userId),
        getDecks(userId),
        getFlashcardAnalytics(userId),
        getAiRecommendations(userId),
      ]);
      setCards(allCards);
      setDecks(allDecks);
      setAnalytics(stats);
      setAiRecs(recs);
    } catch (e) {
      console.error("Failed to load flashcard dashboard:", e);
      showToast("Error", "Could not load flashcard data.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [userId, showToast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const todayStr = new Date().toISOString().split("T")[0];
  const dueCards = useMemo(() => cards.filter((c) => isCardDue(c, todayStr)), [cards, todayStr]);
  const learningCards = useMemo(() => cards.filter((c) => c.state === "learning"), [cards]);
  const reviewCards = useMemo(() => cards.filter((c) => c.state === "review"), [cards]);
  const masteredCards = useMemo(() => cards.filter((c) => c.state === "mastered"), [cards]);

  // Number of cards reviewed today
  const completedTodayCount = useMemo(() => {
    return cards.filter((c) => c.last_reviewed_at && c.last_reviewed_at.startsWith(todayStr)).length;
  }, [cards, todayStr]);

  // Unique subjects for filter
  const uniqueSubjects = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((c) => {
      if (c.subject) set.add(c.subject);
    });
    return Array.from(set);
  }, [cards]);

  // Filtered Cards for "All Cards" tab
  const filteredCards = useMemo(() => {
    return cards
      .filter((card) => {
        if (subjectFilter !== "all" && card.subject !== subjectFilter) return false;
        if (difficultyFilter !== "all" && card.difficulty !== difficultyFilter) return false;
        if (statusFilter === "due" && !isCardDue(card, todayStr)) return false;
        if (statusFilter !== "all" && statusFilter !== "due" && card.state !== statusFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchQ = card.front.toLowerCase().includes(q) || (card.question?.toLowerCase().includes(q) ?? false);
          const matchA = card.back.toLowerCase().includes(q) || (card.answer?.toLowerCase().includes(q) ?? false);
          const matchT = card.topic.toLowerCase().includes(q);
          if (!matchQ && !matchA && !matchT) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "due_soon") return a.due_date.localeCompare(b.due_date);
        if (sortBy === "difficulty") {
          const rank: Record<string, number> = { hard: 3, medium: 2, easy: 1 };
          return (rank[b.difficulty || "medium"] || 2) - (rank[a.difficulty || "medium"] || 2);
        }
        if (sortBy === "recently_reviewed") {
          return (b.last_reviewed_at || "").localeCompare(a.last_reviewed_at || "");
        }
        return b.created_at.localeCompare(a.created_at);
      });
  }, [cards, subjectFilter, difficultyFilter, statusFilter, searchQuery, sortBy, todayStr]);

  const handleDeleteCard = async (cardId: string) => {
    await deleteFlashcard(cardId);
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    showToast("Card Removed", "Deleted from deck.", "info");
  };

  const handleDeleteDeck = async (deckId: string) => {
    if (!confirm("Are you sure you want to delete this deck?")) return;
    await deleteDeck(deckId);
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
    if (previewDeck?.id === deckId) {
      setIsPreviewOpen(false);
      setPreviewDeck(null);
    }
    showToast("Deck Deleted", "Removed from workspace.", "info");
  };

  const handleCardCreated = (card: Flashcard) => {
    setCards((prev) => [card, ...prev]);
    void loadData();
  };

  const handleDeckSaved = (deck: FlashcardDeck) => {
    setDecks((prev) => {
      const idx = prev.findIndex((d) => d.id === deck.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = deck;
        return next;
      }
      return [deck, ...prev];
    });
    if (previewDeck?.id === deck.id) {
      setPreviewDeck(deck);
    }
  };

  // Launch Active Recall Review for target cards / deck
  const handleStartReview = useCallback(
    (deckId?: string, filter?: string) => {
      let targetCards: Flashcard[] = [];
      let title = "Active Recall Review";

      if (deckId) {
        const targetDeck = decks.find((d) => d.id === deckId);
        title = targetDeck?.title || "Deck Review";
        const deckSubset = cards.filter((c) => c.deck_id === deckId);
        // Prioritize due cards in this deck, or all if none due
        const dueInDeck = deckSubset.filter((c) => isCardDue(c, todayStr));
        targetCards = dueInDeck.length > 0 ? dueInDeck : deckSubset;
      } else if (filter === "due" || !filter) {
        targetCards = dueCards.length > 0 ? dueCards : cards;
        title = dueCards.length > 0 ? "Daily Due Queue" : "All Flashcards Practice";
      } else if (filter === "learning") {
        targetCards = learningCards;
        title = "Learning Stage Practice";
      } else if (filter === "review") {
        targetCards = reviewCards;
        title = "Expanding Intervals Practice";
      } else if (filter === "mastered") {
        targetCards = masteredCards;
        title = "Mastered Cards Refresher";
      } else {
        targetCards = cards;
      }

      if (targetCards.length === 0) {
        showToast("No Cards", "There are no flashcards available for this session.", "info");
        return;
      }

      setReviewCardsQueue(targetCards);
      setReviewModalTitle(title);
      setIsReviewModalOpen(true);
      if (isPreviewOpen) {
        setIsPreviewOpen(false);
      }
    },
    [cards, decks, dueCards, learningCards, reviewCards, masteredCards, todayStr, showToast, isPreviewOpen]
  );

  // Open Details Drawer for a deck
  const handleOpenDeckDetails = (deck: FlashcardDeck) => {
    setPreviewDeck(deck);
    setIsPreviewOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6 max-w-6xl mx-auto pb-14"
    >
      {/* ============================================================ */}
      {/* 1. PAGE HEADER (Section 3) */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
              <Brain className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Smart Flashcards
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 tracking-wider uppercase">
              Active Recall
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-500">
            <span>Build long-term memory with intelligent spaced repetition.</span>
            <span className="text-slate-300">•</span>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-700">
              <span className={`w-1.5 h-1.5 rounded-full ${dueCards.length > 0 ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
              <span>
                {cards.length} cards • {dueCards.length} due today
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setTargetDeckIdForGenerate(null);
              setIsGenerateOpen(true);
            }}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold border-purple-200/90 text-xs px-3.5 py-2 rounded-xl shadow-2xs cursor-pointer transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
            <span>Generate with AI</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-soft-sm cursor-pointer transition-all"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>+ New Card</span>
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. PERSONALIZED LEARNING COMMAND BAR (Section 4) */}
      {/* ============================================================ */}
      <LearningCommandBar
        cards={cards}
        decks={decks}
        dueCards={dueCards}
        learningCards={learningCards}
        onStartReview={(deckId, filter) => handleStartReview(deckId, filter)}
        onOpenGenerate={() => {
          setTargetDeckIdForGenerate(null);
          setIsGenerateOpen(true);
        }}
      />

      {/* ============================================================ */}
      {/* 3. INTERACTIVE KPI CARDS (Section 5) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Due Today */}
        <div
          onClick={() => {
            setActiveTab("queue");
          }}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-card cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 group-hover:text-amber-600 transition-colors">
              Due Today
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{dueCards.length}</p>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 font-mono">
            <span>Ready for review</span>
            <span className="text-amber-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              View queue →
            </span>
          </div>
        </div>

        {/* Learning */}
        <div
          onClick={() => {
            setActiveTab("cards");
            setStatusFilter("learning");
          }}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-orange-300 hover:shadow-card cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 group-hover:text-orange-600 transition-colors">
              Learning
            </span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{learningCards.length}</p>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 font-mono">
            <span>Short interval stage</span>
            <span className="text-orange-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              View learning →
            </span>
          </div>
        </div>

        {/* In Review */}
        <div
          onClick={() => {
            setActiveTab("cards");
            setStatusFilter("review");
          }}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-card cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 group-hover:text-blue-600 transition-colors">
              In Review
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <RotateCw className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{reviewCards.length}</p>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 font-mono">
            <span>Expanding intervals</span>
            <span className="text-blue-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              View in review →
            </span>
          </div>
        </div>

        {/* Mastered */}
        <div
          onClick={() => {
            setActiveTab("cards");
            setStatusFilter("mastered");
          }}
          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-card cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 group-hover:text-emerald-600 transition-colors">
              Mastered
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900">{masteredCards.length}</p>
          <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400 font-mono">
            <span>Retention &gt; 14 days</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              View mastered →
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. RETENTION PROGRESS BAR (Section 6) */}
      {/* ============================================================ */}
      <ReviewProgressCard
        completedTodayCount={completedTodayCount}
        dueTodayCount={dueCards.length}
      />

      {/* ============================================================ */}
      {/* 5. WORKSPACE TABS (Section 7) */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between border-b border-slate-200 pt-1">
        <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("decks")}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "decks"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Decks ({decks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("queue")}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "queue"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Review Queue</span>
            {dueCards.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 font-mono">
                {dueCards.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("cards")}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "cards"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>All Cards ({cards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("insights")}
            className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === "insights"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Insights</span>
          </button>
        </div>

        {activeTab === "decks" && (
          <button
            onClick={() => {
              setDeckToEdit(null);
              setIsDeckModalOpen(true);
            }}
            className="pb-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer shrink-0"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ New Deck</span>
          </button>
        )}
      </div>

      {/* ============================================================ */}
      {/* 6. TAB CONTENT: DECKS (Sections 8, 9, 10) */}
      {/* ============================================================ */}
      {activeTab === "decks" && (
        <div className="space-y-4">
          {decks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {decks.map((deck) => {
                const deckCards = cards.filter((c) => c.deck_id === deck.id);
                return (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    deckCards={deckCards}
                    onReview={(id) => handleStartReview(id)}
                    onOpenDetails={(d) => handleOpenDeckDetails(d)}
                    onGenerate={(id) => {
                      setTargetDeckIdForGenerate(id);
                      setIsGenerateOpen(true);
                    }}
                    onEdit={(d) => {
                      setDeckToEdit(d);
                      setIsDeckModalOpen(true);
                    }}
                    onDelete={(id) => handleDeleteDeck(id)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-soft-sm">
              <div className="w-14 h-14 rounded-3xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Your flashcard workspace is ready</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Organize your subjects into structured decks or generate active recall flashcards directly with AI.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2.5 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeckModalOpen(true)}
                  className="text-xs"
                >
                  Create Deck
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsGenerateOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white shadow-soft-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  <span>Generate with AI</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. TAB CONTENT: REVIEW QUEUE (Dedicated Due Cards Queue) */}
      {/* ============================================================ */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Active Recall Due Queue</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cards whose optimal memory intervals expire today under the SM-2 algorithm.
              </p>
            </div>

            {dueCards.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStartReview(undefined, "due")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-soft-sm px-4 py-2"
              >
                <span>Start Due Session ({dueCards.length})</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            )}
          </div>

          {dueCards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dueCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white rounded-2xl border border-amber-200/80 p-4 shadow-2xs hover:shadow-card hover:border-amber-300 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold text-[10.5px]">
                        {card.topic}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Due Today
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-900 leading-snug line-clamp-3">
                      {card.front || card.question}
                    </p>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 line-clamp-2">
                      {card.back || card.answer}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 capitalize">
                      Stage: {card.state}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setReviewCardsQueue([card]);
                        setReviewModalTitle(`Quick Practice: ${card.topic}`);
                        setIsReviewModalOpen(true);
                      }}
                      className="text-[11px] font-bold py-1 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      Recall Card
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">All Scheduled Cards Completed!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No cards are pending review today. You can practice any deck or generate new cards to continue advancing your mastery.
              </p>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStartReview(undefined, "all")}
                  className="text-xs font-semibold"
                >
                  Practice All Cards
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 8. TAB CONTENT: ALL CARDS (Multi-Filter & Search) */}
      {/* ============================================================ */}
      {activeTab === "cards" && (
        <div className="space-y-4">
          {/* Search & Multi-Filter Toolbar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search cards, questions, topics, answers..."
                  className="pl-9 text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Subject Filter */}
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700"
                >
                  <option value="all">All Subjects</option>
                  {uniqueSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                {/* Difficulty Filter */}
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700"
                >
                  <option value="all">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700"
                >
                  <option value="all">All Stages</option>
                  <option value="due">Due Today</option>
                  <option value="learning">Learning</option>
                  <option value="review">In Review</option>
                  <option value="mastered">Mastered</option>
                </select>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700"
                >
                  <option value="newest">Newest First</option>
                  <option value="due_soon">Due Soon</option>
                  <option value="difficulty">Difficulty</option>
                  <option value="recently_reviewed">Recently Reviewed</option>
                </select>
              </div>
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
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 hover:border-blue-200 hover:shadow-card transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
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
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : card.state === "review"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-orange-50 text-orange-700 border-orange-200"
                            }`}
                          >
                            {card.state}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs font-bold text-slate-900 line-clamp-3 leading-snug">
                        Q: {card.front || card.question}
                      </p>

                      <p className="text-xs text-slate-500 line-clamp-3 mt-2 leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 font-sans">
                        A: {card.back || card.answer}
                      </p>

                      {card.hint && (
                        <p className="text-[11px] text-amber-700 mt-2 truncate">
                          <span className="font-semibold">Hint:</span> {card.hint}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-400 font-mono">
                      <span>Due: {card.due_date}</span>
                      <button
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
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No Cards Match Your Filters</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try resetting your search query or generate new cards with AI.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 9. TAB CONTENT: LEARNING INSIGHTS & AI RECOMMENDATIONS */}
      {/* ============================================================ */}
      {activeTab === "insights" && (
        <div className="space-y-6">
          {/* Top Analytics Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Cards Reviewed
              </span>
              <p className="text-2xl font-bold text-slate-900">{analytics?.cards_reviewed_count || cards.length}</p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">Total review events</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Study Streak
              </span>
              <p className="text-2xl font-bold text-slate-900 flex items-center gap-1.5">
                <span>{analytics?.review_streak_days || 1} Days</span>
                <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
              </p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">Consecutive recall days</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Retention Rate
              </span>
              <p className="text-2xl font-bold text-emerald-600">{analytics?.retention_rate || 90}%</p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">Actual recall accuracy</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Average Spacing
              </span>
              <p className="text-2xl font-bold text-blue-600">{formatInterval(analytics?.avg_interval_days || 3)}</p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">Mean SM-2 interval</p>
            </div>
          </div>

          {/* Learning Pattern Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>Your Learning Pattern</span>
                </h3>
                <span className="text-[11px] font-mono text-slate-400">Real Supabase Data</span>
              </div>

              {cards.length > 0 ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Most Reviewed Topic</span>
                      <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                        {analytics?.most_reviewed_topic || "Model Evaluation"}
                      </span>
                    </div>
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-700 uppercase block">Needs Attention (Lapses)</span>
                      <span className="font-bold text-amber-900 text-sm mt-0.5 block">
                        {analytics?.most_difficult_topic || "Model Evaluation"}
                      </span>
                    </div>
                    <Flame className="w-4 h-4 text-amber-600" />
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block">Strongest Retention Area</span>
                      <span className="font-bold text-emerald-900 text-sm mt-0.5 block">
                        {analytics?.strongest_topic || "Model Evaluation"}
                      </span>
                    </div>
                    <Award className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-6 text-center">
                  More review activity is needed to identify learning patterns.
                </p>
              )}
            </div>

            {/* AI Recommendations */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-card space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>AI Learning Recommendations</span>
                </h3>
                <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                  Grounded In Logs
                </span>
              </div>

              {aiRecs.length > 0 ? (
                <div className="space-y-3">
                  {aiRecs.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-900">{rec.topic}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartReview(undefined, rec.filter)}
                          className="text-[11px] py-0.5 px-2 bg-white text-purple-700 border-purple-200 hover:bg-purple-100"
                        >
                          {rec.actionText}
                        </Button>
                      </div>
                      <p className="text-purple-950 font-medium">{rec.message}</p>
                      <p className="text-[11px] text-purple-700 leading-relaxed font-sans">{rec.reason}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-6 text-center">
                  Complete your first review session to see grounded recommendations.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 10. DRAWERS & MODALS */}
      {/* ============================================================ */}
      {/* Deck Quick Preview Drawer */}
      <DeckPreviewDrawer
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewDeck(null);
        }}
        deck={previewDeck}
        cards={cards}
        onStartReview={(deckId) => handleStartReview(deckId)}
        onOpenGenerate={(deckId) => {
          setTargetDeckIdForGenerate(deckId);
          setIsGenerateOpen(true);
        }}
        onEditDeck={(d) => {
          setDeckToEdit(d);
          setIsDeckModalOpen(true);
        }}
      />

      {/* Active Recall Review Modal */}
      <ActiveRecallReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          void loadData();
        }}
        cards={reviewCardsQueue}
        deckTitle={reviewModalTitle}
        userId={userId}
        onCardReviewed={(updatedCard) => {
          setCards((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
        }}
        onSessionComplete={() => {
          void loadData();
        }}
      />

      {/* Generate Flashcards with AI Modal */}
      <GenerateFlashcardsModal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        userId={userId}
        deckId={targetDeckIdForGenerate}
        existingCards={cards}
        onCardsGenerated={(newCards) => {
          setCards((prev) => [...newCards, ...prev]);
          void loadData();
        }}
      />

      {/* Create Card Modal */}
      <CreateCardModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        userId={userId}
        decks={decks}
        onCardCreated={handleCardCreated}
      />

      {/* Create / Edit Deck Modal */}
      <CreateDeckModal
        isOpen={isDeckModalOpen}
        onClose={() => {
          setIsDeckModalOpen(false);
          setDeckToEdit(null);
        }}
        userId={userId}
        deckToEdit={deckToEdit}
        onDeckSaved={handleDeckSaved}
      />
    </motion.div>
  );
}
