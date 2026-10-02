"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

export function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse pb-12">
      {/* Header Skeleton */}
      <div className="space-y-3 pb-1">
        <div className="w-32 h-3.5 bg-slate-200 rounded-md" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="w-28 h-5 bg-slate-200 rounded-full" />
            <div className="w-64 h-8 bg-slate-200 rounded-xl" />
            <div className="w-96 max-w-full h-4 bg-slate-100 rounded-md" />
          </div>
          <div className="flex gap-2">
            <div className="w-32 h-9 bg-slate-200 rounded-xl" />
            <div className="w-32 h-9 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Analytics Context Skeleton */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex justify-between border-b border-slate-100 pb-3">
          <div className="w-32 h-4 bg-slate-200 rounded-md" />
          <div className="w-64 h-4 bg-slate-100 rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="h-10 bg-slate-100 rounded-xl" />
          <div className="h-10 bg-slate-100 rounded-xl" />
          <div className="h-10 bg-slate-100 rounded-xl" />
        </div>
      </div>

      {/* 4 KPIs Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex justify-between">
              <div className="w-20 h-3 bg-slate-200 rounded" />
              <div className="w-7 h-7 bg-slate-100 rounded-lg" />
            </div>
            <div className="w-24 h-7 bg-slate-200 rounded-md" />
            <div className="w-full h-3 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Trend Chart Skeleton */}
      <Card className="rounded-2xl bg-white border border-slate-200/90 p-5 space-y-4">
        <div className="flex justify-between border-b border-slate-100 pb-3">
          <div className="w-36 h-5 bg-slate-200 rounded-md" />
          <div className="w-48 h-7 bg-slate-100 rounded-xl" />
        </div>
        <div className="h-72 w-full bg-slate-50 rounded-xl" />
      </Card>

      {/* Subject Performance Skeleton */}
      <Card className="rounded-2xl bg-white border border-slate-200/90 p-5 space-y-4">
        <div className="flex justify-between border-b border-slate-100 pb-3">
          <div className="w-40 h-5 bg-slate-200 rounded-md" />
          <div className="w-24 h-7 bg-slate-100 rounded-lg" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-50 rounded-xl" />
          ))}
        </div>
      </Card>

      {/* 2-Column Grid Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl bg-white border border-slate-200/90 p-5 space-y-3">
          <div className="w-36 h-5 bg-slate-200 rounded-md" />
          <div className="h-44 bg-slate-50 rounded-xl" />
        </Card>
        <Card className="rounded-2xl bg-white border border-slate-200/90 p-5 space-y-3">
          <div className="w-36 h-5 bg-slate-200 rounded-md" />
          <div className="h-44 bg-slate-50 rounded-xl" />
        </Card>
      </div>
    </div>
  );
}
