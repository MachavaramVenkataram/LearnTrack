/**
 * LearnTrack Practice & Quiz Generation Endpoint
 * POST /api/ai/practice
 *
 * Generates active-recall practice quizzes and hints using the central Gemini provider.
 */

import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/lib/ai";
import { sanitizeErrorMessage } from "@/lib/ai/errors";
import { AI_CONFIG } from "@/lib/ai/config";

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
      action = "quiz",
      subject = "General Subject",
      topic = "Core Topic",
      difficulty = "medium",
      count = AI_CONFIG.defaultQuestionCount,
      questionType = "mcq",
      contextText = "",
      question = "",
      studentAttempt = "",
    } = body;

    // 1. Generate Hint Action
    if (action === "hint") {
      if (!question) {
        return NextResponse.json(
          { error: "A question prompt is required to generate a hint." },
          { status: 400 }
        );
      }

      const hintResult = await ai.generateHint({
        question,
        studentAttempt,
        topic,
        difficulty,
      });

      return NextResponse.json({
        success: true,
        ...hintResult,
      });
    }

    // 2. Generate Practice Quiz Action
    const requestedCount = Number(count) || AI_CONFIG.defaultQuestionCount;
    if (
      requestedCount < AI_CONFIG.minQuestionsPerRequest ||
      requestedCount > AI_CONFIG.maxQuestionsPerRequest
    ) {
      return NextResponse.json(
        {
          error: `Question count must be between ${AI_CONFIG.minQuestionsPerRequest} and ${AI_CONFIG.maxQuestionsPerRequest}.`,
        },
        { status: 400 }
      );
    }

    const quiz = await ai.generatePracticeQuestions({
      subject,
      topic,
      difficulty,
      count: requestedCount,
      questionType,
      contextText,
    });

    return NextResponse.json({
      success: true,
      ...quiz,
    });
  } catch (error: unknown) {
    console.error("[API /api/ai/practice] Error:", error);
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
