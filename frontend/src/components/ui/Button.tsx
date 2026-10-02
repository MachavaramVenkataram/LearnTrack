"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2, Check } from "lucide-react";
import { Tooltip } from "./Tooltip";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "secondary-blue"
    | "outline"
    | "ghost"
    | "subtle"
    | "tertiary"
    | "danger"
    | "destructive";
  size?: "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm";
  isLoading?: boolean;
  loadingText?: string;
  isSuccess?: boolean;
  successText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  tooltip?: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingText,
      isSuccess = false,
      successText,
      leftIcon,
      rightIcon,
      tooltip,
      tooltipPosition = "top",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "group inline-flex items-center justify-center font-medium transition-all duration-180 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none disabled:shadow-none cursor-pointer select-none active:scale-[0.98] active:translate-y-0";

    const sizeStyles = {
      xs: "text-[11px] px-2.5 h-7 gap-1 rounded-lg font-medium",
      sm: "text-xs px-3 h-8 gap-1.5 rounded-[9px] font-medium",
      md: "text-[13px] px-4 h-10 gap-2 rounded-[10px] font-semibold",
      lg: "text-sm px-5 h-11 gap-2.5 rounded-[11px] font-semibold",
      icon: "w-10 h-10 p-0 rounded-[10px] justify-center shrink-0",
      "icon-sm": "w-8 h-8 p-0 rounded-lg justify-center shrink-0",
    };

    const variantStyles = {
      primary:
        "bg-[#2563EB] text-white border border-[#2563EB] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(37,99,235,0.22),inset_0_1px_0_rgba(255,255,255,0.18)] hover:bg-[#1D4ED8] hover:border-[#1D4ED8] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(37,99,235,0.28)]",
      secondary:
        "bg-white text-[#0F172A] border border-[#E2E8F0] shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] hover:text-[#0F172A] hover:-translate-y-[1px] hover:shadow-[0_2px_6px_rgba(15,23,42,0.06)]",
      "secondary-blue":
        "bg-white text-[#2563EB] border border-[#BFDBFE] shadow-[0_1px_2px_rgba(37,99,235,0.04)] hover:bg-blue-50/60 hover:border-[#93C5FD] hover:text-[#1D4ED8] hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(37,99,235,0.12)]",
      outline:
        "bg-white text-[#0F172A] border border-[#E2E8F0] shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] hover:text-[#0F172A] hover:-translate-y-[1px] hover:shadow-[0_2px_6px_rgba(15,23,42,0.06)]",
      subtle:
        "bg-blue-50/80 text-blue-700 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 hover:-translate-y-[1px]",
      tertiary:
        "bg-[#F8FAFC] text-[#64748B] border border-slate-200/60 hover:bg-[#F1F5F9] hover:text-[#0F172A] hover:border-slate-300 hover:-translate-y-[1px]",
      ghost:
        "bg-transparent text-[#64748B] border border-transparent hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]",
      danger:
        "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100/80 hover:border-rose-300 hover:text-rose-800 hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(225,29,72,0.12)]",
      destructive:
        "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100/80 hover:border-rose-300 hover:text-rose-800 hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(225,29,72,0.12)]",
    };

    // Dynamic success styles if operation just succeeded
    const successStyles =
      "bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs hover:bg-emerald-100/70";

    const buttonElement = (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          sizeStyles[size],
          isSuccess ? successStyles : variantStyles[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
        ) : isSuccess ? (
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0 transition-transform duration-160 group-hover:scale-105">{leftIcon}</span>
        )}

        <span>
          {isLoading && loadingText
            ? loadingText
            : isSuccess && successText
            ? successText
            : children}
        </span>

        {!isLoading && !isSuccess && rightIcon && (
          <span className="shrink-0 transition-transform duration-160 group-hover:translate-x-0.5">{rightIcon}</span>
        )}
      </button>
    );

    if (tooltip) {
      return (
        <Tooltip content={tooltip} position={tooltipPosition}>
          {buttonElement}
        </Tooltip>
      );
    }

    return buttonElement;
  }
);

Button.displayName = "Button";
