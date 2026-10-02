"use client";

import React, { useState } from "react";
import {
  Send,
  CheckCircle2,
  Info,
  Sparkles,
  HelpCircle,
  FileCheck,
} from "lucide-react";
import { PredictionLogItem, submitPredictionFeedback } from "@/lib/api/mlOps";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export interface VerifyPredictionCardProps {
  recentPredictions: PredictionLogItem[];
  onFeedbackRecorded: () => void;
}

export function VerifyPredictionCard({
  recentPredictions,
  onFeedbackRecorded,
}: VerifyPredictionCardProps) {
  const { showToast } = useToast();

  const [selectedPredictionId, setSelectedPredictionId] = useState<string>("");
  const [actualScoreInput, setActualScoreInput] = useState<string>("");
  const [feedbackNotes, setFeedbackNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccessRecorded, setIsSuccessRecorded] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPredictionId || !actualScoreInput) return;

    const numScore = parseFloat(actualScoreInput);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      showToast("Invalid Score", "Actual score must be a number between 0.0 and 100.0.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitPredictionFeedback({
        prediction_id: selectedPredictionId,
        actual_score: numScore,
        notes: feedbackNotes.trim() || undefined,
      });

      setIsSuccessRecorded(true);
      showToast(
        "✓ Ground truth recorded",
        `Exam result logged. Prediction error: ${result.error > 0 ? "+" : ""}${result.error.toFixed(2)} pts.`,
        "success"
      );
      setSelectedPredictionId("");
      setActualScoreInput("");
      setFeedbackNotes("");
      onFeedbackRecorded();

      setTimeout(() => {
        setIsSuccessRecorded(false);
      }, 2500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to record feedback.";
      showToast("Unable to record feedback", message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Send className="w-3.5 h-3.5" />
          </span>
          <div>
            <CardTitle className="text-base font-bold text-slate-900 tracking-tight">
              VERIFY A PREDICTION
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Record verified exam outcomes to measure empirical model accuracy.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Transparent educational callout */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Verified outcomes improve LearnTrack&apos;s ability to measure real-world model performance and calibrate drift alerts.
            Ground-truth feedback evaluates prediction error without altering or automatically deploying new model weights.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Target Prediction selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Target Prediction <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedPredictionId}
                onChange={(e) => setSelectedPredictionId(e.target.value)}
                required
                className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">Select a recent student prediction...</option>
                {recentPredictions.map((p) => (
                  <option key={p.prediction_id} value={p.prediction_id}>
                    {p.prediction_id.slice(0, 8)}... — Est: {p.prediction.toFixed(1)} pts (
                    {new Date(p.timestamp).toLocaleTimeString()})
                    {p.has_feedback ? " [Verified]" : ""}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                {recentPredictions.length === 0
                  ? "No recent predictions available in memory log."
                  : `${recentPredictions.length} recent inference runs available.`}
              </p>
            </div>

            {/* Actual Exam Score input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Actual Verified Exam Score (0.0 – 100.0) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={actualScoreInput}
                onChange={(e) => setActualScoreInput(e.target.value)}
                placeholder="e.g. 78.5"
                required
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400">
                Official marks verified by student transcript or grade sheet.
              </p>
            </div>
          </div>

          {/* Optional context notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Optional Context / Evaluation Notes
            </label>
            <input
              type="text"
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              placeholder="e.g. End-semester comprehensive examination score verified by academic advisor"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Submit action (Section 5) */}
          <div className="flex items-center justify-end pt-2">
            <Button
              type="submit"
              size="lg"
              variant="primary"
              disabled={isSubmitting || !selectedPredictionId || !actualScoreInput}
              isLoading={isSubmitting}
              loadingText="Submitting…"
              isSuccess={isSuccessRecorded}
              successText="✓ Ground Truth Recorded"
              leftIcon={
                <Send className="w-4 h-4 text-white transition-transform duration-180 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              }
              className="h-11 px-5 rounded-[11px] text-[13px] font-semibold w-full sm:w-auto"
            >
              Submit Ground Truth
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
