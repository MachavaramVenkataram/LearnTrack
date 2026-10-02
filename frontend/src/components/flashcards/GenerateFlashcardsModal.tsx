"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  FileText,
  Layers,
  Database,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit2,
  RotateCw,
  X,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Flashcard, FlashcardDifficulty, FlashcardType } from "@/types/learning";
import { createFlashcard } from "@/lib/flashcards/service";
import { useToast } from "@/components/ui/Toast";

interface GenerateFlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  deckId?: string | null;
  existingCards: Flashcard[];
  onCardsGenerated: (newCards: Flashcard[]) => void;
}

type SourceOption = "notes" | "knowledge_base" | "subject" | "topic" | "custom_text";

const GENERATION_STAGES = [
  "Analyzing learning material...",
  "Identifying key concepts...",
  "Creating recall questions...",
  "Checking duplicates...",
  "Validating answers...",
  "Preparing your deck...",
];

export function GenerateFlashcardsModal({
  isOpen,
  onClose,
  userId,
  deckId,
  existingCards,
  onCardsGenerated,
}: GenerateFlashcardsModalProps) {
  const { showToast } = useToast();

  // Form State
  const [source, setSource] = useState<SourceOption>("topic");
  const [subject, setSubject] = useState("Machine Learning");
  const [topic, setTopic] = useState("Model Evaluation & Regression Metrics");
  const [difficulty, setDifficulty] = useState<FlashcardDifficulty | "mixed">("mixed");
  const [count, setCount] = useState<number>(5);
  const [cardType, setCardType] = useState<FlashcardType | "mixed">("mixed");
  const [learningGoal, setLearningGoal] = useState<"understand" | "remember" | "apply" | "analyze" | "exam_prep">("understand");
  const [customText, setCustomText] = useState("");

  // Generation & Progress State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);

  // Review & Approval State (AI Card Editor)
  const [reviewMode, setReviewMode] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<any[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editHint, setEditHint] = useState("");

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setReviewMode(false);
      setIsGenerating(false);
      setGenerationStage(0);
      setGeneratedCards([]);
      setSelectedIndices(new Set());
      setEditingIndex(null);
    }
  }, [isOpen]);

  // Handle AI Generation
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    setGenerationStage(0);

    // Multi-stage realistic progress indicator
    const interval = setInterval(() => {
      setGenerationStage((prev) => {
        if (prev < GENERATION_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    try {
      const existingQuestions = existingCards.map((c) => c.front || c.question || "");

      let sourceReference = "";
      if (source === "notes") sourceReference = `Notes on ${topic}`;
      else if (source === "knowledge_base") sourceReference = `Knowledge Base: ${subject}`;
      else if (source === "custom_text") sourceReference = `Custom Text Extract (${subject})`;
      else sourceReference = `${subject} → ${topic}`;

      const res = await fetch("/api/ai/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: source,
          topic: topic.trim(),
          subject: subject.trim(),
          difficulty,
          count,
          cardType,
          learningGoal,
          customText: customText.trim(),
          existingQuestions,
        }),
      });

      clearInterval(interval);
      setGenerationStage(GENERATION_STAGES.length - 1);

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg =
          data.error || "Flashcard generation couldn't be completed. Please try again.";
        showToast("Generation Notice", errorMsg, data.status === 429 ? "error" : "error");
        return;
      }

      const cards = data.cards || data.flashcards || [];

      if (Array.isArray(cards) && cards.length > 0) {
        setGeneratedCards(cards);
        // Pre-select all valid cards
        setSelectedIndices(new Set(cards.map((_: any, idx: number) => idx)));
        setReviewMode(true);
        const dupNotice = data.metadata?.duplicateCount ? ` (${data.metadata.duplicateCount} duplicates skipped)` : "";
        showToast(
          "Generation Complete",
          `${cards.length} high-yield cards synthesized${dupNotice}. Review and approve before saving.`,
          "success"
        );
      } else {
        throw new Error(data.error || "No cards generated");
      }
    } catch (err: any) {
      clearInterval(interval);
      showToast(
        "Generation Error",
        err.message || "Flashcard generation couldn't be completed. Please try again.",
        "error"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle card selection in review mode
  const toggleSelectCard = (index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Open inline editor for a card
  const handleStartEdit = (index: number) => {
    const card = generatedCards[index];
    if (!card) return;
    setEditingIndex(index);
    setEditQuestion(card.question || card.front || "");
    setEditAnswer(card.answer || card.back || "");
    setEditHint(card.hint || "");
  };

  // Save inline edit
  const handleSaveEdit = (index: number) => {
    setGeneratedCards((prev) =>
      prev.map((c, idx) =>
        idx === index
          ? {
              ...c,
              question: editQuestion.trim(),
              answer: editAnswer.trim(),
              front: editQuestion.trim(),
              back: editAnswer.trim(),
              hint: editHint.trim(),
            }
          : c
      )
    );
    setEditingIndex(null);
  };

  // Delete card from generated list
  const handleDeleteCard = (index: number) => {
    setGeneratedCards((prev) => prev.filter((_, idx) => idx !== index));
    setSelectedIndices((prev) => {
      const next = new Set<number>();
      Array.from(prev).forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  };

  // Approve & Save Selected Cards to Supabase / Service
  const handleSaveSelectedCards = async () => {
    const cardsToSave = generatedCards.filter((_, idx) => selectedIndices.has(idx));
    if (cardsToSave.length === 0) {
      showToast("No Cards Selected", "Select at least one flashcard to save.", "info");
      return;
    }

    const created: Flashcard[] = [];
    for (const item of cardsToSave) {
      const card = await createFlashcard(userId, {
        deck_id: deckId || null,
        subject: subject.trim(),
        topic: item.topic || topic.trim(),
        difficulty: item.difficulty || (difficulty === "mixed" ? "medium" : difficulty),
        card_type: item.card_type || (cardType === "mixed" ? "concept" : cardType),
        front: item.question || item.front,
        back: item.answer || item.back,
        explanation: item.explanation,
        example: item.example,
        hint: item.hint,
        source_reference: item.source_reference,
      });
      created.push(card);
    }

    onCardsGenerated(created);
    onClose();
    showToast(
      "Cards Added to Deck",
      `Saved ${created.length} active-recall cards with spaced repetition schedules.`,
      "success"
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isGenerating && onClose()}
      title={reviewMode ? "Review Generated Flashcards" : "Generate Smart Flashcards"}
      description={
        reviewMode
          ? "Inspect, refine, or approve cards before adding them to your spaced repetition deck."
          : "Synthesize high-yield active-recall cards grounded in academic sources."
      }
      maxWidth={reviewMode ? "xl" : "lg"}
    >
      <div className="pt-2">
        {/* ============================================================ */}
        {/* STAGE 1: GENERATION CONFIGURATION FORM */}
        {/* ============================================================ */}
        {!reviewMode && !isGenerating && (
          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Source Selection Buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Learning Material Source</span>
                <span className="text-[11px] text-slate-400 font-normal">Where should the AI draw facts?</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { key: "topic" as const, label: "Topic", icon: Sparkles },
                  { key: "subject" as const, label: "Subject", icon: Layers },
                  { key: "notes" as const, label: "My Notes", icon: BookOpen },
                  { key: "knowledge_base" as const, label: "Knowledge", icon: Database },
                  { key: "custom_text" as const, label: "Custom Text", icon: FileText },
                ].map((s) => {
                  const Icon = s.icon;
                  const isSelected = source === s.key;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSource(s.key)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-purple-50 text-purple-700 border-purple-600 shadow-2xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Textarea if custom_text selected */}
            {source === "custom_text" && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Paste Source Material or Lecture Text</label>
                <Textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Paste lecture notes, textbook excerpt, or technical definition..."
                  rows={4}
                  required
                />
              </div>
            )}

            {/* Subject & Topic Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Subject / Module</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Machine Learning, DBMS, Digital Systems"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Specific Topic or Chapter</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Model Evaluation & Regression Metrics"
                  required
                />
              </div>
            </div>

            {/* Difficulty & Card Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Difficulty</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["easy", "medium", "hard", "mixed"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                        difficulty === d
                          ? "bg-blue-50 text-blue-700 border-blue-600 font-bold"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Number of Cards</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[5, 10, 20, 30, 50].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCount(n)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        count === n
                          ? "bg-purple-50 text-purple-700 border-purple-600 font-bold"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Type & Learning Goal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Card Question Pattern</label>
                <select
                  value={cardType}
                  onChange={(e) => setCardType(e.target.value as any)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="mixed">Mixed (Diverse Question Types)</option>
                  <option value="concept">Concept Understanding</option>
                  <option value="definition">Clear Definition</option>
                  <option value="application">Practical Application</option>
                  <option value="comparison">Comparative Analysis (X vs Y)</option>
                  <option value="problem_solving">Problem Solving</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Learning Goal</label>
                <select
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value as any)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="understand">Understand (Conceptual Invariance)</option>
                  <option value="remember">Remember (Core Vocabulary &amp; Facts)</option>
                  <option value="apply">Apply (Concrete Scenarios)</option>
                  <option value="analyze">Analyze (Trade-offs &amp; Failure Modes)</option>
                  <option value="exam_prep">Exam Preparation (High-Yield Prompts)</option>
                </select>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-purple-600 hover:bg-purple-700">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                <span>Generate Flashcards</span>
              </Button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* STAGE 2: MULTI-STEP GENERATION PROGRESS */}
        {/* ============================================================ */}
        {isGenerating && (
          <div className="py-10 px-4 text-center space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full border-3 border-purple-200 border-t-purple-600"
              />
              <div className="absolute inset-0 flex items-center justify-center text-purple-600">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">
                {GENERATION_STAGES[generationStage]}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Stage {generationStage + 1} of {GENERATION_STAGES.length}
              </p>
            </div>

            {/* Stage Progress Pills */}
            <div className="max-w-md mx-auto space-y-1.5 text-left">
              {GENERATION_STAGES.map((stg, i) => (
                <div
                  key={stg}
                  className={`flex items-center gap-2 text-xs transition-colors py-0.5 ${
                    i < generationStage
                      ? "text-emerald-600 font-medium"
                      : i === generationStage
                      ? "text-purple-700 font-bold"
                      : "text-slate-300"
                  }`}
                >
                  {i < generationStage ? (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        i === generationStage ? "border-purple-600 bg-purple-50" : "border-slate-200"
                      }`}
                    >
                      {i === generationStage && <div className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />}
                    </div>
                  )}
                  <span>{stg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* STAGE 3: AI CARD EDITOR & APPROVAL SCREEN */}
        {/* ============================================================ */}
        {reviewMode && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">
                  {generatedCards.length} Cards Generated • {selectedIndices.size} Selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIndices(new Set(generatedCards.map((_, i) => i)))}
                  className="text-purple-700 hover:underline font-semibold"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setSelectedIndices(new Set())}
                  className="text-slate-500 hover:underline"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {/* List of Generated Cards */}
            <div className="max-h-[460px] overflow-y-auto space-y-3 pr-1">
              {generatedCards.map((card, idx) => {
                const isSelected = selectedIndices.has(idx);
                const isEditing = editingIndex === idx;
                const isHighQuality = card.quality ? card.quality.status === "high_quality" : true;

                return (
                  <div
                    key={idx}
                    className={`rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? "border-blue-300 bg-white shadow-soft-sm"
                        : "border-slate-200 bg-slate-50/60 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => toggleSelectCard(idx)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-blue-600 border-blue-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <span className="font-mono text-xs font-bold text-slate-500">
                          #{idx + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isHighQuality ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>High quality</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Needs review</span>
                          </span>
                        )}

                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {card.card_type || "concept"}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleStartEdit(idx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="Edit card"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteCard(idx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Remove card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Editor */}
                    {isEditing ? (
                      <div className="mt-3 space-y-2.5 pt-2 border-t border-slate-100">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600 uppercase">Question</label>
                          <Input
                            value={editQuestion}
                            onChange={(e) => setEditQuestion(e.target.value)}
                            className="text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600 uppercase">Answer</label>
                          <Textarea
                            value={editAnswer}
                            onChange={(e) => setEditAnswer(e.target.value)}
                            rows={2}
                            className="text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-600 uppercase">Hint (Optional)</label>
                          <Input
                            value={editHint}
                            onChange={(e) => setEditHint(e.target.value)}
                            placeholder="Helpful recall prompt without the answer"
                            className="text-xs"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <Button size="sm" variant="outline" onClick={() => setEditingIndex(null)}>
                            Cancel
                          </Button>
                          <Button size="sm" variant="primary" onClick={() => handleSaveEdit(idx)}>
                            Save Edit
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Card Preview */
                      <div className="mt-2.5 pl-7 space-y-2 text-xs">
                        <p className="font-bold text-slate-900 leading-snug">
                          {card.question || card.front}
                        </p>
                        <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                          {card.answer || card.back}
                        </p>
                        {card.hint && (
                          <p className="text-amber-800 text-[11px]">
                            <span className="font-bold">Hint:</span> {card.hint}
                          </p>
                        )}
                        {card.source_reference && (
                          <p className="text-[10.5px] text-slate-400 font-mono">
                            Source: {card.source_reference}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewMode(false)}
              >
                Back to Settings
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveSelectedCards}
                  disabled={selectedIndices.size === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  <span>Save Selected ({selectedIndices.size})</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
