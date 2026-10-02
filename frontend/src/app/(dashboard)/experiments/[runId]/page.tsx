"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Cpu,
  Database,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Tag,
  Clock,
  Sparkles,
  GitCommit,
  Terminal,
  FolderArchive,
  BarChart2,
  TrendingDown,
  Info,
  Award,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/States";
import { getExperimentDetail, ExperimentDetail } from "@/lib/api/mlOps";

export default function ExperimentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params?.runId as string;

  const [run, setRun] = useState<ExperimentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDetail() {
      if (!runId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await getExperimentDetail(runId);
        if (!data) {
          setError(`Run ${runId} was not found in MLflow.`);
        } else {
          setRun(data);
        }
      } catch (err: any) {
        console.error("Failed to load run detail:", err);
        setError("Error loading experiment details from MLflow tracking server.");
      } finally {
        setIsLoading(false);
      }
    }
    loadDetail();
  }, [runId]);

  if (isLoading) {
    return <LoadingState message="Fetching experiment run telemetry..." />;
  }

  if (error || !run) {
    return (
      <div className="space-y-6">
        <Link href="/experiments">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Experiments
          </Button>
        </Link>
        <Card className="border-rose-200 bg-rose-50/50">
          <CardContent className="p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="text-base font-bold text-rose-900">Run Not Found</h3>
            <p className="text-xs text-rose-700">{error || "Unable to retrieve run information."}</p>
            <Link href="/experiments">
              <Button size="sm" variant="outline" className="mt-2">
                Return to Experiments List
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isChampion = Boolean(run.is_champion || run.tags?.champion === "true" || run.tags?.is_champion === "true");
  const gitCommit = run.tags?.git_commit || run.tags?.["mlflow.source.git.commit"];
  const paramsMap = run.params || run.parameters || {};

  // Group metrics
  const trainMetrics = Object.entries(run.metrics || {}).filter(([k]) => k.startsWith("train_"));
  const valMetrics = Object.entries(run.metrics || {}).filter(([k]) => k.startsWith("val_"));
  const cvMetrics = Object.entries(run.metrics || {}).filter(([k]) => k.startsWith("cv_"));
  const testMetrics = Object.entries(run.metrics || {}).filter(([k]) => k.startsWith("test_"));

  const formattedStartTime = run.start_time
    ? typeof run.start_time === "number"
      ? new Date(run.start_time).toLocaleString()
      : new Date(String(run.start_time)).toLocaleString()
    : "Recent execution";

  return (
    <div className="space-y-8 pb-12">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/experiments">
          <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            Back to Experiments
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {isChampion && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <Award className="w-3.5 h-3.5" />
              Active Production Champion
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              run.status === "FINISHED"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                run.status === "FINISHED" ? "bg-emerald-500" : "bg-blue-500"
              }`}
            />
            {run.status}
          </span>
        </div>
      </div>

      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-soft-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                MLflow Run
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-semibold">
                {run.run_id}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {run.model_name}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Trained on {formattedStartTime} •
              Experiment: <span className="font-semibold text-slate-700">learntrack-student-performance</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/ml-monitoring">
              <Button variant="outline" size="sm" className="gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                View Monitoring
              </Button>
            </Link>
            <Link href="/admin/model">
              <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Cpu className="w-4 h-4" />
                Model Benchmark
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Validation RMSE
            </span>
            <p className="text-2xl font-bold font-mono text-slate-900">
              {run.metrics?.val_rmse !== undefined ? run.metrics.val_rmse.toFixed(3) : "—"}
            </p>
            <p className="text-[11px] text-slate-400">Root Mean Squared Error</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Validation MAE
            </span>
            <p className="text-2xl font-bold font-mono text-slate-900">
              {run.metrics?.val_mae !== undefined ? run.metrics.val_mae.toFixed(3) : "—"}
            </p>
            <p className="text-[11px] text-slate-400">Mean Absolute Error</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Validation R² Score
            </span>
            <p className="text-2xl font-bold font-mono text-emerald-600">
              {run.metrics?.val_r2 !== undefined ? run.metrics.val_r2.toFixed(3) : "—"}
            </p>
            <p className="text-[11px] text-slate-400">Coefficient of Determination</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Test RMSE (Generalization)
            </span>
            <p className="text-2xl font-bold font-mono text-slate-900">
              {run.metrics?.test_rmse !== undefined ? run.metrics.test_rmse.toFixed(3) : "—"}
            </p>
            <p className="text-[11px] text-slate-400">Independent Out-of-fold Test</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metrics Breakdown & Parameters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Dynamic Metrics Table */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                Performance Metrics Evaluation
              </CardTitle>
              <CardDescription className="text-xs">
                Empirical metrics computed dynamically during cross-validation and test set evaluation.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Validation & Test */}
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Validation & Test Sets
                  </h4>
                  <div className="space-y-1.5 font-mono text-xs">
                    {valMetrics.map(([k, v]) => (
                      <div key={k} className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">{k}</span>
                        <span className="font-semibold text-slate-900">{typeof v === "number" ? v.toFixed(4) : String(v)}</span>
                      </div>
                    ))}
                    {testMetrics.map(([k, v]) => (
                      <div key={k} className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">{k}</span>
                        <span className="font-semibold text-slate-900">{typeof v === "number" ? v.toFixed(4) : String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5-Fold Cross Validation */}
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    5-Fold Cross Validation
                  </h4>
                  <div className="space-y-1.5 font-mono text-xs">
                    {cvMetrics.length > 0 ? (
                      cvMetrics.map(([k, v]) => (
                        <div key={k} className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">{k}</span>
                          <span className="font-semibold text-slate-900">{typeof v === "number" ? v.toFixed(4) : String(v)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No CV metrics recorded for this run.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actual Logged Hyperparameters */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600" />
                Hyperparameters & Configuration
              </CardTitle>
              <CardDescription className="text-xs">
                Parameters supplied to the estimator during training and optimization.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {Object.keys(paramsMap).length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hyperparameters recorded.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(paramsMap).map(([key, val]) => (
                    <div
                      key={key}
                      className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/80 font-mono text-xs"
                    >
                      <span className="text-[10px] text-slate-400 block truncate">{key}</span>
                      <span className="font-semibold text-slate-800 break-all">{String(val)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Model Artifacts */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FolderArchive className="w-4 h-4 text-purple-600" />
                MLflow Artifact Lineage
              </CardTitle>
              <CardDescription className="text-xs">
                Serialized models, preprocessing pipelines, and evaluation plots saved for this run.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {!run.artifacts || run.artifacts.length === 0 ? (
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-mono">
                    Artifact URI: {run.artifact_uri || "local MLflow run store"}
                  </p>
                  <p className="text-xs text-slate-400 italic">Models, scaler, and SHAP artifacts preserved in MLflow tracking directory.</p>
                </div>
              ) : (
                <div className="space-y-1.5 font-mono text-xs">
                  {run.artifacts.map((art, idx) => {
                    const pathStr = typeof art === "string" ? art : art.path;
                    const isDir = typeof art === "object" ? art.is_dir : false;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="text-slate-800 truncate">{pathStr}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {isDir ? "Directory" : "File"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Dataset & Environment Traceability */}
        <div className="space-y-6">
          {/* Dataset Lineage */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                Dataset Provenance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Dataset Version</span>
                <p className="font-semibold text-slate-800 mt-0.5 font-mono">
                  v{run.dataset_version}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">SHA-256 Dataset Hash</span>
                <p className="font-mono text-[11px] text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 break-all select-all mt-1">
                  {run.dataset_hash || run.tags?.dataset_hash || "Deterministic SHA-256 hash not available"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400">Train Rows</span>
                  <p className="font-mono font-bold text-slate-800">
                    {String(paramsMap.train_row_count ?? run.tags?.train_row_count ?? "—")}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Features</span>
                  <p className="font-mono font-bold text-slate-800">
                    {String(paramsMap.feature_count ?? run.tags?.feature_count ?? "5")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment & Git Metadata */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <GitCommit className="w-4 h-4 text-slate-600" />
                Runtime & Environment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs font-mono">
              <div>
                <span className="text-slate-400 font-sans">Git Commit</span>
                <p className="text-slate-800 font-semibold mt-0.5 truncate">
                  {gitCommit ? gitCommit.slice(0, 10) : "Local development checkout"}
                </p>
              </div>
              <div>
                <span className="text-slate-400 font-sans">Python Version</span>
                <p className="text-slate-800 mt-0.5">{run.tags?.python_version || "3.13"}</p>
              </div>
              <div>
                <span className="text-slate-400 font-sans">scikit-learn Version</span>
                <p className="text-slate-800 mt-0.5">{run.tags?.sklearn_version || "1.6+"}</p>
              </div>
              <div>
                <span className="text-slate-400 font-sans">MLflow Version</span>
                <p className="text-slate-800 mt-0.5">{run.tags?.mlflow_version || "3.16.1"}</p>
              </div>
            </CardContent>
          </Card>

          {/* All Tags */}
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-600" />
                Run Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {Object.entries(run.tags).map(([key, val]) => (
                <div key={key} className="text-xs">
                  <span className="text-slate-400 font-mono text-[10px] block truncate">{key}</span>
                  <span className="text-slate-800 font-medium break-all">{val}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
