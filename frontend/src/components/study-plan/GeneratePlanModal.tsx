"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  PlanDurationOption,
  StudyPlanGenerationInput,
  StudentAIContext,
} from "@/types/academic";

interface GeneratePlanModalProps {
  isOpen: boolean;
  isGenerating: boolean;
  onClose: () => void;
  context: StudentAIContext | null;
  onGenerate: (input: StudyPlanGenerationInput) => Promise<void>;
}

const GENERATION_STEPS = [
  "Analyzing registered coursework & credits...",
  "Evaluating continuous assessments & performance gaps...",
  "Balancing available daily hours & break intervals...",
  "Synthesizing structured, personalized study timetable...",
];

export function GeneratePlanModal({
  isOpen,
  isGenerating,
  onClose,
  context,
  onGenerate,
}: GeneratePlanModalProps) {
  // Form State
  const [duration, setDuration] = useState<PlanDurationOption>("1_week");
  const [dailyHours, setDailyHours] = useState<number>(3);
  const [preferredTime, setPreferredTime] = useState<
    "morning" | "afternoon" | "evening" | "flexible"
  >("morning");
  const [examDate, setExamDate] = useState<string>("");
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [difficultyAreas, setDifficultyAreas] = useState<string>("");
  const [breakPreference, setBreakPreference] = useState<
    "pomodoro" | "standard" | "long_blocks"
  >("standard");

  // Step ticker state during generation
  const [activeStepIdx, setActiveStepIdx] = useState(0);

  // Initialize priority subjects when modal opens or context becomes available
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen && context?.academic.subjects && context.academic.subjects.length > 0) {
      const sorted = [...context.academic.subjects].sort(
        (a, b) => (a.score ?? 70) - (b.score ?? 70)
      );
      setSelectedSubjectIds(sorted.slice(0, 2).map((s) => s.id));
    }
  }, [isOpen, context]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Step ticker effect while generating
  useEffect(() => {
    if (!isGenerating) {
      return;
    }

    const timer = setInterval(() => {
      setActiveStepIdx((prev) => (prev < GENERATION_STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);

    return () => {
      clearInterval(timer);
      setActiveStepIdx(0);
    };
  }, [isGenerating]);

  const handleToggleSubject = (id: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    const input: StudyPlanGenerationInput = {
      duration,
      daily_hours: dailyHours,
      preferred_time: preferredTime,
      exam_date: examDate || undefined,
      priority_subject_ids: selectedSubjectIds,
      difficulty_areas: difficultyAreas || undefined,
      break_preference: breakPreference,
    };

    await onGenerate(input);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isGenerating) onClose();
      }}
      title="Personalized Study Plan Generator"
      description="Configure your study preferences. The AI engine will balance sessions strictly within your available time."
      maxWidth="lg"
    >
      {isGenerating ? (
        /* Progressive Generation Loading Card */
        <div className="py-8 px-4 text-center space-y-6 animate-in fade-in duration-300">
          <div className="relative w-14 h-14 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto border border-blue-100 shadow-2xs">
            <Sparkles className="w-7 h-7 animate-spin text-[#2563EB]" style={{ animationDuration: "3s" }} />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-base font-bold text-[#0F172A]">
              Generating your study plan...
            </h3>
            <p className="text-xs text-[#64748B]">
              Synthesizing a balanced, realistic schedule based on your coursework.
            </p>
          </div>

          {/* Progressive steps checklist */}
          <div className="max-w-md mx-auto space-y-2 text-left bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            {GENERATION_STEPS.map((stepText, idx) => {
              const isPast = idx < activeStepIdx;
              const isCurrent = idx === activeStepIdx;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 text-xs transition-opacity duration-300 ${
                    isPast
                      ? "text-emerald-700 font-semibold"
                      : isCurrent
                      ? "text-[#2563EB] font-bold"
                      : "text-slate-400 opacity-60"
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                  )}
                  <span>{stepText}</span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400">
            Please wait a moment while LearnTrack prepares your timetable.
          </p>
        </div>
      ) : (
        /* Configuration Form */
        <div className="space-y-5 text-xs text-slate-700 py-1">
          {/* Plan Duration Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0F172A]">
              Plan Duration
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: "1 Day", val: "1_day" },
                { label: "3 Days", val: "3_days" },
                { label: "1 Week", val: "1_week" },
                { label: "2 Weeks", val: "2_weeks" },
                { label: "1 Month", val: "1_month" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setDuration(opt.val as PlanDurationOption)}
                  className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    duration === opt.val
                      ? "bg-[#2563EB] text-white border-[#2563EB] shadow-2xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Available Hours Slider & Input */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#0F172A]">
                Available Study Hours Per Day
              </label>
              <span className="font-mono font-bold text-[#2563EB] text-sm">
                {dailyHours} {dailyHours === 1 ? "hour" : "hours"}/day
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={dailyHours}
              onChange={(e) => setDailyHours(parseFloat(e.target.value))}
              className="w-full accent-[#2563EB] cursor-pointer"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Light (1–2h)</span>
              <span>Moderate (3–4h)</span>
              <span>Intensive (5h+)</span>
            </div>
          </div>

          {/* Preferred Study Timing */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0F172A]">
              Preferred Study Time
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Morning (8–12)", val: "morning" },
                { label: "Afternoon (12–17)", val: "afternoon" },
                { label: "Evening (17–22)", val: "evening" },
                { label: "Flexible", val: "flexible" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() =>
                    setPreferredTime(
                      opt.val as "morning" | "afternoon" | "evening" | "flexible"
                    )
                  }
                  className={`py-2 px-2 text-center rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                    preferredTime === opt.val
                      ? "bg-blue-50 text-[#2563EB] border-blue-300 font-bold"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Subjects Checklist */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#0F172A]">
                Priority Focus Subjects
              </label>
              <span className="text-[11px] text-slate-400">
                {selectedSubjectIds.length} selected
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-1.5">
              Select courses where you need extra revision or practice.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1">
              {context?.academic.subjects && context.academic.subjects.length > 0 ? (
                context.academic.subjects.map((sub) => {
                  const isChecked = selectedSubjectIds.includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => handleToggleSubject(sub.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                        isChecked
                          ? "bg-blue-50/70 border-blue-300 text-blue-900 font-medium shadow-2xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span className="truncate mr-2">{sub.name}</span>
                      <span className="font-mono text-[11px] text-slate-500 shrink-0">
                        {sub.score !== null && sub.score !== undefined
                          ? `${sub.score}%`
                          : "—"}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 col-span-2 py-2">
                  No subjects currently registered.
                </p>
              )}
            </div>
          </div>

          {/* Optional Exam Date & Break Strategy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F172A]">
                Exam / Deadline Date (Optional)
              </label>
              <Input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0F172A]">
                Break Strategy
              </label>
              <select
                value={breakPreference}
                onChange={(e) =>
                  setBreakPreference(
                    e.target.value as "pomodoro" | "standard" | "long_blocks"
                  )
                }
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-100 cursor-pointer"
              >
                <option value="standard">Standard (50m study / 10m break)</option>
                <option value="pomodoro">Pomodoro (25m study / 5m break)</option>
                <option value="long_blocks">Deep Work (90m study / 15m break)</option>
              </select>
            </div>
          </div>

          {/* Weak topics / notes */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-[#0F172A]">
              Specific Weak Topics / Notes (Optional)
            </label>
            <Input
              placeholder="e.g., Dynamic programming, SQL Normalization, Bayes theorem"
              value={difficultyAreas}
              onChange={(e) => setDifficultyAreas(e.target.value)}
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
              AI-generated recommendations based on your coursework data. Review and adjust based on your personal pace.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                Generate AI Plan
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
