"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-600/30">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            LearnTrack
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
          Reset password
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter your university email to receive a secure recovery link
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="shadow-elevated border-slate-200">
          <CardContent className="pt-6 space-y-4">
            {isSent ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Recovery Email Sent</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                  If an account exists with <strong>{email}</strong>, password reset instructions have been dispatched.
                </p>
                <Link href="/auth/login" className="inline-block mt-2">
                  <Button variant="outline" size="sm">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Student Email"
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
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
                    href="/auth/login"
                    className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800"
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
