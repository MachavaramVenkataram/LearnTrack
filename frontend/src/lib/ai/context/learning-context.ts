/**
 * LearnTrack Learning Documents Context
 *
 * Retrieves student notes and knowledge sources scoped strictly to the authenticated user.
 */

import { getNote, getNotes, getSources } from "@/lib/learning/service";
import { AI_CONFIG } from "../config";

export interface RetrievedLearningContext {
  text: string;
  reference: string;
  sourceType: "notes" | "knowledge_base" | "subject" | "topic" | "custom_text";
}

export async function retrieveLearningContext(params: {
  userId?: string;
  sourceType?: "notes" | "knowledge_base" | "subject" | "topic" | "custom_text";
  sourceId?: string;
  subject?: string;
  topic?: string;
  customText?: string;
}): Promise<RetrievedLearningContext> {
  const {
    userId,
    sourceType = "topic",
    sourceId,
    subject = "Academic Subject",
    topic = "Academic Topic",
    customText,
  } = params;

  // 1. Explicit Custom Text
  if (sourceType === "custom_text" && customText && customText.trim()) {
    const truncated = customText.trim().slice(0, AI_CONFIG.maxSourceCharacters);
    return {
      text: truncated,
      reference: `Custom Text Extract: ${subject} — ${topic}`,
      sourceType: "custom_text",
    };
  }

  // 2. Student Notebook Notes (RLS-guarded)
  if (sourceType === "notes" && userId) {
    try {
      if (sourceId) {
        const note = await getNote(sourceId);
        if (note && note.user_id === userId) {
          const truncated = note.content.slice(0, AI_CONFIG.maxSourceCharacters);
          return {
            text: truncated,
            reference: `Student Note: ${note.title}`,
            sourceType: "notes",
          };
        }
      } else {
        const notes = await getNotes(undefined, userId);
        const matched = notes.filter(
          (n) =>
            n.title.toLowerCase().includes(topic.toLowerCase()) ||
            n.content.toLowerCase().includes(topic.toLowerCase()) ||
            n.title.toLowerCase().includes(subject.toLowerCase())
        );

        if (matched.length > 0) {
          const combined = matched
            .map((m) => `[NOTE: ${m.title}]\n${m.content}`)
            .join("\n\n")
            .slice(0, AI_CONFIG.maxSourceCharacters);

          return {
            text: combined,
            reference: `Notes: ${matched.map((m) => m.title).slice(0, 2).join(", ")}`,
            sourceType: "notes",
          };
        }
      }
    } catch (err) {
      console.warn("[LearningContext] Note retrieval error:", err);
    }
  }

  // 3. Knowledge Base Documents (RLS-guarded)
  if (sourceType === "knowledge_base" && userId) {
    try {
      const sources = await getSources(userId);
      const matched = sources.filter(
        (s) =>
          s.title.toLowerCase().includes(topic.toLowerCase()) ||
          s.title.toLowerCase().includes(subject.toLowerCase())
      );

      if (matched.length > 0) {
        const combined = matched
          .map((s) => `[DOCUMENT: ${s.title}]\n${s.extracted_text || s.summary?.tldr || ""}`)
          .join("\n\n")
          .slice(0, AI_CONFIG.maxSourceCharacters);

        return {
          text: combined,
          reference: `Knowledge Base: ${matched[0].title}`,
          sourceType: "knowledge_base",
        };
      }
    } catch (err) {
      console.warn("[LearningContext] Knowledge Base retrieval error:", err);
    }
  }

  // 4. Curriculum / Topic fallback
  return {
    text: "",
    reference: `Curriculum Topic: ${subject} → ${topic}`,
    sourceType,
  };
}
