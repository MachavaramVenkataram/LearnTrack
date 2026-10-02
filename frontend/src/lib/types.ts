export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  university: string;
  department: string;
  year: number;
  semester: number;
  rollNumber: string;
}

export interface SubjectRecord {
  id: string;
  subject: string;
  code: string;
  credits: number;
  score: number;
  grade: string;
  attendance: number;
  trend: "up" | "down" | "stable";
  internalMarks: number;
  assignmentMarks: number;
  examMarks?: number;
}

export interface KPIStats {
  overallPerformance: number;
  overallPerformanceDelta: number;
  currentCgpa: number;
  cgpaDelta: number;
  attendance: number;
  attendanceDelta: number;
  trendPercentage: number;
  trendDirection: "up" | "down" | "stable";
}

export interface AIInsight {
  id: string;
  type: "strength" | "improvement" | "attendance" | "action";
  title: string;
  description: string;
  importance: "low" | "medium" | "high" | "critical";
  subject?: string;
}

export interface PredictionContribution {
  key: string;
  name: string;
  value: number;
  impact: number;
  direction: "positive" | "negative";
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface PredictionResult {
  predicted_score: number;
  predicted_grade: string;
  confidence: number;
  risk_level: "Low Risk" | "Medium Risk" | "High Risk";
  model_version: string;
  champion_model: string;
  contributions: PredictionContribution[];
  feature_importances: FeatureImportance[];
  insights: AIInsight[];
  input_features?: Record<string, number>;
}

export interface SimulationDriver {
  factor: string;
  change: number;
  unit: string;
  from_val: number;
  to_val: number;
}

export interface SimulationResult {
  baseline: {
    score: number;
    grade: string;
    risk_level: string;
    confidence: number;
  };
  simulated: {
    score: number;
    grade: string;
    risk_level: string;
    confidence: number;
  };
  score_delta: number;
  drivers: SimulationDriver[];
  simulated_contributions: PredictionContribution[];
  advice: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "prediction" | "attendance" | "insight" | "system" | "risk";
  isRead: boolean;
  timestamp: string;
}

export interface TrendDataPoint {
  period: string;
  overallScore: number;
  attendance: number;
  studyHours: number;
  target: number;
}
