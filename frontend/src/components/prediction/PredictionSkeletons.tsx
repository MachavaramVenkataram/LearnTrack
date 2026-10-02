"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

export function PredictionPageSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-28 h-5 bg-slate-200 rounded-full" />
            <div className="w-24 h-5 bg-slate-200 rounded-full" />
          </div>
          <div className="w-72 h-8 bg-slate-200 rounded-xl" />
          <div className="w-96 max-w-full h-4 bg-slate-100 rounded-md" />
        </div>
        <div className="w-36 h-9 bg-slate-200 rounded-xl" />
      </div>

      {/* Pipeline Progress Skeleton */}
      <div className="w-full h-12 bg-slate-100 rounded-xl" />

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Inputs) Skeleton */}
        <div className="lg:col-span-7">
          <Card className="border border-slate-200/90 rounded-2xl bg-white p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1.5">
                <div className="w-36 h-5 bg-slate-200 rounded-md" />
                <div className="w-48 h-3.5 bg-slate-100 rounded-md" />
              </div>
              <div className="w-16 h-7 bg-slate-100 rounded-lg" />
            </div>

            <div className="space-y-4">
              <div className="w-full h-12 bg-slate-100 rounded-[10px]" />
              <div className="grid grid-cols-2 gap-3.5">
                <div className="h-12 bg-slate-100 rounded-[10px]" />
                <div className="h-12 bg-slate-100 rounded-[10px]" />
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="h-12 bg-slate-100 rounded-[10px]" />
                <div className="h-12 bg-slate-100 rounded-[10px]" />
              </div>
              <div className="w-full h-12 bg-slate-100 rounded-[10px]" />
            </div>

            <div className="w-full h-12 bg-slate-200 rounded-[10px]" />
          </Card>
        </div>

        {/* Right Column (Workspace) Skeleton */}
        <div className="lg:col-span-5">
          <Card className="border border-slate-200/90 rounded-2xl bg-white p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl mx-auto" />
            <div className="w-40 h-5 bg-slate-200 rounded-md mx-auto" />
            <div className="w-64 h-3.5 bg-slate-100 rounded-md mx-auto" />
            <div className="w-32 h-10 bg-slate-200 rounded-[10px] mx-auto mt-4" />
          </Card>
        </div>
      </div>
    </div>
  );
}
