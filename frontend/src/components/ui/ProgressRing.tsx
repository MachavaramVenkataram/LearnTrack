import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  variant?: "primary" | "success" | "warning" | "danger" | "dynamic";
  className?: string;
  children?: React.ReactNode;
}

export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 7,
  variant = "primary",
  className,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(100, Math.max(0, value));
  const offset = circumference - (clampedValue / 100) * circumference;

  const getDynamicStroke = (val: number) => {
    if (val >= 80) return "text-emerald-500";
    if (val >= 65) return "text-blue-600";
    if (val >= 50) return "text-amber-500";
    return "text-rose-500";
  };

  const strokeColor =
    variant === "dynamic"
      ? getDynamicStroke(clampedValue)
      : variant === "success"
      ? "text-emerald-500"
      : variant === "warning"
      ? "text-amber-500"
      : variant === "danger"
      ? "text-rose-500"
      : "text-blue-600";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="text-slate-100"
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-700 ease-out", strokeColor)}
          stroke="currentColor"
          fill="transparent"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}
