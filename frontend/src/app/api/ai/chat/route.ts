import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/lib/ai/aiService";
import { buildStudentContext } from "@/lib/ai/contextBuilder";
import { StudentAIContext } from "@/types/academic";
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
          { error: "Unauthorized: Please log in to use LearnTrack AI." },
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
      messages,
      context: providedContext,
    } = body;

    // Prioritize verified session user id over client-supplied value
    const effectiveUserId = authenticatedUserId || clientUserId || "anonymous-student";

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required." },
        { status: 400 }
      );
    }

    // Build context isolated to this user's records
    let context: StudentAIContext | undefined = providedContext;
    if (!context && effectiveUserId !== "anonymous-student") {
      context = await buildStudentContext(effectiveUserId, studentId, studentName);
    }

    const result = await aiService.chatWithAssistant(
      effectiveUserId,
      messages,
      context
    );

    return NextResponse.json({
      content: result.content,
      model: result.model,
    });
  } catch (error: any) {
    console.error("[API /api/ai/chat] Error:", error);

    const isRateLimit =
      error.message?.includes("quickly") ||
      error.message?.includes("limit") ||
      error.message?.includes("429");

    return NextResponse.json(
      {
        error: isRateLimit
          ? "You're making requests too quickly. Please try again shortly."
          : "LearnTrack AI is temporarily unavailable. Please try again in a few moments.",
      },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
