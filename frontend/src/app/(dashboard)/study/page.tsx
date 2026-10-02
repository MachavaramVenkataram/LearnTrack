"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  GraduationCap,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { StudyActivity, Subject, StudyPlan, AcademicGoal } from "@/types/academic";
import {
  getStudyActivities,
  createStudyActivity,
  deleteStudyActivity,
  getSubjects,
  getActiveStudyPlan,
  getAcademicGoals,
} from "@/lib/academic/service";
import { calculateStudyStats } from "@/lib/academic/calculations";
import { supabase } from "@/lib/supabase";

// Modular Components
import { StudyActivityHeader } from "@/components/study-activity/StudyActivityHeader";
import { StudyMetricsSummary } from "@/components/study-activity/StudyMetricsSummary";
import { StudyActivityChart } from "@/components/study-activity/StudyActivityChart";
import { StudyConsistencyHeatmap } from "@/components/study-activity/StudyConsistencyHeatmap";
import { StudyTimeBySubject } from "@/components/study-activity/StudyTimeBySubject";
import { RecentStudySessionsList } from "@/components/study-activity/RecentStudySessionsList";
import { StudyIntegrationsPanel } from "@/components/study-activity/StudyIntegrationsPanel";
import { LogStudySessionModal } from "@/components/study-activity/LogStudySessionModal";
import { StudyActivityEmptyState } from "@/components/study-activity/StudyActivityEmptyState";
import { StudyActivitySkeleton } from "@/components/study-activity/StudyActivitySkeleton";

