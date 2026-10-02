"use client";

import React, { useEffect, useState, useRef } from "react";

export interface AnimatedCounterProps {
  value: number | string;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 800,
  decimals,
  prefix = "",
  suffix = "",
  className,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    if (typeof value === "string" && (value === "—" || isNaN(parseFloat(value)))) {
      return value;
    }
    return "0";
  });

  const animatedRef = useRef(false);

  useEffect(() => {
    // If non-numeric (e.g. "—"), don't animate
    if (typeof value === "string" && (value === "—" || isNaN(parseFloat(value)))) {
      setDisplayValue(value);
      return;
    }

    const numericTarget = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(numericTarget)) {
      setDisplayValue(String(value));
      return;
    }

    // Auto-detect decimal places if not explicitly provided
    const targetDecimals =
      decimals !== undefined
        ? decimals
        : typeof value === "string" && value.includes(".")
        ? value.split(".")[1].replace(/[^0-9]/g, "").length
        : Number.isInteger(numericTarget)
        ? 0
        : 1;

    // Check for reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || animatedRef.current) {
      setDisplayValue(numericTarget.toFixed(targetDecimals));
      return;
    }

    animatedRef.current = true;
    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = easedProgress * numericTarget;

      setDisplayValue(current.toFixed(targetDecimals));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(numericTarget.toFixed(targetDecimals));
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration, decimals]);

  return (
    <span className={className}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
