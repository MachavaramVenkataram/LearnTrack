"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Sparkles,
  Send,
  Loader2,
  Compass,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { TutorMode, ExplainStyle } from "@/types/learning";
import { useToast } from "@/components/ui/Toast";

interface TutorChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: string;
  isSocratic?: boolean;
}

let tutorMsgCounter = 0;
function createMsgId(prefix: string) {
  tutorMsgCounter += 1;
  return `${prefix}-${tutorMsgCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function AITutorPage() {
  const { studentProfile } = useAuth();
  const { showToast } = useToast();

  const [activeMode, setActiveMode] = useState<TutorMode>("Explain");
  const [isSocratic, setIsSocratic] = useState<boolean>(false);
  const [explainStyle, setExplainStyle] = useState<ExplainStyle>("Simply");
  const [selectedSubject, setSelectedSubject] = useState("Machine Learning");
  const selectedTopic = "Optimization & Gradient Descent";

  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<TutorChatMessage[]>([
    {
      id: "m-welcome",
      role: "assistant",
      content: `Hello! I'm your **LearnTrack AI Tutor**.

I specialize in deep concept tutoring, step-by-step problem walkthroughs, and exam preparation. 

Currently tuned to: **${selectedSubject}** • **${activeMode} Mode** ${
        isSocratic ? "• *Socratic Guided Inquiries Active*" : ""
      }.

What academic concept or homework problem would you like to explore today?`,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: TutorChatMessage = {
      id: createMsgId("u"),
      role: "user",
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "tutor_chat",
          query: text,
          mode: activeMode,
          isSocratic,
          explainStyle,
          subject: selectedSubject,
          topic: selectedTopic,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const aiReply: TutorChatMessage = {
        id: createMsgId("ai"),
        role: "assistant",
        content: data.message || "I am analyzing your question.",
        mode: activeMode,
        isSocratic,
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch {
      showToast("Error", "Could not reach AI Tutor. Please retry.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const modes: TutorMode[] = [
    "Explain",
    "Teach",
    "Quiz Me",
    "Give Hint",
    "Solve Step-by-Step",
    "Check My Answer",
    "Exam Mode",
  ];

  const styles: ExplainStyle[] = [
    "Simply",
    "for Exam",
    "with Example",
    "with Analogy",
    "Deep Dive",
  ];

  return (
    <div className="space-y-4">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Bot className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              LearnTrack AI Tutor
            </h1>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
              Interactive Concept Tutoring
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Master engineering and academic concepts through Socratic dialogue, step-by-step problem solving, and adaptive hints.
          </p>
        </div>

        {/* Academic Grounding Pill */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200/70 shrink-0">
          <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
          <span>
            {studentProfile?.semester ? `Semester ${studentProfile.semester}` : "Active Term"} • {selectedSubject}
          </span>
        </div>
      </div>

      {/* 2. Controls & Modes Toolbar */}
      <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        {/* Row 1: Modes Selector */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Mode:
            </span>
            {modes.map((m) => (
              <button
                key={m}
                onClick={() => setActiveMode(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  activeMode === m
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 border border-slate-200/60"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Socratic Mode Toggle Switch */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-50/70 border border-purple-200/70">
            <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-purple-600" />
              <span>Socratic Mode</span>
            </span>
            <button
              onClick={() => {
                const next = !isSocratic;
                setIsSocratic(next);
                showToast(
                  next ? "Socratic Mode Enabled" : "Socratic Mode Disabled",
                  next
                    ? "Tutor will guide you through leading questions instead of giving immediate answers."
                    : "Tutor will provide direct explanations.",
                  "info"
                );
              }}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                isSocratic ? "bg-purple-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.5 ${
                  isSocratic ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Row 2: Explain Like... Style Selector */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Explain Like:
            </span>
            {styles.map((st) => (
              <button
                key={st}
                onClick={() => setExplainStyle(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                  explainStyle === st
                    ? "bg-slate-900 text-white font-semibold"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/70"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-medium text-slate-400">Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none"
            >
              <option value="Machine Learning">Machine Learning</option>
              <option value="Digital Electronics">Digital Electronics</option>
              <option value="Database Management Systems">Database Management</option>
              <option value="Computer Networks">Computer Networks</option>
              <option value="General Mathematics">General Mathematics</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Interactive Tutoring Chat Stream */}
      <div className="h-[calc(100vh-360px)] min-h-[460px] rounded-3xl border border-slate-200 bg-white shadow-soft-sm flex flex-col justify-between overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 max-w-2xl ${
                m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                  m.role === "user"
                    ? "bg-slate-900 text-white border-slate-800"
                    : "bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-white/20 shadow-2xs"
                }`}
              >
                {m.role === "user" ? "You" : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-blue-600 text-white font-medium shadow-2xs"
                    : "bg-slate-50/80 border border-slate-200/80 text-slate-800 shadow-2xs"
                }`}
              >
                {m.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-200/60 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>
                      {m.mode || activeMode} Mode
                    </span>
                    {m.isSocratic && (
                      <span className="text-purple-600 font-mono">• Socratic Inquiry</span>
                    )}
                  </div>
                )}

                <div className="prose prose-sm max-w-none text-xs sm:text-sm whitespace-pre-line leading-relaxed">
                  {m.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 mr-auto max-w-sm p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>AI Tutor is preparing guiding explanation...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 4. Suggested Prompts Strip */}
        <div className="px-4 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Suggested:
          </span>
          {[
            "What is the mathematical purpose of gradient descent?",
            "How do I choose between Ridge and Lasso for exams?",
            "Explain Karnaugh map grouping rules simply",
            "Quiz me on ACID properties",
            "Solve the learning rate divergence problem step-by-step",
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-[11px] font-medium text-slate-600 shrink-0 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* 5. Chat Input Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isSocratic
                  ? "Answer the tutor's inquiry or pose a new concept..."
                  : `Ask AI Tutor anything in ${activeMode} mode...`
              }
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors cursor-pointer shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
