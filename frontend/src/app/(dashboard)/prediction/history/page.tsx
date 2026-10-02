"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  History,
  ArrowLeft,
  Calendar,
  Sparkles,
  Trash2,
  TrendingUp,
  ArrowUpDown,
  ShieldCheck,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { getPredictionHistory, deletePredictionRecord } from "@/lib/academic/service";
import { PerformancePrediction } from "@/types/academic";

export default function PredictionHistoryPage() {
  const { studentProfile } = useAuth();
  const { showToast } = useToast();

  const [predictions, setPredictions] = useState<PerformancePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  useEffect(() => {
    loadHistory();
  }, [studentProfile?.id]);

  const loadHistory = async () => {
    if (!studentProfile?.id) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const records = await getPredictionHistory(studentProfile.id);
      setPredictions(records);
    } catch (err) {
      console.error("Error loading prediction history:", err);
      showToast("Error", "Failed to load prediction history.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this prediction record?")) return;
    const ok = await deletePredictionRecord(id);
    if (ok) {
      setPredictions((prev) => prev.filter((p) => p.id !== id));
      showToast("Deleted", "Prediction record removed.", "success");
    } else {
      showToast("Error", "Could not delete record.", "error");
    }
  };

  const sortedPredictions = [...predictions].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sortOrder === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    if (sortOrder === "highest") {
      return b.predicted_score - a.predicted_score;
    }
    if (sortOrder === "lowest") {
      return a.predicted_score - b.predicted_score;
    }
    return 0;
  });

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "Low":
        return <Badge variant="success">Low Risk</Badge>;
      case "Medium":
        return <Badge variant="warning">Medium Risk</Badge>;
      case "High":
        return <Badge variant="danger">High Risk</Badge>;
      default:
        return <Badge variant="secondary">{risk}</Badge>;
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (grade.startsWith("B")) return "text-blue-700 bg-blue-50 border-blue-200";
    if (grade.startsWith("C")) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-rose-700 bg-rose-50 border-rose-200";
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/prediction"
              className="text-xs font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Predictor
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Prediction History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Chronological record of ML performance evaluations generated for your profile.
          </p>
        </div>

        {/* Sort Controls */}
        {predictions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Sort by:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="newest">Date (Newest First)</option>
              <option value="oldest">Date (Oldest First)</option>
              <option value="highest">Score (Highest First)</option>
              <option value="lowest">Score (Lowest First)</option>
            </select>
          </div>
        )}
      </div>

      {isLoading ? (
        <Card className="border border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-sm text-slate-500">Loading prediction history...</p>
        </Card>
      ) : sortedPredictions.length === 0 ? (
        /* Empty State */
        <Card className="border border-dashed border-slate-300 rounded-2xl bg-white p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <History className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Performance Predictions Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
            Generate your first performance prediction to start tracking historical projections and model versions over time.
          </p>
          <div className="mt-6">
            <Link href="/prediction">
              <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
                Analyze Performance
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        /* History Table */
        <Card className="border border-slate-200/80 shadow-sm rounded-2xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Date & Time</th>
                  <th className="px-5 py-3.5">Estimated Score</th>
                  <th className="px-5 py-3.5">Grade</th>
                  <th className="px-5 py-3.5">Risk Tier</th>
                  <th className="px-5 py-3.5">Model Version</th>
                  <th className="px-5 py-3.5">Feature Parameters</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedPredictions.map((record) => {
                  const dateStr = new Date(record.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{dateStr}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900 text-sm whitespace-nowrap">
                        {record.predicted_score}%
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`font-black px-2.5 py-0.5 rounded-lg border text-xs ${getGradeColor(
                            record.predicted_grade
                          )}`}
                        >
                          {record.predicted_grade}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {getRiskBadge(record.risk_level)}
                      </td>
                      <td className="px-5 py-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {record.model_version}
                      </td>
                      <td className="px-5 py-4 text-slate-600 max-w-xs truncate">
                        {record.features ? (
                          <span className="text-[11px] text-slate-500">
                            Att: {record.features.attendance_percentage}% • Int: {record.features.internal_marks} • Prev: {record.features.previous_score}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
