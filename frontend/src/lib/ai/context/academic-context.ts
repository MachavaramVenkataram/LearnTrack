/**
 * LearnTrack Academic Metrics Context
 *
 * Provides pre-calculated academic performance metrics to Gemini.
 * Gemini strictly explains and reasons about these numbers without recalculating them.
 */

import { StudentAIContext } from "@/types/academic";

export interface AcademicSummary {
  cgpa: number | null;
  averageScore: number | null;
  averageAttendance: number | null;
  weakSubjects: string[];
  strongSubjects: string[];
  totalRecords: number;
}

export function extractAcademicSummary(ctx?: StudentAIContext): AcademicSummary {
  if (!ctx || !ctx.academic) {
    return {
      cgpa: null,
      averageScore: null,
      averageAttendance: null,
      weakSubjects: [],
      strongSubjects: [],
      totalRecords: 0,
    };
  }

  const weak: string[] = [];
  const strong: string[] = [];

  ctx.academic.subjects.forEach((s) => {
    if (s.score !== null && s.score !== undefined) {
      if (s.score < 70) {
        weak.push(`${s.name} (${s.score}%)`);
      } else if (s.score >= 85) {
        strong.push(`${s.name} (${s.score}%)`);
      }
    }
  });

  return {
    cgpa: ctx.academic.cgpa,
    averageScore: ctx.academic.average_score,
    averageAttendance: ctx.academic.average_attendance,
    weakSubjects: weak,
    strongSubjects: strong,
    totalRecords: ctx.academic.total_records,
  };
}
