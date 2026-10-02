/**
 * LearnTrack Career Hub & Interview Studio Service
 *
 * Provides resume diagnostics, bullet improvements, and technical interview questions.
 */

import { routerGenerateStructured } from "../router";
import { GEMINI_PROMPTS } from "../gemini/prompts";
import { ResumeAnalysisSchema, InterviewPrepSchema } from "../validation/schemas";
import {
  ResumeAnalysisInput,
  ResumeAnalysisOutput,
  InterviewPrepInput,
  InterviewPrepOutput,
} from "../types";

export async function analyzeResume(
  input: ResumeAnalysisInput
): Promise<ResumeAnalysisOutput> {
  const { resumeText, targetRole = "Software Engineering / Technical" } = input;

  const prompt = `Analyze this student resume for the target role: "${targetRole}".

Resume Content:
${resumeText.slice(0, 8000)}

Evaluate objectively without inventing qualifications.
Return a JSON object:
{
  "overallScore": 82,
  "strengths": ["List of strong accomplishments, keywords, or structure"],
  "skillGaps": ["Key missing industry skills or missing metrics for ${targetRole}"],
  "bulletImprovements": [
    {
      "original": "A weak bullet from the resume",
      "suggested": "Action-verb + Metric + Result rewording",
      "rationale": "Why this revision stands out to hiring managers"
    }
  ],
  "recommendedCertifications": ["Relevant recognized courses or certifications"]
}`;

  const result = await routerGenerateStructured<ResumeAnalysisOutput>({
    prompt,
    systemInstruction: GEMINI_PROMPTS.careerSystem,
    validator: (data) => ResumeAnalysisSchema.parse(data) as ResumeAnalysisOutput,
    temperature: 0.2,
    maxTokens: 4096,
    feature: "career_resume_analysis",
  });

  return result.data;
}

export async function generateInterviewQuestions(
  input: InterviewPrepInput
): Promise<InterviewPrepOutput> {
  const { role, topic, difficulty = "mid", count = 3 } = input;

  const prompt = `Generate ${count} realistic technical interview questions for a ${difficulty}-level "${role}" interview on the topic "${topic}".

Return a JSON object:
{
  "questions": [
    {
      "question": "Clear problem statement or scenario",
      "category": "technical|behavioral|system_design",
      "keyPointsToCover": ["Key technical concepts an interviewer expects to hear"],
      "idealResponseStructure": "High-level summary of the ideal response"
    }
  ]
}`;

  const result = await routerGenerateStructured<InterviewPrepOutput>({
    prompt,
    systemInstruction: GEMINI_PROMPTS.careerSystem,
    validator: (data) => InterviewPrepSchema.parse(data) as InterviewPrepOutput,
    temperature: 0.3,
    maxTokens: 4096,
    feature: "career_interview_prep",
  });

  return result.data;
}
