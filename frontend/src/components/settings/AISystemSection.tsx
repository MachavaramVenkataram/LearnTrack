"use client";

import React, { useEffect, useState } from "react";
import {
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Shield,
  ArrowRight,
  Zap,
  Layers,
  Clock,
  Activity,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type ProviderStatus =
  | "HEALTHY"
  | "NOT_CONFIGURED"
  | "INVALID_CREDENTIALS"
  | "INVALID_MODEL"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "PROVIDER_ERROR";

interface ProviderData {
  configured: boolean;
  reachable: boolean;
  status: ProviderStatus;
  model: string;
  latencyMs?: number;
  error?: string;
  requests?: number;
  successRate?: number;
}

interface AIHealthResponse {
  success: boolean;
  overallStatus: "healthy" | "degraded" | "unavailable";
  providers: {
    gemini: ProviderData;
    groq: ProviderData;
  };
  router: {
    primary: string;
    fallback: string;
    fallbackEnabled: boolean;
    fallbackCount: number;
    totalRequests: number;
  };
  cached: boolean;
  timestamp: string;
}

export function AISystemSection() {
  const [data, setData] = useState<AIHealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = forceRefresh ? "/api/ai/health?refresh=true" : "/api/ai/health";
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to load AI diagnostic`);
      }
      const json: AIHealthResponse = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || "Failed to load AI system status");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth(false);
  }, []);

  const overallStatus = data?.overallStatus || "unavailable";

  const renderStatusPill = (status: ProviderStatus, reachable: boolean) => {
    if (reachable && status === "HEALTHY") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Connected
        </span>
      );
    }

    if (status === "RATE_LIMITED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          Rate Limited
        </span>
      );
    }

    if (status === "INVALID_MODEL") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertCircle className="w-3 h-3 text-amber-600" />
          Invalid Model
        </span>
      );
    }

    if (status === "NOT_CONFIGURED") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <XCircle className="w-3 h-3 text-slate-400" />
          Not Configured
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle className="w-3 h-3 text-rose-600" />
        {status}
      </span>
    );
  };

  const getOverallStatusBadge = () => {
    if (overallStatus === "healthy") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          All Providers Healthy
        </span>
      );
    }
    if (overallStatus === "degraded") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          Degraded (Fallback Active)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
        Unavailable
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI System & Provider Diagnostics</h2>
              <p className="text-xs text-slate-500">
                Central Router architecture: Gemini (Primary) + Groq (Fallback) with live connectivity verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getOverallStatusBadge()}
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchHealth(true)}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
              className="text-xs h-8 px-3 rounded-lg"
            >
              Live Test
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 2. Provider Hierarchy Configuration Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Primary Provider
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="text-sm font-bold text-slate-900 capitalize">
                  {data?.router?.primary || "Gemini"}
                </span>
              </div>
              {data?.providers?.gemini &&
                renderStatusPill(data.providers.gemini.status, data.providers.gemini.reachable)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Default generation engine</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Fallback Provider
            </span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-sm font-bold text-slate-900 capitalize">
                  {data?.router?.fallback || "Groq"}
                </span>
              </div>
              {data?.providers?.groq &&
                renderStatusPill(data.providers.groq.status, data.providers.groq.reachable)}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Automatic failover engine</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Failover Status
            </span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/70 text-emerald-800">
                {data?.router?.fallbackEnabled !== false ? "Enabled" : "Disabled"}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Invocations: {data?.router?.fallbackCount ?? 0}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Total Traffic
            </span>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-bold text-slate-900">
                {data?.router?.totalRequests ?? 0} requests
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {data?.cached ? "Diagnostic: cached (60s)" : "Diagnostic: live probe"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Failover Architecture Diagram */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          Central Router Failover Architecture
        </h3>

        <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-slate-50/60 border border-slate-200/60 text-xs">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold shadow-xs">
              LearnTrack Feature
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-slate-800 text-white font-semibold flex items-center gap-1.5 shadow-xs">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Central AI Router
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 shadow-xs">
              Gemini (Primary)
            </div>
            <span className="text-[11px] text-slate-400 font-medium">or 429/503</span>
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 font-semibold border border-amber-200 shadow-xs">
              Groq (Fallback)
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 shadow-xs">
            Validated Result
          </div>
        </div>
      </div>

      {/* 4. Provider Real Health & Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gemini Provider Diagnostics */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <h4 className="text-sm font-bold text-slate-900">Google Gemini (Primary)</h4>
            </div>
            {data?.providers?.gemini &&
              renderStatusPill(data.providers.gemini.status, data.providers.gemini.reachable)}
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Configured Model</span>
              <span className="font-semibold text-slate-900 font-mono text-[11px]">
                {data?.providers?.gemini?.model || "gemini-flash-latest"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Live Connectivity</span>
              <span className="font-semibold text-slate-900">
                {data?.providers?.gemini?.reachable ? "Verified (200 OK)" : "Unreachable"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Diagnostic Latency</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {data?.providers?.gemini?.latencyMs ? `${data.providers.gemini.latencyMs} ms` : "—"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Requests Handled</span>
              <span className="font-semibold text-slate-900">
                {data?.providers?.gemini?.requests ?? 0}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Success Rate</span>
              <span className="font-semibold text-slate-900">
                {data?.providers?.gemini?.successRate !== undefined
                  ? `${Math.round(data.providers.gemini.successRate)}%`
                  : "100%"}
              </span>
            </div>
            {data?.providers?.gemini?.error && (
              <div className="p-2 rounded bg-amber-50 text-[11px] text-amber-700">
                {data.providers.gemini.error}
              </div>
            )}
          </div>
        </div>

        {/* Groq Provider Diagnostics */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h4 className="text-sm font-bold text-slate-900">Groq (Fallback)</h4>
            </div>
            {data?.providers?.groq &&
              renderStatusPill(data.providers.groq.status, data.providers.groq.reachable)}
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Configured Model</span>
              <span className="font-semibold text-slate-900 font-mono text-[11px]">
                {data?.providers?.groq?.model || "qwen/qwen3.8-27b"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Live Connectivity</span>
              <span className="font-semibold text-slate-900">
                {data?.providers?.groq?.reachable ? "Verified (200 OK)" : "Unreachable"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Diagnostic Latency</span>
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {data?.providers?.groq?.latencyMs ? `${data.providers.groq.latencyMs} ms` : "—"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Requests Handled</span>
              <span className="font-semibold text-slate-900">
                {data?.providers?.groq?.requests ?? 0}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-500">Fallback Invocations</span>
              <span className="font-semibold text-slate-900">
                {data?.router?.fallbackCount ?? 0}
              </span>
            </div>
            {data?.providers?.groq?.error && (
              <div className="p-2 rounded bg-amber-50 text-[11px] text-amber-700">
                {data.providers.groq.error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Security & Isolation Guarantee */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-4 text-xs text-slate-600 flex items-start gap-3">
        <Shield className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-900">Server-Side Security & Zero Key Leakage Guarantee</p>
          <p className="text-slate-500 leading-relaxed text-[11px]">
            API credentials (GEMINI_API_KEY, GROQ_API_KEY) are strictly server-only. They are never exposed to browser
            network payloads, HTML responses, client bundles, or local storage. Health diagnostics only return reachability
            and latency status.
          </p>
        </div>
      </div>
    </div>
  );
}
