"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";

export interface StatCardProps {
  title: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  trendText?: string;
  trend?: "up" | "down" | "flat" | "stable";
  icon?: React.ReactNode;
  iconBg?: string;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  delta,
  deltaLabel = "vs last sem",
  trendText,
  trend = "stable",
  icon,
  iconBg = "bg-blue-50 text-blue-600",
  subtitle,
  className,
  onClick,
}: StatCardProps) {
  const isPositive = trend === "up";
  const isNegative = trend === "down";

  // Check if value has a suffix like "%" or "h"
  const stringValue = String(value);
  const matchSuffix = stringValue.match(/([0-9.]+)([a-zA-Z%]+)?/);
  const numPart = matchSuffix ? matchSuffix[1] : stringValue;
  const suffixPart = matchSuffix && matchSuffix[2] ? matchSuffix[2] : "";
  const isNumeric = !isNaN(parseFloat(numPart)) && stringValue !== "—";

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 group cursor-default relative overflow-hidden",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 tracking-wider uppercase font-sans">
          {title}
        </span>
        {icon && (
          <div
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-200 shrink-0",
              iconBg
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          {isNumeric ? (
            <AnimatedCounter value={numPart} suffix={suffixPart} />
          ) : (
            value
          )}
        </span>
      </div>

      <div className="flex flex-col gap-1 pt-2 border-t border-slate-100 text-xs">
        {trendText ? (
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold",
                isPositive && "bg-emerald-50 text-emerald-700",
                isNegative && "bg-rose-50 text-rose-700",
                !isPositive && !isNegative && "bg-slate-100 text-slate-600"
              )}
            >
              {isPositive && <TrendingUp className="w-3 h-3 shrink-0" />}
              {isNegative && <TrendingDown className="w-3 h-3 shrink-0" />}
              {!isPositive && !isNegative && <Minus className="w-3 h-3 shrink-0" />}
              {trendText}
            </span>
          </div>
        ) : delta !== undefined ? (
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-semibold",
                isPositive && "bg-emerald-50 text-emerald-700",
                isNegative && "bg-rose-50 text-rose-700",
                !isPositive && !isNegative && "bg-slate-100 text-slate-600"
              )}
            >
              {isPositive && <TrendingUp className="w-3 h-3" />}
              {isNegative && <TrendingDown className="w-3 h-3" />}
              {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
              {delta > 0 ? `+${delta}%` : `${delta}%`}
            </span>
            <span className="text-slate-400 text-[11px]">{deltaLabel}</span>
          </div>
        ) : null}

        {subtitle && (
          <span className="text-slate-500 text-[11px] truncate leading-relaxed">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
