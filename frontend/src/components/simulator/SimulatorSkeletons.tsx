"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/Card";

export function SimulatorWorkspaceSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* 1. Header Skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-36 bg-slate-200 rounded animate-pulse" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 w-60 bg-slate-200 rounded-lg animate-pulse" />
            <div className="h-4 w-80 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-28 bg-slate-200 rounded-xl animate-pulse" />
            <div className="h-9 w-36 bg-slate-200 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Hero status strip skeleton */}
        <div className="h-14 w-full bg-slate-100 rounded-2xl animate-pulse" />
      </div>

      {/* 2. Workspace 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (Inputs) Skeleton */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="rounded-2xl bg-white border border-slate-200 p-5 space-y-4">
            <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 w-full bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
            ))}
            <div className="h-12 w-full bg-blue-100 rounded-xl animate-pulse mt-4" />
          </Card>
        </div>

        {/* Right Column (Outcome) Skeleton */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="rounded-2xl bg-white border border-slate-200 p-5 space-y-5">
            <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-24 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
              <div className="h-24 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
            </div>
            <div className="h-14 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
            <div className="h-40 bg-slate-50 border border-slate-100 rounded-xl animate-pulse" />
          </Card>
        </div>
      </div>
    </div>
  );
}
