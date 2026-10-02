"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Award,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Layers,
  Brain,
  FolderGit2,
  Lock,
  ArrowRight,
  TrendingUp,
  Zap,
  Target,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getAchievements } from "@/lib/student-os/service";
import { StudentAchievement } from "@/types/student-os";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";

export default function AchievementsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const userId = user?.id || "demo-student";

  const [achievements, setAchievements] = useState<StudentAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getAchievements(userId);
      setAchievements(data);
    } catch {
      showToast("Error loading achievements", "Using student records.", "info");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const categories = ["All", "Study", "Practice", "Engineering", "Career", "Consistency"];

  const filteredAchievements = achievements.filter((a) => {
    if (selectedCategory !== "All" && a.category !== selectedCategory) return false;
    return true;
  });

  const unlockedCount = achievements.filter((a) => Boolean(a.unlocked_at)).length;
  const totalCount = achievements.length;
  const completionPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Icon mapping
  const renderBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const className = `w-6 h-6 ${isUnlocked ? "text-blue-600" : "text-slate-400"}`;
    switch (iconName) {
      case "Flame":
        return <Flame className={className} />;
      case "Timer":
      case "Clock":
        return <Clock className={className} />;
      case "Brain":
        return <Brain className={className} />;
      case "Layers":
        return <Layers className={className} />;
      case "FolderGit2":
        return <FolderGit2 className={className} />;
      case "CheckCircle2":
        return <CheckCircle2 className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* 1. Header Banner */}
      <div className="bg-white border-b border-[#E2E8F0] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100/70 text-[11px] font-semibold text-blue-700 mb-2">
              <Trophy className="w-3.5 h-3.5 text-blue-600" />
              <span>Academic &amp; Engineering Milestones</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Professional Achievements
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Verified accomplishments earned through continuous focus hours, algorithmic practice, documented projects, and academic rigor.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/student-home"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Command Center
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Overview Stats Shelf */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              PROGRESSION LEVEL
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {unlockedCount} of {totalCount} Milestones Unlocked
            </h2>
            <p className="text-xs text-slate-500">
              {completionPercent}% of career and academic milestones verified by evidence.
            </p>
          </div>

          <div className="w-full md:w-72 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Overall Completion</span>
              <span className="font-mono text-blue-600 font-bold">{completionPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Badges Grid */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
            <span className="text-sm">Auditing achievement verifications...</span>
          </div>
        ) : filteredAchievements.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 bg-white p-8">
            <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800">No achievements in this category yet.</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAchievements.map((item, idx) => {
              const isUnlocked = Boolean(item.unlocked_at);
              const progressPct = Math.min(100, Math.round((item.progress / item.target) * 100));

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`rounded-2xl border p-5 transition-all flex flex-col justify-between space-y-4 ${
                    isUnlocked
                      ? "bg-white border-blue-200/90 shadow-2xs hover:shadow-xs hover:border-blue-300"
                      : "bg-white border-slate-200/70 shadow-2xs opacity-80"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Icon & Tag */}
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                          isUnlocked
                            ? "bg-blue-50 border-blue-100 shadow-2xs"
                            : "bg-slate-50 border-slate-200 text-slate-400"
                        }`}
                      >
                        {renderBadgeIcon(item.icon, isUnlocked)}
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                          {item.category}
                        </span>
                        {isUnlocked ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Unlocked</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>In Progress</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar & Footer */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-500">Milestone Progress</span>
                      <span className="font-mono text-slate-800">
                        {item.progress} / {item.target}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isUnlocked
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                            : "bg-slate-300"
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    {isUnlocked && item.unlocked_at && (
                      <span className="text-[10px] text-slate-400 block pt-0.5">
                        Achieved on {new Date(item.unlocked_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
