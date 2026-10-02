import type { AcademicRecord, Subject, StudyActivity, AcademicSummary } from "@/types/academic";

/**
 * Determines letter grade and 10.0 grade point from total percentage/marks.
 */
export function determineGradeAndPoint(totalMarks: number): { grade: string; gradePoint: number } {
  const rounded = Math.round(totalMarks * 10) / 10;
  if (rounded >= 90) return { grade: "A+", gradePoint: 10.0 };
  if (rounded >= 80) return { grade: "A", gradePoint: 9.0 };
  if (rounded >= 75) return { grade: "B+", gradePoint: 8.0 };
  if (rounded >= 65) return { grade: "B", gradePoint: 7.0 };
  if (rounded >= 55) return { grade: "C", gradePoint: 6.0 };
  if (rounded >= 45) return { grade: "D", gradePoint: 5.0 };
  return { grade: "F", gradePoint: 0.0 };
}

/**
 * Computes standard weighted total score:
 * Internal assessments (30%) + Assignment sets (20%) + End semester exam (50%)
 */
export function calculateWeightedTotal(
  internalMarks: number,
  assignmentMarks: number,
  examMarks: number
): number {
  const total = internalMarks * 0.3 + assignmentMarks * 0.2 + examMarks * 0.5;
  return Math.min(100, Math.max(0, Math.round(total * 10) / 10));
}

/**
 * Section 19: calculateAverageScore
 * Computes overall average performance score across all academic records.
 */
export function calculateAverageScore(records: AcademicRecord[]): number | null {
  if (!records || records.length === 0) return null;
  const sum = records.reduce((acc, r) => acc + (Number(r.total_marks) || 0), 0);
  return Math.round((sum / records.length) * 10) / 10;
}

/**
 * Alias for calculateAverageScore
 */
export const calculateAverageMarks = calculateAverageScore;

/**
 * Section 20: calculateCGPA
 * Calculates Cumulative Grade Point Average (CGPA) on a 10.0 scale
 * weighted by course credit hours.
 * Formula: Σ(grade_point × credits) / Σ(credits)
 */
export function calculateCGPA(
  records: AcademicRecord[],
  subjects: Subject[]
): number | null {
  if (!records || records.length === 0) return null;

  const subjectCreditMap = new Map<string, number>();
  subjects.forEach((s) => subjectCreditMap.set(s.id, Number(s.credits) || 3));

  let totalCreditPoints = 0;
  let totalCredits = 0;

  for (const record of records) {
    const credits = subjectCreditMap.get(record.subject_id) || 3;
    const gradePoint =
      record.grade_point !== undefined && record.grade_point !== null
        ? Number(record.grade_point)
        : determineGradeAndPoint(record.total_marks).gradePoint;

    totalCreditPoints += gradePoint * credits;
    totalCredits += credits;
  }

  if (totalCredits === 0) return null;
  return Math.round((totalCreditPoints / totalCredits) * 100) / 100;
}

/**
 * Section 19: calculateAverageAttendance
 * Computes average attendance across all recorded subjects.
 */
export function calculateAverageAttendance(records: AcademicRecord[]): number | null {
  if (!records || records.length === 0) return null;
  const sum = records.reduce((acc, r) => acc + (Number(r.attendance_percentage) || 0), 0);
  return Math.round((sum / records.length) * 10) / 10;
}

/**
 * Section 19: calculateTotalStudyHours
 * Returns total hours recorded in study activity logs.
 */
export function calculateTotalStudyHours(activities: StudyActivity[]): number {
  if (!activities || activities.length === 0) return 0;
  const sum = activities.reduce((acc, a) => acc + (Number(a.study_hours) || 0), 0);
  return Math.round(sum * 10) / 10;
}

/**
 * Section 19: calculateAverageStudyHours
 * Computes average daily study hours based on unique study dates logged.
 */
