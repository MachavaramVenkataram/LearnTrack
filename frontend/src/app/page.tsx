"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Zap,
  ShieldCheck,
  CheckCircle2,
  BarChart3,
  Sliders,
  GraduationCap,
  Lightbulb,
  RotateCcw,
  Database,
  Cpu,
  Binary,
  Compass,
  Lock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

// ==============================================================================
// Illustrative Datasets for Interactive Landing Demos (Explicitly Non-Personal)
// ==============================================================================

const DEMO_TRAJECTORY_DATA = [
  { period: "Month 1", score: 72.5, target: 80, lower: 69, upper: 76 },
  { period: "Month 2", score: 76.0, target: 80, lower: 73, upper: 79 },
  { period: "Month 3", score: 79.4, target: 80, lower: 77, upper: 82 },
  { period: "Month 4", score: 82.8, target: 80, lower: 80, upper: 85 },
  { period: "Projected", score: 85.6, target: 80, lower: 82, upper: 88 },
];

const ANALYTICS_TIMEFRAME_DATA: Record<
  "7d" | "30d" | "sem",
  Array<{ name: string; attendance: number; consistency: number; studyHours: number }>
> = {
  "7d": [
    { name: "Mon", attendance: 100, consistency: 85, studyHours: 3.5 },
    { name: "Tue", attendance: 100, consistency: 90, studyHours: 4.0 },
    { name: "Wed", attendance: 75, consistency: 78, studyHours: 2.5 },
    { name: "Thu", attendance: 100, consistency: 92, studyHours: 4.5 },
    { name: "Fri", attendance: 100, consistency: 88, studyHours: 3.0 },
    { name: "Sat", attendance: 0, consistency: 95, studyHours: 5.0 },
    { name: "Sun", attendance: 0, consistency: 82, studyHours: 3.0 },
  ],
  "30d": [
    { name: "Wk 1", attendance: 92, consistency: 82, studyHours: 18 },
    { name: "Wk 2", attendance: 88, consistency: 86, studyHours: 22 },
    { name: "Wk 3", attendance: 95, consistency: 90, studyHours: 24 },
    { name: "Wk 4", attendance: 91, consistency: 88, studyHours: 21 },
  ],
  sem: [
    { name: "Sep", attendance: 94, consistency: 80, studyHours: 72 },
    { name: "Oct", attendance: 91, consistency: 85, studyHours: 84 },
    { name: "Nov", attendance: 89, consistency: 89, studyHours: 92 },
    { name: "Dec", attendance: 93, consistency: 92, studyHours: 98 },
  ],
};

const SUBJECT_MASTERY_DEMO = [
  { subject: "Data Structures", score: 88, code: "CS201", color: "bg-blue-600" },
  { subject: "Algorithms", score: 83, code: "CS202", color: "bg-indigo-600" },
  { subject: "Database Systems", score: 86, code: "CS203", color: "bg-violet-600" },
  { subject: "Computer Networks", score: 79, code: "CS204", color: "bg-emerald-600" },
];

const SHAP_FACTORS_DEMO = [
  { name: "Study Consistency Frequency", impact: "+0.18", positive: true, percentage: 88 },
  { name: "Midterm Examination Marks", impact: "+0.14", positive: true, percentage: 76 },
  { name: "Lecture Attendance Rate", impact: "+0.09", positive: true, percentage: 58 },
  { name: "Historical Term Baseline", impact: "+0.03", positive: true, percentage: 24 },
  { name: "Assignment Completion Lag", impact: "-0.04", positive: false, percentage: 32 },
];

