/**
 * LearnTrack AI Insights Route Handler
 * POST /api/ai/insights
 *
 * Diagnoses verified student academic metrics and generates actionable insights
 * using the central Gemini provider.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { ai } from "@/lib/ai";
import { sanitizeErrorMessage } from "@/lib/ai/errors";
import { getDashboardData } from "@/lib/academic/service";

export async function POST(req: NextRequest) {
  try {
    let authenticatedUserId: string | null = null;

    if (isSupabaseConfigured) {
      try {
        const supabase = await createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          authenticatedUserId = user.id;
        }
      } catch {
        // Fallback for dev environments
      }
    }

    if (!ai.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "Gemini AI is not configured. Add GEMINI_API_KEY to the server environment.",
          configured: false,
        },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const weakSubjects: string[] = Array.isArray(body.weakSubjects) ? [...body.weakSubjects] : [];
    const strongSubjects: string[] = Array.isArray(body.strongSubjects) ? [...body.strongSubjects] : [];
    let {
      studentName,
      averageScore,
      averageAttendance,
      cgpa,
      weeklyStudyHours = 0,
      assignmentsCompleted = 0,
    } = body;

    // If authenticated and metrics are omitted, load from verified database
    if (authenticatedUserId && (averageScore === undefined || averageAttendance === undefined)) {
      try {
        const dash = await getDashboardData(authenticatedUserId);
        if (dash) {
          studentName = studentName || "Student";
          averageScore = dash.summary.averageMarks;
          averageAttendance = dash.summary.averageAttendance;
          cgpa = dash.summary.cgpa;
          weeklyStudyHours = dash.summary.totalStudyHours;
          assignmentsCompleted = dash.records.length;

          dash.subjects.forEach((s) => {
            const r = dash.records.find((rec) => rec.subject_id === s.id);
            if (r) {
              if (r.total_marks < 70) weakSubjects.push(s.subject_name);
              else if (r.total_marks >= 85) strongSubjects.push(s.subject_name);
            }
          });
        }
      } catch (dbErr) {
        console.warn("[API Insights] Database retrieval failed, using supplied payload:", dbErr);
      }
    }

    const insights = await ai.generateInsights({
      studentName,
      averageScore,
      averageAttendance,
      cgpa,
      weakSubjects,
      strongSubjects,
      weeklyStudyHours,
      assignmentsCompleted,
    });

    return NextResponse.json({
      success: true,
      ...insights,
    });
  } catch (error: unknown) {
    console.error("[API /api/ai/insights] Error:", error);
    const sanitized = sanitizeErrorMessage(error);
    return NextResponse.json(
      {
        success: false,
        error: sanitized.message,
        code: sanitized.code,
      },
      { status: sanitized.status }
    );
  }
}
