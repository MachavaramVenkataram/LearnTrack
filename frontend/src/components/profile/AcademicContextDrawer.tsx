"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Cpu, BarChart3, TrendingUp, Calendar, CheckCircle2, ShieldCheck } from "lucide-react";

interface AcademicContextDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  rollNumber: string;
  department: string;
  year: number;
  semester: number;
}

export function AcademicContextDrawer({
  isOpen,
  onClose,
  rollNumber,
  department,
  year,
  semester,
}: AcademicContextDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const contextConsumers = [
    {
      id: "ai-assistant",
      title: "AI Concept Tutor & Academic Assistant",
      icon: Sparkles,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50 border-purple-100",
      usage:
        "Calibrates conceptual depth, technical terminology, and curriculum pacing to your specific Department and Semester level.",
      scope: `Enrolled: Year ${year}, Semester ${semester}`,
    },
    {
      id: "analytics",
      title: "Academic Analytics & Benchmarking",
      icon: BarChart3,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 border-blue-100",
      usage:
        "Filters your GPA trajectory, semester credit progress, and subject grade distribution within your current institutional cohort.",
      scope: `Department: ${department || "Active Program"}`,
    },
    {
      id: "predictions",
      title: "ML Grade Prediction Engine",
      icon: TrendingUp,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50 border-indigo-100",
      usage:
        "Supplies mathematical regressors (attendance, internal exams, assignments) from current semester subjects into trained model pipelines.",
      scope: `Target Student: ${rollNumber || "Active Student"}`,
    },
    {
      id: "study-plan",
      title: "Automated Study Planner & Session Tracking",
      icon: Calendar,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50 border-emerald-100",
      usage:
        "Balances weekly study hour budgets according to subject credit weights and upcoming midterm examination schedules.",
      scope: "Weekly Time Budget Allocation",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div className="fixed inset-0 z-50 flex justify-end pointer-events-none">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="pointer-events-auto w-full max-w-md bg-white border-l border-slate-200 h-full shadow-2xl flex flex-col justify-between overflow-hidden"
              role="dialog"
              aria-modal="true"
              aria-labelledby="context-drawer-title"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                      Subsystem Integration
                    </span>
                    <h2 id="context-drawer-title" className="text-sm font-bold text-slate-900">
                      LearnTrack Profile Context
                    </h2>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  aria-label="Close context drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block">
                    Active Identity Vector
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Student ID</span>
                      <span className="font-mono font-bold text-slate-900">{rollNumber || "LT-NEW"}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10.5px]">Cohort Level</span>
                      <span className="font-bold text-slate-900">Year {year}, Sem {semester}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-400 block">
                    Integrated Subsystems
                  </span>

                  <div className="space-y-3">
                    {contextConsumers.map((consumer) => {
                      const Icon = consumer.icon;
                      return (
                        <div
                          key={consumer.id}
                          className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-7 h-7 rounded-lg ${consumer.iconBg} border flex items-center justify-center`}
                              >
                                <Icon className={`w-3.5 h-3.5 ${consumer.iconColor}`} />
                              </div>
                              <h3 className="text-xs font-bold text-slate-900">
                                {consumer.title}
                              </h3>
                            </div>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">
                            {consumer.usage}
                          </p>

                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px] font-mono text-slate-400">
                            <span>{consumer.scope}</span>
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Active
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/50 text-xs text-blue-900 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5 text-blue-800">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Zero Data Leakage Policy
                  </div>
                  <p className="text-blue-800/80 leading-relaxed text-[11.5px]">
                    Your profile data stays inside your dedicated PostgreSQL schema. External AI
                    models only receive sanitized contextual prompts without personal contact data.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
