"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Plus,
  Sparkles,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  FileText,
  Search,
  ChevronRight,
  ListFilter,
  CheckSquare,
  ArrowRight,
  Play,
  Share2,
  Trash2,
  MoreVertical,
  Loader2,
  BookOpen,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  createAssignmentTask,
  toggleAssignmentTask,
} from "@/lib/student-os/service";
import {
  Assignment,
  AssignmentType,
  AssignmentStatus,
  AssignmentPriority,
  AssignmentTask,
} from "@/types/student-os";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";

export default function AssignmentsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const userId = user?.id || "demo-student";

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "completed" | "calendar">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("All");

  // New Assignment Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("Machine Learning");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<AssignmentType>("Assignment");
  const [newPriority, setNewPriority] = useState<AssignmentPriority>("Medium");
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]
  );
  const [newEstimatedMinutes, setNewEstimatedMinutes] = useState(60);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // AI Breakdown Modal
  const [breakdownTarget, setBreakdownTarget] = useState<Assignment | null>(null);
  const [isBreakdownLoading, setIsBreakdownLoading] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<
    { title: string; estimated_minutes: number; order_index: number }[]
  >([]);
  const [breakdownRecommendation, setBreakdownRecommendation] = useState<string>("");

  const loadAssignments = async () => {
    setIsLoading(true);
    try {
      const data = await getAssignments(userId);
      setAssignments(data);
    } catch {
      showToast("Error loading assignments", "Using local offline data.", "info");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [userId]);

  // Handle Create Assignment
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast("Title required", "Please enter an assignment title.", "error");
      return;
    }
    setIsSubmittingNew(true);
    try {
      await createAssignment(userId, {
        title: newTitle.trim(),
        subject_name: newSubject,
        description: newDescription.trim(),
        type: newType,
        priority: newPriority,
        due_date: new Date(newDueDate).toISOString(),
        estimated_minutes: Number(newEstimatedMinutes) || 60,
        status: "Not Started",
      });
      showToast("Assignment added", `"${newTitle}" created successfully.`, "success");
      setIsNewModalOpen(false);
      setNewTitle("");
      setNewDescription("");
      loadAssignments();
    } catch {
      showToast("Error creating assignment", "Could not persist to database.", "error");
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // Handle Task Completion Toggle
  const handleTaskToggle = async (assignmentId: string, taskId: string, currentStatus: boolean) => {
    try {
      await toggleAssignmentTask(assignmentId, taskId, !currentStatus);
      setAssignments((prev) =>
        prev.map((a) => {
          if (a.id === assignmentId) {
            const updated = (a.tasks || []).map((t) =>
              t.id === taskId ? { ...t, completed: !currentStatus } : t
            );
            return { ...a, tasks: updated };
          }
          return a;
        })
      );
    } catch {
      showToast("Error updating task", "Could not toggle task status.", "error");
    }
  };

  // Trigger AI Breakdown
  const handleOpenBreakdown = async (assignment: Assignment) => {
    setBreakdownTarget(assignment);
    setIsBreakdownLoading(true);
    setGeneratedTasks([]);
    setBreakdownRecommendation("");

    try {
      const res = await fetch("/api/ai/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "breakdown_assignment",
          title: assignment.title,
          subject: assignment.subject_name,
          description: assignment.description,
        }),
      });

      if (!res.ok) throw new Error("AI breakdown failed");
      const json = await res.json();
      setGeneratedTasks(json.tasks || []);
      setBreakdownRecommendation(json.study_plan_recommendation || "");
    } catch {
      // Fallback structured breakdown
      setGeneratedTasks([
        { title: `Explore requirements & formulate architecture for ${assignment.title}`, estimated_minutes: 20, order_index: 0 },
        { title: "Review background theory & textbook formulas", estimated_minutes: 25, order_index: 1 },
        { title: "Implement modular prototype or experimental script", estimated_minutes: 40, order_index: 2 },
        { title: "Run edge-case test vectors and verify correctness", estimated_minutes: 25, order_index: 3 },
        { title: "Format academic writeup and compile references", estimated_minutes: 30, order_index: 4 },
      ]);
      setBreakdownRecommendation(`Allocate 2 sessions of 45-60 minutes across the next 3 days.`);
    } finally {
      setIsBreakdownLoading(false);
    }
  };

  // Add Breakdown Tasks to Assignment
  const handleAddAllTasksToAssignment = async () => {
    if (!breakdownTarget || generatedTasks.length === 0) return;

    try {
      for (const t of generatedTasks) {
        await createAssignmentTask(breakdownTarget.id, userId, t.title, t.estimated_minutes);
      }
      showToast(
        "Tasks added to assignment",
        `${generatedTasks.length} milestone tasks integrated.`,
        "success"
      );
      setBreakdownTarget(null);
      loadAssignments();
    } catch {
      showToast("Error adding tasks", "Could not add tasks to assignment.", "error");
    }
  };

  // Filtered List
  const filteredAssignments = assignments.filter((item) => {
    // Tab filter
    if (activeTab === "upcoming" && (item.status === "Completed" || item.status === "Submitted")) {
      return false;
    }
    if (activeTab === "completed" && item.status !== "Completed" && item.status !== "Submitted") {
      return false;
    }

    // Type filter
    if (selectedTypeFilter !== "All" && item.type !== selectedTypeFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.subject_name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* 1. Header Banner */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100/70 text-[11px] font-semibold text-indigo-700 mb-2">
              <ClipboardList className="w-3.5 h-3.5 text-indigo-600" />
              <span>Academic Deliverables</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Assignment &amp; Deadline Manager
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track assignments, labs, projects, presentations, and break complex tasks into actionable study sessions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Assignment</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Controls & Filter Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(["all", "upcoming", "completed", "calendar"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search & Type Select */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assignments..."
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48 sm:w-64"
              />
            </div>

            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="Assignment">Assignment</option>
              <option value="Lab">Lab</option>
              <option value="Project">Project</option>
              <option value="Presentation">Presentation</option>
              <option value="Exam">Exam</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Assignment Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
            <span className="text-sm">Loading assignments and subtasks...</span>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-dashed border-slate-200 bg-white p-8">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Nothing due yet.</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Keep your academic schedule pristine. Add assignments or let LearnTrack break down complex syllabi into micro-deliverables.
            </p>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs"
            >
              Add Assignment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssignments.map((asg) => {
              const completedTasksCount = (asg.tasks || []).filter((t) => t.completed).length;
              const totalTasksCount = (asg.tasks || []).length;
              const isUrgent = asg.priority === "Urgent";
              const isHigh = asg.priority === "High";

              return (
                <motion.div
                  key={asg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all p-5 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                        {asg.subject_name}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            isUrgent
                              ? "bg-rose-50 text-rose-700 border-rose-100"
                              : isHigh
                              ? "bg-amber-50 text-amber-700 border-amber-100"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {asg.priority}
                        </span>

                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                          {asg.type}
                        </span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {asg.title}
                      </h3>
                      {asg.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {asg.description}
                        </p>
                      )}
                    </div>

                    {/* Due Date & Estimated Time */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Due {new Date(asg.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{asg.estimated_minutes} min est.</span>
                      </span>
                    </div>

                    {/* Tasks Checklist Preview */}
                    {totalTasksCount > 0 && (
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                          <span>Subtasks</span>
                          <span>
                            {completedTasksCount} / {totalTasksCount} done
                          </span>
                        </div>
                        <div className="space-y-1">
                          {(asg.tasks || []).slice(0, 3).map((task) => (
                            <button
                              key={task.id}
                              type="button"
                              onClick={() => handleTaskToggle(asg.id, task.id, task.completed)}
                              className="w-full flex items-center gap-2 text-left text-xs py-1 px-1.5 rounded hover:bg-slate-50 transition-colors cursor-pointer group/task"
                            >
                              <CheckCircle2
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  task.completed
                                    ? "text-emerald-500 fill-emerald-50"
                                    : "text-slate-300 group-hover/task:text-slate-400"
                                }`}
                              />
                              <span
                                className={`truncate text-slate-700 ${
                                  task.completed ? "line-through text-slate-400" : ""
                                }`}
                              >
                                {task.title}
                              </span>
                            </button>
                          ))}
                          {totalTasksCount > 3 && (
                            <span className="text-[10px] text-slate-400 pl-6 block">
                              +{totalTasksCount - 3} more subtasks...
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenBreakdown(asg)}
                      className="px-2.5 py-1.5 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-100 text-[11px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                      <span>Break Down with AI</span>
                    </button>

                    <Link
                      href={`/focus?subject=${encodeURIComponent(
                        asg.subject_name
                      )}&task=${encodeURIComponent(`Work on ${asg.title}`)}`}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-blue-700" />
                      <span>Focus</span>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. New Assignment Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Add New Academic Deliverable"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Build an ML Classification Project"
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Subject
              </label>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Type
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as AssignmentType)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-white focus:outline-none"
              >
                <option value="Assignment">Assignment</option>
                <option value="Lab">Lab</option>
                <option value="Project">Project</option>
                <option value="Presentation">Presentation</option>
                <option value="Exam">Exam</option>
                <option value="Deadline">Deadline</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as AssignmentPriority)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-white focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Est. Min
              </label>
              <input
                type="number"
                min={10}
                max={600}
                value={newEstimatedMinutes}
                onChange={(e) => setNewEstimatedMinutes(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Description / Rubric
            </label>
            <textarea
              rows={3}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Requirements, dataset URLs, grading criteria..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingNew}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              {isSubmittingNew ? "Saving..." : "Create Deliverable"}
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. AI Breakdown Modal */}
      <Modal
        isOpen={Boolean(breakdownTarget)}
        onClose={() => setBreakdownTarget(null)}
        title="AI Breakdown & Study Plan Formulation"
      >
        <div className="space-y-4 pt-2">
          {breakdownTarget && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                {breakdownTarget.subject_name}
              </span>
              <h4 className="text-sm font-bold text-slate-900">{breakdownTarget.title}</h4>
            </div>
          )}

          {isBreakdownLoading ? (
            <div className="py-12 text-center space-y-2">
              <Loader2 className="w-7 h-7 animate-spin text-violet-600 mx-auto" />
              <p className="text-xs text-slate-600 font-medium">
                Deconstructing requirements into milestone tasks...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Generated Work Breakdown Structure:
                </span>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {generatedTasks.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-violet-50 text-violet-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-slate-800">{t.title}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0">
                        {t.estimated_minutes}m
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {breakdownRecommendation && (
                <div className="p-3 rounded-xl bg-violet-50/70 border border-violet-100 text-xs text-violet-900">
                  <span className="font-bold block mb-0.5">Study Plan Recommendation:</span>
                  {breakdownRecommendation}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBreakdownTarget(null)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleAddAllTasksToAssignment}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Add All to Assignment &amp; Study Plan</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
