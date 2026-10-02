"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FolderArchive,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  FileText,
  CheckCircle2,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getStudentResources,
  createStudentResource,
  deleteStudentResource,
} from "@/lib/learning/service";
import { StudentResource, ResourceCategory, QuestionPaperAnalysis } from "@/types/learning";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export default function ResourcesPage() {
  const { user } = useAuth();
  const userId = user?.id || "demo-student";
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<"library" | "analyzer" | "assignment">("library");
  const [resources, setResources] = useState<StudentResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Add Resource Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<ResourceCategory>("Documents");
  const [newUrl, setNewUrl] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTagsStr, setNewTagsStr] = useState("ML, Semester 1");

  // Question Paper Analyzer State
  const [paperSubject, setPaperSubject] = useState("Machine Learning");
  const [paperInputText, setPaperInputText] = useState("");
  const [paperAnalysis, setPaperAnalysis] = useState<QuestionPaperAnalysis | null>(null);
  const [isAnalyzingPaper, setIsAnalyzingPaper] = useState(false);

  // Assignment Workspace State
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentSubject, setAssignmentSubject] = useState("Machine Learning");
  const [assignmentDeadline, setAssignmentDeadline] = useState("");
  const [assignmentDesc, setAssignmentDesc] = useState("");
  const [assignmentHelp, setAssignmentHelp] = useState<string | null>(null);
  const [isGeneratingHelp, setIsGeneratingHelp] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getStudentResources(userId);
      setResources(data);
    } catch (e) {
      console.error("Failed to load student resources:", e);
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

  // Create Resource
  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const tags = newTagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const created = await createStudentResource({
      user_id: userId,
      title: newTitle.trim(),
      category: newCategory,
      url: newUrl.trim() || null,
      description: newDesc.trim() || null,
      tags,
    });

    setResources([created, ...resources]);
    setIsAddOpen(false);
    setNewTitle("");
    setNewUrl("");
    setNewDesc("");
    showToast("Resource Added", "Added to your curated course library.", "success");
  };

  const handleDeleteResource = async (id: string) => {
    await deleteStudentResource(id);
    setResources((prev) => prev.filter((r) => r.id !== id));
    showToast("Resource Removed", "Removed from library.", "info");
  };

  // Analyze Question Paper
  const handleAnalyzePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzingPaper(true);

    try {
      const res = await fetch("/api/ai/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze_paper",
          subject: paperSubject,
          paperText: paperInputText,
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        setPaperAnalysis(data.analysis);
        showToast("Analysis Complete", "Extracted frequently observed examination topics.", "success");
      }
    } catch {
      showToast("Error", "Could not analyze question paper.", "error");
    } finally {
      setIsAnalyzingPaper(false);
    }
  };

  // Assignment Assistant Breakdown
  const handleGenerateAssignmentHelp = async () => {
    if (!assignmentTitle.trim()) {
      showToast("Missing Title", "Please enter an assignment title.", "error");
      return;
    }
    setIsGeneratingHelp(true);

    try {
      const res = await fetch("/api/ai/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "smart_action",
          selectedText: `Assignment: ${assignmentTitle} (${assignmentSubject}). Description: ${assignmentDesc}`,
          transformAction: "Explain",
        }),
      });

      const data = await res.json();
      setAssignmentHelp(
        data.result ||
        `### Assignment Breakdown & Recommended Plan
1. **Core Problem Formulation**: Understand the primary deliverables and evaluation rubric.
2. **Phase 1: Exploratory Analysis & Setup**: Initialize repository, import datasets, verify schema constraints.
3. **Phase 2: Mathematical / Algorithmic Core**: Formulate equations and write modular components.
4. **Phase 3: Validation & Edge Cases**: Perform error tests and draft report discussing observations.`
      );
      showToast("Breakdown Ready", "Structured assignment tasks generated.", "success");
    } catch {
      showToast("Error", "Failed to generate assignment guidance.", "error");
    } finally {
      setIsGeneratingHelp(false);
    }
  };

  const categories: ResourceCategory[] = [
    "Notes",
    "Documents",
    "Books",
    "Links",
    "Videos",
    "Question Papers",
    "Assignments",
  ];

  const filtered = resources.filter((r) => {
    const matchSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCat = categoryFilter === "All" || r.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <FolderArchive className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Student Resource Hub
            </h1>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
              Curated Coursework
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize reference textbooks, past examination papers, links, and assignment outlines.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab("library")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "library" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
            }`}
          >
            Resource Library
          </button>
          <button
            onClick={() => setActiveTab("analyzer")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "analyzer" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
            }`}
          >
            Paper Analyzer
          </button>
          <button
            onClick={() => setActiveTab("assignment")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === "assignment" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600"
            }`}
          >
            Assignment Helper
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RESOURCE LIBRARY */}
      {/* ========================================================================= */}
      {activeTab === "library" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources by title or tag (ML, DBMS, Python)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-soft-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Resource</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setCategoryFilter("All")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                categoryFilter === "All"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategoryFilter(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                  categoryFilter === c
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Resources Grid */}
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">Loading resources...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 hover:border-blue-200 hover:shadow-card transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10.5px] font-bold border border-blue-100 uppercase">
                      {r.category}
                    </span>
                    <button
                      onClick={() => handleDeleteResource(r.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                    {r.title}
                  </h3>

                  {r.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {r.description}
                    </p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {r.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10.5px] text-slate-400 font-mono">
                    {new Date(r.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Open Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PREVIOUS QUESTION PAPER ANALYZER */}
      {/* ========================================================================= */}
      {activeTab === "analyzer" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Input Form */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-wider">
                Exam Paper Analyzer
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Analyze Previous Question Papers
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Paste question paper text or questions. LearnTrack AI clusters frequent topics and builds a high-yield revision checklist.
              </p>
            </div>

            <form onSubmit={handleAnalyzePaper} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Course / Subject</label>
                <Input
                  value={paperSubject}
                  onChange={(e) => setPaperSubject(e.target.value)}
                  placeholder="e.g. Machine Learning, Digital Electronics"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  Question Paper Text / Problem Statements
                </label>
                <Textarea
                  value={paperInputText}
                  onChange={(e) => setPaperInputText(e.target.value)}
                  placeholder="Paste questions from 2024, 2025 mid-term or end-term papers..."
                  rows={8}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full"
                isLoading={isAnalyzingPaper}
              >
                Analyze Paper Trends
              </Button>
            </form>
          </div>

          {/* Right Results View */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card space-y-4">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Observed Exam Topics
            </span>

            {paperAnalysis ? (
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 text-blue-950">
                  <p className="font-bold text-sm">{paperAnalysis.paper_title}</p>
                  <p className="text-blue-700 mt-0.5">
                    Extracted {paperAnalysis.extracted_questions_count} questions across syllabus units.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-[10.5px] tracking-wider mb-2">
                    Frequently Observed Topics in Uploaded Papers
                  </h4>
                  <div className="space-y-1.5">
                    {paperAnalysis.frequently_observed_topics.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-medium text-slate-800">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 uppercase text-[10.5px] tracking-wider mb-2">
                    Suggested Revision Checklist
                  </h4>
                  <div className="space-y-1.5">
                    {paperAnalysis.suggested_revision_checklist.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs">
                <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>Paste an exam paper and click Analyze to view observed topic clusters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ASSIGNMENT ASSISTANT */}
      {/* ========================================================================= */}
      {activeTab === "assignment" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-purple-600 uppercase tracking-wider">
                Assignment Workspace
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Break Down &amp; Plan Coursework
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Break complex assignment prompts into actionable task milestones and review draft outlines.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Assignment Title</label>
                <Input
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  placeholder="e.g. Ridge Regression Implementation on Real Estate Dataset"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Subject</label>
                  <Input
                    value={assignmentSubject}
                    onChange={(e) => setAssignmentSubject(e.target.value)}
                    placeholder="Machine Learning"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Deadline</label>
                  <Input
                    type="date"
                    value={assignmentDeadline}
                    onChange={(e) => setAssignmentDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Prompt / Task Requirements</label>
                <Textarea
                  value={assignmentDesc}
                  onChange={(e) => setAssignmentDesc(e.target.value)}
                  placeholder="Paste assignment description, rubric guidelines, or dataset requirements..."
                  rows={5}
                />
              </div>

              <Button
                onClick={handleGenerateAssignmentHelp}
                variant="primary"
                size="md"
                className="w-full"
                isLoading={isGeneratingHelp}
              >
                Break Down into Tasks
              </Button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-card space-y-4">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Assignment Plan &amp; Tasks
            </span>

            {assignmentHelp ? (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                {assignmentHelp}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs">
                <ClipboardList className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>Enter assignment details to generate milestone tasks and a structured outline.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Resource"
        description="Organize textbooks, external reference links, and coursework materials."
      >
        <form onSubmit={handleCreateResource} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Resource Title</label>
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Bishop PRML Chapter 3 Summary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ResourceCategory)}
                className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">URL (Optional)</label>
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Tags (comma separated)</label>
            <Input
              value={newTagsStr}
              onChange={(e) => setNewTagsStr(e.target.value)}
              placeholder="ML, DBMS, Semester 1"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Description</label>
            <Textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Brief summary or context..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Resource
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
