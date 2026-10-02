"use client";

import React from "react";

export function InsightsLoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse pb-12 max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200/80">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-[11px] bg-slate-200" />
          <div className="space-y-1.5">
            <div className="w-48 h-6 rounded-md bg-slate-200" />
            <div className="w-64 h-3 rounded-md bg-slate-100" />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-44 h-10 rounded-[11px] bg-slate-200" />
          <div className="w-36 h-10 rounded-[11px] bg-slate-200" />
        </div>
      </div>

      {/* 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-24 h-3 rounded bg-slate-200" />
              <div className="w-8 h-8 rounded-lg bg-slate-100" />
            </div>
            <div className="space-y-2">
              <div className="w-20 h-7 rounded-md bg-slate-200" />
              <div className="w-32 h-3 rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>

      {/* SHAP Chart Skeleton */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="w-56 h-5 rounded bg-slate-200" />
            <div className="w-72 h-3 rounded bg-slate-100" />
          </div>
          <div className="w-60 h-8 rounded-xl bg-slate-100" />
        </div>
        <div className="h-48 w-full rounded-xl bg-slate-100" />
      </div>

      {/* Feed Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="w-40 h-5 rounded bg-slate-200" />
          <div className="w-72 h-8 rounded-xl bg-slate-100" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-20 h-4 rounded-full bg-slate-200" />
                <div className="w-16 h-4 rounded bg-slate-100" />
              </div>
              <div className="w-48 h-4 rounded bg-slate-200" />
              <div className="w-full h-10 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
