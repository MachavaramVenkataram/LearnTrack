/**
 * LearnTrack Academic & Performance Explanation Endpoint
 * POST /api/ai/explanation
 *
 * Explains concepts, score trends, and academic reports using Google Gemini.
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
      type = "concept",
      topic,
      subject = "General Subject",
      level = "intermediate",
      format = "detailed",
      context = "",
      studentName,
      predictedScore,
      previousScore,
      attendanceRate,
      studyHoursWeekly,
      topFactors = [],
    } = body;

    // 1. Performance Metric Explanation
    if (type === "performance") {
      if (typeof predictedScore !== "number") {
        return NextResponse.json(
          { error: "predictedScore number is required for performance explanation." },
          { status: 400 }
        );
      }

      const explanation = await ai.analyzeAcademicPerformance({
        studentName,
        predictedScore,
        previousScore,
        attendanceRate,
        studyHoursWeekly,
        topFactors,
      });

      return NextResponse.json({
        success: true,
        ...explanation,
      });
    }

    // 2. Concept Explanation
    if (!topic) {
      return NextResponse.json(
        { error: "topic is required for concept explanation." },
        { status: 400 }
      );
    }

    const explanationText = await ai.generateExplanation({
      topic,
      subject,
      level,
      format,
      context,
    });

    return NextResponse.json({
      success: true,
      explanation: explanationText,
      topic,
      subject,
    });
  } catch (error: unknown) {
    console.error("[API /api/ai/explanation] Error:", error);
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
