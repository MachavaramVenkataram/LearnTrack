"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Target,
  Award,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  AlertCircle,
  X,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import { AcademicGoal, GoalType, Subject } from "@/types/academic";
import { createAcademicGoal, updateAcademicGoal } from "@/lib/academic/service";
import { useToast } from "@/components/ui/Toast";

export interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  subjects: Subject[];
  editingGoal?: AcademicGoal | null;
  initialGoalType?: GoalType;
  onSuccess: () => Promise<void> | void;
}

export function CreateGoalModal({
  isOpen,
  onClose,
  studentId,
  subjects,
  editingGoal,
  initialGoalType = "average_score",
  onSuccess,
}: CreateGoalModalProps) {
  const { showToast } = useToast();

  // Form Fields
  const [goalType, setGoalType] = useState<GoalType>(initialGoalType);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetValue, setTargetValue] = useState("85");
  const [unit, setUnit] = useState("%");
  const [subjectId, setSubjectId] = useState("");
  const [deadline, setDeadline] = useState("");

  // Interaction States
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Element Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Synchronize initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement | null;
      setIsClosing(false);
      setShowDiscardConfirm(false);
      setFormErrors({});

      if (editingGoal) {
        setTitle(editingGoal.title);
        setDescription(editingGoal.description || "");
        setGoalType(editingGoal.goal_type);
        setTargetValue(String(editingGoal.target_value));
        setUnit(editingGoal.unit || "%");
        setSubjectId(editingGoal.subject_id || "");
        setDeadline(editingGoal.deadline ? editingGoal.deadline.split("T")[0] : "");
      } else {
        const type = initialGoalType || "average_score";
        setGoalType(type);
        setDescription("");
        setSubjectId(subjects.length > 0 ? subjects[0].id : "");

        // Set tailored default title & target value based on goal type
        if (type === "attendance") {
          setTitle("Maintain 85%+ Attendance");
          setTargetValue("85");
          setUnit("%");
        } else if (type === "study_hours") {
          setTitle("Complete 20 Hours of Focused Study");
          setTargetValue("20");
          setUnit("hours");
        } else if (type === "assignments") {
          setTitle("Complete All Coursework Assignments");
          setTargetValue("10");
          setUnit("assignments");
        } else if (type === "subject_score") {
          const firstSub = subjects[0]?.subject_name || "Course";
          setTitle(`Target 85%+ in ${firstSub}`);
          setTargetValue("85");
          setUnit("%");
        } else {
          setTitle("Achieve 80%+ Cumulative Average");
          setTargetValue("80");
          setUnit("%");
        }

        // Default deadline: 30 days from now
        const d = new Date();
        d.setDate(d.getDate() + 30);
        setDeadline(d.toISOString().split("T")[0]);
      }

      // Auto-focus title on open
      const timer = setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);

      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "unset";
      };
    } else {
      document.body.style.overflow = "unset";
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen, editingGoal, initialGoalType, subjects]);

  // Handle Goal Type Change with smart dynamic defaults
  const handleGoalTypeChange = (newType: GoalType) => {
    setGoalType(newType);
    if (!editingGoal) {
      if (newType === "attendance") {
        setUnit("%");
        setTargetValue("85");
        setTitle("Maintain 85%+ Attendance");
      } else if (newType === "study_hours") {
        setUnit("hours");
        setTargetValue("20");
        setTitle("Complete 20 Hours of Focused Study");
      } else if (newType === "assignments") {
        setUnit("assignments");
        setTargetValue("10");
        setTitle("Complete All Coursework Assignments");
      } else if (newType === "subject_score") {
        setUnit("%");
        setTargetValue("85");
        const subName = subjects.find((s) => s.id === subjectId)?.subject_name || subjects[0]?.subject_name || "Course";
        setTitle(`Target 85%+ in ${subName}`);
        if (!subjectId && subjects.length > 0) {
          setSubjectId(subjects[0].id);
        }
      } else {
        setUnit("%");
        setTargetValue("80");
        setTitle("Achieve 80%+ Cumulative Average");
      }
    }
  };

  // Check if form is dirty
  const isDirty = Boolean(
    editingGoal
      ? title !== editingGoal.title ||
        description !== (editingGoal.description || "") ||
        targetValue !== String(editingGoal.target_value)
      : title.trim().length > 0 && title !== "Achieve 80%+ Cumulative Average"
  );

  // Close animation handler
  const handleRequestClose = useCallback(() => {
    if (isSubmitting) return;

    if (isDirty && !showDiscardConfirm) {
      setShowDiscardConfirm(true);
      return;
    }

    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setShowDiscardConfirm(false);
      onClose();
    }, 160);
  }, [isSubmitting, isDirty, showDiscardConfirm, onClose]);

  // Confirm discard
  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false);
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 160);
  };

  // Keyboard navigation & Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (showDiscardConfirm) {
          setShowDiscardConfirm(false);
        } else {
          handleRequestClose();
        }
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showDiscardConfirm, handleRequestClose]);

  // Submit Handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!studentId) {
      showToast("Profile missing", "Please create a student profile first.", "error");
      return;
    }

    const errors: Record<string, string> = {};
    if (!title.trim()) errors.title = "Goal title is required.";
    const targetNum = Number(targetValue);
    if (isNaN(targetNum) || targetNum <= 0) {
      errors.targetValue = "Target value must be greater than 0.";
    }
    if (goalType === "subject_score" && !subjectId) {
      errors.subjectId = "Please select an enrolled subject.";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      if (errors.title) titleInputRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});

    try {
      if (editingGoal) {
        const { error } = await updateAcademicGoal(editingGoal.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          goal_type: goalType,
          target_value: targetNum,
          unit: unit.trim() || "%",
          deadline: deadline || undefined,
          subject_id: goalType === "subject_score" ? subjectId : undefined,
        });

        if (error) {
          showToast("Error updating goal", error, "error");
        } else {
          showToast("Goal updated", `Target "${title.trim()}" was updated.`, "success");
          setIsClosing(true);
          setTimeout(async () => {
            setIsClosing(false);
            onClose();
            await onSuccess();
          }, 160);
        }
      } else {
        const { error } = await createAcademicGoal({
          student_id: studentId,
          title: title.trim(),
          description: description.trim() || undefined,
          goal_type: goalType,
          target_value: targetNum,
          current_value: 0,
          unit: unit.trim() || "%",
          deadline: deadline || undefined,
          subject_id: goalType === "subject_score" ? subjectId : undefined,
          status: "active",
        });

        if (error) {
          showToast("Error creating goal", error, "error");
        } else {
          showToast("Goal created", `"${title.trim()}" was added to your active targets.`, "success");
          setIsClosing(true);
          setTimeout(async () => {
            setIsClosing(false);
            onClose();
            await onSuccess();
          }, 160);
        }
      }
    } catch (err: any) {
      showToast("Unable to save goal", err?.message || "An unexpected error occurred.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-goal-title"
      aria-describedby="modal-goal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop: rgba(15, 23, 42, 0.38) with backdrop-filter: blur(6px) */}
      <div
        onClick={handleRequestClose}
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.38)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
        className={`fixed inset-0 transition-opacity duration-200 ease-out ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden="true"
      />

      {/* Modal Container: 500px desktop, calc(100% - 32px) mobile, 18px radius */}
      <div
        ref={modalRef}
        style={{
          width: "100%",
          maxWidth: "500px",
          backgroundColor: "#FFFFFF",
          border: "1px solid rgba(226, 232, 240, 0.9)",
          borderRadius: "18px",
          boxShadow: "0 24px 70px rgba(15, 23, 42, 0.16)",
          transitionProperty: "opacity, transform",
          transitionDuration: isClosing ? "140ms" : "220ms",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className={`relative z-10 w-full overflow-hidden text-slate-900 ${
          isClosing
            ? "opacity-0 scale-[0.98] translate-y-1"
            : "opacity-100 scale-100 translate-y-0 animate-in fade-in zoom-in-[0.97] duration-200"
        }`}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-5 flex items-start justify-between gap-4 border-b border-[#EEF2F7]">
          <div className="flex items-start gap-3.5">
            {/* 40px Icon Box */}
            <div
              className="w-10 h-10 rounded-[12px] bg-[#EFF6FF] border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0 transition-transform duration-150 group hover:-translate-y-px"
              aria-hidden="true"
            >
              <Target className="w-5 h-5 transition-transform duration-150 group-hover:scale-105" />
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#2563EB]">
                Academic Setup
              </div>
              <h2
                id="modal-goal-title"
                className="text-[20px] font-bold text-[#0F172A] leading-tight tracking-tight"
              >
                {editingGoal ? "Edit Academic Goal" : "Create Academic Goal"}
              </h2>
              <p
                id="modal-goal-desc"
                className="text-[12.5px] text-[#64748B] leading-relaxed max-w-[340px]"
              >
                {editingGoal
                  ? "Update target criteria. Progress continues to sync automatically."
                  : "Set measurable targets and track your academic progress toward them."}
              </p>
            </div>
          </div>

          {/* Close Button: 32x32px */}
          <button
            type="button"
            onClick={handleRequestClose}
            title="Close dialog (Esc)"
            aria-label="Close dialog"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-all border border-transparent hover:border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Unsaved Changes Confirmation */}
        {showDiscardConfirm && (
          <div className="mx-6 mt-4 p-3.5 rounded-[12px] bg-amber-50 border border-amber-200/90 text-xs text-amber-900 flex items-center justify-between gap-3 animate-in fade-in duration-150">
            <div>
              <p className="font-bold text-amber-950">Discard changes?</p>
              <p className="text-[11px] text-amber-800">You have unsaved goal information.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-amber-900 hover:bg-amber-100/50 transition-colors"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {/* Goal Type Selector */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-[#334155] flex items-center">
              Target Category
              <span className="text-rose-500 font-medium ml-1">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { type: "average_score" as GoalType, label: "CGPA / Average", icon: Award },
                { type: "attendance" as GoalType, label: "Attendance", icon: Calendar },
                { type: "subject_score" as GoalType, label: "Subject Score", icon: BookOpen },
                { type: "study_hours" as GoalType, label: "Study Hours", icon: Clock },
                { type: "assignments" as GoalType, label: "Assignments", icon: CheckCircle2 },
              ].map((item) => {
                const isSelected = goalType === item.type;
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleGoalTypeChange(item.type)}
                    className={`h-[38px] px-2.5 rounded-[10px] border text-xs font-semibold flex items-center gap-1.5 transition-all text-left cursor-pointer ${
                      isSelected
                        ? "bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] shadow-2xs"
                        : "bg-white border-[#E2E8F0] text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? "text-[#2563EB]" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Goal Title */}
          <div className="space-y-1.5">
            <label
              htmlFor="goal-title-input"
              className="text-[12px] font-semibold text-[#334155] flex items-center"
            >
              Goal Title
              <span className="text-rose-500 font-medium ml-1">*</span>
            </label>

            <div className="relative">
              <div
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-150 ${
                  focusedField === "title"
                    ? "text-[#2563EB]"
                    : formErrors.title
                    ? "text-rose-500"
                    : "text-[#94A3B8]"
                }`}
              >
                <Target className="w-4 h-4" />
              </div>

              <input
                ref={titleInputRef}
                id="goal-title-input"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (formErrors.title) {
                    setFormErrors((prev) => ({ ...prev, title: "" }));
                  }
                }}
                onFocus={() => setFocusedField("title")}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g. Maintain 85%+ Overall Average"
                disabled={isSubmitting}
                className={`w-full h-[46px] pl-10 pr-4 bg-white text-slate-900 text-sm rounded-[11px] border transition-all duration-150 placeholder:text-slate-400 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 ${
                  formErrors.title
                    ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                    : "border-[#DCE3EC] focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10"
                }`}
              />
            </div>

            {formErrors.title && (
              <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {formErrors.title}
              </p>
            )}
          </div>

          {/* Conditional Subject Select (Only if subject_score) */}
          {goalType === "subject_score" && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label
                htmlFor="subject-select"
                className="text-[12px] font-semibold text-[#334155] flex items-center"
              >
                Select Course
                <span className="text-rose-500 font-medium ml-1">*</span>
              </label>

              <div className="relative">
                <div
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-150 ${
                    focusedField === "subject" ? "text-[#2563EB]" : "text-[#94A3B8]"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                </div>

                <select
                  id="subject-select"
                  value={subjectId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSubjectId(id);
                    const selected = subjects.find((s) => s.id === id);
                    if (selected && !editingGoal) {
                      setTitle(`Target 85%+ in ${selected.subject_name}`);
                    }
                    if (formErrors.subjectId) {
                      setFormErrors((prev) => ({ ...prev, subjectId: "" }));
                    }
                  }}
                  onFocus={() => setFocusedField("subject")}
                  onBlur={() => setFocusedField(null)}
                  disabled={isSubmitting}
                  className="w-full h-[46px] pl-10 pr-9 bg-white text-slate-900 text-sm rounded-[11px] border border-[#DCE3EC] appearance-none focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">Choose an enrolled subject...</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.subject_code ? `${s.subject_code} - ` : ""}
                      {s.subject_name}
                    </option>
                  ))}
                </select>

                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {formErrors.subjectId && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {formErrors.subjectId}
                </p>
              )}
            </div>
          )}

          {/* 2-Column: Target Value & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Value */}
            <div className="space-y-1.5">
              <label
                htmlFor="target-value-input"
                className="text-[12px] font-semibold text-[#334155] flex items-center"
              >
                Target Value ({unit})
                <span className="text-rose-500 font-medium ml-1">*</span>
              </label>

              <div className="relative">
                <div
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-150 ${
                    focusedField === "target" ? "text-[#2563EB]" : "text-[#94A3B8]"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                </div>

                <input
                  id="target-value-input"
                  type="number"
                  min="1"
                  max={goalType === "attendance" || goalType === "average_score" || goalType === "subject_score" ? 100 : 500}
                  step="0.5"
                  value={targetValue}
                  onChange={(e) => {
                    setTargetValue(e.target.value);
                    if (formErrors.targetValue) {
                      setFormErrors((prev) => ({ ...prev, targetValue: "" }));
                    }
                  }}
                  onFocus={() => setFocusedField("target")}
                  onBlur={() => setFocusedField(null)}
                  disabled={isSubmitting}
                  className={`w-full h-[46px] pl-10 pr-4 bg-white text-slate-900 text-sm font-semibold rounded-[11px] border transition-all duration-150 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 ${
                    formErrors.targetValue
                      ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                      : "border-[#DCE3EC] focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10"
                  }`}
                />
              </div>

              {formErrors.targetValue && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {formErrors.targetValue}
                </p>
              )}
            </div>

            {/* Target Deadline */}
            <div className="space-y-1.5">
              <label
                htmlFor="target-deadline-input"
                className="text-[12px] font-semibold text-[#334155] flex items-center"
              >
                Target Deadline
                <span className="text-[11px] font-normal text-slate-400 ml-1.5">(Optional)</span>
              </label>

              <div className="relative">
                <div
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-150 ${
                    focusedField === "deadline" ? "text-[#2563EB]" : "text-[#94A3B8]"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                </div>

                <input
                  id="target-deadline-input"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  onFocus={() => setFocusedField("deadline")}
                  onBlur={() => setFocusedField(null)}
                  disabled={isSubmitting}
                  className="w-full h-[46px] pl-10 pr-4 bg-white text-slate-900 text-sm rounded-[11px] border border-[#DCE3EC] transition-all duration-150 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label
              htmlFor="goal-desc-input"
              className="text-[12px] font-semibold text-[#334155] flex items-center"
            >
              Description / Notes
              <span className="text-[11px] font-normal text-slate-400 ml-1.5">(Optional)</span>
            </label>

            <textarea
              id="goal-desc-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why is this target important? e.g. Maintain scholarship criteria or prepare for graduate admissions."
              disabled={isSubmitting}
              className="w-full p-3 bg-white text-slate-900 text-xs rounded-[11px] border border-[#DCE3EC] transition-all duration-150 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 resize-none disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 mt-6 border-t border-[#EEF2F7] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleRequestClose}
              disabled={isSubmitting}
              className="h-[44px] px-5 rounded-[11px] bg-white border border-[#E2E8F0] text-[#334155] font-semibold text-xs hover:bg-[#F8FAFC] hover:text-[#0F172A] hover:border-slate-300 active:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[44px] px-6 rounded-[11px] bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-soft-sm hover:shadow-soft-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 group focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:pointer-events-none cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{editingGoal ? "Saving..." : "Creating..."}</span>
                </>
              ) : (
                <>
                  <span>{editingGoal ? "Save Changes" : "Create Goal"}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
