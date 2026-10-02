/**
 * LearnTrack Google Gemini AI Provider
 *
 * Implements the AIProvider interface using Google's official @google/genai SDK.
 * Features:
 * - Server-side only execution with strict API key protection
 * - Native structured JSON output via responseJsonSchema & responseMimeType
 * - Exponential backoff retry for transient errors (429, 503)
 * - Source-grounded prompt templates preventing hallucinations
 * - Schema validation & duplicate detection before database insertion
 */

import { GoogleGenAI, Type } from "@google/genai";
import { getGeminiClient } from "./gemini/client";
import { StudentAIContext, StudyPlanGenerationInput, GeneratedStudyPlanOutput } from "@/types/academic";
import {
  ChatMessage,
  ChatResult,
  AITextRequest,
  AIStructuredRequest,
  FlashcardGenerationInput,
  FlashcardGenerationOutput,
  GeneratedCardOutput,
  ExplanationInput,
} from "./types";
import { AI_CONFIG } from "./config";
import {
  AIError,
  AIMissingApiKeyError,
  AIRateLimitError,
  AINetworkError,
  AIInvalidOutputError,
} from "./errors";
import { FlashcardGenerationSchema } from "./schemas";
import { evaluateCardQuality, sanitizeCardText } from "@/lib/flashcards/validator";
import { logAIEvent, logAIOperationStart } from "./telemetry";
import { getStudentAssistantSystemPrompt } from "./prompts/studentAssistantPrompt";
import { getStudyPlanSystemPrompt } from "./prompts/studyPlanPrompt";

export class GeminiClient {
  public readonly name = "gemini";
  public readonly model: string;
  private readonly apiKey: string;
  private ai: GoogleGenAI | null = null;

  constructor(apiKey?: string, model?: string) {
    this.apiKey = apiKey !== undefined ? apiKey : AI_CONFIG.apiKey;
    this.model = model || AI_CONFIG.model;

    if (this.apiKey && this.apiKey.trim().length > 0) {
      if (!apiKey || apiKey === process.env.GEMINI_API_KEY) {
        this.ai = getGeminiClient();
      } else {
        this.ai = new GoogleGenAI({
          apiKey: this.apiKey,
        });
      }
    }
  }

  private getClient(): GoogleGenAI {
    if (!this.apiKey || this.apiKey.trim().length === 0) {
      throw new AIMissingApiKeyError(
        "GEMINI_API_KEY is not configured. Add it to the server environment."
      );
    }
    if (this.ai) return this.ai;
    return getGeminiClient();
  }

  /**
   * Executes a Gemini API call with safe retry for transient errors (429, 5xx)
   */
  private async executeWithRetry<T>(operation: () => Promise<T>, actionName: string): Promise<T> {
    let lastError: unknown;
    const maxRetries = AI_CONFIG.maxRetries;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (err: unknown) {
        lastError = err;
        const errMsg = err instanceof Error ? err.message : String(err || "");
        const lower = errMsg.toLowerCase();

        const isRateLimit = lower.includes("429") || lower.includes("resource_exhausted");
        const isTransientServer = lower.includes("503") || lower.includes("500") || lower.includes("overloaded");

        // Do NOT retry authentication or client validation errors
        const isAuthError = lower.includes("api_key") || lower.includes("401") || lower.includes("403");
        if (isAuthError) {
          throw new AIError(
            "AI generation credentials are invalid or unauthorized. Please verify the server GEMINI_API_KEY.",
            "AI_AUTH_ERROR",
            503,
            false
          );
        }

        if ((isRateLimit || isTransientServer) && attempt < maxRetries) {
          const delay = AI_CONFIG.retryInitialDelayMs * Math.pow(2, attempt) + Math.random() * 200;
          console.warn(`[AI] ${actionName} hit transient error (${errMsg}). Retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})...`);
          await new Promise((res) => setTimeout(res, delay));
          continue;
        }

        if (isRateLimit) {
          throw new AIRateLimitError();
        }

        if (lower.includes("fetch failed") || lower.includes("econnreset") || lower.includes("timeout")) {
          throw new AINetworkError();
        }

        throw new AIError(
          `Gemini generation failed: ${errMsg}`,
          "AI_PROVIDER_ERROR",
          500,
          false
        );
      }
    }

