// ==============================================================================
// LearnTrack Phase 13: Student Operating System TypeScript Types
// ==============================================================================

export type AssignmentType = 'Assignment' | 'Lab' | 'Project' | 'Presentation' | 'Exam' | 'Deadline';
export type AssignmentStatus = 'Not Started' | 'In Progress' | 'Submitted' | 'Completed' | 'Overdue';
export type AssignmentPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface AssignmentAttachment {
  name: string;
  url?: string;
  size?: string;
}

export interface AssignmentTask {
  id: string;
  assignment_id: string;
  user_id: string;
  title: string;
  completed: boolean;
  estimated_minutes: number;
  order_index: number;
  study_plan_task_id?: string;
  created_at: string;
}

export interface Assignment {
  id: string;
  user_id: string;
  subject_id?: string;
  subject_name: string;
  title: string;
  description: string;
  type: AssignmentType;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  due_date: string;
  estimated_minutes: number;
  actual_minutes: number;
  attachments?: AssignmentAttachment[];
  notes?: string;
  tasks?: AssignmentTask[];
  created_at: string;
  updated_at: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  subject_id?: string;
  subject_name: string;
  task_title: string;
  objective?: string;
  duration_minutes: number;
  target_duration_minutes: number;
  status: 'completed' | 'cancelled' | 'interrupted';
  reflection?: string;
  notes?: string;
  created_at: string;
}

export type LearningMemoryStatus = 'mastered' | 'needs_review' | 'recently_practiced' | 'recommended_next';

export interface LearningMemoryItem {
  id: string;
  user_id: string;
  subject: string;
  topic: string;
  status: LearningMemoryStatus;
  mastery_score: number;
  evidence_count: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Strong' | 'Expert';

export interface SkillEvidence {
  id: string;
  skill_id: string;
  user_id: string;
  source_type: 'practice_quiz' | 'project' | 'academic_record' | 'coding_exercise' | 'assessment';
  source_id?: string;
  description: string;
  score_impact: number;
  created_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  name: string;
  category: string;
  level: SkillLevel;
  score: number; // 0-100 calculated from evidence
  verified_evidence_count: number;
  recent_activity: string;
  weak_areas: string[];
  recommended_action: string;
  evidence?: SkillEvidence[];
  created_at: string;
  updated_at: string;
}

export interface CareerProfile {
  id: string;
  user_id: string;
  target_role: string;
  secondary_roles: string[];
  current_strengths: string[];
  development_areas: string[];
  resume_summary: string;
  raw_resume_text?: string;
  ats_match_score: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectItem {
  id: string;
  user_id: string;
  title: string;
  description: string;
  tech_stack: string[];
  github_url?: string;
  demo_url?: string;
  status: 'Idea' | 'In Progress' | 'Completed' | 'Archived';
  skills_used: string[];
  documentation?: string;
  ai_bullets?: string[];
  readme_outline?: string;
  created_at: string;
  updated_at: string;
}

export type InterviewMode = 'Technical' | 'AIML' | 'Python' | 'SQL' | 'Project' | 'HR';

export interface InterviewQuestion {
  id: string;
  session_id: string;
  user_id: string;
  question_index: number;
  question: string;
  user_answer?: string;
  feedback?: string;
  suggested_answer?: string;
  created_at: string;
}

export interface InterviewSession {
  id: string;
  user_id: string;
  mode: InterviewMode;
  target_role: string;
  status: 'active' | 'completed' | 'cancelled';
  overall_feedback?: string;
  technical_coverage?: string;
  topics_covered: string[];
  areas_to_revise: string[];
  questions?: InterviewQuestion[];
  created_at: string;
  updated_at: string;
}

export interface StudentAchievement {
  id: string;
  user_id: string;
  badge_key: string;
  title: string;
  description: string;
  icon: string;
  category: 'Study' | 'Practice' | 'Engineering' | 'Career' | 'Consistency';
  unlocked_at: string;
  progress: number;
  target: number;
  created_at?: string;
}

export interface TodayFocusAction {
  id: string;
  subject: string;
  task: string;
  estimatedMinutes: number;
  priority: 'urgent' | 'high' | 'medium';
  actionUrl?: string;
}

export interface UpNextTimelineItem {
  id: string;
  title: string;
  subject: string;
  type: string;
  dueDate: string;
  urgency: 'urgent' | 'upcoming' | 'normal';
}

export interface LearningSnapshotData {
  studyStreakDays: number;
  weeklyStudyHours: number;
  completedTasks: number;
  flashcardsDue: number;
  practiceAccuracy: number | null;
  currentGoalProgress: number | null;
}

export interface StudentAIRecommendation {
  subject: string;
  topic: string;
  recommendationText: string;
}

