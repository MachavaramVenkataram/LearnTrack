"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Layers,
  ListChecks,
  Plus,
  RefreshCw,
  Search,
  Bot,
  Play,
  Award,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getLearningMemory,
  upsertLearningMemoryItem,
} from "@/lib/student-os/service";
import { LearningMemoryItem, LearningMemoryStatus } from "@/types/student-os";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

export default function LearningMemoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const userId = user?.id || "demo-student";

  const [memoryItems, setMemoryItems] = useState<LearningMemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Add Item Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("Machine Learning");
  const [newTopic, setNewTopic] = useState("");
  const [newStatus, setNewStatus] = useState<LearningMemoryStatus>("needs_review");
  const [newMastery, setNewMastery] = useState(70);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getLearningMemory(userId);
      setMemoryItems(data);
    } catch {
      showToast("Error loading memory", "Using student local cache.", "info");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    setIsSubmitting(true);
    try {
      await upsertLearningMemoryItem(userId, {
        subject: newSubject,
        topic: newTopic.trim(),
        status: newStatus,
        mastery_score: Number(newMastery) || 50,
        evidence_count: 1,
      });

      showToast("Topic Logged", `"${newTopic}" recorded into Learning Memory.`, "success");
      setIsAddModalOpen(false);
      setNewTopic("");
      loadData();
    } catch {
      showToast("Error saving topic", "Could not persist memory entry.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group by Subject
  const subjects = React.useMemo(() => {
    const set = new Set<string>();
    memoryItems.forEach((m) => set.add(m.subject));
    return Array.from(set);
  }, [memoryItems]);

  const filteredItems = memoryItems.filter((m) => {
    if (selectedSubject !== "All" && m.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return m.topic.toLowerCase().includes(q) || m.subject.toLowerCase().includes(q);
    }
    return true;
  });

  // Partition items into the 4 pillars
  const masteredList = filteredItems.filter((m) => m.status === "mastered");
  const needsReviewList = filteredItems.filter((m) => m.status === "needs_review");
  const recentlyPracticedList = filteredItems.filter((m) => m.status === "recently_practiced");
  const recommendedNextList = filteredItems.filter((m) => m.status === "recommended_next");

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* 1. Header Banner */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-violet-50 border border-violet-100/70 text-[11px] font-semibold text-violet-700 mb-2">
              <BrainCircuit className="w-3.5 h-3.5 text-violet-600" />
              <span>Academic Context Engine</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Learning Memory
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              An academic context system that tracks topics mastered, weak concepts, and study trajectories. LearnTrack AI grounds all recommendations in this verifiable evidence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const weakTopics = needsReviewList.map((n) => n.topic).slice(0, 2).join(" and ");
                router.push(
                  `/assistant?prompt=${encodeURIComponent(
                    `Based on my Learning Memory, I need review in ${weakTopics || "my weak topics"}. Can you give me a 3-step revision plan with explanations?`
                  )}`
                );
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Consult AI Assistant</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Topic</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedSubject("All")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedSubject === "All"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              All Subjects
            </button>
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSubject === sub
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:text-slate-900"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts or topics..."
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* 3. Four Core Memory Pillars */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {/* Pillar 1: MASTERED (✓) */}
          <div className="bg-white rounded-2xl border border-emerald-100/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-50 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Mastered
                </h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {masteredList.length}
              </span>
            </div>

            {masteredList.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Not enough recorded data yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {masteredList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-emerald-100/80 bg-emerald-50/20 hover:bg-emerald-50/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <span className="text-[10px] font-semibold text-emerald-700 block">
                          ✓ {item.subject}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-0.5">{item.topic}</h4>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 bg-white px-1.5 py-0.5 rounded border border-emerald-100 shrink-0">
                        {item.mastery_score}%
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {item.evidence_count} verified quiz &amp; project proofs
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pillar 2: NEEDS REVIEW (• / ⚠) */}
          <div className="bg-white rounded-2xl border border-amber-100/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-50 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Needs Review
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                {needsReviewList.length}
              </span>
            </div>

            {needsReviewList.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                All reviewed concepts currently verified!
              </p>
            ) : (
              <div className="space-y-2.5">
                {needsReviewList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-amber-200/80 bg-amber-50/20 hover:bg-amber-50/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <span className="text-[10px] font-semibold text-amber-700 block">
                          • {item.subject}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-0.5">{item.topic}</h4>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-700 bg-white px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                        {item.mastery_score}%
                      </span>
                    </div>

                    <div className="pt-2 mt-2 border-t border-amber-100 flex items-center justify-between">
                      <button
                        onClick={() =>
                          router.push(
                            `/focus?subject=${encodeURIComponent(
                              item.subject
                            )}&task=${encodeURIComponent(`Review ${item.topic}`)}`
                          )
                        }
                        className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-blue-600" />
                        <span>Focus</span>
                      </button>

                      <button
                        onClick={() =>
                          router.push(
                            `/flashcards?topic=${encodeURIComponent(item.topic)}`
                          )
                        }
                        className="text-[11px] font-semibold text-violet-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Layers className="w-3 h-3" />
                        <span>Cards</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pillar 3: RECENTLY PRACTICED (•) */}
          <div className="bg-white rounded-2xl border border-blue-100/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-blue-50 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800">
                  Recently Practiced
                </h3>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                {recentlyPracticedList.length}
              </span>
            </div>

            {recentlyPracticedList.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Not enough recorded data yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentlyPracticedList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-blue-100/80 bg-blue-50/20 hover:bg-blue-50/40 transition-colors"
                  >
                    <span className="text-[10px] font-semibold text-blue-700 block">
                      • {item.subject}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-0.5">{item.topic}</h4>
                    <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-slate-500">
                      <span>Recent mock quiz</span>
                      <span className="font-semibold text-slate-700">{item.mastery_score}% accuracy</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pillar 4: RECOMMENDED NEXT (•) */}
          <div className="bg-white rounded-2xl border border-violet-100/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-violet-50 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-violet-800">
                  Recommended Next
                </h3>
              </div>
              <span className="text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full">
                {recommendedNextList.length}
              </span>
            </div>

            {recommendedNextList.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                All syllabus modules on schedule!
              </p>
            ) : (
              <div className="space-y-2.5">
                {recommendedNextList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-violet-200/80 bg-violet-50/20 hover:bg-violet-50/40 transition-colors"
                  >
                    <span className="text-[10px] font-semibold text-violet-700 block">
                      • {item.subject}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-0.5">{item.topic}</h4>

                    <div className="pt-2 mt-2 border-t border-violet-100 flex items-center justify-between">
                      <button
                        onClick={() =>
                          router.push(
                            `/practice?topic=${encodeURIComponent(item.topic)}`
                          )
                        }
                        className="text-[11px] font-semibold text-violet-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <ListChecks className="w-3 h-3" />
                        <span>Practice</span>
                      </button>

                      <button
                        onClick={() =>
                          router.push(
                            `/notebook?topic=${encodeURIComponent(item.topic)}`
                          )
                        }
                        className="text-[11px] font-semibold text-slate-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Notebook</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Add Topic Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log Concept in Learning Memory"
      >
        <form onSubmit={handleAddItem} className="space-y-4 pt-2">
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
              Topic / Concept *
            </label>
            <input
              type="text"
              required
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="e.g. Cross Validation & Grid Search"
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Status Pillar
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as LearningMemoryStatus)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-white focus:outline-none"
              >
                <option value="needs_review">Needs Review</option>
                <option value="mastered">Mastered</option>
                <option value="recently_practiced">Recently Practiced</option>
                <option value="recommended_next">Recommended Next</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Mastery Score (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={newMastery}
                onChange={(e) => setNewMastery(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none"
              />
            </div>
          </div>

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
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              {isSubmitting ? "Logging..." : "Save to Memory"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
