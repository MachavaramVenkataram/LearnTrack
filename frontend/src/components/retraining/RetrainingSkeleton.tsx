"use client";

import React from "react";

export function RetrainingSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-5 w-28 bg-slate-200 rounded-md" />
            <div className="h-5 w-36 bg-slate-200 rounded-full" />
          </div>
          <div className="h-8 w-72 bg-slate-200 rounded-lg" />
          <div className="h-4 w-96 bg-slate-200 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-24 bg-slate-200 rounded-xl" />
          <div className="h-10 w-36 bg-slate-200 rounded-xl" />
          <div className="h-10 w-32 bg-slate-200 rounded-xl" />
        </div>
      </div>

      {/* Hero 4 Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border border-[#E2E8F0] rounded-[14px] p-5 shadow-xs flex flex-col justify-between h-[130px]"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-32 bg-slate-200 rounded" />
              <div className="w-8 h-8 rounded-xl bg-slate-100" />
            </div>
            <div className="space-y-2">
              <div className="h-7 w-28 bg-slate-200 rounded" />
              <div className="h-3 w-40 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Policy Strip Skeleton */}
      <div className="h-14 bg-slate-100 rounded-[14px] border border-slate-200" />

      {/* Pipeline Nodes Strip Skeleton */}
      <div className="bg-white border border-[#E2E8F0] rounded-[14px] p-5 shadow-xs space-y-3">
        <div className="h-4 w-48 bg-slate-200 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Candidate Workspace Skeleton */}
      <div className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-xs p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-5 w-44 bg-slate-200 rounded" />
          <div className="h-8 w-28 bg-slate-200 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-48 bg-slate-100 rounded-xl" />
          <div className="h-48 bg-slate-100 rounded-xl" />
        </div>
      </div>

      {/* Retraining Pipeline Table Skeleton */}
      <div className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-xs p-6 space-y-3">
        <div className="h-5 w-40 bg-slate-200 rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-slate-100 rounded" />
        ))}
      </div>
    </div>
  );
}
