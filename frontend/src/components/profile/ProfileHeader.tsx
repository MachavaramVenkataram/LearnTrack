"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Edit3, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ProfileHeaderProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  isProfileActive: boolean;
}

export function ProfileHeader({
  isEditing,
  onToggleEdit,
  isProfileActive,
}: ProfileHeaderProps) {
  return (
    <div className="space-y-4 pb-2 border-b border-slate-200">
      {/* Breadcrumb Navigation */}
      <nav
        className="flex items-center gap-1.5 text-xs text-slate-500 font-medium select-none"
        aria-label="Breadcrumb"
      >
        <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <span className="text-slate-900 font-bold">Student Profile</span>
      </nav>

      {/* Main Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
              ACADEMIC IDENTITY
            </span>
            {isProfileActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Profile active
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight">
            YOUR ACADEMIC PROFILE
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Manage your academic identity, enrollment details, and LearnTrack personalization.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          <Button
            variant={isEditing ? "outline" : "primary"}
            size="sm"
            onClick={onToggleEdit}
            className="gap-1.5 shadow-2xs cursor-pointer h-9 px-3.5 rounded-[10px]"
          >
            {isEditing ? (
              <>
                <X className="w-3.5 h-3.5 text-slate-500" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
