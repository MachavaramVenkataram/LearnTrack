"use client";

import React, { useState, useMemo } from "react";
import { Layers, Search, Info, ArrowUpDown } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { FeatureSegmentItem } from "@/lib/api/mlOps";

export interface FeatureSegmentsTableProps {
  featureSegments?: Record<string, FeatureSegmentItem[]> | null;
}

export function FeatureSegmentsTable({ featureSegments }: FeatureSegmentsTableProps) {
  const [selectedFeature, setSelectedFeature] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<"count" | "mae" | "rmse">("count");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Available feature categories
  const featureKeys = useMemo(() => {
    return featureSegments ? Object.keys(featureSegments) : [];
  }, [featureSegments]);

  // Flattened and filtered rows
  const rows = useMemo(() => {
    if (!featureSegments) return [];

    const list: Array<{
      featureKey: string;
      featureLabel: string;
      item: FeatureSegmentItem;
    }> = [];

    Object.entries(featureSegments).forEach(([feat, segments]) => {
      if (selectedFeature !== "all" && selectedFeature !== feat) return;

      segments.forEach((seg) => {
        if (
          searchQuery.trim() &&
          !seg.segment_label.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !feat.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return;
        }

        list.push({
          featureKey: feat,
          featureLabel: feat.replace(/_/g, " "),
          item: seg,
        });
      });
    });

    // Sorting
    list.sort((a, b) => {
      let valA: number = 0;
      let valB: number = 0;

      if (sortField === "count") {
        valA = a.item.count;
        valB = b.item.count;
      } else if (sortField === "mae") {
        valA = a.item.mae ?? (sortAsc ? 9999 : -1);
        valB = b.item.mae ?? (sortAsc ? 9999 : -1);
      } else if (sortField === "rmse") {
        valA = a.item.rmse ?? (sortAsc ? 9999 : -1);
        valB = b.item.rmse ?? (sortAsc ? 9999 : -1);
      }

      return sortAsc ? valA - valB : valB - valA;
    });

    return list;
  }, [featureSegments, selectedFeature, searchQuery, sortField, sortAsc]);

  const toggleSort = (field: "count" | "mae" | "rmse") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  if (!featureSegments || Object.keys(featureSegments).length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[14px] shadow-xs overflow-hidden">
      {/* Table Header with Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight uppercase">
              Error by Feature Segment
            </h2>
            <Tooltip content="Evaluate error sensitivity across academic variables. Identifies if certain student subsets exhibit higher prediction uncertainty.">
              <span className="cursor-help text-slate-400 hover:text-slate-600">
                <Info className="w-3.5 h-3.5" />
              </span>
            </Tooltip>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-9">
            Evaluate error sensitivity across academic variables. Segments with fewer than 5 observations are safely flagged as insufficient.
          </p>
        </div>

        {/* Feature Filters + Search Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Feature Selector Dropdown / Pills */}
          <div className="relative">
            <select
              value={selectedFeature}
              onChange={(e) => setSelectedFeature(e.target.value)}
              aria-label="Filter by feature"
              className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium py-1.5 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer capitalize"
            >
              <option value="all">All Features ({featureKeys.length})</option>
              {featureKeys.map((k) => (
                <option key={k} value={k}>
                  {k.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search segment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 sm:w-44 text-xs bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] text-slate-600 font-semibold border-b border-slate-200/80">
              <th className="py-3 px-4 text-slate-700">Feature Segment</th>
              <th
                onClick={() => toggleSort("count")}
                className="py-3 px-4 text-slate-700 cursor-pointer select-none hover:text-blue-600"
              >
                <div className="flex items-center gap-1">
                  <span>Observations</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort("mae")}
                className="py-3 px-4 text-slate-700 cursor-pointer select-none hover:text-blue-600"
              >
                <div className="flex items-center gap-1">
                  <span>MAE</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort("rmse")}
                className="py-3 px-4 text-slate-700 cursor-pointer select-none hover:text-blue-600"
              >
                <div className="flex items-center gap-1">
                  <span>RMSE</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-4 text-slate-700">Mean Residual</th>
              <th className="py-3 px-4 text-slate-700">Reliability</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length > 0 ? (
              rows.map(({ featureLabel, item }, idx) => {
                const isInsufficient = item.insufficient_observations;

                return (
                  <tr
                    key={`${featureLabel}-${item.segment_label}-${idx}`}
                    className="group hover:bg-[#F8FAFC] transition-colors duration-150 relative"
                  >
                    <td className="py-3 px-4 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-3.5 rounded-full bg-slate-200 group-hover:bg-blue-500 transition-colors" />
                        <div>
                          <span className="capitalize text-slate-400 text-[11px] block font-normal">
                            {featureLabel}
                          </span>
                          <span className="font-semibold text-slate-900 text-xs">
                            {item.segment_label}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700">
                      {item.count} {item.count === 1 ? "sample" : "samples"}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {isInsufficient ? (
                        <Tooltip content="This segment requires additional observations before reliable error metrics can be calculated.">
                          <span className="text-slate-400 font-normal italic text-[11px] cursor-help">
                            Insufficient obs
                          </span>
                        </Tooltip>
                      ) : (
                        `${item.mae} pts`
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700">
                      {isInsufficient ? (
                        <span className="text-slate-400 italic text-[11px]">—</span>
                      ) : (
                        `${item.rmse} pts`
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-700">
                      {isInsufficient ? (
                        <span className="text-slate-400 italic text-[11px]">—</span>
                      ) : (
                        `${item.mean_error !== null && item.mean_error !== undefined && item.mean_error > 0 ? `+${item.mean_error}` : item.mean_error ?? "0"} pts`
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {isInsufficient ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          INSUFFICIENT
                        </span>
                      ) : item.mae && item.mae < 4.0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          HIGH ACCURACY
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          TYPICAL DISPERSION
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                  No feature segments match the selected criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
