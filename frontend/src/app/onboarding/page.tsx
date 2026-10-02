"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  GraduationCap,
  User,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  Calendar,
  Layers,
  Hash,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuth } from "@/lib/auth-context";
import { createStudentProfile } from "@/lib/academic/service";
import { validateStudentProfile } from "@/lib/validations/academic";
import { useToast } from "@/components/ui/Toast";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, studentProfile, isLoading: authLoading, refreshStudentProfile } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [fullName, setFullName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState<number>(2);
  const [semester, setSemester] = useState<number>(4);
  const [section, setSection] = useState("A");

  // Populate initial state from auth profile if available
  useEffect(() => {
    if (profile?.full_name && !fullName) {
      setFullName(profile.full_name);
    }
  }, [profile, fullName]);

  // If already onboarded, redirect to dashboard
  useEffect(() => {
    if (!authLoading && studentProfile) {
      router.replace("/dashboard");
    }
  }, [studentProfile, authLoading, router]);

  // If unauthenticated, redirect to login
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [user, authLoading, router]);

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Full name is required.";
    if (!rollNumber.trim()) errs.rollNumber = "Roll number / Student ID is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
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
      return false;
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  };

  const handleSubmit = async () => {
    if (!user) {
      showToast("Authentication required", "Please log in to complete your profile.", "error");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const { data, error } = await createStudentProfile({
        profile_id: user.id,
        roll_number: rollNumber.trim().toUpperCase(),
        university: university.trim(),
        department: department.trim(),
        year: Number(year),
        semester: Number(semester),
        section: section.trim().toUpperCase() || undefined,
      });

      if (error) {
        showToast("Error creating profile", error, "error");
        setIsSubmitting(false);
        return;
      }

      await refreshStudentProfile();
      showToast("Profile created successfully!", "Welcome to your LearnTrack workspace.", "success");
      router.push("/dashboard");
    } catch (err: any) {
      showToast("Submission failed", err?.message || "Please check your network connection.", "error");
      setIsSubmitting(false);
    }
  };

  const progressPercent = step === 1 ? 33 : step === 2 ? 66 : 100;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <header className="max-w-xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-soft-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900">LearnTrack</span>
        </Link>
        <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
          Step {step} of 3
        </span>
      </header>

      {/* Main Form Container */}
      <main className="max-w-xl w-full mx-auto my-8">
        <Card className="border-slate-200/90 shadow-elevated bg-white">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Header Titles */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Let&apos;s set up your academic profile
              </h1>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {step === 1 && "Confirm your personal details and campus identification."}
                {step === 2 && "Enter your institution, department, and current semester standing."}
                {step === 3 && "Review your profile information before entering the workspace."}
              </p>
            </div>

            {/* Stepper Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span className={step >= 1 ? "text-blue-600" : ""}>1. Personal</span>
                <span className={step >= 2 ? "text-blue-600" : ""}>2. Academic</span>
                <span className={step >= 3 ? "text-blue-600" : ""}>3. Confirm</span>
              </div>
              <ProgressBar value={progressPercent} size="sm" variant="primary" />
            </div>

            {/* STEP 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-4 pt-2">
                <Input
                  label="Full Name"
                  id="fullName"
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  error={errors.fullName}
                  leftIcon={<User className="w-4 h-4 text-slate-400" />}
                  required
                />

                <Input
                  label="Roll Number / Student ID"
                  id="rollNumber"
                  placeholder="e.g. 21CS042 or STU-8941"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  error={errors.rollNumber}
                  helperText="Your official university identification number."
                  leftIcon={<Hash className="w-4 h-4 text-slate-400" />}
                  required
                />
              </div>
            )}

            {/* STEP 2: Academic Details */}
            {step === 2 && (
              <div className="space-y-4 pt-2">
                <Input
                  label="University / College"
                  id="university"
                  placeholder="e.g. Stanford University or MIT"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  error={errors.university}
                  leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
                  required
                />

                <Input
                  label="Department / Program"
                  id="department"
                  placeholder="e.g. Computer Science & Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  error={errors.department}
                  leftIcon={<BookOpen className="w-4 h-4 text-slate-400" />}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Academic Year"
                    id="year"
                    value={year.toString()}
                    onChange={(e) => setYear(Number(e.target.value))}
                    options={[
                      { value: "1", label: "Year 1 (Freshman)" },
                      { value: "2", label: "Year 2 (Sophomore)" },
                      { value: "3", label: "Year 3 (Junior)" },
                      { value: "4", label: "Year 4 (Senior)" },
                      { value: "5", label: "Year 5 (Graduate / Dual)" },
                    ]}
                  />

                  <Select
                    label="Current Semester"
                    id="semester"
                    value={semester.toString()}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    options={[
                      { value: "1", label: "Semester 1" },
                      { value: "2", label: "Semester 2" },
                      { value: "3", label: "Semester 3" },
                      { value: "4", label: "Semester 4" },
                      { value: "5", label: "Semester 5" },
                      { value: "6", label: "Semester 6" },
                      { value: "7", label: "Semester 7" },
                      { value: "8", label: "Semester 8" },
                    ]}
                  />
                </div>

                <Input
                  label="Class Section / Group (Optional)"
                  id="section"
                  placeholder="e.g. A, B, or CS-1"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  leftIcon={<Layers className="w-4 h-4 text-slate-400" />}
                />
              </div>
            )}

            {/* STEP 3: Confirmation */}
            {step === 3 && (
              <div className="space-y-4 pt-2">
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Please verify your academic parameters. These details are used to structure your courses, semester averages, and predictive trajectory calculations.
                  </p>
                </div>

                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden text-xs">
                  <div className="p-3.5 bg-slate-50/70 flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Full Name</span>
                    <span className="font-semibold text-slate-900">{fullName}</span>
                  </div>
                  <div className="p-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Roll Number</span>
                    <span className="font-semibold text-slate-900 font-mono">{rollNumber.toUpperCase()}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50/70 flex justify-between items-center">
                    <span className="text-slate-500 font-medium">University</span>
                    <span className="font-semibold text-slate-900">{university}</span>
                  </div>
                  <div className="p-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Department</span>
                    <span className="font-semibold text-slate-900">{department}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50/70 flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Year & Semester</span>
                    <span className="font-semibold text-slate-900">
                      Year {year} • Semester {semester} {section ? `(${section.toUpperCase()})` : ""}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleBack}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                  disabled={isSubmitting}
                >
                  Back
                </Button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  rightIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Confirm & Enter Dashboard
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer Assurance */}
      <footer className="max-w-xl w-full mx-auto text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
        <span>Your student data is strictly isolated via Supabase Row Level Security.</span>
      </footer>
    </div>
  );
}
