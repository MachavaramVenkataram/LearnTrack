import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/lib/ai/aiService";
import { buildStudentContext } from "@/lib/ai/contextBuilder";
import { StudentAIContext, StudyPlanGenerationInput } from "@/types/academic";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  try {
    let authenticatedUserId: string | null = null;

    if (isSupabaseConfigured) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json(
          { error: "Unauthorized: Please log in to generate study plans." },
          { status: 401 }
        );
      }
      authenticatedUserId = user.id;
    }

    const body = await req.json();
    const {
      userId: clientUserId,
      studentId,
      studentName,
      input,
      startDateStr,
      context: providedContext,
    } = body;

    const effectiveUserId = authenticatedUserId || clientUserId || "anonymous-student";

    if (!input || !input.duration) {
      return NextResponse.json(
        { error: "Invalid study plan input configuration: duration is required." },
        { status: 400 }
      );
    }

    if (typeof input.daily_hours !== "number" || input.daily_hours <= 0 || input.daily_hours > 16) {
      return NextResponse.json(
        { error: "Invalid study plan input: daily_hours must be between 0.5 and 16." },
        { status: 400 }
      );
    }

    // Build context isolated to this user's records
    let context: StudentAIContext = providedContext;
    if (!context && effectiveUserId !== "anonymous-student") {
      context = await buildStudentContext(effectiveUserId, studentId, studentName);
    }

    const start = startDateStr || new Date().toISOString().split("T")[0];

    const plan = await aiService.generatePersonalizedStudyPlan(
      effectiveUserId,
      input as StudyPlanGenerationInput,
      context,
      start
    );

    // Validate structured output
    if (!plan || !Array.isArray(plan.days) || plan.days.length === 0) {
      return NextResponse.json(
        { error: "Study plan output validation failed. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error("[API /api/ai/study-plan] Error:", error);

    const isRateLimit =
      error.message?.includes("quickly") ||
      error.message?.includes("limit") ||
      error.message?.includes("429");

    return NextResponse.json(
      {
        error: isRateLimit
          ? "You're making requests too quickly. Please try again shortly."
          : "Unable to generate the study plan. Please try again.",
      },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
