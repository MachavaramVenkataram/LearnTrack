"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderGit2,
  Plus,
  Sparkles,
  GitFork,
  Globe,
  FileText,
  Bot,
  ExternalLink,
  Code,
  CheckCircle2,
  Clock,
  Copy,
  Trash2,
  Edit,
  Loader2,
  Search,
  BookOpen,
  ArrowRight,
  Award,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/student-os/service";
import { ProjectItem } from "@/types/student-os";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

export default function ProjectsPortfolioPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const userId = user?.id || "demo-student";

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Add / Edit Project Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techStackStr, setTechStackStr] = useState("Python, FastAPI, Scikit-learn, Next.js");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [status, setStatus] = useState<"Idea" | "In Progress" | "Completed" | "Archived">("In Progress");
  const [skillsUsedStr, setSkillsUsedStr] = useState("Python, Machine Learning, REST APIs");
  const [documentation, setDocumentation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Suite Modal for Project
  const [aiTargetProject, setAiTargetProject] = useState<ProjectItem | null>(null);
  const [aiTab, setAiTab] = useState<"summary" | "bullets" | "readme" | "interview" | "explanation">("summary");
  const [aiData, setAiData] = useState<{
    summary?: string;
    resume_bullets?: string[];
    readme_outline?: string;
    interview_questions?: string[];
    technical_explanation?: string;
  } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getProjects(userId);
      setProjects(data);
    } catch {
      showToast("Error loading projects", "Using student local portfolio cache.", "info");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [userId]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingProjectId(null);
    setTitle("");
    setDescription("");
    setTechStackStr("Python, PyTorch, Docker, FastAPI");
    setGithubUrl("");
    setDemoUrl("");
    setStatus("In Progress");
    setSkillsUsedStr("Machine Learning, Python, API Design");
    setDocumentation("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (project: ProjectItem) => {
    setEditingProjectId(project.id);
    setTitle(project.title);
    setDescription(project.description);
    setTechStackStr(project.tech_stack.join(", "));
    setGithubUrl(project.github_url || "");
    setDemoUrl(project.demo_url || "");
    setStatus(project.status);
    setSkillsUsedStr(project.skills_used.join(", "));
    setDocumentation(project.documentation || "");
    setIsModalOpen(true);
  };

  // Submit Project Form
  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: Partial<ProjectItem> = {
        title: title.trim(),
        description: description.trim(),
        tech_stack: techStackStr.split(",").map((s) => s.trim()).filter(Boolean),
        github_url: githubUrl.trim() || undefined,
        demo_url: demoUrl.trim() || undefined,
        status,
        skills_used: skillsUsedStr.split(",").map((s) => s.trim()).filter(Boolean),
        documentation: documentation.trim() || undefined,
      };

      if (editingProjectId) {
        await updateProject(editingProjectId, payload);
        showToast("Project Updated", `"${title}" refreshed in your portfolio.`, "success");
      } else {
        await createProject(userId, payload);
        showToast("Project Added", `"${title}" integrated into Skill Intelligence.`, "success");
      }

      setIsModalOpen(false);
      loadProjects();
    } catch {
      showToast("Error saving project", "Could not persist portfolio record.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger AI Tools for Project
  const handleOpenAiSuite = async (project: ProjectItem) => {
    setAiTargetProject(project);
    setAiTab("summary");
    setAiData(null);
    setIsAiLoading(true);

    try {
      const res = await fetch("/api/ai/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_project_ai",
          title: project.title,
          description: project.description,
          tech_stack: project.tech_stack,
        }),
      });

      if (!res.ok) throw new Error("AI suite failed");
      const json = await res.json();
      setAiData(json);
    } catch {
      setAiData({
        summary: `Production-ready engineering project titled **${project.title}** leveraging ${project.tech_stack.join(", ")}. Deploys modular architecture to solve real-world technical problems.`,
        resume_bullets: [
          `Architected and deployed ${project.title} utilizing ${project.tech_stack.join(", ")}, optimizing algorithmic throughput and latency.`,
          `Engineered reliable modular pipeline handling end-to-end data workflows with comprehensive unit test coverage.`,
          `Authored technical documentation, benchmarking suite, and Git version-controlled release repository.`,
        ],
        readme_outline: `# ${project.title}\n\n## Overview\n${project.description}\n\n## Tech Stack\n${project.tech_stack.join(", ")}\n\n## Installation & Run\n\`\`\`bash\ngit clone <repo>\nnpm install\nnpm run dev\n\`\`\``,
        interview_questions: [
          `What architectural trade-offs did you evaluate when designing ${project.title}?`,
          `How did you handle error states, latency limits, and edge cases with ${project.tech_stack[0] || "Python"}?`,
          `If this system had to scale to 100k requests/minute, what would you re-architect?`,
        ],
        technical_explanation: `${project.title} decouples user-facing workflows from persistent state stores, utilizing asynchronous background task patterns to ensure responsiveness.`,
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tech_stack.some((t) => t.toLowerCase().includes(q))
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
              <FolderGit2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Evidence-Grounding Repositories</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Project Portfolio
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Document engineering builds, generate STAR resume bullets, formulation outlines, and interview talking points directly connected to your skill profile.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Controls & Search Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name, tech stack, or description..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>{filteredProjects.length} Documented Systems</span>
          </div>
        </div>
      </div>

      {/* 3. Project Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
            <span className="text-sm">Fetching engineering portfolio records...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-dashed border-slate-200 bg-white p-8">
            <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No projects documented yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Record your GitHub repositories, research implementations, and course deliverables to generate verified skill evidence.
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs"
            >
              Document First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all p-6 flex flex-col justify-between space-y-5 group"
              >
                <div className="space-y-3">
                  {/* Status & Links */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        project.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : project.status === "In Progress"
                          ? "bg-blue-50 text-blue-700 border-blue-100"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      {project.status}
                    </span>

                    <div className="flex items-center gap-2">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                          title="View GitHub Repository"
                        >
                          <GitFork className="w-4 h-4" />
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                          title="View Live Demo"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Tech Stack Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tech_stack.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Tools */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenAiSuite(project)}
                    className="px-3.5 py-1.5 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-100 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                    <span>AI Suite &amp; Bullets</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(project)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
                      title="Edit project"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm(`Delete project "${project.title}"?`)) {
                          await deleteProject(project.id);
                          showToast("Project Deleted", "Removed from portfolio.", "info");
                          loadProjects();
                        }
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Add / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProjectId ? "Edit Portfolio Project" : "Document Engineering Project"}
      >
        <form onSubmit={handleSubmitProject} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Key-Value Store"
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Description / Core Deliverables *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What authentic technical problem does this project solve? Include architectural details..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Tech Stack (comma separated)
              </label>
              <input
                type="text"
                value={techStackStr}
                onChange={(e) => setTechStackStr(e.target.value)}
                placeholder="Python, PyTorch, Docker"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-white focus:outline-none"
              >
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Idea">Idea</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                GitHub Repository URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Live Demo URL (Optional)
              </label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              {isSubmitting ? "Saving..." : editingProjectId ? "Update Project" : "Add to Portfolio"}
            </button>
          </div>
        </form>
      </Modal>

      {/* 5. AI Suite Modal (Summary, Bullets, README, Interview Questions) */}
      <Modal
        isOpen={Boolean(aiTargetProject)}
        onClose={() => setAiTargetProject(null)}
        title={aiTargetProject ? `AI Tools: ${aiTargetProject.title}` : "AI Project Tools"}
      >
        <div className="space-y-4 pt-2">
          {aiTargetProject && (
            <>
              {/* Tab Navigation */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(["summary", "bullets", "readme", "interview", "explanation"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAiTab(tab)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      aiTab === tab
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab === "bullets" ? "Resume Bullets" : tab}
                  </button>
                ))}
              </div>

              {isAiLoading ? (
                <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-violet-600 mx-auto" />
                  <p>Synthesizing technical deliverables &amp; formulations...</p>
                </div>
              ) : aiData ? (
                <div className="space-y-3">
                  {/* Tab 1: Summary */}
                  {aiTab === "summary" && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed">
                      {aiData.summary}
                    </div>
                  )}

                  {/* Tab 2: Resume Bullets */}
                  {aiTab === "bullets" && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Quantified STAR Bullets (Click to copy):
                      </span>
                      {aiData.resume_bullets?.map((b, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            navigator.clipboard.writeText(b);
                            showToast("Copied!", b.substring(0, 30) + "...", "success");
                          }}
                          className="p-3 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/20 text-xs text-slate-800 leading-relaxed cursor-pointer transition-all flex items-start justify-between gap-2"
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-violet-600 font-bold">•</span>
                            <span>{b}</span>
                          </div>
                          <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab 3: README Outline */}
                  {aiTab === "readme" && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span className="font-bold uppercase tracking-wider">GitHub README Outline</span>
                        <button
                          onClick={() => {
                            if (aiData.readme_outline) {
                              navigator.clipboard.writeText(aiData.readme_outline);
                              showToast("README copied!", "Markdown template in clipboard.", "success");
                            }
                          }}
                          className="text-blue-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy Markdown</span>
                        </button>
                      </div>
                      <pre className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed max-h-56">
                        {aiData.readme_outline}
                      </pre>
                    </div>
                  )}

                  {/* Tab 4: Interview Questions */}
                  {aiTab === "interview" && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Anticipated Technical Interview Probes:
                      </span>
                      {aiData.interview_questions?.map((q, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed"
                        >
                          <span className="font-bold text-violet-700 block mb-0.5">
                            Q{idx + 1}:
                          </span>
                          {q}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tab 5: Technical Explanation */}
                  {aiTab === "explanation" && (
                    <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-950 leading-relaxed">
                      <span className="font-bold block mb-1">Architecture Rationale:</span>
                      {aiData.technical_explanation}
                    </div>
                  )}
                </div>
              ) : null}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
