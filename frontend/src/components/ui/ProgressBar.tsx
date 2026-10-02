import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "success" | "warning" | "danger" | "dynamic";
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = "md",
  variant = "primary",
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  const getDynamicColor = (pct: number) => {
    if (pct >= 80) return "bg-emerald-500";
    if (pct >= 65) return "bg-blue-600";
    if (pct >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  const variantClasses = {
    primary: "bg-blue-600",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    dynamic: getDynamicColor(percentage),
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5 font-medium">
          <span>Progress</span>
          <span className="text-slate-900 font-semibold">{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className={cn("w-full bg-slate-100 rounded-full overflow-hidden", sizeClasses[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", variantClasses[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
