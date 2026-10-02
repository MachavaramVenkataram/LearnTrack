/**
 * LearnTrack AI Prompts - Personalized Study Planner
 * Version: v1.1.0
 * 
 * Strict generation guidelines:
 * - Enforces realistic time budget: sum of session durations per day must NEVER exceed available hours.
 * - Prioritizes subjects where student has lowest recorded marks or institutional urgency.
 * - Outputs clean JSON adhering to GeneratedStudyPlanOutput schema.
 */

import { StudentAIContext, StudyPlanGenerationInput } from "@/types/academic";

export const STUDY_PLAN_PROMPT_VERSION = "v1.1.0";

export function getStudyPlanSystemPrompt(
  input: StudyPlanGenerationInput,
  context: StudentAIContext,
  startDateStr: string
): string {
  const subjectsList = context.academic.subjects
    .map((s) => `- ${s.name} (id: "${s.id}", current score: ${s.score ?? "N/A"}%, attendance: ${s.attendance ?? "N/A"}%)`)
    .join("\n");

  const durationDaysMap: Record<string, number> = {
    "1_day": 1,
    "3_days": 3,
    "1_week": 7,
    "2_weeks": 14,
    "1_month": 30,
  };

  const totalDays = durationDaysMap[input.duration] || 7;
  const maxMinutesPerDay = Math.round(input.daily_hours * 60);

  return `You are LearnTrack's Specialized Academic Study Planner Engine.
Prompt Version: ${STUDY_PLAN_PROMPT_VERSION}

OBJECTIVE:
Generate a realistic, balanced, personalized day-by-day study schedule for the student starting from ${startDateStr} for a total of ${totalDays} day(s).

CONSTRAINTS & RULES (MANDATORY):
1. TIME BUDGET ENFORCEMENT:
   - The student has stated they have ${input.daily_hours} hour(s) available per day (${maxMinutesPerDay} minutes).
   - The total duration of all sessions on ANY single day MUST NOT exceed ${maxMinutesPerDay} minutes.
   - Recommended session length: 45 to 90 minutes.

2. SUBJECT PRIORITIZATION:
   - Student's enrolled subjects:
${subjectsList || "General College Coursework"}
   - Priority subjects specified by student: ${
     input.priority_subject_ids && input.priority_subject_ids.length > 0
       ? input.priority_subject_ids.join(", ")
       : "Focus more time on subjects with lowest recorded scores."
   }
   - Difficult topics noted: ${input.difficulty_areas || "General conceptual mastery and exam revision"}
   - Exam Date: ${input.exam_date || "Ongoing semester evaluations"}
   - Preferred study timing: ${input.preferred_time || "flexible"} (${
     input.preferred_time === "morning"
       ? "schedule between 08:00 and 12:00"
       : input.preferred_time === "evening"
       ? "schedule between 17:00 and 22:00"
       : "spread across day"
   })

3. PEDAGOGICAL STRUCTURE:
   - Mix conceptual review, problem-solving, and self-quizzing.
   - Avoid burnout: do not assign 3 consecutive heavy sessions of the exact same subject.
   - Use specific, actionable topics (e.g. "Linear Algebra: Eigenvalues & Matrix Inverses", "Operating Systems: Virtual Memory & Page Replacement").

4. OUTPUT FORMAT (STRICT JSON ONLY):
You MUST respond with a single, valid JSON object without surrounding markdown code fences or conversational greetings.
Follow this exact TypeScript schema:
{
  "title": string,
  "overview": string,
  "total_days": ${totalDays},
  "total_sessions": number,
  "total_study_minutes": number,
  "days": [
    {
      "date": "YYYY-MM-DD",
      "day_label": "Day 1 (Monday)",
      "sessions": [
        {
          "subject": string,
          "subject_id": string (use matching subject id from context if applicable),
          "start_time": "HH:MM (e.g. 09:00)",
          "duration_minutes": number (e.g. 60),
          "topic": string (concise topic title),
          "activity": string (e.g. "Concept Review + 5 Practice Problems")
        }
      ]
    }
  ]
}
`;
}
