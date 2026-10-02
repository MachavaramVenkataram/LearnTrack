/**
 * LearnTrack AI Assistant Service
 *
 * Drives multi-turn academic conversation, Socratic guidance,
 * and concept explanations using the central AI router.
 */

import { routerGenerateText } from "../router";
import { GEMINI_PROMPTS } from "../gemini/prompts";
import { ChatMessage, ChatResult, StudentAIContext } from "../types";
import { formatStudentContextForPrompt } from "../context/student-context";

export async function chatWithAssistant(
  userId: string,
  messages: ChatMessage[],
  context?: StudentAIContext
): Promise<ChatResult> {
  const contextBlock = formatStudentContextForPrompt(context);

  const systemInstruction = `${GEMINI_PROMPTS.assistantSystem}
${contextBlock ? `\n\nStudent Academic Context:\n${contextBlock}` : ""}`;

  // Assemble conversation prompt
  const conversationFormatted = messages
    .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
    .join("\n\n");

  const prompt = `${conversationFormatted}\n\nTutor:`;

  const result = await routerGenerateText({
    prompt,
    systemInstruction,
    temperature: 0.4,
    maxTokens: 4096,
    feature: "ai_assistant_chat",
  });

  return {
    content: result.data,
    model: result.model,
  };
}
