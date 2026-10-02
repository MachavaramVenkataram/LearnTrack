import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { ShieldCheck, ArrowLeft, Lock, Database, Cpu, Trash2, Download, AlertCircle } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Privacy Policy — LearnTrack",
  description: "Learn how LearnTrack handles your academic data, machine learning predictions, and AI context isolation.",
};

export default function PrivacyPage() {
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
            <Badge variant="secondary" size="sm" className="bg-blue-50 text-blue-700 border-blue-200">
              Academic Privacy Standard
            </Badge>
            <span className="text-xs text-slate-400">Last updated: September 2026</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans">
            LearnTrack Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            This document outlines how LearnTrack collects, isolates, and protects student academic data.
            LearnTrack is an AI-powered academic performance intelligence platform built with strict privacy-by-design principles.
          </p>
        </div>

        <div className="space-y-6">
          {/* Section 1: What Data LearnTrack Stores */}
          <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Database className="w-5 h-5" />
              </div>
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900">1. What Data LearnTrack Stores</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  LearnTrack only stores information strictly needed to calculate academic metrics, generate predictive insights, and personalize study recommendations:
                </p>
                <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1.5 pl-2">
                  <li><strong>Account Information:</strong> Email address, full name, and authenticated user ID managed via Supabase Auth.</li>
                  <li><strong>Student Profile:</strong> Department/major, semester number, academic roll or student identifier (optional).</li>
                  <li><strong>Coursework & Subjects:</strong> Subject names, course codes, credit hours, and subject categories.</li>
                  <li><strong>Academic Records:</strong> Assessment scores, exam types, component weightages, and recorded class attendance percentages.</li>
                  <li><strong>Study Activity:</strong> Self-reported study session durations, topics reviewed, and study logs.</li>
                  <li><strong>Generated Artifacts:</strong> ML performance predictions, what-if simulation records, personalized study plans, and assistant conversations.</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Section 2: Why Academic Data Is Collected */}
          <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900">2. Why Academic Data Is Collected</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Your academic records are used exclusively to deliver analytical and predictive features to you:
                </p>
                <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1.5 pl-2">
                  <li>Computing real-time GPA, CGPA, subject mark distributions, and attendance summaries.</li>
                  <li>Generating statistical performance predictions and estimating academic risk levels.</li>
                  <li>Producing explainable AI (SHAP) feature attributions showing which factors most influence your trajectory.</li>
                  <li>Structuring practical, prioritized weekly study plans and exam countdowns.</li>
                </ul>
                <p className="text-xs sm:text-sm text-slate-600 font-medium pt-1">
                  We do not sell, rent, or monetize student academic data, nor do we use individual student records for targeted advertising.
                </p>
              </div>
            </div>
          </Card>

          {/* Section 3: Machine Learning & Predictions */}
          <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900">3. How ML Predictions Work (High Level)</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  LearnTrack runs a dedicated machine learning inference service built with Python and FastAPI. The underlying regression model (trained with Scikit-learn/XGBoost on structured student performance datasets) evaluates factors such as previous exam scores, attendance patterns, and study hours.
                </p>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">Explainable AI (XAI):</p>
                  <p>
                    Every prediction is accompanied by SHAP (SHapley Additive exPlanations) values indicating positive and negative contributors. Predictions are advisory estimates intended to guide self-improvement, not guarantees or authoritative academic evaluations.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 4: AI Assistant & Context Isolation */}
          <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900">4. AI Features & Context Isolation</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  When you use the AI Study Assistant or generate automated study plans:
                </p>
                <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 space-y-1.5 pl-2">
                  <li><strong>Minimal Context:</strong> Only your authenticated semester, relevant subject scores, and study targets are compiled into the LLM context. The entire database is never exposed.</li>
                  <li><strong>Data Isolation:</strong> User sessions are validated on the server. The AI has zero visibility into any other student&apos;s data or records.</li>
                  <li><strong>Third-Party Processing:</strong> AI requests are sent via secure HTTPS to leading AI API providers (such as Google Gemini). Request payloads are processed under enterprise API terms and are not retained to train public commercial models.</li>
                  <li><strong>Prompt Injection Defense:</strong> All user-stored subject notes and coursework descriptions are sanitized and demarcated strictly as untrusted data.</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Section 5: Data Export & Account Deletion */}
          <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900">5. Data Ownership: Export & Deletion</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  You retain complete ownership of your academic records:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                      <Download className="w-4 h-4 text-blue-600" />
                      <span>Data Export</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Export your entire academic history, subjects, and study sessions anytime as clean JSON or CSV via the Settings dashboard.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-xs">
                      <Trash2 className="w-4 h-4 text-rose-600" />
                      <span>Permanent Deletion</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Delete your account permanently from the Settings page. This cascades and permanently removes all your profile data, subjects, records, and AI chats.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 6: Security Architecture */}
          <Card className="border border-slate-200/80 shadow-xs bg-white rounded-2xl p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-3">
                <h2 className="text-lg font-bold text-slate-900">6. Technical Safeguards & Row-Level Security</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Every database table in LearnTrack is protected by PostgreSQL <strong>Row Level Security (RLS)</strong> in Supabase. Even if a malformed client request is crafted, the database engine prohibits cross-tenant reading, inserting, updating, or deleting records belonging to other users.
                </p>
                <p className="text-[11px] text-slate-400">
                  Note: LearnTrack is designed as an educational analytics and decision-support tool. It does not replace institutional administrative records.
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
            <Link href="/privacy" className="font-semibold text-blue-600">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
            <Link href="/login" className="hover:text-blue-600 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
