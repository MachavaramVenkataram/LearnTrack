"use client";

import React from "react";

export function TelemetrySkeleton() {
  return (
    <div className="space-y-8 animate-pulse pb-12">
      {/* 1. Header Skeleton */}
      <div className="space-y-3 pb-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-48 bg-slate-200 rounded" />
            <div className="h-8 w-80 bg-slate-200 rounded-lg" />
            <div className="h-4 w-96 bg-slate-100 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-32 bg-slate-200 rounded-lg" />
            <div className="h-9 w-36 bg-slate-200 rounded-lg" />
          </div>
        </div>
      </div>

      {/* 2. Hero Skeleton */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-soft-sm space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-200" />
            <div className="space-y-2">
              <div className="h-5 w-52 bg-slate-200 rounded" />
              <div className="h-3 w-40 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="h-7 w-36 bg-slate-200 rounded-full" />
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="h-10 bg-slate-100 rounded-lg" />
          <div className="h-10 bg-slate-100 rounded-lg" />
          <div className="h-10 bg-slate-100 rounded-lg" />
          <div className="h-10 bg-slate-100 rounded-lg" />
        </div>
      </div>

      {/* 3. Performance Metrics Skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-44 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 h-64 space-y-4">
            <div className="h-5 w-40 bg-slate-200 rounded" />
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="h-28 bg-slate-100 rounded-xl" />
              <div className="h-28 bg-slate-100 rounded-xl" />
              <div className="h-28 bg-slate-100 rounded-xl" />
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200 h-64 space-y-4">
            <div className="h-5 w-40 bg-slate-200 rounded" />
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="h-28 bg-slate-100 rounded-xl" />
              <div className="h-28 bg-slate-100 rounded-xl" />
              <div className="h-28 bg-slate-100 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Features Skeleton */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
        <div className="h-5 w-36 bg-slate-200 rounded" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>

      {/* 5. Reliability Skeleton */}
      <div className="grid grid-cols-3 gap-4">
        <div className="h-40 bg-white border border-slate-200 rounded-2xl" />
        <div className="h-40 bg-white border border-slate-200 rounded-2xl" />
        <div className="h-40 bg-white border border-slate-200 rounded-2xl" />
      </div>
    </div>
  );
}
