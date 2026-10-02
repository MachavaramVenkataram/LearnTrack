"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GraduationCap, Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setIsLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
    } else {
      await new Promise((r) => setTimeout(r, 500));
      setIsLoading(false);
    }

    setIsSent(true);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-600/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            LearnTrack
          </span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
          Forgot your password?
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Enter your university email to receive a secure recovery link
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-elevated border-slate-200">
          <CardContent className="pt-6 space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            {isSent ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Recovery Email Dispatched</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  If an account exists for <strong>{email}</strong>, a password reset link has been delivered to your inbox.
                </p>
                <div className="pt-2">
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Return to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Student Email"
                  type="email"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                  autoComplete="email"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full text-sm font-semibold"
                  isLoading={isLoading}
                >
                  Send Recovery Link
                </Button>

                <div className="pt-2 text-center text-xs">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
