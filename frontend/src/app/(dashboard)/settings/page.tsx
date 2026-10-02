"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, RotateCcw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import {
  SettingsNav,
  SettingsSectionId,
  AccountCredentialsSection,
  NotificationsSection,
  AppearanceSection,
  SecurityPrivacySection,
  AISystemSection,
  DangerZoneSection,
  SettingsSkeleton,
} from "@/components/settings";

export default function SettingsPage() {
  const { user, profile, studentProfile, deleteAccount, isLoading } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingsSectionId>("account");
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [isSavingChanges, setIsSavingChanges] = useState(false);

  // Manual save trigger for any dirty changes
  const handleSaveAllChanges = () => {
    setIsSavingChanges(true);
    setTimeout(() => {
      setIsSavingChanges(false);
      setHasPendingChanges(false);
    }, 600);
  };

  if (isLoading && !profile && !user) {
    return <SettingsSkeleton />;
  }

  // Error boundary / fallback if user authentication state failed to initialize
  if (!user && !isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <RotateCcw className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Settings Unavailable</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          We couldn&apos;t retrieve your authenticated student session. Please check your credentials or re-authenticate.
        </p>
        <Link href="/login">
          <Button variant="primary" size="sm" className="mt-2 text-xs">
            Return to Login
          </Button>
        </Link>
      </div>
    );
  }

  const authenticatedEmail = profile?.email || user?.email || "";
  const studentId = studentProfile?.id || user?.id || "student";

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-6xl pb-16">
      {/* 1. Page Header with Status & Breadcrumbs */}
      <div className="space-y-3 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/dashboard" className="hover:text-slate-800 transition-colors">
            Dashboard
          </Link>
          <span>›</span>
          <span className="text-slate-900 font-medium">Settings & Preferences</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Settings & Preferences
              </h1>

              {/* Status Indicator */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                {hasPendingChanges ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Unsaved changes
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    All changes saved
                  </>
                )}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Manage your LearnTrack account, notifications, appearance, security, privacy, and data preferences.
            </p>
          </div>

          {/* Top-Right Save Changes Button (only active when pending changes exist) */}
          {hasPendingChanges && (
            <div className="shrink-0 animate-in fade-in">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveAllChanges}
                disabled={isSavingChanges}
                leftIcon={<Check className="w-3.5 h-3.5" />}
                className="h-9 px-4 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-xs cursor-pointer"
              >
                {isSavingChanges ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Settings Layout: Left Navigation + Right Content Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Navigation (3 cols on lg, 4 cols on md) */}
        <div className="md:col-span-4 lg:col-span-3">
          <div className="sticky top-20">
            <SettingsNav
              activeSection={activeSection}
              onSelectSection={setActiveSection}
            />
          </div>
        </div>

        {/* Right Content Panel (9 cols on lg, 8 cols on md) */}
        <div className="md:col-span-8 lg:col-span-9 min-w-0">
          {activeSection === "account" && (
            <AccountCredentialsSection
              userEmail={authenticatedEmail}
              profile={profile}
              studentProfile={studentProfile}
            />
          )}

          {activeSection === "notifications" && <NotificationsSection />}

          {activeSection === "appearance" && <AppearanceSection />}

          {activeSection === "security" && (
            <SecurityPrivacySection
              userEmail={authenticatedEmail}
              userId={studentId}
              profile={profile}
              studentProfile={studentProfile}
            />
          )}

          {activeSection === "ai" && <AISystemSection />}

          {activeSection === "danger" && (
            <DangerZoneSection onDeleteAccount={deleteAccount} />
          )}
        </div>
      </div>
    </div>
  );
}
