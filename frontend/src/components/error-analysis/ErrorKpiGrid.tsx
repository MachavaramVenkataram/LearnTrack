"use client";

import React from "react";
import { Layers, Database, BarChart2, TrendingUp, Info } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { ErrorAnalysisReport } from "@/lib/api/mlOps";

export interface ErrorKpiGridProps {
  report: ErrorAnalysisReport | null;
  evaluationType: "BENCHMARK" | "PRODUCTION";
}

export function ErrorKpiGrid({ report, evaluationType }: ErrorKpiGridProps) {
  const isProduction = evaluationType === "PRODUCTION";

  const cards = [
    {
      id: "observations",
      label: isProduction ? "PRODUCTION PREDICTIONS" : "TEST SET OBSERVATIONS",
      value: report?.sample_count?.toLocaleString() || "0",
      description: isProduction ? "Live inference feedback" : "Held-out independent partition",
      icon: Layers,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50 group-hover:bg-blue-100/80",
      tooltip: isProduction
        ? "Total student predictions evaluated with verified feedback from production."
        : "Total held-out test split observations used to validate generalization error.",
    },
    {
      id: "outcomes",
      label: "EVALUATED OUTCOMES",
      value: report?.metrics?.sample_count?.toLocaleString() ?? "0",
      description: "Pairs with known actual result",
      icon: Database,
      iconColor: "text-indigo-600",
      iconBg: "bg-indigo-50 group-hover:bg-indigo-100/80",
      tooltip: "Ground-truth student outcome pairs available to calculate error metrics.",
    },
    {
      id: "mae",
      label: "CURRENT MAE",
      value:
        report?.metrics?.mae !== null && report?.metrics?.mae !== undefined
          ? `${report.metrics.mae} pts`
          : "N/A",
      description: "Mean absolute error (0–100 scale)",
      icon: BarChart2,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-50 group-hover:bg-amber-100/80",
      tooltip:
        "Mean Absolute Error measures average prediction error magnitude across all evaluated students without direction.",
    },
    {
      id: "rmse",
      label: "CURRENT RMSE",
      value:
        report?.metrics?.rmse !== null && report?.metrics?.rmse !== undefined
          ? `${report.metrics.rmse} pts`
          : "N/A",
      description:
        report?.metrics?.r2 !== null && report?.metrics?.r2 !== undefined
          ? `R² = ${report.metrics.r2} · Explained variance`
          : "Root mean squared error",
      icon: TrendingUp,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50 group-hover:bg-emerald-100/80",
      tooltip:
        "Root Mean Squared Error penalizes larger errors disproportionately, indicating standard deviation of residuals.",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className="group relative bg-white border border-[#E2E8F0] hover:border-blue-300 rounded-[14px] p-5 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-180 ease-out flex flex-col justify-between"
          >
            {/* Top row: Label + Info Tooltip + Icon */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
                  {card.label}
                </span>
                <Tooltip content={card.tooltip} position="top">
                  <span className="cursor-help text-slate-400 hover:text-slate-600 inline-flex items-center">
                    <Info className="w-3.5 h-3.5" />
                  </span>
                </Tooltip>
              </div>

              <div
                className={`w-9 h-9 rounded-xl ${card.iconBg} ${card.iconColor} flex items-center justify-center shrink-0 transition-colors duration-180`}
              >
                <IconComponent className="w-4.5 h-4.5" />
              </div>
            </div>

            {/* Metric Value */}
            <div className="mt-3">
              <div className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900 font-mono">
                {card.value}
              </div>
              <p className="text-xs text-slate-500 mt-1 font-normal truncate">
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
