"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ListChecks,
  Play,
  CheckCircle2,
  XCircle,
  RotateCw,
  Brain,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getQuizzes,
  createQuiz,
  recordQuizAttempt,
  getNotebooks,
} from "@/lib/learning/service";
import { Quiz, QuizAttempt } from "@/types/learning";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function PracticeLabPage() {
  const { user } = useAuth();
  const userId = user?.id || "demo-student";
  const { showToast } = useToast();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Quiz Playing State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizStartTime, setQuizStartTime] = useState<number>(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [latestAttempt, setLatestAttempt] = useState<QuizAttempt | null>(null);

  // Generate Quiz Modal State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [genSubject, setGenSubject] = useState("Machine Learning");
  const [genTopic, setGenTopic] = useState("Gradient Descent & Regularization");
  const [genDifficulty, setGenDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [genCount, setGenCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [qList, nbList] = await Promise.all([
        getQuizzes(userId),
        getNotebooks(userId),
      ]);
      setQuizzes(qList);
      if (nbList[0]) setGenSubject(nbList[0].title);
    } catch (e) {
      console.error("Failed to load practice quizzes:", e);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        void loadData();
      }
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [loadData]);

  // Start a Quiz
  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setHasCheckedAnswer(false);
    setQuizScore(0);
    setUserAnswers([]);
    setQuizStartTime(Date.now());
    setIsQuizFinished(false);
    setLatestAttempt(null);
  };

  // Check Answer for Current Question
  const handleCheckAnswer = () => {
    if (selectedOptionIndex === null || !activeQuiz) return;
    const currentQ = activeQuiz.questions[currentQuestionIndex];
    const isCorrect = selectedOptionIndex === currentQ.correct_index;

    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }

    setUserAnswers((prev) => [...prev, selectedOptionIndex]);
    setHasCheckedAnswer(true);
  };

  // Next Question or Finish
  const handleNextQuestion = async () => {
    if (!activeQuiz) return;

    if (currentQuestionIndex + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
      setHasCheckedAnswer(false);
    } else {
      // Calculate final results
      const timeSpent = Math.round((Date.now() - quizStartTime) / 1000);
      const totalQ = activeQuiz.questions.length;
      const finalScore = quizScore;
      const accuracy = Math.round((finalScore / totalQ) * 100);

      // Determine weak topics
      const weak: string[] = [];
      if (accuracy < 100) {
        weak.push(activeQuiz.topic);
      }

      const attempt = await recordQuizAttempt({
        quiz_id: activeQuiz.id,
        user_id: userId,
        score: finalScore,
        total_questions: totalQ,
        accuracy,
        time_seconds: timeSpent,
        user_answers: userAnswers,
        weak_topics: weak,
      });

      setLatestAttempt(attempt);
      setIsQuizFinished(true);
    }
  };

  // Generate Quiz with AI
  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch("/api/ai/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_quiz",
          subject: genSubject,
          topic: genTopic,
          difficulty: genDifficulty,
          count: genCount,
          questionType: "mcq",
        }),
      });

      const data = await res.json();
      if (data.questions && Array.isArray(data.questions)) {
        const created = await createQuiz({
          user_id: userId,
          title: data.title || `${genSubject}: ${genTopic} Quiz`,
          topic: genTopic,
          difficulty: genDifficulty,
          question_count: data.questions.length,
          questions: data.questions,
        });

        setQuizzes([created, ...quizzes]);
        setIsGenerateModalOpen(false);
        showToast("Quiz Generated!", `Created a ${genDifficulty} practice quiz.`, "success");
        handleStartQuiz(created);
      }
    } catch {
      showToast("Generation Error", "Could not synthesize quiz questions.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Active question
  const currentQ = activeQuiz?.questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <ListChecks className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Practice Lab
            </h1>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
              Interactive Assessment
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate adaptive practice quizzes from your course materials and detect weak conceptual areas.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-soft-sm transition-colors cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate New Quiz</span>
        </button>
      </div>

      {/* 2. ACTIVE QUIZ INTERFACE (When Taking a Quiz) */}
      {activeQuiz && !isQuizFinished && currentQ && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-elevated space-y-6">
          {/* Progress top bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">{activeQuiz.title}</span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 font-semibold">{activeQuiz.difficulty}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono font-semibold text-blue-600">
                Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
              </span>
              <button
                onClick={() => setActiveQuiz(null)}
                className="text-slate-400 hover:text-slate-700 font-medium text-xs"
              >
                Quit
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
              {currentQ.type === "true_false" ? "True / False" : "Multiple Choice Question"}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* Options List */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = selectedOptionIndex === oIdx;
              const isCorrectAnswer = hasCheckedAnswer && oIdx === currentQ.correct_index;
              const isWrongChoice = hasCheckedAnswer && isSelected && oIdx !== currentQ.correct_index;

              let style = "bg-white border-slate-200 hover:bg-slate-50 text-slate-800";
              if (isSelected && !hasCheckedAnswer) {
                style = "bg-blue-50/70 border-blue-600 text-blue-900 font-medium shadow-2xs";
              } else if (isCorrectAnswer) {
                style = "bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold shadow-2xs";
              } else if (isWrongChoice) {
                style = "bg-rose-50 border-rose-400 text-rose-950 font-medium";
              }

              return (
                <div
                  key={oIdx}
                  onClick={() => !hasCheckedAnswer && setSelectedOptionIndex(oIdx)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center border shrink-0 ${
                        isCorrectAnswer
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : isWrongChoice
                          ? "bg-rose-600 text-white border-rose-600"
                          : isSelected
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span className="text-xs sm:text-sm">{opt}</span>
                  </div>

                  {hasCheckedAnswer && isCorrectAnswer && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {hasCheckedAnswer && isWrongChoice && (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Explanation Banner (Shows AFTER checking answer) */}
          {hasCheckedAnswer && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10.5px]">
                {selectedOptionIndex === currentQ.correct_index ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer!
                  </span>
                ) : (
                  <span className="text-rose-700 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Incorrect
                  </span>
                )}
              </div>

              <p className="text-slate-700 leading-relaxed">
                {currentQ.explanation}
              </p>

              {currentQ.source_citation && (
                <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 font-mono">
                  Grounded Citation: {currentQ.source_citation}
                </div>
              )}
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {!hasCheckedAnswer ? (
              <button
                onClick={handleCheckAnswer}
                disabled={selectedOptionIndex === null}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-soft-sm transition-all cursor-pointer"
              >
                Check Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-soft-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>{currentQuestionIndex + 1 < activeQuiz.questions.length ? "Next Question" : "View Quiz Results"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. POST-QUIZ RESULTS SCREEN */}
      {isQuizFinished && latestAttempt && activeQuiz && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-elevated space-y-6 animate-in fade-in zoom-in-[0.99] duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider">
                Assessment Complete
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                Quiz Results: {activeQuiz.title}
              </h2>
            </div>
            <button
              onClick={() => handleStartQuiz(activeQuiz)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Retry Quiz</span>
            </button>
          </div>

          {/* Results Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Score
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {latestAttempt.score} / {latestAttempt.total_questions}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Accuracy
              </span>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {latestAttempt.accuracy}%
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Time Spent
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {latestAttempt.time_seconds}s
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Status
              </span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {latestAttempt.accuracy >= 70 ? "Passed" : "Needs Review"}
              </p>
            </div>
          </div>

          {/* Weak Topics & Intelligent Next Action */}
          {latestAttempt.weak_topics.length > 0 ? (
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
                <Brain className="w-4 h-4 text-amber-600" />
                <span>LearnTrack Detected Lower Performance In:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {latestAttempt.weak_topics.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-900 text-xs font-semibold"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                We recommend reviewing related course notes or asking AI Tutor to guide you through these concepts before your next exam.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link
                  href="/notebook"
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors"
                >
                  Review Weak Topics in Notebook
                </Link>
                <Link
                  href="/tutor"
                  className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-semibold text-xs hover:bg-amber-100 transition-colors"
                >
                  Ask AI Tutor to Explain
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-xs text-emerald-900">
                <p className="font-bold">Outstanding Performance!</p>
                <p className="text-emerald-700">You achieved full accuracy on all questions in this topic.</p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setActiveQuiz(null)}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs"
            >
              Return to Practice Lab
            </button>
          </div>
        </div>
      )}

      {/* 4. Available Quizzes Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900 tracking-tight">
          Practice Quizzes ({quizzes.length})
        </h2>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-medium">Loading practice quizzes...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 hover:border-blue-200 hover:shadow-card transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10.5px] font-semibold border border-blue-100">
                    {quiz.difficulty}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {quiz.question_count} Questions
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {quiz.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{quiz.topic}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10.5px] text-slate-400 font-mono">
                  {new Date(quiz.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                </span>
                <button
                  onClick={() => handleStartQuiz(quiz)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Start Quiz</span>
                </button>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* Generate Quiz Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => !isGenerating && setIsGenerateModalOpen(false)}
        title="Generate AI Practice Quiz"
        description="Configure topic, difficulty, and question count to build an interactive quiz."
      >
        <form onSubmit={handleGenerateQuiz} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Course / Subject</label>
            <Input
              value={genSubject}
              onChange={(e) => setGenSubject(e.target.value)}
              placeholder="e.g. Machine Learning, Digital Electronics"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Specific Topic / Chapter</label>
            <Input
              value={genTopic}
              onChange={(e) => setGenTopic(e.target.value)}
              placeholder="e.g. Gradient Descent, Karnaugh Maps, SQL Transactions"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Difficulty</label>
              <div className="grid grid-cols-3 gap-1">
                {(["Easy", "Medium", "Hard"] as const).map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setGenDifficulty(d)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      genDifficulty === d
                        ? "bg-blue-50 text-blue-700 border-blue-600"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Questions</label>
              <div className="grid grid-cols-3 gap-1">
                {[3, 5, 8].map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setGenCount(n)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      genCount === n
                        ? "bg-blue-50 text-blue-700 border-blue-600"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {n} Qs
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsGenerateModalOpen(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isGenerating}>
              Synthesize Quiz
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
