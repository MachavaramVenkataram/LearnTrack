"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Milestone,
  CheckCircle2,
  Clock,
  ArrowRight,
  Code,
  Brain,
  Database,
  Layers,
  Award,
  Bot,
  Sparkles,
  ExternalLink,
  Play,
  BookOpen,
  FolderGit2,
  FileCheck2,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getCareerProfile, getSkills } from "@/lib/student-os/service";
import { CareerProfile, Skill } from "@/types/student-os";
import { useToast } from "@/components/ui/Toast";

interface RoadmapPhase {
  phase_number: number;
  title: string;
  focus: string;
  status: "completed" | "in_progress" | "upcoming";
  description: string;
  skills: string[];
  actions: { label: string; href: string; primary?: boolean }[];
}

export default function CareerRoadmapPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const userId = user?.id || "demo-student";

  const [careerProfile, setCareerProfile] = useState<CareerProfile | null>(null);
  const [targetRole, setTargetRole] = useState("AI / ML Engineer");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const prof = await getCareerProfile(userId);
        if (prof) {
          setCareerProfile(prof);
          setTargetRole(prof.target_role || "AI / ML Engineer");
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [userId]);

  const phases: RoadmapPhase[] = [
    {
      phase_number: 1,
      title: "PHASE 1",
      focus: "Python + SQL Foundations",
      status: "completed",
      description: "Master vectorization in NumPy, data wrangling with Pandas, and complex SQL joins, indexing, and window functions.",
      skills: ["Python (OOP & Vectorization)", "SQL & Query Plans", "Data Structures"],
      actions: [
        { label: "Practice Python", href: "/practice?topic=Python", primary: true },
        { label: "Practice SQL", href: "/practice?topic=SQL" },
        { label: "Review Notes", href: "/notebook" },
      ],
    },
    {
      phase_number: 2,
      title: "PHASE 2",
      focus: "Statistics + Machine Learning",
      status: "in_progress",
      description: "Supervised and unsupervised models, loss gradient formulations, regularization (Ridge/Lasso), and statistical validation.",
      skills: ["Linear & Logistic Regression", "Decision Trees & Ensembles", "Cross-Validation"],
      actions: [
        { label: "Review ML", href: "/notebook?topic=Machine%20Learning", primary: true },
        { label: "Practice ML Quiz", href: "/practice?topic=Machine%20Learning" },
        { label: "Flashcards", href: "/flashcards" },
      ],
    },
    {
      phase_number: 3,
      title: "PHASE 3",
      focus: "Deep Learning & Neural Architectures",
      status: "upcoming",
      description: "Multilayer perceptrons, convolutional networks, recurrent models, attention mechanisms, and backpropagation in PyTorch.",
      skills: ["PyTorch Tensor Ops", "Backpropagation Calculus", "CNNs & Transformers"],
      actions: [
        { label: "Start Focus: Deep Learning", href: "/focus?subject=Deep%20Learning&task=PyTorch%20Foundations", primary: true },
        { label: "Practice Deep Learning", href: "/practice?topic=Deep%20Learning" },
      ],
    },
    {
      phase_number: 4,
      title: "PHASE 4",
      focus: "MLOps & Production Engineering",
      status: "upcoming",
      description: "Docker containerization, model monitoring, MLflow experiment tracking, automated retraining loops, and REST APIs.",
      skills: ["FastAPI Deployment", "Docker & CI/CD", "ML Monitoring & Drifts"],
      actions: [
        { label: "ML Monitoring", href: "/ml-monitoring", primary: true },
        { label: "Inspect Data Quality", href: "/data-quality" },
        { label: "Experiments", href: "/experiments" },
      ],
    },
    {
      phase_number: 5,
      title: "PHASE 5",
      focus: "Portfolio Projects & Engineering Rigor",
      status: "upcoming",
      description: "Architect end-to-end applications solving authentic problems, with comprehensive documentation and unit test suites.",
      skills: ["System Architecture", "Benchmarking", "STAR Resume Bullets"],
      actions: [
        { label: "Build Project", href: "/projects", primary: true },
        { label: "STAR Bullets", href: "/resume" },
      ],
    },
    {
      phase_number: 6,
      title: "PHASE 6",
      focus: "Interview Studio & Technical Preparation",
      status: "upcoming",
      description: "Sequential technical rounds, observable answer critiques, and algorithmic whiteboard walkthroughs.",
      skills: ["Algorithmic Communication", "System Design Defense", "Terminology Precision"],
      actions: [
        { label: "Complete Interview", href: "/interview", primary: true },
        { label: "Evaluate Resume Match", href: "/resume" },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* 1. Header Banner */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100/70 text-[11px] font-semibold text-emerald-700 mb-2">
              <Milestone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Evidence-Connected Curriculum</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Career Roadmap
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              A structured 6-phase engineering trajectory designed specifically for{" "}
              <strong className="text-slate-900">{targetRole}</strong>. Every milestone links directly to LearnTrack practice labs, notes, and study sessions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/career")}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Career Hub Overview
            </button>
          </div>
        </div>
      </div>

      {/* 2. Target Role Overview Badge */}
      <div className="max-w-5xl mx-auto px-6 pt-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              CURRENT TARGET TRACK
            </span>
            <h2 className="text-xl font-bold text-slate-900">{targetRole}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Phase progression reflects verified achievements, project implementations, and quiz assessments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              Phase 1 Completed
            </span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
              Phase 2 In Progress
            </span>
          </div>
        </div>
      </div>

      {/* 3. Sequential 6-Phase Roadmap Timeline */}
      <div className="max-w-5xl mx-auto px-6 pt-8 space-y-6">
        {phases.map((p, idx) => {
          const isCompleted = p.status === "completed";
          const isInProgress = p.status === "in_progress";

          return (
            <motion.div
              key={p.phase_number}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-2xl border p-6 transition-all ${
                isCompleted
                  ? "bg-white border-emerald-200/90 shadow-2xs"
                  : isInProgress
                  ? "bg-white border-blue-300 ring-2 ring-blue-500/10 shadow-xs"
                  : "bg-white border-slate-200/80 shadow-2xs opacity-90"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-md border ${
                        isCompleted
                          ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                          : isInProgress
                          ? "bg-blue-50 text-blue-800 border-blue-100"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {p.title}
                    </span>

                    <span
                      className={`text-xs font-bold ${
                        isCompleted
                          ? "text-emerald-600"
                          : isInProgress
                          ? "text-blue-600"
                          : "text-slate-400"
                      }`}
                    >
                      {isCompleted ? "✓ Verified Complete" : isInProgress ? "● Active Focus" : "○ Upcoming Milestone"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {p.focus}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                    {p.description}
                  </p>

                  {/* Skills Tag Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {p.skills.map((s, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Direct Action Links to LearnTrack Resources */}
                <div className="shrink-0 flex flex-wrap md:flex-col items-stretch gap-2 pt-2 md:pt-0 min-w-[170px]">
                  {p.actions.map((act, i) => (
                    <Link
                      key={i}
                      href={act.href}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        act.primary
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      <span>[ {act.label} ]</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
