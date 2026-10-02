"use client";

import React from "react";

export function ErrorAnalysisSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-5 w-28 bg-slate-200 rounded-md" />
            <div className="h-5 w-32 bg-slate-200 rounded-full" />
          </div>
          <div className="h-8 w-64 bg-slate-200 rounded-lg" />
          <div className="h-4 w-96 bg-slate-200 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-60 bg-slate-200 rounded-xl" />
          <div className="h-9 w-20 bg-slate-200 rounded-xl" />
        </div>
      </div>

      {/* KPI 4-Card Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border border-[#E2E8F0] rounded-[14px] p-5 shadow-xs flex flex-col justify-between h-[120px]"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-28 bg-slate-200 rounded" />
              <div className="w-8 h-8 rounded-xl bg-slate-100" />
            </div>
            <div className="space-y-1.5">
              <div className="h-7 w-20 bg-slate-200 rounded" />
              <div className="h-3 w-36 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Model Context Strip Skeleton */}
      <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-4 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100" />
              <div className="space-y-1">
                <div className="h-2.5 w-16 bg-slate-200 rounded" />
                <div className="h-4 w-24 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 1: Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-5 shadow-xs h-[360px] flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-4 w-44 bg-slate-200 rounded" />
            <div className="h-3 w-64 bg-slate-200 rounded" />
          </div>
          <div className="h-56 bg-slate-100 rounded-lg" />
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-5 shadow-xs h-[360px] flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-4 w-52 bg-slate-200 rounded" />
            <div className="h-3 w-64 bg-slate-200 rounded" />
          </div>
          <div className="h-56 bg-slate-100 rounded-lg" />
        </div>
      </div>

      {/* Row 2: Scatter & Reliability Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-[14px] p-5 shadow-xs h-[380px] flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-4 w-60 bg-slate-200 rounded" />
            <div className="h-3 w-80 bg-slate-200 rounded" />
          </div>
          <div className="h-64 bg-slate-100 rounded-lg" />
        </div>
        <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-5 shadow-xs h-[380px] flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-20 bg-slate-100 rounded-xl" />
          </div>
          <div className="space-y-2">
            <div className="h-10 bg-slate-100 rounded-lg" />
            <div className="h-10 bg-slate-100 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Row 3: Feature Segments Table Skeleton */}
      <div className="bg-white border border-[#E2E8F0] rounded-[14px] shadow-xs p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 w-48 bg-slate-200 rounded" />
          <div className="h-8 w-40 bg-slate-200 rounded-lg" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 bg-slate-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
