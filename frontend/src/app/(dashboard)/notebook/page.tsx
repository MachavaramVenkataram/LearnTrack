"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  BookMarked,
  Plus,
  Sparkles,
  Pin,
  Tag,
  Trash2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  Heading1,
  Sigma,
  Send,
  Loader2,
  FileText,
  Brain,
  ListChecks,
  Check,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getNotebooks,
  getNotes,
  getSources,
  createNotebook,
  createNote,
  updateNote,
  deleteNote,
} from "@/lib/learning/service";
import { Notebook, Note, KnowledgeSource } from "@/types/learning";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export default function NotebookPage() {
  const { user } = useAuth();
  const userId = user?.id || "demo-student";
  const { showToast } = useToast();

  // 1. Workspace State
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [activeNotebookId, setActiveNotebookId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Layout panels
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [mobileTab, setMobileTab] = useState<"list" | "editor" | "ai">("editor");

  // Note editor state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Slash command popup
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const editorTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Floating selection toolbar
  const [selectionToolbar, setSelectionToolbar] = useState<{
    visible: boolean;
    text: string;
    x: number;
    y: number;
  }>({ visible: false, text: "", x: 0, y: 0 });

  // AI Learning Panel Chat
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiMessages, setAiMessages] = useState<
    Array<{
      role: "user" | "assistant";
      content: string;
      sources?: string[];
      citations?: string[];
    }>
  >([
    {
      role: "assistant",
      content:
        "Welcome to **LearnTrack Notebook AI**! I'm grounded in your active notes and selected sources. Ask questions, request summaries, or generate exam revision materials.",
      sources: ["Machine Learning Unit 1.pdf"],
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Modals
  const [isNewNotebookOpen, setIsNewNotebookOpen] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState("");
  const [newNotebookDesc, setNewNotebookDesc] = useState("");
  const [newNotebookIcon, setNewNotebookIcon] = useState("📓");

  // Load Initial Data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [nbList, srcList] = await Promise.all([
        getNotebooks(userId),
        getSources(userId),
      ]);
      setNotebooks(nbList);
      setSources(srcList);

      const firstNbId = nbList[0]?.id || null;
      setActiveNotebookId(firstNbId);

      if (firstNbId) {
        const noteList = await getNotes(firstNbId, userId);
        setNotes(noteList);
        const firstNote = noteList[0];
        if (firstNote) {
          setActiveNoteId(firstNote.id);
          setTitle(firstNote.title);
          setContent(firstNote.content);
          setTags(firstNote.tags || []);
          setIsPinned(Boolean(firstNote.is_pinned));
        }
      }

      // Default select ready sources
      const readyIds = srcList.filter((s) => s.processing_status === "ready").map((s) => s.id);
      setSelectedSourceIds(readyIds.slice(0, 3));
    } catch (e) {
      console.error("Failed to load notebook data:", e);
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

  // Handle Switching Notebooks
  const handleSelectNotebook = async (nbId: string) => {
    setActiveNotebookId(nbId);
    const nList = await getNotes(nbId, userId);
    setNotes(nList);
    if (nList.length > 0) {
      const first = nList[0];
      setActiveNoteId(first.id);
      setTitle(first.title);
      setContent(first.content);
      setTags(first.tags || []);
      setIsPinned(Boolean(first.is_pinned));
    } else {
      setActiveNoteId(null);
      setTitle("");
      setContent("");
      setTags([]);
      setIsPinned(false);
    }
    setMobileTab("editor");
  };

  // Handle Switching Notes
  const handleSelectNote = (note: Note) => {
    setActiveNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags || []);
    setIsPinned(Boolean(note.is_pinned));
    setMobileTab("editor");
  };

  // Debounced Auto-Save
  const triggerAutoSave = (newTitle: string, newContent: string, newTags: string[], newPinned: boolean) => {
    if (!activeNoteId) return;
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      try {
        await updateNote(activeNoteId, {
          title: newTitle,
          content: newContent,
          tags: newTags,
          is_pinned: newPinned,
        });
        setSaveStatus("saved");
        // Update local list
        setNotes((prev) =>
          prev.map((n) =>
            n.id === activeNoteId
              ? { ...n, title: newTitle, content: newContent, tags: newTags, is_pinned: newPinned }
              : n
          )
        );
      } catch {
        setSaveStatus("unsaved");
      }
    }, 600);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    triggerAutoSave(val, content, tags, isPinned);
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    triggerAutoSave(title, val, tags, isPinned);

    // Detect Slash command
    const textarea = editorTextareaRef.current;
    if (textarea) {
      const cursor = textarea.selectionStart;
      const textBefore = val.slice(0, cursor);
      const lastSlash = textBefore.lastIndexOf("/");
      if (lastSlash !== -1 && (lastSlash === 0 || textBefore[lastSlash - 1] === "\n" || textBefore[lastSlash - 1] === " ")) {
        const query = textBefore.slice(lastSlash + 1);
        if (!query.includes("\n") && query.length < 15) {
          setShowSlashMenu(true);
          setSlashQuery(query.toLowerCase());
          return;
        }
      }
    }
    setShowSlashMenu(false);
  };

  // Create New Note
  const handleCreateNote = async () => {
    if (!activeNotebookId) return;
    const newNote = await createNote(userId, activeNotebookId, "Untitled Note", "");
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setTitle(newNote.title);
    setContent(newNote.content);
    setTags([]);
    setIsPinned(false);
    showToast("Note Created", "New note added to your notebook.", "success");
    setMobileTab("editor");
  };

  // Create New Notebook
  const handleCreateNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotebookTitle.trim()) return;

    const nb = await createNotebook(userId, newNotebookTitle.trim(), newNotebookDesc.trim(), newNotebookIcon);
    setNotebooks([nb, ...notebooks]);
    setActiveNotebookId(nb.id);
    setIsNewNotebookOpen(false);
    setNewNotebookTitle("");
    setNewNotebookDesc("");
    showToast("Notebook Created", `"${nb.title}" is ready for learning.`, "success");
    await handleSelectNotebook(nb.id);
  };

  // Delete Note
  const handleDeleteNote = async (noteId: string) => {
    await deleteNote(noteId);
    const remaining = notes.filter((n) => n.id !== noteId);
    setNotes(remaining);
    if (activeNoteId === noteId) {
      if (remaining.length > 0) {
        handleSelectNote(remaining[0]);
      } else {
        setActiveNoteId(null);
        setTitle("");
        setContent("");
      }
    }
    showToast("Note Deleted", "The note was removed.", "info");
  };

  // Insert Rich Text Formatting or Blocks
  const insertFormatting = (prefix: string, suffix = "") => {
    const textarea = editorTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = prefix + (selected || "text") + suffix;
    const nextContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(nextContent);
    triggerAutoSave(title, nextContent, tags, isPinned);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 10);
  };

  // Slash commands execution
  const executeSlashCommand = (cmd: string) => {
    setShowSlashMenu(false);
    const textarea = editorTextareaRef.current;
    if (!textarea) return;
    const cursor = textarea.selectionStart;
    const textBefore = content.slice(0, cursor);
    const lastSlash = textBefore.lastIndexOf("/");
    const beforeSlash = content.slice(0, lastSlash);
    const afterCursor = content.slice(cursor);

    let snippet = "";
    switch (cmd) {
      case "heading":
        snippet = "\n## New Heading\n";
        break;
      case "code":
        snippet = "\n```python\n# Write code here\nprint('Hello LearnTrack')\n```\n";
        break;
      case "math":
        snippet = "\n$$\n\\theta_{t+1} = \\theta_t - \\alpha \\nabla J(\\theta_t)\n$$\n";
        break;
      case "quote":
        snippet = "\n> Important academic concept to remember for exams.\n";
        break;
      case "checklist":
        snippet = "\n- [ ] Task 1: Review foundational proofs\n- [ ] Task 2: Solve 3 numerical problems\n";
        break;
      case "flashcards":
        handleGenerateFlashcardsFromNote();
        return;
      case "quiz":
        handleGenerateQuizFromNote();
        return;
      case "summary":
        handleAskAIAction("Summarize this note in high-yield points");
        return;
      default:
        snippet = "";
    }

    const nextContent = beforeSlash + snippet + afterCursor;
    setContent(nextContent);
    triggerAutoSave(title, nextContent, tags, isPinned);
  };

  // Handle Text Selection Floating Toolbar
  const handleTextareaMouseUp = () => {
    const textarea = editorTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end).trim();

    if (selected.length > 5) {
      const rect = textarea.getBoundingClientRect();
      setSelectionToolbar({
        visible: true,
        text: selected,
        x: Math.min(rect.right - 260, Math.max(rect.left + 20, rect.left + 100)),
        y: Math.max(rect.top + 20, rect.top + 60),
      });
    } else {
      setSelectionToolbar((prev) => ({ ...prev, visible: false }));
    }
  };

  // Smart Action from Floating Toolbar
  const handleSmartAction = async (actionType: string) => {
    const selected = selectionToolbar.text;
    setSelectionToolbar((prev) => ({ ...prev, visible: false }));
    showToast(`AI ${actionType}`, "Processing selected note text...", "info");

    try {
      const res = await fetch("/api/ai/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "smart_action",
          selectedText: selected,
          transformAction: actionType,
        }),
      });

      const data = await res.json();
      if (data.result) {
        setAiMessages((prev) => [
          ...prev,
          { role: "user", content: `Action: ${actionType} on "${selected.slice(0, 60)}..."` },
          { role: "assistant", content: data.result, sources: ["Selected Note Text"] },
        ]);
        if (isRightCollapsed) setIsRightCollapsed(false);
      }
    } catch {
      showToast("AI Error", "Failed to process smart action.", "error");
    }
  };

  // Send Chat message to Notebook AI
  const handleSendAiChat = async (queryText?: string) => {
    const textToSend = queryText || aiChatInput;
    if (!textToSend.trim() || isAiLoading) return;

    setAiChatInput("");
    setAiMessages((prev) => [...prev, { role: "user", content: textToSend }]);
    setIsAiLoading(true);

    try {
      const activeSources = sources
        .filter((s) => selectedSourceIds.includes(s.id))
        .map((s) => ({ title: s.title, text: s.extracted_text || "" }));

      const res = await fetch("/api/ai/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ask_notebook",
          query: textToSend,
          contextText: content,
          sources: activeSources,
          history: aiMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer || "I processed your request using your grounded course notes.",
          sources: data.sources || [],
          citations: data.citations || [],
        },
      ]);
    } catch (e) {
      console.error("AI chat error:", e);
      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "LearnTrack AI couldn't generate this right now. Please check your connectivity and try again.",
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAskAIAction = (prompt: string) => {
    if (isRightCollapsed) setIsRightCollapsed(false);
    handleSendAiChat(prompt);
  };

  const handleGenerateFlashcardsFromNote = async () => {
    showToast("Generating Flashcards", "Creating flashcards from note content...", "info");
    try {
      const res = await fetch("/api/ai/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_flashcards",
          topic: title || "Note Concepts",
          contextText: content,
          count: 4,
        }),
      });
      const data = await res.json();
      if (data.flashcards) {
        showToast("Flashcards Generated!", `Created ${data.flashcards.length} cards in Flashcards.`, "success");
      }
    } catch {
      showToast("Generation Failed", "Could not generate flashcards.", "error");
    }
  };

  const handleGenerateQuizFromNote = async () => {
    showToast("Generating Quiz", "Building practice quiz from note...", "info");
    try {
      const res = await fetch("/api/ai/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_quiz",
          subject: notebooks.find((n) => n.id === activeNotebookId)?.title || "Coursework",
          topic: title || "Note Review",
          contextText: content,
          difficulty: "Medium",
          count: 5,
        }),
      });
      const data = await res.json();
      if (data.questions) {
        showToast("Practice Quiz Ready", "5 questions generated in Practice Lab.", "success");
      }
    } catch {
      showToast("Generation Failed", "Could not generate quiz.", "error");
    }
  };

  const activeNotebook = notebooks.find((n) => n.id === activeNotebookId);

  return (
    <div className="space-y-4">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <BookMarked className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              LearnTrack Notebook
            </h1>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 border border-purple-100">
              {activeNotebook ? activeNotebook.title : "Grounded AI"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Your personal AI-powered learning workspace. Notion-style notes grounded with NotebookLM intelligence.
          </p>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex sm:hidden items-center p-1 bg-slate-100 rounded-xl text-xs font-medium w-full">
          <button
            onClick={() => setMobileTab("list")}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${mobileTab === "list" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600"}`}
          >
            Notebooks
          </button>
          <button
            onClick={() => setMobileTab("editor")}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${mobileTab === "editor" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600"}`}
          >
            Editor
          </button>
          <button
            onClick={() => setMobileTab("ai")}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${mobileTab === "ai" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-600"}`}
          >
            AI Panel
          </button>
        </div>
      </div>

      {/* 2. Three-Panel Workspace Container */}
      <div className="h-[calc(100vh-210px)] min-h-[600px] flex rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-soft-sm relative">
        {/* ========================================================================= */}
        {/* PANEL 1: LEFT - NOTEBOOKS & NOTES LIST */}
        {/* ========================================================================= */}
        <div
          className={`w-full md:w-64 lg:w-72 ${
            mobileTab !== "list" ? "hidden md:flex" : "flex"
          } flex-col border-r border-slate-200 bg-slate-50/60 shrink-0 transition-all duration-200`}
        >
          {/* Notebooks Switcher Header */}
          <div className="p-3.5 border-b border-slate-200/80 bg-white/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Notebooks
              </span>
              <button
                onClick={() => setIsNewNotebookOpen(true)}
                className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:text-blue-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>

            {/* Notebook Selector Chips */}
            <div className="space-y-1 max-h-36 overflow-y-auto scrollbar-thin">
              {notebooks.map((nb) => {
                const isActive = nb.id === activeNotebookId;
                return (
                  <button
                    key={nb.id}
                    onClick={() => handleSelectNotebook(nb.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                      isActive
                        ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200/60 shadow-2xs"
                        : "text-slate-600 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{nb.icon || "📓"}</span>
                      <span className="truncate">{nb.title}</span>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes in Active Notebook */}
          <div className="flex-1 flex flex-col min-h-0 bg-white">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Notes ({notes.length})
              </span>
              <button
                onClick={handleCreateNote}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-600 text-white text-[11px] font-medium hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Note</span>
              </button>
            </div>

            {/* Scrollable Notes List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
              {isLoading ? (
                <div className="py-12 text-center px-4 text-xs text-slate-400 font-medium">Loading notes...</div>
              ) : notes.length === 0 ? (
                <div className="py-12 text-center px-4">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No notes yet</p>
                  <p className="text-[11px] text-slate-400 mt-1">Create your first note in this workspace.</p>
                  <button
                    onClick={handleCreateNote}
                    className="mt-3 text-xs text-blue-600 font-semibold hover:underline"
                  >
                    + Create Note
                  </button>
                </div>
              ) : (
                notes.map((note) => {
                  const isActive = note.id === activeNoteId;
                  return (
                    <div
                      key={note.id}
                      onClick={() => handleSelectNote(note)}
                      className={`group relative p-2.5 rounded-xl cursor-pointer transition-all border ${
                        isActive
                          ? "bg-blue-50/80 border-blue-200/80 text-blue-900 shadow-2xs"
                          : "bg-white hover:bg-slate-50 border-transparent hover:border-slate-200/60 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <p className="text-xs font-semibold truncate leading-tight flex items-center gap-1">
                          {note.is_pinned && <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                          <span className="truncate">{note.title || "Untitled Note"}</span>
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-rose-600 transition-opacity"
                          title="Delete note"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-2 font-normal leading-snug">
                        {note.content.replace(/[#*`_$-]/g, "").slice(0, 80) || "Empty note content..."}
                      </p>

                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400 font-mono">
                        <span>{new Date(note.updated_at).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                        <span>•</span>
                        <span>{note.word_count || 0} words</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PANEL 2: CENTER - RICH TEXT NOTE EDITOR */}
        {/* ========================================================================= */}
        <div
          className={`flex-1 flex flex-col min-w-0 bg-white ${
            mobileTab !== "editor" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Editor Action Bar */}
          <div className="h-12 border-b border-slate-200/80 px-4 flex items-center justify-between gap-2 bg-slate-50/40">
            {/* Left formatting toolbar */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
              <button
                onClick={() => insertFormatting("**", "**")}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                title="Bold (Ctrl+B)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting("*", "*")}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                title="Italic (Ctrl+I)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting("<u>", "</u>")}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                title="Underline"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <div className="h-4 w-px bg-slate-200 mx-1" />
              <button
                onClick={() => insertFormatting("# ")}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors text-[11px] font-bold"
                title="Heading 1"
              >
                H1
              </button>
              <button
                onClick={() => insertFormatting("## ")}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors text-[11px] font-bold"
                title="Heading 2"
              >
                H2
              </button>
              <button
                onClick={() => insertFormatting("- ")}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                title="Bullet List"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting("1. ")}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                title="Numbered List"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting("- [ ] ")}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                title="Checklist"
              >
                <CheckSquare className="w-3.5 h-3.5" />
              </button>
              <div className="h-4 w-px bg-slate-200 mx-1" />
              <button
                onClick={() => insertFormatting("`", "`")}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                title="Code inline / block"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting("$$ ", " $$")}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                title="LaTeX Math"
              >
                <Sigma className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => insertFormatting("> ")}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
                title="Quote"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right Status Indicator */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10.5px] font-mono text-slate-400">
                {saveStatus === "saving" && "Saving..."}
                {saveStatus === "saved" && "Saved"}
                {saveStatus === "unsaved" && "Unsaved"}
              </span>
              <button
                onClick={() => {
                  const nextPinned = !isPinned;
                  setIsPinned(nextPinned);
                  triggerAutoSave(title, content, tags, nextPinned);
                }}
                className={`p-1.5 rounded-lg transition-colors ${
                  isPinned ? "text-amber-600 bg-amber-50" : "text-slate-400 hover:text-slate-700"
                }`}
                title={isPinned ? "Unpin note" : "Pin note"}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsRightCollapsed(!isRightCollapsed)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors hidden md:block"
                title={isRightCollapsed ? "Expand AI Panel" : "Collapse AI Panel"}
              >
                {isRightCollapsed ? <PanelRightOpen className="w-4 h-4" /> : <PanelRightClose className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Note Editor Content Canvas */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4 max-w-3xl w-full mx-auto relative">
            {/* Note Title Input */}
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Note title..."
              className="w-full text-2xl sm:text-3xl font-bold text-slate-900 placeholder:text-slate-300 border-none outline-none focus:outline-none bg-transparent"
            />

            {/* Tags & Context Pill */}
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Tags:
              </span>
              {tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10.5px] font-medium"
                >
                  {t}
                </span>
              ))}
              <button
                onClick={() => {
                  const tag = prompt("Enter tag name (e.g. ML, Calculus, Unit 1):");
                  if (tag && !tags.includes(tag.trim())) {
                    const next = [...tags, tag.trim()];
                    setTags(next);
                    triggerAutoSave(title, content, next, isPinned);
                  }
                }}
                className="text-[10px] text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                + Add tag
              </button>
            </div>

            {/* Hint for slash command */}
            <div className="text-[11px] font-mono text-slate-400 select-none">
              Type <kbd className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">/</kbd> for AI actions, code, math, and blocks. Highlight text for floating AI toolbar.
            </div>

            {/* Main Textarea */}
            <textarea
              ref={editorTextareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onMouseUp={handleTextareaMouseUp}
              onKeyUp={handleTextareaMouseUp}
              placeholder="Start writing notes, formulas, or summaries... Type / for blocks."
              className="w-full h-[calc(100%-140px)] min-h-[380px] text-[14.5px] text-slate-800 placeholder:text-slate-300 bg-transparent border-none outline-none resize-none leading-relaxed font-sans scrollbar-thin"
              spellCheck="false"
            />

            {/* Floating Selection Toolbar */}
            {selectionToolbar.visible && (
              <div
                className="fixed z-40 bg-slate-900 text-white rounded-xl shadow-2xl p-1.5 flex items-center gap-1 border border-slate-800 animate-in fade-in zoom-in-95 duration-100"
                style={{ top: selectionToolbar.y, left: selectionToolbar.x }}
              >
                <span className="text-[10px] font-semibold text-slate-400 px-1 uppercase tracking-wider">
                  AI Action:
                </span>
                {["Explain", "Simplify", "Improve", "Create Example", "Create Flashcard"].map((act) => (
                  <button
                    key={act}
                    onClick={() => handleSmartAction(act)}
                    className="px-2 py-1 rounded-lg text-xs font-medium hover:bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer"
                  >
                    {act}
                  </button>
                ))}
              </div>
            )}

            {/* Slash Command Autocomplete Menu */}
            {showSlashMenu && (
              <div className="absolute z-40 left-8 top-32 w-64 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden p-1 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Blocks & AI Commands
                </div>
                {[
                  { cmd: "heading", label: "Heading", desc: "Large section header", icon: Heading1 },
                  { cmd: "code", label: "Code Block", desc: "Syntax highlighted code", icon: Code },
                  { cmd: "math", label: "Math Equation", desc: "LaTeX mathematical formula", icon: Sigma },
                  { cmd: "quote", label: "Quote", desc: "Blockquote concept", icon: Quote },
                  { cmd: "checklist", label: "Checklist", desc: "To-do study tasks", icon: CheckSquare },
                  { cmd: "flashcards", label: "Generate Flashcards", desc: "Create cards from this note", icon: Brain },
                  { cmd: "quiz", label: "Generate Quiz", desc: "Practice questions on this note", icon: ListChecks },
                  { cmd: "summary", label: "AI Summary", desc: "High-yield executive summary", icon: Sparkles },
                ]
                  .filter((item) => item.cmd.includes(slashQuery) || item.label.toLowerCase().includes(slashQuery))
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.cmd}
                        onClick={() => executeSlashCommand(item.cmd)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition-colors text-left cursor-pointer"
                      >
                        <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                        <div>
                          <p className="font-semibold leading-tight">{item.label}</p>
                          <p className="text-[10px] text-slate-400 leading-tight">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PANEL 3: RIGHT - NOTEBOOKLM-STYLE AI LEARNING PANEL */}
        {/* ========================================================================= */}
        <div
          className={`${
            isRightCollapsed ? "w-0 p-0 hidden md:hidden" : "w-full md:w-80 lg:w-96"
          } ${
            mobileTab !== "ai" ? "hidden md:flex" : "flex"
          } flex-col border-l border-slate-200 bg-slate-50/70 shrink-0 transition-all duration-200`}
        >
          {/* Header */}
          <div className="p-3.5 border-b border-slate-200/80 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  LearnTrack AI
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">NotebookLM Mode</span>
            </div>

            {/* Source Grounding Context Pill */}
            <div className="mt-2.5 p-2 rounded-xl bg-blue-50/60 border border-blue-100/80 text-[11px] text-blue-900 space-y-1">
              <div className="flex items-center justify-between font-semibold text-blue-700">
                <span>Active Grounding Context:</span>
                <span className="text-[10px] font-mono">{selectedSourceIds.length} sources</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="px-1.5 py-0.5 rounded bg-white border border-blue-200/60 text-[10px] text-blue-800 font-medium truncate max-w-[150px]">
                  ✓ {title || "Current Note"}
                </span>
                {sources
                  .filter((s) => selectedSourceIds.includes(s.id))
                  .slice(0, 2)
                  .map((s) => (
                    <span
                      key={s.id}
                      className="px-1.5 py-0.5 rounded bg-white border border-blue-200/60 text-[10px] text-blue-800 font-medium truncate max-w-[120px]"
                    >
                      ✓ {s.title.split(".")[0]}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          {/* Quick AI Action Pills */}
          <div className="p-2 border-b border-slate-200/60 bg-white/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {[
              { label: "Summarize", prompt: "Provide an executive summary of this note and attached sources." },
              { label: "Weak Areas", prompt: "Analyze this note and identify potential weak concepts or exam traps." },
              { label: "10 Exam Qs", prompt: "Create 10 challenging exam questions based on this material." },
              { label: "Step-by-Step", prompt: "Teach me the core mathematical derivation in this note step by step." },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => handleAskAIAction(btn.prompt)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200/70 text-[11px] font-medium text-slate-700 shrink-0 transition-colors cursor-pointer"
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Chat Stream Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 scrollbar-thin">
            {aiMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white ml-6 font-medium shadow-2xs"
                    : "bg-white border border-slate-200/80 text-slate-800 mr-2 shadow-2xs"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 mb-1.5 uppercase tracking-wide">
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    <span>Answer</span>
                  </div>
                )}

                <div className="prose prose-sm max-w-none text-xs whitespace-pre-line">
                  {msg.content}
                </div>

                {/* Grounded Source Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
                    <span className="font-semibold text-slate-600">Sources:</span>
                    {msg.sources.map((srcName, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 font-mono"
                      >
                        • {srcName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isAiLoading && (
              <div className="p-3 rounded-xl bg-white border border-slate-200/80 mr-4 flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Grounded AI is reading your notes and sources...</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAiChat();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                placeholder="Ask anything about your notes..."
                disabled={isAiLoading}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50"
              />
              <button
                type="submit"
                disabled={isAiLoading || !aiChatInput.trim()}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-colors cursor-pointer"
                title="Send"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* New Notebook Modal */}
      <Modal
        isOpen={isNewNotebookOpen}
        onClose={() => setIsNewNotebookOpen(false)}
        title="Create New Learning Notebook"
        description="Organize notes, uploaded sources, flashcards, and quizzes by course or semester."
      >
        <form onSubmit={handleCreateNotebook} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Notebook Title</label>
            <Input
              value={newNotebookTitle}
              onChange={(e) => setNewNotebookTitle(e.target.value)}
              placeholder="e.g. Digital Electronics, Machine Learning, Semester 1"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Icon Emoji</label>
            <div className="flex gap-2">
              {["📓", "🧠", "⚡", "💾", "📐", "🔬", "📅", "📊"].map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setNewNotebookIcon(emoji)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border ${
                    newNotebookIcon === emoji ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Description (Optional)</label>
            <Textarea
              value={newNotebookDesc}
              onChange={(e) => setNewNotebookDesc(e.target.value)}
              placeholder="Course description or target syllabus units..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsNewNotebookOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Notebook
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
