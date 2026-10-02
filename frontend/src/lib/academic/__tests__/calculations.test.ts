import {
  determineGradeAndPoint,
  calculateWeightedTotal,
  calculateAverageScore,
  calculateCGPA,
  calculateAverageAttendance,
  calculateTotalStudyHours,
  calculateAverageStudyHours,
  calculateGradeDistribution,
  calculatePerformanceTrend,
  calculateSubjectPerformance,
  generateDeterministicInsights,
  calculateStudyConsistency,
  calculateScoreDistribution,
  calculateCorrelationMatrix,
  calculatePeriodProgress,
  calculatePersonalBests,
  calculateDataCompleteness,
} from "../calculations.ts";
import type { AcademicRecord, Subject, StudyActivity } from "@/types/academic";

// Simple test assertions
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function runCalculationTests() {
  console.log("Running LearnTrack Academic Calculation Unit Tests...");

  // Test 1: Grade determination
  const aPlus = determineGradeAndPoint(94);
  assert(aPlus.grade === "A+" && aPlus.gradePoint === 10.0, "94 should be A+ / 10.0");

  const aGrade = determineGradeAndPoint(82);
  assert(aGrade.grade === "A" && aGrade.gradePoint === 9.0, "82 should be A / 9.0");

  const bPlus = determineGradeAndPoint(76);
  assert(bPlus.grade === "B+" && bPlus.gradePoint === 8.0, "76 should be B+ / 8.0");

  const failGrade = determineGradeAndPoint(38);
  assert(failGrade.grade === "F" && failGrade.gradePoint === 0.0, "38 should be F / 0.0");

  // Test 2: Weighted total
  // Internal (30%) + Assignment (20%) + Exam (50%)
  // 80*0.3 + 90*0.2 + 70*0.5 = 24 + 18 + 35 = 77
  const weighted = calculateWeightedTotal(80, 90, 70);
  assert(weighted === 77, `Weighted total expected 77, got ${weighted}`);

  // Test 3: Average score
  const mockRecords: AcademicRecord[] = [
    {
      id: "rec-1",
      student_id: "std-1",
      subject_id: "sub-1",
      academic_year: "2025-2026",
      semester: 3,
      attendance_percentage: 90,
      assignment_marks: 85,
      internal_marks: 80,
      exam_marks: 75,
      total_marks: 78,
      grade: "B+",
      grade_point: 8.0,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
    {
      id: "rec-2",
      student_id: "std-1",
      subject_id: "sub-2",
      academic_year: "2025-2026",
      semester: 4,
      attendance_percentage: 80,
      assignment_marks: 90,
      internal_marks: 88,
      exam_marks: 85,
      total_marks: 86,
      grade: "A",
      grade_point: 9.0,
      created_at: "2026-06-01T00:00:00Z",
      updated_at: "2026-06-01T00:00:00Z",
    },
  ];

  const avgScore = calculateAverageScore(mockRecords);
  assert(avgScore === 82, `Average score expected 82, got ${avgScore}`);

  // Test 4: Credit-weighted CGPA
  // sub-1 (4 credits, 8.0 GP) -> 32 credit points
  // sub-2 (3 credits, 9.0 GP) -> 27 credit points
  // Total credit points = 59 / 7 = 8.43
  const mockSubjects: Subject[] = [
    {
      id: "sub-1",
      student_id: "std-1",
      subject_name: "Algorithms",
      subject_code: "CS201",
      credits: 4,
      semester: 3,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
    {
      id: "sub-2",
      student_id: "std-1",
      subject_name: "Databases",
      subject_code: "CS204",
      credits: 3,
      semester: 4,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    },
  ];

  const cgpa = calculateCGPA(mockRecords, mockSubjects);
  assert(cgpa === 8.43, `Credit-weighted CGPA expected 8.43, got ${cgpa}`);

  // Test 5: Average Attendance
  const avgAtt = calculateAverageAttendance(mockRecords);
  assert(avgAtt === 85, `Average attendance expected 85, got ${avgAtt}`);

  // Test 6: Performance trend
  // Sem 3 avg: 78, Sem 4 avg: 86
  // Diff: +8 / 78 = +10.256% -> +10.3%
  const trend = calculatePerformanceTrend(mockRecords);
  assert(trend !== null && trend.hasHistoricalData, "Trend should have historical data");
  assert(trend?.percentageChange === 10.3, `Trend percentage change expected 10.3, got ${trend?.percentageChange}`);

  // Test 7: Study Hours & Stats
  const mockStudy: StudyActivity[] = [
    {
      id: "act-1",
      student_id: "std-1",
      study_date: "2026-09-20",
      study_hours: 3.5,
      assignments_completed: 2,
      created_at: "2026-09-20T10:00:00Z",
    },
    {
      id: "act-2",
      student_id: "std-1",
      study_date: "2026-09-21",
      study_hours: 2.5,
      assignments_completed: 1,
      created_at: "2026-09-21T10:00:00Z",
    },
  ];

  const totalHours = calculateTotalStudyHours(mockStudy);
  assert(totalHours === 6.0, `Total study hours expected 6.0, got ${totalHours}`);

  const avgStudy = calculateAverageStudyHours(mockStudy);
  assert(avgStudy === 3.0, `Average daily study hours expected 3.0, got ${avgStudy}`);

  // Test 8: Deterministic Insights
  const insights = generateDeterministicInsights(mockRecords, mockSubjects, mockStudy);
  assert(insights.length >= 3, "Expected at least 3 deterministic insights");

  // Test 9: Phase 7 - Study Consistency
  // 2 unique active days in a 10-day period -> 20%
  const consistency = calculateStudyConsistency(mockStudy, 10);
  assert(consistency.percentage === 20, `Study consistency expected 20%, got ${consistency.percentage}%`);
  assert(consistency.activeDays === 2, `Active days expected 2, got ${consistency.activeDays}`);

  // Test 10: Phase 7 - Score Distribution Histogram
  const dist = calculateScoreDistribution(mockRecords);
  assert(dist.length === 6, "Expected 6 score histogram buckets");
  const bin70_79 = dist.find((b) => b.range === "70–79");
  const bin80_89 = dist.find((b) => b.range === "80–89");
  assert(bin70_79?.count === 1, "Expected 1 score in 70-79 bin");
  assert(bin80_89?.count === 1, "Expected 1 score in 80-89 bin");

  // Test 11: Phase 7 - Statistical Correlation Matrix (threshold test)
  // With 2 records (< 4 observations), should return empty array to prevent spurious artifacts
  const smallCorrelations = calculateCorrelationMatrix(mockRecords);
  assert(smallCorrelations.length === 0, "Correlations must be empty when sample < 4");

  // With >= 4 records, calculate correlation
  const extendedRecords: AcademicRecord[] = [
    ...mockRecords,
    {
      ...mockRecords[0],
      id: "rec-3",
      attendance_percentage: 95,
      internal_marks: 28,
      assignment_marks: 19,
      total_marks: 92,
    },
    {
      ...mockRecords[1],
      id: "rec-4",
      attendance_percentage: 70,
      internal_marks: 20,
      assignment_marks: 14,
      total_marks: 65,
    },
  ];
  const validCorrelations = calculateCorrelationMatrix(extendedRecords);
  assert(validCorrelations.length > 0, "Expected correlation pairs for sample >= 4");
  assert(validCorrelations[0].sampleSize === 4, "Sample size must reflect records count");

  // Test 12: Phase 7 - Period Progress Comparison
  const progress = calculatePeriodProgress([extendedRecords[1]], [extendedRecords[0]], 15, 10);
  assert(progress.hasPreviousPeriod === true, "Should detect previous period");
  assert(progress.studyHoursChange === 5, `Expected +5h study change, got ${progress.studyHoursChange}`);

  // Test 13: Phase 7 - Personal Bests
  const bests = calculatePersonalBests(extendedRecords, mockStudy, mockSubjects);
  assert(bests.length >= 3, `Expected at least 3 personal bests, got ${bests.length}`);
  const highestScore = bests.find((b) => b.metric === "Highest Evaluation Score");
  assert(highestScore?.value === "92%", `Highest score expected 92%, got ${highestScore?.value}`);

  // Test 14: Phase 7 - Data Completeness Indicator
  const completeness = calculateDataCompleteness(mockSubjects, extendedRecords, mockStudy);
  assert(completeness.percentage > 0 && completeness.percentage <= 100, "Completeness must be 0-100%");
  assert(completeness.totalFieldsChecked > 0, "Fields checked must be > 0");

  console.log("All calculation unit tests passed successfully!");
  return true;
}

if (typeof require !== "undefined" && require.main === module) {
  runCalculationTests();
}