export function calculateAverageStudyHours(activities: StudyActivity[]): number {
  if (!activities || activities.length === 0) return 0;
  const total = calculateTotalStudyHours(activities);
  const uniqueDates = new Set(activities.map((a) => a.study_date)).size || 1;
  return Math.round((total / uniqueDates) * 10) / 10;
}

/**
 * Computes study activity aggregates.
 */
export function calculateStudyStats(activities: StudyActivity[]) {
  const totalHours = calculateTotalStudyHours(activities);
  const averageDailyHours = calculateAverageStudyHours(activities);
  const totalAssignmentsCompleted = activities.reduce(
    (acc, a) => acc + (Number(a.assignments_completed) || 0),
    0
  );

  return {
    totalHours,
    averageDailyHours,
    totalAssignmentsCompleted,
  };
}

/**
 * Section 19: calculateGradeDistribution
 * Computes counts of each grade letter across all records.
 */
export function calculateGradeDistribution(records: AcademicRecord[]): Record<string, number> {
  const distribution: Record<string, number> = {
    "A+": 0,
    A: 0,
    "B+": 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0,
  };

  records.forEach((r) => {
    const grade = r.grade || determineGradeAndPoint(r.total_marks).grade;
    if (distribution[grade] !== undefined) {
      distribution[grade] += 1;
    }
  });

  return distribution;
}

/**
 * Section 21: calculatePerformanceTrend
 * Compares latest semester's average score vs the preceding semester.
 * If < 2 distinct semesters exist, returns a graceful fallback stating "No previous data".
 */
export interface PerformanceTrendResult {
  hasHistoricalData: boolean;
  percentageChange: number;
  direction: "up" | "down" | "flat";
  label: string;
  currentSemester: number;
  previousSemester?: number;
  currentAvg: number;
  previousAvg?: number;
}

export function calculatePerformanceTrend(records: AcademicRecord[]): PerformanceTrendResult | null {
  if (!records || records.length === 0) return null;

  // Group by semester
  const semMap = new Map<number, number[]>();
  records.forEach((r) => {
    const scores = semMap.get(r.semester) || [];
    scores.push(Number(r.total_marks) || 0);
    semMap.set(r.semester, scores);
  });

  const semesters = Array.from(semMap.keys()).sort((a, b) => a - b);

  if (semesters.length === 0) return null;

  const latestSem = semesters[semesters.length - 1];
  const latestScores = semMap.get(latestSem) || [];
  const currentAvg = Math.round((latestScores.reduce((a, b) => a + b, 0) / latestScores.length) * 10) / 10;

  if (semesters.length < 2) {
    return {
      hasHistoricalData: false,
      percentageChange: 0,
      direction: "flat",
      label: "No previous data",
      currentSemester: latestSem,
      currentAvg,
    };
  }

  const prevSem = semesters[semesters.length - 2];
  const prevScores = semMap.get(prevSem) || [];
  const previousAvg = Math.round((prevScores.reduce((a, b) => a + b, 0) / prevScores.length) * 10) / 10;

  if (previousAvg === 0) {
    return {
      hasHistoricalData: true,
      percentageChange: 0,
      direction: "flat",
      label: "Baseline established",
      currentSemester: latestSem,
      previousSemester: prevSem,
      currentAvg,
      previousAvg,
    };
  }

  const diff = currentAvg - previousAvg;
  const pctChange = Math.round(((diff / previousAvg) * 100) * 10) / 10;
  const direction: "up" | "down" | "flat" = pctChange > 0 ? "up" : pctChange < 0 ? "down" : "flat";
  const sign = pctChange > 0 ? "+" : "";

  return {
    hasHistoricalData: true,
    percentageChange: pctChange,
    direction,
    label: `${sign}${pctChange}% from previous semester`,
    currentSemester: latestSem,
    previousSemester: prevSem,
    currentAvg,
    previousAvg,
  };
}

/**
 * Section 19: calculateSubjectPerformance
 * Formats individual subject performance cards with marks, grade, attendance, and status.
 */
