/**
 * LearnTrack What-If Simulator Explanation Endpoint
 * POST /api/ai/simulator
 *
 * Explains Machine Learning prediction shifts and SHAP feature importances.
 * Strictly decoupled from ML prediction calculations (which are executed by FastAPI/Scikit-learn).
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
      originalInputs,
      modifiedInputs,
      originalPrediction,
      newPrediction,
      shapValues,
    } = body;

    if (
      !originalInputs ||
      !modifiedInputs ||
      typeof originalPrediction !== "number" ||
      typeof newPrediction !== "number"
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid simulator payload. originalInputs, modifiedInputs, originalPrediction, and newPrediction are required.",
        },
        { status: 400 }
      );
    }

    const explanation = await ai.explainSimulation({
      originalInputs,
      modifiedInputs,
      originalPrediction,
      newPrediction,
      shapValues,
    });

    return NextResponse.json({
      success: true,
      ...explanation,
    });
  } catch (error: unknown) {
    console.error("[API /api/ai/simulator] Error:", error);
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
