"use client";

import React from "react";

export function StudyActivitySkeleton() {
  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* KPI Cards Skeleton (4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-slate-200 rounded" />
                <div className="h-7 w-16 bg-slate-200 rounded-lg" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100" />
            </div>
            <div className="h-2.5 w-32 bg-slate-100 rounded pt-1" />
          </div>
        ))}
      </div>

      {/* Primary Analytics Chart Skeleton (1) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-4 w-48 bg-slate-200 rounded" />
            <div className="h-3 w-64 bg-slate-100 rounded" />
          </div>
          <div className="h-8 w-28 bg-slate-100 rounded-xl" />
        </div>
        <div className="h-64 w-full bg-slate-50 rounded-xl flex items-end p-4 gap-2">
          {[40, 65, 30, 80, 55, 90, 45, 70, 85, 40, 60, 75].map((h, idx) => (
            <div
              key={idx}
              className="flex-1 bg-slate-200/60 rounded-t"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* 2-Column Secondary Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div className="h-4 w-36 bg-slate-200 rounded" />
          <div className="h-32 bg-slate-50 rounded-xl" />
        </div>
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <div className="h-4 w-36 bg-slate-200 rounded" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((j) => (
              <div key={j} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-28 bg-slate-200 rounded" />
                  <div className="h-3 w-12 bg-slate-200 rounded" />
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Sessions Skeleton */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
        <div className="h-4 w-40 bg-slate-200 rounded" />
        <div className="space-y-2 pt-2">
          {[1, 2, 3].map((k) => (
            <div key={k} className="h-14 bg-slate-50 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
