"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import {
  getAIConversations,
  createAIConversation,
  updateAIConversationTitle,
  deleteAIConversation,
  getAIMessages,
  addAIMessage,
  getActiveStudyPlan,
  getAcademicGoals,
} from "@/lib/academic/service";
import { buildStudentContext } from "@/lib/ai/contextBuilder";
import { sendAIChatMessage } from "@/lib/api/ai";
import {
  AIConversation,
  AIMessage,
  StudentAIContext,
  StudyPlan,
  AcademicGoal,
} from "@/types/academic";

// Modular UI Components
import { AIAssistantHeader } from "@/components/ai-assistant/AIAssistantHeader";
import { AIConversationSidebar } from "@/components/ai-assistant/AIConversationSidebar";
import { AIMessageStream } from "@/components/ai-assistant/AIMessageStream";
import { AIInputComposer } from "@/components/ai-assistant/AIInputComposer";
import { AIAcademicContextPanel } from "@/components/ai-assistant/AIAcademicContextPanel";
import { AIDeleteConversationModal } from "@/components/ai-assistant/AIDeleteConversationModal";
import { AIAssistantLoadingSkeleton } from "@/components/ai-assistant/AISkeletons";

export default function AssistantPage() {
  const { user, profile, studentProfile, isLoading: isAuthLoading } = useAuth();
  const { showToast } = useToast();

  // Conversations & Messages State
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  // Academic Context State
  const [context, setContext] = useState<StudentAIContext | null>(null);
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [goals, setGoals] = useState<AcademicGoal[]>([]);

  // Loading & Error States
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Deletion Modal State
  const [deleteTarget, setDeleteTarget] = useState<AIConversation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Responsive Panels (Left Sidebar & Right Context)
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightContext, setShowRightContext] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, scrollToBottom]);

  // Load student academic context and study plan
  const loadContextData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [ctx, plan, userGoals] = await Promise.all([
        buildStudentContext(user.id, studentProfile?.id, profile?.full_name),
        studentProfile?.id ? getActiveStudyPlan(studentProfile.id) : Promise.resolve(null),
        studentProfile?.id ? getAcademicGoals(studentProfile.id) : Promise.resolve([]),
      ]);
      setContext(ctx);
      setActivePlan(plan);
      setGoals(userGoals);
    } catch (err) {
      console.error("[AssistantPage] Error loading student context:", err);
    }
  }, [user?.id, studentProfile?.id, profile?.full_name]);

  // Initial Data Fetching
  useEffect(() => {
    let isCancelled = false;

    async function initializePage() {
      if (!user?.id && !studentProfile?.id) {
        if (!isAuthLoading) {
          setIsLoadingPage(false);
          setIsLoadingHistory(false);
        }
        return;
      }

      setIsLoadingHistory(true);
      const studentId = studentProfile?.id || user?.id || "default-student";

      try {
        const [convList] = await Promise.all([
          getAIConversations(studentId),
          loadContextData(),
        ]);

        if (isCancelled) return;

        setConversations(convList);
        if (convList.length > 0 && !activeConversationId) {
          setActiveConversationId(convList[0].id);
        }
      } catch (err) {
        console.error("[AssistantPage] Initialization error:", err);
      } finally {
        if (!isCancelled) {
          setIsLoadingPage(false);
          setIsLoadingHistory(false);
        }
      }
    }

    initializePage();

    return () => {
      isCancelled = true;
    };
  }, [user?.id, studentProfile?.id, isAuthLoading, loadContextData]);

  // Load messages whenever active conversation changes
  useEffect(() => {
    let isCancelled = false;

    async function loadMessages() {
      if (!activeConversationId) {
        setMessages([]);
        return;
      }

      setErrorMessage(null);
      try {
        const msgs = await getAIMessages(activeConversationId);
        if (!isCancelled) {
          setMessages(msgs);
        }
      } catch (err) {
        console.error("[AssistantPage] Error loading messages:", err);
      }
    }

    loadMessages();

    return () => {
      isCancelled = true;
    };
  }, [activeConversationId]);

  // Handle New Conversation
  const handleNewConversation = async () => {
    if (isCreatingChat) return;
    setIsCreatingChat(true);

    const studentId = studentProfile?.id || user?.id || "default-student";
    try {
      const newConv = await createAIConversation(studentId, "New Inquiry");
      if (!newConv) throw new Error("Could not create conversation session.");

      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setMessages([]);
      setErrorMessage(null);
      showToast("New Discussion", "Started a new conversation thread.", "info");
    } catch (err: any) {
      showToast("Error", err.message || "Failed to create conversation.", "error");
    } finally {
      setIsCreatingChat(false);
    }
  };

  // Handle Renaming Conversation
  const handleRenameConversation = async (convId: string, newTitle: string) => {
    try {
      await updateAIConversationTitle(convId, newTitle);
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, title: newTitle } : c))
      );
      showToast("Conversation Renamed", "Title updated successfully.", "success");
    } catch (err: any) {
      showToast("Error", "Could not rename conversation.", "error");
    }
  };

  // Handle Deleting Conversation
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);

    try {
      await deleteAIConversation(deleteTarget.id);
      const remaining = conversations.filter((c) => c.id !== deleteTarget.id);
      setConversations(remaining);

      if (activeConversationId === deleteTarget.id) {
        setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
        setMessages([]);
      }

      showToast("Conversation Deleted", "The discussion thread has been removed.", "info");
      setDeleteTarget(null);
    } catch (err: any) {
      showToast("Error", "Failed to delete conversation.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Send Message & AI Communication
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputMessage).trim();
    if (!content || isThinking) return;

    setErrorMessage(null);
    setInputMessage("");

    let currentConvId = activeConversationId;
    const studentId = studentProfile?.id || user?.id || "default-student";

    // If no active conversation, create one first
    if (!currentConvId) {
      try {
        const titleCandidate =
          content.length > 28 ? `${content.substring(0, 28)}...` : content;
        const newConv = await createAIConversation(studentId, titleCandidate);
        if (newConv) {
          currentConvId = newConv.id;
          setActiveConversationId(newConv.id);
          setConversations((prev) => [newConv, ...prev]);
        } else {
          showToast("Error", "Unable to start conversation session.", "error");
          return;
        }
      } catch (err: any) {
        showToast("Error", "Failed to initialize discussion session.", "error");
        return;
      }
    }

    if (!currentConvId) return;

    // 1. Optimistically append user message to UI
    const tempUserMsg: AIMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: currentConvId,
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    // Persist user message to Supabase
    addAIMessage(currentConvId, "user", content);

    // Auto-rename generic conversation title after first real message
    const activeConv = conversations.find((c) => c.id === currentConvId);
    if (
      activeConv &&
      (activeConv.title === "New Conversation" || activeConv.title === "New Inquiry")
    ) {
      const autoTitle =
        content.length > 32 ? `${content.substring(0, 32)}...` : content;
      updateAIConversationTitle(currentConvId, autoTitle);
      setConversations((prev) =>
        prev.map((c) => (c.id === currentConvId ? { ...c, title: autoTitle } : c))
      );
    }

    // 2. Call AI Service via internal API endpoint
    setIsThinking(true);
    try {
      const historyPayload = messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      historyPayload.push({ role: "user", content });

      const response = await sendAIChatMessage({
        userId: user?.id || "anonymous-student",
        studentId: studentProfile?.id,
        studentName: profile?.full_name || "Student",
        messages: historyPayload,
        context: context || undefined,
      });

      const assistantMsg: AIMessage = {
        id: `ai-${Date.now()}`,
        conversation_id: currentConvId,
        role: "assistant",
        content: response.content,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      addAIMessage(currentConvId, "assistant", response.content);
    } catch (err: any) {
      console.error("[AssistantPage] AI response error:", err);
      setErrorMessage(
        err.message || "LearnTrack AI is temporarily unavailable. Please try again."
      );
    } finally {
      setIsThinking(false);
    }
  };

  // Regenerate last AI response
  const handleRegenerate = async () => {
    if (messages.length === 0 || isThinking) return;

    // Find the last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;

    await handleSendMessage(lastUserMsg.content);
  };

  if (isLoadingPage) {
    return (
      <div className="h-[calc(100vh-5.5rem)] max-w-[1600px] mx-auto rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <AIAssistantLoadingSkeleton />
      </div>
    );
  }

  const isContextReady =
    context !== null &&
    ((context.academic.subjects && context.academic.subjects.length > 0) ||
      context.academic.cgpa !== null ||
      context.study.total_hours > 0 ||
      context.prediction !== null);

  return (
    <div className="h-[calc(100vh-5.5rem)] flex flex-col max-w-[1600px] mx-auto overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      {/* 1. Page Header (Requirement #3, #4, #5) */}
      <AIAssistantHeader
        isContextReady={isContextReady}
        isLeftSidebarOpen={showLeftSidebar}
        isRightContextOpen={showRightContext}
        onToggleLeftSidebar={() => setShowLeftSidebar((prev) => !prev)}
        onToggleRightContext={() => setShowRightContext((prev) => !prev)}
      />

      {/* 2. Workspace Body: 3-column split (Left: 280px, Center: flex-1, Right: 310px) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ============================================================== */}
        {/* LEFT COLUMN: CONVERSATIONS SIDEBAR                             */}
        {/* ============================================================== */}
        <AnimatePresence initial={false}>
          {showLeftSidebar && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden md:flex flex-col shrink-0 overflow-hidden z-10"
            >
              <AIConversationSidebar
                conversations={conversations}
                activeConversationId={activeConversationId}
                isLoading={isLoadingHistory}
                isCreating={isCreatingChat}
                onSelectConversation={(id) => setActiveConversationId(id)}
                onNewConversation={handleNewConversation}
                onRenameConversation={handleRenameConversation}
                onDeleteRequest={(conv) => setDeleteTarget(conv)}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile Slide-Over Drawer for Left Sidebar */}
        <AnimatePresence>
          {showLeftSidebar && (
            <div className="md:hidden fixed inset-0 z-40 flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowLeftSidebar(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative w-72 max-w-[85vw] h-full bg-white shadow-xl z-50 flex flex-col"
              >
                <AIConversationSidebar
                  conversations={conversations}
                  activeConversationId={activeConversationId}
                  isLoading={isLoadingHistory}
                  isCreating={isCreatingChat}
                  onSelectConversation={(id) => {
                    setActiveConversationId(id);
                    setShowLeftSidebar(false);
                  }}
                  onNewConversation={() => {
                    handleNewConversation();
                    setShowLeftSidebar(false);
                  }}
                  onRenameConversation={handleRenameConversation}
                  onDeleteRequest={(conv) => setDeleteTarget(conv)}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ============================================================== */}
        {/* CENTER COLUMN: AI CONVERSATION CANVAS & INPUT COMPOSER         */}
        {/* ============================================================== */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden min-w-0">
          {/* Main message stream & starter prompt cards */}
          <AIMessageStream
            messages={messages}
            isThinking={isThinking}
            errorMessage={errorMessage}
            context={context}
            onSendPrompt={(p) => handleSendMessage(p)}
            onRetry={() => handleSendMessage()}
            onRegenerate={handleRegenerate}
            messagesEndRef={messagesEndRef}
          />

          {/* Floating Input Composer */}
          <AIInputComposer
            inputMessage={inputMessage}
            isThinking={isThinking}
            onInputChange={(val) => setInputMessage(val)}
            onSendMessage={() => handleSendMessage()}
          />
        </main>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: LEARNTRACK CONTEXT PANEL                         */}
        {/* ============================================================== */}
        <AnimatePresence initial={false}>
          {showRightContext && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 310, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:flex flex-col shrink-0 overflow-hidden z-10"
            >
              <AIAcademicContextPanel
                context={context}
                activePlan={activePlan}
                goals={goals}
                isLoading={false}
                onRefreshContext={loadContextData}
              />
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile Slide-Over Drawer for Right Context */}
        <AnimatePresence>
          {showRightContext && (
            <div className="lg:hidden fixed inset-0 z-40 flex justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowRightContext(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative w-80 max-w-[88vw] h-full bg-white shadow-xl z-50 flex flex-col"
              >
                <AIAcademicContextPanel
                  context={context}
                  activePlan={activePlan}
                  goals={goals}
                  isLoading={false}
                  onRefreshContext={loadContextData}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Confirmation Modal (Requirement #10) */}
      <AIDeleteConversationModal
        isOpen={Boolean(deleteTarget)}
        conversationTitle={deleteTarget?.title}
        isDeleting={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
