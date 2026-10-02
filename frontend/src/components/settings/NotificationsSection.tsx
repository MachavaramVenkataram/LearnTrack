"use client";

import React, { useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

export interface NotificationPreferences {
  predictionAlerts: boolean;
  attendanceAlerts: boolean;
  studyReminders: boolean;
  weeklyDigest: boolean;
  systemAnnouncements: boolean;
  securityAlerts: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  predictionAlerts: true,
  attendanceAlerts: true,
  studyReminders: true,
  weeklyDigest: false,
  systemAnnouncements: true,
  securityAlerts: true,
};

interface ToggleRowProps {
  id: keyof NotificationPreferences;
  title: string;
  description: string;
  checked: boolean;
  onChange: (id: keyof NotificationPreferences, value: boolean) => void;
  disabled?: boolean;
}

function ToggleRow({ id, title, description, checked, onChange, disabled }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-100 last:border-b-0 gap-4">
      <div className="flex-1 pr-2">
        <label
          htmlFor={`toggle-${id}`}
          className="text-xs font-semibold text-slate-900 cursor-pointer select-none block"
        >
          {title}
        </label>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
          {description}
        </p>
      </div>

      <button
        id={`toggle-${id}`}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(id, !checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? "bg-blue-600" : "bg-slate-200"
        }`}
      >
        <span className="sr-only">Toggle {title}</span>
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export function NotificationsSection() {
  const { showToast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("learntrack_pref_notifications");
        if (stored) {
          return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
        }
      } catch {
        // Fallback to default
      }
    }
    return DEFAULT_PREFERENCES;
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

  const handleToggle = (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    setSaveStatus("saving");

    try {
      localStorage.setItem("learntrack_pref_notifications", JSON.stringify(updated));
      setTimeout(() => {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      }, 300);
    } catch {
      setSaveStatus("idle");
      showToast("Error", "Unable to persist notification preferences", "error");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base text-slate-900 flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              Notifications & Alerts
            </CardTitle>
            <CardDescription>
              Choose how LearnTrack keeps you informed across predictions and study routines
            </CardDescription>
          </div>

          {/* Real-time Status Badge */}
          <div className="text-[11px] font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/70">
            {saveStatus === "saving" ? (
              <>
                <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
                <span className="text-slate-600">Saving...</span>
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Updated</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-slate-500">Auto-saved</span>
              </>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* GROUP 1: Academic Updates */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
              ACADEMIC UPDATES
            </h4>
            <div className="divide-y divide-slate-100">
              <ToggleRow
                id="predictionAlerts"
                title="Prediction Updates"
                description="Receive updates whenever continuous assessment scores alter your predicted semester GPA or risk classification."
                checked={preferences.predictionAlerts}
                onChange={handleToggle}
              />
              <ToggleRow
                id="attendanceAlerts"
                title="Attendance Threshold Alerts"
                description="Receive immediate alerts if any registered subject attendance falls beneath the 75% institutional threshold."
                checked={preferences.attendanceAlerts}
                onChange={handleToggle}
              />
            </div>
          </div>

          {/* GROUP 2: Study & Productivity */}
          <div className="pt-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
              STUDY & PRODUCTIVITY
            </h4>
            <div className="divide-y divide-slate-100">
              <ToggleRow
                id="studyReminders"
                title="Study Session Reminders"
                description="Prompt reminders for upcoming study blocks scheduled in your LearnTrack AI Study Planner."
                checked={preferences.studyReminders}
                onChange={handleToggle}
              />
              <ToggleRow
                id="weeklyDigest"
                title="Weekly Academic Digest"
                description="Weekly email summarizing completed study sessions, upcoming assignment deadlines, and performance momentum."
                checked={preferences.weeklyDigest}
                onChange={handleToggle}
              />
            </div>
          </div>

          {/* GROUP 3: Security & Account */}
          <div className="pt-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-2">
              SECURITY & ACCOUNT
            </h4>
            <div className="divide-y divide-slate-100">
              <ToggleRow
                id="systemAnnouncements"
                title="System Announcements"
                description="Notices regarding platform upgrades, syllabus schedule changes, and semester boundary shifts."
                checked={preferences.systemAnnouncements}
                onChange={handleToggle}
              />
              <ToggleRow
                id="securityAlerts"
                title="Security & Auth Alerts"
                description="Immediate notifications for new session logins, password changes, or multi-tenant permission changes."
                checked={preferences.securityAlerts}
                onChange={handleToggle}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