export interface SubjectPerformanceItem {
  id: string;
  subjectName: string;
  subjectCode?: string;
  credits: number;
  semester: number;
  score: number;
  grade: string;
  gradePoint: number;
  attendance: number;
  attendanceStatus: "optimal" | "warning" | "critical";
  performanceStatus: "excellent" | "good" | "needs_attention";
}

export function calculateSubjectPerformance(
  records: AcademicRecord[],
  subjects: Subject[]
): SubjectPerformanceItem[] {
  const subjectMap = new Map<string, Subject>();
  subjects.forEach((s) => subjectMap.set(s.id, s));

  // Sort by semester descending, then pick latest record per subject
  const recordMap = new Map<string, AcademicRecord>();
  const sortedRecords = [...records].sort((a, b) => b.semester - a.semester);

  sortedRecords.forEach((r) => {
    if (!recordMap.has(r.subject_id)) {
      recordMap.set(r.subject_id, r);
    }
  });

  return subjects.map((sub) => {
    const record = recordMap.get(sub.id);
    const score = record ? Number(record.total_marks) || 0 : 0;
    const gradeInfo = determineGradeAndPoint(score);
    const grade = record?.grade || gradeInfo.grade;
    const gradePoint = record?.grade_point !== undefined && record.grade_point !== null
      ? Number(record.grade_point)
      : gradeInfo.gradePoint;
    const attendance = record ? Number(record.attendance_percentage) || 0 : 0;

    const attendanceStatus: "optimal" | "warning" | "critical" =
      attendance >= 85 ? "optimal" : attendance >= 75 ? "warning" : "critical";

    const performanceStatus: "excellent" | "good" | "needs_attention" =
      score >= 80 ? "excellent" : score >= 65 ? "good" : "needs_attention";

    return {
      id: sub.id,
      subjectName: sub.subject_name,
      subjectCode: sub.subject_code,
      credits: Number(sub.credits) || 3,
      semester: sub.semester,
      score,
      grade,
      gradePoint,
      attendance,
      attendanceStatus,
      performanceStatus,
    };
  });
}

/**
 * Section 14: Data Insights (Non-ML deterministic insights)
 */
export interface AcademicInsight {
  id: string;
  type: "positive" | "warning" | "neutral" | "info";
  title: string;
  description: string;
}

export function generateDeterministicInsights(
  records: AcademicRecord[],
  subjects: Subject[],
  activities: StudyActivity[]
): AcademicInsight[] {
  const insights: AcademicInsight[] = [];

  if (records.length === 0 && subjects.length === 0) {
    return [
      {
        id: "empty-workspace",
        type: "info",
        title: "Workspace Initialized",
        description: "Add your semester subjects and coursework evaluations to unlock automated academic insights.",
      },
    ];
  }

  // 1. Highest scoring subject
  if (records.length > 0) {
    const subjectMap = new Map(subjects.map((s) => [s.id, s.subject_name]));
    const highest = [...records].sort((a, b) => Number(b.total_marks) - Number(a.total_marks))[0];
    if (highest) {
      const subName = subjectMap.get(highest.subject_id) || highest.subject?.subject_name || "coursework";
      insights.push({
        id: "highest-scoring",
        type: "positive",
        title: "Top Subject Performance",
        description: `Your highest-scoring subject is ${subName} with a score of ${highest.total_marks}% (Grade ${highest.grade}).`,
      });
    }

    // 2. Lowest scoring subject if more than 1 record
    if (records.length > 1) {
      const lowest = [...records].sort((a, b) => Number(a.total_marks) - Number(b.total_marks))[0];
      if (lowest && Number(lowest.total_marks) < Number(highest.total_marks)) {
        const subName = subjectMap.get(lowest.subject_id) || lowest.subject?.subject_name || "coursework";
        insights.push({
          id: "lowest-scoring",
          type: "warning",
          title: "Focus Opportunity",
          description: `${subName} currently has your lowest recorded score of ${lowest.total_marks}%. Consistent revision can elevate this mark.`,
        });
      }
    }

    // 3. Attendance threshold insight
    const lowAttendance = records.filter((r) => Number(r.attendance_percentage) < 75);
    if (lowAttendance.length > 0) {
      const names = lowAttendance
        .map((r) => subjectMap.get(r.subject_id) || r.subject?.subject_name || "Subject")
        .join(", ");
      insights.push({
        id: "attendance-warning",
        type: "warning",
        title: "Attendance Notice",
        description: `${names} ${lowAttendance.length > 1 ? "are" : "is"} below the 75% institutional attendance threshold.`,
      });
    } else {
      const avgAtt = calculateAverageAttendance(records);
      if (avgAtt && avgAtt >= 75) {
        insights.push({
          id: "attendance-healthy",
          type: "positive",
          title: "Attendance on Track",
          description: `Your average attendance is ${avgAtt}%, securely above the standard 75% examination eligibility minimum.`,
        });
      }
    }
  }

  // 4. Study Hours insight
  if (activities.length > 0) {
    const totalHours = calculateTotalStudyHours(activities);
    const avgDaily = calculateAverageStudyHours(activities);
    const totalAssignments = activities.reduce((acc, a) => acc + (Number(a.assignments_completed) || 0), 0);
    insights.push({
      id: "study-activity",
      type: "info",
      title: "Study Cadence",
      description: `You have recorded ${totalHours} hours of focused study and completed ${totalAssignments} assignment${
        totalAssignments !== 1 ? "s" : ""
      } across ${activities.length} session${activities.length !== 1 ? "s" : ""}.`,
    });
  }

  return insights;
}