export default function LandingPage() {
  // Hero Interactive Tabs: "overview" | "performance" | "prediction"
  const [heroTab, setHeroTab] = useState<"overview" | "performance" | "prediction">("overview");

  // Feature Section Interactive Tour: 0 (Prediction), 1 (Analytics), 2 (Explainability), 3 (Simulation)
  const [activeFeature, setActiveFeature] = useState<number>(0);

  // Analytics Section Timeframe: "7d" | "30d" | "sem"
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<"7d" | "30d" | "sem">("30d");

  // What-If Simulator Demo Sliders (Client-side interactive scenario preview)
  const [studyHours, setStudyHours] = useState<number>(16);
  const [targetAttendance, setTargetAttendance] = useState<number>(90);
  const [assignmentRate, setAssignmentRate] = useState<number>(95);

  // Client Simulation Formula for demo preview
  const baselineScore = 76.4;
  const simulatedScore = Math.min(
    98.5,
    Math.max(
      60.0,
      Number(
        (
          70.0 +
          (studyHours - 10) * 0.42 +
          (targetAttendance - 75) * 0.22 +
          (assignmentRate - 80) * 0.18
        ).toFixed(1)
      )
    )
  );
  const scoreDelta = Number((simulatedScore - baselineScore).toFixed(1));

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden">
      {/* 1. Global Sticky Navbar */}
      <Navbar />

      {/* ==================================================================== */}
      {/* 2. HERO SECTION — Interactive Product Showcase                       */}
      {/* ==================================================================== */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden bg-[#F8FAFC]">
        {/* Subtle technical background grid & ambient radial glow */}
        <div
          className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-0"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-semibold text-blue-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>AI-POWERED ACADEMIC INTELLIGENCE</span>
            </div>

            {/* Large Statement Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight text-slate-900 leading-[1.04]">
              Understand your performance.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Track your growth.
              </span>
            </h1>

            {/* Supporting Value Proposition */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              LearnTrack turns your coursework, attendance, and study activity into actionable
              insights, predictive intelligence, and personalized improvement plans.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link href="/signup">
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full sm:w-auto text-sm font-semibold rounded-xl shadow-glow-blue hover:shadow-lg active:scale-[0.98] transition-all group"
                  rightIcon={<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
                >
                  Get Started
                </Button>
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-sm font-semibold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl shadow-soft-sm"
                >
                  Explore LearnTrack
                </Button>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Multi-Variable Machine Learning</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Explainable SHAP Attribution</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>PostgreSQL Row Level Security</span>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* Interactive Hero Product Showcase (Browser Frame)                */}
          {/* ================================================================ */}
          <div id="product" className="mt-14 max-w-5xl mx-auto scroll-mt-24">
            <div className="rounded-3xl p-2 sm:p-3 bg-gradient-to-b from-slate-200/90 via-slate-100 to-slate-200/50 shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-slate-200">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-6 overflow-hidden">
                
                {/* Browser Top Bar & Interactive Tab Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-6">
                  {/* Left: Window Dots & URL */}
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-slate-300" />
                    <span className="w-3 h-3 rounded-full bg-slate-300" />
                    <span className="w-3 h-3 rounded-full bg-slate-300" />
                    <span className="text-xs font-mono text-slate-400 ml-2">
                      learntrack.app/workspace
                    </span>
                  </div>

                  {/* Center: Interactive Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      onClick={() => setHeroTab("overview")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        heroTab === "overview"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setHeroTab("performance")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        heroTab === "performance"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Performance Chart
                    </button>
                    <button
                      onClick={() => setHeroTab("prediction")}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        heroTab === "prediction"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      ML Prediction
                    </button>
                  </div>

                  {/* Right: Badge */}
                  <div className="hidden sm:block">
                    <Badge variant="default" size="sm" className="bg-slate-100 text-slate-600 border-slate-200">
                      ILLUSTRATIVE PRODUCT PREVIEW
                    </Badge>
                  </div>
                </div>

                {/* Tab Content 1: Overview */}
                {heroTab === "overview" && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all hover:-translate-y-0.5">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Predicted Score
                        </span>
                        <p className="text-2xl font-bold text-slate-900 font-sans mt-0.5">84.6%</p>
                        <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                          <span>↑</span> +8.2% projected lift
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all hover:-translate-y-0.5">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Projected CGPA
                        </span>
                        <p className="text-2xl font-bold text-slate-900 font-sans mt-0.5">8.42</p>
                        <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5 mt-0.5">
                          <span>↑</span> +0.35 standing gain
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all hover:-translate-y-0.5">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Attendance
                        </span>
                        <p className="text-2xl font-bold text-slate-900 font-sans mt-0.5">91.5%</p>
                        <span className="text-[10px] font-semibold text-blue-600 mt-0.5 block">
                          Compliant (≥75% req.)
                        </span>
                      </div>
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all hover:-translate-y-0.5">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Risk Classification
                        </span>
                        <p className="text-2xl font-bold text-emerald-600 font-sans mt-0.5">Low Risk</p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">94.2% Confidence</span>
                      </div>
                    </div>

                    {/* Trajectory Bar & AI Diagnostic Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      <div className="md:col-span-7 p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-semibold text-slate-800">
                              Study Consistency Velocity
                            </span>
                            <span className="text-emerald-600 font-semibold">+14% vs last month</span>
                          </div>
                          <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full w-[88%]" />
                          </div>
                          <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                            Consistent 3.5 hrs/day study blocks have significantly stabilized grade variance across core engineering modules.
                          </p>
                        </div>
                        <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Target: 18 hrs/week</span>
                          <span className="font-semibold text-slate-700">Currently: 21.5 hrs/week</span>
                        </div>
                      </div>

                      <div className="md:col-span-5 p-4 rounded-xl border border-blue-100 bg-blue-50/40 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                            <span>AI Diagnostic Insight</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 mb-1">
                            High Positive Lift in Core Modules
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed font-normal">
                            Internal test scores and continuous quiz results indicate mastery in Algorithms. Focus your next 2 study blocks on Database Systems buffering.
                          </p>
                        </div>
                        <div className="pt-3 mt-2 border-t border-blue-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Engine: XGBoost Regressor</span>
                          <span className="text-blue-700 font-semibold">Active Model</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Content 2: Performance Chart */}
                {heroTab === "performance" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs px-1">
                      <div>
                        <span className="font-semibold text-slate-900">
                          Multi-Month Performance Trajectory
                        </span>
                        <p className="text-slate-500 text-[11px]">
                          Historical score distribution with projected 95% confidence interval
                        </p>
                      </div>
                      <span className="text-[11px] text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        Interactive Recharts Model
                      </span>
                    </div>

                    <div className="h-60 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={DEMO_TRAJECTORY_DATA} margin={{ top: 5, right: 15, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="period" tick={{ fill: "#64748b", fontSize: 11 }} />
                          <YAxis domain={[65, 95]} tick={{ fill: "#64748b", fontSize: 11 }} unit="%" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#ffffff",
                              borderColor: "#e2e8f0",
                              borderRadius: "0.75rem",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                              fontSize: "12px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#2563eb"
                            strokeWidth={2.5}
                            fill="url(#heroGradient)"
                            name="Score"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Tab Content 3: Prediction Details */}
                {heroTab === "prediction" && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Ensemble Prediction Vector
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          High Accuracy (R² = 0.912)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                        <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                          <span className="text-[11px] text-slate-500 font-medium">Lower Bound</span>
                          <p className="text-xl font-bold text-slate-700 mt-0.5">82.0%</p>
                        </div>
                        <div className="bg-blue-50/80 p-3 rounded-lg border border-blue-200/80">
                          <span className="text-[11px] text-blue-700 font-semibold">Expected Projection</span>
                          <p className="text-2xl font-extrabold text-blue-600 mt-0.5">85.6%</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                          <span className="text-[11px] text-slate-500 font-medium">Upper Bound</span>
                          <p className="text-xl font-bold text-slate-700 mt-0.5">88.4%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. TECHNICAL CREDIBILITY & STACK STRIP                               */}
      {/* ==================================================================== */}
      <section className="py-10 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
            Engineered with modern AI & data infrastructure
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-slate-500 font-medium text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-700 font-semibold">Supabase</span>
              <span className="text-slate-400 text-xs">PostgreSQL + RLS</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span className="text-slate-700 font-semibold">FastAPI</span>
              <span className="text-slate-400 text-xs">Python 3.12</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span className="text-slate-700 font-semibold">scikit-learn</span>
              <span className="text-slate-400 text-xs">Ensembles</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span className="text-slate-700 font-semibold">XGBoost</span>
              <span className="text-slate-400 text-xs">Gradient Boosting</span>
            </div>
            <div className="flex items-center gap-2">
              <Binary className="w-4 h-4 text-violet-600" />
              <span className="text-slate-700 font-semibold">SHAP</span>
              <span className="text-slate-400 text-xs">Explainability</span>
            </div>
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-600" />
              <span className="text-slate-700 font-semibold">MLflow</span>
              <span className="text-slate-400 text-xs">Model Tracking</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. INTERACTIVE PRODUCT TOUR (FEATURES)                                */}
      {/* ==================================================================== */}
      <section id="features" className="py-24 bg-[#F8FAFC] border-b border-slate-200/80 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
              Interactive Product Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Everything you need to understand your academic progress
            </h2>
            <p className="text-sm text-slate-600 mt-3 font-normal leading-relaxed">
              From raw coursework marks to predictive intelligence and personalized action plans.
              Click any capability to explore its interactive preview.
            </p>
          </div>

          {/* Interactive Feature Tour Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
            
            {/* Left: Clickable Feature Nav */}
            <div className="lg:col-span-5 space-y-3">
              {[
                {
                  id: 0,
                  num: "01",
                  title: "Performance Prediction",
                  icon: Sparkles,
                  desc: "Forecast final grades, GPA standing, and credit milestones using multi-variable regression ensembles.",
                },
                {
                  id: 1,
                  num: "02",
                  title: "Academic Analytics",
                  icon: BarChart3,
                  desc: "Analyze continuous internal marks, attendance velocity, and subject mastery distributions.",
                },
                {
                  id: 2,
                  num: "03",
                  title: "Explainable AI (SHAP)",
                  icon: Lightbulb,
                  desc: "Understand exactly why the model predicts what it predicts with game-theoretic feature attributions.",
                },
                {
                  id: 3,
                  num: "04",
                  title: "What-If Simulation",
                  icon: Sliders,
                  desc: "Interactively model how adjustments in weekly study hours or attendance transform your projected outcomes.",
                },
              ].map((feat) => {
                const Icon = feat.icon;
                const isSelected = activeFeature === feat.id;
                return (
                  <button
                    key={feat.id}
                    onClick={() => setActiveFeature(feat.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white border-blue-500 shadow-md ring-2 ring-blue-500/10"
                        : "bg-white/60 border-slate-200/80 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-400 font-bold">
                            {feat.num}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900">{feat.title}</h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Dynamic Interactive Visualization Card */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-elevated p-6 min-h-[380px] flex flex-col justify-between">
              
              {/* Feature 0: Performance Prediction Visual */}
              {activeFeature === 0 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Prediction Engine Visualization
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Multi-Factor Regressor Projection (Demo Preview)
                      </span>
                    </div>
                    <Badge variant="success" size="sm">
                      Low Academic Risk
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Projected Semester Score
                      </span>
                      <p className="text-3xl font-extrabold text-blue-600 mt-1">84.6%</p>
                      <span className="text-xs text-emerald-600 font-semibold block mt-1">
                        +8.2% vs previous term
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Model Confidence
                      </span>
                      <p className="text-3xl font-extrabold text-slate-900 mt-1">94.2%</p>
                      <span className="text-xs text-slate-500 block mt-1">
                        Confidence Interval ± 2.8%
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 leading-relaxed">
                    <span className="font-bold text-blue-900 block mb-0.5">Ensemble Status:</span>
                    Aggregating outputs across Gradient Boosted trees and Regularized Ridge regression models.
                  </div>
                </div>
              )}

              {/* Feature 1: Academic Analytics Visual */}
              {activeFeature === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Subject Mastery Distribution
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Internal Assessment Velocity across Enrolled Modules
                      </span>
                    </div>
                    <Badge variant="default" size="sm">
                      4 Modules Enrolled
                    </Badge>
                  </div>

                  <div className="space-y-3 pt-1">
                    {SUBJECT_MASTERY_DEMO.map((subj) => (
                      <div key={subj.code} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-slate-800">
                            {subj.subject}{" "}
                            <span className="text-slate-400 text-[11px]">({subj.code})</span>
                          </span>
                          <span className="font-bold text-slate-900">{subj.score}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`${subj.color} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${subj.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature 2: Explainable AI Visual (SHAP) */}
              {activeFeature === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        SHAP Factor Attribution Vector
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Quantified statistical drivers behind predicted score
                      </span>
                    </div>
                    <Badge variant="default" size="sm">
                      Transparent AI
                    </Badge>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {SHAP_FACTORS_DEMO.map((factor) => (
                      <div key={factor.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-700 font-medium">{factor.name}</span>
                          <span
                            className={`font-mono font-bold ${
                              factor.positive ? "text-blue-600" : "text-rose-600"
                            }`}
                          >
                            {factor.impact}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              factor.positive ? "bg-blue-600" : "bg-rose-500"
                            }`}
                            style={{ width: `${factor.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-400 italic pt-2">
                    *Model influence reflects statistical feature importance and does not imply direct causation.
                  </p>
                </div>
              )}

              {/* Feature 3: What-If Simulation Visual */}
              {activeFeature === 3 && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        What-If Simulator Preview
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Simulated Trajectory Comparison
                      </span>
                    </div>
                    <Badge variant="success" size="sm">
                      Scenario Active
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Current Baseline</span>
                      <p className="text-xl font-bold text-slate-700 mt-1">76.4%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <span className="text-[10px] font-bold text-blue-700 uppercase">Simulated Outcome</span>
                      <p className="text-2xl font-extrabold text-blue-600 mt-1">82.8%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">Net Projection</span>
                      <p className="text-xl font-bold text-emerald-600 mt-1">+6.4%</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    Simulated scenario: Increasing weekly study hours to 18 hrs and maintaining 92% attendance shifts the predicted grade category from B+ to A-.
                  </p>
                </div>
              )}

              {/* Bottom Card Action */}
              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Production Architecture</span>
                <Link
                  href="/signup"
                  className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 group"
                >
                  <span>Experience In Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 5. HOW LEARNTRACK WORKS — Connected Workflow                          */}
      {/* ==================================================================== */}
      <section id="how-it-works" className="py-24 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
              Continuous Intelligence Loop
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              How LearnTrack Works
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              A continuous four-stage cycle that converts routine academic activity into elevated outcomes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            
            {/* Step 1 */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:shadow-card hover:border-slate-300 transition-all space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-blue-600 font-mono">01</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-base font-bold text-slate-900">Connect Academic Data</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Log attendance percentages, internal test scores, assignment completions, and prior semester credits in a single private workspace.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:shadow-card hover:border-slate-300 transition-all space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-indigo-600 font-mono">02</span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-base font-bold text-slate-900">Analyze Performance</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Algorithms aggregate continuous progress metrics against institutional grading standards, course distributions, and peer percentiles.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:shadow-card hover:border-slate-300 transition-all space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-violet-600 font-mono">03</span>
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-base font-bold text-slate-900">Predict Outcomes</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Trained regression ensembles forecast final semester scores, grade classifications, and probabilistic risk categories before exams occur.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:shadow-card hover:border-slate-300 transition-all space-y-3 relative group">
              <div className="flex items-center justify-between">
                <span className="text-3xl font-extrabold text-emerald-600 font-mono">04</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-base font-bold text-slate-900">Improve with AI</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Actionable SHAP-driven insights guide weekly study pacing, assignment completion targets, and mock testing schedules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. ACADEMIC INTELLIGENCE & ANALYTICS (DEDICATED SECTION)             */}
      {/* ==================================================================== */}
      <section id="analytics" className="py-24 bg-[#F8FAFC] border-y border-slate-200/80 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
              Academic Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              See the patterns behind your performance
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Gain actionable visibility into study consistency, subject masteries, and attendance compliance.
            </p>

            {/* Interactive Timeframe Toggle */}
            <div className="inline-flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs mt-6">
              {(["7d", "30d", "sem"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setAnalyticsTimeframe(tf)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    analyticsTimeframe === tf
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tf === "7d" ? "7 Days" : tf === "30d" ? "30 Days" : "Full Semester"}
                </button>
              ))}
            </div>
          </div>

          {/* Large Analytics Card */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-elevated p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Study Hours & Attendance Velocity
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparative trend tracking study investment vs lecture compliance
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  Study Hours
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  Consistency Index (%)
                </span>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-64 w-full pt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ANALYTICS_TIMEFRAME_DATA[analyticsTimeframe]}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "0.75rem",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="studyHours" fill="#2563eb" radius={[6, 6, 0, 0]} name="Study Hours" />
                  <Bar dataKey="consistency" fill="#818cf8" radius={[6, 6, 0, 0]} name="Consistency %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7. INTERACTIVE WHAT-IF SIMULATOR SECTION                             */}
      {/* ==================================================================== */}
      <section id="simulator" className="py-24 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
              Predictive Simulation
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Explore outcomes before they happen
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Simulate how adjustments to your study routine, attendance, or assignment focus impact your projected trajectory.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#F8FAFC] rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-elevated">
            
            {/* Left: Interactive Sliders */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Scenario Parameters
                </span>
                <button
                  onClick={() => {
                    setStudyHours(16);
                    setTargetAttendance(90);
                    setAssignmentRate(95);
                  }}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              {/* Slider 1: Weekly Study Hours */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-800">
                  <span>Weekly Study Hours</span>
                  <span className="text-blue-600 font-mono text-sm">{studyHours} hrs/wk</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  value={studyHours}
                  onChange={(e) => setStudyHours(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>5 hrs</span>
                  <span>Target: 20 hrs</span>
                  <span>35 hrs</span>
                </div>
              </div>

              {/* Slider 2: Target Attendance */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-800">
                  <span>Target Attendance Rate</span>
                  <span className="text-blue-600 font-mono text-sm">{targetAttendance}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="100"
                  step="1"
                  value={targetAttendance}
                  onChange={(e) => setTargetAttendance(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>60%</span>
                  <span>Min Requirement: 75%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Slider 3: Assignment Completion */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-800">
                  <span>Assignment Completion Rate</span>
                  <span className="text-blue-600 font-mono text-sm">{assignmentRate}%</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="100"
                  step="1"
                  value={assignmentRate}
                  onChange={(e) => setAssignmentRate(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>70%</span>
                  <span>Target: 95%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Right: Dynamic Calculated Projection Output */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-soft-sm space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Projected Outcome
                </span>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Scenario Preview
                </span>
              </div>

              <div className="flex items-baseline gap-4">
                <div>
                  <span className="text-xs text-slate-400 block">Baseline</span>
                  <span className="text-xl font-bold text-slate-500 font-mono">76.4%</span>
                </div>
                <div className="text-slate-300 text-2xl font-light">→</div>
                <div>
                  <span className="text-xs text-slate-400 block">Simulated Score</span>
                  <span className="text-4xl font-extrabold text-blue-600 font-mono">
                    {simulatedScore}%
                  </span>
                </div>
              </div>

              {/* Delta Badge */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800 flex items-center justify-between">
                <span className="font-medium">Estimated Performance Lift:</span>
                <span className="text-sm font-bold font-mono">
                  {scoreDelta >= 0 ? `+${scoreDelta}%` : `${scoreDelta}%`}
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Target Standing</span>
                  <span className="font-semibold text-slate-900">
                    {simulatedScore >= 85 ? "Grade A (Honors)" : simulatedScore >= 75 ? "Grade B+ (Solid)" : "Grade B"}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${simulatedScore}%` }}
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                *Illustrative simulation. Test scenario preview. Live workspace connects to trained model weights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 8. PRODUCT PHILOSOPHY (TRACK -> UNDERSTAND -> PREDICT -> IMPROVE)     */}
      {/* ==================================================================== */}
      <section className="py-20 bg-[#F8FAFC] border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              The LearnTrack Intelligence Cycle
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 font-normal">
              A transparent, disciplined path from logging activity to academic mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-sm font-bold text-slate-900">Track</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Log routine academic coursework, attendance sessions, and internal assessments effortlessly.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-sm font-bold text-slate-900">Understand</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Analyze velocity metrics and detect early academic variances across enrolled modules.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-sm font-bold text-slate-900">Predict</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Forecast end-semester grades and evaluate probability distributions using machine learning models.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                04
              </div>
              <h3 className="text-sm font-bold text-slate-900">Improve</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Apply targeted AI study pacing recommendations and simulated scenario buffers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 9. SECURITY & DATA PRIVACY SECTION                                   */}
      {/* ==================================================================== */}
      <section id="security" className="py-20 bg-white border-t border-slate-200/80 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block mb-2">
              Privacy & Infrastructure
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Your academic data stays yours
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              LearnTrack enforces zero third-party data sharing and strict database isolation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">Row Level Security (RLS)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                PostgreSQL policies enforce strict row isolation. Only your authenticated user ID can read or update your academic data.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <Lock className="w-5 h-5 text-indigo-600" />
              <h4 className="text-sm font-bold text-slate-900">Supabase Auth OAuth</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Industry-standard JWT authentication for Email/Password and Google OAuth with encrypted session cookies.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
              <Zap className="w-5 h-5 text-emerald-600" />
              <h4 className="text-sm font-bold text-slate-900">Dedicated ML Microservice</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                FastAPI Python microservice isolated from frontend assets, serving low-latency inference directly to authenticated sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 10. FINAL CALL TO ACTION (CTA)                                       */}
      {/* ==================================================================== */}
      <section className="py-20 bg-gradient-to-b from-[#F8FAFC] to-blue-50/40 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Understand your performance.
            <br />
            <span className="text-blue-600">Start tracking your growth.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Join students using AI-powered intelligence to model grade projections, optimize study consistency, and reach academic milestones.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link href="/signup">
              <Button
                size="lg"
                variant="primary"
                className="w-full sm:w-auto text-sm font-semibold rounded-xl shadow-glow-blue hover:shadow-lg active:scale-[0.98] transition-all group"
                rightIcon={<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
              >
                Create Account
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-sm font-semibold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl shadow-soft-sm"
              >
                Sign In to Workspace
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 11. COMPREHENSIVE FOOTER                                             */}
      {/* ==================================================================== */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            
            {/* Col 1: Brand Info */}
            <div className="col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 text-base">LearnTrack</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                AI-Powered Student Performance Intelligence. Transform academic data into measurable outcomes.
              </p>
            </div>

            {/* Col 2: Product & Capabilities */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Product
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <a href="#product" className="hover:text-blue-600 transition-colors">
                    Product Overview
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-blue-600 transition-colors">
                    Features & Tour
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-blue-600 transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#analytics" className="hover:text-blue-600 transition-colors">
                    Analytics & Trends
                  </a>
                </li>
                <li>
                  <a href="#simulator" className="hover:text-blue-600 transition-colors">
                    What-If Simulator
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Authentication & Workspace */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Access
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <Link href="/login" className="hover:text-blue-600 transition-colors">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-blue-600 transition-colors">
                    Create Account
                  </Link>
                </li>
                <li>
                  <Link href="/forgot-password" className="hover:text-blue-600 transition-colors">
                    Reset Password
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
                    Student Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Architecture & Security */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Architecture
              </h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>
                  <span className="text-slate-500">PostgreSQL Row Level Security</span>
                </li>
                <li>
                  <span className="text-slate-500">Supabase OAuth 2.0</span>
                </li>
                <li>
                  <span className="text-slate-500">FastAPI ML Inference Service</span>
                </li>
                <li>
                  <span className="text-slate-500">SHAP Explainability Vectors</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>© {new Date().getFullYear()} LearnTrack. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
