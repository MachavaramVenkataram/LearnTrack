"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, Variants } from "framer-motion";
import { AlertCircle, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { getExperiments, ExperimentSummary } from "@/lib/api/mlOps";
import {
  ExperimentHeader,
  ExperimentHeroCards,
  ExperimentInsightsStrip,
  ExperimentFilterToolbar,
  ExperimentRunsTable,
  SortField,
  RunDetailDrawer,
  ExperimentComparisonModal,
  FloatingComparisonBar,
  ExperimentTimeline,
  ReproducibilityFooter,
  ExperimentsSkeleton,
} from "@/components/experiments";

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filtering state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modelFilter, setModelFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [datasetFilter, setDatasetFilter] = useState<string>("ALL");

  // Sorting state
  const [sortField, setSortField] = useState<SortField>("time");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Multi-run selection for comparison
  const [selectedRunIds, setSelectedRunIds] = useState<string[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState<boolean>(false);

  // Single-run detail drawer
  const [selectedRunForDetail, setSelectedRunForDetail] = useState<ExperimentSummary | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState<boolean>(false);

  // Data fetching
  const fetchRuns = useCallback(async (isManual: boolean = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const runs = await getExperiments();
      setExperiments(runs);
    } catch (err: any) {
      console.error("Failed to load ML experiments from MLflow:", err);
      setError("MLflow tracking server unavailable. Please check that the backend service is running and retry.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRuns(false);
  }, [fetchRuns]);

  // Keyboard shortcut listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        const input = document.querySelector<HTMLInputElement>(
          'input[aria-label="Search experiment runs"]'
        );
        if (input) {
          e.preventDefault();
          input.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter options derived from actual data
  const modelOptions = useMemo(() => {
    const set = new Set<string>();
    experiments.forEach((r) => {
      if (r.model_name) {
        const clean = r.model_name
          .replace(/\s*\(Candidate\)\s*/i, "")
          .replace(/\s*\(Champion\)\s*/i, "")
          .trim();
        set.add(clean);
      }
    });
    return Array.from(set);
  }, [experiments]);

  const datasetOptions = useMemo(() => {
    const set = new Set<string>();
    experiments.forEach((r) => {
      if (r.dataset_version) set.add(r.dataset_version);
    });
    return Array.from(set);
  }, [experiments]);

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    experiments.forEach((r) => {
      if (r.status) set.add(r.status);
    });
    return Array.from(set);
  }, [experiments]);

  // Champion & Candidate model identification
  const championRun = useMemo(() => {
    return (
      experiments.find(
        (r) =>
          r.is_champion ||
          r.tags?.is_champion === "true" ||
          r.tags?.champion === "true"
      ) || null
    );
  }, [experiments]);

  const candidateRun = useMemo(() => {
    return (
      experiments.find(
        (r) =>
          r.tags?.candidate === "true" ||
          (r.model_name ?? "").toLowerCase().includes("candidate")
      ) || null
    );
  }, [experiments]);

  // Filtered & Sorted runs
  const filteredRuns = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return experiments
      .filter((run) => {
        const cleanName = (run.model_name ?? "")
          .replace(/\s*\(Candidate\)\s*/i, "")
          .replace(/\s*\(Champion\)\s*/i, "")
          .trim();

        // Model filter
        if (
          modelFilter !== "ALL" &&
          cleanName !== modelFilter &&
          run.model_name !== modelFilter
        ) {
          return false;
        }

        // Status filter
        if (statusFilter !== "ALL" && run.status !== statusFilter) {
          return false;
        }

        // Dataset filter
        if (datasetFilter !== "ALL" && run.dataset_version !== datasetFilter) {
          return false;
        }

        // Search Query
        if (query.length > 0) {
          const matchRunId = run.run_id.toLowerCase().includes(query);
          const matchModel = (run.model_name ?? "").toLowerCase().includes(query);
          const matchRunName = (run.run_name ?? "").toLowerCase().includes(query);
          const matchDataset = (run.dataset_version ?? "").toLowerCase().includes(query);
          if (!matchRunId && !matchModel && !matchRunName && !matchDataset) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;

        if (sortField === "time") {
          valA = a.start_time ? new Date(a.start_time).getTime() : 0;
          valB = b.start_time ? new Date(b.start_time).getTime() : 0;
        } else if (sortField === "mae") {
          valA = a.val_mae ?? a.metrics?.val_mae ?? 999;
          valB = b.val_mae ?? b.metrics?.val_mae ?? 999;
        } else if (sortField === "rmse") {
          valA = a.val_rmse ?? a.metrics?.val_rmse ?? 999;
          valB = b.val_rmse ?? b.metrics?.val_rmse ?? 999;
        } else if (sortField === "r2") {
          valA = a.val_r2 ?? a.metrics?.val_r2 ?? -999;
          valB = b.val_r2 ?? b.metrics?.val_r2 ?? -999;
        } else if (sortField === "test_rmse") {
          valA = a.test_rmse ?? a.metrics?.test_rmse ?? 999;
          valB = b.test_rmse ?? b.metrics?.test_rmse ?? 999;
        }

        return sortAsc ? valA - valB : valB - valA;
      });
  }, [
    experiments,
    searchQuery,
    modelFilter,
    statusFilter,
    datasetFilter,
    sortField,
    sortAsc,
  ]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      // For error metrics, default to ascending (lower is better)
      setSortAsc(field === "mae" || field === "rmse" || field === "test_rmse");
    }
  };

  // Run selection helpers
  const handleToggleSelectRun = (runId: string) => {
    setSelectedRunIds((prev) =>
      prev.includes(runId) ? prev.filter((id) => id !== runId) : [...prev, runId]
    );
  };

  const handleSelectAllRuns = () => {
    setSelectedRunIds(filteredRuns.map((r) => r.run_id));
  };

  const handleClearSelection = () => {
    setSelectedRunIds([]);
  };

  // Inspection drawer handlers
  const handleInspectRun = (run: ExperimentSummary) => {
    setSelectedRunForDetail(run);
    setIsDetailDrawerOpen(true);
  };

  // Runs selected for comparison
  const selectedRunsForComparison = useMemo(() => {
    return experiments.filter((r) => selectedRunIds.includes(r.run_id));
  }, [experiments, selectedRunIds]);

  const handleRemoveFromComparison = (runId: string) => {
    setSelectedRunIds((prev) => prev.filter((id) => id !== runId));
  };

  // Framer motion variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      {isLoading ? (
        <div className="max-w-7xl mx-auto">
          <ExperimentsSkeleton />
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto space-y-6">
          <ExperimentHeader
            onRefresh={() => fetchRuns(true)}
            isRefreshing={isRefreshing}
            isConnected={false}
          />
          <Card className="bg-white border border-rose-200 rounded-[16px] p-6 shadow-xs">
            <CardContent className="flex items-center gap-3 text-rose-700 p-0">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">MLflow Connection Unavailable</p>
                <p className="text-xs text-rose-600 mt-0.5">{error}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchRuns(true)}
                className="text-xs h-8 border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl cursor-pointer"
              >
                Retry Connection
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <motion.div
          className="max-w-7xl mx-auto space-y-6 pb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 1. Header (Kicker, Title, Live Connection Badge, Actions) */}
          <motion.div variants={itemVariants}>
            <ExperimentHeader
              onRefresh={() => fetchRuns(true)}
              isRefreshing={isRefreshing}
              isConnected={true}
            />
          </motion.div>

          {/* 2. Experiment Hero: 4 Connected Top Metric Cards */}
          <motion.section variants={itemVariants} aria-label="Experiment Overview Cards">
            <ExperimentHeroCards
              experiments={experiments}
              championRun={championRun}
              onFilterDataset={(d) => setDatasetFilter(d)}
            />
          </motion.section>

          {/* 3. Experiment Insights Strip */}
          <motion.section variants={itemVariants} aria-label="Experiment Insights">
            <ExperimentInsightsStrip
              experiments={experiments}
              championRun={championRun}
            />
          </motion.section>

          {/* 4. Filter and Search Toolbar */}
          <motion.section variants={itemVariants} aria-label="Search and Filter Toolbar">
            <ExperimentFilterToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              modelFilter={modelFilter}
              onModelFilterChange={setModelFilter}
              datasetFilter={datasetFilter}
              onDatasetFilterChange={setDatasetFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              modelOptions={modelOptions}
              datasetOptions={datasetOptions}
              statusOptions={statusOptions}
              totalRuns={experiments.length}
              filteredCount={filteredRuns.length}
              onClearFilters={() => {
                setSearchQuery("");
                setModelFilter("ALL");
                setDatasetFilter("ALL");
                setStatusFilter("ALL");
              }}
            />
          </motion.section>

          {/* 5. Main Experiment Runs Table */}
          <motion.section variants={itemVariants} aria-label="Experiment Runs Table">
            {filteredRuns.length === 0 ? (
              <Card className="bg-white border border-slate-200/90 rounded-[16px] p-12 text-center shadow-xs">
                <CardContent className="space-y-3 p-0">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <FlaskConical className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">
                      No matching experiment runs found
                    </p>
                    <p className="text-xs text-slate-500">
                      No logged runs match your active search or filter criteria. Try clearing filters.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setModelFilter("ALL");
                      setDatasetFilter("ALL");
                      setStatusFilter("ALL");
                    }}
                    className="text-xs h-8 rounded-xl cursor-pointer"
                  >
                    Reset all filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <ExperimentRunsTable
                runs={filteredRuns}
                selectedRunIds={selectedRunIds}
                onToggleSelectRun={handleToggleSelectRun}
                onSelectAllRuns={handleSelectAllRuns}
                onClearSelection={handleClearSelection}
                onInspectRun={handleInspectRun}
                sortField={sortField}
                sortAsc={sortAsc}
                onToggleSort={toggleSort}
              />
            )}
          </motion.section>

          {/* 6. Experiment Lifecycle Timeline */}
          <motion.section variants={itemVariants} aria-label="Experiment Lifecycle Timeline">
            <ExperimentTimeline
              championRun={championRun}
              candidateRun={candidateRun}
              totalRuns={experiments.length}
            />
          </motion.section>

          {/* 7. Deterministic ML Reproducibility Footer */}
          <motion.section variants={itemVariants} aria-label="Deterministic ML Reproducibility">
            <ReproducibilityFooter
              datasetVersion={experiments[0]?.dataset_version || "1.0.0"}
              datasetHash={experiments[0]?.dataset_hash}
              mlflowVersion={experiments[0]?.tags?.mlflow_version || "3.16.1"}
            />
          </motion.section>
        </motion.div>
      )}

      {/* Floating Action Bar when runs are selected */}
      <FloatingComparisonBar
        selectedCount={selectedRunIds.length}
        onOpenComparison={() => setIsComparisonModalOpen(true)}
        onClearSelection={handleClearSelection}
      />

      {/* Side-by-Side Model Comparison Modal */}
      <ExperimentComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        selectedRuns={selectedRunsForComparison}
        onRemoveRun={handleRemoveFromComparison}
      />

      {/* Slide-out Run Detail Drawer */}
      <RunDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        runSummary={selectedRunForDetail}
      />
    </div>
  );
}
