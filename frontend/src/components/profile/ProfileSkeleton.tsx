"use client";

import React from "react";

export function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-pulse pb-16">
      {/* Header Skeleton */}
      <div className="space-y-3 pb-3 border-b border-slate-200">
        <div className="h-4 w-40 bg-slate-200 rounded" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-72 bg-slate-200 rounded-lg" />
            <div className="h-4 w-96 bg-slate-100 rounded" />
          </div>
          <div className="h-9 w-28 bg-slate-200 rounded-lg" />
        </div>
      </div>

      {/* Hero Skeleton */}
      <div className="p-6 rounded-[18px] bg-white border border-slate-200 shadow-soft-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-[84px] h-[84px] rounded-[22px] bg-slate-200 shrink-0" />
            <div className="space-y-2.5">
              <div className="h-6 w-52 bg-slate-200 rounded" />
              <div className="h-4 w-36 bg-slate-100 rounded" />
              <div className="flex gap-2">
                <div className="h-4 w-28 bg-slate-100 rounded" />
                <div className="h-4 w-28 bg-slate-100 rounded" />
              </div>
            </div>
          </div>
          <div className="w-64 h-24 bg-slate-100 rounded-2xl" />
        </div>
      </div>

      {/* Form Cards Skeleton */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-5">
        <div className="h-5 w-44 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="h-11 bg-slate-100 rounded-xl" />
          <div className="h-11 bg-slate-100 rounded-xl" />
          <div className="h-11 bg-slate-100 rounded-xl" />
          <div className="h-11 bg-slate-100 rounded-xl" />
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-5">
        <div className="h-5 w-44 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="h-11 bg-slate-100 rounded-xl" />
          <div className="h-11 bg-slate-100 rounded-xl" />
          <div className="h-11 bg-slate-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
