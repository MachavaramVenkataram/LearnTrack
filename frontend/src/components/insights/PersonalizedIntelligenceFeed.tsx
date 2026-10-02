"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  Lightbulb,
  ArrowRight,
  Info,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { InsightCategory } from "@/types/academic";

export interface PersonalizedInsightItem {
  type: InsightCategory;
  title: string;
  description: string;
  importance: "high" | "medium" | "low";
  score?: number;
  supporting_value?: number | null;
  supporting_label?: string | null;
  action_label?: string | null;
  action_route?: string | null;
}

interface PersonalizedIntelligenceFeedProps {
  insights: PersonalizedInsightItem[];
}

export function PersonalizedIntelligenceFeed({
  insights,
}: PersonalizedIntelligenceFeedProps) {
  const [selectedFilter, setSelectedFilter] = useState<"all" | InsightCategory>("all");

  const filteredInsights = useMemo(() => {
    if (selectedFilter === "all") return insights;
    return insights.filter((i) => i.type === selectedFilter);
  }, [insights, selectedFilter]);

  const counts = useMemo(() => {
    return {
      all: insights.length,
      strength: insights.filter((i) => i.type === "strength").length,
      improvement: insights.filter((i) => i.type === "improvement").length,
      trend: insights.filter((i) => i.type === "trend").length,
      recommendation: insights.filter((i) => i.type === "recommendation").length,
    };
  }, [insights]);

  return (
    <div className="space-y-4">
      {/* 1. Feed Header & Category Filters (Requirements #21, #22) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-sans tracking-tight">
              Personalized Intelligence
            </h2>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-mono">
              {filteredInsights.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evidence-based observations derived from your academic records and model telemetry.
          </p>
        </div>

        {/* Filter Segmented Controls */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100/90 border border-slate-200/60 text-xs shrink-0">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              selectedFilter === "all"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setSelectedFilter("strength")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              selectedFilter === "strength"
                ? "bg-white text-emerald-700 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Strengths ({counts.strength})
          </button>
          <button
            onClick={() => setSelectedFilter("improvement")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              selectedFilter === "improvement"
                ? "bg-white text-amber-700 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Improvement Areas ({counts.improvement})
          </button>
          <button
            onClick={() => setSelectedFilter("trend")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              selectedFilter === "trend"
                ? "bg-white text-blue-700 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Trends ({counts.trend})
          </button>
          <button
            onClick={() => setSelectedFilter("recommendation")}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              selectedFilter === "recommendation"
                ? "bg-white text-purple-700 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Recommendations ({counts.recommendation})
          </button>
        </div>
      </div>

      {/* 2. Prioritization Notice (Requirement #23) */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11.5px] text-slate-600 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>
            <strong>Insight Prioritization:</strong> Insights are ordered using model contribution, observed deviation, and available academic thresholds.
          </span>
        </div>
        <span className="font-mono text-slate-400 text-[10.5px] shrink-0 hidden md:inline">
          High • Medium • Low Urgency
        </span>
      </div>

      {/* 3. 2-Column Insight Cards Grid (Requirements #24 - #31) */}
      {filteredInsights.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredInsights.map((item, idx) => {
            const isStrength = item.type === "strength";
            const isImprovement = item.type === "improvement";
            const isTrend = item.type === "trend";
            const isRecommendation = item.type === "recommendation";

            return (
              <div
                key={idx}
                className="group p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-180 ease-out flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Category Badge & Priority */}
                  <div className="flex items-center justify-between">
                    <div>
                      {isStrength && (
                        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                          <TrendingUp className="w-3 h-3 text-emerald-600" />
                          Strength
                        </span>
                      )}
                      {isImprovement && (
                        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Improvement Area
                        </span>
                      )}
                      {isTrend && (
                        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
                          <Clock className="w-3 h-3 text-blue-600" />
                          Trend
                        </span>
                      )}
                      {isRecommendation && (
                        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200/60">
                          <Lightbulb className="w-3 h-3 text-purple-600" />
                          Recommendation
                        </span>
                      )}
                    </div>

                    <Badge
                      variant={
                        item.importance === "high"
                          ? "danger"
                          : item.importance === "medium"
                          ? "warning"
                          : "secondary"
                      }
                      size="sm"
                      className="text-[10px]"
                    >
                      {item.importance === "high"
                        ? "High Priority"
                        : item.importance === "medium"
                        ? "Medium Priority"
                        : "Low Priority"}
                    </Badge>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Supporting Evidence Tag (Requirement #27, #28) */}
                  {item.supporting_value !== undefined && item.supporting_value !== null && (
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                      <span className="text-slate-500 font-medium text-[11px]">
                        {item.supporting_label || "Supporting Metric"}:
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        {item.supporting_value}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action Link (Requirement #29, #30) */}
                {item.action_label && item.action_route && (
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={item.action_route}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 group-hover:text-blue-700 transition-colors"
                    >
                      <span>{item.action_label}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-160 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Category State */
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/90 space-y-2">
          <Lightbulb className="w-6 h-6 text-slate-300 mx-auto" />
          <h3 className="text-xs font-bold text-slate-800">No Insights In This Category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            As you log more coursework marks, attendance logs, and study sessions, additional actionable intelligence will be calculated.
          </p>
        </div>
      )}
    </div>
  );
}
