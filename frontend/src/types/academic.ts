export interface Student {
  id: string;
  profile_id: string;
  roll_number?: string;
  university?: string;
  department?: string;
  year?: number;
  semester?: number;
  section?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Subject {
  id: string;
  student_id: string;
  subject_name: string;
  subject_code?: string;
  credits: number;
  semester: number;
  created_at?: string;
  updated_at?: string;
}

export interface AcademicRecord {
  id: string;
  student_id: string;
  subject_id: string;
  academic_year?: string;
  semester: number;
  attendance_percentage: number;
  assignment_marks: number;
  internal_marks: number;
  exam_marks: number;
  total_marks: number;
  grade: string;
  grade_point: number;
  created_at?: string;
  updated_at?: string;
  subject?: Subject;
}

export interface StudyActivity {
  id: string;
  student_id: string;
  study_date: string;
  study_hours: number;
  assignments_completed: number;
  notes?: string;
  created_at?: string;
}

export interface AcademicSummary {
  cgpa: number | null;
  averageAttendance: number | null;
  totalStudyHours: number;
  averageDailyStudyHours: number;
  totalSubjects: number;
  totalRecords: number;
  averageMarks: number | null;
  gradeDistribution: Record<string, number>;
}

export interface PredictionFeatureInput {
  attendance_percentage: number;
  assignment_score: number;
  internal_marks: number;
  previous_score: number;
  study_hours: number;
  assignments_completed: number;
}

export interface ExplanationItem {
  feature: string;
  label: string;
  impact: number;
  raw_impact: number;
  direction: "positive" | "negative" | "neutral";
  description: string;
}

export interface PerformancePrediction {
  id: string;
  student_id: string;
  predicted_score: number;
  predicted_grade: string;
  risk_level: "Low" | "Medium" | "High";
  model_version: string;
  features?: PredictionFeatureInput;
  explanations?: ExplanationItem[];
  created_at: string;
}

export type InsightCategory = "strength" | "improvement" | "trend" | "recommendation";
export type InsightImportance = "high" | "medium" | "low";

export interface PerformanceInsight {
  id: string;
  student_id: string;
  prediction_id?: string | null;
  insight_type: InsightCategory;
  title: string;
  description: string;
  importance: InsightImportance;
  score: number;
  supporting_value?: number | null;
  supporting_label?: string | null;
  action_label?: string | null;
  action_route?: string | null;
  created_at: string;
}

export interface SimulationRecord {
  id: string;
  student_id: string;
  original_features: PredictionFeatureInput;
  simulated_features: PredictionFeatureInput;
  current_prediction: number;
  simulated_prediction: number;
  difference: number;
  model_version: string;
  created_at: string;
}

export interface SimulationRequest {
  baseline: PredictionFeatureInput;
  simulated: PredictionFeatureInput;
}

export interface SimulationResponse {
  current_prediction: number;
  simulated_prediction: number;
  difference: number;
  current_grade: string;
  simulated_grade: string;
  current_risk: string;
  simulated_risk: string;
  model_version: string;
  disclaimer: string;
}

export interface InsightGenerationRequest {
  academic_records: any[];
  attendance_percentage?: number | null;
  study_hours?: number | null;
  latest_prediction?: any;
  shap_explanations?: any[];
}

export interface InsightGenerationResponse {
  insights: {
    type: InsightCategory;
    title: string;
    description: string;
    importance: InsightImportance;
    score: number;
    supporting_value?: number | null;
    supporting_label?: string | null;
    action_label?: string | null;
    action_route?: string | null;
  }[];
  summary: Record<string, any>;
}

// ==============================================================================
// PHASE 6: AI ASSISTANT & STUDY PLAN TYPES
// ==============================================================================

export interface AIConversation {
  id: string;
  student_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export type StudyPlanStatus = "active" | "completed" | "archived";
export type SessionStatus = "upcoming" | "in_progress" | "completed" | "skipped" | "rescheduled";

export interface StudyPlan {
  id: string;
  student_id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: StudyPlanStatus;
  created_at: string;
  updated_at: string;
  sessions?: StudyPlanSession[];
}

export interface StudyPlanSession {
  id: string;
  study_plan_id: string;
  subject_id?: string | null;
  subject_name?: string;
  session_date: string;
  start_time: string;
  duration_minutes: number;
  topic: string;
  activity: string;
  status: SessionStatus;
  created_at: string;
  updated_at: string;
}

export interface StudentAIContext {
  studentName?: string;
  profile: {
    semester?: number;
    department?: string;
    university?: string;
    year?: number;
  };
  academic: {
    subjects: {
      id: string;
      name: string;
      code?: string;
      credits: number;
      score?: number | null;
      attendance?: number | null;
      grade?: string | null;
    }[];
    average_score: number | null;
    average_attendance: number | null;
    cgpa: number | null;
    total_records: number;
  };
  study: {
    total_hours: number;
    daily_average: number;
    assignments_completed: number;
    recent_sessions_count: number;
  };
  prediction: {
    predicted_score: number;
    predicted_grade: string;
    risk_level: "Low" | "Medium" | "High";
    model_version: string;
    key_factors: {
      label: string;
      impact: number;
      direction: "positive" | "negative" | "neutral";
      description: string;
    }[];
  } | null;
}

export type PlanDurationOption = "1_day" | "3_days" | "1_week" | "2_weeks" | "1_month";

export interface StudyPlanGenerationInput {
  duration: PlanDurationOption;
  daily_hours: number;
  preferred_time?: "morning" | "afternoon" | "evening" | "flexible";
  exam_date?: string;
  priority_subject_ids?: string[];
  difficulty_areas?: string;
  break_preference?: "pomodoro" | "standard" | "long_blocks";
}

export interface GeneratedDayPlan {
  date: string;
  day_label: string;
  sessions: {
    subject: string;
    subject_id?: string;
    start_time: string;
    duration_minutes: number;
    topic: string;
    activity: string;
  }[];
}

export interface GeneratedStudyPlanOutput {
  title: string;
  overview: string;
  total_days: number;
  total_sessions: number;
  total_study_minutes: number;
  days: GeneratedDayPlan[];
}

// ==============================================================================
// PHASE 7: ADVANCED ANALYTICS, GOALS & REPORTING TYPES
// ==============================================================================

export type GoalType =
  | "attendance"
  | "average_score"
  | "subject_score"
  | "study_hours"
  | "assignments";

export type GoalStatus = "active" | "completed" | "paused" | "expired";

export interface AcademicGoal {
  id: string;
  student_id: string;
  subject_id?: string | null;
  subject_name?: string;
  title: string;
  description?: string;
  goal_type: GoalType;
  target_value: number;
  current_value: number;
  unit: string;
  deadline?: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  subject?: Subject;
}

export interface AnalyticsFilterState {
  semester: number | "all";
  academicYear: string | "all";
  subjectId: string | "all";
}

export interface PersonalBest {
  metric: string;
  value: string | number;
  context: string;
  date?: string;
}

export interface CorrelationPair {
  variableA: string;
  variableB: string;
  coefficient: number;
  strength: "strong" | "moderate" | "weak";
  direction: "positive" | "negative";
  sampleSize: number;
}



