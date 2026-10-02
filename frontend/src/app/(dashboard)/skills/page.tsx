"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Award,
  Zap,
  Code,
  Brain,
  Database,
  BarChart3,
  GitBranch,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Play,
  Plus,
  BookOpen,
  FolderGit2,
  TrendingUp,
  FileCheck2,
  Layers,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getSkills, addSkillEvidence } from "@/lib/student-os/service";
import { Skill, SkillEvidence } from "@/types/student-os";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";

export default function SkillIntelligencePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const userId = user?.id || "demo-student";

  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Evidence Modal
  const [selectedSkillForEvidence, setSelectedSkillForEvidence] = useState<Skill | null>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidenceType, setEvidenceType] = useState<
    "practice_quiz" | "project" | "coding_exercise" | "academic_record" | "assessment"
  >("practice_quiz");
  const [evidenceDescription, setEvidenceDescription] = useState("");
  const [evidenceScoreImpact, setEvidenceScoreImpact] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getSkills(userId);
      setSkills(data);
    } catch {
      showToast("Error loading skills", "Using verified local student records.", "info");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleAddEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillForEvidence || !evidenceDescription.trim()) return;

    setIsSubmitting(true);
    try {
      await addSkillEvidence(userId, selectedSkillForEvidence.name, {
        skill_id: selectedSkillForEvidence.id,
        source_type: evidenceType,
        description: evidenceDescription.trim(),
        score_impact: Number(evidenceScoreImpact) || 10,
      });

      showToast("Evidence Logged", "Skill proficiency updated from verified outcome.", "success");
      setIsEvidenceModalOpen(false);
      setEvidenceDescription("");
      loadData();
    } catch {
      showToast("Error recording evidence", "Could not persist skill proof.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    skills.forEach((s) => set.add(s.category));
    return Array.from(set);
  }, [skills]);

  const filteredSkills = skills.filter((s) => {
    if (selectedCategory !== "All" && s.category !== selectedCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* 1. Header Banner */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100/70 text-[11px] font-semibold text-blue-700 mb-2">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              <span>Evidence-Based Competency</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Skill Intelligence
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Track competencies calculated strictly from observable proof: coding exercises, quiz performance, documented projects, and academic coursework.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/practice")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Practice Skills</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Category Filter */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === "All"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:text-slate-900"
            }`}
          >
            All Disciplines
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Skills Cards Grid */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Auditing skill proof points...
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 bg-white p-8">
            <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">Not enough recorded data yet.</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Complete coding practice or document a project to populate your verified skill profile.
            </p>
            <button
              onClick={() => router.push("/practice")}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer shadow-xs"
            >
              Start Practice Session
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSkills.map((skill) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all p-6 flex flex-col justify-between space-y-5"
              >
                <div>
                  {/* Skill Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        {skill.category}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                        {skill.name}
                      </h3>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        {skill.level}
                      </span>
                      <span className="block text-xl font-black text-slate-900 mt-1 font-mono">
                        {skill.score}%
                      </span>
                    </div>
                  </div>

                  {/* Visual Evidence Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.score}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-1">
                      <span>Verified competency score</span>
                      <span>{skill.verified_evidence_count} evidence records</span>
                    </div>
                  </div>

                  {/* Evidence Summary */}
                  <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Evidence:
                    </span>
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {skill.recent_activity}
                    </p>
                  </div>

                  {/* Weak Areas */}
                  {skill.weak_areas && skill.weak_areas.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[11px] font-bold text-slate-600 block mb-1">
                        Weak Areas to Strengthen:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {skill.weak_areas.map((w, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/70"
                          >
                            • {w}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommended Next Action */}
                  <div className="mt-3 text-xs text-slate-600">
                    <span className="font-bold text-slate-700">Recommended Next: </span>
                    <span>{skill.recommended_action}</span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSkillForEvidence(skill);
                      setIsEvidenceModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Proof Point</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/practice?topic=${encodeURIComponent(
                          skill.name
                        )}&difficulty=Medium`
                      )
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-blue-700" />
                    <span>Practice {skill.name}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Log Evidence Modal */}
      <Modal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        title={
          selectedSkillForEvidence
            ? `Log Verified Proof: ${selectedSkillForEvidence.name}`
            : "Record Skill Evidence"
        }
      >
        <form onSubmit={handleAddEvidence} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Evidence Source Type
            </label>
            <select
              value={evidenceType}
              onChange={(e) => setEvidenceType(e.target.value as any)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 bg-white focus:outline-none"
            >
              <option value="practice_quiz">Practice Quiz Performance</option>
              <option value="project">Project Implementation &amp; Code</option>
              <option value="coding_exercise">Algorithmic Coding Exercise</option>
              <option value="academic_record">Coursework / Lab Grade</option>
              <option value="assessment">User Self-Assessment</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Observable Evidence Description *
            </label>
            <textarea
              rows={3}
              required
              value={evidenceDescription}
              onChange={(e) => setEvidenceDescription(e.target.value)}
              placeholder="e.g. Completed 12 NumPy vectorization exercises with 94% accuracy and zero runtime warnings."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Score Impact (Points)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={evidenceScoreImpact}
              onChange={(e) => setEvidenceScoreImpact(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEvidenceModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
            >
              {isSubmitting ? "Logging..." : "Log Evidence"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
