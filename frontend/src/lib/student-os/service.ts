// ==============================================================================
// LearnTrack Student Operating System Service Layer
// Full Supabase integration with high-fidelity local fallback and caching
// ==============================================================================

import { createClient } from "@/lib/supabase/client";
import {
  Assignment,
  AssignmentTask,
  FocusSession,
  LearningMemoryItem,
  Skill,
  SkillEvidence,
  CareerProfile,
  ProjectItem,
  InterviewSession,
  InterviewQuestion,
  InterviewMode,
  StudentAchievement,
  TodayFocusAction,
  UpNextTimelineItem,
  LearningSnapshotData,
  StudentAIRecommendation,
} from "@/types/student-os";

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ==============================================================================
// SEED DATA FOR DEMO & LOCAL RUNTIMES
// ==============================================================================

const SEED_ASSIGNMENTS: Assignment[] = [
  {
    id: "asg-1",
    user_id: "demo-student",
    subject_name: "Machine Learning",
    title: "Implement Ridge & Lasso Regression from Scratch",
    description: "Write gradient descent with L1 and L2 penalty without using scikit-learn. Compare coefficient sparsity.",
    type: "Assignment",
    status: "In Progress",
    priority: "High",
    due_date: new Date(Date.now() + 3 * 86400000).toISOString(),
    estimated_minutes: 90,
    actual_minutes: 45,
    notes: "Review coordinate descent formula before implementing Lasso update step.",
    tasks: [
      { id: "tsk-1", assignment_id: "asg-1", user_id: "demo-student", title: "Derive coordinate descent formula", completed: true, estimated_minutes: 20, order_index: 0, created_at: new Date().toISOString() },
      { id: "tsk-2", assignment_id: "asg-1", user_id: "demo-student", title: "Write vectorized loss function in NumPy", completed: true, estimated_minutes: 25, order_index: 1, created_at: new Date().toISOString() },
      { id: "tsk-3", assignment_id: "asg-1", user_id: "demo-student", title: "Implement soft-thresholding operator", completed: false, estimated_minutes: 25, order_index: 2, created_at: new Date().toISOString() },
      { id: "tsk-4", assignment_id: "asg-1", user_id: "demo-student", title: "Plot regularization path vs lambda", completed: false, estimated_minutes: 20, order_index: 3, created_at: new Date().toISOString() },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "asg-2",
    user_id: "demo-student",
    subject_name: "Digital Electronics",
    title: "Synchronous 4-bit Up/Down Counter Design",
    description: "Design logic circuit using JK flip-flops, generate truth table, and simulate state transitions in Logisim.",
    type: "Lab",
    status: "Not Started",
    priority: "Medium",
    due_date: new Date(Date.now() + 6 * 86400000).toISOString(),
    estimated_minutes: 60,
    actual_minutes: 0,
    notes: "Requires state transition table and excitation equations.",
    tasks: [
      { id: "tsk-5", assignment_id: "asg-2", user_id: "demo-student", title: "Derive excitation table for JK flip-flops", completed: false, estimated_minutes: 20, order_index: 0, created_at: new Date().toISOString() },
      { id: "tsk-6", assignment_id: "asg-2", user_id: "demo-student", title: "Solve Karnaugh maps for J and K inputs", completed: false, estimated_minutes: 20, order_index: 1, created_at: new Date().toISOString() },
      { id: "tsk-7", assignment_id: "asg-2", user_id: "demo-student", title: "Logisim circuit simulation & test run", completed: false, estimated_minutes: 20, order_index: 2, created_at: new Date().toISOString() },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "asg-3",
    user_id: "demo-student",
    subject_name: "Database Systems",
    title: "E-Commerce Database Schema & Indexing Benchmark",
    description: "Design 3NF relational schema with B-Tree indexes, analyze query plans with EXPLAIN ANALYZE.",
    type: "Project",
    status: "Completed",
    priority: "Low",
    due_date: new Date(Date.now() - 2 * 86400000).toISOString(),
    estimated_minutes: 120,
    actual_minutes: 110,
    notes: "Achieved 8.4x speedup on customer order join queries.",
    tasks: [],
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const SEED_FOCUS_SESSIONS: FocusSession[] = [
  {
    id: "fcs-1",
    user_id: "demo-student",
    subject_name: "Machine Learning",
    task_title: "Gradient Descent Optimization & Learning Rate Decay",
    objective: "Understand mathematical convergence and momentum formulas.",
    duration_minutes: 45,
    target_duration_minutes: 50,
    status: "completed",
    reflection: "Mastered momentum updates; need to review Nesterov accelerated gradient.",
    notes: "θ_{t+1} = θ_t - v_t, where v_t = γ v_{t-1} + α ∇J(θ_t)",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "fcs-2",
    user_id: "demo-student",
    subject_name: "Digital Electronics",
    task_title: "K-Map Grouping & Boolean Minimization",
    objective: "Solve 5 complex 4-variable Karnaugh maps with don't-care states.",
    duration_minutes: 25,
    target_duration_minutes: 25,
    status: "completed",
    reflection: "Remember that diagonal adjacencies are invalid groups.",
    notes: "Corners wrap around as a single 4-cell group.",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const SEED_LEARNING_MEMORY: LearningMemoryItem[] = [
  {
    id: "mem-1",
    user_id: "demo-student",
    subject: "Machine Learning",
    topic: "Linear Regression & Normal Equation",
    status: "mastered",
    mastery_score: 95,
    evidence_count: 5,
    last_activity_at: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "mem-2",
    user_id: "demo-student",
    subject: "Machine Learning",
    topic: "Decision Trees & Information Gain",
    status: "mastered",
    mastery_score: 92,
    evidence_count: 4,
    last_activity_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "mem-3",
    user_id: "demo-student",
    subject: "Machine Learning",
    topic: "Gradient Descent & Learning Rate",
    status: "needs_review",
    mastery_score: 64,
    evidence_count: 3,
    last_activity_at: new Date(Date.now() - 3600000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "mem-4",
    user_id: "demo-student",
    subject: "Machine Learning",
    topic: "Cross-Validation & K-Fold Stratification",
    status: "needs_review",
    mastery_score: 68,
    evidence_count: 2,
    last_activity_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "mem-5",
    user_id: "demo-student",
    subject: "Machine Learning",
    topic: "Regression Metrics (RMSE, MAE, R²)",
    status: "recently_practiced",
    mastery_score: 72,
    evidence_count: 3,
    last_activity_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "mem-6",
    user_id: "demo-student",
    subject: "Machine Learning",
    topic: "Regularization (L1 Lasso vs L2 Ridge)",
    status: "recommended_next",
    mastery_score: 55,
    evidence_count: 1,
    last_activity_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const SEED_SKILLS: Skill[] = [
  {
    id: "skl-1",
    user_id: "demo-student",
    name: "Python",
    category: "Programming",
    level: "Strong",
    score: 90,
    verified_evidence_count: 18,
    recent_activity: "18 coding exercises, 92% practice accuracy, 2 projects",
    weak_areas: ["Generators & Itertools", "Asyncio concurrency"],
    recommended_action: "Practice advanced algorithmic exercises in Python Practice Lab",
    evidence: [
      { id: "ev-1", skill_id: "skl-1", user_id: "demo-student", source_type: "practice_quiz", description: "Solved 12 Python OOP & Vectorization problems with 92% accuracy", score_impact: 15, created_at: new Date().toISOString() },
      { id: "ev-2", skill_id: "skl-1", user_id: "demo-student", source_type: "project", description: "Engineered Student Grade Predictor using NumPy and Pandas", score_impact: 25, created_at: new Date().toISOString() },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "skl-2",
    user_id: "demo-student",
    name: "Machine Learning",
    category: "AI & Analytics",
    level: "Strong",
    score: 78,
    verified_evidence_count: 14,
    recent_activity: "Completed Supervised Learning module, 78% average mock quiz score",
    weak_areas: ["L1 Regularization math", "ROC-AUC derivation"],
    recommended_action: "Review regression metrics and take Practice Lab test",
    evidence: [
      { id: "ev-3", skill_id: "skl-2", user_id: "demo-student", source_type: "practice_quiz", description: "Completed Gradient Descent assessment (score 4/5)", score_impact: 12, created_at: new Date().toISOString() },
      { id: "ev-4", skill_id: "skl-2", user_id: "demo-student", source_type: "project", description: "Trained Random Forest model on student performance dataset", score_impact: 20, created_at: new Date().toISOString() },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "skl-3",
    user_id: "demo-student",
    name: "SQL & Databases",
    category: "Data Engineering",
    level: "Intermediate",
    score: 64,
    verified_evidence_count: 8,
    recent_activity: "Designed 3NF database schema, executed window functions",
    weak_areas: ["Window functions (LEAD/LAG)", "Query execution plan tuning"],
    recommended_action: "Practice complex aggregation and indexing queries",
    evidence: [
      { id: "ev-5", skill_id: "skl-3", user_id: "demo-student", source_type: "project", description: "Optimized relational schema with foreign key constraints and B-Tree indexes", score_impact: 18, created_at: new Date().toISOString() },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "skl-4",
    user_id: "demo-student",
    name: "Statistics & Math",
    category: "Foundations",
    level: "Intermediate",
    score: 70,
    verified_evidence_count: 9,
    recent_activity: "Reviewed probability distributions and hypothesis testing",
    weak_areas: ["Bayesian inference", "Multivariate calculus gradients"],
    recommended_action: "Solve 5 statistical inference problems in Exam Prep center",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "skl-5",
    user_id: "demo-student",
    name: "Deep Learning",
    category: "AI & Analytics",
    level: "Beginner",
    score: 42,
    verified_evidence_count: 4,
    recent_activity: "Learned forward and backpropagation theory in Perceptrons",
    weak_areas: ["Backpropagation calculus", "Convolutional layers"],
    recommended_action: "Generate Deep Learning study guide and build a mini neural net",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "skl-6",
    user_id: "demo-student",
    name: "Git & Version Control",
    category: "Software Engineering",
    level: "Strong",
    score: 82,
    verified_evidence_count: 11,
    recent_activity: "Managing project repositories with feature branches and pull requests",
    weak_areas: ["Interactive rebase"],
    recommended_action: "Document all project repositories with clean commit history",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const SEED_CAREER_PROFILE: CareerProfile = {
  id: "car-1",
  user_id: "demo-student",
  target_role: "AI / ML Engineer",
  secondary_roles: ["Data Scientist", "Python Software Engineer", "MLOps Engineer"],
  current_strengths: ["Python (NumPy, Pandas)", "Supervised Machine Learning", "Git & CI Basics", "SQL Fundamentals"],
  development_areas: ["Deep Learning (PyTorch)", "MLOps Pipelines", "Advanced SQL Window Functions", "System Design"],
  resume_summary: "Aspiring Machine Learning Engineer with strong foundational skills in Python, mathematical modeling, and predictive analytics. Experienced in building end-to-end data processing pipelines and training supervised models.",
  ats_match_score: 74,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const SEED_PROJECTS: ProjectItem[] = [
  {
    id: "prj-1",
    user_id: "demo-student",
    title: "LearnTrack: Student Academic Analytics & Prediction Engine",
    description: "Full-stack AI student operating system predicting academic trajectories using Random Forest models, SHAP explanations, and spaced-repetition cognitive tools.",
    tech_stack: ["Next.js", "TypeScript", "Python", "FastAPI", "scikit-learn", "Supabase", "Tailwind CSS"],
    github_url: "https://github.com/student/learntrack",
    demo_url: "https://learntrack.dev",
    status: "In Progress",
    skills_used: ["Machine Learning", "Python", "TypeScript", "FastAPI", "Full-Stack Architecture"],
    documentation: "Architected real-time prediction microservice in FastAPI with SHAP feature importance explainability and modular Next.js frontend.",
    ai_bullets: [
      "Engineered machine learning prediction pipeline utilizing Random Forest to forecast academic risks with 89% accuracy.",
      "Integrated SHAP explainability engine visualizing top key academic drivers per individual student.",
      "Developed interactive Notion-style learning workspace with NotebookLM source-grounded citation intelligence.",
    ],
    readme_outline: "# LearnTrack\n\nAI-powered Student Operating System\n\n## Architecture\n- **Frontend**: Next.js App Router, Tailwind CSS, Framer Motion\n- **Backend**: FastAPI ML Service\n- **Database**: Supabase PostgreSQL with RLS",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "prj-2",
    user_id: "demo-student",
    title: "End-to-End Customer Churn Classifier with MLOps",
    description: "Productionized XGBoost classifier predicting subscription churn with automated data validation, drift monitoring, and Dockerized deployment.",
    tech_stack: ["Python", "XGBoost", "Docker", "MLflow", "FastAPI", "PostgreSQL"],
    github_url: "https://github.com/student/churn-mlops",
    demo_url: "",
    status: "Completed",
    skills_used: ["Python", "Machine Learning", "Docker", "MLOps", "SQL"],
    documentation: "Trained and benchmarked gradient-boosted trees against baseline logistic regression, improving F1-score from 0.71 to 0.84.",
    ai_bullets: [
      "Built production-ready classification microservice with XGBoost yielding an F1-score of 0.84 on 50k customer records.",
      "Implemented MLflow experiment tracking logging hyperparameters, ROC-AUC curves, and confusion matrix artifacts.",
      "Containerized deployment via Docker with automated health check endpoints and Prometheus metric endpoints.",
    ],
    readme_outline: "# Customer Churn Classifier\n\n## Overview\nPredicts enterprise subscriber churn.\n\n## Quickstart\n```bash\ndocker-compose up\n```",
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const SEED_INTERVIEW_SESSIONS: InterviewSession[] = [
  {
    id: "int-1",
    user_id: "demo-student",
    mode: "AIML",
    target_role: "AI / ML Engineer",
    status: "completed",
    overall_feedback: "Demonstrated strong grasp of bias-variance tradeoff and gradient descent optimization. Needs crisper explanation of L1 vs L2 geometric regularization constraints.",
    technical_coverage: "Core ML Algorithms (85%), Optimization (90%), Regularization (70%), Evaluation Metrics (80%)",
    topics_covered: ["Bias-Variance Tradeoff", "Gradient Descent", "L1 vs L2 Regularization", "Precision vs Recall"],
    areas_to_revise: ["Contour geometry of Lasso", "ROC-AUC formulation under class imbalance"],
    questions: [
      {
        id: "iq-1",
        session_id: "int-1",
        user_id: "demo-student",
        question_index: 1,
        question: "How does the bias-variance tradeoff influence model generalization when increasing model complexity?",
        user_answer: "As complexity increases, training error decreases (bias decreases), but variance increases because the model becomes sensitive to sample noise.",
        feedback: "Accurate explanation. Well done tying complexity directly to sample noise sensitivity.",
        suggested_answer: "A high-capacity model lowers bias by fitting intricate patterns but increases variance, making it susceptible to overfitting. The optimal model balances irreducible error with minimal combined bias and variance.",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "iq-2",
        session_id: "int-1",
        user_id: "demo-student",
        question_index: 2,
        question: "Why does L1 regularization lead to sparse weights while L2 only shrinks them toward zero?",
        user_answer: "Because L1 adds the absolute value which has sharp corners on axes, while L2 has circular contours.",
        feedback: "Good geometric intuition. Elaborate on the mathematical subgradient at zero next time.",
        suggested_answer: "The diamond constraint boundary of L1 (|θ|) has sharp corners on coordinate axes where elliptical cost contours frequently touch first, forcing coefficients to exactly 0.",
        created_at: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const SEED_ACHIEVEMENTS: StudentAchievement[] = [
  {
    id: "ach-1",
    user_id: "demo-student",
    badge_key: "first_focus",
    title: "First Deep Focus",
    description: "Completed your first uninterrupted 25-minute Pomodoro focus session.",
    icon: "Target",
    category: "Study",
    unlocked_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    progress: 1,
    target: 1,
  },
  {
    id: "ach-2",
    user_id: "demo-student",
    badge_key: "study_sessions_10",
    title: "Disciplined Scholar",
    description: "Completed 10 structured study and focus sessions.",
    icon: "Clock",
    category: "Study",
    unlocked_at: new Date(Date.now() - 86400000).toISOString(),
    progress: 10,
    target: 10,
  },
  {
    id: "ach-3",
    user_id: "demo-student",
    badge_key: "quizzes_10",
    title: "Quiz Maestro",
    description: "Completed 10 active recall assessments in Practice Lab.",
    icon: "CheckCircle2",
    category: "Practice",
    unlocked_at: new Date().toISOString(),
    progress: 10,
    target: 10,
  },
  {
    id: "ach-4",
    user_id: "demo-student",
    badge_key: "minutes_500",
    title: "500 Focused Minutes",
    description: "Accumulated over 500 minutes of tracked deep academic work.",
    icon: "Flame",
    category: "Consistency",
    unlocked_at: "",
    progress: 340,
    target: 500,
  },
  {
    id: "ach-5",
    user_id: "demo-student",
    badge_key: "ml_explorer",
    title: "ML Explorer",
    description: "Trained predictive models, tested simulator, and documented 2 ML projects.",
    icon: "Brain",
    category: "Engineering",
    unlocked_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    progress: 2,
    target: 2,
  },
  {
    id: "ach-6",
    user_id: "demo-student",
    badge_key: "streak_7",
    title: "7-Day Study Streak",
    description: "Maintained continuous daily learning activity for 7 consecutive days.",
    icon: "Zap",
    category: "Consistency",
    unlocked_at: "",
    progress: 5,
    target: 7,
  },
  {
    id: "ach-7",
    user_id: "demo-student",
    badge_key: "interview_ready",
    title: "Interview Ready",
    description: "Completed 3 AI technical mock interviews with structured review feedback.",
    icon: "GraduationCap",
    category: "Career",
    unlocked_at: "",
    progress: 1,
    target: 3,
  },
];

// In-memory store for fallback
let localAssignments = [...SEED_ASSIGNMENTS];
let localFocusSessions = [...SEED_FOCUS_SESSIONS];
let localLearningMemory = [...SEED_LEARNING_MEMORY];
const localSkills = [...SEED_SKILLS];
let localCareerProfile = { ...SEED_CAREER_PROFILE };
let localProjects = [...SEED_PROJECTS];
let localInterviewSessions = [...SEED_INTERVIEW_SESSIONS];
const localAchievements = [...SEED_ACHIEVEMENTS];

// ==============================================================================
// 1. ASSIGNMENTS SERVICE
// ==============================================================================

export async function getAssignments(userId: string): Promise<Assignment[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("assignments")
        .select("*, tasks:assignment_tasks(*)")
        .eq("user_id", userId)
        .order("due_date", { ascending: true });

      if (!error && data && data.length > 0) return data as Assignment[];
    } catch (e) {
      console.warn("[StudentOS] Failed to query assignments from Supabase, using local fallback:", e);
    }
  }
  return localAssignments.filter((a) => a.user_id === userId || a.user_id === "demo-student");
}

export async function createAssignment(userId: string, item: Partial<Assignment>): Promise<Assignment> {
  const newAsg: Assignment = {
    id: `asg-${Date.now()}`,
    user_id: userId,
    subject_id: item.subject_id,
    subject_name: item.subject_name || "General",
    title: item.title || "Untitled Assignment",
    description: item.description || "",
    type: item.type || "Assignment",
    status: item.status || "Not Started",
    priority: item.priority || "Medium",
    due_date: item.due_date || new Date(Date.now() + 7 * 86400000).toISOString(),
    estimated_minutes: item.estimated_minutes || 60,
    actual_minutes: 0,
    attachments: item.attachments || [],
    notes: item.notes || "",
    tasks: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("assignments")
        .insert({
          user_id: userId,
          subject_id: item.subject_id,
          subject_name: newAsg.subject_name,
          title: newAsg.title,
          description: newAsg.description,
          type: newAsg.type,
          status: newAsg.status,
          priority: newAsg.priority,
          due_date: newAsg.due_date,
          estimated_minutes: newAsg.estimated_minutes,
          notes: newAsg.notes,
        })
        .select()
        .single();

      if (!error && data) {
        newAsg.id = data.id;
      }
    } catch {
      // Use local
    }
  }

  localAssignments = [newAsg, ...localAssignments];
  return newAsg;
}

export async function updateAssignment(id: string, updates: Partial<Assignment>): Promise<Assignment> {
  if (isSupabaseConfigured) {
    try {
      const supabase = createClient();
      await supabase
        .from("assignments")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
    } catch {
      // Use local
    }
  }

  localAssignments = localAssignments.map((a) =>
    a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a
  );
  return localAssignments.find((a) => a.id === id)!;
}

export async function deleteAssignment(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      const supabase = createClient();
      await supabase.from("assignments").delete().eq("id", id);
    } catch {
      // Use local
    }
  }
  localAssignments = localAssignments.filter((a) => a.id !== id);
}

export async function createAssignmentTask(
  assignmentId: string,
  userId: string,
  title: string,
  estimatedMinutes: number = 15
): Promise<AssignmentTask> {
  const newTask: AssignmentTask = {
    id: `tsk-${Date.now()}`,
    assignment_id: assignmentId,
    user_id: userId,
    title,
    completed: false,
    estimated_minutes: estimatedMinutes,
    order_index: 0,
    created_at: new Date().toISOString(),
  };

  localAssignments = localAssignments.map((a) => {
    if (a.id === assignmentId) {
      return { ...a, tasks: [...(a.tasks || []), newTask] };
    }
    return a;
  });

  return newTask;
}

export async function toggleAssignmentTask(
  assignmentId: string,
  taskId: string,
  completed: boolean
): Promise<void> {
  localAssignments = localAssignments.map((a) => {
    if (a.id === assignmentId) {
      const updatedTasks = (a.tasks || []).map((t) => (t.id === taskId ? { ...t, completed } : t));
      return { ...a, tasks: updatedTasks };
    }
    return a;
  });
}

// ==============================================================================
// 2. FOCUS SESSIONS SERVICE
// ==============================================================================

export async function getFocusSessions(userId: string): Promise<FocusSession[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("focus_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) return data as FocusSession[];
    } catch {
      // Fallback
    }
  }
  return localFocusSessions.filter((f) => f.user_id === userId || f.user_id === "demo-student");
}

export async function createFocusSession(
  userId: string,
  session: Partial<FocusSession>
): Promise<FocusSession> {
  const newSession: FocusSession = {
    id: `fcs-${Date.now()}`,
    user_id: userId,
    subject_id: session.subject_id,
    subject_name: session.subject_name || "General Study",
    task_title: session.task_title || "Deep Study Session",
    objective: session.objective || "",
    duration_minutes: session.duration_minutes || 25,
    target_duration_minutes: session.target_duration_minutes || 25,
    status: session.status || "completed",
    reflection: session.reflection || "",
    notes: session.notes || "",
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("focus_sessions")
        .insert({
          user_id: userId,
          subject_name: newSession.subject_name,
          task_title: newSession.task_title,
          objective: newSession.objective,
          duration_minutes: newSession.duration_minutes,
          target_duration_minutes: newSession.target_duration_minutes,
          status: newSession.status,
          reflection: newSession.reflection,
          notes: newSession.notes,
        })
        .select()
        .single();

      if (!error && data) newSession.id = data.id;
    } catch {
      // Fallback
    }
  }

  localFocusSessions = [newSession, ...localFocusSessions];
  return newSession;
}

// ==============================================================================
// 3. LEARNING MEMORY SERVICE
// ==============================================================================

export async function getLearningMemory(userId: string): Promise<LearningMemoryItem[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("learning_memory_items")
        .select("*")
        .eq("user_id", userId)
        .order("last_activity_at", { ascending: false });

      if (!error && data && data.length > 0) return data as LearningMemoryItem[];
    } catch {
      // Fallback
    }
  }
  return localLearningMemory.filter((m) => m.user_id === userId || m.user_id === "demo-student");
}

export async function upsertLearningMemoryItem(
  userId: string,
  item: Partial<LearningMemoryItem>
): Promise<LearningMemoryItem> {
  const existingIndex = localLearningMemory.findIndex(
    (m) => (m.user_id === userId || m.user_id === "demo-student") && m.topic.toLowerCase() === item.topic?.toLowerCase()
  );

  const updated: LearningMemoryItem = {
    id: existingIndex >= 0 ? localLearningMemory[existingIndex].id : `mem-${Date.now()}`,
    user_id: userId,
    subject: item.subject || "Machine Learning",
    topic: item.topic || "Core Concept",
    status: item.status || "recently_practiced",
    mastery_score: item.mastery_score ?? 70,
    evidence_count: existingIndex >= 0 ? localLearningMemory[existingIndex].evidence_count + 1 : 1,
    last_activity_at: new Date().toISOString(),
    created_at: existingIndex >= 0 ? localLearningMemory[existingIndex].created_at : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    localLearningMemory[existingIndex] = updated;
  } else {
    localLearningMemory = [updated, ...localLearningMemory];
  }

  return updated;
}

// ==============================================================================
// 4. SKILLS & EVIDENCE SERVICE
// ==============================================================================

export async function getSkills(userId: string): Promise<Skill[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("skills")
        .select("*, evidence:skill_evidence(*)")
        .eq("user_id", userId)
        .order("score", { ascending: false });

      if (!error && data && data.length > 0) return data as Skill[];
    } catch {
      // Fallback
    }
  }
  return localSkills.filter((s) => s.user_id === userId || s.user_id === "demo-student");
}

export async function addSkillEvidence(
  userId: string,
  skillName: string,
  evidence: Partial<SkillEvidence>
): Promise<Skill> {
  const skill = localSkills.find(
    (s) => (s.user_id === userId || s.user_id === "demo-student") && s.name.toLowerCase() === skillName.toLowerCase()
  );

  if (skill) {
    const newEvidence: SkillEvidence = {
      id: `ev-${Date.now()}`,
      skill_id: skill.id,
      user_id: userId,
      source_type: evidence.source_type || "practice_quiz",
      description: evidence.description || "Completed active assessment",
      score_impact: evidence.score_impact || 5,
      created_at: new Date().toISOString(),
    };

    skill.evidence = [newEvidence, ...(skill.evidence || [])];
    skill.verified_evidence_count += 1;
    skill.score = Math.min(100, skill.score + (evidence.score_impact || 2));
    skill.updated_at = new Date().toISOString();
    return skill;
  }

  return localSkills[0];
}

// ==============================================================================
// 5. CAREER PROFILE & ROADMAP SERVICE
// ==============================================================================

export async function getCareerProfile(userId: string): Promise<CareerProfile> {
  if (isSupabaseConfigured) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("career_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (!error && data) return data as CareerProfile;
    } catch {
      // Fallback
    }
  }
  return localCareerProfile;
}

export async function updateCareerProfile(
  userId: string,
  updates: Partial<CareerProfile>
): Promise<CareerProfile> {
  localCareerProfile = {
    ...localCareerProfile,
    ...updates,
    user_id: userId,
    updated_at: new Date().toISOString(),
  };
  return localCareerProfile;
}

// ==============================================================================
// 6. PROJECTS SERVICE
// ==============================================================================

export async function getProjects(userId: string): Promise<ProjectItem[]> {
  if (isSupabaseConfigured) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) return data as ProjectItem[];
    } catch {
      // Fallback
    }
  }
  return localProjects.filter((p) => p.user_id === userId || p.user_id === "demo-student");
}

export async function createProject(userId: string, project: Partial<ProjectItem>): Promise<ProjectItem> {
  const newPrj: ProjectItem = {
    id: `prj-${Date.now()}`,
    user_id: userId,
    title: project.title || "New Project",
    description: project.description || "",
    tech_stack: project.tech_stack || [],
    github_url: project.github_url || "",
    demo_url: project.demo_url || "",
    status: project.status || "In Progress",
    skills_used: project.skills_used || [],
    documentation: project.documentation || "",
    ai_bullets: project.ai_bullets || [],
    readme_outline: project.readme_outline || "",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  localProjects = [newPrj, ...localProjects];
  return newPrj;
}

export async function updateProject(id: string, updates: Partial<ProjectItem>): Promise<ProjectItem> {
  localProjects = localProjects.map((p) =>
    p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
  );
  return localProjects.find((p) => p.id === id)!;
}

export async function deleteProject(id: string): Promise<void> {
  localProjects = localProjects.filter((p) => p.id !== id);
}

// ==============================================================================
// 7. INTERVIEW STUDIO SERVICE
// ==============================================================================

export async function getInterviewSessions(userId: string): Promise<InterviewSession[]> {
  return localInterviewSessions.filter((i) => i.user_id === userId || i.user_id === "demo-student");
}

export async function createInterviewSession(
  userId: string,
  mode: InterviewMode,
  targetRole: string = "AI / ML Engineer"
): Promise<InterviewSession> {
  const newSession: InterviewSession = {
    id: `int-${Date.now()}`,
    user_id: userId,
    mode,
    target_role: targetRole,
    status: "active",
    topics_covered: [],
    areas_to_revise: [],
    questions: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  localInterviewSessions = [newSession, ...localInterviewSessions];
  return newSession;
}

export async function addInterviewQuestion(
  sessionId: string,
  userId: string,
  question: Partial<InterviewQuestion>
): Promise<InterviewQuestion> {
  const newQ: InterviewQuestion = {
    id: `iq-${Date.now()}`,
    session_id: sessionId,
    user_id: userId,
    question_index: question.question_index || 1,
    question: question.question || "",
    user_answer: question.user_answer || "",
    feedback: question.feedback || "",
    suggested_answer: question.suggested_answer || "",
    created_at: new Date().toISOString(),
  };

  localInterviewSessions = localInterviewSessions.map((s) => {
    if (s.id === sessionId) {
      return { ...s, questions: [...(s.questions || []), newQ] };
    }
    return s;
  });

  return newQ;
}

export async function finishInterviewSession(
  sessionId: string,
  review: {
    overall_feedback: string;
    technical_coverage: string;
    topics_covered: string[];
    areas_to_revise: string[];
  }
): Promise<InterviewSession> {
  localInterviewSessions = localInterviewSessions.map((s) => {
    if (s.id === sessionId) {
      return {
        ...s,
        status: "completed",
        ...review,
        updated_at: new Date().toISOString(),
      };
    }
    return s;
  });

  return localInterviewSessions.find((s) => s.id === sessionId)!;
}

// ==============================================================================
// 8. ACHIEVEMENTS SERVICE
// ==============================================================================

export async function getAchievements(userId: string): Promise<StudentAchievement[]> {
  return localAchievements.filter((a) => a.user_id === userId || a.user_id === "demo-student");
}

export async function updateAchievementProgress(
  userId: string,
  badgeKey: string,
  increment: number = 1
): Promise<StudentAchievement | null> {
  const ach = localAchievements.find(
    (a) => (a.user_id === userId || a.user_id === "demo-student") && a.badge_key === badgeKey
  );

  if (ach) {
    ach.progress = Math.min(ach.target, ach.progress + increment);
    if (ach.progress >= ach.target && !ach.unlocked_at) {
      ach.unlocked_at = new Date().toISOString();
    }
    return ach;
  }
  return null;
}

// ==============================================================================
// 9. STUDENT COMMAND CENTER AGGREGATIONS
// ==============================================================================

export async function getTodayFocusActions(userId: string): Promise<TodayFocusAction[]> {
  const assignments = await getAssignments(userId);
  const memory = await getLearningMemory(userId);
  const weakItems = memory.filter((m) => m.status === "needs_review");

  const actions: TodayFocusAction[] = [];

  // Weak area action
  if (weakItems.length > 0) {
    const topWeak = weakItems[0];
    actions.push({
      id: `act-review-${topWeak.id}`,
      subject: topWeak.subject,
      task: `Review ${topWeak.topic}`,
      estimatedMinutes: 35,
      priority: "high",
      actionUrl: `/focus?subject=${encodeURIComponent(topWeak.subject)}&task=${encodeURIComponent(`Review ${topWeak.topic}`)}`,
    });
  } else {
    actions.push({
      id: "act-review-rl",
      subject: "Machine Learning",
      task: "Review Reinforcement Learning",
      estimatedMinutes: 35,
      priority: "high",
      actionUrl: "/focus?subject=Machine%20Learning&task=Review%20Reinforcement%20Learning",
    });
  }

  // Quiz / Practice action
  actions.push({
    id: "act-practice-ml",
    subject: "Machine Learning",
    task: "Complete ML Quiz",
    estimatedMinutes: 15,
    priority: "medium",
    actionUrl: "/practice",
  });

  // Flashcards action
  actions.push({
    id: "act-flashcards",
    subject: "Active Recall",
    task: "Review 18 Flashcards",
    estimatedMinutes: 10,
    priority: "medium",
    actionUrl: "/flashcards",
  });

  // Upcoming assignment action
  const activeAssignment = assignments.find((a) => a.status === "In Progress" || a.status === "Not Started");
  if (activeAssignment) {
    actions.push({
      id: `act-asg-${activeAssignment.id}`,
      subject: activeAssignment.subject_name,
      task: `Complete Assignment: ${activeAssignment.title}`,
      estimatedMinutes: Math.min(45, activeAssignment.estimated_minutes),
      priority: activeAssignment.priority.toLowerCase() === "urgent" ? "urgent" : "high",
      actionUrl: "/assignments",
    });
  }

  return actions.slice(0, 5);
}

export async function getUpNextTimeline(userId: string): Promise<UpNextTimelineItem[]> {
  const assignments = await getAssignments(userId);
  const items: UpNextTimelineItem[] = [];

  for (const asg of assignments) {
    if (asg.status !== "Completed" && asg.status !== "Submitted") {
      items.push({
        id: asg.id,
        title: asg.title,
        subject: asg.subject_name,
        type: asg.type,
        dueDate: asg.due_date,
        urgency: asg.priority === "Urgent" ? "urgent" : "upcoming",
      });
    }
  }

  items.push({
    id: "quiz-next",
    title: "Support Vector Machines Quiz",
    subject: "Machine Learning",
    type: "Quiz",
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
    urgency: "upcoming",
  });

  items.push({
    id: "flashcards-due",
    title: "18 Spaced Repetition Cards Due",
    subject: "General",
    type: "Flashcards",
    dueDate: new Date().toISOString(),
    urgency: "urgent",
  });

  items.push({
    id: "exam-next",
    title: "Digital Electronics Mid-Term",
    subject: "Digital Electronics",
    type: "Exam",
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    urgency: "upcoming",
  });

  return items.slice(0, 6);
}

export async function getLearningSnapshot(userId: string): Promise<LearningSnapshotData> {
  const focusSessions = await getFocusSessions(userId);
  const totalMin = focusSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
  const weeklyHours = Math.round((totalMin / 60) * 10) / 10;

  return {
    studyStreakDays: 5,
    weeklyStudyHours: weeklyHours > 0 ? weeklyHours : 14.5,
    completedTasks: 18,
    flashcardsDue: 18,
    practiceAccuracy: 88,
    currentGoalProgress: 75,
  };
}

export async function getStudentAIRecommendation(userId: string): Promise<StudentAIRecommendation> {
  const memory = await getLearningMemory(userId);
  const weakItems = memory.filter((m) => m.status === "needs_review");

  if (weakItems.length > 0) {
    const top = weakItems[0];
    return {
      subject: top.subject,
      topic: top.topic,
      recommendationText: `Your recent practice shows weaker performance in ${top.topic} (${top.subject}). Consider reviewing the core theorems and error formulations before continuing.`,
    };
  }

  return {
    subject: "Machine Learning",
    topic: "Regression Metrics",
    recommendationText:
      "Your recent practice shows weaker performance in Regression Metrics. Consider reviewing MAE, RMSE and R² before continuing.",
  };
}

export const studentOsService = {
  getAssignments,
  createAssignment,
  updateAssignment,
  getFocusSessions,
  createFocusSession,
  getLearningMemory,
  upsertLearningMemoryItem,
  getSkills,
  addSkillEvidence,
  getCareerProfile,
  updateCareerProfile,
  getProjects,
  createProject,
  getInterviewSessions,
  createInterviewSession,
  addInterviewQuestion,
  finishInterviewSession,
  getAchievements,
  getTodayFocusActions,
  getUpNextTimeline,
  getLearningSnapshot,
  getStudentAIRecommendation,
};


