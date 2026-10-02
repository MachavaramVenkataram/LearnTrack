"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  BookOpen,
  Code2,
  Award,
  Calendar,
  ChevronDown,
  Check,
  AlertCircle,
  X,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Subject } from "@/types/academic";
import { createSubject, updateSubject } from "@/lib/academic/service";
import { validateSubject } from "@/lib/validations/academic";
import { useToast } from "@/components/ui/Toast";

export interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
  editingSubject?: Subject | null;
  defaultSemester?: number;
  onSuccess: () => Promise<void> | void;
}

export function AddSubjectModal({
  isOpen,
  onClose,
  studentId,
  editingSubject,
  defaultSemester = 1,
  onSuccess,
}: AddSubjectModalProps) {
  const { showToast } = useToast();

  // Form Fields
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [credits, setCredits] = useState("3");
  const [semester, setSemester] = useState("1");

  // Interaction & UI States
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Element Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Initialize or reset form values
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement | null;
      setIsClosing(false);
      setShowDiscardConfirm(false);
      setBackendError(null);
      setFormErrors({});

      if (editingSubject) {
        setSubjectName(editingSubject.subject_name || "");
        setSubjectCode(editingSubject.subject_code || "");
        setCredits(String(editingSubject.credits || 3));
        setSemester(String(editingSubject.semester || defaultSemester || 1));
      } else {
        setSubjectName("");
        setSubjectCode("");
        setCredits("3");
        setSemester(String(defaultSemester || 1));
      }

      // Auto-focus Subject Name field on open
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
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
  }, [isOpen, editingSubject, defaultSemester]);

  // Check if form is dirty (has user changes)
  const isDirty = Boolean(
    editingSubject
      ? subjectName !== editingSubject.subject_name ||
        subjectCode !== (editingSubject.subject_code || "") ||
        credits !== String(editingSubject.credits || 3) ||
        semester !== String(editingSubject.semester || defaultSemester || 1)
      : subjectName.trim().length > 0 || subjectCode.trim().length > 0
  );

  // Graceful close animation handler
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

  // Force close discarding changes
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
      // Escape key handler
      if (e.key === "Escape") {
        e.preventDefault();
        if (showDiscardConfirm) {
          setShowDiscardConfirm(false);
        } else {
          handleRequestClose();
        }
        return;
      }

      // Tab key focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showDiscardConfirm, handleRequestClose]);

  // Real Form Submit to Supabase
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!studentId) {
      showToast("Profile missing", "Please create a student profile first.", "error");
      return;
    }

    const payload = {
      subject_name: subjectName.trim(),
      subject_code: subjectCode.trim() ? subjectCode.trim().toUpperCase() : undefined,
      credits: Number(credits),
      semester: Number(semester),
    };

    // Client-side validation using existing validation module
    const validation = validateSubject(payload);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      // Auto-focus the first invalid field
      if (validation.errors.subject_name) {
        nameInputRef.current?.focus();
      } else if (validation.errors.subject_code) {
        codeInputRef.current?.focus();
      }
      return;
    }

    setIsSubmitting(true);
    setFormErrors({});
    setBackendError(null);

    try {
      if (editingSubject) {
        const { error } = await updateSubject(editingSubject.id, payload);
        if (error) {
          setBackendError(error);
          showToast("Error updating subject", error, "error");
        } else {
          showToast("Subject updated", `${payload.subject_name} details saved.`, "success");
          setIsClosing(true);
          setTimeout(async () => {
            setIsClosing(false);
            onClose();
            await onSuccess();
          }, 160);
        }
      } else {
        const { error } = await createSubject({
          student_id: studentId,
          ...payload,
        });
        if (error) {
          setBackendError(error);
          showToast("Error creating subject", error, "error");
        } else {
          showToast(
            "Subject created",
            `${payload.subject_name} was added to your workspace.`,
            "success"
          );
          setIsClosing(true);
          setTimeout(async () => {
            setIsClosing(false);
            onClose();
            await onSuccess();
          }, 160);
        }
      }
    } catch (err: any) {
      const msg = err?.message || "An unexpected error occurred while saving.";
      setBackendError(msg);
      showToast("Unable to save subject", msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !isClosing) return null;

  // Live input validation states
  const isNameValid = subjectName.trim().length >= 2 && !formErrors.subject_name;
  const isCodeValid = subjectCode.trim().length >= 2 && !formErrors.subject_code;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-subject-title"
      aria-describedby="modal-subject-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* 3. BACKDROP: rgba(15, 23, 42, 0.38) with backdrop-filter: blur(6px) */}
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

      {/* 2 & 4. MODAL CONTAINER: 500px desktop, calc(100% - 32px) mobile, #FFFFFF, 18px radius, soft shadow */}
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
        {/* 7, 8, 9, 10, 11. HEADER REDESIGN */}
        <div className="px-6 pt-6 pb-5 flex items-start justify-between gap-4 border-b border-[#EEF2F7]">
          <div className="flex items-start gap-3.5">
            {/* 8. Header Icon Container (40px, #EFF6FF, BookOpen #2563EB, radius 12px) */}
            <div
              className="w-10 h-10 rounded-[12px] bg-[#EFF6FF] border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0 transition-transform duration-150 group hover:-translate-y-px"
              aria-hidden="true"
            >
              <BookOpen className="w-5 h-5 transition-transform duration-150 group-hover:scale-105" />
            </div>

            <div className="space-y-1">
              {/* Optional 10px uppercase blue label */}
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#2563EB]">
                Academic Setup
              </div>
              {/* 9. Title */}
              <h2
                id="modal-subject-title"
                className="text-[20px] font-bold text-[#0F172A] leading-tight tracking-tight"
              >
                {editingSubject ? "Edit Subject" : "Add Subject"}
              </h2>
              {/* 10. Description */}
              <p
                id="modal-subject-desc"
                className="text-[12.5px] text-[#64748B] leading-relaxed max-w-[340px]"
              >
                {editingSubject
                  ? "Update course catalog parameters and credit weighting."
                  : "Create a course profile to track performance, attendance, grades, and academic progress."}
              </p>
            </div>
          </div>

          {/* 11. Premium Close Button: 32x32px, radius 8px, hover #F1F5F9 */}
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

        {/* 30. BACKEND ERROR BANNER */}
        {backendError && (
          <div className="mx-6 mt-5 p-3.5 rounded-[12px] bg-rose-50/90 border border-rose-200 text-xs text-rose-800 flex items-start justify-between gap-3 animate-in fade-in duration-150">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-900">Unable to create subject</p>
                <p className="text-[11.5px] text-rose-700 mt-0.5">
                  {backendError || "Please check your information and try again."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="text-[11px] font-semibold text-rose-700 hover:text-rose-900 bg-rose-100 hover:bg-rose-200/80 px-2.5 py-1 rounded-md shrink-0 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        )}

        {/* 34. UNSAVED CHANGES CONFIRMATION BANNER */}
        {showDiscardConfirm && (
          <div className="mx-6 mt-4 p-3.5 rounded-[12px] bg-amber-50 border border-amber-200/90 text-xs text-amber-900 flex items-center justify-between gap-3 animate-in fade-in duration-150">
            <div>
              <p className="font-bold text-amber-950">Discard changes?</p>
              <p className="text-[11px] text-amber-800">You have unsaved subject information.</p>
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

        {/* 12. FORM STRUCTURE */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 15, 16, 17. FIELD 1: SUBJECT NAME */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="subject-name-input"
                className="text-[12px] font-semibold text-[#334155] flex items-center"
              >
                Subject Name
                <span className="text-rose-500 font-medium ml-1">*</span>
              </label>
              {isNameValid && (
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 animate-in fade-in duration-150">
                  <Check className="w-3 h-3" />
                  Valid
                </span>
              )}
            </div>

            <div className="relative">
              {/* 16. Leading Icon (BookOpen: #94A3B8, turns #2563EB on focus) */}
              <div
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-150 ${
                  focusedField === "name"
                    ? "text-[#2563EB]"
                    : formErrors.subject_name
                    ? "text-rose-500"
                    : "text-[#94A3B8]"
                }`}
              >
                <BookOpen className="w-4 h-4" />
              </div>

              <input
                ref={nameInputRef}
                id="subject-name-input"
                type="text"
                value={subjectName}
                onChange={(e) => {
                  setSubjectName(e.target.value);
                  if (formErrors.subject_name) {
                    setFormErrors((prev) => ({ ...prev, subject_name: "" }));
                  }
                  if (backendError) setBackendError(null);
                }}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g. Data Structures & Algorithms"
                disabled={isSubmitting}
                className={`w-full h-[46px] pl-10 pr-9 bg-white text-slate-900 text-sm rounded-[11px] border transition-all duration-150 placeholder:text-slate-400 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 ${
                  formErrors.subject_name
                    ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                    : "border-[#DCE3EC] focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10"
                }`}
              />

              {/* Trailing check or error icon */}
              {formErrors.subject_name ? (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-500 pointer-events-none">
                  <AlertCircle className="w-4 h-4" />
                </div>
              ) : isNameValid ? (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center pointer-events-none border border-emerald-200">
                  <Check className="w-2.5 h-2.5" />
                </div>
              ) : null}
            </div>

            {formErrors.subject_name && (
              <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {formErrors.subject_name}
              </p>
            )}
          </div>

          {/* 18, 19. FIELD 2: COURSE CODE */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="course-code-input"
                className="text-[12px] font-semibold text-[#334155] flex items-center"
              >
                Course Code
                <span className="text-[11px] font-normal text-slate-400 ml-1.5">(Optional)</span>
              </label>
              {isCodeValid && (
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 animate-in fade-in duration-150">
                  <Check className="w-3 h-3" />
                  Valid code
                </span>
              )}
            </div>

            <div className="relative">
              {/* Leading Code Icon */}
              <div
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-150 ${
                  focusedField === "code"
                    ? "text-[#2563EB]"
                    : formErrors.subject_code
                    ? "text-rose-500"
                    : "text-[#94A3B8]"
                }`}
              >
                <Code2 className="w-4 h-4" />
              </div>

              <input
                ref={codeInputRef}
                id="course-code-input"
                type="text"
                value={subjectCode}
                onChange={(e) => {
                  setSubjectCode(e.target.value.toUpperCase());
                  if (formErrors.subject_code) {
                    setFormErrors((prev) => ({ ...prev, subject_code: "" }));
                  }
                  if (backendError) setBackendError(null);
                }}
                onFocus={() => setFocusedField("code")}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g. CS201"
                disabled={isSubmitting}
                className={`w-full h-[46px] pl-10 pr-9 bg-white text-slate-900 text-sm font-mono rounded-[11px] border transition-all duration-150 placeholder:text-slate-400 placeholder:font-sans focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 ${
                  formErrors.subject_code
                    ? "border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                    : "border-[#DCE3EC] focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10"
                }`}
              />

              {/* Trailing check or error icon */}
              {formErrors.subject_code ? (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-rose-500 pointer-events-none">
                  <AlertCircle className="w-4 h-4" />
                </div>
              ) : isCodeValid ? (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center pointer-events-none border border-emerald-200">
                  <Check className="w-2.5 h-2.5" />
                </div>
              ) : null}
            </div>

            {formErrors.subject_code ? (
              <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {formErrors.subject_code}
              </p>
            ) : (
              <p className="text-[11px] text-[#94A3B8] mt-1 leading-normal">
                Use your official university or department course code.
              </p>
            )}
          </div>

          {/* 20, 21, 22. CREDITS + SEMESTER 2-COLUMN GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-0.5">
            {/* 20. CREDITS SELECT */}
            <div className="space-y-1.5">
              <label
                htmlFor="credits-select"
                className="text-[12px] font-semibold text-[#334155] flex items-center"
              >
                Credits
                <span className="text-rose-500 font-medium ml-1">*</span>
              </label>

              <div className="relative">
                <div
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-150 ${
                    focusedField === "credits" ? "text-[#2563EB]" : "text-[#94A3B8]"
                  }`}
                >
                  <Award className="w-4 h-4" />
                </div>

                <select
                  id="credits-select"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  onFocus={() => setFocusedField("credits")}
                  onBlur={() => setFocusedField(null)}
                  disabled={isSubmitting}
                  className="w-full h-[46px] pl-10 pr-9 bg-white text-slate-900 text-sm rounded-[11px] border border-[#DCE3EC] appearance-none focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="1">1 Credit</option>
                  <option value="2">2 Credits</option>
                  <option value="3">3 Credits</option>
                  <option value="4">4 Credits</option>
                  <option value="5">5 Credits</option>
                  <option value="6">6 Credits</option>
                </select>

                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {formErrors.credits && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {formErrors.credits}
                </p>
              )}
            </div>

            {/* 21. SEMESTER SELECT */}
            <div className="space-y-1.5">
              <label
                htmlFor="semester-select"
                className="text-[12px] font-semibold text-[#334155] flex items-center"
              >
                Semester
                <span className="text-rose-500 font-medium ml-1">*</span>
              </label>

              <div className="relative">
                <div
                  className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-150 ${
                    focusedField === "semester" ? "text-[#2563EB]" : "text-[#94A3B8]"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                </div>

                <select
                  id="semester-select"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  onFocus={() => setFocusedField("semester")}
                  onBlur={() => setFocusedField(null)}
                  disabled={isSubmitting}
                  className="w-full h-[46px] pl-10 pr-9 bg-white text-slate-900 text-sm rounded-[11px] border border-[#DCE3EC] appearance-none focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                  <option value="3">Semester 3</option>
                  <option value="4">Semester 4</option>
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                  <option value="8">Semester 8</option>
                </select>

                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {formErrors.semester && (
                <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {formErrors.semester}
                </p>
              )}
            </div>
          </div>

          {/* 32, 33, 27, 28. FORM FOOTER */}
          <div className="pt-4.5 mt-6 border-t border-[#EEF2F7] flex items-center justify-between gap-3">
            {/* 33. Cancel Button */}
            <button
              type="button"
              onClick={handleRequestClose}
              disabled={isSubmitting}
              className="h-[46px] px-5 rounded-[11px] bg-white border border-[#E2E8F0] text-[#334155] font-semibold text-xs hover:bg-[#F8FAFC] hover:text-[#0F172A] hover:border-slate-300 active:bg-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              Cancel
            </button>

            {/* 27 & 28. Primary Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[46px] px-6 rounded-[11px] bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-soft-sm hover:shadow-soft-md hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 group focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:pointer-events-none cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{editingSubject ? "Saving Changes..." : "Creating Subject..."}</span>
                </>
              ) : (
                <>
                  <span>{editingSubject ? "Save Changes" : "Create Subject"}</span>
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