    throw lastError;
  }

  /**
   * 1. Free-form text generation
   */
  async generateText(input: AITextRequest): Promise<string> {
    const ai = this.getClient();
    const start = Date.now();
    logAIOperationStart("generate_text", this.name, this.model);

    try {
      const response = await this.executeWithRetry(async () => {
        return await ai.models.generateContent({
          model: this.model,
          contents: input.prompt,
          config: {
            systemInstruction: input.systemInstruction,
            temperature: input.temperature ?? 0.4,
            maxOutputTokens: input.maxTokens ?? 2000,
          },
        });
      }, "generateText");

      const text = response.text || "";
      logAIEvent({
        provider: this.name,
        model: this.model,
        action: "generate_text",
        durationMs: Date.now() - start,
        success: true,
      });

      return text;
    } catch (err) {
      logAIEvent({
        provider: this.name,
        model: this.model,
        action: "generate_text",
        durationMs: Date.now() - start,
        success: false,
        errorCode: err instanceof AIError ? err.code : "UNKNOWN",
      });
      throw err;
    }
  }

  /**
   * 2. Schema-enforced structured generation
   */
  async generateStructured<T>(input: AIStructuredRequest<T>): Promise<T> {
    const ai = this.getClient();
    const start = Date.now();
    logAIOperationStart("generate_structured", this.name, this.model);

    try {
      const response = await this.executeWithRetry(async () => {
        return await ai.models.generateContent({
          model: this.model,
          contents: input.prompt,
          config: {
            systemInstruction: input.systemInstruction,
            temperature: input.temperature ?? 0.2,
            maxOutputTokens: input.maxTokens ?? 3000,
            responseMimeType: "application/json",
            ...(input.schema ? { responseJsonSchema: input.schema } : {}),
          },
        });
      }, "generateStructured");

      const rawText = response.text || "";
      const cleaned = rawText
        .replace(/^```json/im, "")
        .replace(/^```/im, "")
        .replace(/```$/im, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      const result = input.validator ? input.validator(parsed) : (parsed as T);

      logAIEvent({
        provider: this.name,
        model: this.model,
        action: "generate_structured",
        durationMs: Date.now() - start,
        success: true,
      });

      return result;
    } catch (err) {
      logAIEvent({
        provider: this.name,
        model: this.model,
        action: "generate_structured",
        durationMs: Date.now() - start,
        success: false,
        errorCode: err instanceof AIError ? err.code : "UNKNOWN",
      });
      throw err;
    }
  }

  /**
   * 3. Source-Grounded Flashcard Generation
   * Implements strict pedagogical constraints, structured JSON schema,
   * quality validation, and duplicate filtering.
   */
  async generateFlashcards(input: FlashcardGenerationInput): Promise<FlashcardGenerationOutput> {
    const ai = this.getClient();
    const start = Date.now();

    const targetCount = Math.min(
      AI_CONFIG.maxCardsPerRequest,
      Math.max(AI_CONFIG.minCardsPerRequest, input.count ?? AI_CONFIG.defaultCardCount)
    );

    const cleanSubject = input.subject.trim() || "Academic Subject";
    const cleanTopic = input.topic.trim() || "General";
    const difficulty = (input.difficulty === "mixed" ? "medium" : input.difficulty) || "medium";
    const cardType = (input.cardType === "mixed" ? "concept" : input.cardType) || "concept";
    const learningGoal = input.learningGoal || "Understand";
    const existingQuestions = input.existingQuestions || [];

    // Truncate source material to stay well within free tier limits
    let groundedSourceText = input.sourceText?.trim() || "";
    if (groundedSourceText.length > AI_CONFIG.maxSourceCharacters) {
      groundedSourceText = groundedSourceText.slice(0, AI_CONFIG.maxSourceCharacters) + "\n...[Content truncated for generation]";
    }

    const sourceCitation =
      input.sourceReference ||
      (groundedSourceText
        ? `Course Material: ${cleanTopic}`
        : `Curriculum Topic: ${cleanSubject} — ${cleanTopic}`);

    logAIOperationStart("generate_flashcards", this.name, this.model, {
      subject: cleanSubject,
      topic: cleanTopic,
      targetCount,
      difficulty,
    });

    const systemInstruction = `You are LearnTrack's expert educational assessment designer and professor of ${cleanSubject}.
Your purpose is to synthesize high-quality active-recall flashcards from the supplied learning material.

STRICT PEDAGOGICAL DIRECTIVES:
1. Each flashcard must test exactly ONE specific learning objective or mechanism.
2. Questions must require retrieval practice rather than passive recognition.
3. Questions must be specific, concise, and academically meaningful.
4. Avoid vague or trivial questions (e.g. NEVER ask "What is the principal objective of...").
5. Avoid questions that contain their own answer.
6. Prefer conceptual understanding, comparison, application, scenario-based reasoning, formulas, and exam-relevant recall.
7. Answers must be concise, accurate, and self-contained (under 350 characters).
8. Explanations must clarify WHY the answer is correct and its conceptual significance.
9. Examples must illustrate a concrete application or real-world problem.
10. Hints must provide a retrieval cue that stimulates memory without giving away the answer.
11. Use ONLY the supplied source material. Do not hallucinate. Do not invent citations.

Return a JSON object containing an array of card objects under the key "cards".`;

    const userPrompt = `Generate ${targetCount} high-yield active-recall flashcards for:
Subject: ${cleanSubject}
Topic: ${cleanTopic}
Difficulty: ${difficulty}
Preferred Card Type: ${cardType}
Learning Goal: ${learningGoal}
Citation Reference: ${sourceCitation}

${groundedSourceText ? `SOURCE GROUNDING MATERIAL (Ground facts strictly in this text):\n${groundedSourceText}\n\n` : ""}
Generate ${targetCount} cards now.`;

    // Define JSON schema for Gemini response
    const flashcardJsonSchema = {
      type: Type.OBJECT,
      properties: {
        cards: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "Specific question testing one concept (active recall)",
              },
              answer: {
                type: Type.STRING,
                description: "Concise, precise answer",
              },
              explanation: {
                type: Type.STRING,
                description: "Why this concept matters or its theoretical significance",
              },
              example: {
                type: Type.STRING,
                description: "Concrete application or scenario",
              },
              hint: {
                type: Type.STRING,
                description: "Recall cue that does not give away the answer",
              },
              topic: {
                type: Type.STRING,
                description: "Topic of the card",
              },
              difficulty: {
                type: Type.STRING,
                description: "easy, medium, or hard",
              },
              card_type: {
                type: Type.STRING,
                description: "definition, concept, comparison, application, cause_effect, formula, scenario, exam, or code",
              },
              source_reference: {
                type: Type.STRING,
                description: "Citation of the source material",
              },
            },
            propertyOrdering: [
              "question",
              "answer",
              "explanation",
              "example",
              "hint",
              "topic",
              "difficulty",
              "card_type",
              "source_reference",
            ],
          },
        },
      },
      propertyOrdering: ["cards"],
    };

    try {
      const response = await this.executeWithRetry(async () => {
        return await ai.models.generateContent({
          model: this.model,
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.25,
            maxOutputTokens: 3500,
            responseMimeType: "application/json",
            responseJsonSchema: flashcardJsonSchema,
          },
        });
      }, "generateFlashcards");

      const rawText = response.text || "";
      if (!rawText.trim()) {
        throw new AIInvalidOutputError("Gemini returned an empty response.");
      }

      let parsedJson: unknown;
      try {
        const cleaned = rawText
          .replace(/^```json/im, "")
          .replace(/^```/im, "")
          .replace(/```$/im, "")
          .trim();
        parsedJson = JSON.parse(cleaned);
      } catch {
        throw new AIInvalidOutputError("Failed to parse Gemini response as JSON.");
      }

      // Validate with Zod
      const validationResult = FlashcardGenerationSchema.safeParse(parsedJson);
      if (!validationResult.success) {
        console.warn("[Gemini] Schema validation warning:", validationResult.error.flatten());
        throw new AIInvalidOutputError("Generated cards failed structured schema validation.");
      }

      const rawCards = validationResult.data.cards;
      const validCards: GeneratedCardOutput[] = [];
      let duplicateCount = 0;
      let rejectedCount = 0;

      const seenInBatch: string[] = [...existingQuestions];

      for (const card of rawCards) {
        const cleanQ = sanitizeCardText(card.question);
        const cleanA = sanitizeCardText(card.answer);
        const cleanExp = sanitizeCardText(card.explanation);
        const cleanEx = sanitizeCardText(card.example);
        const cleanHint = sanitizeCardText(card.hint);

        // Quality rule evaluation
        const quality = evaluateCardQuality(
          {
            question: cleanQ,
            answer: cleanA,
            explanation: cleanExp,
            example: cleanEx,
            hint: cleanHint,
            difficulty: card.difficulty,
            card_type: card.card_type,
            topic: cleanTopic,
          },
          seenInBatch
        );

        if (quality.status === "invalid") {
          rejectedCount++;
          continue;
        }

        // Check if duplicate
        if (quality.issues.some((issue) => issue.toLowerCase().includes("duplicate"))) {
          duplicateCount++;
          continue;
        }

        seenInBatch.push(cleanQ);

        validCards.push({
          question: cleanQ,
          answer: cleanA,
          explanation: cleanExp || "Clarifies core theoretical mechanism and exam takeaways.",
          example: cleanEx,
          hint: cleanHint,
          topic: cleanTopic,
          difficulty: card.difficulty,
          card_type: card.card_type as GeneratedCardOutput["card_type"],
          source_reference: sourceCitation,
        });
      }

      const durationMs = Date.now() - start;

      logAIEvent({
        provider: this.name,
        model: this.model,
        action: "generate_flashcards",
        durationMs,
        success: true,
        itemCount: validCards.length,
      });

      return {
        success: true,
        cards: validCards,
        metadata: {
          provider: this.name,
          model: this.model,
          generatedCount: rawCards.length,
          validCount: validCards.length,
          rejectedCount,
          duplicateCount,
          durationMs,
        },
      };
    } catch (err) {
      logAIEvent({
        provider: this.name,
        model: this.model,
        action: "generate_flashcards",
        durationMs: Date.now() - start,
        success: false,
        errorCode: err instanceof AIError ? err.code : "UNKNOWN",
      });
      throw err;
    }
  }

  /**
   * 4. Academic Concept Explanation
   */
  async generateExplanation(input: ExplanationInput): Promise<string> {
    const stylePrompt =
      input.style === "simple"
        ? "Explain this concept in plain, simple terms using an everyday analogy."
        : input.style === "exam_prep"
        ? "Explain this concept strictly from an examination standpoint: define it, outline key formulas, and highlight common exam traps."
        : input.style === "socratic"
        ? "Guide the student through understanding this concept by asking 2-3 thought-provoking diagnostic questions."
        : "Provide a rigorous, clear academic explanation with formal definitions and examples.";

    return await this.generateText({
      prompt: `${stylePrompt}\n\nConcept: ${input.concept}\nSubject: ${input.subject || "Academic"}\n\n${input.contextText ? `Context:\n${input.contextText}\n\n` : ""}`,
      systemInstruction: "You are an expert university professor and tutor at LearnTrack.",
      temperature: 0.3,
    });
  }

  /**
   * 5. Personalized Study Plan Generation
   */
  async generateStudyPlan(
    input: StudyPlanGenerationInput,
    context: StudentAIContext,
    startDateStr: string
  ): Promise<GeneratedStudyPlanOutput> {
    const prompt = getStudyPlanSystemPrompt(input, context, startDateStr);

    return await this.generateStructured<GeneratedStudyPlanOutput>({
      prompt: `${prompt}\n\nPlease generate the JSON study plan following the schema strictly. Return only valid JSON:`,
      temperature: 0.2,
      validator: (data: unknown) => {
        const parsed = data as GeneratedStudyPlanOutput;
        if (!parsed || !Array.isArray(parsed.days) || parsed.days.length === 0) {
          throw new AIInvalidOutputError("Generated study plan is missing days array.");
        }
        return parsed;
      },
    });
  }

  /**
   * 6. Interactive Multi-turn Chat
   */
  async chat(messages: ChatMessage[], context?: StudentAIContext): Promise<ChatResult> {
    const ai = this.getClient();
    const systemPrompt = getStudentAssistantSystemPrompt(context);
    const start = Date.now();

    // Map messages to Gemini contents format
    const contents: Array<{ role: "user" | "model"; parts: [{ text: string }] }> = [];

    for (const msg of messages) {
      if (msg.role === "system") continue;
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    }

    try {
      const response = await this.executeWithRetry(async () => {
        return await ai.models.generateContent({
          model: this.model,
          contents: contents.length > 0 ? contents : [{ role: "user", parts: [{ text: "Hello" }] }],
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.4,
            maxOutputTokens: 1500,
          },
        });
      }, "chat");

      const text = response.text || "Unable to synthesize response.";

      logAIEvent({
        provider: this.name,
        model: this.model,
        action: "chat",
        durationMs: Date.now() - start,
        success: true,
      });

      return {
        content: text,
        model: this.model,
      };
    } catch (err) {
      logAIEvent({
        provider: this.name,
        model: this.model,
        action: "chat",
        durationMs: Date.now() - start,
        success: false,
        errorCode: err instanceof AIError ? err.code : "UNKNOWN",
      });
      throw err;
    }
  }
}
