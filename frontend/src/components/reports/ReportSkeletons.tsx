"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

export function ReportWorkspaceSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* 1. Header Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-96 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-9 w-28 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-9 w-32 bg-blue-100 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* 2. Workspace 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          <Card className="rounded-2xl bg-white border border-slate-200 p-4 space-y-4">
            <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
            <div className="h-9 w-full bg-slate-100 rounded-xl animate-pulse" />
            <div className="space-y-2 pt-2">
              <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 w-full bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (Document) Skeleton */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-3">
          <div className="h-9 w-full bg-slate-100 rounded-xl animate-pulse" />
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 space-y-8 shadow-xs">
            {/* Header skeleton */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-6 w-28 bg-slate-100 rounded-full animate-pulse" />
            </div>

            {/* Overview Grid */}
            <div className="h-24 w-full bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />

            {/* 4 Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>

            {/* Table skeleton */}
            <div className="h-48 w-full bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
