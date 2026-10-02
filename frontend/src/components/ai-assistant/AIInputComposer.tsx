"use client";

import React, { useRef, useEffect } from "react";
import { ArrowUp, Sparkles, Loader2 } from "lucide-react";

interface AIInputComposerProps {
  inputMessage: string;
  isThinking: boolean;
  onInputChange: (val: string) => void;
  onSendMessage: () => void;
}

export function AIInputComposer({
  inputMessage,
  isThinking,
  onInputChange,
  onSendMessage,
}: AIInputComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on load
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Keyboard shortcut: Enter to send, Shift + Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage.trim() && !isThinking) {
        onSendMessage();
      }
    }
  };

  return (
    <div className="p-3 sm:p-4 border-t border-slate-200/80 bg-white/95 backdrop-blur-xs shrink-0 z-10">
      {/* Floating Composer Card (Requirements #25 - #29) */}
      <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200/90 bg-white shadow-xs focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all p-3 space-y-2">
        {/* Top Context Indicator inside composer (Requirement #27) */}
        <div className="flex items-center justify-between px-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Context: LearnTrack Workspace</span>
          </div>

          <span className="text-[10px] text-slate-400 hidden sm:inline">
            Press <strong className="font-semibold text-slate-600">Enter</strong> to send · <strong className="font-semibold text-slate-600">Shift + Enter</strong> for newline
          </span>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your academics, coursework, study plans, or concepts..."
          rows={2}
          disabled={isThinking}
          className="w-full bg-transparent resize-none border-0 p-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden disabled:opacity-50 font-normal leading-relaxed"
        />

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100/90 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
              Academic Intelligence Engine
            </span>
          </div>

          {/* Primary Send Button (Requirement #28) */}
          <button
            onClick={onSendMessage}
            disabled={!inputMessage.trim() || isThinking}
            className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center justify-center shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none cursor-pointer group"
            title="Send message"
            aria-label="Send message"
          >
            {isThinking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform duration-150" />
            )}
          </button>
        </div>
      </div>

      {/* Concise AI Disclaimer (Requirement #38) */}
      <p className="text-[10px] text-slate-400 text-center mt-2 max-w-xl mx-auto leading-normal">
        AI-generated responses may contain errors. Review important information and use LearnTrack&apos;s academic data as supporting context.
      </p>
    </div>
  );
}
