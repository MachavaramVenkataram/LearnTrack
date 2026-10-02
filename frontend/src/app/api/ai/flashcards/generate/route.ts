/**
 * LearnTrack Dedicated AI Flashcard Generation Endpoint
 * POST /api/ai/flashcards/generate
 *
 * Grounded in official Google Gemini API (@google/genai SDK).
 * Supports source grounding across Student Notes, Knowledge Base, and Topics.
 * Strictly respects multi-tenant RLS by scoping data to the authenticated session.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { ai } from "@/lib/ai";
import { AI_CONFIG } from "@/lib/ai/config";
import { sanitizeErrorMessage } from "@/lib/ai/errors";
import { FlashcardDifficulty, FlashcardType } from "@/types/learning";
import { getNote, getNotes, getSources } from "@/lib/learning/service";

interface GenerateFlashcardsRequestBody {
  sourceType?: "notes" | "knowledge_base" | "subject" | "topic" | "custom_text";
  sourceId?: string;
  subject: string;
  topic: string;
  difficulty?: FlashcardDifficulty | "mixed";
  count?: number;
  cardType?: FlashcardType | "mixed";
  learningGoal?: string;
  customText?: string;
  existingQuestions?: string[];
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user & ensure tenant isolation
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
        // Fallback for local dev
      }
    }

    // 2. Parse and validate request body
    const body: GenerateFlashcardsRequestBody = await req.json();
    const {
      sourceType = "topic",
      sourceId,
      subject = "General Subject",
      topic = "General Topic",
      difficulty = "medium",
      count = AI_CONFIG.defaultCardCount,
      cardType = "concept",
      learningGoal = "understand",
      customText,
      existingQuestions = [],
    } = body;

    const cleanSubject = subject.trim() || "General Subject";
    const cleanTopic = topic.trim() || "General Topic";

    if (!cleanTopic) {
      return NextResponse.json(
        { error: "A topic or learning concept is required to generate flashcards." },
        { status: 400 }
      );
    }

    const requestedCount = Number(count) || AI_CONFIG.defaultCardCount;
    if (requestedCount < AI_CONFIG.minCardsPerRequest || requestedCount > AI_CONFIG.maxCardsPerRequest) {
      return NextResponse.json(
        {
          error: `Card count must be between ${AI_CONFIG.minCardsPerRequest} and ${AI_CONFIG.maxCardsPerRequest} to ensure high pedagogical quality and protect quota.`,
        },
        { status: 400 }
      );
    }

    // 3. Check Gemini API key configuration
    if (!ai.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error: "AI generation is not configured yet. Add a GEMINI_API_KEY in the server environment.",
          configured: false,
        },
        { status: 503 }
      );
    }

    // 4. Source-Grounded Text Retrieval (Scoped strictly to the authenticated user)
    let groundedText = customText?.trim() || "";
    let sourceReference = "";

    if (sourceType === "custom_text" && groundedText) {
      sourceReference = `Custom Text Extract: ${cleanSubject} — ${cleanTopic}`;
    } else if (sourceType === "notes" && authenticatedUserId) {
      try {
        if (sourceId) {
          const note = await getNote(sourceId);
          if (note && note.user_id === authenticatedUserId) {
            groundedText = note.content;
            sourceReference = `Student Note: ${note.title}`;
          }
        } else {
          // Find notes matching topic or subject
          const notes = await getNotes(undefined, authenticatedUserId);
          const matched = notes.filter(
            (n) =>
              n.title.toLowerCase().includes(cleanTopic.toLowerCase()) ||
              n.content.toLowerCase().includes(cleanTopic.toLowerCase())
          );
          if (matched.length > 0) {
            groundedText = matched.map((m) => `[NOTE: ${m.title}]\n${m.content}`).join("\n\n");
            sourceReference = `Notes: ${matched.map((m) => m.title).slice(0, 2).join(", ")}`;
          }
        }
      } catch (err) {
        console.warn("[API Flashcards] Notes retrieval failed, proceeding with topic context:", err);
      }
    } else if (sourceType === "knowledge_base" && authenticatedUserId) {
      try {
        const sources = await getSources(authenticatedUserId);
        const matched = sources.filter(
          (s) =>
            s.title.toLowerCase().includes(cleanTopic.toLowerCase()) ||
            s.title.toLowerCase().includes(cleanSubject.toLowerCase())
        );
        if (matched.length > 0) {
          groundedText = matched
            .map((s) => `[DOCUMENT: ${s.title}]\n${s.extracted_text || s.summary?.tldr || ""}`)
            .join("\n\n");
          sourceReference = `Knowledge Base: ${matched[0].title}`;
        }
      } catch (err) {
        console.warn("[API Flashcards] Knowledge sources retrieval failed:", err);
      }
    }

    if (!sourceReference) {
      sourceReference = groundedText
        ? `Course Material: ${cleanTopic}`
        : `Curriculum Topic: ${cleanSubject} → ${cleanTopic}`;
    }

    // 5. Generate with central AI provider (Gemini)
    const result = await ai.generateFlashcards({
      subject: cleanSubject,
      topic: cleanTopic,
      difficulty,
      count: requestedCount,
      cardType,
      learningGoal,
      sourceType,
      sourceId,
      sourceText: groundedText,
      sourceReference,
      existingQuestions,
      userId: authenticatedUserId || undefined,
    });

    // 6. Format with backwards-compatible front/back aliases
    const finalCards = result.cards.map((c) => ({
      ...c,
      front: c.question,
      back: c.answer,
    }));

    return NextResponse.json({
      success: true,
      cards: finalCards,
      flashcards: finalCards,
      metadata: result.metadata,
      topic: cleanTopic,
      subject: cleanSubject,
    });
  } catch (error: unknown) {
    console.error("[API /api/ai/flashcards/generate] Error:", error);
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