/**
 * Generates full academic summary metrics.
 */
export function getAcademicSummary(
  records: AcademicRecord[],
  subjects: Subject[],
  activities: StudyActivity[]
): AcademicSummary {
  const gradeDistribution = calculateGradeDistribution(records);
  const studyStats = calculateStudyStats(activities);

  return {
    cgpa: calculateCGPA(records, subjects),
    averageAttendance: calculateAverageAttendance(records),
    averageMarks: calculateAverageScore(records),
    totalStudyHours: studyStats.totalHours,
    averageDailyStudyHours: studyStats.averageDailyHours,
    totalSubjects: subjects.length,
    totalRecords: records.length,
    gradeDistribution,
  };
}

// ==============================================================================
// PHASE 7: ADVANCED ANALYTICS CALCULATIONS
// ==============================================================================

/**
 * Requirement #8: Study Consistency Metric
 * Formula: (Number of days with recorded study activity in period / total days in period) * 100
 */
export function calculateStudyConsistency(
  activities: StudyActivity[],
  daysInPeriod: number = 30
): { percentage: number; activeDays: number; totalDays: number } {
  if (!activities || activities.length === 0 || daysInPeriod <= 0) {
    return { percentage: 0, activeDays: 0, totalDays: daysInPeriod };
  }

  const uniqueDates = new Set(activities.map((a) => a.study_date.split("T")[0]));
  const activeDays = Math.min(uniqueDates.size, daysInPeriod);
  const percentage = Math.round((activeDays / daysInPeriod) * 100);

  return {
    percentage,
    activeDays,
    totalDays: daysInPeriod,
  };
}

/**
 * Requirement #10: Score Distribution Histogram Buckets (0-49, 50-59, 60-69, 70-79, 80-89, 90-100)
 */
export function calculateScoreDistribution(
  records: AcademicRecord[]
): Array<{ range: string; count: number; percentage: number }> {
  const buckets = [
    { range: "0–49", min: 0, max: 49.99, count: 0 },
    { range: "50–59", min: 50, max: 59.99, count: 0 },
    { range: "60–69", min: 60, max: 69.99, count: 0 },
    { range: "70–79", min: 70, max: 79.99, count: 0 },
    { range: "80–89", min: 80, max: 89.99, count: 0 },
    { range: "90–100", min: 90, max: 100, count: 0 },
  ];

  if (!records || records.length === 0) {
    return buckets.map((b) => ({ range: b.range, count: 0, percentage: 0 }));
  }

  records.forEach((r) => {
    const val = Number(r.total_marks) || 0;
    const bucket = buckets.find((b) => val >= b.min && val <= b.max);
    if (bucket) bucket.count++;
  });

  return buckets.map((b) => ({
    range: b.range,
    count: b.count,
    percentage: Math.round((b.count / records.length) * 100),
  }));
}

