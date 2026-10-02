import {
  StudentProfile,
  SubjectRecord,
  KPIStats,
  AIInsight,
  NotificationItem,
  TrendDataPoint,
  PredictionResult,
} from "./types";

export const DEFAULT_STUDENT: StudentProfile = {
  id: "std-001",
  fullName: "Alex Mitchell",
  email: "alex.mitchell@university.edu",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  university: "Institute of Technology & Science",
  department: "Computer Science & Engineering",
  year: 3,
  semester: 6,
  rollNumber: "LT-2024-CS089",
};

export const DEFAULT_KPIS: KPIStats = {
  overallPerformance: 82.4,
  overallPerformanceDelta: 8.4,
  currentCgpa: 7.92,
  cgpaDelta: 0.38,
  attendance: 86.0,
  attendanceDelta: 3.2,
  trendPercentage: 8.4,
  trendDirection: "up",
};

export const DEFAULT_SUBJECTS: SubjectRecord[] = [
  {
    id: "sub-1",
    subject: "Machine Learning & AI",
    code: "CS601",
    credits: 4,
    score: 89,
    grade: "A+",
    attendance: 88,
    trend: "up",
    internalMarks: 28.5,
    assignmentMarks: 19.5,
    examMarks: 41.0,
  },
  {
    id: "sub-2",
    subject: "Mathematics & Optimization",
    code: "MA605",
    credits: 4,
    score: 86,
    grade: "A",
    attendance: 91,
    trend: "up",
    internalMarks: 26.0,
    assignmentMarks: 18.0,
    examMarks: 42.0,
  },
  {
    id: "sub-3",
    subject: "Database Management Systems",
    code: "CS602",
    credits: 4,
    score: 78,
    grade: "B+",
    attendance: 82,
    trend: "stable",
    internalMarks: 24.0,
    assignmentMarks: 17.0,
    examMarks: 37.0,
  },
  {
    id: "sub-4",
    subject: "Software Engineering & Architecture",
    code: "CS603",
    credits: 3,
    score: 84,
    grade: "A",
    attendance: 90,
    trend: "up",
    internalMarks: 25.5,
    assignmentMarks: 18.5,
    examMarks: 40.0,
  },
  {
    id: "sub-5",
    subject: "Cloud Computing & DevOps",
    code: "CS604",
    credits: 3,
    score: 81,
    grade: "A-",
    attendance: 85,
    trend: "up",
    internalMarks: 25.0,
    assignmentMarks: 17.5,
    examMarks: 38.5,
  },
];

export const DEFAULT_INSIGHTS: AIInsight[] = [
  {
    id: "ins-1",
    type: "strength",
    title: "Strong Performance in Machine Learning",
    description: "Your Machine Learning quiz and assignment scores are in the 92nd percentile, elevating your overall semester projected GPA.",
    importance: "high",
    subject: "Machine Learning & AI",
  },
  {
    id: "ins-2",
    type: "improvement",
    title: "Database Systems Exam Buffer",
    description: "Your DBMS mid-term average (78.0%) leaves little margin before finals. Increasing focused revision by 2 hrs/week can protect your grade.",
    importance: "high",
    subject: "Database Management Systems",
  },
  {
    id: "ins-3",
    type: "attendance",
    title: "Significant Attendance Correlation",
    description: "Attendance appears to have a strong statistical relationship with your predicted performance, contributing +2.0% direct positive lift.",
    importance: "medium",
  },
  {
    id: "ins-4",
    type: "action",
    title: "Targeted Assignment Completion",
    description: "Improving assignment completion from 85% to 95% across all courses is projected to positively affect your overall score by +2.8%.",
    importance: "high",
  },
];

export const TREND_DATA_1M: TrendDataPoint[] = [
  { period: "Week 1", overallScore: 78.2, attendance: 82, studyHours: 12, target: 80 },
  { period: "Week 2", overallScore: 79.5, attendance: 84, studyHours: 14, target: 80 },
  { period: "Week 3", overallScore: 81.0, attendance: 85, studyHours: 15, target: 80 },
  { period: "Week 4", overallScore: 82.4, attendance: 86, studyHours: 16, target: 80 },
];

