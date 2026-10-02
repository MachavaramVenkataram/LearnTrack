/**
 * LearnTrack Phase 6: AI Assistant & Study Planner Unit Tests
 */

import assert from "node:assert";
import { LocalEngineProvider } from "../providers/localEngineProvider.ts";
import { getStudentAssistantSystemPrompt } from "../prompts/studentAssistantPrompt.ts";
import { getStudyPlanSystemPrompt } from "../prompts/studyPlanPrompt.ts";
import type { StudentAIContext, StudyPlanGenerationInput } from "../../../types/academic.ts";

const mockContext: StudentAIContext = {
  studentName: "Jane Doe",
  profile: {
    semester: 3,
    department: "Data Science & AI",
    university: "Tech Institute",
    year: 2,
  },
  academic: {
    subjects: [
      { id: "sub-1", name: "Machine Learning", credits: 4, score: 62, attendance: 70 },
      { id: "sub-2", name: "Database Systems", credits: 3, score: 85, attendance: 90 },
    ],
    average_score: 73.5,
    average_attendance: 80.0,
    cgpa: 3.5,
    total_records: 2,
  },
  study: {
    total_hours: 15.0,
    daily_average: 2.1,
    assignments_completed: 6,
    recent_sessions_count: 5,
  },
  prediction: {
    predicted_score: 76.5,
    predicted_grade: "B+",
    risk_level: "Medium",
    model_version: "v1.0.0",
    key_factors: [
      {
        label: "Attendance Rate",
        impact: -2.5,
        direction: "negative",
        description: "Attendance is slightly below target",
      },
      {
        label: "Internal Assessment",
        impact: 4.8,
        direction: "positive",
        description: "Good continuous marks",
      },
    ],
  },
};

export async function runAITests() {
  console.log("Starting LearnTrack AI Assistant & Study Planner Unit Tests...\n");

  const provider = new LocalEngineProvider();

  // Test 1: General educational questions
  console.log("Test 1: Concept tutoring - Supervised Learning");
  const res1 = await provider.chat([{ role: "user", content: "What is supervised learning?" }]);
  assert(res1.content.includes("Supervised Learning"), "Should explain supervised learning");
  assert(res1.content.includes("Regression"), "Should distinguish regression");
  assert(res1.content.includes("Classification"), "Should distinguish classification");
  console.log("✓ Concept explanation passed.");

  // Test 2: Personalized questions follow Observation / Why It Matters / Suggested Action
  console.log("Test 2: Personalized recommendation structure");
  const res2 = await provider.chat(
    [{ role: "user", content: "What should I focus on improving?" }],
    mockContext
  );
  assert(res2.content.includes("### Observation"), "Must include Observation heading");
  assert(res2.content.includes("### Why It Matters"), "Must include Why It Matters heading");
  assert(res2.content.includes("### Suggested Action"), "Must include Suggested Action heading");
  assert(res2.content.includes("Machine Learning"), "Should identify Machine Learning as lowest scoring subject");
  assert(res2.content.includes("62%"), "Should cite actual score 62%");
  console.log("✓ Personalized 3-part framework passed.");

  // Test 3: Non-causal language adherence
  console.log("Test 3: Non-causal policy check");
  const contentLower = res2.content.toLowerCase();
  assert(!contentLower.includes("will get an a"), "Must not guarantee grade A");
  assert(!contentLower.includes("will fail"), "Must not claim deterministic failure");
  assert(!contentLower.includes("guarantees"), "Must not claim guarantees");
  console.log("✓ Non-causal language policy passed.");

  // Test 4: Study plan generation adheres to time budget
  console.log("Test 4: Study plan generation & time budget enforcement");
  const input: StudyPlanGenerationInput = {
    duration: "1_week",
    daily_hours: 2,
    preferred_time: "morning",
    priority_subject_ids: ["sub-1"],
  };

  const plan = await provider.generateStudyPlan(input, mockContext, "2026-09-28");
  assert.strictEqual(plan.total_days, 7, "Should produce exactly 7 days for 1_week duration");
  assert(plan.days.length === 7, "Should have 7 day objects");

  const maxAllowedDailyMinutes = input.daily_hours * 60;
  for (const day of plan.days) {
    const dayMinutes = day.sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
    assert(
      dayMinutes <= maxAllowedDailyMinutes,
      `Day ${day.day_label} minutes (${dayMinutes}) must not exceed daily budget (${maxAllowedDailyMinutes})`
    );
  }
  console.log("✓ Study plan time budget enforcement passed.");

  // Test 5: Prompts include contextual grounding
  console.log("Test 5: Prompt template context inclusion");
  const sysPrompt = getStudentAssistantSystemPrompt(mockContext);
  assert(sysPrompt.includes("Jane Doe"), "Should include student name");
  assert(sysPrompt.includes("Data Science & AI"), "Should include department");
  assert(sysPrompt.includes("Machine Learning"), "Should include subject list");
  assert(sysPrompt.includes("NON-CAUSAL LANGUAGE POLICY"), "Must include strict policy instruction");
  console.log("✓ Prompt templates passed.");

  console.log("\n=============================================");
  console.log("ALL PHASE 6 AI & STUDY PLAN TESTS PASSED (5/5)!");
  console.log("=============================================");
}

if (process.argv[1]?.includes("ai.test")) {
  runAITests().catch((err) => {
    console.error("Test failure:", err);
    process.exit(1);
  });
}
