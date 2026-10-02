"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Flashcard, FlashcardDeck, FlashcardDifficulty, FlashcardType } from "@/types/learning";
import { createFlashcard } from "@/lib/flashcards/service";
import { useToast } from "@/components/ui/Toast";
import { Eye, BookOpen, Lightbulb, Info } from "lucide-react";

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  decks: FlashcardDeck[];
  defaultDeckId?: string | null;
  onCardCreated: (card: Flashcard) => void;
}

export function CreateCardModal({
  isOpen,
  onClose,
  userId,
  decks,
  defaultDeckId,
  onCardCreated,
}: CreateCardModalProps) {
  const { showToast } = useToast();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [hint, setHint] = useState("");
  const [explanation, setExplanation] = useState("");
  const [example, setExample] = useState("");
  const [subject, setSubject] = useState("Machine Learning");
  const [topic, setTopic] = useState("Model Evaluation");
  const [difficulty, setDifficulty] = useState<FlashcardDifficulty>("medium");
  const [cardType, setCardType] = useState<FlashcardType>("concept");
  const [deckId, setDeckId] = useState<string>(defaultDeckId || (decks[0]?.id || ""));
  const [tagsInput, setTagsInput] = useState("");

  const [previewFace, setPreviewFace] = useState<"front" | "back">("front");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      showToast("Missing Fields", "Question and answer are required.", "info");
      return;
    }

    setIsSaving(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const created = await createFlashcard(userId, {
        deck_id: deckId || null,
        subject: subject.trim(),
        topic: topic.trim() || "General",
        difficulty,
        card_type: cardType,
        front: question.trim(),
        back: answer.trim(),
        question: question.trim(),
        answer: answer.trim(),
        hint: hint.trim() || undefined,
        explanation: explanation.trim() || undefined,
        example: example.trim() || undefined,
        tags,
      });

      onCardCreated(created);
      onClose();

      // Reset
      setQuestion("");
      setAnswer("");
      setHint("");
      setExplanation("");
      setExample("");
      setTagsInput("");
      showToast("Flashcard Created", "Added to your spaced review deck.", "success");
    } catch {
      showToast("Creation Error", "Failed to create flashcard.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSaving && onClose()}
      title="Create Flashcard"
      description="Add an active-recall prompt with detailed explanation and hint."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left Column: Form Fields */}
          <div className="space-y-3.5">
            {/* Subject, Topic & Deck */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Subject</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Machine Learning"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Topic</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Regression Metrics"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Deck</label>
                <select
                  value={deckId}
                  onChange={(e) => setDeckId(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Deck (General)</option>
                  {decks.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Question */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Front (Active Recall Question)</label>
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="What metric is commonly used to measure regression errors in original units?"
                rows={2}
                required
              />
            </div>

            {/* Answer */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Back (Answer)</label>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Mean Absolute Error (MAE) measures the average absolute difference..."
                rows={3}
                required
              />
            </div>

            {/* Hint */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Hint (Optional)</label>
              <Input
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="Prompts retrieval without giving away the exact answer"
              />
            </div>

            {/* Explanation & Example */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Why It Matters</label>
                <Textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Pedagogical reason or theoretical importance..."
                  rows={2}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Example (Optional)</label>
                <Textarea
                  value={example}
                  onChange={(e) => setExample(e.target.value)}
                  placeholder="Concrete scenario or numerical example..."
                  rows={2}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Tags (Comma-separated)</label>
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Evaluation, Metrics, Regression"
              />
            </div>
          </div>

          {/* Right Column: Live Card Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Live Interactive Preview</span>
              </label>

              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setPreviewFace("front")}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-colors ${
                    previewFace === "front" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-500"
                  }`}
                >
                  Front
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFace("back")}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-colors ${
                    previewFace === "back" ? "bg-white text-blue-700 shadow-2xs" : "text-slate-500"
                  }`}
                >
                  Back
                </button>
              </div>
            </div>

            {/* Preview Box */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-card min-h-[360px] flex flex-col justify-between">
              {/* Card Header */}
              <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2.5">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>{topic || "Topic"}</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                  {difficulty}
                </span>
              </div>

              {/* Card Body */}
              <div className="flex-1 py-4 flex flex-col justify-center">
                {previewFace === "front" ? (
                  <div className="text-center space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Question
                    </span>
                    <p className="text-base font-bold text-slate-900 leading-snug">
                      {question || "Type your question on the left to preview..."}
                    </p>
                    {hint && (
                      <div className="inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/80">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Hint: {hint}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Answer
                    </span>
                    <p className="text-sm font-bold text-slate-900 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                      {answer || "Type your answer on the left to preview..."}
                    </p>
                    {explanation && (
                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-500 block text-[10px] uppercase">Why it matters:</span>
                        {explanation}
                      </div>
                    )}
                    {example && (
                      <div className="text-xs text-indigo-900 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100">
                        <span className="font-bold text-indigo-600 block text-[10px] uppercase">Example:</span>
                        {example}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Spaced Repetition: SuperMemo SM-2</span>
                <span>Click tabs above to toggle face</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
            Save Flashcard
          </Button>
        </div>
      </form>
    </Modal>
  );
}
