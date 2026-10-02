import { supabase } from "@/lib/supabase/client";
import {
  Student,
  Subject,
  AcademicRecord,
  StudyActivity,
  PerformancePrediction,
  PerformanceInsight,
  SimulationRecord,
  AIConversation,
  AIMessage,
  StudyPlan,
  StudyPlanSession,
  SessionStatus,
  GeneratedStudyPlanOutput,
  AcademicGoal,
  AcademicSummary,
} from "@/types/academic";
import {
  calculatePerformanceTrend,
  PerformanceTrendResult,
  calculateSubjectPerformance,
  SubjectPerformanceItem,
  generateDeterministicInsights,
  AcademicInsight,
  getAcademicSummary,
} from "@/lib/academic/calculations";

// ==============================================================================
// 1. STUDENT PROFILE OPERATIONS
// ==============================================================================

export async function getStudentProfile(profileId: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    console.error("[LearnTrack Database] Error fetching student profile:", error.message);
    return null;
  }
  return data;
}

export async function createStudentProfile(
  studentData: Omit<Student, "id" | "created_at" | "updated_at">
): Promise<{ data: Student | null; error: string | null }> {
  const { data, error } = await supabase
    .from("students")
    .insert([studentData])
    .select()
    .single();

  if (error) {
    console.error("[LearnTrack Database] Error creating student profile:", error.message);
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function updateStudentProfile(
  studentId: string,
  updates: Partial<Student>
): Promise<{ data: Student | null; error: string | null }> {
  const { data, error } = await supabase
    .from("students")
    .update(updates)
    .eq("id", studentId)
    .select()
    .single();

  if (error) {
    console.error("[LearnTrack Database] Error updating student profile:", error.message);
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

// ==============================================================================
// 2. SUBJECT MANAGEMENT
// ==============================================================================

export async function getSubjects(studentId: string): Promise<Subject[]> {
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("student_id", studentId)
    .order("semester", { ascending: true })
    .order("subject_name", { ascending: true });

  if (error) {
    console.error("[LearnTrack Database] Error fetching subjects:", error.message);
    return [];
  }
  return data || [];
}

export async function createSubject(
  subjectData: Omit<Subject, "id" | "created_at" | "updated_at">
): Promise<{ data: Subject | null; error: string | null }> {
  const { data, error } = await supabase
    .from("subjects")
    .insert([subjectData])
    .select()
    .single();

  if (error) {
    console.error("[LearnTrack Database] Error creating subject:", error.message);
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function updateSubject(
  subjectId: string,
  updates: Partial<Subject>
): Promise<{ data: Subject | null; error: string | null }> {
  const { data, error } = await supabase
    .from("subjects")
    .update(updates)
    .eq("id", subjectId)
    .select()
    .single();

  if (error) {
    console.error("[LearnTrack Database] Error updating subject:", error.message);
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function deleteSubject(subjectId: string): Promise<boolean> {
  const { error } = await supabase.from("subjects").delete().eq("id", subjectId);
  if (error) {
    console.error("[LearnTrack Database] Error deleting subject:", error.message);
    return false;
  }
  return true;
}

// ==============================================================================
// 3. ACADEMIC RECORDS
// ==============================================================================

export async function getAcademicRecords(
  studentId: string,
  semester?: number
): Promise<AcademicRecord[]> {
  let query = supabase
    .from("academic_records")
    .select("*, subject:subjects(*)")
    .eq("student_id", studentId);

  if (semester !== undefined) {
    query = query.eq("semester", semester);
  }

  const { data, error } = await query.order("semester", { ascending: false });

  if (error) {
    console.error("[LearnTrack Database] Error fetching academic records:", error.message);
    return [];
  }

  // Format joined subject relation
  const rawList = (data || []) as unknown as Array<AcademicRecord & { subject?: Subject | Subject[] }>;
  return rawList.map((r) => ({
    ...r,
    subject: Array.isArray(r.subject) ? r.subject[0] : r.subject,
  }));
}

export async function createAcademicRecord(
  recordData: Omit<AcademicRecord, "id" | "created_at" | "updated_at">
): Promise<{ data: AcademicRecord | null; error: string | null }> {
  const { data, error } = await supabase
    .from("academic_records")
    .insert([recordData])
    .select("*, subject:subjects(*)")
    .single();

  if (error) {
    console.error("[LearnTrack Database] Error creating academic record:", error.message);
    return { data: null, error: error.message };
  }

  const raw = data as unknown as AcademicRecord & { subject?: Subject | Subject[] };
  const formatted: AcademicRecord = {
    ...raw,
    subject: Array.isArray(raw.subject) ? raw.subject[0] : raw.subject,
  };
  return { data: formatted, error: null };
}

export async function updateAcademicRecord(
  recordId: string,
  updates: Partial<AcademicRecord>
): Promise<{ data: AcademicRecord | null; error: string | null }> {
  const { data, error } = await supabase
    .from("academic_records")
    .update(updates)
    .eq("id", recordId)
    .select("*, subject:subjects(*)")
    .single();

  if (error) {
    console.error("[LearnTrack Database] Error updating academic record:", error.message);
    return { data: null, error: error.message };
  }

  const raw = data as unknown as AcademicRecord & { subject?: Subject | Subject[] };
  const formatted: AcademicRecord = {
    ...raw,
    subject: Array.isArray(raw.subject) ? raw.subject[0] : raw.subject,
  };
  return { data: formatted, error: null };
}

export async function deleteAcademicRecord(recordId: string): Promise<boolean> {
  const { error } = await supabase.from("academic_records").delete().eq("id", recordId);
  if (error) {
    console.error("[LearnTrack Database] Error deleting academic record:", error.message);
    return false;
  }
  return true;
}

// ==============================================================================
// 4. STUDY ACTIVITY LOGGING
// ==============================================================================

export async function getStudyActivities(
  studentId: string,
  limitDays = 30
): Promise<StudyActivity[]> {
  const { data, error } = await supabase
    .from("study_activity")
    .select("*")
    .eq("student_id", studentId)
    .order("study_date", { ascending: false })
    .limit(limitDays);

  if (error) {
    console.error("[LearnTrack Database] Error fetching study activities:", error.message);
    return [];
  }
  return data || [];
}

export async function createStudyActivity(
  activityData: Omit<StudyActivity, "id" | "created_at">
): Promise<{ data: StudyActivity | null; error: string | null }> {
  const { data, error } = await supabase
    .from("study_activity")
    .insert([activityData])
    .select()
    .single();

  if (error) {
    console.error("[LearnTrack Database] Error logging study activity:", error.message);
    return { data: null, error: error.message };
  }
  return { data, error: null };
}

export async function deleteStudyActivity(activityId: string): Promise<boolean> {
  const { error } = await supabase.from("study_activity").delete().eq("id", activityId);
  if (error) {
    console.error("[LearnTrack Database] Error deleting study activity:", error.message);
    return false;
  }
  return true;
}

// ==============================================================================
// 5. UNIFIED DASHBOARD ANALYTICS DATA AGGREGATION
// ==============================================================================

export interface RecentActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp: string;
  meta: string;
}

export interface DashboardData {
  student: Student;
  subjects: Subject[];
  records: AcademicRecord[];
  activities: StudyActivity[];
  summary: AcademicSummary;
  trend: PerformanceTrendResult | null;
  subjectPerformance: SubjectPerformanceItem[];
  insights: AcademicInsight[];
  recentActivities: RecentActivityItem[];
}

export async function getDashboardData(profileId: string): Promise<DashboardData | null> {
  const student = await getStudentProfile(profileId);
  if (!student) return null;

  const [subRes, recRes, actRes] = await Promise.all([
    supabase
      .from("subjects")
      .select("id, student_id, subject_name, subject_code, credits, semester, created_at, updated_at")
      .eq("student_id", student.id)
      .order("semester", { ascending: true })
      .order("subject_name", { ascending: true }),
    supabase
      .from("academic_records")
      .select("id, student_id, subject_id, academic_year, semester, attendance_percentage, assignment_marks, internal_marks, exam_marks, total_marks, grade, grade_point, created_at, updated_at, subject:subjects(id, subject_name, subject_code, credits, semester)")
      .eq("student_id", student.id)
      .order("semester", { ascending: false }),
    supabase
      .from("study_activity")
      .select("id, student_id, study_date, study_hours, assignments_completed, notes, created_at")
      .eq("student_id", student.id)
      .order("study_date", { ascending: false })
      .limit(30),
  ]);

  const subjects = (subRes.data as Subject[]) || [];
  const rawRecords = (recRes.data || []) as unknown as Array<AcademicRecord & { subject?: Subject | Subject[] }>;
  const records = rawRecords.map((r) => ({
    ...r,
    subject: Array.isArray(r.subject) ? r.subject[0] : r.subject,
  }));
  const activities = (actRes.data as StudyActivity[]) || [];

  const summary = getAcademicSummary(records, subjects, activities);
  const trend = calculatePerformanceTrend(records);
  const subjectPerformance = calculateSubjectPerformance(records, subjects);
  const insights = generateDeterministicInsights(records, subjects, activities);

  const recentActivities: RecentActivityItem[] = activities.slice(0, 5).map((a) => ({
    id: a.id,
    type: "study",
    title: `Study Session: ${a.study_hours} hrs logged`,
    description: a.notes || `${a.assignments_completed || 0} assignments completed`,
    timestamp: a.study_date,
    meta: a.notes || `${a.assignments_completed || 0} assignments completed`,
  }));

  return {
    student,
    subjects,
    records,
    activities,
    summary,
    trend,
    subjectPerformance,
    insights,
    recentActivities,
  };
}

// ==============================================================================
// 6. PERFORMANCE PREDICTIONS
// ==============================================================================

export async function savePredictionRecord(
  predictionData: Omit<PerformancePrediction, "id" | "created_at">
): Promise<PerformancePrediction | null> {
  const { data, error } = await supabase
    .from("performance_predictions")
    .insert([predictionData])
    .select()
    .single();

  if (error) {
    console.error("[LearnTrack Database] Error saving prediction record:", error.message);
    return null;
  }
  return data;
}

export async function getPredictionHistory(studentId: string): Promise<PerformancePrediction[]> {
  const { data, error } = await supabase
    .from("performance_predictions")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[LearnTrack Database] Error fetching prediction history:", error.message);
    return [];
  }
  return data || [];
}

export async function deletePredictionRecord(predictionId: string): Promise<boolean> {
  const { error } = await supabase
    .from("performance_predictions")
    .delete()
    .eq("id", predictionId);

  if (error) {
    console.error("[LearnTrack Database] Error deleting prediction:", error.message);
    return false;
  }
  return true;
}

// ==============================================================================
// 7. SIMULATION HISTORY
// ==============================================================================

export async function saveSimulationRecord(
  recordData: Omit<SimulationRecord, "id" | "created_at">
): Promise<SimulationRecord | null> {
  const { data, error } = await supabase
    .from("simulation_history")
    .insert([recordData])
    .select()
    .single();

  if (error) {
    console.error("[LearnTrack Database] Error saving simulation record:", error.message);
    return null;
  }
  return data;
}

export async function getSimulationHistory(studentId: string): Promise<SimulationRecord[]> {
  const { data, error } = await supabase
    .from("simulation_history")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[LearnTrack Database] Error fetching simulation history:", error.message);
    return [];
  }
  return data || [];
}

export async function deleteSimulationRecord(simulationId: string): Promise<boolean> {
  const { error } = await supabase
    .from("simulation_history")
    .delete()
    .eq("id", simulationId);

  if (error) {
    console.error("[LearnTrack Database] Error deleting simulation record:", error.message);
    return false;
  }
  return true;
}

// ==============================================================================
// 8. PERFORMANCE INSIGHTS
// ==============================================================================

export async function savePerformanceInsights(
  insights: Omit<PerformanceInsight, "id" | "created_at">[]
): Promise<PerformanceInsight[]> {
  if (insights.length === 0) return [];

  const { data, error } = await supabase
    .from("performance_insights")
    .insert(insights)
    .select();

  if (error) {
    console.error("[LearnTrack Database] Error saving insights:", error.message);
    return [];
  }
  return data || [];
}

export async function getStudentInsights(studentId: string): Promise<PerformanceInsight[]> {
  const { data, error } = await supabase
    .from("performance_insights")
    .select("*")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[LearnTrack Database] Error fetching student insights:", error.message);
    return [];
  }
  return data || [];
}

// ==============================================================================
// 9. AI CONVERSATIONS & MESSAGES
// ==============================================================================

export async function getAIConversations(studentId: string): Promise<AIConversation[]> {
  const { data, error } = await supabase
    .from("ai_conversations")
    .select("*")
    .eq("student_id", studentId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[LearnTrack Database] Error fetching AI conversations:", error.message);
    return [];
  }
  return data || [];
}

export async function createAIConversation(
  studentId: string,
  title: string
): Promise<AIConversation | null> {
  const { data, error } = await supabase
    .from("ai_conversations")
    .insert([
      {
        student_id: studentId,
        title,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("[LearnTrack Database] Error creating conversation:", error.message);
    return null;
  }
  return data;
}

export async function updateAIConversationTitle(
  conversationId: string,
  title: string
): Promise<boolean> {
  const { error } = await supabase
    .from("ai_conversations")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  if (error) {
    console.error("[LearnTrack Database] Error updating conversation title:", error.message);
    return false;
  }
  return true;
}

export async function deleteAIConversation(conversationId: string): Promise<boolean> {
  const { error } = await supabase
    .from("ai_conversations")
    .delete()
    .eq("id", conversationId);

  if (error) {
    console.error("[LearnTrack Database] Error deleting conversation:", error.message);
    return false;
  }
  return true;
}

export async function getAIMessages(conversationId: string): Promise<AIMessage[]> {
  const { data, error } = await supabase
    .from("ai_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[LearnTrack Database] Error fetching AI messages:", error.message);
    return [];
  }
  return data || [];
}

export async function addAIMessage(
  conversationIdOrData: string | Omit<AIMessage, "id" | "created_at">,
  role?: "user" | "assistant",
  content?: string
): Promise<AIMessage | null> {
  const messageData: Omit<AIMessage, "id" | "created_at"> =
    typeof conversationIdOrData === "string"
      ? { conversation_id: conversationIdOrData, role: role || "user", content: content || "" }
      : conversationIdOrData;

  const { data, error } = await supabase
    .from("ai_messages")
    .insert([messageData])
    .select()
    .single();

  if (error) {
    console.error("[LearnTrack Database] Error adding AI message:", error.message);
    return null;
  }

  // Touch conversation updated_at
  await supabase
    .from("ai_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", messageData.conversation_id);

  return data;
}

// ==============================================================================
// 10. STUDY PLANS & SCHEDULED SESSIONS
// ==============================================================================

export async function getActiveStudyPlan(studentId: string): Promise<StudyPlan | null> {
  const { data: plan, error: planError } = await supabase
    .from("study_plans")
    .select("*, sessions:study_plan_sessions(*)")
    .eq("student_id", studentId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (planError) {
    console.error("[LearnTrack Database] Error fetching active study plan:", planError.message);
    return null;
  }
  return plan;
}

export async function getStudyPlans(studentId: string): Promise<StudyPlan[]> {
  const { data, error } = await supabase
    .from("study_plans")
    .select("*, sessions:study_plan_sessions(*)")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[LearnTrack Database] Error fetching study plans:", error.message);
    return [];
  }
  return data || [];
}

export async function saveStudyPlanWithSessions(
  studentId: string,
  planOutput: GeneratedStudyPlanOutput,
  startDateStr?: string,
  endDateStr?: string
): Promise<StudyPlan | null> {
  // Archive existing active plans
  await supabase
    .from("study_plans")
    .update({ status: "archived" })
    .eq("student_id", studentId)
    .eq("status", "active");

  const start = startDateStr || (planOutput.days && planOutput.days[0]?.date) || new Date().toISOString().split("T")[0];
  const end = endDateStr || (planOutput.days && planOutput.days[planOutput.days.length - 1]?.date) || start;

  const { data: plan, error: planError } = await supabase
    .from("study_plans")
    .insert([
      {
        student_id: studentId,
        title: planOutput.title,
        start_date: start,
        end_date: end,
        status: "active",
      },
    ])
    .select()
    .single();

  if (planError || !plan) {
    console.error("[LearnTrack Database] Error creating study plan:", planError?.message);
    return null;
  }

  // Insert session rows
  const sessionRows: Array<{
    study_plan_id: string;
    subject_id: string | null;
    session_date: string;
    start_time: string;
    duration_minutes: number;
    topic: string;
    activity: string;
    status: SessionStatus;
  }> = [];

  if (planOutput.days && Array.isArray(planOutput.days)) {
    for (const day of planOutput.days) {
      if (day.sessions && Array.isArray(day.sessions)) {
        for (const s of day.sessions) {
          sessionRows.push({
            study_plan_id: plan.id,
            subject_id: s.subject_id || null,
            session_date: day.date,
            start_time: s.start_time,
            duration_minutes: s.duration_minutes,
            topic: s.topic,
            activity: s.activity,
            status: "upcoming",
          });
        }
      }
    }
  }

  if (sessionRows.length > 0) {
    const { data: createdSessions, error: sessError } = await supabase
      .from("study_plan_sessions")
      .insert(sessionRows)
      .select();

    if (sessError) {
      console.error("[LearnTrack Database] Error inserting sessions:", sessError.message);
    }
    return { ...plan, sessions: createdSessions || [] };
  }

  return { ...plan, sessions: [] };
}

export async function updateStudySessionStatus(
  sessionId: string,
  status: SessionStatus
): Promise<boolean> {
  const { error } = await supabase
    .from("study_plan_sessions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (error) {
    console.error("[LearnTrack Database] Error updating session status:", error.message);
    return false;
  }
  return true;
}

export async function deleteStudyPlan(planId: string): Promise<boolean> {
  const { error } = await supabase.from("study_plans").delete().eq("id", planId);
  if (error) {
    console.error("[LearnTrack Database] Error deleting study plan:", error.message);
    return false;
  }
  return true;
}

export async function logStudySessionActivity(
  studentId: string,
  sessionOrDate: StudyPlanSession | string,
  durationMinutes?: number,
  topic?: string,
  subjectName?: string
): Promise<StudyActivity | null> {
  const sessionDate = typeof sessionOrDate === "string" ? sessionOrDate : sessionOrDate.session_date;
  const minutes = typeof sessionOrDate === "string" ? durationMinutes || 60 : sessionOrDate.duration_minutes;
  const noteTopic = typeof sessionOrDate === "string" ? topic || "Study Session" : `${sessionOrDate.topic} (${sessionOrDate.activity})`;
  const notes = subjectName ? `[${subjectName}] ${noteTopic}` : `Completed: ${noteTopic}`;

  const { data, error } = await supabase
    .from("study_activity")
    .insert([
      {
        student_id: studentId,
        study_date: sessionDate,
        study_hours: Math.round((minutes / 60) * 10) / 10,
        assignments_completed: 0,
        notes,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("[LearnTrack Database] Error logging study activity from session:", error.message);
    return null;
  }
  return data;
}

// ==============================================================================
// 11. ACADEMIC GOALS
// ==============================================================================

export async function getAcademicGoals(studentId: string): Promise<AcademicGoal[]> {
  const { data, error } = await supabase
    .from("academic_goals")
    .select("*, subject:subjects(id, subject_name, subject_code)")
    .eq("student_id", studentId)
    .order("deadline", { ascending: true });

  if (error) {
    console.error("[LearnTrack Database] Error fetching academic goals:", error.message);
    return [];
  }

  const rawGoals = (data || []) as unknown as Array<AcademicGoal & { subject?: Subject | Subject[] }>;
  return rawGoals.map((g) => ({
    ...g,
    subject: Array.isArray(g.subject) ? g.subject[0] : g.subject,
  }));
}

export async function createAcademicGoal(
  goalData: Omit<AcademicGoal, "id" | "created_at" | "updated_at">
): Promise<{ data: AcademicGoal | null; error: string | null }> {
  const { data, error } = await supabase
    .from("academic_goals")
    .insert([goalData])
    .select("*, subject:subjects(id, subject_name, subject_code)")
    .single();

  if (error) {
    console.error("[LearnTrack Database] Error creating goal:", error.message);
    return { data: null, error: error.message };
  }

  const raw = data as unknown as AcademicGoal & { subject?: Subject | Subject[] };
  const formatted: AcademicGoal = {
    ...raw,
    subject: Array.isArray(raw.subject) ? raw.subject[0] : raw.subject,
  };
  return { data: formatted, error: null };
}

export async function updateAcademicGoal(
  goalId: string,
  updates: Partial<AcademicGoal>
): Promise<{ data: AcademicGoal | null; error: string | null }> {
  const { data, error } = await supabase
    .from("academic_goals")
    .update(updates)
    .eq("id", goalId)
    .select("*, subject:subjects(id, subject_name, subject_code)")
    .single();

  if (error) {
    console.error("[LearnTrack Database] Error updating goal:", error.message);
    return { data: null, error: error.message };
  }

  const raw = data as unknown as AcademicGoal & { subject?: Subject | Subject[] };
  const formatted: AcademicGoal = {
    ...raw,
    subject: Array.isArray(raw.subject) ? raw.subject[0] : raw.subject,
  };
  return { data: formatted, error: null };
}

export async function deleteAcademicGoal(goalId: string): Promise<boolean> {
  const { error } = await supabase.from("academic_goals").delete().eq("id", goalId);
  if (error) {
    console.error("[LearnTrack Database] Error deleting goal:", error.message);
    return false;
  }
  return true;
}

export async function syncGoalProgressWithData(studentId: string): Promise<void> {
  const [goals, , records, activities] = await Promise.all([
    getAcademicGoals(studentId),
    getSubjects(studentId),
    getAcademicRecords(studentId),
    getStudyActivities(studentId, 60),
  ]);

  if (goals.length === 0) return;

  const totalStudyHours = activities.reduce((acc, a) => acc + (a.study_hours || 0), 0);
  const totalAssignments = activities.reduce((acc, a) => acc + (a.assignments_completed || 0), 0);
  const avgAttendance =
    records.length > 0
      ? records.reduce((acc, r) => acc + r.attendance_percentage, 0) / records.length
      : 0;
  const avgScore =
    records.length > 0
      ? records.reduce((acc, r) => acc + r.total_marks, 0) / records.length
      : 0;

  for (const goal of goals) {
    if (goal.status === "completed" || goal.status === "expired") continue;

    let computedValue = goal.current_value;

    switch (goal.goal_type) {
      case "attendance":
        computedValue = Math.round(avgAttendance * 10) / 10;
        break;
      case "average_score":
        computedValue = Math.round(avgScore * 10) / 10;
        break;
      case "subject_score":
        if (goal.subject_id) {
          const rec = records.find((r) => r.subject_id === goal.subject_id);
          if (rec) computedValue = rec.total_marks;
        }
        break;
      case "study_hours":
        computedValue = Math.round(totalStudyHours * 10) / 10;
        break;
      case "assignments":
        computedValue = totalAssignments;
        break;
    }

    const isTargetMet = computedValue >= goal.target_value;
    const newStatus = isTargetMet ? "completed" : goal.status;

    if (computedValue !== goal.current_value || newStatus !== goal.status) {
      await updateAcademicGoal(goal.id, {
        current_value: computedValue,
        status: newStatus,
      });
    }
  }
}

// ==============================================================================
// 12. SUBJECT DETAILS WITH HISTORICAL ANALYTICS
// ==============================================================================

export async function getSubjectWithAnalytics(
  studentId: string,
  subjectId: string
): Promise<{
  subject: Subject | null;
  records: AcademicRecord[];
  allStudentRecords: AcademicRecord[];
  summary: {
    latestScore: number | null;
    latestAttendance: number | null;
    latestGrade: string | null;
    averageMarks: number | null;
    isAboveAverage: boolean;
  };
} | null> {
  const [subjects, allRecords] = await Promise.all([
    getSubjects(studentId),
    getAcademicRecords(studentId),
  ]);

  const subject = subjects.find((s) => s.id === subjectId) || null;
  if (!subject) return null;

  const subjectRecords = allRecords
    .filter((r) => r.subject_id === subjectId)
    .sort((a, b) => a.semester - b.semester);

  const overallAvg =
    allRecords.length > 0
      ? allRecords.reduce((acc, r) => acc + r.total_marks, 0) / allRecords.length
      : null;

  const latestRecord = subjectRecords.length > 0 ? subjectRecords[subjectRecords.length - 1] : null;

  return {
    subject,
    records: subjectRecords,
    allStudentRecords: allRecords,
    summary: {
      latestScore: latestRecord ? latestRecord.total_marks : null,
      latestAttendance: latestRecord ? latestRecord.attendance_percentage : null,
      latestGrade: latestRecord ? latestRecord.grade : null,
      averageMarks: overallAvg !== null ? Math.round(overallAvg * 10) / 10 : null,
      isAboveAverage:
        latestRecord && overallAvg !== null ? latestRecord.total_marks >= overallAvg : false,
    },
  };
}

// ==============================================================================
// 13. DATA EXPORT HELPERS
// ==============================================================================

export async function exportStudentAcademicData(studentId: string): Promise<{
  exported_at: string;
  student: Student | null;
  subjects: Subject[];
  records: AcademicRecord[];
  study_activities: StudyActivity[];
  goals: AcademicGoal[];
}> {
  const [subjects, records, activities, goals] = await Promise.all([
    getSubjects(studentId),
    getAcademicRecords(studentId),
    getStudyActivities(studentId, 200),
    getAcademicGoals(studentId),
  ]);

  return {
    exported_at: new Date().toISOString(),
    student: null, // profile filled on client side
    subjects,
    records,
    study_activities: activities,
    goals,
  };
}
