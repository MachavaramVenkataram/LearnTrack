"use client";

import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Camera,
  CheckCircle2,
  Hash,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

interface ProfileHeroProps {
  fullName: string;
  rollNumber: string;
  department: string;
  university: string;
  year: number;
  semester: number;
  section?: string;
  avatarUrl?: string;
  onOpenAvatarPicker: () => void;
  isEditing?: boolean;
}

export function ProfileHero({
  fullName,
  rollNumber,
  department,
  university,
  year,
  semester,
  section,
  avatarUrl,
  onOpenAvatarPicker,
  isEditing: _isEditing,
}: ProfileHeroProps) {
  // Accurate completion calculation
  const fields = [
    { label: "Personal identity", completed: Boolean(fullName && fullName.trim()) },
    { label: "Enrollment & Roll No", completed: Boolean(rollNumber && rollNumber.trim()) },
    { label: "Institution & Campus", completed: Boolean(university && university.trim()) },
    { label: "Department / Program", completed: Boolean(department && department.trim()) },
    { label: "Academic year", completed: Boolean(year && year > 0) },
    { label: "Semester", completed: Boolean(semester && semester > 0) },
  ];

  const completedCount = fields.filter((f) => f.completed).length;
  const completionPercentage = Math.round((completedCount / fields.length) * 100);

  // Animated completion ring state (Section 32)
  const [animatedProgress, setAnimatedProgress] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(completionPercentage);
    }, 200);
    return () => clearTimeout(timer);
  }, [completionPercentage]);

  // SVG ring circumference
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  const yearOrdinal =
    year === 1
      ? "1st Year (Freshman)"
      : year === 2
      ? "2nd Year (Sophomore)"
      : year === 3
      ? "3rd Year (Junior)"
      : year === 4
      ? "4th Year (Senior)"
      : `${year}th Year`;

  return (
    <div className="relative bg-white border border-[#E2E8F0] rounded-[18px] p-6 shadow-xs overflow-hidden">
      {/* Subtle academic background pattern (Section 30) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(#2563EB 1px, transparent 1px), radial-gradient(#4F46E5 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 10px 10px",
        }}
      />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* LEFT & CENTER: Avatar + Academic Identity */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 min-w-0 flex-1">
          {/* Avatar Container (72-88px, rounded 20-24px) */}
          <div className="relative group shrink-0">
            <div className="w-[84px] h-[84px] rounded-[22px] overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-md transition-transform duration-200 group-hover:scale-105">
              <div className="w-full h-full rounded-[20px] overflow-hidden bg-white flex items-center justify-center">
                <Avatar
                  name={fullName || "Student"}
                  src={avatarUrl}
                  size="xl"
                  className="w-full h-full rounded-[20px] text-2xl font-bold"
                />
              </div>
            </div>

            {/* Quick Customize Avatar Trigger Overlay */}
            <button
              type="button"
              onClick={onOpenAvatarPicker}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-110 transition-all cursor-pointer z-10"
              title="Customize your avatar"
              aria-label="Customize avatar"
            >
              <Camera className="w-3.5 h-3.5 stroke-[2]" />
            </button>
          </div>

          {/* Academic Details */}
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                {fullName || "Student Academic Profile"}
              </h2>
              {rollNumber && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <Hash className="w-3 h-3 text-slate-400" />
                  {rollNumber}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 truncate">
                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="font-medium text-slate-800 truncate" title={university}>
                  {university || "Institution Not Specified"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 truncate">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="font-medium text-slate-800 truncate" title={department}>
                  {department || "Program Not Specified"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 pt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{yearOrdinal}</span>
              </div>

              <div className="flex items-center gap-1.5 pt-0.5">
                <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  Semester {semester}
                  {section ? ` (Section ${section})` : ""}
                </span>
              </div>
            </div>

            <div className="pt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenAvatarPicker}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-blue-500" />
                Customize Avatar
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Profile Completion Widget (Section 3 & 8) */}
        <div className="w-full lg:w-72 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 block">
                Profile Completion
              </span>
              <span className="text-xl font-extrabold text-slate-900 font-sans">
                {completionPercentage}%
              </span>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 -rotate-90 transform" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  className="text-slate-200"
                  strokeWidth="5"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  className="text-blue-600 transition-all duration-700 ease-out"
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <span className="absolute font-mono font-bold text-[11px] text-slate-700">
                {animatedProgress}%
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
            {completionPercentage === 100 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Your academic profile is complete.
              </span>
            ) : (
              <span className="text-slate-600">
                Complete your profile to personalize LearnTrack analytics and study recommendations.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
