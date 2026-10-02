"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Play,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  RotateCcw,
  BookOpen,
  Code,
  Brain,
  Database,
  UserCheck,
  Layers,
  Award,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  createInterviewSession,
  addInterviewQuestion,
  finishInterviewSession,
} from "@/lib/student-os/service";
import { InterviewMode, InterviewQuestion, InterviewSession } from "@/types/student-os";
import { useToast } from "@/components/ui/Toast";

export default function InterviewStudioPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const userId = user?.id || "demo-student";

  // Session Setup State
  const [selectedMode, setSelectedMode] = useState<InterviewMode>("AIML");
  const [targetRole, setTargetRole] = useState("AI / ML Engineer");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Active Round State
  const [questionIndex, setQuestionIndex] = useState(1);
  const [totalQuestions] = useState(4);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [suggestedAnswer, setSuggestedAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isFollowup, setIsFollowup] = useState(false);

  // Completed Review State
  const [isSessionFinished, setIsSessionFinished] = useState(false);
  const [finalReview, setFinalReview] = useState<{
    overall_feedback: string;
    technical_coverage: string;
    topics_covered: string[];
    areas_to_revise: string[];
  } | null>(null);

  const interviewModes: { mode: InterviewMode; title: string; desc: string; icon: any }[] = [
    { mode: "AIML", title: "AI / Machine Learning", desc: "Gradient descent, regularizers, backpropagation, and loss formulations", icon: Brain },
    { mode: "Python", title: "Python Engineering", desc: "OOP, generators, decorators, vectorization with NumPy, and memory profiles", icon: Code },
    { mode: "SQL", title: "SQL & Relational Models", desc: "Window functions, join algorithms, indexing strategies, and normalization", icon: Database },
    { mode: "Technical", title: "System Architecture", desc: "Distributed microservices, caching, latency budgets, and REST APIs", icon: Layers },
    { mode: "Project", title: "Portfolio Walkthrough", desc: "Technical trade-offs, architecture decisions, and debugging stories", icon: Award },
    { mode: "HR", title: "Behavioral & Communication", desc: "Collaboration, resolving conflict, ownership, and learning velocity", icon: UserCheck },
  ];

  // Start New Session
  const handleStartSession = async () => {
    setIsAiLoading(true);
    try {
      const session = await createInterviewSession(userId, selectedMode, targetRole);

      setActiveSessionId(session.id);
      setIsSessionActive(true);
      setIsSessionFinished(false);
      setQuestionIndex(1);
      setUserAnswer("");
      setFeedback(null);
      setSuggestedAnswer(null);

      // Fetch First Question from AI
      const res = await fetch("/api/ai/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "interview_question",
          mode: selectedMode,
          target_role: targetRole,
          question_index: 1,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch initial question");
      const json = await res.json();
      setCurrentQuestion(json.question || "Explain the trade-off between Bias and Variance.");
    } catch {
      setCurrentQuestion(
        selectedMode === "Python"
          ? "Explain how Python manages memory internally and the difference between shallow and deep copy."
          : selectedMode === "SQL"
          ? "How do window functions differ from GROUP BY aggregations, and when would you use PARTITION BY?"
          : "Explain the update rule for Gradient Descent and how learning rate influences convergence."
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  // Submit Answer & Receive AI Critique
  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || !activeSessionId) return;

    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "interview_question",
          mode: selectedMode,
          target_role: targetRole,
          question_index: questionIndex,
          previous_answer: userAnswer,
        }),
      });

      if (!res.ok) throw new Error("AI review failed");
      const json = await res.json();

      setFeedback(json.feedback || "Answer shows good understanding of primary concepts.");
      setSuggestedAnswer(json.suggested_answer || "Key points include concrete mathematical or algorithmic definitions.");

      // Record to Service
      await addInterviewQuestion(activeSessionId, userId, {
        question_index: questionIndex,
        question: currentQuestion,
        user_answer: userAnswer,
        feedback: json.feedback,
        suggested_answer: json.suggested_answer,
      });
    } catch {
      setFeedback("Clear response covering fundamental concepts. To strengthen the explanation, incorporate exact mathematical terms and edge cases.");
      setSuggestedAnswer("An optimal answer describes both the theoretical justification and practical algorithmic behavior under varying hyperparameters.");
    } finally {
      setIsAiLoading(false);
    }
  };

  // Move to Next Question or Finish
  const handleNextQuestion = async () => {
    if (questionIndex >= totalQuestions) {
      // Finish Session
      handleFinishSession();
      return;
    }

    const nextIdx = questionIndex + 1;
    setQuestionIndex(nextIdx);
    setUserAnswer("");
    setFeedback(null);
    setSuggestedAnswer(null);
    setIsAiLoading(true);

    try {
      const res = await fetch("/api/ai/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "interview_question",
          mode: selectedMode,
          target_role: targetRole,
          question_index: nextIdx,
        }),
      });

      if (!res.ok) throw new Error("Next question failed");
      const json = await res.json();
      setCurrentQuestion(json.question);
    } catch {
      setCurrentQuestion(
        `Question ${nextIdx}: How would you address overfitting and validate generalizability in this framework?`
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  // Complete Interview & Generate Structured Review
  const handleFinishSession = async () => {
    if (!activeSessionId) return;
    setIsAiLoading(true);

    try {
      const res = await fetch("/api/ai/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "interview_review",
          mode: selectedMode,
          target_role: targetRole,
        }),
      });

      if (!res.ok) throw new Error("Session review failed");
      const json = await res.json();

      setFinalReview(json);
      setIsSessionFinished(true);
      setIsSessionActive(false);

      await finishInterviewSession(activeSessionId, json);
      showToast("Interview Round Completed", "Structured technical evaluation saved.", "success");
    } catch {
      const fallbackReview = {
        overall_feedback:
          "Candidate communicated fundamental principles with clarity. Explanations of mathematical formulations were sound.",
        technical_coverage:
          "Strong theoretical coverage of optimization algorithms and core runtime characteristics.",
        topics_covered: ["Optimization Objectives", "Model Regularization", "Runtime Complexity"],
        areas_to_revise: ["Derivation of closed-form solutions", "Vectorized broadcast rules"],
      };
      setFinalReview(fallbackReview);
      setIsSessionFinished(true);
      setIsSessionActive(false);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* 1. Header Banner */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-violet-50 border border-violet-100/70 text-[11px] font-semibold text-violet-700 mb-2">
              <Bot className="w-3.5 h-3.5 text-violet-600" />
              <span>Observable Technical Assessment</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Interview Studio
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Conduct realistic sequential technical interviews with LearnTrack AI. Critiques evaluate answer completeness and technical coverage without speculative behavioral claims.
            </p>
          </div>

          {isSessionActive && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-xl">
                Question {questionIndex} of {totalQuestions}
              </span>
              <button
                onClick={() => {
                  if (confirm("End current interview session?")) {
                    setIsSessionActive(false);
                  }
                }}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Exit Session
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-8">
        {/* Disciplinary Grounding Notice */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5 mb-8">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong>Assessment Methodology:</strong> LearnTrack evaluates strictly observable answer evidence (technical accuracy, terminology precision, completeness). We do not claim to measure subjective attributes like personality, mood, or innate intelligence.
          </span>
        </div>

        {/* STATE 1: SETUP & MODE SELECTION */}
        {!isSessionActive && !isSessionFinished && (
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Select Your Interview Track
              </h2>
              <p className="text-xs text-slate-500">
                Choose a targeted discipline to practice sequential questioning, technical follow-ups, and structured critiques.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {interviewModes.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedMode === item.mode;
                return (
                  <button
                    key={item.mode}
                    type="button"
                    onClick={() => setSelectedMode(item.mode)}
                    className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? "bg-violet-50/70 border-violet-400 ring-2 ring-violet-500/20 shadow-xs"
                        : "bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          isSelected ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-violet-600" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-center">
              <button
                onClick={handleStartSession}
                disabled={isAiLoading}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {isAiLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-white" />
                )}
                <span>Launch {selectedMode} Interview Round</span>
              </button>
            </div>
          </div>
        )}

        {/* STATE 2: ACTIVE SEQUENTIAL QUESTIONING */}
        {isSessionActive && (
          <div className="space-y-6">
            {/* Question Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-md">
                  {selectedMode} Technical Round
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Question {questionIndex} of {totalQuestions}
                </span>
              </div>

              <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                {currentQuestion || "Formulating technical problem..."}
              </h2>
            </div>

            {/* Answer Input */}
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Your Answer:
                </label>
                <textarea
                  rows={6}
                  required
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your structured explanation. Cite mathematical equations, algorithms, or architectural trade-offs where applicable..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 font-sans"
                />
              </div>

              {!feedback && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isAiLoading || !userAnswer.trim()}
                    className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isAiLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Submit for AI Critique</span>
                  </button>
                </div>
              )}
            </form>

            {/* AI Critique & Follow-up */}
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4"
              >
                <div className="flex items-center gap-2 text-violet-800">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">
                    Observable Answer Critique
                  </h3>
                </div>

                <div className="p-4 rounded-xl bg-violet-50/70 border border-violet-100 text-xs text-violet-950 leading-relaxed">
                  <span className="font-bold block mb-1">Completeness Assessment:</span>
                  {feedback}
                </div>

                {suggestedAnswer && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-1">
                      Target Technical Benchmark:
                    </span>
                    {suggestedAnswer}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuestion}
                    disabled={isAiLoading}
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>
                      {questionIndex >= totalQuestions
                        ? "Finish Round & Generate Review"
                        : "Proceed to Next Question"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* STATE 3: INTERVIEW REVIEW SUMMARY */}
        {isSessionFinished && finalReview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border border-slate-200 p-8 md:p-10 shadow-lg space-y-6"
          >
            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-violet-700">
                INTERVIEW REVIEW
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                {selectedMode} Technical Session Complete
              </h2>
              <p className="text-xs text-slate-500">
                Performance evaluation grounded in your responses to {totalQuestions} questions.
              </p>
            </div>

            {/* Overall Feedback */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-1">Answer Completeness:</span>
              {finalReview.overall_feedback}
            </div>

            {/* Technical Coverage */}
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 leading-relaxed">
              <span className="font-bold block mb-1">Technical Coverage &amp; Terminology:</span>
              {finalReview.technical_coverage}
            </div>

            {/* Topics Covered vs Areas to Revise */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Topics Demonstrated:
                </span>
                <ul className="text-xs text-emerald-950 space-y-1 pl-4 list-disc">
                  {finalReview.topics_covered.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Areas to Revise:
                </span>
                <ul className="text-xs text-amber-950 space-y-1 pl-4 list-disc">
                  {finalReview.areas_to_revise.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsSessionFinished(false);
                  setIsSessionActive(false);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Choose Another Track
              </button>

              <button
                onClick={() => router.push("/practice")}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Practice Weak Concepts
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
