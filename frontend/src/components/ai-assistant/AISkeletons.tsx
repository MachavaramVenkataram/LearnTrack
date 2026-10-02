"use client";

import React from "react";

export function AIAssistantLoadingSkeleton() {
  return (
    <div className="h-full flex flex-col bg-white overflow-hidden animate-pulse">
      {/* Header Skeleton */}
      <div className="h-16 px-6 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-200" />
          <div className="w-10 h-10 rounded-xl bg-slate-200" />
          <div className="space-y-1.5">
            <div className="w-32 h-4 rounded bg-slate-200" />
            <div className="w-48 h-3 rounded bg-slate-100" />
          </div>
        </div>
        <div className="w-32 h-9 rounded-xl bg-slate-200" />
      </div>

      {/* 3-column Body Skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column Skeleton */}
        <div className="w-72 border-r border-slate-200/80 p-3.5 space-y-3 bg-slate-50/50 hidden md:block">
          <div className="w-full h-10 rounded-xl bg-slate-200" />
          <div className="w-full h-8 rounded-lg bg-slate-100" />
          <div className="space-y-2 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-200/70" />
            ))}
          </div>
        </div>

        {/* Center Column Skeleton */}
        <div className="flex-1 flex flex-col p-6 space-y-6 bg-white overflow-hidden">
          <div className="max-w-xl mx-auto w-full pt-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 mx-auto" />
            <div className="w-64 h-6 rounded-lg bg-slate-200 mx-auto" />
            <div className="w-96 h-4 rounded bg-slate-100 mx-auto" />
            <div className="grid grid-cols-2 gap-3 pt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-slate-100 border border-slate-200/60" />
              ))}
            </div>
          </div>
          <div className="mt-auto max-w-3xl mx-auto w-full h-24 rounded-2xl bg-slate-100 border border-slate-200/80" />
        </div>

        {/* Right Column Skeleton */}
        <div className="w-80 border-l border-slate-200/80 p-4 space-y-4 bg-slate-50/30 hidden lg:block">
          <div className="h-6 w-36 rounded bg-slate-200" />
          <div className="h-20 rounded-xl bg-slate-200/70" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-16 rounded-xl bg-slate-200/70" />
            <div className="h-16 rounded-xl bg-slate-200/70" />
            <div className="h-16 rounded-xl bg-slate-200/70" />
          </div>
          <div className="h-28 rounded-xl bg-slate-200/70" />
          <div className="h-32 rounded-xl bg-slate-200/70" />
        </div>
      </div>
    </div>
  );
}
