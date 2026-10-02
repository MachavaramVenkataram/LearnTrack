"use client";

import React from "react";

export function ExperimentsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 bg-slate-200 rounded-md" />
            <div className="h-4 w-28 bg-slate-200 rounded-full" />
          </div>
          <div className="h-8 w-64 bg-slate-200 rounded-lg" />
          <div className="h-4 w-96 max-w-full bg-slate-100 rounded" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-32 bg-slate-200 rounded-[10px]" />
          <div className="h-10 w-24 bg-slate-200 rounded-[10px]" />
        </div>
      </div>

      {/* Hero Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-[135px] bg-white rounded-[14px] border border-slate-200 p-5 flex flex-col justify-between shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="w-9 h-9 rounded-xl bg-slate-100" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-36 bg-slate-200 rounded" />
              <div className="h-3 w-28 bg-slate-100 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Insights Strip Skeleton */}
      <div className="h-11 bg-white rounded-[12px] border border-slate-200 px-4 flex items-center justify-between">
        <div className="h-4 w-36 bg-slate-200 rounded" />
        <div className="h-4 w-72 bg-slate-100 rounded hidden sm:block" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="h-14 bg-white rounded-[16px] border border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-60 bg-slate-100 rounded-[10px]" />
          <div className="h-9 w-32 bg-slate-100 rounded-[10px]" />
          <div className="h-9 w-32 bg-slate-100 rounded-[10px]" />
        </div>
        <div className="h-4 w-28 bg-slate-100 rounded" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-[16px] border border-slate-200 p-6 space-y-4 shadow-xs">
        <div className="h-4 bg-slate-200 rounded w-1/4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-14 bg-slate-50 rounded-xl flex items-center px-4 gap-6 justify-between"
            >
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="h-4 w-36 bg-slate-200 rounded" />
              <div className="h-5 w-16 bg-slate-100 rounded-full" />
              <div className="h-4 w-14 bg-slate-200 rounded" />
              <div className="h-4 w-14 bg-slate-200 rounded" />
              <div className="h-4 w-20 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
