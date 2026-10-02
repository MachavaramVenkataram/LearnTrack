"use client";

import React from "react";
import Link from "next/link";
import {
  Database,
  Cpu,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Send,
  Layers,
} from "lucide-react";

export interface ModelLifecyclePipelineProps {
  currentStage?: "candidate" | "production";
}

export function ModelLifecyclePipeline({ currentStage = "candidate" }: ModelLifecyclePipelineProps) {
  const stages = [
    {
      id: "dataset",
      name: "Dataset",
      description: "Validation on v1.0.0 (1,044 samples)",
      icon: Database,
      href: "/data-quality",
      status: "completed",
    },
    {
      id: "train",
      name: "Train",
      description: "Ridge regression parameter tuning",
      icon: Cpu,
      status: "completed",
    },
    {
      id: "validate",
      name: "Validate",
      description: "5-Fold CV + benchmark metrics",
      icon: CheckCircle2,
      href: "/admin/model",
      status: "completed",
    },
    {
      id: "regression",
      name: "Regression Check",
      description: "Max 5% allowable delta verification",
      icon: ShieldAlert,
      status: "completed",
    },
    {
      id: "candidate",
      name: "Candidate",
      description: "Held in registry awaiting verification",
      icon: Sparkles,
      status: "active",
    },
    {
      id: "promotion",
      name: "Promotion",
      description: "Explicit administrator promotion gate",
      icon: Send,
      status: "pending",
    },
    {
      id: "production",
      name: "Production",
      description: "Live inference serving champion model",
      icon: Layers,
      href: "/ml-monitoring",
      status: "active",
    },
  ];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Pipeline Architecture
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-xs font-semibold text-slate-700">
            Controlled Model Lifecycle Flow
          </span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline-block">
          Clickable nodes link to corresponding workspaces
        </span>
      </div>

      {/* Nodes Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isNodeActive = stage.id === currentStage || stage.id === "production";
          const isCompleted = stage.status === "completed" && stage.id !== currentStage;

          const content = (
            <div
              className={`p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between h-full relative group ${
                isNodeActive
                  ? "bg-blue-50/70 border-blue-200 text-blue-900 shadow-2xs"
                  : isCompleted
                  ? "bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/60 text-slate-800"
                  : "bg-white border-slate-200 text-slate-600 opacity-80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                    isNodeActive
                      ? "bg-blue-600 text-white"
                      : isCompleted
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  0{idx + 1}
                </span>
              </div>

              <div className="mt-2.5">
                <p className="text-xs font-bold tracking-tight text-slate-900 flex items-center gap-1">
                  <span>{stage.name}</span>
                  {stage.href && (
                    <ArrowRight className="w-2.5 h-2.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                  {stage.description}
                </p>
              </div>

              {/* Status indicator dot */}
              <div className="mt-2 pt-1 border-t border-slate-100/80 flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider">
                {isNodeActive ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                    <span className="text-blue-700 font-bold">Active</span>
                  </>
                ) : isCompleted ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-emerald-700">Verified</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="text-slate-400">Gated</span>
                  </>
                )}
              </div>
            </div>
          );

          return stage.href ? (
            <Link key={stage.id} href={stage.href} className="block cursor-pointer">
              {content}
            </Link>
          ) : (
            <div key={stage.id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
