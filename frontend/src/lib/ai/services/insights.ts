/**
 * LearnTrack Academic Insights Service
 *
 * Diagnoses real academic patterns and generates actionable insights grounded in
 * actual metrics calculated by Supabase and the academic engine.
 */

import { routerGenerateStructured } from "../router";
import { GEMINI_PROMPTS } from "../gemini/prompts";
import { AIInsightsOutputSchema } from "../validation/schemas";
import { AIInsightsOutput } from "../types";

export interface GenerateInsightsParams {
  studentName?: string;
  averageScore?: number | null;
  averageAttendance?: number | null;
  cgpa?: number | null;
  weakSubjects?: string[];
  strongSubjects?: string[];
  weeklyStudyHours?: number;
  assignmentsCompleted?: number;
  upcomingDeadlinesCount?: number;
}

export async function generateAcademicInsights(
  params: GenerateInsightsParams
): Promise<AIInsightsOutput> {
  const {
    studentName = "Student",
    averageScore,
    averageAttendance,
    cgpa,
    weakSubjects = [],
    strongSubjects = [],
    weeklyStudyHours = 0,
    assignmentsCompleted = 0,
    upcomingDeadlinesCount = 0,
  } = params;

  const prompt = `Generate diagnostic academic insights for ${studentName} based on verified academic data:
- Average Score: ${averageScore !== null && averageScore !== undefined ? `${averageScore}%` : "Not recorded"}
- Average Attendance: ${averageAttendance !== null && averageAttendance !== undefined ? `${averageAttendance}%` : "Not recorded"}
- CGPA: ${cgpa !== null && cgpa !== undefined ? cgpa : "Not recorded"}
- Strong Subjects (>=85%): ${strongSubjects.length > 0 ? strongSubjects.join(", ") : "None identified"}
- Subjects Needing Attention (<70%): ${weakSubjects.length > 0 ? weakSubjects.join(", ") : "None identified"}
- Weekly Study Hours: ${weeklyStudyHours} hrs
- Completed Assignments: ${assignmentsCompleted}
- Upcoming Deadlines: ${upcomingDeadlinesCount}

Analyze these verified figures and return a JSON object:
{
  "overview": "2-3 sentence executive summary of overall academic trajectory",
  "insights": [
    {
      "id": "ins_1",
      "title": "Short descriptive title",
      "category": "performance|attendance|study_habit|goal_alignment",
      "observation": "Factual observation explaining the trend",
      "impact": "positive|warning|neutral",
      "recommendation": "Concrete, actionable remedy or next step"
    }
  ]
}`;

  const result = await routerGenerateStructured<AIInsightsOutput>({
    prompt,
    systemInstruction: GEMINI_PROMPTS.insightsSystem,
    validator: (data) => AIInsightsOutputSchema.parse(data) as AIInsightsOutput,
    temperature: 0.2,
    maxTokens: 4096,
    feature: "academic_insights",
  });

  return result.data;
}
