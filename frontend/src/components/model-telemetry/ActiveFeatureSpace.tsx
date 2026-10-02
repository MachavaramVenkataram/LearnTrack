"use client";

import React, { useState, useMemo } from "react";
import { Search, ArrowRight, CheckCircle2 } from "lucide-react";

export interface FeatureMetadata {
  name: string;
  category: "Academic" | "Attendance" | "Study & Habits" | "Derived & Engineered";
  type: "Float (0.0 - 100.0)" | "Float (Hours)" | "Integer (Count)" | "Binary (0/1)" | "Float (Ratio)" | "Float (Delta)";
  desc: string;
  usedBy: string[];
}

export const FEATURE_REGISTRY: Record<string, FeatureMetadata> = {
  attendance_percentage: {
    name: "attendance_percentage",
    category: "Attendance",
    type: "Float (0.0 - 100.0)",
    desc: "Institutional classroom and lab attendance percentage across all enrolled subjects.",
    usedBy: ["Prediction Pipeline", "TreeSHAP Explanations", "Attendance Risk Engine"],
  },
  assignment_score: {
    name: "assignment_score",
    category: "Academic",
    type: "Float (0.0 - 100.0)",
    desc: "Normalized weighted average of evaluated continuous coursework assignments.",
    usedBy: ["Prediction Pipeline", "Linear Regression Forward Pass", "SHAP Attribution"],
  },
  internal_marks: {
    name: "internal_marks",
    category: "Academic",
    type: "Float (0.0 - 100.0)",
    desc: "Continuous internal examination score and midterm evaluation marks.",
    usedBy: ["Prediction Pipeline", "Linear Regression Forward Pass", "SHAP Attribution"],
  },
  previous_score: {
    name: "previous_score",
    category: "Academic",
    type: "Float (0.0 - 100.0)",
    desc: "Historical academic cumulative grade average from prior semester or academic term.",
    usedBy: ["Prediction Pipeline", "Baseline Prior Assessment", "SHAP Attribution"],
  },
  study_hours: {
    name: "study_hours",
    category: "Study & Habits",
    type: "Float (Hours)",
    desc: "Dedicated weekly self-study and focused revision hours outside the classroom.",
    usedBy: ["Prediction Pipeline", "Study Habit Optimization", "SHAP Attribution"],
  },
  assignments_completed: {
    name: "assignments_completed",
    category: "Academic",
    type: "Integer (Count)",
    desc: "Number of completed and verified coursework problem sets and submissions.",
    usedBy: ["Prediction Pipeline", "Milestone Tracking", "SHAP Attribution"],
  },
  average_assessment_score: {
    name: "average_assessment_score",
    category: "Derived & Engineered",
    type: "Float (0.0 - 100.0)",
    desc: "Engineered arithmetic composite of continuous internal evaluations and quizzes.",
    usedBy: ["Prediction Pipeline", "Feature Scaler", "SHAP Attribution"],
  },
  previous_performance_trend: {
    name: "previous_performance_trend",
    category: "Derived & Engineered",
    type: "Float (Delta)",
    desc: "Directional rate of score change indicating trajectory relative to prior terms.",
    usedBy: ["Prediction Pipeline", "Trend Intelligence", "SHAP Attribution"],
  },
  attendance_risk_flag: {
    name: "attendance_risk_flag",
    category: "Attendance",
    type: "Binary (0/1)",
    desc: "Binary trigger activated when aggregate attendance drops below institutional 75% mark.",
    usedBy: ["Prediction Pipeline", "Early Warning System", "SHAP Attribution"],
  },
  study_intensity_ratio: {
    name: "study_intensity_ratio",
    category: "Study & Habits",
    type: "Float (Ratio)",
    desc: "Ratio of focused weekly study hours normalized by total credit load.",
    usedBy: ["Prediction Pipeline", "Workload Simulator", "SHAP Attribution"],
  },
  weighted_academic_score: {
    name: "weighted_academic_score",
    category: "Derived & Engineered",
    type: "Float (0.0 - 100.0)",
    desc: "Credit-weighted composite indicator combining examination results and internal marks.",
    usedBy: ["Prediction Pipeline", "Final GPA Projection", "SHAP Attribution"],
  },
};

export interface ActiveFeatureSpaceProps {
  featureNames?: string[];
  onSelectFeature: (feature: FeatureMetadata) => void;
}

export function ActiveFeatureSpace({
  featureNames = Object.keys(FEATURE_REGISTRY),
  onSelectFeature,
}: ActiveFeatureSpaceProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");

  const categories = ["ALL", "Academic", "Attendance", "Study & Habits", "Derived & Engineered"];

  const filteredFeatures = useMemo(() => {
    return featureNames
      .map((name) => FEATURE_REGISTRY[name] || {
        name,
        category: "Academic" as const,
        type: "Float (0.0 - 100.0)" as const,
        desc: "Active mathematical input parameter in forward prediction pass.",
        usedBy: ["Prediction Pipeline", "SHAP Attribution"],
      })
      .filter((feat) => {
        const matchesCat = activeCategory === "ALL" || feat.category === activeCategory;
        const matchesQuery =
          !searchQuery.trim() ||
          feat.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          feat.desc.toLowerCase().includes(searchQuery.trim().toLowerCase());
        return matchesCat && matchesQuery;
      });
  }, [featureNames, activeCategory, searchQuery]);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Parameter Architecture
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {featureNames.length} Active Regressors
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-0.5">
            Active Mathematical Feature Space
          </h3>
        </div>

        {/* Search and Category Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features…"
              className="w-full h-8 pl-8 pr-3 rounded-[8px] bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              aria-label="Search feature space"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-[8px] text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature Cards Grid */}
      {filteredFeatures.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          No features match &ldquo;{searchQuery}&rdquo;. Try clearing your search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredFeatures.map((feat, idx) => {
            const rawIndex = featureNames.indexOf(feat.name);
            const displayIndex = rawIndex >= 0 ? rawIndex + 1 : idx + 1;
            const indexStr = displayIndex < 10 ? `0${displayIndex}` : `${displayIndex}`;

            return (
              <div
                key={feat.name}
                onClick={() => onSelectFeature(feat)}
                className="group p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-2xs transition-all duration-150 flex flex-col justify-between cursor-pointer space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-blue-100/70 text-blue-700 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                      {indexStr}
                    </span>
                    <span
                      className="font-mono font-bold text-xs text-slate-900 truncate block group-hover:text-blue-600 transition-colors"
                      title={feat.name}
                    >
                      {feat.name}
                    </span>
                  </div>

                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    Active
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {feat.desc}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px]">
                  <span className="font-mono text-slate-400">{feat.type}</span>
                  <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                    Inspect
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
