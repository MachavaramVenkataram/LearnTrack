/**
 * LearnTrack Recommendations & Command Center Daily Brief Service
 *
 * Generates personalized daily study briefs, priority reminders,
 * and goal recommendations grounded in verified student records.
 */

import { routerGenerateStructured } from "../router";
import { GEMINI_PROMPTS } from "../gemini/prompts";
import { z } from "zod";
import { DailyBriefInput, DailyBriefOutput } from "../types";

const DailyBriefSchema = z.object({
  greeting: z.string().min(5),
  topPriority: z.string().min(10),
  suggestedSession: z.object({
    subject: z.string().min(1),
    activity: z.string().min(5),
    durationMinutes: z.number().int().min(15).max(180),
  }),
  motivation: z.string().min(5),
});

export async function generateCommandCenterBrief(
  input: DailyBriefInput
): Promise<DailyBriefOutput> {
  const {
    studentName = "Student",
    activeSubjects = [],
    upcomingDeadlines = [],
    recentStudyMinutes = 0,
    cardsDueToday = 0,
  } = input;

  const prompt = `Generate a high-impact daily study briefing for ${studentName}:
- Enrolled Active Subjects: ${activeSubjects.length > 0 ? activeSubjects.join(", ") : "Current Courses"}
- Upcoming Deadlines / Exams: ${upcomingDeadlines.length > 0 ? upcomingDeadlines.map((d) => `${d.title} (due: ${d.due})`).join("; ") : "None in immediate 48 hours"}
- Recent Study Time Logged: ${Math.round(recentStudyMinutes / 60)} hours
- Spaced Repetition Flashcards Due Today: ${cardsDueToday} cards

Return a JSON object:
{
  "greeting": "Warm, professional greeting addressing the student",
  "topPriority": "Single highest-leverage academic task for today",
  "suggestedSession": {
    "subject": "Name of subject to study first",
    "activity": "Specific focused learning task",
    "durationMinutes": 45
  },
  "motivation": "Concise, evidence-based academic encouragement"
}`;

  const result = await routerGenerateStructured<DailyBriefOutput>({
    prompt,
    systemInstruction: GEMINI_PROMPTS.insightsSystem,
    validator: (data) => DailyBriefSchema.parse(data) as DailyBriefOutput,
    temperature: 0.2,
    maxTokens: 2048,
    feature: "command_center_brief",
  });

  return result.data;
}
