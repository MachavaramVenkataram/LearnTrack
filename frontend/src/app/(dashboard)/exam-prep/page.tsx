"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CalendarCheck2,
  Plus,
  ArrowRight,
  BookOpen,
  Brain,
  ListChecks,
  Trash2,
  Check,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getExamPlans,
  createExamPlan,
  updateExamPlan,
  deleteExamPlan,
} from "@/lib/learning/service";
import { ExamPlan, ExamTopicItem } from "@/types/learning";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ExamPrepPage() {
  const { user } = useAuth();
  const userId = user?.id || "demo-student";
  const { showToast } = useToast();

  const [examPlans, setExamPlans] = useState<ExamPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Exam Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("Machine Learning");
  const [newExamDate, setNewExamDate] = useState("");
  const [newConfidence, setNewConfidence] = useState<"Low" | "Medium" | "High">("Medium");
  const [newTargetScore, setNewTargetScore] = useState(90);
  const [newTopicsText, setNewTopicsText] = useState(
    "Supervised Learning\nLinear Regression\nGradient Descent\nLogistic Regression\nSupport Vector Machines\nNeural Networks"
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const plans = await getExamPlans(userId);
      setExamPlans(plans);

      // Default date: 2 weeks from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 14);
      setNewExamDate(defaultDate.toISOString().split("T")[0]);
    } catch (e) {
      console.error("Failed to load exam plans:", e);
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

  // Toggle topic completion
  const handleToggleTopic = async (planId: string, topicId: string) => {
    const plan = examPlans.find((p) => p.id === planId);
    if (!plan) return;

    const nextTopics = plan.topics.map((t) =>
      t.id === topicId ? { ...t, completed: !t.completed } : t
    );

    const updated = await updateExamPlan(planId, { topics: nextTopics });
    setExamPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
  };

  // Create new Exam Plan
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newExamDate) return;

    const topicsList: ExamTopicItem[] = newTopicsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((name, idx) => ({
        id: `t-${idx + 1}`,
        name,
        completed: false,
        weak: idx % 3 === 0,
      }));

    const created = await createExamPlan({
      user_id: userId,
      subject_name: newSubject.trim(),
      exam_date: newExamDate,
      confidence_level: newConfidence,
      target_score: newTargetScore,
      topics: topicsList,
      status: "active",
    });

    setExamPlans([created, ...examPlans]);
    setIsModalOpen(false);
    showToast("Exam Prep Activated", `Revision roadmap created for ${created.subject_name}.`, "success");
  };

  const handleDeletePlan = async (id: string) => {
    await deleteExamPlan(id);
    setExamPlans((prev) => prev.filter((p) => p.id !== id));
    showToast("Plan Deleted", "Exam plan removed.", "info");
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <CalendarCheck2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Exam Prep Center
            </h1>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-100">
              Syllabus Revision Roadmaps
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track exam countdowns, manage high-yield topic checklists, and launch targeted practice sessions.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-soft-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Upcoming Exam</span>
        </button>
      </div>

      {/* 2. Exam Roadmaps Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-400 font-medium">Loading exam roadmaps...</div>
      ) : examPlans.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white p-8">
          <CalendarCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">No exam roadmaps configured</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Set your upcoming mid-term or end-semester exam dates to generate a tailored revision checklist.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            + Add Exam Plan
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {examPlans.map((plan) => {
            const examTime = new Date(plan.exam_date).getTime();
            const nowTime = new Date().getTime();
            const daysRemaining = Math.max(0, Math.ceil((examTime - nowTime) / 86400000));
            const completedCount = plan.topics.filter((t) => t.completed).length;
            const totalCount = plan.topics.length;
            const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <div
                key={plan.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6"
              >
                {/* Top Countdown Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-blue-600">
                        NEXT EXAM ROADMAP
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          plan.confidence_level === "High"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : plan.confidence_level === "Medium"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {plan.confidence_level} Confidence
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      {plan.subject_name}
                    </h2>
                  </div>

                  {/* Days remaining badge & Target */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-2xl font-black text-slate-900 block leading-tight">
                        {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
                      </span>
                      <span className="text-[10.5px] text-slate-400 font-mono">
                        Target: {plan.target_score || 90}%
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete exam plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                    <span>
                      Topics Mastered: <strong>{completedCount}</strong> of {totalCount}
                    </span>
                    <span className="font-mono text-blue-600 font-semibold">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/60">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Topic Checklist */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Syllabus Revision Checklist
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {plan.topics.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleToggleTopic(plan.id, t.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          t.completed
                            ? "bg-emerald-50/50 border-emerald-200 text-slate-900 font-medium"
                            : "bg-slate-50/70 border-slate-200/80 hover:bg-white text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                              t.completed
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {t.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className={`text-xs truncate ${t.completed ? "line-through text-slate-400" : ""}`}>
                            {t.name}
                          </span>
                        </div>

                        {t.weak && !t.completed && (
                          <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-100 text-amber-800 shrink-0">
                            Weak Area
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Integration Actions with Study Plan & Practice */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href="/notebook"
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Start Revision in Notebook</span>
                    </Link>
                    <Link
                      href="/practice"
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <ListChecks className="w-3.5 h-3.5 text-blue-600" />
                      <span>Practice Mock Quiz</span>
                    </Link>
                    <Link
                      href="/flashcards"
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Brain className="w-3.5 h-3.5 text-purple-600" />
                      <span>Review Flashcards</span>
                    </Link>
                  </div>

                  <Link
                    href="/study-plan"
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>View in AI Study Plan</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Exam Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Upcoming Exam"
        description="Configure target course, examination date, and key syllabus topics."
      >
        <form onSubmit={handleCreatePlan} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Course / Subject Name</label>
            <Input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="e.g. Digital Electronics, Machine Learning"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Exam Date</label>
              <Input
                type="date"
                value={newExamDate}
                onChange={(e) => setNewExamDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Target Score %</label>
              <Input
                type="number"
                min={50}
                max={100}
                value={newTargetScore}
                onChange={(e) => setNewTargetScore(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Current Confidence</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Low", "Medium", "High"] as const).map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setNewConfidence(c)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                    newConfidence === c
                      ? "bg-blue-50 text-blue-700 border-blue-600"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Topics (One per line)</label>
            <textarea
              value={newTopicsText}
              onChange={(e) => setNewTopicsText(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Roadmap
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
