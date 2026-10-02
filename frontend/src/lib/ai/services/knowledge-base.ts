/**
 * LearnTrack Knowledge Base AI Service
 *
 * Grounded summarization, concept extraction, and Q&A over uploaded student documents.
 */

import { routerGenerateText } from "../router";
import { GEMINI_PROMPTS } from "../gemini/prompts";
import { AI_CONFIG } from "../config";

export async function summarizeKnowledgeDocument(
  documentText: string,
  title: string
): Promise<{ summary: string; keyTakeaways: string[] }> {
  const prompt = `Synthesize this uploaded academic document: "${title}".

Document Content:
${documentText.slice(0, AI_CONFIG.maxSourceCharacters)}

Produce a clean, structured summary:
1. Executive Summary (2-3 paragraphs)
2. Five Core Takeaways (bullet points)`;

  const result = await routerGenerateText({
    prompt,
    systemInstruction: GEMINI_PROMPTS.documentGroundingSystem,
    temperature: 0.2,
    maxTokens: 2048,
    feature: "knowledge_base_summary",
  });

  const text = result.data;

  const takeaways: string[] = [];
  const lines = text.split("\n");
  lines.forEach((l) => {
    if (l.trim().startsWith("- ") || l.trim().startsWith("* ") || /^\d+\.\s/.test(l.trim())) {
      takeaways.push(l.trim().replace(/^[-*]|\d+\.\s*/, "").trim());
    }
  });

  return {
    summary: text,
    keyTakeaways: takeaways.slice(0, 5),
  };
}
