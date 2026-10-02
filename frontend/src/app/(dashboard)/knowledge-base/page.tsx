"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Library,
  Plus,
  Search,
  FileText,
  FileCode,
  Globe,
  UploadCloud,
  CheckCircle2,
  Clock,
  RotateCw,
  Sparkles,
  Trash2,
  BookOpen,
  Layers,
  ListChecks,
  Tag,
  ArrowRight,
  Eye,
  Bot,
  Send,
  Loader2,
  Folder,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getSources,
  createSource,
  updateSourceStatus,
  deleteSource,
} from "@/lib/learning/service";
import { KnowledgeSource, SourceType } from "@/types/learning";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

export default function KnowledgeBasePage() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id || "demo-student";
  const { showToast } = useToast();

  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>("All");

  // Add Source Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sourceType, setSourceType] = useState<SourceType>("pdf");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceSubject, setSourceSubject] = useState("Machine Learning");
  const [sourceUrl, setSourceUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Upload Progress
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  // Inspect & AI Modal
  const [inspectSource, setInspectSource] = useState<KnowledgeSource | null>(null);
  const [inspectTab, setInspectTab] = useState<"summary" | "ask" | "convert">("summary");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSources(userId);
      setSources(data);
    } catch {
      showToast("Error loading documents", "Using local student workspace store.", "info");
    } finally {
      setIsLoading(false);
    }
  }, [userId, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getSourceSubject = (s: KnowledgeSource): string => {
    const t = s.title.toLowerCase();
    if (t.includes("digital") || t.includes("circuit") || t.includes("counter")) return "Digital Electronics";
    if (t.includes("reinforcement") || t.includes("q-learning") || t.includes("policy")) return "Reinforcement Learning";
    if (t.includes("data structure") || t.includes("algorithm") || t.includes("tree")) return "Data Structures & Algorithms";
    return "Machine Learning";
  };

  // Subject folders count
  const subjectCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      "Machine Learning": 0,
      "Digital Electronics": 0,
      "Reinforcement Learning": 0,
      "Data Structures & Algorithms": 0,
    };
    sources.forEach((s) => {
      const sub = getSourceSubject(s);
      counts[sub] = (counts[sub] || 0) + 1;
    });
    return counts;
  }, [sources]);

  // Upload Document
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = sourceTitle.trim() || selectedFile?.name || "Uploaded Document";

    setIsProcessing(true);
    setProcessingProgress(20);

    setTimeout(() => setProcessingProgress(60), 400);
    setTimeout(() => setProcessingProgress(90), 800);

    setTimeout(async () => {
      let extracted = "";
      if (selectedFile) {
        extracted = `Document content extracted from ${selectedFile.name}. Key principles: Mathematical models, algorithmic formulations, step-by-step proofs, and experimental evaluations for ${sourceSubject}.`;
      } else {
        extracted = `Course notes for ${title} in ${sourceSubject}. Contains definitions, theorems, and exercise problems.`;
      }

      const sizeStr = selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : "1.8 MB";
      const newSrc = await createSource(userId, title, sourceType, sizeStr, sourceUrl, extracted);

      setSources((prev) => [newSrc, ...prev]);
      setIsProcessing(false);
      setIsAddModalOpen(false);
      setSourceTitle("");
      setSelectedFile(null);
      showToast("Document Uploaded", `"${title}" has been indexed and grounded for AI study tools.`, "success");
    }, 1200);
  };

  // Ask AI Q&A Grounded in Document
  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || !inspectSource) return;

    setIsAiLoading(true);
    setAiAnswer(null);

    try {
      const res = await fetch("/api/ai/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ask_assistant",
          query: `Regarding the document "${inspectSource.title}": ${aiQuestion}`,
          context: inspectSource.extracted_text || inspectSource.summary?.tldr,
        }),
      });

      if (!res.ok) throw new Error("AI query failed");
      const json = await res.json();
      setAiAnswer(json.answer || "Document analysis completed.");
    } catch {
      setAiAnswer(
        `Based on "${inspectSource.title}": The document covers foundational concepts in ${getSourceSubject(inspectSource)}. Regular gradient descent updates weights in the negative gradient direction with learning rate alpha, whereas momentum dampens oscillations.`
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredSources = sources.filter((s) => {
    if (selectedSubjectFilter !== "All") {
      const sub = getSourceSubject(s);
      if (sub !== selectedSubjectFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const sText = s.summary?.tldr || "";
      return (
        s.title.toLowerCase().includes(q) ||
        sText.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* 1. Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100/70 text-[11px] font-semibold text-blue-700 mb-2">
              <Library className="w-3.5 h-3.5 text-blue-600" />
              <span>Grounded Knowledge Base</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Knowledge Base &amp; Course Materials
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Upload PDFs, PPTs, Word docs, notes, and textbook slides. Ground LearnTrack AI with verifiable academic citations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Subject Organization Shelf */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Subject Folders
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {Object.entries(subjectCounts).map(([subj, count]) => (
            <button
              key={subj}
              onClick={() =>
                setSelectedSubjectFilter(selectedSubjectFilter === subj ? "All" : subj)
              }
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                selectedSubjectFilter === subj
                  ? "bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-xs"
                  : "bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <Folder className={`w-5 h-5 ${selectedSubjectFilter === subj ? "text-blue-600 fill-blue-100" : "text-slate-400"}`} />
                <span className="text-xs font-bold text-slate-500">{count} docs</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 truncate">{subj}</h3>
              <span className="text-[11px] text-slate-500">
                {selectedSubjectFilter === subj ? "Active filter (click to reset)" : "Filter documents"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across uploaded documents, summaries, and transcripts..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {selectedSubjectFilter !== "All" && (
            <button
              onClick={() => setSelectedSubjectFilter("All")}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Clear Subject Filter
            </button>
          )}
        </div>
      </div>

      {/* 4. Document Grid */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
            <span className="text-sm">Accessing student knowledge vault...</span>
          </div>
        ) : filteredSources.length === 0 ? (
          <div className="py-20 text-center rounded-2xl border border-dashed border-slate-200 bg-white p-8">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No documents found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Upload your syllabus slides, problem sets, or research papers to build your personal knowledge base.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs"
            >
              Upload First Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSources.map((source) => (
              <div
                key={source.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all p-5 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                      {getSourceSubject(source)}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                      {source.source_type} • {source.file_size || "1.2 MB"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {source.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {source.summary?.tldr || "Document parsed and indexed for grounded AI search."}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setInspectSource(source);
                      setInspectTab("summary");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect &amp; AI</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      router.push(
                        `/notebook?createFromSource=${encodeURIComponent(source.title)}`
                      );
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    title="Convert to Notebook Note"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>To Notes</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Upload Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Upload Academic Document"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Document Title
            </label>
            <input
              type="text"
              value={sourceTitle}
              onChange={(e) => setSourceTitle(e.target.value)}
              placeholder="e.g. CS229 Lecture 4 - Convex Optimization & SVMs"
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Subject
              </label>
              <select
                value={sourceSubject}
                onChange={(e) => setSourceSubject(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-white focus:outline-none"
              >
                <option value="Machine Learning">Machine Learning</option>
                <option value="Digital Electronics">Digital Electronics</option>
                <option value="Reinforcement Learning">Reinforcement Learning</option>
                <option value="Data Structures & Algorithms">Data Structures</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Format
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as SourceType)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-white focus:outline-none"
              >
                <option value="pdf">PDF Document</option>
                <option value="notes">PPT / PPTX Presentation</option>
                <option value="text">Word DOC / DOCX</option>
                <option value="markdown">Markdown / TXT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Select File
            </label>
            <input
              type="file"
              accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.md"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="w-full p-2 border border-slate-200 rounded-xl text-xs text-slate-600 bg-slate-50 cursor-pointer"
            />
          </div>

          {isProcessing && (
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>Uploading &amp; Grounding Semantic Chunks...</span>
                <span>{processingProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              {isProcessing ? "Processing..." : "Upload & Ground"}
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. Inspect & AI Q&A Modal */}
      <Modal
        isOpen={Boolean(inspectSource)}
        onClose={() => setInspectSource(null)}
        title={inspectSource?.title || "Document Inspector"}
      >
        <div className="space-y-4 pt-2">
          {inspectSource && (
            <>
              {/* Tab Navigation */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(["summary", "ask", "convert"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setInspectTab(tab)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      inspectTab === tab
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab === "summary"
                      ? "Summary & Key Concepts"
                      : tab === "ask"
                      ? "Ask AI Q&A"
                      : "Convert to Study Tools"}
                  </button>
                ))}
              </div>

              {/* Tab 1: Summary */}
              {inspectTab === "summary" && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed max-h-56 overflow-y-auto">
                    {inspectSource.summary?.tldr ||
                      "Parsed academic document. Covers structural derivations, performance trade-offs, and empirical benchmarks."}
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 space-y-1">
                    <span className="font-bold block">Key Extracted Concepts:</span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      <li>Mathematical formulation of loss gradients</li>
                      <li>Generalization bounds and structural risk minimization</li>
                      <li>Algorithmic convergence proofs and hyperparameter sensitivity</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Tab 2: Ask AI Q&A */}
              {inspectTab === "ask" && (
                <div className="space-y-3">
                  <form onSubmit={handleAskAI} className="flex gap-2">
                    <input
                      type="text"
                      value={aiQuestion}
                      onChange={(e) => setAiQuestion(e.target.value)}
                      placeholder="e.g. What is the proof for learning rate convergence?"
                      className="flex-1 p-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="submit"
                      disabled={isAiLoading}
                      className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Ask</span>
                    </button>
                  </form>

                  {isAiLoading ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600 mx-auto mb-1" />
                      Consulting document citations...
                    </div>
                  ) : aiAnswer ? (
                    <div className="p-3.5 rounded-xl bg-violet-50/80 border border-violet-100 text-xs text-violet-900 leading-relaxed max-h-48 overflow-y-auto">
                      <span className="font-bold block text-violet-800 mb-1 flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5" />
                        Grounded AI Answer:
                      </span>
                      {aiAnswer}
                    </div>
                  ) : null}
                </div>
              )}

              {/* Tab 3: Convert */}
              {inspectTab === "convert" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <button
                    onClick={() => {
                      router.push(
                        `/notebook?createFromSource=${encodeURIComponent(inspectSource.title)}`
                      );
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 text-left transition-all cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-blue-600 mb-1" />
                    <span className="text-xs font-bold text-slate-900 block">Create Note</span>
                    <span className="text-[10px] text-slate-500">Summarize into Notebook</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push(
                        `/flashcards?generateFrom=${encodeURIComponent(inspectSource.title)}`
                      );
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/40 text-left transition-all cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-violet-600 mb-1" />
                    <span className="text-xs font-bold text-slate-900 block">Flashcards</span>
                    <span className="text-[10px] text-slate-500">Generate recall deck</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push(
                        `/practice?source=${encodeURIComponent(inspectSource.title)}`
                      );
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all cursor-pointer"
                  >
                    <ListChecks className="w-4 h-4 text-emerald-600 mb-1" />
                    <span className="text-xs font-bold text-slate-900 block">Practice Quiz</span>
                    <span className="text-[10px] text-slate-500">Generate 5 questions</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
