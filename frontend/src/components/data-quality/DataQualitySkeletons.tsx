"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

export function DataQualitySkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 animate-pulse">
      {/* 1. Header Skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-48 bg-slate-200 rounded" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 rounded-lg" />
            <div className="h-4 w-96 bg-slate-200 rounded" />
          </div>
          <div className="flex gap-2.5">
            <div className="h-10 w-24 bg-slate-200 rounded-xl" />
            <div className="h-10 w-36 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>

      {/* 2. Hero Skeleton */}
      <div className="h-48 w-full rounded-2xl bg-slate-100 border border-slate-200 p-6 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-4 w-40 bg-slate-200 rounded" />
          <div className="h-6 w-80 bg-slate-200 rounded" />
          <div className="h-4 w-full max-w-xl bg-slate-200 rounded" />
        </div>
        <div className="h-8 w-72 bg-slate-200 rounded-lg" />
      </div>

      {/* 3. KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-white border border-slate-200 p-4 flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-6 w-16 bg-slate-200 rounded" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100" />
          </div>
        ))}
      </div>

      {/* 4. Checks Skeleton */}
      <div className="h-96 rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
        <div className="h-6 w-48 bg-slate-200 rounded" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-50 border border-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
