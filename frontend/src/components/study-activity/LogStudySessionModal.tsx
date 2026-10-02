"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Clock, BookOpen, Calendar, CheckCircle2, FileText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Subject, StudyActivity } from "@/types/academic";
import { validateStudyActivity } from "@/lib/validations/academic";
import { cn } from "@/lib/utils";

export interface LogStudySessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  studentId: string;
  onSave: (payload: {
    student_id: string;
    study_date: string;
    study_hours: number;
    assignments_completed: number;
    notes?: string;
  }) => Promise<boolean>;
}

export function LogStudySessionModal({
  isOpen,
  onClose,
  subjects,
  studentId,
  onSave,
}: LogStudySessionModalProps) {
  const todayStr = new Date().toISOString().split("T")[0];

  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [studyDate, setStudyDate] = useState(todayStr);
  const [studyHours, setStudyHours] = useState("2");
  const [assignmentsCompleted, setAssignmentsCompleted] = useState("0");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjectSelectRef = useRef<HTMLSelectElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSubjectId(subjects.length > 0 ? subjects[0].id : "");
      setStudyDate(new Date().toISOString().split("T")[0]);
      setStudyHours("2");
      setAssignmentsCompleted("0");
      setTopic("");
      setNotes("");
      setErrors({});
      setIsSubmitting(false);

      setTimeout(() => {
        subjectSelectRef.current?.focus();
      }, 100);
    }
  }, [isOpen, subjects]);

  const quickDurations = [
    { label: "45m", value: "0.75" },
    { label: "1h", value: "1" },
    { label: "1.5h", value: "1.5" },
    { label: "2h", value: "2" },
    { label: "3h", value: "3" },
    { label: "4h", value: "4" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const matchedSubject = subjects.find((s) => s.id === selectedSubjectId);
    let compiledNotes = "";
    if (matchedSubject) {
      compiledNotes = `[${matchedSubject.subject_name}]`;
    }
    if (topic.trim()) {
      compiledNotes = compiledNotes ? `${compiledNotes} ${topic.trim()}` : topic.trim();
    }
    if (notes.trim()) {
      compiledNotes = compiledNotes ? `${compiledNotes} - ${notes.trim()}` : notes.trim();
    }

    const payload = {
      student_id: studentId,
      study_date: studyDate,
      study_hours: Number(studyHours),
      assignments_completed: Number(assignmentsCompleted) || 0,
      notes: compiledNotes.trim() || undefined,
    };

    const validation = validateStudyActivity(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const success = await onSave(payload);
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Study Session"
      description="Record focused learning time, subject tags, and finished homework tasks."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Subject Selection */}
        <div className="space-y-1.5">
          <label
            htmlFor="subjectSelect"
            className="block text-xs font-semibold text-[#0F172A]"
          >
            Subject / Course
          </label>
          <div className="relative">
            <select
              id="subjectSelect"
              ref={subjectSelectRef}
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full h-10 px-3 pr-8 rounded-xl bg-white border border-[#E2E8F0] text-xs font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="">General Coursework (No specific subject)</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.subject_name} {sub.subject_code ? `(${sub.subject_code})` : ""} • Sem {sub.semester}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Topic / Focus Area */}
        <Input
          label="Topic / Focus Concept"
          id="studyTopic"
          placeholder="e.g. Graph Algorithms: Dijkstra & BFS/DFS"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        {/* Date & Quick Durations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Date"
            id="studyDate"
            type="date"
            value={studyDate}
            onChange={(e) => setStudyDate(e.target.value)}
            error={errors.study_date}
            required
          />

          <div className="space-y-1.5">
            <Input
              label="Duration (Hours)"
              id="studyHours"
              type="number"
              step="0.25"
              min="0.1"
              max="24"
              value={studyHours}
              onChange={(e) => setStudyHours(e.target.value)}
              error={errors.study_hours}
              required
            />
            {/* Quick duration pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {quickDurations.map((q) => (
                <button
                  type="button"
                  key={q.label}
                  onClick={() => setStudyHours(q.value)}
                  className={cn(
                    "px-2 py-0.5 text-[10.5px] font-semibold rounded-md border transition-all cursor-pointer",
                    studyHours === q.value
                      ? "bg-blue-50 text-[#2563EB] border-blue-200"
                      : "bg-[#F8FAFC] text-[#64748B] border-slate-200 hover:bg-slate-100"
                  )}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Assignments Completed */}
        <Input
          label="Assignments / Tasks Completed"
          id="assignmentsCompleted"
          type="number"
          min="0"
          value={assignmentsCompleted}
          onChange={(e) => setAssignmentsCompleted(e.target.value)}
          error={errors.assignments_completed}
          helperText="Count of solved problem sets, lab reports, or exercises."
        />

        {/* Notes */}
        <Textarea
          label="Study Notes & Reflections (Optional)"
          id="notes"
          placeholder="Key takeaways, active recall notes, or questions to revisit."
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Log Session
          </Button>
        </div>
      </form>
    </Modal>
  );
}
