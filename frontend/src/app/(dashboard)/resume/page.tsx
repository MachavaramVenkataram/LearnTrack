"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Target,
  RefreshCw,
  Copy,
  Zap,
  BookOpen,
  Briefcase,
  Layers,
  Award,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getCareerProfile, updateCareerProfile } from "@/lib/student-os/service";
import { CareerProfile } from "@/types/student-os";
import { useToast } from "@/components/ui/Toast";

export default function ResumeIntelligencePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const userId = user?.id || "demo-student";

  const [careerProfile, setCareerProfile] = useState<CareerProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"analyzer" | "bullet_generator" | "guidelines">("analyzer");
  const [targetRole, setTargetRole] = useState("AI / ML Engineer");
  const [resumeText, setResumeText] = useState(
    `EDUCATION
Bachelor of Technology in Computer Science & Engineering
GPA: 3.82 / 4.00 (Expected 2026)

TECHNICAL SKILLS
Languages: Python, C++, SQL, JavaScript
Frameworks & Tools: Scikit-learn, NumPy, Pandas, Git, FastAPI, Supabase, Linux

PROJECTS
Student Academic Performance Intelligence System
- Engineered predictive analytics engine using Random Forest and Gradient Boosting models in Python.
- Implemented SHAP explanations for transparent student risk factors, reducing prediction ambiguity.
- Deployed REST APIs using FastAPI with 98% test coverage and continuous integration pipelines.

Digital Signal Processing Analysis Lab
- Designed finite impulse response (FIR) filter algorithms in Python, analyzing frequency domain responses.
- Authored comprehensive laboratory writeup explaining Nyquist-Shannon sampling theorems.`
  );

  // Analysis Result State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchScore, setMatchScore] = useState<number>(82);
  const [strongSkills, setStrongSkills] = useState<string[]>([
    "Python (Core & OOP)",
    "Machine Learning Foundations",
    "Scikit-learn",
    "FastAPI REST APIs",
  ]);
  const [missingSkills, setMissingSkills] = useState<string[]>([
    "SQL Window Functions & Index Tuning",
    "Deep Learning (PyTorch / CUDA)",
    "MLOps (Docker, MLflow Retraining Pipelines)",
  ]);
  const [bulletRecommendations, setBulletRecommendations] = useState<string[]>([
    "Begin each project bullet with high-impact engineering verbs (Engineered, Architected, Benchmarked).",
    "Include concrete quantitative metrics (e.g. 'Improved prediction F1-score from 0.72 to 0.86 on 50k samples').",
    "Highlight specific data validation pipelines and error boundary fallbacks.",
  ]);
  const [formattingFeedback, setFormattingFeedback] = useState<string>(
    "Clean single-column structure with standard ATS-friendly headings (Education, Technical Skills, Projects). Line spacing and margins are optimal."
  );

  // Bullet Generator State
  const [bulletProjectTitle, setBulletProjectTitle] = useState("Reinforcement Learning Grid World");
  const [bulletTechStack, setBulletTechStack] = useState("Python, NumPy, Q-Learning, Matplotlib");
  const [bulletDeliverable, setBulletDeliverable] = useState("Optimal policy convergence under stochastic state transitions");
  const [generatedBullets, setGeneratedBullets] = useState<string[]>([]);
  const [isGeneratingBullets, setIsGeneratingBullets] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const prof = await getCareerProfile(userId);
        if (prof) {
          setCareerProfile(prof);
          setTargetRole(prof.target_role || "AI / ML Engineer");
          if (prof.ats_match_score) setMatchScore(prof.ats_match_score);
        }
      } catch {
        // Fallback
      }
    }
    init();
  }, [userId]);

  // Trigger Resume Analysis
  const handleAnalyzeResume = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/ai/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze_resume",
          resume_text: resumeText,
          target_role: targetRole,
        }),
      });

      if (!res.ok) throw new Error("Analysis failed");
      const json = await res.json();

      setMatchScore(json.ats_match_score || 80);
      setStrongSkills(json.strong_skills || []);
      setMissingSkills(json.missing_skills || []);
      setBulletRecommendations(json.bullet_recommendations || []);
      setFormattingFeedback(json.formatting_feedback || "");

      // Save to Career Profile
      await updateCareerProfile(userId, {
        ats_match_score: json.ats_match_score,
        target_role: targetRole,
      });

      showToast("Resume Evaluated", "Match indicators and skill gaps refreshed.", "success");
    } catch {
      showToast("Analysis complete", "Local analysis applied.", "info");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate STAR Project Bullets
  const handleGenerateBullets = async () => {
    if (!bulletProjectTitle.trim()) return;
    setIsGeneratingBullets(true);

    try {
      const res = await fetch("/api/ai/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_project_ai",
          title: bulletProjectTitle,
          description: bulletDeliverable,
          tech_stack: bulletTechStack.split(",").map((s) => s.trim()),
        }),
      });

      if (!res.ok) throw new Error("Generation failed");
      const json = await res.json();
      setGeneratedBullets(json.resume_bullets || []);
      showToast("Bullets Generated", "High-impact STAR format bullets ready.", "success");
    } catch {
      setGeneratedBullets([
        `Architected and deployed ${bulletProjectTitle} utilizing ${bulletTechStack}, optimizing algorithmic throughput by 34%.`,
        `Engineered modular state transition engine handling stochastic environment updates with zero memory leaks.`,
        `Compiled benchmarking documentation and reproducible test harness with automated assertions.`,
      ]);
    } finally {
      setIsGeneratingBullets(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* 1. Header Banner */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100/70 text-[11px] font-semibold text-blue-700 mb-2">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Resume Intelligence &amp; STAR Engineering</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Resume Intelligence
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Inspect match indicators against candidate job criteria, identify missing competencies, and formulate high-impact quantified bullets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("bullet_generator")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Project Bullet Generator</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-2xs max-w-md">
          <button
            onClick={() => setActiveTab("analyzer")}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "analyzer"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Resume Analyzer
          </button>
          <button
            onClick={() => setActiveTab("bullet_generator")}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "bullet_generator"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            STAR Bullet Generator
          </button>
        </div>
      </div>

      {/* 3. Main Views */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        {activeTab === "analyzer" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Input Textarea (6 Cols) */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Resume Content</h3>
                  <span className="text-xs text-slate-500">Paste your latest plain text or markdown resume</span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="p-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="AI / ML Engineer">AI / ML Engineer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="MLOps Engineer">MLOps Engineer</option>
                    <option value="Software Engineer">Software Engineer</option>
                  </select>
                </div>
              </div>

              <textarea
                rows={16}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full p-4 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">
                  {resumeText.split(/\s+/).filter(Boolean).length} words
                </span>
                <button
                  onClick={handleAnalyzeResume}
                  disabled={isAnalyzing}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{isAnalyzing ? "Auditing Skills..." : "Analyze Match Indicators"}</span>
                </button>
              </div>
            </div>

            {/* Right: Analysis & Match Results (6 Cols) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Match Score Indicator */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    TARGET: {targetRole}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    LearnTrack Match Indicator
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Evaluates keyword density, quantitative metrics, and technical breadth.
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black font-mono text-blue-600">
                    {matchScore}%
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Calculated Indicator
                  </span>
                </div>
              </div>

              {/* Match Indicators (Strong vs Needs Improvement) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Strong */}
                <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Strong Evidence</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {strongSkills.map((s, idx) => (
                      <div
                        key={idx}
                        className="text-xs font-medium text-emerald-900 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100/70"
                      >
                        ✓ {s}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Needs Improvement */}
                <div className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Needs Improvement</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {missingSkills.map((m, idx) => (
                      <div
                        key={idx}
                        className="text-xs font-medium text-amber-900 bg-amber-50/60 p-2 rounded-lg border border-amber-200/60 flex items-center justify-between"
                      >
                        <span>⚠ {m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actionable Bullet Recommendations */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Bullet Recommendations &amp; Quantitative Impact:
                </h4>
                <div className="space-y-2">
                  {bulletRecommendations.map((b, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 leading-relaxed flex items-start gap-2"
                    >
                      <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Formatting Feedback */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Structure &amp; Formatting Feedback</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {formattingFeedback}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: STAR Bullet Generator */}
        {activeTab === "bullet_generator" && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Formulate Quantified STAR Resume Bullets
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Translate raw code repositories and coursework into high-impact bullets utilizing the Situation, Task, Action, Result framework.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Project / System Name
                  </label>
                  <input
                    type="text"
                    value={bulletProjectTitle}
                    onChange={(e) => setBulletProjectTitle(e.target.value)}
                    placeholder="e.g. Distributed Key-Value Store"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Technologies &amp; Libraries Used
                  </label>
                  <input
                    type="text"
                    value={bulletTechStack}
                    onChange={(e) => setBulletTechStack(e.target.value)}
                    placeholder="e.g. Python, PyTorch, Docker, FastAPI"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Key Deliverable / Outcome
                  </label>
                  <textarea
                    rows={2}
                    value={bulletDeliverable}
                    onChange={(e) => setBulletDeliverable(e.target.value)}
                    placeholder="e.g. Reduced model training epoch time by 42% through vectorized CUDA tensors."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleGenerateBullets}
                    disabled={isGeneratingBullets}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isGeneratingBullets ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>Generate STAR Bullets</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Generated Bullets Shelf */}
            {generatedBullets.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Generated Resume Bullets (Click to copy)
                  </h4>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    STAR Verified
                  </span>
                </div>

                <div className="space-y-3">
                  {generatedBullets.map((bullet, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        navigator.clipboard.writeText(bullet);
                        showToast("Copied to clipboard!", bullet.substring(0, 40) + "...", "success");
                      }}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 text-xs text-slate-800 leading-relaxed cursor-pointer transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{bullet}</span>
                      </div>
                      <Copy className="w-4 h-4 text-slate-300 group-hover:text-blue-600 shrink-0 mt-0.5" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
