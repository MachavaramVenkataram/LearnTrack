"use client";

import React from "react";
import { Sliders, Sparkles, BarChart2, GitFork, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PredictionWorkflowProgressProps {
  currentStage: "input" | "analyzing" | "explained" | "explore";
}

export function PredictionWorkflowProgress({ currentStage }: PredictionWorkflowProgressProps) {
  const steps = [
    {
      id: "input",
      num: "01",
      name: "INPUT",
      desc: "Academic signals",
      icon: Sliders,
    },
    {
      id: "analyzing",
      num: "02",
      name: "ANALYZE",
      desc: "ML regression",
      icon: Sparkles,
    },
    {
      id: "explained",
      num: "03",
      name: "EXPLAIN",
      desc: "SHAP attribution",
      icon: BarChart2,
    },
    {
      id: "explore",
      num: "04",
      name: "EXPLORE",
      desc: "What-If simulation",
      icon: GitFork,
    },
  ] as const;

  const getStepStatus = (stepId: string) => {
    const order = ["input", "analyzing", "explained", "explore"];
    const currentIndex = order.indexOf(currentStage);
    const stepIndex = order.indexOf(stepId);

    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-xl px-3 sm:px-4 py-2.5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          <span>ML Pipeline</span>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-1.5 flex-1 max-w-3xl justify-between">
          {steps.map((step, idx) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <div
                  className={cn(
                    "flex items-center gap-2 px-2 py-1 rounded-lg transition-colors text-left",
                    status === "current" && "bg-blue-50/80 text-blue-900 border border-blue-100",
                    status === "completed" && "text-slate-800",
                    status === "upcoming" && "text-slate-400"
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold font-mono",
                      status === "current" && "bg-blue-600 text-white",
                      status === "completed" && "bg-slate-200 text-slate-700",
                      status === "upcoming" && "bg-slate-100 text-slate-400"
                    )}
                  >
                    {step.num}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-bold tracking-tight uppercase leading-none">
                        {step.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal truncate block leading-tight mt-0.5">
                      {step.desc}
                    </span>
                  </div>
                </div>

                {idx < steps.length - 1 && (
                  <ArrowRight className="hidden sm:block w-3 h-3 text-slate-300 shrink-0 mx-0.5" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
