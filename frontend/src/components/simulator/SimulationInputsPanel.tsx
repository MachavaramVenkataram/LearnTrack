"use client";

import React from "react";
import {
  Sliders,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Info,
  Clock,
  Award,
  CalendarCheck,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PredictionFeatureInput } from "@/types/academic";
import { cn } from "@/lib/utils";

export interface SimulationInputsPanelProps {
  baseline: PredictionFeatureInput;
  simulated: PredictionFeatureInput;
  onSliderChange: (field: keyof PredictionFeatureInput, val: number) => void;
  onInputChange: (field: keyof PredictionFeatureInput, valStr: string, maxVal: number) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
  hasChanged: boolean;
}

export function SimulationInputsPanel({
  baseline,
  simulated,
  onSliderChange,
  onInputChange,
  onRunSimulation,
  isSimulating,
  hasChanged,
}: SimulationInputsPanelProps) {
  // Compute user-modified differences for "What Changed?" summary panel
  const changedList = React.useMemo(() => {
    const list: Array<{ label: string; changeText: string; isPositive: boolean }> = [];

    const attDiff = +(simulated.attendance_percentage - baseline.attendance_percentage).toFixed(1);
    if (attDiff !== 0) {
      list.push({
        label: "Attendance Rate",
        changeText: `${attDiff > 0 ? `+${attDiff}` : attDiff}%`,
        isPositive: attDiff > 0,
      });
    }

    const studyDiff = +(simulated.study_hours - baseline.study_hours).toFixed(1);
    if (studyDiff !== 0) {
      list.push({
        label: "Study Time",
        changeText: `${studyDiff > 0 ? `+${studyDiff}` : studyDiff}h/wk`,
        isPositive: studyDiff > 0,
      });
    }

    const intDiff = +(simulated.internal_marks - baseline.internal_marks).toFixed(1);
    if (intDiff !== 0) {
      list.push({
        label: "Internal Assessment",
        changeText: `${intDiff > 0 ? `+${intDiff}` : intDiff} pts`,
        isPositive: intDiff > 0,
      });
    }

    const assignDiff = +(simulated.assignment_score - baseline.assignment_score).toFixed(1);
    if (assignDiff !== 0) {
      list.push({
        label: "Assignment Score",
        changeText: `${assignDiff > 0 ? `+${assignDiff}` : assignDiff} pts`,
        isPositive: assignDiff > 0,
      });
    }

    const prevDiff = +(simulated.previous_score - baseline.previous_score).toFixed(1);
    if (prevDiff !== 0) {
      list.push({
        label: "Previous Term",
        changeText: `${prevDiff > 0 ? `+${prevDiff}` : prevDiff} pts`,
        isPositive: prevDiff > 0,
      });
    }

    const compDiff = simulated.assignments_completed - baseline.assignments_completed;
    if (compDiff !== 0) {
      list.push({
        label: "Completed Tasks",
        changeText: `${compDiff > 0 ? `+${compDiff}` : compDiff} tasks`,
        isPositive: compDiff > 0,
      });
    }

    return list;
  }, [baseline, simulated]);

  return (
    <Card className="rounded-2xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
      <CardHeader className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <CardTitle className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Sliders className="w-3.5 h-3.5" />
            </span>
            Simulation Inputs
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 mt-0.5">
            Adjust academic variables to explore hypothetical outcomes.
          </CardDescription>
        </div>

        <Badge
          variant={hasChanged ? "warning" : "secondary"}
          size="sm"
          className="shrink-0"
        >
          {hasChanged ? "Unsimulated Changes" : "Synchronized with Output"}
        </Badge>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* 1. Course Attendance */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <label htmlFor="attendance-slider" className="font-bold text-slate-800">
                Course Attendance
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Baseline: {baseline.attendance_percentage}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              {simulated.attendance_percentage !== baseline.attendance_percentage && (
                <span
                  className={cn(
                    "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                    simulated.attendance_percentage > baseline.attendance_percentage
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  )}
                >
                  {simulated.attendance_percentage > baseline.attendance_percentage ? "+" : ""}
                  {(simulated.attendance_percentage - baseline.attendance_percentage).toFixed(1)}%
                </span>
              )}
              <div className="flex items-center">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  aria-label="Course Attendance Percentage"
                  value={simulated.attendance_percentage}
                  onChange={(e) => onInputChange("attendance_percentage", e.target.value, 100)}
                  className="w-16 h-7 px-2 text-right font-mono text-xs font-bold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                />
                <span className="text-xs font-bold text-slate-500 ml-1.5">%</span>
              </div>
            </div>
          </div>

          <input
            id="attendance-slider"
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={simulated.attendance_percentage}
            onChange={(e) => onSliderChange("attendance_percentage", parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0%</span>
            <span className="text-amber-600 font-semibold">75% Institutional Threshold</span>
            <span>100%</span>
          </div>
        </div>

        {/* 2. Weekly Study Hours */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <label htmlFor="study-slider" className="font-bold text-slate-800">
                Weekly Study Hours
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Baseline: {baseline.study_hours}h
              </span>
            </div>

            <div className="flex items-center gap-2">
              {simulated.study_hours !== baseline.study_hours && (
                <span
                  className={cn(
                    "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                    simulated.study_hours > baseline.study_hours
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  )}
                >
                  {simulated.study_hours > baseline.study_hours ? "+" : ""}
                  {(simulated.study_hours - baseline.study_hours).toFixed(1)}h
                </span>
              )}
              <div className="flex items-center">
                <input
                  type="number"
                  min={0}
                  max={60}
                  step={0.5}
                  aria-label="Weekly Study Hours"
                  value={simulated.study_hours}
                  onChange={(e) => onInputChange("study_hours", e.target.value, 60)}
                  className="w-16 h-7 px-2 text-right font-mono text-xs font-bold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                />
                <span className="text-xs font-bold text-slate-500 ml-1.5">h/wk</span>
              </div>
            </div>
          </div>

          <input
            id="study-slider"
            type="range"
            min={0}
            max={60}
            step={0.5}
            value={simulated.study_hours}
            onChange={(e) => onSliderChange("study_hours", parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0 hrs</span>
            <span className="text-slate-500 font-medium">12–16 hrs/wk Target Pacing</span>
            <span>60 hrs</span>
          </div>
        </div>

        {/* 3. Internal Assessment Marks */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <label htmlFor="internal-slider" className="font-bold text-slate-800">
                Internal Assessment Marks
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Baseline: {baseline.internal_marks} pts
              </span>
            </div>

            <div className="flex items-center gap-2">
              {simulated.internal_marks !== baseline.internal_marks && (
                <span
                  className={cn(
                    "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                    simulated.internal_marks > baseline.internal_marks
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  )}
                >
                  {simulated.internal_marks > baseline.internal_marks ? "+" : ""}
                  {(simulated.internal_marks - baseline.internal_marks).toFixed(1)}
                </span>
              )}
              <div className="flex items-center">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  aria-label="Internal Assessment Marks"
                  value={simulated.internal_marks}
                  onChange={(e) => onInputChange("internal_marks", e.target.value, 100)}
                  className="w-16 h-7 px-2 text-right font-mono text-xs font-bold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                />
                <span className="text-xs font-bold text-slate-500 ml-1.5">pts</span>
              </div>
            </div>
          </div>

          <input
            id="internal-slider"
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={simulated.internal_marks}
            onChange={(e) => onSliderChange("internal_marks", parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* 4. Assignment Score Average */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <label htmlFor="assignment-slider" className="font-bold text-slate-800">
                Assignment Score Average
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Baseline: {baseline.assignment_score} pts
              </span>
            </div>

            <div className="flex items-center gap-2">
              {simulated.assignment_score !== baseline.assignment_score && (
                <span
                  className={cn(
                    "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                    simulated.assignment_score > baseline.assignment_score
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  )}
                >
                  {simulated.assignment_score > baseline.assignment_score ? "+" : ""}
                  {(simulated.assignment_score - baseline.assignment_score).toFixed(1)}
                </span>
              )}
              <div className="flex items-center">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  aria-label="Assignment Score Average"
                  value={simulated.assignment_score}
                  onChange={(e) => onInputChange("assignment_score", e.target.value, 100)}
                  className="w-16 h-7 px-2 text-right font-mono text-xs font-bold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                />
                <span className="text-xs font-bold text-slate-500 ml-1.5">pts</span>
              </div>
            </div>
          </div>

          <input
            id="assignment-slider"
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={simulated.assignment_score}
            onChange={(e) => onSliderChange("assignment_score", parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* 5. Previous Term Score */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <label htmlFor="prev-slider" className="font-bold text-slate-800">
                Previous Term Score
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Baseline: {baseline.previous_score} pts
              </span>
            </div>

            <div className="flex items-center gap-2">
              {simulated.previous_score !== baseline.previous_score && (
                <span
                  className={cn(
                    "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                    simulated.previous_score > baseline.previous_score
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  )}
                >
                  {simulated.previous_score > baseline.previous_score ? "+" : ""}
                  {(simulated.previous_score - baseline.previous_score).toFixed(1)}
                </span>
              )}
              <div className="flex items-center">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  aria-label="Previous Term Score"
                  value={simulated.previous_score}
                  onChange={(e) => onInputChange("previous_score", e.target.value, 100)}
                  className="w-16 h-7 px-2 text-right font-mono text-xs font-bold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                />
                <span className="text-xs font-bold text-slate-500 ml-1.5">pts</span>
              </div>
            </div>
          </div>

          <input
            id="prev-slider"
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={simulated.previous_score}
            onChange={(e) => onSliderChange("previous_score", parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* 6. Completed Assignments Count */}
        <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <label htmlFor="completed-slider" className="font-bold text-slate-800">
                Completed Assignments
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                Baseline: {baseline.assignments_completed} tasks
              </span>
            </div>

            <div className="flex items-center gap-2">
              {simulated.assignments_completed !== baseline.assignments_completed && (
                <span
                  className={cn(
                    "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                    simulated.assignments_completed > baseline.assignments_completed
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  )}
                >
                  {simulated.assignments_completed > baseline.assignments_completed ? "+" : ""}
                  {simulated.assignments_completed - baseline.assignments_completed}
                </span>
              )}
              <div className="flex items-center">
                <input
                  type="number"
                  min={0}
                  max={15}
                  step={1}
                  aria-label="Completed Assignments Count"
                  value={simulated.assignments_completed}
                  onChange={(e) => onInputChange("assignments_completed", e.target.value, 15)}
                  className="w-16 h-7 px-2 text-right font-mono text-xs font-bold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
                />
                <span className="text-xs font-bold text-slate-500 ml-1.5">tasks</span>
              </div>
            </div>
          </div>

          <input
            id="completed-slider"
            type="range"
            min={0}
            max={15}
            step={1}
            value={simulated.assignments_completed}
            onChange={(e) => onSliderChange("assignments_completed", parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0</span>
            <span>8</span>
            <span>15</span>
          </div>
        </div>

        {/* "What Changed?" Summary Panel (Section 20) */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">
              What Changed? ({changedList.length})
            </span>
            <span className="text-[10px] text-slate-400">Selected Hypothetical Differences</span>
          </div>

          {changedList.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic">
              No parameters modified from baseline. Adjust any slider above to model trajectory changes.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {changedList.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 shadow-2xs text-slate-800"
                >
                  <span
                    className={cn(
                      "font-mono font-bold text-[11px]",
                      c.isPositive ? "text-emerald-600" : "text-rose-600"
                    )}
                  >
                    {c.changeText}
                  </span>
                  <span>{c.label}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Primary Simulation CTA Button (Section 10) */}
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full h-12 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            onClick={onRunSimulation}
            isLoading={isSimulating}
            leftIcon={<Sparkles className="w-4 h-4 text-white" />}
          >
            {isSimulating ? "Running simulation..." : "Run Simulation"}
          </Button>
          <p className="text-[11px] text-center text-slate-400 mt-2">
            Invokes the trained Ridge regression pipeline to estimate hypothetical trajectory outcome.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
