"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  X,
  MessageSquare,
  HelpCircle,
  FileText,
  CheckCircle2,
  Layers,
  Calendar,
  ArrowRight,
  Send,
} from "lucide-react";

export function GlobalAILauncher() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle outside click & escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (launcherRef.current && !launcherRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleAsk = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;
    const query = encodeURIComponent(prompt.trim());
    setIsOpen(false);
    setPrompt("");
    router.push(`/tutor?q=${query}`);
  };

  const handleAction = (url: string) => {
    setIsOpen(false);
    router.push(url);
  };

  return (
    <div ref={launcherRef} className="fixed bottom-6 right-6 z-50 print:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute bottom-14 right-0 w-[350px] sm:w-[390px] rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.22),0_0_0_1px_rgba(15,23,42,0.05)] overflow-hidden flex flex-col"
          >
            {/* Top Gradient Header */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-tight">Ask LearnTrack</h3>
                    <p className="text-2xs text-blue-200/80">AI Learning Operating System</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 rounded-md flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Input Bar */}
              <form onSubmit={handleAsk} className="mt-3 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask a question or topic..."
                  className="w-full h-9 pl-3 pr-8 rounded-lg bg-white/10 border border-white/20 text-xs text-white placeholder:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white/15 transition-all"
                />
                <button
                  type="submit"
                  disabled={!prompt.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center text-blue-300 hover:text-white disabled:opacity-30 transition-opacity cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Quick Actions Menu */}
            <div className="p-3 bg-slate-50/60 border-t border-slate-100">
              <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400 px-1">
                What would you like to do?
              </span>

              <div className="mt-2 space-y-1">
                {[
                  {
                    title: "Ask a Question",
                    desc: "Academic & course advisor chat",
                    icon: <MessageSquare className="w-4 h-4 text-blue-600" />,
                    bg: "bg-blue-50/80",
                    url: "/assistant",
                  },
                  {
                    title: "Explain a Topic",
                    desc: "Interactive Socratic AI tutor",
                    icon: <HelpCircle className="w-4 h-4 text-purple-600" />,
                    bg: "bg-purple-50/80",
                    url: "/tutor?action=explain",
                  },
                  {
                    title: "Summarize Notes",
                    desc: "Extract key concepts & formulas",
                    icon: <FileText className="w-4 h-4 text-indigo-600" />,
                    bg: "bg-indigo-50/80",
                    url: "/knowledge",
                  },
                  {
                    title: "Generate Quiz",
                    desc: "Practice Lab with instant feedback",
                    icon: <CheckCircle2 className="w-4 h-4 text-cyan-600" />,
                    bg: "bg-cyan-50/80",
                    url: "/practice?action=generate",
                  },
                  {
                    title: "Create Flashcards",
                    desc: "Spaced repetition deck from notes",
                    icon: <Layers className="w-4 h-4 text-amber-600" />,
                    bg: "bg-amber-50/80",
                    url: "/flashcards?action=generate",
                  },
                  {
                    title: "Create Study Plan",
                    desc: "Personalized weekly schedule",
                    icon: <Calendar className="w-4 h-4 text-emerald-600" />,
                    bg: "bg-emerald-50/80",
                    url: "/study-plan?action=generate",
                  },
                ].map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAction(action.url)}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-white hover:shadow-2xs transition-all group border border-transparent hover:border-slate-200/60 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg ${action.bg} flex items-center justify-center shrink-0`}>
                        {action.icon}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {action.title}
                        </div>
                        <div className="text-2xs text-slate-400">{action.desc}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center justify-between text-2xs text-slate-400 select-none">
              <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-100 font-mono text-[9px] border border-slate-200">Ctrl+K</kbd> for all commands</span>
              <span className="text-blue-600 font-medium">LearnTrack AI</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-950 text-white font-medium text-xs shadow-[0_4px_20px_rgba(37,99,235,0.22)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.38)] hover:-translate-y-0.5 transition-all duration-300 group border border-slate-800/80 cursor-pointer"
        aria-label="Ask LearnTrack AI Launcher"
      >
        <div className="w-5 h-5 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-400 group-hover:text-blue-300 transition-colors">
          <Sparkles className="w-3.5 h-3.5 transition-transform duration-300 ease-out group-hover:rotate-[360deg]" />
        </div>
        <span className="font-semibold tracking-wide hidden sm:inline">Ask LearnTrack</span>
      </button>
    </div>
  );
}