export const TREND_DATA_3M: TrendDataPoint[] = [
  { period: "Jan", overallScore: 76.5, attendance: 80, studyHours: 11, target: 80 },
  { period: "Feb", overallScore: 78.8, attendance: 83, studyHours: 13, target: 80 },
  { period: "Mar", overallScore: 82.4, attendance: 86, studyHours: 16, target: 80 },
];

export const TREND_DATA_6M: TrendDataPoint[] = [
  { period: "Nov", overallScore: 74.0, attendance: 78, studyHours: 10, target: 80 },
  { period: "Dec", overallScore: 75.2, attendance: 80, studyHours: 11, target: 80 },
  { period: "Jan", overallScore: 76.8, attendance: 82, studyHours: 12, target: 80 },
  { period: "Feb", overallScore: 79.4, attendance: 84, studyHours: 14, target: 80 },
  { period: "Mar", overallScore: 81.2, attendance: 85, studyHours: 15, target: 80 },
  { period: "Apr (Proj)", overallScore: 82.4, attendance: 86, studyHours: 16, target: 80 },
];

export const TREND_DATA_1Y: TrendDataPoint[] = [
  { period: "Sem 3", overallScore: 72.1, attendance: 77, studyHours: 9, target: 75 },
  { period: "Sem 4", overallScore: 75.4, attendance: 81, studyHours: 12, target: 75 },
  { period: "Sem 5", overallScore: 79.2, attendance: 84, studyHours: 14, target: 80 },
  { period: "Sem 6", overallScore: 82.4, attendance: 86, studyHours: 16, target: 80 },
];

export const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Prediction Model Updated",
    message: "Your performance prediction was updated to 82.4% following recent midterm results.",
    type: "prediction",
    isRead: false,
    timestamp: "12 minutes ago",
  },
  {
    id: "notif-2",
    title: "New AI Insight Available",
    message: "AI detected an opportunity to raise your DBMS final exam buffer by +3.4 points.",
    type: "insight",
    isRead: false,
    timestamp: "2 hours ago",
  },
  {
    id: "notif-3",
    title: "Attendance Milestone",
    message: "Class attendance in Mathematics reached 91%, crossing the university honors benchmark.",
    type: "attendance",
    isRead: true,
    timestamp: "Yesterday",
  },
  {
    id: "notif-4",
    title: "Simulation Saved",
    message: "Your what-if scenario (+3 study hrs, +5% attendance) was saved to your profile.",
    type: "system",
    isRead: true,
    timestamp: "3 days ago",
  },
];

export const DEFAULT_PREDICTION_RESULT: PredictionResult = {
  predicted_score: 82.4,
  predicted_grade: "A",
  confidence: 94.2,
  risk_level: "Low Risk",
  model_version: "v1.4-production",
  champion_model: "XGBoost",
  contributions: [
    { key: "previous_cgpa", name: "Previous Cumulative GPA", value: 7.92, impact: 4.8, direction: "positive" },
    { key: "internal_marks", name: "Internal Assessments", value: 83.5, impact: 4.2, direction: "positive" },
    { key: "attendance", name: "Class Attendance", value: 86.0, impact: 2.1, direction: "positive" },
    { key: "assignment_completion_rate", name: "Assignment Completion", value: 88.0, impact: 1.4, direction: "positive" },
    { key: "study_hours_per_week", name: "Weekly Study Hours", value: 16.0, impact: 0.9, direction: "positive" },
    { key: "backlogs_count", name: "Active Backlogs", value: 0, impact: 1.2, direction: "positive" },
  ],
  feature_importances: [
    { feature: "previous_cgpa", importance: 0.5087 },
    { feature: "internal_marks", importance: 0.3112 },
    { feature: "attendance", importance: 0.0566 },
    { feature: "study_hours_per_week", importance: 0.0479 },
    { feature: "backlogs_count", importance: 0.0477 },
    { feature: "assignment_completion_rate", importance: 0.0127 },
  ],
  insights: DEFAULT_INSIGHTS,
};
