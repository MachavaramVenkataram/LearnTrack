/**
 * LearnTrack AI Context Builder
 * Assembles a structured, privacy-sanitized snapshot of the authenticated student's
 * academic metrics, enrolled subjects, study cadence, and ML predictions.
 * 
 * Strict Privacy:
 * - Excludes auth tokens, hashed passwords, session cookies, and system credentials.
 * - Only includes academic signals needed for grounded study assistance.
 */

import { StudentAIContext } from "@/types/academic";
import { getDashboardData, getPredictionHistory } from "@/lib/academic/service";

export async function buildStudentContext(
  userId: string,
  studentId?: string,
  studentName?: string
): Promise<StudentAIContext> {
  // Default fallback context
  const defaultContext: StudentAIContext = {
    studentName: studentName || "Student",
    profile: {
      semester: 1,
      department: "Engineering / Computer Science",
      university: "Institute of Technology & Science",
      year: 1,
    },
    academic: {
      subjects: [],
      average_score: null,
      average_attendance: null,
      cgpa: null,
      total_records: 0,
    },
    study: {
      total_hours: 0,
      daily_average: 0,
      assignments_completed: 0,
      recent_sessions_count: 0,
    },
    prediction: null,
  };

  if (!userId) return defaultContext;

  try {
    const [dashData, predictionHistory] = await Promise.all([
      getDashboardData(userId),
      studentId ? getPredictionHistory(studentId) : Promise.resolve([]),
    ]);

    if (!dashData) return defaultContext;

    const { student, subjects, records, summary, activities } = dashData;

    // Map subjects with latest marks & attendance
    const mappedSubjects = subjects.map((sub) => {
      const record = records.find((r) => r.subject_id === sub.id);
      return {
        id: sub.id,
        name: sub.subject_name,
        code: sub.subject_code,
        credits: sub.credits,
        score: record ? record.total_marks : null,
        attendance: record ? record.attendance_percentage : null,
        grade: record ? record.grade : null,
      };
    });

    // Extract latest prediction and top SHAP explanations
    let predictionSnapshot: StudentAIContext["prediction"] = null;
    if (predictionHistory && predictionHistory.length > 0) {
      const latest = predictionHistory[0];
      predictionSnapshot = {
        predicted_score: latest.predicted_score,
        predicted_grade: latest.predicted_grade,
        risk_level: latest.risk_level,
        model_version: latest.model_version || "v1.0.0",
        key_factors: (latest.explanations || []).map((exp) => ({
          label: exp.label,
          impact: exp.raw_impact,
          direction: exp.direction,
          description: exp.description,
        })),
      };
    }

    const assignmentsDone = activities.reduce(
      (sum, act) => sum + (act.assignments_completed || 0),
      0
    );

    return {
      studentName: studentName || "Student",
      profile: {
        semester: student?.semester || 1,
        department: student?.department || "Computer Science & Engineering",
        university: student?.university || "Institute of Technology & Science",
        year: student?.year || 1,
      },
      academic: {
        subjects: mappedSubjects,
        average_score: summary.averageMarks,
        average_attendance: summary.averageAttendance,
        cgpa: summary.cgpa,
        total_records: summary.totalRecords,
      },
      study: {
        total_hours: summary.totalStudyHours,
        daily_average: summary.averageDailyStudyHours,
        assignments_completed: assignmentsDone,
        recent_sessions_count: activities.length,
      },
      prediction: predictionSnapshot,
    };
  } catch (error) {
    console.error("[ContextBuilder] Error assembling student context:", error);
    return defaultContext;
  }
}
