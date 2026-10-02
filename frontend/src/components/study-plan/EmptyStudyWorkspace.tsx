"use client";

import React from "react";
import Link from "next/link";
import {
  CalendarDays,
  Sparkles,
  BookOpen,
  Clock,
  Target,
  ArrowRight,
  TrendingUp,
  Layers,
  CheckCircle2,
} from "lucide-react";

interface EmptyStudyWorkspaceProps {
  hasSubjects: boolean;
  onOpenGenerator: () => void;
}

export function EmptyStudyWorkspace({
  hasSubjects,
  onOpenGenerator,
}: EmptyStudyWorkspaceProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Compact Hero Onboarding Card (< 340px) */}
      <div className="max-w-2xl mx-auto p-7 sm:p-8 rounded-2xl bg-white border border-dashed border-[#CBD5E1] shadow-2xs text-center space-y-4">
        {/* Animated Calendar + Sparkle Icon */}
        <div className="relative w-13 h-13 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto border border-blue-100 shadow-2xs group hover:-translate-y-0.5 hover:shadow-soft-md transition-all duration-200 cursor-pointer">
          <CalendarDays className="w-6 h-6 transition-transform duration-200 group-hover:scale-105" />
          <Sparkles className="w-3.5 h-3.5 text-[#4F46E5] absolute -top-1 -right-1 animate-pulse" />
        </div>

        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-bold text-[#0F172A] tracking-tight">
            Build your study plan
          </h2>
          <p className="text-xs sm:text-[13px] text-[#64748B] max-w-md mx-auto leading-relaxed">
            Create a focused schedule based on your subjects, goals, available time, and academic priorities.
          </p>
        </div>

        <div>
          {hasSubjects ? (
            <button
              type="button"
              onClick={onOpenGenerator}
              className="h-[42px] px-5 rounded-[11px] bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-soft-sm hover:shadow-soft-md hover:-translate-y-0.5 active:translate-y-0 transition-all inline-flex items-center gap-2 cursor-pointer group"
            >
              <Sparkles className="w-3.5 h-3.5 transition-transform duration-150 group-hover:rotate-12" />
              <span>Generate Personalized Plan</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
            </button>
          ) : (
            <Link
              href="/subjects"
              className="h-[42px] px-5 rounded-[11px] bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs shadow-soft-sm hover:shadow-soft-md hover:-translate-y-0.5 active:translate-y-0 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Start by Adding Subjects →</span>
            </Link>
          )}
        </div>

        <p className="text-[11px] text-slate-400 font-medium">
          AI-assisted • Personalized • Adaptive
        </p>
      </div>

      {/* 2. Quick Setup Section: GET STARTED */}
      <div className="max-w-4xl mx-auto space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Get Started
          </span>
          <span className="text-[11px] text-slate-400">3-Step Study Setup</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Step 1 */}
          <Link
            href="/subjects"
            className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:border-blue-200 hover:shadow-soft-md hover:-translate-y-0.5 transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="font-mono text-xs font-bold text-blue-600">01</span>
                <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <h3 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                Add your subjects
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Register current semester coursework and credits.
              </p>
            </div>
            <div className="pt-3 text-[11px] font-semibold text-blue-600 flex items-center gap-1">
              <span>Go to Subjects</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>

          {/* Step 2 */}
          <button
            type="button"
            onClick={onOpenGenerator}
            className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:border-indigo-200 hover:shadow-soft-md hover:-translate-y-0.5 transition-all group flex flex-col justify-between text-left cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="font-mono text-xs font-bold text-indigo-600">02</span>
                <Clock className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <h3 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 transition-colors">
                Set available study time
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Specify your daily study hours and preferred study blocks.
              </p>
            </div>
            <div className="pt-3 text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
              <span>Set Availability</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* Step 3 */}
          <button
            type="button"
            onClick={onOpenGenerator}
            className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-soft-sm hover:border-emerald-200 hover:shadow-soft-md hover:-translate-y-0.5 transition-all group flex flex-col justify-between text-left cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="font-mono text-xs font-bold text-emerald-600">03</span>
                <Sparkles className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </div>
              <h3 className="font-bold text-xs text-slate-900 group-hover:text-emerald-600 transition-colors">
                Generate personalized plan
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Receive an AI-synthesized schedule balanced to your needs.
              </p>
            </div>
            <div className="pt-3 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <span>Generate Plan</span>
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        </div>
      </div>

      {/* 3. AI Planning Explanation Panel */}
      <div className="max-w-4xl mx-auto p-5 sm:p-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-soft-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Sparkles className="w-4 h-4 text-[#4F46E5]" />
          <span>How LearnTrack Builds Your Plan</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          LearnTrack considers your registered coursework, academic goals, available study time, recent study activity, performance data, and upcoming priorities. Then it synthesizes a realistic, balanced timetable.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
          {[
            { label: "Registered Subjects", icon: BookOpen, desc: "Course credits & continuous marks" },
            { label: "Academic Goals", icon: Target, desc: "Student target scores & deadlines" },
            { label: "Available Study Time", icon: Clock, desc: "Daily hours limit & preferred times" },
            { label: "Recent Study Activity", icon: Layers, desc: "Logged sessions & historical cadence" },
            { label: "Performance Data", icon: TrendingUp, desc: "Risk indicators & assessment gaps" },
            { label: "Structured Schedule", icon: CheckCircle2, desc: "Time-blocked daily tasks & breaks" },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/60 space-y-1"
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <Icon className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>{item.label}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
