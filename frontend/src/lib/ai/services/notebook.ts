/**
 * LearnTrack Notebook AI Service
 *
 * Provides note summarization, grounded Q&A, and concept extraction
 * strictly isolated to the student's authorized notebook contents.
 */

import { routerGenerateText } from "../router";
import { GEMINI_PROMPTS } from "../gemini/prompts";
import { AI_CONFIG } from "../config";

export async function askNotebook(
  query: string,
  noteContent: string,
  sources?: Array<{ title: string; text: string }>
): Promise<{ answer: string; citations: string[] }> {
  let combinedContext = noteContent.slice(0, AI_CONFIG.maxSourceCharacters);

  const citations: string[] = ["Active Note"];
  if (sources && sources.length > 0) {
    sources.forEach((s) => citations.push(s.title));
    const extra = sources
      .map((s) => `[SOURCE: ${s.title}]\n${s.text}`)
      .join("\n\n")
      .slice(0, 4000);
    combinedContext = `${combinedContext}\n\n${extra}`;
  }

  const prompt = `Student Question: "${query}"

Student Notes Context:
${combinedContext}

Answer the student's question using ONLY the provided notes.
If the notes do not address the question, state: "The provided notes do not contain enough information to answer this question."`;

  const result = await routerGenerateText({
    prompt,
    systemInstruction: GEMINI_PROMPTS.documentGroundingSystem,
    temperature: 0.2,
    maxTokens: 2048,
    feature: "notebook_qa",
  });

  return {
    answer: result.data,
    citations,
  };
}

export async function summarizeNote(
  noteContent: string,
  title?: string
): Promise<string> {
  const prompt = `Summarize these academic notes${title ? ` on "${title}"` : ""}:

${noteContent.slice(0, AI_CONFIG.maxSourceCharacters)}

Produce a clean, structured summary with:
1. **Core Thesis / Key Takeaway** (1-2 sentences)
2. **Major Themes & Concepts** (bullet points)
3. **Actionable Review Items / Key Terms to Remember**`;

  const result = await routerGenerateText({
    prompt,
    systemInstruction: GEMINI_PROMPTS.documentGroundingSystem,
    temperature: 0.2,
    maxTokens: 2048,
    feature: "notebook_summary",
  });

  return result.data;
}

export async function transformNoteText(
  selectedText: string,
  action: "simplify" | "expand" | "bullet_points" | "generate_questions" | "latex"
): Promise<string> {
  let instruction = "Improve and clarify the text.";
  if (action === "simplify") {
    instruction = "Explain this concept in simpler, intuitive terms without losing core accuracy.";
  } else if (action === "expand") {
    instruction = "Expand on this with relevant academic depth, mechanisms, and examples.";
  } else if (action === "bullet_points") {
    instruction = "Convert this text into clear, high-yield bullet points.";
  } else if (action === "generate_questions") {
    instruction = "Generate 3 active-recall review questions based directly on this text.";
  } else if (action === "latex") {
    instruction = "Format any mathematical or scientific relationships using proper LaTeX syntax ($math$).";
  }

  const prompt = `${instruction}

Selected Text:
${selectedText.slice(0, 4000)}`;

  const result = await routerGenerateText({
    prompt,
    systemInstruction: GEMINI_PROMPTS.documentGroundingSystem,
    temperature: 0.3,
    maxTokens: 2048,
    feature: "notebook_transform",
  });

  return result.data;
}