export default function StudyPage() {
  const { studentProfile, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  // Core Data State
  const [activities, setActivities] = useState<StudyActivity[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [goals, setGoals] = useState<AcademicGoal[]>([]);

  // Page State
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Modal State
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StudyActivity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load all user study & academic context
  const loadData = useCallback(async () => {
    if (!studentProfile) return;
    setIsLoading(true);
    setLoadError(null);

    try {
      const [acts, subs, plan, userGoals] = await Promise.all([
        getStudyActivities(studentProfile.id, 100),
        getSubjects(studentProfile.id),
        getActiveStudyPlan(studentProfile.id),
        getAcademicGoals(studentProfile.id),
      ]);

      setActivities(acts);
      setSubjects(subs);
      setActivePlan(plan);
      setGoals(userGoals);
    } catch (err: any) {
      console.error("[StudyActivityPage] Error loading data:", err);
      setLoadError(err?.message || "Failed to load study activity.");
      showToast("Unable to load study activity", "Please check your network connection and retry.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [studentProfile, showToast]);

  useEffect(() => {
    if (studentProfile) {
      loadData();
    } else if (!authLoading) {
      setIsLoading(false);
    }
  }, [studentProfile, authLoading, loadData]);

  // Realtime updates subscription via Supabase
  useEffect(() => {
    if (!studentProfile) return;

    const channel = supabase
      .channel(`study_activity_${studentProfile.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "study_activity",
          filter: `student_id=eq.${studentProfile.id}`,
        },
        () => {
          // Re-fetch activities silently without triggering full loading skeleton
          getStudyActivities(studentProfile.id, 100).then((acts) => {
            setActivities(acts);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentProfile]);

  // Calculated Stats
  const stats = useMemo(() => {
    return calculateStudyStats(activities);
  }, [activities]);

  // Handle Command Palette or custom event opening
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("action") === "add") {
        setIsLogModalOpen(true);
        window.history.replaceState({}, "", window.location.pathname);
      }
    }

    const handleCustomAction = (e: any) => {
      if (e.detail?.action === "add-study") {
        setIsLogModalOpen(true);
      }
    };
    window.addEventListener("learntrack:open-action", handleCustomAction);
    return () => window.removeEventListener("learntrack:open-action", handleCustomAction);
  }, []);

  // Handle Save Session
  const handleSaveSession = async (payload: {
    student_id: string;
    study_date: string;
    study_hours: number;
    assignments_completed: number;
    notes?: string;
  }): Promise<boolean> => {
    try {
      const { data, error } = await createStudyActivity(payload);
      if (error || !data) {
        showToast("Error saving study session", error || "Could not log activity.", "error");
        return false;
      }

      showToast(
        "Study session logged",
        `${payload.study_hours}h recorded for ${payload.study_date}.`,
        "success"
      );

      // Refresh list
      const updatedActs = await getStudyActivities(studentProfile!.id, 100);
      setActivities(updatedActs);
      return true;
    } catch (err: any) {
      showToast("Unable to save session", err?.message, "error");
      return false;
    }
  };

  // Handle Delete Session
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const success = await deleteStudyActivity(deleteTarget.id);
      if (!success) {
        showToast("Deletion failed", "Could not remove study session.", "error");
      } else {
        showToast("Session deleted", "Study session removed from history.", "success");
        setDeleteTarget(null);
        if (studentProfile) {
          const updatedActs = await getStudyActivities(studentProfile.id, 100);
          setActivities(updatedActs);
        }
      }
    } catch (err: any) {
      showToast("Deletion error", err?.message, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Onboarding Required State
  if (!authLoading && !studentProfile) {
    return (
      <div className="space-y-6">
        <StudyActivityHeader
          onOpenLogModal={() => {}}
          hasActivities={false}
        />
        <Card className="p-8 text-center max-w-lg mx-auto border-blue-100 bg-blue-50/30">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Academic Profile Required</h3>
          <p className="text-xs text-slate-600 mt-2 mb-6 leading-relaxed">
            Please complete your student profile onboarding to log your daily study activity.
          </p>
          <Link href="/onboarding">
            <Button variant="primary" size="md">
              Complete Onboarding
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Error State
  if (loadError && !isLoading && activities.length === 0) {
    return (
      <div className="space-y-6">
        <StudyActivityHeader
          onOpenLogModal={() => setIsLogModalOpen(true)}
          hasActivities={false}
        />
        <div className="p-8 rounded-2xl bg-white border border-rose-200 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Unable to load study activity</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We encountered an issue communicating with the database. Please try again.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Page Header */}
      <StudyActivityHeader
        onOpenLogModal={() => setIsLogModalOpen(true)}
        hasActivities={activities.length > 0}
      />

      {isLoading ? (
        <StudyActivitySkeleton />
      ) : (
        <>
          {/* 2. KPI Metrics Summary Cards */}
          <StudyMetricsSummary
            activities={activities}
            totalHours={stats.totalHours}
            averageDailyHours={stats.averageDailyHours}
            totalAssignmentsCompleted={stats.totalAssignmentsCompleted}
          />

          {activities.length === 0 ? (
            /* 3. Empty Onboarding State */
            <div className="p-6 sm:p-10 rounded-2xl bg-white border border-[#E2E8F0] shadow-2xs">
              <StudyActivityEmptyState onOpenLogModal={() => setIsLogModalOpen(true)} />
            </div>
          ) : (
            <>
              {/* 4. Primary Analytics: Study Hours Area Chart */}
              <StudyActivityChart activities={activities} />

              {/* 5. 2-Column Grid: Consistency Heatmap & Subject Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <StudyConsistencyHeatmap activities={activities} />
                <StudyTimeBySubject activities={activities} subjects={subjects} />
              </div>

              {/* 6. Recent Study Sessions Table / List */}
              <RecentStudySessionsList
                activities={activities}
                onDeleteSession={(act) => setDeleteTarget(act)}
              />

              {/* 7. Academic Integrations: Study Plan, Goals, Deterministic Insights */}
              <StudyIntegrationsPanel
                activities={activities}
                activePlan={activePlan}
                goals={goals}
              />
            </>
          )}
        </>
      )}

      {/* Log Session Modal */}
      {studentProfile && (
        <LogStudySessionModal
          isOpen={isLogModalOpen}
          onClose={() => setIsLogModalOpen(false)}
          subjects={subjects}
          studentId={studentProfile.id}
          onSave={handleSaveSession}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete this study session?"
        description="This entry will be permanently removed from your activity history."
      >
        <div className="space-y-4 pt-2">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>
              Session: <strong>{deleteTarget?.study_date}</strong> ({deleteTarget?.study_hours}h). This action cannot be undone.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
              disabled={isDeleting}
            >
              Delete Session
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
