"use client";

import React from "react";
import { User, Hash, Building2, GraduationCap, Lock } from "lucide-react";

interface AcademicIdentityCardProps {
  fullName: string;
  onFullNameChange: (val: string) => void;
  rollNumber: string;
  onRollNumberChange: (val: string) => void;
  university: string;
  onUniversityChange: (val: string) => void;
  department: string;
  onDepartmentChange: (val: string) => void;
  errors: Record<string, string>;
  isEditing: boolean;
}

export function AcademicIdentityCard({
  fullName,
  rollNumber,
  onRollNumberChange,
  university,
  onUniversityChange,
  department,
  onDepartmentChange,
  errors,
  isEditing,
}: AcademicIdentityCardProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600" />
          <h3 className="text-base font-bold text-slate-900 font-sans">
            Academic Identity
          </h3>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Your official academic credentials used across prediction pipelines and transcript evaluations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Full Name (Account Provider Identity) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Full Name
            </span>
            <span className="text-[10px] font-mono text-slate-400">Account Identity</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={fullName}
              disabled
              className="w-full h-11 px-3.5 rounded-[11px] border border-slate-200 bg-slate-50 text-slate-600 text-sm font-medium cursor-not-allowed select-none focus:outline-none"
            />
            <span className="absolute right-3 top-3 text-slate-400" title="Locked to primary account authentication">
              <Lock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Linked to your verified Supabase user profile.
          </p>
        </div>

        {/* Roll / Registration Number */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-blue-600" />
              Student Roll / Registration Number
            </span>
            <span className="text-[10px] font-mono text-blue-600 font-semibold">Required</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => onRollNumberChange(e.target.value.toUpperCase())}
              disabled={!isEditing}
              placeholder="e.g. 23JIRA43A8"
              className={`w-full h-11 px-3.5 rounded-[11px] border font-mono text-sm font-medium transition-all ${
                errors.roll_number
                  ? "border-rose-400 bg-rose-50/20 text-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  : isEditing
                  ? "border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                  : "border-slate-200 bg-slate-50/60 text-slate-800"
              }`}
            />
          </div>
          {errors.roll_number ? (
            <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.roll_number}</p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-1">
              Official university matriculation or departmental identifier.
            </p>
          )}
        </div>

        {/* University / Institution */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              University / College Institution
            </span>
            <span className="text-[10px] font-mono text-blue-600 font-semibold">Required</span>
          </label>
          <input
            type="text"
            value={university}
            onChange={(e) => onUniversityChange(e.target.value)}
            disabled={!isEditing}
            placeholder="e.g. Institute of Technology & Science"
            className={`w-full h-11 px-3.5 rounded-[11px] border text-sm font-medium transition-all ${
              errors.university
                ? "border-rose-400 bg-rose-50/20 text-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                : isEditing
                ? "border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                : "border-slate-200 bg-slate-50/60 text-slate-800"
            }`}
          />
          {errors.university ? (
            <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.university}</p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-1">
              Campus where your academic records and degree are granted.
            </p>
          )}
        </div>

        {/* Department / Program */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              Department / Specialization
            </span>
            <span className="text-[10px] font-mono text-indigo-600 font-semibold">Required</span>
          </label>
          <input
            type="text"
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
            disabled={!isEditing}
            placeholder="e.g. Computer Science & Engineering"
            className={`w-full h-11 px-3.5 rounded-[11px] border text-sm font-medium transition-all ${
              errors.department
                ? "border-rose-400 bg-rose-50/20 text-slate-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                : isEditing
                ? "border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                : "border-slate-200 bg-slate-50/60 text-slate-800"
            }`}
          />
          {errors.department ? (
            <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.department}</p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-1">
              Branch of study used to personalize course recommendations.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
