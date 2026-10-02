"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

export function SettingsSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2 pb-2">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="h-8 w-64 bg-slate-200 rounded-lg" />
        <div className="h-4 w-96 bg-slate-200 rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Nav Skeleton */}
        <div className="md:col-span-4 lg:col-span-3 space-y-4">
          <div className="h-4 w-20 bg-slate-200 rounded" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-full bg-slate-200 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Right Content Skeleton */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          <Card>
            <div className="p-6 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-200 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-48 bg-slate-200 rounded" />
                <div className="h-4 w-36 bg-slate-200 rounded" />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader className="pb-4 border-b border-slate-100">
              <div className="h-5 w-40 bg-slate-200 rounded" />
              <div className="h-3.5 w-64 bg-slate-200 rounded mt-1" />
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-11 bg-slate-200 rounded-xl" />
                <div className="h-11 bg-slate-200 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
