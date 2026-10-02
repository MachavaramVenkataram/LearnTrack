"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  BookOpen,
  Sparkles,
  HelpCircle,
  RotateCw,
  Layers,
  ChevronDown,
  Info,
} from "lucide-react";
import { Flashcard, FlashcardRating } from "@/types/learning";
import { getRatingMeta, calculateNextReview } from "@/lib/flashcards/scheduler";

interface CardFlipProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: (flipped: boolean) => void;
  onRate: (rating: FlashcardRating) => void;
  showKeyboardShortcuts?: boolean;
}

export function CardFlip({
  card,
  isFlipped,
  onFlip,
  onRate,
  showKeyboardShortcuts = true,
}: CardFlipProps) {
  const [showHint, setShowHint] = useState(false);

  // Reset hint state whenever card changes
  useEffect(() => {
    setShowHint(false);
  }, [card.id]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Avoid hijacking if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        onFlip(!isFlipped);
      } else if (isFlipped) {
        if (e.key === "1") {
          e.preventDefault();
          onRate("again");
        } else if (e.key === "2") {
          e.preventDefault();
          onRate("hard");
        } else if (e.key === "3") {
          e.preventDefault();
          onRate("good");
        } else if (e.key === "4") {
          e.preventDefault();
          onRate("easy");
        }
      }
    },
    [isFlipped, onFlip, onRate]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const difficultyColors = {
    easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
    medium: "bg-blue-50 text-blue-700 border-blue-200",
    hard: "bg-purple-50 text-purple-700 border-purple-200",
  };

  const currentDiff = card.difficulty || "medium";
  const diffBadgeClass = difficultyColors[currentDiff] || difficultyColors.medium;

  const ratings: FlashcardRating[] = ["again", "hard", "good", "easy"];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center select-none">
      {/* 3D Perspective Card Container */}
      <div className="perspective-1000 w-full">
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="transform-style-3d flashcard-3d-flip relative w-full min-h-[380px] sm:min-h-[440px] cursor-pointer"
          onClick={() => {
            if (!isFlipped) onFlip(true);
          }}
        >
          {/* ============================================================ */}
          {/* FRONT FACE (Question) */}
          {/* ============================================================ */}
          <div
            className={`backface-hidden absolute inset-0 w-full h-full bg-white rounded-3xl border border-slate-200/90 shadow-card hover:shadow-card-hover hover:border-blue-200 transition-all p-6 sm:p-8 flex flex-col justify-between ${
              isFlipped ? "pointer-events-none" : ""
            }`}
          >
            {/* Top Metadata Header */}
            <div className="flex items-center justify-between gap-2 text-xs border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span className="truncate max-w-[180px] sm:max-w-xs">{card.subject || card.topic}</span>
                </span>
                {card.topic && card.topic !== card.subject && (
                  <span className="hidden sm:inline-block text-slate-400 font-medium">/</span>
                )}
                {card.topic && card.topic !== card.subject && (
                  <span className="hidden sm:inline-block text-slate-500 font-medium truncate max-w-[140px]">
                    {card.topic}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {card.card_type && (
                  <span className="text-[10.5px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                    {card.card_type}
                  </span>
                )}
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${diffBadgeClass}`}>
                  {currentDiff}
                </span>
              </div>
            </div>

            {/* Center Question Body */}
            <div className="flex-1 flex flex-col items-center justify-center py-6 sm:py-8 text-center px-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                Question
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight max-w-lg">
                {card.front || card.question}
              </h2>

              {/* Collapsible Hint Accordion */}
              {card.hint && (
                <div
                  className="mt-5 w-full max-w-md"
                  onClick={(e) => e.stopPropagation()} // Prevent card flip on hint click
                >
                  {!showHint ? (
                    <button
                      type="button"
                      onClick={() => setShowHint(true)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-amber-600 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-50/80 border border-slate-200/80 hover:border-amber-200 transition-colors cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>Need a Hint?</span>
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-left text-xs text-amber-900 leading-relaxed shadow-soft-sm flex items-start gap-2.5"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-800 block text-[11px] uppercase tracking-wide">Hint</span>
                        <p className="mt-0.5">{card.hint}</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Reveal CTA */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="text-[11px] font-medium text-slate-400">
                Active Recall • Answer Hidden
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onFlip(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-soft-sm transition-all cursor-pointer group"
              >
                <span>Reveal Answer</span>
                <RotateCw className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
              </button>
            </div>
          </div>

          {/* ============================================================ */}
          {/* BACK FACE (Answer + Pedagogical Explanation + Source) */}
          {/* ============================================================ */}
          <div
            className={`rotate-y-180 backface-hidden absolute inset-0 w-full h-full bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 flex flex-col justify-between overflow-y-auto ${
              !isFlipped ? "pointer-events-none" : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Metadata Header */}
            <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Answer
                </span>
                <span className="font-semibold text-slate-600 text-xs truncate max-w-[200px]">
                  {card.topic}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onFlip(false)}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Flip back to question"
              >
                <RotateCw className="w-3 h-3" />
                <span>Question</span>
              </button>
            </div>

            {/* Answer & Explanation Content */}
            <div className="py-4 space-y-4">
              {/* Primary Answer */}
              <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-100/80">
                <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                  {card.back || card.answer}
                </p>
              </div>

              {/* Why It Matters / Explanation */}
              {card.explanation && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1 flex items-center gap-1">
                    <Info className="w-3 h-3 text-blue-600" />
                    <span>Why It Matters</span>
                  </span>
                  <p>{card.explanation}</p>
                </div>
              )}

              {/* Example */}
              {card.example && (
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-950 leading-relaxed">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-1">
                    Example
                  </span>
                  <p>{card.example}</p>
                </div>
              )}

              {/* Grounded Source Context */}
              {card.source_reference && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span>Source: {card.source_reference}</span>
                </div>
              )}
            </div>

            {/* Subtle Flip Reminder */}
            <div className="text-center pt-2 text-[11px] text-slate-400">
              Rate your recall quality below to schedule next interval
            </div>
          </div>
        </motion.div>
      </div>

      {/* ============================================================ */}
      {/* SELF-ASSESSMENT RATING BAR (Available when flipped) */}
      {/* ============================================================ */}
      <div className="w-full mt-4">
        {isFlipped ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card space-y-2.5"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>How well did you know this?</span>
              {showKeyboardShortcuts && (
                <span className="hidden sm:inline text-[11px] text-slate-400 font-mono">
                  Keys: 1, 2, 3, 4
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ratings.map((rating) => {
                const meta = getRatingMeta(rating, card);
                const colorStyles = {
                  rose: "border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700",
                  amber: "border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-700",
                  blue: "border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-700",
                  emerald: "border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-700",
                }[meta.colorClass];

                return (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => onRate(rating)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer active:scale-95 shadow-2xs ${colorStyles}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold">{meta.label}</span>
                      {showKeyboardShortcuts && (
                        <span className="hidden sm:inline-block text-[10px] font-mono px-1 py-0.2 rounded bg-white/70 border border-current opacity-70">
                          {meta.shortcut}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] opacity-80 mt-0.5">{meta.subtitle}</span>
                    <span className="text-[10px] font-mono font-semibold mt-1 opacity-90">
                      +{meta.intervalPreview}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-2 text-xs text-slate-400 font-mono">
            {showKeyboardShortcuts && "Press Space to reveal answer • Click card anywhere"}
          </div>
        )}
      </div>
    </div>
  );
}
