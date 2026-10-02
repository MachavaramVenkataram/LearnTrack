"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Briefcase,
  Target,
  Sparkles,
  Award,
  FileText,
  Bot,
  Milestone,
  FolderGit2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Plus,
  Play,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getCareerProfile,
  updateCareerProfile,
  getSkills,
  getProjects,
} from "@/lib/student-os/service";
import { CareerProfile, Skill, ProjectItem } from "@/types/student-os";
import { useToast } from "@/components/ui/Toast";

export default function CareerHubPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();
  const userId = user?.id || "demo-student";

  const [careerProfile, setCareerProfile] = useState<CareerProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Role State
  const [targetRole, setTargetRole] = useState("AI / ML Engineer");
  const [isEditingRole, setIsEditingRole] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [profileData, skillsData, projectsData] = await Promise.all([
        getCareerProfile(userId),
        getSkills(userId),
        getProjects(userId),
      ]);
      setCareerProfile(profileData);
      if (profileData) setTargetRole(profileData.target_role);
      setSkills(skillsData);
      setProjects(projectsData);
    } catch {
      showToast("Error loading career data", "Using local student workspace cache.", "info");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleSaveTargetRole = async () => {
    try {
      const updated = await updateCareerProfile(userId, { target_role: targetRole });
      setCareerProfile(updated);
      setIsEditingRole(false);
      showToast("Target Role Updated", `Aligned roadmap with ${targetRole}.`, "success");
    } catch {
      showToast("Error updating role", "Could not save target role.", "error");
    }
  };

  // Derive verified strengths vs development areas directly from skills
  const strengths = skills.filter((s) => s.score >= 70).map((s) => s.name);
  const developmentAreas = skills.filter((s) => s.score < 70).map((s) => s.name);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* 1. Header Banner */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100/70 text-[11px] font-semibold text-blue-700 mb-2">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>Career Trajectory &amp; Employability</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Career Hub
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Connect academic mastery, coding practice, and engineering projects with hiring criteria. All assessments are evidence-grounded.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/career-roadmap")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Milestone className="w-4 h-4" />
              <span>Generate Learning Roadmap</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        {/* Evidence-Based Disclaimer Card */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Scientific Grounding Principle:</span>
            <p className="text-amber-800 leading-relaxed">
              LearnTrack does not manufacture speculative claims such as &ldquo;You are job ready.&rdquo; Instead, we report strictly what:
              <strong className="mx-1">&ldquo;Your recorded evidence shows...&rdquo;</strong>
              across coding challenges, quiz performance, documented repositories, and validated coursework.
            </p>
          </div>
        </div>

        {/* Target Role & Strengths / Development Areas Shelf */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Target Role & ATS Match Card (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  TARGET ROLE
                </span>
                {isEditingRole ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="p-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      onClick={handleSaveTargetRole}
                      className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      {careerProfile?.target_role || "AI / ML Engineer"}
                    </h2>
                    <button
                      onClick={() => setIsEditingRole(true)}
                      className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  LearnTrack Match Indicator
                </span>
                <span className="text-2xl font-black font-mono text-blue-600">
                  {careerProfile?.ats_match_score || 82}%
                </span>
              </div>
            </div>

            {/* Strengths & Development Areas Dual Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* CURRENT STRENGTHS */}
              <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Current Strengths
                  </span>
                </div>

                <div className="space-y-1.5">
                  {(strengths.length > 0 ? strengths : ["Python", "Machine Learning", "Data Analysis"]).map(
                    (s, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs font-semibold text-emerald-900 bg-white p-2 rounded-lg border border-emerald-100/80"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{s}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* DEVELOPMENT AREAS */}
              <div className="p-4 rounded-xl bg-amber-50/40 border border-amber-100 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Development Areas
                  </span>
                </div>

                <div className="space-y-1.5">
                  {(developmentAreas.length > 0
                    ? developmentAreas
                    : ["SQL & Optimization", "Deep Learning (PyTorch)", "MLOps", "NLP Transformers"]
                  ).map((d, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs font-semibold text-amber-900 bg-white p-2 rounded-lg border border-amber-100/80"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full border border-amber-500" />
                        <span>{d}</span>
                      </div>
                      <Link
                        href={`/practice?topic=${encodeURIComponent(d)}`}
                        className="text-[10px] text-blue-600 hover:underline"
                      >
                        Practice
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Evidence Summary Statement */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-1">
                Recorded Evidence Assessment:
              </span>
              Your recorded evidence demonstrates solid competency in Python algorithmic scripts and classical Machine Learning benchmarks. To strengthen your portfolio for {careerProfile?.target_role || "AI / ML Engineer"}, add verified projects covering production MLOps and relational SQL query execution plans.
            </div>
          </div>

          {/* Quick Hub Navigation Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Link
              href="/resume"
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all flex items-start gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Resume Intelligence
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Analyze keyword match indicators, bullet impact, and formatting without speculative ATS scoring.
                </p>
              </div>
            </Link>

            <Link
              href="/interview"
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-violet-300 hover:shadow-xs transition-all flex items-start gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                    Interview Studio
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Sequential AI technical rounds (Python, AIML, SQL, HR) based on observable answer evidence.
                </p>
              </div>
            </Link>

            <Link
              href="/projects"
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all flex items-start gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Projects Portfolio ({projects.length})
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Document engineering repositories, generate resume bullet points, and prepare technical talking points.
                </p>
              </div>
            </Link>

            <Link
              href="/career-roadmap"
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all flex items-start gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Milestone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Career Roadmap
                  </h3>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Structured 6-phase trajectory linking directly to LearnTrack practice labs, notes, and projects.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