/**
 * Requirement #13: Statistical Correlation Analysis
 * Pearson product-moment correlation coefficient: r = Σ(dx*dy) / sqrt(Σdx² * Σdy²)
 * Threshold: Requires at least 4 paired observations to avoid misleading small-sample correlations.
 */
export function calculateCorrelationMatrix(
  records: AcademicRecord[]
): Array<{
  variableA: string;
  variableB: string;
  coefficient: number;
  strength: "strong" | "moderate" | "weak";
  direction: "positive" | "negative";
  sampleSize: number;
}> {
  if (!records || records.length < 4) {
    return [];
  }

  const variables = [
    { name: "Attendance Rate", values: records.map((r) => r.attendance_percentage) },
    { name: "Internal Marks", values: records.map((r) => r.internal_marks) },
    { name: "Assignment Score", values: records.map((r) => r.assignment_marks) },
    { name: "Total Marks", values: records.map((r) => r.total_marks) },
  ];

  function pearson(x: number[], y: number[]): number {
    const n = x.length;
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let denX = 0;
    let denY = 0;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    if (denX === 0 || denY === 0) return 0;
    return Math.round((num / Math.sqrt(denX * denY)) * 100) / 100;
  }

  const results: any[] = [];

  for (let i = 0; i < variables.length; i++) {
    for (let j = i + 1; j < variables.length; j++) {
      const coeff = pearson(variables[i].values, variables[j].values);
      const abs = Math.abs(coeff);
      results.push({
        variableA: variables[i].name,
        variableB: variables[j].name,
        coefficient: coeff,
        strength: abs >= 0.7 ? "strong" : abs >= 0.4 ? "moderate" : "weak",
        direction: coeff >= 0 ? "positive" : "negative",
        sampleSize: records.length,
      });
    }
  }

  return results;
}

/**
 * Requirement #14: Period Progress Comparison
 * Compares current period records vs previous period records.
 */
export function calculatePeriodProgress(
  currentRecords: AcademicRecord[],
  previousRecords: AcademicRecord[],
  currentHours: number,
  previousHours: number
): {
  scoreChange: number | null;
  attendanceChange: number | null;
  studyHoursChange: number | null;
  hasPreviousPeriod: boolean;
} {
  if (!previousRecords || previousRecords.length === 0) {
    return {
      scoreChange: null,
      attendanceChange: null,
      studyHoursChange: null,
      hasPreviousPeriod: false,
    };
  }

  const currScore = calculateAverageScore(currentRecords) || 0;
  const prevScore = calculateAverageScore(previousRecords) || 0;

  const currAtt = calculateAverageAttendance(currentRecords) || 0;
  const prevAtt = calculateAverageAttendance(previousRecords) || 0;

  return {
    scoreChange: Math.round((currScore - prevScore) * 10) / 10,
    attendanceChange: Math.round((currAtt - prevAtt) * 10) / 10,
    studyHoursChange: Math.round((currentHours - previousHours) * 10) / 10,
    hasPreviousPeriod: true,
  };
}

/**
 * Requirement #15: Personal Bests
 * Evaluates verifiable milestones grounded strictly in actual recorded data.
 */
