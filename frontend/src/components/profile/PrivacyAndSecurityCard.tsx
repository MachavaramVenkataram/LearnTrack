"use client";

import React from "react";
import Link from "next/link";
import { Lock, ShieldCheck, ExternalLink, CheckCircle2 } from "lucide-react";

interface PrivacyAndSecurityCardProps {
  email?: string;
  profileId?: string;
  updatedAt?: string;
  createdAt?: string;
}

export function PrivacyAndSecurityCard({
  email,
  profileId,
  updatedAt,
  createdAt,
}: PrivacyAndSecurityCardProps) {
  // Mask Profile ID for technical security
  const maskedId = profileId
    ? `${profileId.slice(0, 8)}••••••••${profileId.slice(-4)}`
    : "LT-SESSION";

  const formattedDate = (isoString?: string) => {
    if (!isoString) return "Current Academic Term";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Current Academic Term";
    }
  };

  const lastUpdateDisplay = formattedDate(updatedAt || createdAt);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 font-sans">
              Privacy &amp; Data Security
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Institutional confidentiality, database Row-Level Security, and account credentials.
          </p>
        </div>

        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors self-start sm:self-auto shadow-2xs"
        >
          <span>Account Settings</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Privacy Assurance */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>PostgreSQL Row-Level Security (RLS)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your academic identity and coursework grades are strictly partitioned using PostgreSQL
            Row-Level Security. No student or external party can read or mutate your academic data.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] font-mono text-emerald-700 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>FERPA &amp; Academic Data Policy Enforced</span>
          </div>
        </div>

        {/* Account Security Telemetry */}
        <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Authentication Status</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Authenticated
            </span>
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-200/60 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Account Email:</span>
              <span className="font-semibold text-slate-800">{email || "student@learntrack.dev"}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Profile Identifier:</span>
              <span className="text-slate-700">{maskedId}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Last Profile Update:</span>
              <span className="text-slate-700">{lastUpdateDisplay}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
