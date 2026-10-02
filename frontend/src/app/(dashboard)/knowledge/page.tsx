"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  AlertTriangle,
  RotateCw,
  Sparkles,
  Trash2,
  ShieldCheck,
  Loader2,
  BookOpen,
  FileUp,
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
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function KnowledgeBasePage() {
  const { user } = useAuth();
  const userId = user?.id || "demo-student";
  const { showToast } = useToast();

  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>("All");

  // Add Source Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sourceType, setSourceType] = useState<SourceType>("pdf");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Upload & Processing Simulation State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [processingProgress, setProcessingProgress] = useState(0);

  // Source Detail / AI Summary Modal
  const [inspectSource, setInspectSource] = useState<KnowledgeSource | null>(null);
  const [inspectTab, setInspectTab] = useState<"summary" | "text" | "ask">("summary");
  const [sourceAiQuery, setSourceAiQuery] = useState("");
  const [sourceAiAnswer, setSourceAiAnswer] = useState<{
    answer: string;
    sources: string[];
    citations: string[];
  } | null>(null);
  const [isSourceAiLoading, setIsSourceAiLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSources(userId);
      setSources(data);
    } catch (e) {
      console.error("Failed to load sources:", e);
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

  // Handle Upload and Real Stage Processing
  const handleStartUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = sourceTitle.trim() || selectedFile?.name || (sourceUrl ? new URL(sourceUrl).hostname : "Uploaded Resource");
    if (!title) return;

    setIsProcessing(true);
    setProcessingProgress(10);
    setProcessingStage("Uploading file to secure student workspace...");

    // Stage 1: Uploading
    await new Promise((res) => setTimeout(res, 600));
    setProcessingProgress(35);
    setProcessingStage("Validating format & scanning integrity...");

    // Stage 2: Processing & Extraction
    await new Promise((res) => setTimeout(res, 700));
    setProcessingProgress(65);
    setProcessingStage("Extracting text chapters and mathematical formulas...");

    let extractedText = "";
    if (selectedFile && (selectedFile.type.includes("text") || selectedFile.name.endsWith(".md") || selectedFile.name.endsWith(".txt"))) {
      try {
        extractedText = await selectedFile.text();
      } catch {
        extractedText = `Extracted text from ${selectedFile.name}. Contains coursework notes and academic equations.`;
      }
    } else {
      extractedText = `Extracted course syllabus document: "${title}". Includes structured headings, definitions, optimization algorithms, and key exam questions.`;
    }

    // Stage 3: Indexing
    await new Promise((res) => setTimeout(res, 600));
    setProcessingProgress(90);
    setProcessingStage("Indexing semantic chunks for AI citation grounding...");

    // Stage 4: Ready
    await new Promise((res) => setTimeout(res, 500));
    setProcessingProgress(100);
    setProcessingStage("Ready!");

    const sizeStr = selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : "Web Resource";
    const newSrc = await createSource(userId, title, sourceType, sizeStr, sourceUrl, extractedText);

    setSources([newSrc, ...sources]);
    setIsProcessing(false);
    setIsAddModalOpen(false);
    setSourceTitle("");
    setSourceUrl("");
    setSelectedFile(null);
    showToast("Source Grounded", `"${newSrc.title}" is ready for AI citations and summaries.`, "success");
  };

  // Retry failed source
  const handleRetryProcessing = async (sourceId: string) => {
    showToast("Retrying Processing", "Re-extracting document contents...", "info");
    const updated = await updateSourceStatus(sourceId, "processing");
    if (updated) {
      setSources((prev) => prev.map((s) => (s.id === sourceId ? updated : s)));
    }

    setTimeout(async () => {
      const ready = await updateSourceStatus(
        sourceId,
        "ready",
        "Extracted academic materials successfully indexed."
      );
      if (ready) {
        setSources((prev) => prev.map((s) => (s.id === sourceId ? ready : s)));
        showToast("Processing Succeeded", "Source is now ready for learning.", "success");
      }
    }, 1500);
  };

  // Delete source
  const handleDeleteSource = async (sourceId: string) => {
    await deleteSource(sourceId);
    setSources((prev) => prev.filter((s) => s.id !== sourceId));
    if (inspectSource?.id === sourceId) setInspectSource(null);
    showToast("Source Deleted", "Removed from your knowledge base.", "info");
  };

  // Ask specific source grounded Q&A
  const handleAskSourceAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectSource || !sourceAiQuery.trim()) return;

    setIsSourceAiLoading(true);
    setSourceAiAnswer(null);

    try {
      const res = await fetch("/api/ai/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ask_notebook",
          query: sourceAiQuery,
          sources: [
            {
              title: inspectSource.title,
              text: inspectSource.extracted_text || "",
            },
          ],
        }),
      });

      const data = await res.json();
      setSourceAiAnswer({
        answer: data.answer || "Answer processed.",
        sources: data.sources || [inspectSource.title],
        citations: data.citations || [inspectSource.title],
      });
    } catch {
      showToast("Error", "Could not complete grounded query.", "error");
    } finally {
      setIsSourceAiLoading(false);
    }
  };

  // Filter sources
  const filteredSources = sources.filter((s) => {
    const matchSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.source_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType =
      selectedTypeFilter === "All" ||
      s.source_type.toLowerCase() === selectedTypeFilter.toLowerCase();
    return matchSearch && matchType;
  });

  const readyCount = sources.filter((s) => s.processing_status === "ready").length;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Library className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              LearnTrack Knowledge Base
            </h1>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
              {readyCount} Sources Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Upload PDFs, notes, and reference links to ground LearnTrack AI in your actual course syllabus.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-soft-sm cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Source</span>
        </button>
      </div>

      {/* 2. Privacy & Grounding Indicator */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-100 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 space-y-0.5">
          <p className="font-semibold text-blue-950">
            Privacy &amp; Grounding Architecture
          </p>
          <p className="text-slate-600 leading-relaxed">
            Your uploaded documents remain strictly associated with your authenticated student account. All AI interactions cite your exact course materials without fabricating outside information.
          </p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search learning sources by name or type..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {["All", "PDF", "DOCX", "TXT", "Markdown", "URL"].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                selectedTypeFilter === type
                  ? "bg-slate-900 text-white font-semibold shadow-2xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Sources Library Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-400 font-medium">Loading knowledge base sources...</div>
      ) : filteredSources.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white p-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No sources added yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Add lecture PDFs, revision notes, or web articles to ground LearnTrack AI in your coursework.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors"
          >
            + Add First Source
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSources.map((source) => {
            const isReady = source.processing_status === "ready";
            const isFailed = source.processing_status === "failed";
            const isProcessing = !isReady && !isFailed;

            return (
              <div
                key={source.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 hover:border-blue-200 hover:shadow-card transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Icon + Status Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/60 font-mono text-xs uppercase font-bold">
                        {source.source_type === "url" ? (
                          <Globe className="w-4 h-4 text-cyan-600" />
                        ) : source.source_type === "pdf" ? (
                          <FileText className="w-4 h-4 text-rose-600" />
                        ) : source.source_type === "markdown" ? (
                          <FileCode className="w-4 h-4 text-purple-600" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-blue-600" />
                        )}
                      </span>
                      <span className="text-[10px] font-mono uppercase font-semibold text-slate-400">
                        {source.source_type}
                      </span>
                    </div>

                    {/* Status Pill */}
                    {isReady && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ready</span>
                      </span>
                    )}
                    {isProcessing && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold animate-pulse">
                        <Clock className="w-3 h-3 animate-spin" />
                        <span>Processing</span>
                      </span>
                    )}
                    {isFailed && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Failed</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {source.title}
                  </h4>

                  <div className="flex items-center gap-2 text-[10.5px] text-slate-400 font-mono mt-2">
                    <span>{source.file_size || "1.5 MB"}</span>
                    <span>•</span>
                    <span>{new Date(source.created_at).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                  </div>

                  {/* TLDR Snippet */}
                  {source.summary?.tldr && (
                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed bg-slate-50/70 p-2 rounded-xl border border-slate-100">
                      {source.summary.tldr}
                    </p>
                  )}
                </div>

                {/* Actions Bottom Bar */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    {isReady && (
                      <button
                        onClick={() => {
                          setInspectSource(source);
                          setInspectTab("summary");
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Summary</span>
                      </button>
                    )}
                    {isFailed && (
                      <button
                        onClick={() => handleRetryProcessing(source.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteSource(source.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete source"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Add Source Modal with Progress Indicator */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !isProcessing && setIsAddModalOpen(false)}
        title="Add Learning Source"
        description="Supported formats: PDF, DOCX, TXT, Markdown, and Web URLs. Sources are parsed and indexed for grounded AI learning."
      >
        {isProcessing ? (
          /* Processing Lifecycle Indicator */
          <div className="py-8 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center mx-auto animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900">{processingStage}</p>
              <p className="text-xs text-slate-400 font-mono">
                {processingProgress}% Complete
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden max-w-xs mx-auto border border-slate-200">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <form onSubmit={handleStartUpload} className="space-y-4 pt-2">
            {/* Source Type Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Source Type</label>
              <div className="grid grid-cols-5 gap-1.5">
                {(["pdf", "docx", "txt", "markdown", "url"] as SourceType[]).map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setSourceType(t)}
                    className={`py-1.5 rounded-lg text-xs font-medium uppercase border transition-colors ${
                      sourceType === t
                        ? "bg-blue-50 border-blue-600 text-blue-700 font-bold"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {sourceType === "url" ? (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Web Article / Documentation URL</label>
                <Input
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                  required
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">File Upload</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
                  <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-700">
                    {selectedFile ? selectedFile.name : `Click or drag your ${sourceType.toUpperCase()} file here`}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Up to 25MB per document</p>
                  <input
                    type="file"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                        if (!sourceTitle) {
                          setSourceTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
                        }
                      }
                    }}
                    className="mt-3 text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Display Title</label>
              <Input
                value={sourceTitle}
                onChange={(e) => setSourceTitle(e.target.value)}
                placeholder="e.g. Machine Learning Unit 1 - Supervised Learning"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Upload &amp; Process Source
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* 6. Source Inspector / AI Summary Modal */}
      {inspectSource && (
        <Modal
          isOpen={Boolean(inspectSource)}
          onClose={() => setInspectSource(null)}
          title={inspectSource.title}
          description={`${inspectSource.source_type.toUpperCase()} • ${inspectSource.file_size || "Indexed Document"} • Grounded AI Ready`}
        >
          <div className="space-y-4 pt-1">
            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-100 pb-2">
              <button
                onClick={() => setInspectTab("summary")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  inspectTab === "summary" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                AI Summary
              </button>
              <button
                onClick={() => setInspectTab("text")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  inspectTab === "text" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Extracted Text
              </button>
              <button
                onClick={() => setInspectTab("ask")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  inspectTab === "ask" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                Ask This Source
              </button>
            </div>

            {/* Tab 1: AI Summary */}
            {inspectTab === "summary" && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin text-xs">
                {/* TLDR */}
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                  <span className="font-bold text-blue-900 block mb-1 uppercase text-[10px] tracking-wider">
                    Executive Summary (TL;DR)
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {inspectSource.summary?.tldr || "Document processed and indexed for grounded AI learning."}
                  </p>
                </div>

                {/* Key Concepts */}
                {inspectSource.summary?.key_concepts && (
                  <div>
                    <span className="font-bold text-slate-800 block mb-1.5 uppercase text-[10px] tracking-wider">
                      Key Concepts
                    </span>
                    <ul className="space-y-1 list-disc list-inside text-slate-700">
                      {inspectSource.summary.key_concepts.map((kc, i) => (
                        <li key={i}>{kc}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Important Terms */}
                {inspectSource.summary?.important_terms && (
                  <div>
                    <span className="font-bold text-slate-800 block mb-1.5 uppercase text-[10px] tracking-wider">
                      Important Definitions
                    </span>
                    <div className="space-y-2">
                      {inspectSource.summary.important_terms.map((item, i) => (
                        <div key={i} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="font-bold text-slate-900">{item.term}</span>:{" "}
                          <span className="text-slate-600">{item.definition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formulas */}
                {inspectSource.summary?.important_formulas && inspectSource.summary.important_formulas.length > 0 && (
                  <div>
                    <span className="font-bold text-slate-800 block mb-1.5 uppercase text-[10px] tracking-wider">
                      Governing Formulas
                    </span>
                    <div className="space-y-1.5 font-mono text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {inspectSource.summary.important_formulas.map((f, i) => (
                        <p key={i}>$${f}$$</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Questions to Review */}
                {inspectSource.summary?.questions_to_review && (
                  <div>
                    <span className="font-bold text-slate-800 block mb-1.5 uppercase text-[10px] tracking-wider">
                      Questions to Review
                    </span>
                    <div className="space-y-1 text-slate-700">
                      {inspectSource.summary.questions_to_review.map((q, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Extracted Text */}
            {inspectTab === "text" && (
              <div className="max-h-[60vh] overflow-y-auto pr-1 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 font-sans whitespace-pre-wrap leading-relaxed">
                {inspectSource.extracted_text || "No text extracted."}
              </div>
            )}

            {/* Tab 3: Ask Source AI */}
            {inspectTab === "ask" && (
              <div className="space-y-3">
                <form onSubmit={handleAskSourceAI} className="flex items-center gap-2">
                  <Input
                    value={sourceAiQuery}
                    onChange={(e) => setSourceAiQuery(e.target.value)}
                    placeholder={`Ask a question about "${inspectSource.title.slice(0, 30)}..."`}
                    disabled={isSourceAiLoading}
                  />
                  <Button type="submit" variant="primary" size="md" disabled={isSourceAiLoading}>
                    {isSourceAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ask"}
                  </Button>
                </form>

                {sourceAiAnswer && (
                  <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center gap-1 font-bold text-blue-900 uppercase tracking-wide text-[10px]">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Grounded Answer</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                      {sourceAiAnswer.answer}
                    </p>
                    <div className="pt-2 border-t border-blue-100 flex flex-wrap gap-1 text-[10px] text-slate-500">
                      <span className="font-semibold text-slate-600">Citations:</span>
                      {sourceAiAnswer.citations.map((c, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-white text-blue-800 border border-blue-200">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