export function calculatePersonalBests(
  records: AcademicRecord[],
  activities: StudyActivity[],
  subjects: Subject[]
): Array<{
  metric: string;
  value: string;
  context: string;
  date?: string;
}> {
  const bests: any[] = [];
  const subjectMap = new Map(subjects.map((s) => [s.id, s.subject_name]));

  // 1. Highest recorded score
  if (records.length > 0) {
    const highestScoreRec = [...records].sort((a, b) => b.total_marks - a.total_marks)[0];
    const subName = subjectMap.get(highestScoreRec.subject_id) || "Coursework";
    bests.push({
      metric: "Highest Evaluation Score",
      value: `${highestScoreRec.total_marks}%`,
      context: `${subName} (Semester ${highestScoreRec.semester}, Grade ${highestScoreRec.grade})`,
    });

    // 2. Best attendance record
    const highestAttRec = [...records].sort(
      (a, b) => b.attendance_percentage - a.attendance_percentage
    )[0];
    const attSubName = subjectMap.get(highestAttRec.subject_id) || "Coursework";
    bests.push({
      metric: "Peak Course Attendance",
      value: `${highestAttRec.attendance_percentage}%`,
      context: `${attSubName} (Semester ${highestAttRec.semester})`,
    });
  }

  // 3. Longest study streak in activities
  if (activities.length > 0) {
    const uniqueDates = Array.from(
      new Set(activities.map((a) => a.study_date.split("T")[0]))
    ).sort();

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i - 1]);
      const curr = new Date(uniqueDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }

    bests.push({
      metric: "Longest Study Streak",
      value: `${maxStreak} ${maxStreak === 1 ? "day" : "days"}`,
      context: `Consecutive active focused study sessions recorded`,
    });

    // 4. Highest daily study hours
    const highestDay = [...activities].sort((a, b) => b.study_hours - a.study_hours)[0];
    if (highestDay) {
      bests.push({
        metric: "Peak Focused Day",
        value: `${highestDay.study_hours}h`,
        context: `Logged on ${highestDay.study_date.split("T")[0]}`,
        date: highestDay.study_date.split("T")[0],
      });
    }
  }

  return bests;
}

/**
 * Requirement #30: Data Completeness Indicator
 * Formula: Percentage of required academic fields populated across records and activities.
 */
export function calculateDataCompleteness(
  subjects: Subject[],
  records: AcademicRecord[],
  activities: StudyActivity[]
): {
  percentage: number;
  totalFieldsChecked: number;
  completedFields: number;
  status: "complete" | "adequate" | "needs_records";
  explanation: string;
} {
  let total = 0;
  let filled = 0;

  // Check subjects: subject_name, subject_code, credits, semester (4 fields each)
  subjects.forEach((s) => {
    total += 4;
    if (s.subject_name) filled++;
    if (s.subject_code) filled++;
    if (s.credits) filled++;
    if (s.semester) filled++;
  });

  // Check records: total_marks, attendance, internal_marks, assignment_marks, exam_marks (5 fields each)
  records.forEach((r) => {
    total += 5;
    if (r.total_marks !== null && r.total_marks !== undefined) filled++;
    if (r.attendance_percentage !== null && r.attendance_percentage !== undefined) filled++;
    if (r.internal_marks !== null && r.internal_marks !== undefined) filled++;
    if (r.assignment_marks !== null && r.assignment_marks !== undefined) filled++;
    if (r.exam_marks !== null && r.exam_marks !== undefined) filled++;
  });

  // Check activities: study_date, study_hours (2 fields each)
  activities.forEach((a) => {
    total += 2;
    if (a.study_date) filled++;
    if (a.study_hours) filled++;
  });

  if (total === 0) {
    return {
      percentage: 0,
      totalFieldsChecked: 0,
      completedFields: 0,
      status: "needs_records",
      explanation: "Add your semester subjects and marks to establish your academic profile.",
    };
  }

  const percentage = Math.round((filled / total) * 100);
  const status = percentage >= 85 ? "complete" : percentage >= 50 ? "adequate" : "needs_records";
  const explanation =
    status === "complete"
      ? "Comprehensive data available for high-fidelity trend analysis and prediction."
      : status === "adequate"
      ? "Sufficient data for core analytics. Logging exam marks improves projection precision."
      : "Add more academic records and attendance logs for more reliable analytics.";

  return {
    percentage,
    totalFieldsChecked: total,
    completedFields: filled,
    status,
    explanation,
  };
}
