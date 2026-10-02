/**
 * LearnTrack Exam Prep Endpoint
 * POST /api/ai/exam-prep
 *
 * Generates high-yield exam revision summaries and formula checklists using Gemini.
 */

import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/ai";
import { sanitizeErrorMessage } from "@/lib/ai/errors";

export async function POST(req: NextRequest) {
  try {
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

    const body = await req.json();
    const {
      subject,
      examDate,
      topics = [],
      currentGrade,
      focusArea,
    } = body;

    if (!subject) {
      return NextResponse.json(
        { error: "Subject is required for exam preparation." },
        { status: 400 }
      );
    }

    const examGuide = await ai.generateExamQuestions({
      subject,
      examDate,
      topics: Array.isArray(topics) && topics.length > 0 ? topics : [subject],
      currentGrade,
      focusArea,
    });

    return NextResponse.json({
      success: true,
      ...examGuide,
    });
  } catch (error: unknown) {
    console.error("[API /api/ai/exam-prep] Error:", error);
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
