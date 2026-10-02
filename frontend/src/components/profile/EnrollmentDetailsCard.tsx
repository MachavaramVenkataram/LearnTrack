"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, Layers, ChevronDown, Check, Users } from "lucide-react";

interface EnrollmentDetailsCardProps {
  year: number;
  onYearChange: (val: number) => void;
  semester: number;
  onSemesterChange: (val: number) => void;
  section: string;
  onSectionChange: (val: string) => void;
  errors: Record<string, string>;
  isEditing: boolean;
}

const YEAR_OPTIONS = [
  { value: 1, label: "1st Year (Freshman)", sub: "Semesters 1 & 2" },
  { value: 2, label: "2nd Year (Sophomore)", sub: "Semesters 3 & 4" },
  { value: 3, label: "3rd Year (Junior)", sub: "Semesters 5 & 6" },
  { value: 4, label: "4th Year (Senior)", sub: "Semesters 7 & 8" },
  { value: 5, label: "5th Year (Graduate / Dual)", sub: "Advanced Cohort" },
];

const SEMESTER_OPTIONS = [
  { value: 1, label: "Semester 1", sub: "Fall / Term 1" },
  { value: 2, label: "Semester 2", sub: "Spring / Term 2" },
  { value: 3, label: "Semester 3", sub: "Fall / Term 3" },
  { value: 4, label: "Semester 4", sub: "Spring / Term 4" },
  { value: 5, label: "Semester 5", sub: "Fall / Term 5" },
  { value: 6, label: "Semester 6", sub: "Spring / Term 6" },
  { value: 7, label: "Semester 7", sub: "Fall / Term 7" },
  { value: 8, label: "Semester 8", sub: "Spring / Term 8" },
];

export function EnrollmentDetailsCard({
  year,
  onYearChange,
  semester,
  onSemesterChange,
  section,
  onSectionChange,
  errors,
  isEditing,
}: EnrollmentDetailsCardProps) {
  const [isYearOpen, setIsYearOpen] = useState(false);
  const [isSemesterOpen, setIsSemesterOpen] = useState(false);

  const yearRef = useRef<HTMLDivElement>(null);
  const semesterRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (yearRef.current && !yearRef.current.contains(event.target as Node)) {
        setIsYearOpen(false);
      }
      if (semesterRef.current && !semesterRef.current.contains(event.target as Node)) {
        setIsSemesterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedYearObj = YEAR_OPTIONS.find((y) => y.value === year) || YEAR_OPTIONS[0];
  const selectedSemesterObj = SEMESTER_OPTIONS.find((s) => s.value === semester) || SEMESTER_OPTIONS[0];

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          <h3 className="text-base font-bold text-slate-900 font-sans">
            Enrollment Details
          </h3>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Active academic term and cohort classification for semester scheduling.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Custom Academic Year Select (Section 15) */}
        <div className="relative" ref={yearRef}>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Current Academic Year
            </span>
          </label>

          <button
            type="button"
            disabled={!isEditing}
            onClick={() => isEditing && setIsYearOpen((prev) => !prev)}
            className={`w-full h-11 px-3.5 rounded-[11px] border text-left text-sm font-medium flex items-center justify-between transition-all ${
              !isEditing
                ? "bg-slate-50/60 border-slate-200 text-slate-800 cursor-default"
                : isYearOpen
                ? "bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-2xs"
                : "bg-white border-slate-200 text-slate-900 hover:border-slate-300 cursor-pointer shadow-2xs"
            }`}
            aria-haspopup="listbox"
            aria-expanded={isYearOpen}
          >
            <span className="truncate">{selectedYearObj.label}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isYearOpen ? "rotate-180" : ""}`} />
          </button>

          {isYearOpen && isEditing && (
            <div
              className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-elevated z-30 p-1 space-y-0.5 animate-in fade-in slide-in-from-top-2"
              role="listbox"
            >
              {YEAR_OPTIONS.map((opt) => {
                const isSelected = opt.value === year;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onYearChange(opt.value);
                      setIsYearOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <span className="block">{opt.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{opt.sub}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                );
              })}
            </div>
          )}

          {errors.year && <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.year}</p>}
        </div>

        {/* Custom Semester Select (Section 16) */}
        <div className="relative" ref={semesterRef}>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              Current Semester
            </span>
          </label>

          <button
            type="button"
            disabled={!isEditing}
            onClick={() => isEditing && setIsSemesterOpen((prev) => !prev)}
            className={`w-full h-11 px-3.5 rounded-[11px] border text-left text-sm font-medium flex items-center justify-between transition-all ${
              !isEditing
                ? "bg-slate-50/60 border-slate-200 text-slate-800 cursor-default"
                : isSemesterOpen
                ? "bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-2xs"
                : "bg-white border-slate-200 text-slate-900 hover:border-slate-300 cursor-pointer shadow-2xs"
            }`}
            aria-haspopup="listbox"
            aria-expanded={isSemesterOpen}
          >
            <span className="truncate">{selectedSemesterObj.label}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isSemesterOpen ? "rotate-180" : ""}`} />
          </button>

          {isSemesterOpen && isEditing && (
            <div
              className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-elevated z-30 p-1 space-y-0.5 animate-in fade-in slide-in-from-top-2 max-h-56 overflow-y-auto"
              role="listbox"
            >
              {SEMESTER_OPTIONS.map((opt) => {
                const isSelected = opt.value === semester;
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onSemesterChange(opt.value);
                      setIsSemesterOpen(false);
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <span className="block">{opt.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{opt.sub}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                );
              })}
            </div>
          )}

          {errors.semester && <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.semester}</p>}
        </div>

        {/* Section / Division (Section 17) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              Section / Division
            </span>
            <span className="text-[10px] font-mono text-slate-400">Optional</span>
          </label>
          <input
            type="text"
            value={section}
            onChange={(e) => onSectionChange(e.target.value.toUpperCase())}
            disabled={!isEditing}
            placeholder="e.g. A"
            className={`w-full h-11 px-3.5 rounded-[11px] border font-mono text-sm font-medium transition-all ${
              isEditing
                ? "border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
                : "border-slate-200 bg-slate-50/60 text-slate-800"
            }`}
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Used for academic organization and personalization.
          </p>
        </div>
      </div>
    </div>
  );
}
