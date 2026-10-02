"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  MessageSquare,
  Edit2,
  Trash2,
  Check,
  X,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AIConversation } from "@/types/academic";

interface AIConversationSidebarProps {
  conversations: AIConversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  isCreating: boolean;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRenameConversation: (id: string, newTitle: string) => Promise<void>;
  onDeleteRequest: (conv: AIConversation) => void;
}

export function AIConversationSidebar({
  conversations,
  activeConversationId,
  isLoading,
  isCreating,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteRequest,
}: AIConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Filter conversations by search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase().trim();
    return conversations.filter((c) =>
      c.title.toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  // Group conversations by relative time: Today, Yesterday, Earlier
  const grouped = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: {
      today: AIConversation[];
      yesterday: AIConversation[];
      earlier: AIConversation[];
    } = { today: [], yesterday: [], earlier: [] };

    filteredConversations.forEach((conv) => {
      const d = new Date(conv.updated_at || conv.created_at);
      if (d >= today) {
        groups.today.push(conv);
      } else if (d >= yesterday) {
        groups.yesterday.push(conv);
      } else {
        groups.earlier.push(conv);
      }
    });

    return groups;
  }, [filteredConversations]);

  const handleStartRename = (e: React.MouseEvent, conv: AIConversation) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = async (id: string) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    await onRenameConversation(id, editTitle.trim());
    setEditingId(null);
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const formatTimestamp = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
      } else if (diffDays === 1) {
        return "Yesterday";
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      } else {
        return date.toLocaleDateString([], { month: "short", day: "numeric" });
      }
    } catch {
      return "";
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/70 border-r border-slate-200/80 w-full overflow-hidden select-none">
      {/* Header & New Chat button */}
      <div className="p-3.5 border-b border-slate-200/70 bg-white/70 space-y-3 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Conversations
          </span>
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {conversations.length}
          </span>
        </div>

        {/* Primary New Chat Button (Requirement #7) */}
        <button
          onClick={onNewConversation}
          disabled={isCreating}
          className="w-full h-10 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isCreating ? "Starting Chat..." : "+ New Chat"}</span>
        </button>

        {/* Search input (Requirement #8) */}
        {conversations.length > 0 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full h-8 pl-8 pr-7 rounded-lg bg-slate-100/90 hover:bg-slate-100 border border-slate-200/60 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Conversations scroll area */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-4">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-200/60 animate-pulse" />
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          /* Empty State (Requirement #11) */
          <div className="p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-800">
                {searchQuery ? "No matches found" : "No conversations yet"}
              </p>
              <p className="text-[11px] text-slate-500 leading-normal">
                {searchQuery
                  ? "Try a different search keyword."
                  : "Start a conversation with LearnTrack AI."}
              </p>
            </div>
            {!searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNewConversation}
                disabled={isCreating}
                className="text-xs h-8 px-3 font-medium bg-white hover:bg-slate-50 border-slate-200"
              >
                Start First Chat
              </Button>
            )}
          </div>
        ) : (
          /* Grouped list: TODAY, YESTERDAY, EARLIER (Requirement #6) */
          <>
            {grouped.today.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 block">
                  Today
                </span>
                {grouped.today.map((conv) => renderItem(conv))}
              </div>
            )}

            {grouped.yesterday.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 block">
                  Yesterday
                </span>
                {grouped.yesterday.map((conv) => renderItem(conv))}
              </div>
            )}

            {grouped.earlier.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 block">
                  Earlier
                </span>
                {grouped.earlier.map((conv) => renderItem(conv))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  function renderItem(conv: AIConversation) {
    const isActive = conv.id === activeConversationId;
    const isEditing = editingId === conv.id;

    return (
      <div
        key={conv.id}
        onClick={() => {
          if (!isEditing) onSelectConversation(conv.id);
        }}
        className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all duration-150 ${
          isActive
            ? "bg-blue-50/80 text-blue-700 font-semibold border-l-[3px] border-l-blue-600 border-t border-r border-b border-blue-100 shadow-xs pl-2.5"
            : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 border border-transparent"
        }`}
      >
        {isEditing ? (
          <div
            className="flex items-center gap-1.5 w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveRename(conv.id);
                if (e.key === "Escape") handleCancelRename();
              }}
              autoFocus
              className="w-full bg-white border border-blue-500 rounded-md px-2 py-1 text-xs text-slate-900 focus:outline-hidden ring-2 ring-blue-100"
            />
            <button
              onClick={() => handleSaveRename(conv.id)}
              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
              title="Save title"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCancelRename}
              className="p-1 text-slate-400 hover:bg-slate-200 rounded"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <MessageCircle
                className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                  isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
              <div className="min-w-0 flex-1 pr-1">
                <p className="truncate leading-tight">{conv.title || "Untitled Discussion"}</p>
                <span className="text-[10px] text-slate-400 font-normal block mt-0.5">
                  {formatTimestamp(conv.updated_at || conv.created_at)}
                </span>
              </div>
            </div>

            {/* Action buttons (Rename & Delete) on hover */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
              <button
                onClick={(e) => handleStartRename(e, conv)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded"
                title="Rename conversation"
                aria-label="Rename conversation"
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRequest(conv);
                }}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                title="Delete conversation"
                aria-label="Delete conversation"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </>
        )}
      </div>
    );
  }
}
