"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  Check,
  Shield,
  GraduationCap,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { UserProfile } from "@/lib/auth-context";
import { Student } from "@/types/academic";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { getInitialsFromName, generateInitialsSvgUri } from "@/components/profile/avatar-presets";

interface AccountCredentialsSectionProps {
  userEmail: string;
  profile: UserProfile | null;
  studentProfile: Student | null;
}

export function AccountCredentialsSection({
  userEmail,
  profile,
  studentProfile,
}: AccountCredentialsSectionProps) {
  const { showToast } = useToast();

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & loading
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Resolve avatar URL or initials SVG
  const studentName = profile?.full_name || profile?.fullName || "Student";
  const avatarSrc = useMemo(() => {
    if (profile?.avatar_url) return profile.avatar_url;
    if (profile?.avatarUrl) return profile.avatarUrl;
    return generateInitialsSvgUri(studentName, "#2563EB", "#4F46E5");
  }, [profile, studentName]);

  const initials = useMemo(() => getInitialsFromName(studentName), [studentName]);

  // Password requirements check
  const passwordChecks = useMemo(() => {
    const hasMinLength = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    let score = 0;
    if (hasMinLength) score += 1;
    if (hasUpper) score += 1;
    if (hasLower) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;

    let strengthLabel = "Weak";
    let strengthColor = "bg-rose-500 text-rose-700";
    let strengthBarClass = "bg-rose-500 w-1/4";

    if (newPassword.length === 0) {
      strengthLabel = "None";
      strengthColor = "text-slate-400";
      strengthBarClass = "bg-slate-200 w-0";
    } else if (score <= 2) {
      strengthLabel = "Weak";
      strengthColor = "text-rose-600";
      strengthBarClass = "bg-rose-500 w-1/4";
    } else if (score === 3) {
      strengthLabel = "Fair";
      strengthColor = "text-amber-600";
      strengthBarClass = "bg-amber-500 w-2/4";
    } else if (score === 4) {
      strengthLabel = "Good";
      strengthColor = "text-blue-600";
      strengthBarClass = "bg-blue-500 w-3/4";
    } else {
      strengthLabel = "Strong";
      strengthColor = "text-emerald-600";
      strengthBarClass = "bg-emerald-500 w-full";
    }

    return {
      hasMinLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      score,
      strengthLabel,
      strengthColor,
      strengthBarClass,
    };
  }, [newPassword]);

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Handle password update via Supabase
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    if (!passwordChecks.hasUpper || !passwordChecks.hasLower || !passwordChecks.hasNumber) {
      setPasswordError("Password must include uppercase, lowercase, and numeric characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      // 1. If user entered current password, verify via signInWithPassword
      if (currentPassword && userEmail) {
        const { error: verifyErr } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: currentPassword,
        });

        if (verifyErr) {
          setPasswordError("Current password is not valid. Please re-check.");
          setIsUpdatingPassword(false);
          return;
        }
      }

      // 2. Perform password update in Supabase Auth
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateErr) {
        setPasswordError(updateErr.message);
        showToast("Password update failed", updateErr.message, "error");
        return;
      }

      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password Updated", "Your authentication password has been updated in Supabase.", "success");

      setTimeout(() => setPasswordSuccess(false), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      setPasswordError(msg);
      showToast("Update Error", msg, "error");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Account Identity Header Card */}
      <Card className="overflow-hidden border border-slate-200 shadow-xs">
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-50/80 via-white to-blue-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border-b border-slate-100">
          <div className="flex items-center gap-4">
            {/* Avatar Container (72-80px rounded) */}
            <div className="relative w-18 h-18 rounded-2xl overflow-hidden shrink-0 border border-slate-200/80 shadow-xs bg-slate-100">
              {avatarSrc.startsWith("data:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarSrc}
                  alt={studentName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xl tracking-tight">
                  {initials}
                </div>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {studentName}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Account active
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {userEmail || "student@learntrack.dev"}
              </p>
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Authenticated LearnTrack account</span>
              </div>
            </div>
          </div>

          <div className="sm:text-right w-full sm:w-auto">
            <span className="inline-block text-[11px] font-mono font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/70">
              ID: {studentProfile?.roll_number || (profile?.id ? `LT-${profile.id.slice(0, 8)}` : "LT-STUDENT")}
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Account Information Card */}
      <Card>
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle className="text-base text-slate-900">Account Information</CardTitle>
          <CardDescription>
            Official authentication credentials registered with Supabase Auth
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Student Email</span>
                <span className="text-[11px] font-normal text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked identifier
                </span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={userEmail || ""}
                  readOnly
                  disabled
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 cursor-not-allowed select-all"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Primary institutional email address used for login and academic notifications.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>Full Name</span>
                <span className="text-[11px] font-normal text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Verified identity
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={studentName}
                  readOnly
                  disabled
                  className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Legal name attached to your student profile. Editable in{" "}
                <Link href="/profile" className="text-blue-600 hover:underline font-medium">
                  Academic Profile
                </Link>
                .
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Academic Profile Connection Card */}
      <Card>
        <CardHeader className="pb-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              Academic Profile Connection
            </CardTitle>
            <CardDescription>
              Your account is connected to your LearnTrack academic profile and course schedule
            </CardDescription>
          </div>
          <Link
            href="/profile"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            <span>View Academic Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                ROLL NUMBER
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1 font-mono">
                {studentProfile?.roll_number || profile?.rollNumber || "Not Assigned"}
              </p>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                DEPARTMENT
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1 truncate" title={studentProfile?.department || profile?.department || "CSE"}>
                {studentProfile?.department || profile?.department || "Computer Science"}
              </p>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                ACADEMIC YEAR
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1">
                {studentProfile?.year ? `${studentProfile.year}th Year` : "1st Year"}
              </p>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                SEMESTER
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1">
                Semester {studentProfile?.semester ?? 1}
              </p>
            </div>
          </div>

          <div className="sm:hidden pt-2">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              <span>View Academic Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 4. Password Security Card */}
      <Card>
        <CardHeader className="pb-4 border-b border-slate-100">
          <CardTitle className="text-base text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-600" />
            Change Password
          </CardTitle>
          <CardDescription>
            Secure your academic records and predictive analytics with a strong passphrase
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {passwordSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Password updated successfully in Supabase.</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full h-11 px-3.5 pr-10 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className="w-full h-11 px-3.5 pr-10 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>Confirm New Password</span>
                  {confirmPassword.length > 0 && (
                    <span className={`text-[10px] font-semibold ${passwordsMatch ? "text-emerald-600" : "text-rose-500"}`}>
                      {passwordsMatch ? "Match ✓" : "Does not match"}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    className="w-full h-11 px-3.5 pr-10 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength Meter */}
            {newPassword.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-500">PASSWORD STRENGTH</span>
                  <span className={`font-bold ${passwordChecks.strengthColor}`}>
                    {passwordChecks.strengthLabel}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${passwordChecks.strengthBarClass}`} />
                </div>
              </div>
            )}

            {/* Password Requirements Checklist */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-700">Password requirements:</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className={`flex items-center gap-1.5 ${passwordChecks.hasMinLength ? "text-emerald-700 font-medium" : "text-slate-500"}`}>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${passwordChecks.hasMinLength ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"}`}>
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>At least 8 characters</span>
                </div>

                <div className={`flex items-center gap-1.5 ${passwordChecks.hasUpper ? "text-emerald-700 font-medium" : "text-slate-500"}`}>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${passwordChecks.hasUpper ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"}`}>
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>Uppercase letter</span>
                </div>

                <div className={`flex items-center gap-1.5 ${passwordChecks.hasLower ? "text-emerald-700 font-medium" : "text-slate-500"}`}>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${passwordChecks.hasLower ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"}`}>
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>Lowercase letter</span>
                </div>

                <div className={`flex items-center gap-1.5 ${passwordChecks.hasNumber ? "text-emerald-700 font-medium" : "text-slate-500"}`}>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${passwordChecks.hasNumber ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"}`}>
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span>Numeric digit</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isUpdatingPassword || !passwordsMatch || !passwordChecks.hasMinLength}
                className="h-10 px-5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
