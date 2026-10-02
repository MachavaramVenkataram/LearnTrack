"use client";

import React from "react";
import { Eye, Bell, Award, Check } from "lucide-react";

interface PersonalizationCardProps {
  defaultView: "overview" | "analytics" | "simulator";
  onDefaultViewChange: (view: "overview" | "analytics" | "simulator") => void;
  gpaScale: "4.0" | "10.0" | "percentage";
  onGpaScaleChange: (scale: "4.0" | "10.0" | "percentage") => void;
  reminderPreference: "daily" | "weekly" | "off";
  onReminderPreferenceChange: (pref: "daily" | "weekly" | "off") => void;
  isEditing: boolean;
}

export function PersonalizationCard({
  defaultView,
  onDefaultViewChange,
  gpaScale,
  onGpaScaleChange,
  reminderPreference,
  onReminderPreferenceChange,
  isEditing,
}: PersonalizationCardProps) {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-600" />
          <h3 className="text-base font-bold text-slate-900 font-sans">
            LearnTrack Personalization
          </h3>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Customize how academic metrics, navigation defaults, and study alerts appear in your workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Preferred Default Dashboard View */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            Preferred Default View
          </label>
          <div className="space-y-1.5">
            {[
              { id: "overview" as const, label: "Executive Dashboard", desc: "Key academic summary" },
              { id: "analytics" as const, label: "Subject Analytics", desc: "Detailed breakdown" },
              { id: "simulator" as const, label: "Score Simulator", desc: "Interactive modeling" },
            ].map((opt) => (
              <div
                key={opt.id}
                onClick={() => isEditing && onDefaultViewChange(opt.id)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  defaultView === opt.id
                    ? "border-blue-500 bg-blue-50/50 shadow-2xs"
                    : isEditing
                    ? "border-slate-200 bg-white hover:bg-slate-50"
                    : "border-slate-200 bg-slate-50/50 cursor-default opacity-80"
                }`}
              >
                <div>
                  <span className={`block font-semibold ${defaultView === opt.id ? "text-blue-900" : "text-slate-800"}`}>
                    {opt.label}
                  </span>
                  <span className="text-[10.5px] text-slate-400">{opt.desc}</span>
                </div>
                {defaultView === opt.id && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* GPA Scale Display Format */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            Target Scale Representation
          </label>
          <div className="space-y-1.5">
            {[
              { id: "10.0" as const, label: "10.0 Point Scale", desc: "Standard collegiate GPA" },
              { id: "4.0" as const, label: "4.0 Point Scale", desc: "US / International scale" },
              { id: "percentage" as const, label: "Percentage (100%)", desc: "Continuous percentage" },
            ].map((opt) => (
              <div
                key={opt.id}
                onClick={() => isEditing && onGpaScaleChange(opt.id)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  gpaScale === opt.id
                    ? "border-indigo-500 bg-indigo-50/50 shadow-2xs"
                    : isEditing
                    ? "border-slate-200 bg-white hover:bg-slate-50"
                    : "border-slate-200 bg-slate-50/50 cursor-default opacity-80"
                }`}
              >
                <div>
                  <span className={`block font-semibold ${gpaScale === opt.id ? "text-indigo-900" : "text-slate-800"}`}>
                    {opt.label}
                  </span>
                  <span className="text-[10.5px] text-slate-400">{opt.desc}</span>
                </div>
                {gpaScale === opt.id && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Study Reminder Preference */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-purple-600" />
            Study Cadence Notifications
          </label>
          <div className="space-y-1.5">
            {[
              { id: "daily" as const, label: "Daily Priority Digest", desc: "Morning study plan alert" },
              { id: "weekly" as const, label: "Weekly Summary", desc: "Sunday progress check" },
              { id: "off" as const, label: "Surveillance Only", desc: "No scheduled alerts" },
            ].map((opt) => (
              <div
                key={opt.id}
                onClick={() => isEditing && onReminderPreferenceChange(opt.id)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  reminderPreference === opt.id
                    ? "border-purple-500 bg-purple-50/50 shadow-2xs"
                    : isEditing
                    ? "border-slate-200 bg-white hover:bg-slate-50"
                    : "border-slate-200 bg-slate-50/50 cursor-default opacity-80"
                }`}
              >
                <div>
                  <span className={`block font-semibold ${reminderPreference === opt.id ? "text-purple-900" : "text-slate-800"}`}>
                    {opt.label}
                  </span>
                  <span className="text-[10.5px] text-slate-400">{opt.desc}</span>
                </div>
                {reminderPreference === opt.id && <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
