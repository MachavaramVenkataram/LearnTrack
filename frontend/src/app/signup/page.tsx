"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  TrendingUp,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";

function getPasswordStrength(pass: string): {
  score: number;
  label: string;
  color: string;
} {
  if (!pass) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass) || pass.length >= 12) score += 1;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-rose-500" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-blue-600" };
  return { score: 4, label: "Strong", color: "bg-emerald-500" };
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, signInWithGoogle, isOAuthEnabled } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Surface errors from URL params (e.g. from /auth/callback)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      if (errorParam === "Google sign-in was cancelled." || errorParam === "access_denied") {
        setError("Google sign-in was cancelled.");
      } else {
        setError(errorParam);
      }
    }
  }, [searchParams]);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = !confirmPassword || password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify both entries.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setIsLoading(true);
    const res = await signUp(email, password, fullName);
    setIsLoading(false);

    if (res.error) {
      setError(
        res.error.toLowerCase().includes("user already registered")
          ? "An account with this email address already exists. Please sign in instead."
          : res.error
      );
    } else if (res.requiresVerification) {
      setSuccessMessage(
        "Registration successful! Please check your email to verify your student account before logging in."
      );
    } else {
      router.push("/dashboard");
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res?.error) {
        setError(res.error);
        setIsGoogleLoading(false);
      }
      // Note: On success, Supabase initiates browser redirect to Google OAuth
    } catch (err: any) {
      setError(err?.message || "Unable to complete Google sign-in. Please try again.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 relative flex flex-col justify-between overflow-x-hidden">
      {/* Subtle technical background grid & soft radial glow */}
      <div
        className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-0"
        aria-hidden="true"
      />

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-6xl mx-auto flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* ======================================================== */}
          {/* LEFT: Premium Brand / Value Panel (Desktop)              */}
          {/* ======================================================== */}
          <div className="hidden lg:flex lg:col-span-7 flex-col justify-center pr-2 xl:pr-8">
            {/* Brand Logo & Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-600/25">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">
                  LearnTrack
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 block mt-0.5">
                  AI-Powered Student Performance Intelligence
                </span>
              </div>
            </div>

            {/* Controlled Large Headline */}
            <h1 className="text-[40px] xl:text-[46px] font-bold text-slate-900 tracking-tight leading-[1.08]">
              Create your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                academic intelligence
              </span>{" "}
              workspace.
            </h1>

            {/* Brand Description */}
            <p className="text-[15px] text-slate-600 leading-relaxed mt-4 max-w-[420px]">
              Track your academic performance, understand your learning patterns, and use AI-powered insights to improve your results.
            </p>

            {/* Compact Benefit Feature List */}
            <div className="space-y-3 mt-6 max-w-[420px]">
              <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>Track academic performance across semesters</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>Get ML-powered risk analysis and grade projections</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>Build personalized study plans and track consistent habits</span>
              </div>
            </div>

            {/* Decorative Product Visualization (Subtle Secondary Abstract Card) */}
            <div className="mt-8 pt-6 border-t border-slate-200/60 max-w-[420px]">
              <div className="p-4 rounded-xl bg-white/80 border border-slate-200/80 shadow-[0_4px_16px_rgba(15,23,42,0.03)] backdrop-blur-[2px]">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2.5">
                  <span className="uppercase tracking-wider text-[10px] font-semibold text-slate-500">
                    Performance Overview
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span>↑</span> Improving
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full w-[84%]" />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Academic Trajectory</span>
                    <span className="font-semibold text-slate-700">Optimal Pace (84%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT: Sophisticated SaaS Signup Card                    */}
          {/* ======================================================== */}
          <div className="col-span-1 lg:col-span-5 flex flex-col items-center justify-center">
            
            {/* Mobile-only compact logo header */}
            <div className="lg:hidden flex flex-col items-center mb-6 text-center">
              <Link href="/" className="inline-flex items-center gap-2.5 group">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-600/25">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">LearnTrack</span>
              </Link>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                AI-Powered Student Performance Intelligence
              </p>
            </div>

            {/* Authentication Card */}
            <div className="w-full max-w-[440px] bg-white border border-[#E2E8F0] rounded-2xl sm:rounded-[22px] shadow-[0_12px_40px_rgba(15,23,42,0.05)] p-7 sm:p-9 transition-all">
              
              {/* Step Indicator & Card Header */}
              <div className="mb-5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-semibold tracking-wider text-blue-700 uppercase mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Account Setup</span>
                </div>
                <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
                  Create your LearnTrack account
                </h2>
                <p className="text-[13px] sm:text-[14px] text-slate-500 mt-1">
                  Start tracking your academic performance and growth.
                </p>
              </div>

              {/* Polished Inline Error Banner */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50/90 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  <span className="leading-snug font-medium">{error}</span>
                </div>
              )}

              {/* Verification Confirmation State */}
              {successMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <div className="leading-snug">
                    <p className="font-semibold text-emerald-900">Check your email</p>
                    <p className="mt-0.5 text-emerald-700">{successMessage}</p>
                    <div className="mt-2.5">
                      <Link
                        href="/login"
                        className="inline-flex items-center text-xs font-semibold text-emerald-800 hover:underline"
                      >
                        Back to sign in →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Full name
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      autoComplete="name"
                      enterKeyHint="next"
                      required
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-11 sm:h-12 pl-10 pr-3.5 text-sm bg-white rounded-xl border border-[#DDE3EC] text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Email address
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      enterKeyHint="next"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 sm:h-12 pl-10 pr-3.5 text-sm bg-white rounded-xl border border-[#DDE3EC] text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>
                </div>

                {/* Password with Visibility Toggle & Strength Indicator */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      enterKeyHint="next"
                      required
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 sm:h-12 pl-10 pr-11 text-sm bg-white rounded-xl border border-[#DDE3EC] text-slate-900 placeholder:text-slate-400 transition-colors hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/10 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator & Compact Requirements */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Password strength:</span>
                        <span className="font-semibold text-slate-700">{passwordStrength.label}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 h-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`rounded-full transition-colors duration-200 ${
                              step <= passwordStrength.score ? passwordStrength.color : "bg-slate-100"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                    <span className={password.length >= 8 ? "text-emerald-600 font-semibold" : ""}>
                      ✓ At least 8 characters
                    </span>
                  </p>
                </div>

                {/* Confirm Password with Real-time Mismatch Indicator */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Confirm password
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      enterKeyHint="done"
                      required
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full h-11 sm:h-12 pl-10 pr-11 text-sm bg-white rounded-xl border text-slate-900 placeholder:text-slate-400 transition-colors focus:ring-4 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 ${
                        !passwordsMatch
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                          : "border-[#DDE3EC] hover:border-slate-300 focus:border-blue-600 focus:ring-blue-500/10"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 p-1 rounded-md text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {!passwordsMatch && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">
                      Passwords don&apos;t match
                    </p>
                  )}
                </div>

                {/* Primary Create Account Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full h-11 sm:h-12 text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white shadow-sm transition-all mt-1"
                  disabled={isLoading || isGoogleLoading}
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating account...</span>
                    </span>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>

              {/* Divider & Google OAuth Section */}
              {isOAuthEnabled && (
                <>
                  <div className="relative flex items-center justify-center my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200/80" />
                    </div>
                    <div className="relative px-3 bg-white text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      or continue with
                    </div>
                  </div>

                  {/* Real Supabase Google OAuth Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading || isLoading}
                    className="w-full h-11 sm:h-12 rounded-xl bg-white hover:bg-slate-50/90 active:bg-slate-100 border border-[#E2E8F0] text-slate-700 font-medium text-xs sm:text-sm inline-flex items-center justify-center gap-2.5 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-slate-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isGoogleLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                        <span>Signing in with Google...</span>
                      </span>
                    ) : (
                      <>
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.26-2.09 3.67-5.17 3.67-9.15z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.26v3.15C3.25 21.37 7.34 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.27 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.26C.46 8.21 0 10.05 0 12s.46 3.79 1.26 5.39l4.01-3.15z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.63 1.26 6.61l4.01 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                          />
                        </svg>
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>
                </>
              )}

              {/* Already have an account link */}
              <div className="pt-4 text-center text-xs text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </div>

              {/* Terms & Privacy Policy */}
              <p className="text-[11px] text-slate-400 text-center mt-3 leading-relaxed">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-slate-600 hover:underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-slate-600 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>

              {/* Reassurance Footer */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Secure authentication powered by Supabase</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Subtle Page Footer */}
      <footer className="relative z-10 py-4 text-center text-[11px] text-slate-400">
        © {new Date().getFullYear()} LearnTrack — Academic Intelligence Platform. All rights reserved.
      </footer>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" />}>
      <SignupForm />
    </Suspense>
  );
}
