"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  Pin,
  BookMarked,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getNotebooks, getNotes, deleteNote, createNote } from "@/lib/learning/service";
import { Note, Notebook } from "@/types/learning";
import { useToast } from "@/components/ui/Toast";

export default function NotesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id || "demo-student";
  const { showToast } = useToast();

  const [notes, setNotes] = useState<Note[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNotebookFilter, setSelectedNotebookFilter] = useState<string>("All");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [allNotes, allNotebooks] = await Promise.all([
        getNotes(undefined, userId),
        getNotebooks(userId),
      ]);
      setNotes(allNotes);
      setNotebooks(allNotebooks);
    } catch (e) {
      console.error("Failed to load notes:", e);
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

  const handleDelete = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    await deleteNote(noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    showToast("Note Deleted", "Removed note from your workspace.", "info");
  };

  const handleQuickCreate = async () => {
    const defaultNbId = notebooks[0]?.id || "nb-general";
    await createNote(userId, defaultNbId, "Untitled Note", "");
    router.push("/notebook");
  };

  const filtered = notes.filter((n) => {
    const matchSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchNb =
      selectedNotebookFilter === "All" || n.notebook_id === selectedNotebookFilter;
    return matchSearch && matchNb;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Course Notes
            </h1>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
              {notes.length} Notes Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Access and manage lecture notes, formulas, and revision materials across all subjects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/notebook"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs transition-colors"
          >
            <BookMarked className="w-4 h-4 text-blue-600" />
            <span>Open Notebook Workspace</span>
          </Link>
          <button
            onClick={handleQuickCreate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-soft-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* 2. Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by keyword, formula, or tag..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
          />
        </div>

        {/* Notebook Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedNotebookFilter("All")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              selectedNotebookFilter === "All"
                ? "bg-slate-900 text-white font-semibold shadow-2xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            All Notebooks
          </button>
          {notebooks.map((nb) => (
            <button
              key={nb.id}
              onClick={() => setSelectedNotebookFilter(nb.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                selectedNotebookFilter === nb.id
                  ? "bg-blue-600 text-white font-semibold shadow-2xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span>{nb.icon || "📓"}</span>
              <span>{nb.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Notes Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-slate-400 font-medium">Loading notes...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white p-8">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">No notes found</h3>
          <p className="text-xs text-slate-500 mt-1">Start jotting down thoughts or formulas.</p>
          <button
            onClick={handleQuickCreate}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            + Create Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((note) => {
            const nb = notebooks.find((n) => n.id === note.notebook_id);
            return (
              <div
                key={note.id}
                onClick={() => router.push("/notebook")}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 hover:border-blue-200 hover:shadow-card transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Notebook badge + Pin */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10.5px] font-medium">
                      <span>{nb?.icon || "📓"}</span>
                      <span>{nb?.title || "Notebook"}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      {note.is_pinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                      <button
                        onClick={(e) => handleDelete(e, note.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {note.title || "Untitled Note"}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed font-sans">
                    {note.content.replace(/[#*`_$-]/g, "").slice(0, 160) || "Empty note content..."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <span>{new Date(note.updated_at).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                    <span>•</span>
                    <span>{note.word_count || 0} words</span>
                  </div>

                  <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Open <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
