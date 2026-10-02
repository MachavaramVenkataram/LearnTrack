"use client";

import React, { useRef } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ExperimentFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  modelFilter: string;
  onModelFilterChange: (m: string) => void;
  datasetFilter: string;
  onDatasetFilterChange: (d: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  modelOptions: string[];
  datasetOptions: string[];
  statusOptions: string[];
  totalRuns: number;
  filteredCount: number;
  onClearFilters: () => void;
}

export function ExperimentFilterToolbar({
  searchQuery,
  onSearchChange,
  modelFilter,
  onModelFilterChange,
  datasetFilter,
  onDatasetFilterChange,
  statusFilter,
  onStatusFilterChange,
  modelOptions,
  datasetOptions,
  statusOptions,
  totalRuns,
  filteredCount,
  onClearFilters,
}: ExperimentFilterToolbarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    modelFilter !== "ALL" ||
    datasetFilter !== "ALL" ||
    statusFilter !== "ALL";

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-3.5 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
      {/* Search Input & Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
        {/* Search Field */}
        <div className="relative flex-1 min-w-[200px] sm:min-w-[260px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search runs, models, datasets…"
            className="w-full h-9 pl-9 pr-14 rounded-[10px] bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            aria-label="Search experiment runs"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium text-slate-400 bg-white border border-slate-200 shadow-2xs">
              Ctrl+K
            </kbd>
          </div>
        </div>

        {/* Model Architecture Filter */}
        <div className="relative">
          <select
            value={modelFilter}
            onChange={(e) => onModelFilterChange(e.target.value)}
            className="h-9 text-xs font-medium border border-slate-200 rounded-[10px] px-3 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors cursor-pointer"
            aria-label="Filter by model architecture"
          >
            <option value="ALL">All Models ({totalRuns})</option>
            {modelOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Dataset Version Filter */}
        <div className="relative">
          <select
            value={datasetFilter}
            onChange={(e) => onDatasetFilterChange(e.target.value)}
            className="h-9 text-xs font-medium border border-slate-200 rounded-[10px] px-3 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors cursor-pointer"
            aria-label="Filter by dataset version"
          >
            <option value="ALL">All Datasets</option>
            {datasetOptions.map((d) => (
              <option key={d} value={d}>
                Dataset v{d}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="h-9 text-xs font-medium border border-slate-200 rounded-[10px] px-3 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors cursor-pointer"
            aria-label="Filter by run status"
          >
            <option value="ALL">All Statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Action */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-9 px-2.5 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-[10px] transition-colors cursor-pointer"
            leftIcon={<X className="w-3.5 h-3.5" />}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Right Counter */}
      <div className="flex items-center gap-2 self-start md:self-auto shrink-0 pl-1 md:pl-0">
        <span className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-slate-900 font-bold">{filteredCount}</strong> of{" "}
          <strong className="text-slate-900 font-bold">{totalRuns}</strong> runs
        </span>
      </div>
    </div>
  );
}
