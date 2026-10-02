/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, ArrowRight } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { updateStudentProfile } from "@/lib/academic/service";
import { validateStudentProfile } from "@/lib/validations/academic";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ProfileHeader,
  ProfileHero,
  AvatarPickerModal,
  AcademicIdentityCard,
  EnrollmentDetailsCard,
  PersonalizationCard,
  AcademicContextCard,
  AcademicContextDrawer,
  PrivacyAndSecurityCard,
  UnsavedChangesBar,
  ProfileSkeleton,
} from "@/components/profile";

export default function ProfilePage() {
  const { user, profile, studentProfile, isLoading: authLoading, refreshStudentProfile, updateProfile } = useAuth();
  const { showToast } = useToast();

  // Form State
  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState<number>(1);
  const [semester, setSemester] = useState<number>(1);
  const [rollNumber, setRollNumber] = useState("");
  const [section, setSection] = useState("A");
  const [avatarUrl, setAvatarUrl] = useState("");

  // Personalization State
  const [defaultView, setDefaultView] = useState<"overview" | "analytics" | "simulator">("overview");
  const [gpaScale, setGpaScale] = useState<"4.0" | "10.0" | "percentage">("10.0");
  const [reminderPreference, setReminderPreference] = useState<"daily" | "weekly" | "off">("daily");

  // Interaction State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isContextDrawerOpen, setIsContextDrawerOpen] = useState(false);

  // Sync initial state from auth profile and student profile
  useEffect(() => {
    if (!profile && !studentProfile) return;

    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url);
    }
    if (studentProfile) {
      setUniversity(studentProfile.university || "");
      setDepartment(studentProfile.department || "");
      setYear(studentProfile.year ?? 1);
      setSemester(studentProfile.semester ?? 1);
      setRollNumber(studentProfile.roll_number || "");
      setSection(studentProfile.section || "");
    }

    // Load personalization preferences from localStorage if present
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem("learntrack_pref_default_view");
      if (savedView === "overview" || savedView === "analytics" || savedView === "simulator") {
        setDefaultView(savedView);
      }
      const savedScale = localStorage.getItem("learntrack_pref_gpa_scale");
      if (savedScale === "4.0" || savedScale === "10.0" || savedScale === "percentage") {
        setGpaScale(savedScale);
      }
      const savedRemind = localStorage.getItem("learntrack_pref_reminder");
      if (savedRemind === "daily" || savedRemind === "weekly" || savedRemind === "off") {
        setReminderPreference(savedRemind);
      }
    }
  }, [profile, studentProfile]);

  // Determine if there are unsaved changes
  const hasChanges = useMemo(() => {
    if (!studentProfile) return false;

    const baseRoll = (studentProfile.roll_number || "").trim().toUpperCase();
    const baseUni = (studentProfile.university || "").trim();
    const baseDept = (studentProfile.department || "").trim();
    const baseYear = studentProfile.year ?? 1;
    const baseSem = studentProfile.semester ?? 1;
    const baseSection = (studentProfile.section || "").trim().toUpperCase();

    const isRollChanged = rollNumber.trim().toUpperCase() !== baseRoll;
    const isUniChanged = university.trim() !== baseUni;
    const isDeptChanged = department.trim() !== baseDept;
    const isYearChanged = year !== baseYear;
    const isSemChanged = semester !== baseSem;
    const isSectionChanged = section.trim().toUpperCase() !== baseSection;

    return isRollChanged || isUniChanged || isDeptChanged || isYearChanged || isSemChanged || isSectionChanged;
  }, [studentProfile, rollNumber, university, department, year, semester, section]);

  // Discard local changes back to base
  const handleDiscard = useCallback(() => {
    if (!studentProfile) return;
    setRollNumber(studentProfile.roll_number || "");
    setUniversity(studentProfile.university || "");
    setDepartment(studentProfile.department || "");
    setYear(studentProfile.year ?? 1);
    setSemester(studentProfile.semester ?? 1);
    setSection(studentProfile.section || "");
    setErrors({});
    setIsEditing(false);
    showToast("Modifications discarded", "Reverted form back to saved profile.", "info");
  }, [studentProfile, showToast]);

  // Save changes to Supabase
  const handleSave = async () => {
    if (!studentProfile) return;

    const validation = validateStudentProfile({
      roll_number: rollNumber,
      university,
      department,
      year: Number(year),
      semester: Number(semester),
      section,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      showToast("Validation Error", "Please resolve highlighted fields before saving.", "error");
      return;
    }

    setIsSaving(true);
    setErrors({});

    try {
      const { error } = await updateStudentProfile(studentProfile.id, {
        roll_number: rollNumber.trim().toUpperCase(),
        university: university.trim(),
        department: department.trim(),
        year: Number(year),
        semester: Number(semester),
        section: section.trim().toUpperCase() || undefined,
      });

      if (error) {
        showToast("Error updating profile", error, "error");
      } else {
        // Persist personalization settings to localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("learntrack_pref_default_view", defaultView);
          localStorage.setItem("learntrack_pref_gpa_scale", gpaScale);
          localStorage.setItem("learntrack_pref_reminder", reminderPreference);
        }

        await refreshStudentProfile();
        setIsSavedSuccess(true);
        setIsEditing(false);
        showToast("Profile updated successfully.", "Your academic identity is up to date.", "success");

        setTimeout(() => {
          setIsSavedSuccess(false);
        }, 2200);
      }
    } catch (err: unknown) {
      showToast("Unable to save changes", err instanceof Error ? err.message : "An error occurred", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Avatar application and Supabase persistence
  const handleApplyAvatar = async (newAvatarUri: string) => {
    setAvatarUrl(newAvatarUri);
    try {
      const res = await updateProfile({ avatar_url: newAvatarUri });
      if (res?.error) {
        showToast("Notice", "Avatar preview applied locally. Cloud persistence encountered error: " + res.error, "info");
      } else {
        showToast("Avatar updated successfully.", "Your new academic avatar is active across LearnTrack.", "success");
      }
    } catch (err: unknown) {
      console.warn("Avatar persistence warning:", err);
      showToast("Avatar preview applied", "Your selected avatar is active in your current session.", "info");
    }
  };

  if (authLoading) {
    return <ProfileSkeleton />;
  }

  if (!authLoading && !studentProfile && !profile) {
    return (
      <div className="space-y-6">
        <ProfileHeader
          isEditing={false}
          onToggleEdit={() => {}}
          isProfileActive={false}
        />
        <Card className="p-8 text-center max-w-lg mx-auto border-blue-100 bg-blue-50/30">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Academic Profile Required</h3>
          <p className="text-xs text-slate-600 mt-2 mb-6 leading-relaxed">
            Please complete your student profile setup in Onboarding.
          </p>
          <Link href="/onboarding">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start Onboarding
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isProfileActive = Boolean(studentProfile || profile);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="space-y-8 pb-24 max-w-5xl"
    >
      {/* 1. Page Header (Section 2) */}
      <ProfileHeader
        isEditing={isEditing}
        onToggleEdit={() => {
          if (isEditing && hasChanges) {
            handleDiscard();
          } else {
            setIsEditing((prev) => !prev);
          }
        }}
        isProfileActive={isProfileActive}
      />

      {/* 2. Premium Profile Hero & Completion Ring (Sections 3, 7, 8, 30, 32) */}
      <ProfileHero
        fullName={fullName}
        rollNumber={rollNumber}
        department={department}
        university={university}
        year={year}
        semester={semester}
        section={section}
        avatarUrl={avatarUrl}
        onOpenAvatarPicker={() => setIsAvatarPickerOpen(true)}
        isEditing={isEditing}
      />

      {/* 3. Academic Identity Card (Sections 11, 12, 13) */}
      <AcademicIdentityCard
        fullName={fullName}
        onFullNameChange={setFullName}
        rollNumber={rollNumber}
        onRollNumberChange={(val) => {
          setRollNumber(val);
          if (!isEditing) setIsEditing(true);
        }}
        university={university}
        onUniversityChange={(val) => {
          setUniversity(val);
          if (!isEditing) setIsEditing(true);
        }}
        department={department}
        onDepartmentChange={(val) => {
          setDepartment(val);
          if (!isEditing) setIsEditing(true);
        }}
        errors={errors}
        isEditing={isEditing}
      />

      {/* 4. Enrollment Details Card (Sections 14, 15, 16, 17) */}
      <EnrollmentDetailsCard
        year={year}
        onYearChange={(val) => {
          setYear(val);
          if (!isEditing) setIsEditing(true);
        }}
        semester={semester}
        onSemesterChange={(val) => {
          setSemester(val);
          if (!isEditing) setIsEditing(true);
        }}
        section={section}
        onSectionChange={(val) => {
          setSection(val);
          if (!isEditing) setIsEditing(true);
        }}
        errors={errors}
        isEditing={isEditing}
      />

      {/* 5. Live LearnTrack Context Card (Section 22) */}
      <AcademicContextCard
        rollNumber={rollNumber}
        department={department}
        year={year}
        semester={semester}
        section={section}
        onOpenContextDrawer={() => setIsContextDrawerOpen(true)}
      />

      {/* 6. LearnTrack Personalization (Section 21) */}
      <PersonalizationCard
        defaultView={defaultView}
        onDefaultViewChange={(val) => {
          setDefaultView(val);
          if (!isEditing) setIsEditing(true);
        }}
        gpaScale={gpaScale}
        onGpaScaleChange={(val) => {
          setGpaScale(val);
          if (!isEditing) setIsEditing(true);
        }}
        reminderPreference={reminderPreference}
        onReminderPreferenceChange={(val) => {
          setReminderPreference(val);
          if (!isEditing) setIsEditing(true);
        }}
        isEditing={isEditing}
      />

      {/* 7. Privacy & Security Section (Sections 24, 25, 26) */}
      <PrivacyAndSecurityCard
        email={user?.email || profile?.email}
        profileId={profile?.id || user?.id}
        updatedAt={studentProfile?.updated_at || profile?.updated_at}
        createdAt={studentProfile?.created_at || profile?.created_at}
      />

      {/* Modals & Drawers */}
      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        currentAvatarUrl={avatarUrl}
        studentName={fullName || "Student"}
        onApplyAvatar={handleApplyAvatar}
      />

      <AcademicContextDrawer
        isOpen={isContextDrawerOpen}
        onClose={() => setIsContextDrawerOpen(false)}
        rollNumber={rollNumber}
        department={department}
        year={year}
        semester={semester}
      />

      {/* Smart Unsaved Changes Sticky Bar (Sections 18, 19, 20) */}
      <UnsavedChangesBar
        hasChanges={hasChanges}
        onDiscard={handleDiscard}
        onSave={handleSave}
        isSaving={isSaving}
        isSavedSuccess={isSavedSuccess}
      />
    </motion.div>
  );
}
