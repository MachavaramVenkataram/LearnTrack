import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ArrowLeft, BookOpen, Scale, AlertTriangle, UserCheck, Shield, HelpCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Terms of Service — LearnTrack",
  description: "LearnTrack terms of service and acceptable usage guidelines for academic performance tracking.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="space-y-4 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" size="sm" className="bg-slate-100 text-slate-700 border-slate-200">
              Student Platform Terms
            </Badge>
            <span className="text-xs text-slate-400">Effective: September 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            Welcome to LearnTrack. By creating an account or using the application, you agree to these Terms of Service. These terms are designed to be clear, fair, and appropriate for an educational software platform.
          </p>
        </div>

        <div className="space-y-6">
          {/* 1. Purpose of LearnTrack */}
          <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900">1. Purpose & Educational Scope</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  LearnTrack is an academic analytics and performance-intelligence tool designed to help students record coursework, understand academic trends, and explore data-driven learning strategies.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  LearnTrack is a self-directed academic companion. It does not issue official transcripts, confer accredited degrees, or officially determine university grade standing.
                </p>
              </div>
            </div>
          </Card>

          {/* 2. Nature of AI & ML Predictions */}
          <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900">2. Advisory Nature of AI & ML Insights</h2>
                <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 text-xs text-amber-800 space-y-1">
                  <p className="font-semibold">Notice on Automated Estimates:</p>
                  <p>
                    AI-generated responses, machine learning predictions, and what-if simulations may contain statistical variance or errors. You should review important academic details and use LearnTrack as a supporting self-improvement tool rather than a definitive decision-maker.
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Predictions and feature attributions (SHAP) represent correlational insights derived from training datasets. They do not constitute guarantees of future examination grades.
                </p>
              </div>
            </div>
          </Card>

          {/* 3. Account Responsibilities */}
          <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900">3. User Responsibilities & Data Accuracy</h2>
                <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1.5 pl-2">
                  <li>You are responsible for keeping your login credentials confidential.</li>
                  <li>Academic metrics and predictions depend directly on the accuracy of the marks, attendance, and study hours you input.</li>
                  <li>You agree not to attempt to circumvent security boundaries, exploit rate limits, or perform prompt injection attacks against the AI services.</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* 4. Acceptable Use */}
          <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900">4. Acceptable Use Policy</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  You agree to use LearnTrack strictly for lawful academic and personal productivity purposes. You may not:
                </p>
                <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1.5 pl-2">
                  <li>Use automated bots or scripts to scrape application data or overload inference endpoints.</li>
                  <li>Upload malicious payloads, abusive content, or someone else&apos;s confidential records.</li>
                  <li>Reverse engineer or disrupt application services or underlying databases.</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* 5. Account Termination & Data Export */}
          <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900">5. Termination & Data Rights</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  You may stop using LearnTrack at any time. You can export your data in standardized JSON/CSV formats or permanently delete your account directly through the Settings dashboard without requiring administrative intervention.
                </p>
                <p className="text-xs text-slate-400">
                  Disclaimer: This document is provided for an educational software project and does not constitute formal legal advice.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} LearnTrack. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="font-semibold text-blue-600">Terms of Service</Link>
            <Link href="/login" className="hover:text-blue-600 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
