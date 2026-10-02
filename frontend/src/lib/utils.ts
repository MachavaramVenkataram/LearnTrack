import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercentage(val: number, decimals: number = 1): string {
  return `${val.toFixed(decimals)}%`;
}

export function formatScore(val: number, decimals: number = 1): string {
  return val.toFixed(decimals);
}

export function getRiskBadgeVariant(risk: string): {
  color: string;
  bg: string;
  border: string;
  label: string;
} {
  switch (risk?.toLowerCase()) {
    case "low risk":
    case "low":
      return {
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        label: "Low Risk",
      };
    case "medium risk":
    case "medium":
      return {
        color: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
        label: "Medium Risk",
      };
    case "high risk":
    case "high":
    default:
      return {
        color: "text-rose-700",
        bg: "bg-rose-50",
        border: "border-rose-200",
        label: "High Risk",
      };
  }
}

export function getGradeBadgeVariant(grade: string): {
  color: string;
  bg: string;
  border: string;
} {
  switch (grade?.toUpperCase()) {
    case "A+":
    case "A":
      return {
        color: "text-blue-700",
        bg: "bg-blue-50",
        border: "border-blue-200",
      };
    case "B+":
    case "B":
      return {
        color: "text-indigo-700",
        bg: "bg-indigo-50",
        border: "border-indigo-200",
      };
    case "C":
      return {
        color: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
      };
    default:
      return {
        color: "text-rose-700",
        bg: "bg-rose-50",
        border: "border-rose-200",
      };
  }
}
