"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type PremiumActionVariant = "secondary" | "intelligence" | "primary";

export interface PremiumActionButtonProps {
  label: string;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: PremiumActionVariant;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  showArrow?: boolean;
  className?: string;
  target?: string;
  rel?: string;
  ariaLabel?: string;
}

export function PremiumActionButton({
  label,
  subtitle,
  icon,
  variant = "secondary",
  href,
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  showArrow = true,
  className,
  target,
  rel,
  ariaLabel,
}: PremiumActionButtonProps) {
  // Styles based on variant
  const variantStyles = {
    secondary: {
      button:
        "bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300 text-slate-700 hover:text-slate-900 shadow-2xs hover:shadow-xs",
      iconBox:
        "bg-blue-50 border border-blue-100/80 text-blue-600 group-hover:-translate-y-0.5 transition-transform duration-160 ease-out",
      arrow: "text-slate-400 group-hover:text-blue-600",
    },
    intelligence: {
      button:
        "bg-white hover:bg-slate-50/90 border-slate-200/90 hover:border-slate-300 text-slate-800 hover:text-slate-950 shadow-2xs hover:shadow-xs",
      iconBox:
        "bg-indigo-50 border border-indigo-100/80 text-indigo-600 group-hover:translate-x-0.5 transition-transform duration-160 ease-out",
      arrow: "text-slate-400 group-hover:text-indigo-600",
    },
    primary: {
      button:
        "bg-blue-600 hover:bg-blue-700 border-blue-600 text-white shadow-xs hover:shadow-sm",
      iconBox:
        "bg-blue-700/60 border border-blue-400/40 text-white transition-transform duration-160 ease-out",
      arrow: "text-blue-100 group-hover:text-white",
    },
  }[variant];

  const content = (
    <>
      {/* 28px x 28px Soft Icon Container (Requirements #4, #9, #12) */}
      {icon && (
        <span
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm",
            variantStyles.iconBox
          )}
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : icon}
        </span>
      )}

      {/* Label & Optional Micro-Subtitle (Requirements #5, #10, #13) */}
      <span className="flex flex-col text-left justify-center min-w-0 pr-1">
        <span className="text-[13px] font-medium tracking-tight whitespace-nowrap leading-tight">
          {label}
        </span>
        {subtitle && (
          <span className="text-[10.5px] text-slate-500 font-normal leading-tight truncate">
            {subtitle}
          </span>
        )}
      </span>

      {/* Horizontally Aligned Arrow (Requirements #3, #14) */}
      {showArrow && (
        <span className="ml-auto pl-1 flex items-center shrink-0">
          <ArrowRight
            className={cn(
              "w-3.5 h-3.5 transition-all duration-160 ease-out group-hover:translate-x-0.5",
              variantStyles.arrow
            )}
          />
        </span>
      )}
    </>
  );

  const sharedClasses = cn(
    "group inline-flex items-center gap-2.5 h-[42px] px-3 rounded-[11px] border text-left",
    "transition-all duration-160 ease-out cursor-pointer select-none",
    "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-blue-400/60 focus-visible:ring-offset-2",
    disabled ? "opacity-55 cursor-not-allowed pointer-events-none" : "hover:-translate-y-0.5 active:scale-[0.98]",
    fullWidth ? "w-full" : "w-fit",
    variantStyles.button,
    className
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={sharedClasses}
        target={target}
        rel={rel}
        aria-label={ariaLabel || label}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={sharedClasses}
      aria-label={ariaLabel || label}
    >
      {content}
    </button>
  );
}
