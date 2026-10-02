/**
 * LearnTrack Student Context Extractor
 *
 * Scopes data extraction strictly to the authenticated student session.
 * Excludes private credentials, password hashes, and unnecessary personal data.
 */

import { StudentAIContext } from "@/types/academic";
import { buildStudentContext as baseBuildStudentContext } from "../contextBuilder";

export async function getStudentContext(
  userId: string,
  studentId?: string,
  studentName?: string
): Promise<StudentAIContext> {
  return await baseBuildStudentContext(userId, studentId, studentName);
}

/**
 * Converts a StudentAIContext object into a concise, token-efficient prompt string.
 */
export function formatStudentContextForPrompt(ctx?: StudentAIContext): string {
  if (!ctx) return "";

  const lines: string[] = [];
  lines.push(`### Authenticated Student Academic Profile`);
  lines.push(`- Student: ${ctx.studentName}`);
  lines.push(`- Year ${ctx.profile.year}, Semester ${ctx.profile.semester} (${ctx.profile.department})`);

  if (ctx.academic.subjects.length > 0) {
    lines.push(`- Enrolled Subjects:`);
    ctx.academic.subjects.forEach((s) => {
      const scoreStr = s.score !== null ? `Score: ${s.score}%` : "No score recorded";
      const attStr = s.attendance !== null ? `Attendance: ${s.attendance}%` : "No attendance";
      lines.push(`  * ${s.name} (${s.code}): ${scoreStr}, ${attStr}`);
    });
  }

  if (ctx.prediction) {
    lines.push(`- ML Academic Prediction:`);
    lines.push(`  * Predicted Final Grade: ${ctx.prediction.predicted_score.toFixed(1)}%`);
    if (ctx.prediction.key_factors && ctx.prediction.key_factors.length > 0) {
      lines.push(`  * Top Factors (SHAP):`);
      ctx.prediction.key_factors.slice(0, 3).forEach((f) => {
        lines.push(`    - ${f.label}: ${f.direction} (${f.description})`);
      });
    }
  }

  if (ctx.study) {
    lines.push(`- Study Cadence: ${ctx.study.total_hours} hrs total, ${ctx.study.daily_average} hrs/day avg`);
  }

  return lines.join("\n");
}
