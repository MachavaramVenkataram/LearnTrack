"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  CalendarCheck,
  Sparkles,
  BarChart3,
  SlidersHorizontal,
  User,
  Settings,
  ArrowRight,
  X,
  Plus,
  Calendar,
  Target,
  Zap,
  Brain,
  Cpu,
  Gauge,
  GitBranch,
  ShieldAlert,
  Activity,
  RefreshCw,
  Database,
  FileText,
  LogOut,
  History,
  Layers,
  CheckCircle2,
  BookMarked,
  Compass,
  CheckSquare,
  Timer,
  Award,
  Briefcase,
  FileCheck,
  Milestone,
  FolderGit2,
  BrainCircuit,
  GraduationCap,
  Terminal,
  Bot,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getSubjects } from "@/lib/academic/service";
import { learningService } from "@/lib/learning/service";
import { studentOsService } from "@/lib/student-os/service";
import { Subject } from "@/types/academic";
import { Note, KnowledgeSource, Flashcard, StudentResource, Notebook } from "@/types/learning";
import { Assignment, ProjectItem, Skill } from "@/types/student-os";

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  description: string;
  group:
    | "RECENT"
    | "SLASH COMMANDS"
    | "LEARNING"
    | "CAREER & SKILLS"
    | "ACTIONS"
    | "ASSIGNMENTS & TASKS"
    | "NOTES & SOURCES"
    | "PROJECTS"
    | "INTELLIGENCE"
    | "ML ENGINEERING"
    | "NAVIGATION"
    | "ENROLLED COURSES"
    | "ACCOUNT";
  categoryTag: string;
  url?: string;
  action?: () => void;
  customAction?: string;
  icon: React.ReactNode;
  badgeStyle: string;
  keywords?: string[];
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-blue-600 font-semibold underline decoration-blue-300 decoration-1 underline-offset-2">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const { user, studentProfile, signOut } = useAuth();
  const userId = user?.id || studentProfile?.id || "demo-user";
  const [query, setQuery] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [isMac, setIsMac] = useState(false);

  // Learning OS dynamic search sources
  const [learningNotes, setLearningNotes] = useState<Note[]>([]);
  const [learningSources, setLearningSources] = useState<KnowledgeSource[]>([]);
  const [learningFlashcards, setLearningFlashcards] = useState<Flashcard[]>([]);
  const [learningResources, setLearningResources] = useState<StudentResource[]>([]);
  const [learningNotebooks, setLearningNotebooks] = useState<Notebook[]>([]);

  // Student OS dynamic search sources
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [skillsList, setSkillsList] = useState<Skill[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Detect OS for shortcut badge
  useEffect(() => {
    if (typeof window !== "undefined") {
      const timer = setTimeout(() => {
        setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent || navigator.platform));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  // Fetch subjects from database
  useEffect(() => {
    if (studentProfile) {
      getSubjects(studentProfile.id).then(setSubjects).catch(() => {});
    }
  }, [studentProfile]);

  // Fetch learning data and Student OS data when command center opens
  useEffect(() => {
    if (isOpen) {
      learningService.getNotebooks(userId).then(setLearningNotebooks).catch(() => {});
      learningService.getNotes(userId).then(setLearningNotes).catch(() => {});
      learningService.getSources(userId).then(setLearningSources).catch(() => {});
      learningService.getFlashcards(userId).then(setLearningFlashcards).catch(() => {});
      learningService.getResources(userId).then(setLearningResources).catch(() => {});
      studentOsService.getAssignments(userId).then(setAssignments).catch(() => {});
      studentOsService.getProjects(userId).then(setProjects).catch(() => {});
      studentOsService.getSkills(userId).then(setSkillsList).catch(() => {});
    }
  }, [isOpen, userId]);

  // Load recent command IDs from localStorage
  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      const timer = setTimeout(() => {
        try {
          const stored = localStorage.getItem("learntrack_recent_commands");
          if (stored) {
            setRecentIds(JSON.parse(stored));
          }
        } catch {
          // Fallback gracefully
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Reset search and selection when palette opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setQuery("");
        setSelectedIndex(0);
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Central Command Definitions
  const allCommands = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [
      // SLASH COMMANDS (Section 20 Global Knowledge Search)
      {
        id: "slash-new-note",
        title: "/new-note",
        description: "Create a new note in your learning workspace",
        group: "SLASH COMMANDS",
        categoryTag: "Command",
        url: "/notebook?action=new",
        badgeStyle: "bg-blue-50 text-blue-600 border-blue-100",
        icon: <Terminal className="w-4 h-4" />,
        keywords: ["/new-note", "slash", "note", "new", "write", "editor"],
      },
      {
        id: "slash-start-focus",
        title: "/start-focus",
        description: "Start a distraction-free Pomodoro study timer",
        group: "SLASH COMMANDS",
        categoryTag: "Command",
        url: "/focus",
        badgeStyle: "bg-indigo-50 text-indigo-600 border-indigo-100",
        icon: <Timer className="w-4 h-4" />,
        keywords: ["/start-focus", "slash", "focus", "pomodoro", "study", "timer"],
      },
      {
        id: "slash-new-assignment",
        title: "/new-assignment",
        description: "Log a new coursework deliverable, homework, or exam",
        group: "SLASH COMMANDS",
        categoryTag: "Command",
        url: "/assignments?action=new",
        badgeStyle: "bg-amber-50 text-amber-600 border-amber-100",
        icon: <CheckSquare className="w-4 h-4" />,
        keywords: ["/new-assignment", "slash", "assignment", "due", "homework", "task"],
      },
      {
        id: "slash-create-flashcards",
        title: "/create-flashcards",
        description: "Generate AI flashcards from notes or curriculum topics",
        group: "SLASH COMMANDS",
        categoryTag: "Command",
        url: "/flashcards?action=generate",
        badgeStyle: "bg-emerald-50 text-emerald-600 border-emerald-100",
        icon: <Layers className="w-4 h-4" />,
        keywords: ["/create-flashcards", "slash", "flashcards", "anki", "cards", "generate"],
      },
      {
        id: "slash-start-quiz",
        title: "/start-quiz",
        description: "Launch an adaptive practice test with MCQs and code questions",
        group: "SLASH COMMANDS",
        categoryTag: "Command",
        url: "/practice",
        badgeStyle: "bg-cyan-50 text-cyan-600 border-cyan-100",
        icon: <CheckCircle2 className="w-4 h-4" />,
        keywords: ["/start-quiz", "slash", "quiz", "practice", "mcq", "exam"],
      },
      {
        id: "slash-open-career",
        title: "/open-career",
        description: "View target role skill gaps, roadmap, and resume status",
        group: "SLASH COMMANDS",
        categoryTag: "Command",
        url: "/career",
        badgeStyle: "bg-violet-50 text-violet-600 border-violet-100",
        icon: <Briefcase className="w-4 h-4" />,
        keywords: ["/open-career", "slash", "career", "jobs", "hired", "resume"],
      },
      {
        id: "slash-review-today",
        title: "/review-today",
        description: "Open the Student Command Center to see today's agenda",
        group: "SLASH COMMANDS",
        categoryTag: "Command",
        url: "/student-home",
        badgeStyle: "bg-blue-50 text-blue-600 border-blue-100",
        icon: <GraduationCap className="w-4 h-4" />,
        keywords: ["/review-today", "slash", "command center", "today", "agenda"],
      },

      // LEARNING (AI-Powered Student Learning OS)
      {
        id: "learn-create-note",
        title: "Create Note",
        description: "Start a new note or document inside your learning notebooks",
        group: "LEARNING",
        categoryTag: "Learning",
        url: "/notes?action=new",
        customAction: "new-note",
        badgeStyle: "bg-blue-50 text-blue-600 border-blue-100",
        icon: <FileText className="w-4 h-4" />,
        keywords: ["note", "draft", "write", "editor", "document", "new note"],
      },
      {
        id: "learn-notebook",
        title: "Open Notebook Workspace",
        description: "3-panel AI-grounded learning workspace and notes editor",
        group: "LEARNING",
        categoryTag: "Learning",
        url: "/notebook",
        badgeStyle: "bg-indigo-50 text-indigo-600 border-indigo-100",
        icon: <BookOpen className="w-4 h-4" />,
        keywords: ["notebook", "notes", "workspace", "editor", "sources", "notion"],
      },
      {
        id: "learn-tutor",
        title: "Ask LearnTrack AI Tutor",
        description: "Interactive Socratic concept tutor with step-by-step guidance",
        group: "LEARNING",
        categoryTag: "AI Tutor",
        url: "/tutor",
        badgeStyle: "bg-purple-50 text-purple-600 border-purple-100",
        icon: <Sparkles className="w-4 h-4" />,
        keywords: ["tutor", "socratic", "explain", "teach", "chat", "concept"],
      },
      {
        id: "learn-generate-flashcards",
        title: "Generate Flashcards",
        description: "Create AI flashcards from selected notes, topics, or subjects",
        group: "LEARNING",
        categoryTag: "Learning",
        url: "/flashcards?action=generate",
        customAction: "generate-flashcards",
        badgeStyle: "bg-amber-50 text-amber-600 border-amber-100",
        icon: <Layers className="w-4 h-4" />,
        keywords: ["flashcards", "cards", "anki", "spaced repetition", "memorize"],
      },
      {
        id: "learn-review-flashcards",
        title: "Review Due Flashcards",
        description: "Practice your daily spaced repetition flashcards queue",
        group: "LEARNING",
        categoryTag: "Learning",
        url: "/flashcards",
        badgeStyle: "bg-emerald-50 text-emerald-600 border-emerald-100",
        icon: <RefreshCw className="w-4 h-4" />,
        keywords: ["due", "spaced", "review", "cards", "repetition", "mastered"],
      },
      {
        id: "learn-practice-quiz",
        title: "Start Practice Quiz",
        description: "Customizable AI quiz with MCQ, True/False, and explanations",
        group: "LEARNING",
        categoryTag: "Practice",
        url: "/practice",
        badgeStyle: "bg-cyan-50 text-cyan-600 border-cyan-100",
        icon: <CheckCircle2 className="w-4 h-4" />,
        keywords: ["quiz", "test", "practice", "questions", "exam", "lab"],
      },
      {
        id: "learn-study-guides",
        title: "Generate AI Study Guide",
        description: "Structured 8-section revision guide with formulas and definitions",
        group: "LEARNING",
        categoryTag: "Learning",
        url: "/study-guides",
        badgeStyle: "bg-blue-50 text-blue-600 border-blue-100",
        icon: <Compass className="w-4 h-4" />,
        keywords: ["guide", "summary", "revision", "cram", "exam"],
      },
      {
        id: "learn-exam-prep",
        title: "Exam Prep Center",
        description: "Exam countdowns, confidence tracking, and revision roadmaps",
        group: "LEARNING",
        categoryTag: "Exam Prep",
        url: "/exam-prep",
        badgeStyle: "bg-rose-50 text-rose-600 border-rose-100",
        icon: <Calendar className="w-4 h-4" />,
        keywords: ["exam", "countdown", "test", "finals", "revision"],
      },
      {
        id: "learn-knowledge-base",
        title: "Open Knowledge Base",
        description: "Upload PDFs, DOCX, TXT, and manage grounded AI sources",
        group: "LEARNING",
        categoryTag: "Sources",
        url: "/knowledge",
        badgeStyle: "bg-indigo-50 text-indigo-600 border-indigo-100",
        icon: <Database className="w-4 h-4" />,
        keywords: ["sources", "pdf", "documents", "knowledge", "grounding"],
      },
      {
        id: "learn-resources",
        title: "Student Resource Library",
        description: "Organize books, links, video references, and past papers",
        group: "LEARNING",
        categoryTag: "Resources",
        url: "/resources",
        badgeStyle: "bg-slate-100 text-slate-700 border-slate-200",
        icon: <BookMarked className="w-4 h-4" />,
        keywords: ["resources", "papers", "assignments", "links", "books"],
      },

      // ACTIONS (Real interactive triggers & modals)
      {
        id: "act-add-record",
        title: "Add Academic Record",
        description: "Log attendance, internal marks, and exam score for a subject",
        group: "ACTIONS",
        categoryTag: "Action",
        url: "/performance?action=add",
        customAction: "add-record",
        badgeStyle: "bg-blue-50 text-blue-600 border-blue-100",
        icon: <Plus className="w-4 h-4" />,
        keywords: ["marks", "grade", "score", "exam", "attendance", "new", "create"],
      },
      {
        id: "act-add-subject",
        title: "Add New Subject",
        description: "Register a course subject with credit hours, code and semester",
        group: "ACTIONS",
        categoryTag: "Action",
        url: "/subjects?action=add",
        customAction: "add-subject",
        badgeStyle: "bg-amber-50 text-amber-600 border-amber-100",
        icon: <BookOpen className="w-4 h-4" />,
        keywords: ["course", "class", "syllabus", "credits", "register"],
      },
      {
        id: "act-record-study",
        title: "Record Study Session",
        description: "Log focused study hours, assignment progress, and revision notes",
        group: "ACTIONS",
        categoryTag: "Action",
        url: "/study?action=add",
        customAction: "add-study",
        badgeStyle: "bg-indigo-50 text-indigo-600 border-indigo-100",
        icon: <Calendar className="w-4 h-4" />,
        keywords: ["hours", "log", "time", "homework", "streak", "pomodoro"],
      },
      {
        id: "act-create-goal",
        title: "Create Academic Goal",
        description: "Set a target GPA benchmark, subject score, or study hour milestone",
        group: "ACTIONS",
        categoryTag: "Action",
        url: "/goals?action=add",
        customAction: "add-goal",
        badgeStyle: "bg-emerald-50 text-emerald-600 border-emerald-100",
        icon: <Target className="w-4 h-4" />,
        keywords: ["target", "objective", "milestone", "deadline", "aim"],
      },
      {
        id: "act-generate-plan",
        title: "Generate AI Study Plan",
        description: "Generate an adaptive weekly study schedule powered by AI",
        group: "ACTIONS",
        categoryTag: "Action",
        url: "/study-plan?action=generate",
        customAction: "generate-plan",
        badgeStyle: "bg-purple-50 text-purple-600 border-purple-100",
        icon: <Zap className="w-4 h-4" />,
        keywords: ["ai", "schedule", "revision", "timetable", "routine"],
      },

      // INTELLIGENCE & AI (Real LearnTrack AI features)
      {
        id: "int-assistant",
        title: "AI Academic Assistant",
        description: "Ask questions, review academic data, and get tailored guidance",
        group: "INTELLIGENCE",
        categoryTag: "AI Intelligence",
        url: "/assistant",
        badgeStyle: "bg-purple-50 text-purple-600 border-purple-100",
        icon: <Sparkles className="w-4 h-4" />,
        keywords: ["chat", "gemini", "tutor", "help", "advisor", "agent"],
      },
      {
        id: "int-insights",
        title: "AI Performance Insights",
        description: "Automated diagnostics of learning trends and weak areas",
        group: "INTELLIGENCE",
        categoryTag: "Intelligence",
        url: "/insights",
        badgeStyle: "bg-indigo-50 text-indigo-600 border-indigo-100",
        icon: <Zap className="w-4 h-4" />,
        keywords: ["patterns", "recommendations", "feedback", "strengths"],
      },
      {
        id: "int-prediction",
        title: "Performance Prediction",
        description: "Predict semester GPA, academic risk tier, and key factors",
        group: "INTELLIGENCE",
        categoryTag: "Intelligence",
        url: "/prediction",
        badgeStyle: "bg-blue-50 text-blue-600 border-blue-100",
        icon: <Brain className="w-4 h-4" />,
        keywords: ["forecast", "grade", "risk", "gpa", "ml", "estimate"],
      },
      {
        id: "int-analytics",
        title: "Comprehensive Analytics",
        description: "Deep dive into attendance, exam performance, and trajectories",
        group: "INTELLIGENCE",
        categoryTag: "Intelligence",
        url: "/analytics",
        badgeStyle: "bg-cyan-50 text-cyan-600 border-cyan-100",
        icon: <BarChart3 className="w-4 h-4" />,
        keywords: ["charts", "statistics", "metrics", "graphs", "breakdown"],
      },
      {
        id: "int-simulator",
        title: "What-If Simulator",
        description: "Simulate study hours, attendance, and assignment impact on GPA",
        group: "INTELLIGENCE",
        categoryTag: "Intelligence",
        url: "/simulator",
        badgeStyle: "bg-rose-50 text-rose-600 border-rose-100",
        icon: <SlidersHorizontal className="w-4 h-4" />,
        keywords: ["scenario", "hypothetical", "projection", "slider"],
      },
      {
        id: "int-reports",
        title: "Academic Reports",
        description: "Generate and download performance audits and transcripts",
        group: "INTELLIGENCE",
        categoryTag: "Intelligence",
        url: "/reports",
        badgeStyle: "bg-slate-100 text-slate-700 border-slate-200",
        icon: <FileText className="w-4 h-4" />,
        keywords: ["export", "pdf", "transcript", "download", "summary"],
      },

      // ML ENGINEERING (Real Machine Learning services & routes)
      {
        id: "ml-run-prediction",
        title: "Run ML Prediction Pipeline",
        description: "Execute real-time inference with our production FastAPI backend",
        group: "ML ENGINEERING",
        categoryTag: "ML Engineering",
        url: "/prediction",
        badgeStyle: "bg-blue-50 text-blue-600 border-blue-100",
        icon: <Cpu className="w-4 h-4" />,
        keywords: ["inference", "fastapi", "model", "pipeline", "predict"],
      },
      {
        id: "ml-evaluation",
        title: "Model Evaluation & Benchmarks",
        description: "Inspect precision, recall, F1-score, and confusion matrix",
        group: "ML ENGINEERING",
        categoryTag: "ML Engineering",
        url: "/admin",
        badgeStyle: "bg-emerald-50 text-emerald-600 border-emerald-100",
        icon: <Gauge className="w-4 h-4" />,
        keywords: ["admin", "metrics", "accuracy", "roc", "validation"],
      },
      {
        id: "ml-experiments",
        title: "MLflow Experiment Tracking",
        description: "Trace model experiments, benchmark metrics, hyperparameters, and artifacts",
        group: "ML ENGINEERING",
        categoryTag: "ML Engineering",
        url: "/experiments",
        badgeStyle: "bg-blue-50 text-blue-600 border-blue-100",
        icon: <GitBranch className="w-4 h-4" />,
        keywords: ["mlflow", "experiments", "tracking", "runs", "hyperparameters", "compare", "benchmark", "champion"],
      },
      {
        id: "ml-error-analysis",
        title: "Error Analysis",
        description: "Diagnose outlier residuals, false predictions, and bias slices",
        group: "ML ENGINEERING",
        categoryTag: "ML Engineering",
        url: "/error-analysis",
        badgeStyle: "bg-rose-50 text-rose-600 border-rose-100",
        icon: <ShieldAlert className="w-4 h-4" />,
        keywords: ["residuals", "outliers", "diagnostics", "failures"],
      },
      {
        id: "ml-monitoring",
        title: "ML Monitoring & Telemetry",
        description: "Monitor API latency, concept drift, and data distribution shifts",
        group: "ML ENGINEERING",
        categoryTag: "ML Engineering",
        url: "/ml-monitoring",
        badgeStyle: "bg-cyan-50 text-cyan-600 border-cyan-100",
        icon: <Activity className="w-4 h-4" />,
        keywords: ["drift", "telemetry", "uptime", "latency", "health"],
      },
      {
        id: "ml-retraining",
        title: "Model Retraining Pipeline",
        description: "Trigger automated retraining on latest validated student data",
        group: "ML ENGINEERING",
        categoryTag: "ML Engineering",
        url: "/retraining",
        badgeStyle: "bg-amber-50 text-amber-600 border-amber-100",
        icon: <RefreshCw className="w-4 h-4" />,
        keywords: ["train", "pipeline", "rebuild", "weights", "weights"],
      },
      {
        id: "ml-data-quality",
        title: "Data Quality & Integrity",
        description: "Verify academic data completeness, schema constraints, and distributions",
        group: "ML ENGINEERING",
        categoryTag: "ML Engineering",
        url: "/data-quality",
        badgeStyle: "bg-slate-100 text-slate-700 border-slate-200",
        icon: <Database className="w-4 h-4" />,
        keywords: ["validation", "schema", "nulls", "integrity", "dataset"],
      },

      // NAVIGATION (Core academic views & Student OS)
      {
        id: "nav-student-home",
        title: "Student Command Center",
        description: "What should I do today? Priorities, timeline, and daily snapshot",
        group: "NAVIGATION",
        categoryTag: "Overview",
        url: "/student-home",
        badgeStyle: "bg-blue-50 text-blue-600 border-blue-100",
        icon: <GraduationCap className="w-4 h-4" />,
        keywords: ["today", "home", "command", "priorities", "focus", "overview", "agenda"],
      },
      {
        id: "nav-dashboard",
        title: "Dashboard Overview",
        description: "Your main academic workspace, key metrics, and daily overview",
        group: "NAVIGATION",
        categoryTag: "Overview",
        url: "/dashboard",
        badgeStyle: "bg-blue-50 text-blue-600 border-blue-100",
        icon: <LayoutDashboard className="w-4 h-4" />,
        keywords: ["home", "main", "workspace", "overview"],
      },
      {
        id: "nav-focus",
        title: "Focus Mode",
        description: "Distraction-free Pomodoro study timer with objective & reflection logs",
        group: "NAVIGATION",
        categoryTag: "Productivity",
        url: "/focus",
        badgeStyle: "bg-indigo-50 text-indigo-600 border-indigo-100",
        icon: <Timer className="w-4 h-4" />,
        keywords: ["pomodoro", "timer", "distraction", "deep work", "session", "focus"],
      },
      {
        id: "nav-assignments",
        title: "Assignments & Deliverables",
        description: "Track homework, labs, exams with AI subtask breakdown",
        group: "NAVIGATION",
        categoryTag: "Academic",
        url: "/assignments",
        badgeStyle: "bg-amber-50 text-amber-600 border-amber-100",
        icon: <CheckSquare className="w-4 h-4" />,
        keywords: ["homework", "deadline", "tasks", "submission", "due", "deliverables"],
      },
      {
        id: "nav-performance",
        title: "Academic Performance",
        description: "Gradebook, subject marks breakdown, and credit totals",
        group: "NAVIGATION",
        categoryTag: "Academic",
        url: "/performance",
        badgeStyle: "bg-emerald-50 text-emerald-600 border-emerald-100",
        icon: <TrendingUp className="w-4 h-4" />,
        keywords: ["grades", "marks", "scores", "credits", "gpa"],
      },
      {
        id: "nav-subjects",
        title: "Course Subjects",
        description: "Enrolled subjects, course codes, instructors, and credits",
        group: "NAVIGATION",
        categoryTag: "Academic",
        url: "/subjects",
        badgeStyle: "bg-amber-50 text-amber-600 border-amber-100",
        icon: <BookOpen className="w-4 h-4" />,
        keywords: ["courses", "classes", "modules", "curriculum"],
      },
      {
        id: "nav-goals",
        title: "Academic Goals",
        description: "Set and track target GPAs, exam scores, and study hour goals",
        group: "NAVIGATION",
        categoryTag: "Academic",
        url: "/goals",
        badgeStyle: "bg-emerald-50 text-emerald-600 border-emerald-100",
        icon: <Target className="w-4 h-4" />,
        keywords: ["targets", "aspirations", "milestones", "tracking"],
      },
      {
        id: "nav-study-plan",
        title: "AI Study Plan",
        description: "Personalized weekly schedule and revision routine",
        group: "NAVIGATION",
        categoryTag: "Academic",
        url: "/study-plan",
        badgeStyle: "bg-purple-50 text-purple-600 border-purple-100",
        icon: <Calendar className="w-4 h-4" />,
        keywords: ["routine", "calendar", "agenda", "tasks"],
      },
      {
        id: "nav-study",
        title: "Study Activity Tracker",
        description: "Log daily sessions, study streaks, and assignment milestones",
        group: "NAVIGATION",
        categoryTag: "Academic",
        url: "/study",
        badgeStyle: "bg-indigo-50 text-indigo-600 border-indigo-100",
        icon: <CalendarCheck className="w-4 h-4" />,
        keywords: ["hours", "streak", "pomodoro", "history"],
      },
      {
        id: "nav-learning-memory",
        title: "Learning Memory",
        description: "Track mastered topics, weak concepts, and revision context",
        group: "LEARNING",
        categoryTag: "Memory",
        url: "/learning-memory",
        badgeStyle: "bg-purple-50 text-purple-600 border-purple-100",
        icon: <BrainCircuit className="w-4 h-4" />,
        keywords: ["memory", "mastered", "weak", "context", "recall", "topics"],
      },
      {
        id: "nav-skills",
        title: "Skill Intelligence",
        description: "Evidence-grounded skills calculated from quizzes & projects",
        group: "CAREER & SKILLS",
        categoryTag: "Skills",
        url: "/skills",
        badgeStyle: "bg-cyan-50 text-cyan-600 border-cyan-100",
        icon: <TrendingUp className="w-4 h-4" />,
        keywords: ["skills", "competencies", "evidence", "python", "ml", "coding"],
      },
      {
        id: "nav-career",
        title: "Career Hub",
        description: "Target roles, evidence-grounded skill gaps, and roadmap",
        group: "CAREER & SKILLS",
        categoryTag: "Career",
        url: "/career",
        badgeStyle: "bg-violet-50 text-violet-600 border-violet-100",
        icon: <Briefcase className="w-4 h-4" />,
        keywords: ["career", "jobs", "hire", "readiness", "target", "role"],
      },
      {
        id: "nav-resume",
        title: "Resume Intelligence",
        description: "LearnTrack match indicator, ATS audit, and STAR bullet generator",
        group: "CAREER & SKILLS",
        categoryTag: "Career",
        url: "/resume",
        badgeStyle: "bg-emerald-50 text-emerald-600 border-emerald-100",
        icon: <FileCheck className="w-4 h-4" />,
        keywords: ["resume", "cv", "ats", "bullets", "star", "builder", "match"],
      },
      {
        id: "nav-interview",
        title: "Interview Studio",
        description: "Sequential AI mock interviews across technical, AIML & HR tracks",
        group: "CAREER & SKILLS",
        categoryTag: "Career",
        url: "/interview",
        badgeStyle: "bg-rose-50 text-rose-600 border-rose-100",
        icon: <Bot className="w-4 h-4" />,
        keywords: ["interview", "mock", "practice", "questions", "critique", "feedback"],
      },
      {
        id: "nav-career-roadmap",
        title: "Career Roadmap",
        description: "6-phase engineering trajectory connected to LearnTrack resources",
        group: "CAREER & SKILLS",
        categoryTag: "Career",
        url: "/career-roadmap",
        badgeStyle: "bg-blue-50 text-blue-600 border-blue-100",
        icon: <Milestone className="w-4 h-4" />,
        keywords: ["roadmap", "pathway", "trajectory", "phases", "milestones"],
      },
      {
        id: "nav-projects",
        title: "Project Portfolio",
        description: "Document GitHub projects, generate AI READMEs and STAR bullets",
        group: "CAREER & SKILLS",
        categoryTag: "Projects",
        url: "/projects",
        badgeStyle: "bg-indigo-50 text-indigo-600 border-indigo-100",
        icon: <FolderGit2 className="w-4 h-4" />,
        keywords: ["projects", "github", "portfolio", "code", "readme", "repo"],
      },
      {
        id: "nav-achievements",
        title: "Achievements & Badges",
        description: "Professional milestone badges for study streaks and completions",
        group: "NAVIGATION",
        categoryTag: "Badges",
        url: "/achievements",
        badgeStyle: "bg-amber-50 text-amber-600 border-amber-100",
        icon: <Award className="w-4 h-4" />,
        keywords: ["achievements", "badges", "milestones", "streak", "unlocked", "awards"],
      },

      // DYNAMIC ENROLLED SUBJECTS
      ...subjects.map((sub) => ({
        id: `course-${sub.id}`,
        title: sub.subject_name,
        description: `${sub.subject_code || "Course"} • ${sub.credits || 3} Credits • Semester ${sub.semester}`,
        group: "ENROLLED COURSES" as const,
        categoryTag: `Sem ${sub.semester}`,
        url: "/subjects",
        badgeStyle: "bg-blue-50 text-blue-600 border-blue-100",
        icon: <BookOpen className="w-4 h-4" />,
        keywords: [sub.subject_code || "", "enrolled", "subject", "exam"],
      })),

      // ACCOUNT & SETTINGS
      {
        id: "acc-profile",
        title: "Student Profile",
        description: "View department, year, degree, and personal academic details",
        group: "ACCOUNT",
        categoryTag: "Account",
        url: "/profile",
        badgeStyle: "bg-slate-100 text-slate-700 border-slate-200",
        icon: <User className="w-4 h-4" />,
        keywords: ["me", "user", "student", "degree", "details"],
      },
      {
        id: "acc-settings",
        title: "Platform Settings",
        description: "Configure preferences, notification alerts, and security",
        group: "ACCOUNT",
        categoryTag: "Account",
        url: "/settings",
        badgeStyle: "bg-slate-100 text-slate-700 border-slate-200",
        icon: <Settings className="w-4 h-4" />,
        keywords: ["preferences", "theme", "config", "options"],
      },
      {
        id: "acc-signout",
        title: "Sign Out",
        description: "Safely end your current session and return to login",
        group: "ACCOUNT",
        categoryTag: "Session",
        action: async () => {
          await signOut();
          router.push("/login");
        },
        badgeStyle: "bg-rose-50 text-rose-600 border-rose-100",
        icon: <LogOut className="w-4 h-4" />,
        keywords: ["logout", "exit", "disconnect"],
      },

      // DYNAMIC NOTES (Section 44 Global Search)
      ...learningNotes.map((note) => ({
        id: `note-${note.id}`,
        title: note.title,
        description: note.content ? note.content.slice(0, 80).replace(/[#*`\n]/g, " ") + "..." : "Course document",
        group: "NOTES & SOURCES" as const,
        categoryTag: "Note",
        url: `/notebook?noteId=${note.id}`,
        badgeStyle: "bg-blue-50 text-blue-600 border-blue-100",
        icon: <FileText className="w-4 h-4" />,
        keywords: [note.title, "note", "notebook", note.content?.slice(0, 100) || ""],
      })),

      // DYNAMIC KNOWLEDGE SOURCES
      ...learningSources.map((source) => ({
        id: `source-${source.id}`,
        title: source.title,
        description: `${source.source_type.toUpperCase()} • ${source.processing_status === "ready" ? "Indexed & Grounded" : source.processing_status}`,
        group: "NOTES & SOURCES" as const,
        categoryTag: "Source",
        url: "/knowledge",
        badgeStyle: "bg-indigo-50 text-indigo-600 border-indigo-100",
        icon: <BookOpen className="w-4 h-4" />,
        keywords: [source.title, source.source_type, "source", "document", "knowledge", "grounding"],
      })),

      // DYNAMIC FLASHCARDS
      ...learningFlashcards.slice(0, 15).map((card) => ({
        id: `card-${card.id}`,
        title: card.front,
        description: `${card.topic || "General"} • ${card.state.toUpperCase()} • Interval: ${card.interval_days}d`,
        group: "NOTES & SOURCES" as const,
        categoryTag: "Flashcard",
        url: "/flashcards",
        badgeStyle: "bg-amber-50 text-amber-600 border-amber-100",
        icon: <Layers className="w-4 h-4" />,
        keywords: [card.front, card.back, card.topic || "", "flashcard", "spaced repetition"],
      })),

      // DYNAMIC RESOURCES
      ...learningResources.map((res) => ({
        id: `res-${res.id}`,
        title: res.title,
        description: `${res.category} • ${res.tags.join(", ") || "General Reference"}`,
        group: "NOTES & SOURCES" as const,
        categoryTag: res.category,
        url: "/resources",
        badgeStyle: "bg-emerald-50 text-emerald-600 border-emerald-100",
        icon: <BookMarked className="w-4 h-4" />,
        keywords: [res.title, res.category, ...res.tags, "resource", "reference"],
      })),

      // DYNAMIC NOTEBOOKS
      ...learningNotebooks.map((nb) => ({
        id: `nb-${nb.id}`,
        title: nb.title,
        description: nb.description || "Course Notebook Workspace",
        group: "NOTES & SOURCES" as const,
        categoryTag: "Notebook",
        url: `/notebook?notebookId=${nb.id}`,
        badgeStyle: "bg-indigo-50 text-indigo-600 border-indigo-100",
        icon: <BookOpen className="w-4 h-4" />,
        keywords: [nb.title, "notebook", nb.description || ""],
      })),

      // DYNAMIC ASSIGNMENTS (Section 20 Global Search)
      ...assignments.map((a) => ({
        id: `assignment-${a.id}`,
        title: a.title,
        description: `${a.subject_name} • Due ${a.due_date} • ${a.status} (${a.priority} priority)`,
        group: "ASSIGNMENTS & TASKS" as const,
        categoryTag: a.type,
        url: "/assignments",
        badgeStyle: "bg-amber-50 text-amber-600 border-amber-100",
        icon: <CheckSquare className="w-4 h-4" />,
        keywords: [a.title, a.subject_name, a.type, a.status, "assignment", "deadline", "task", "homework"],
      })),

      // DYNAMIC PROJECTS (Section 20 Global Search)
      ...projects.map((p) => ({
        id: `project-${p.id}`,
        title: p.title,
        description: `${p.tech_stack.slice(0, 3).join(", ")} • Status: ${p.status}`,
        group: "PROJECTS" as const,
        categoryTag: "Project",
        url: "/projects",
        badgeStyle: "bg-indigo-50 text-indigo-600 border-indigo-100",
        icon: <FolderGit2 className="w-4 h-4" />,
        keywords: [p.title, ...p.tech_stack, p.status, "project", "code", "github", "portfolio"],
      })),

      // DYNAMIC SKILLS (Section 20 Global Search)
      ...skillsList.map((s) => ({
        id: `skill-${s.id}`,
        title: `Skill: ${s.name}`,
        description: `Level: ${s.level} (${s.score}%) • ${s.verified_evidence_count} evidence records`,
        group: "CAREER & SKILLS" as const,
        categoryTag: "Skill",
        url: "/skills",
        badgeStyle: "bg-cyan-50 text-cyan-600 border-cyan-100",
        icon: <BrainCircuit className="w-4 h-4" />,
        keywords: [s.name, s.category, s.level, "skill", "competency", "evidence"],
      })),
    ];

    return list;
  }, [
    subjects,
    signOut,
    router,
    learningNotes,
    learningSources,
    learningFlashcards,
    learningResources,
    learningNotebooks,
    assignments,
    projects,
    skillsList,
  ]);

  // Execute Command Logic
  const handleExecute = useCallback((item: CommandItem) => {
    // 1. Record to recent history in localStorage
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("learntrack_recent_commands");
        const list: string[] = stored ? JSON.parse(stored) : [];
        const next = [item.id, ...list.filter((id) => id !== item.id)].slice(0, 5);
        localStorage.setItem("learntrack_recent_commands", JSON.stringify(next));
        setRecentIds(next);
      } catch {
        // Ignore storage errors
      }
    }

    // 2. Close modal smoothly
    onClose();

    // 3. Trigger action or navigate
    if (item.action) {
      item.action();
    } else if (item.url) {
      if (item.customAction) {
        window.dispatchEvent(
          new CustomEvent("learntrack:open-action", {
            detail: { action: item.customAction },
          })
        );
      }
      router.push(item.url);
    }
  }, [onClose, router]);

  // Grouped and Filtered Results
  const { groupedResults, flatList } = useMemo(() => {
    const q = query.trim().toLowerCase();

    // If query is empty, show RECENT followed by primary groups
    if (!q) {
      // Find actual recent items or sensible defaults
      const recentItems: CommandItem[] = [];
      const defaultRecentIds = ["learn-notebook", "nav-dashboard", "learn-tutor", "nav-performance"];
      const targetIds = recentIds.length > 0 ? recentIds : defaultRecentIds;

      targetIds.forEach((id) => {
        const found = allCommands.find((c) => c.id === id);
        if (found && !recentItems.some((r) => r.id === found.id)) {
          recentItems.push(found);
        }
      });

      // Assemble organized groups
      const groups: { title: string; items: CommandItem[] }[] = [];

      if (recentItems.length > 0) {
        groups.push({ title: "RECENT", items: recentItems });
      }

      const quickSlash = allCommands.filter((c) => c.group === "SLASH COMMANDS");
      if (quickSlash.length > 0) groups.push({ title: "QUICK COMMANDS", items: quickSlash.slice(0, 4) });

      const learning = allCommands.filter((c) => c.group === "LEARNING");
      if (learning.length > 0) groups.push({ title: "LEARNING", items: learning });

      const career = allCommands.filter((c) => c.group === "CAREER & SKILLS");
      if (career.length > 0) groups.push({ title: "CAREER & SKILLS", items: career });

      const actions = allCommands.filter((c) => c.group === "ACTIONS");
      if (actions.length > 0) groups.push({ title: "ACTIONS", items: actions });

      const intelligence = allCommands.filter((c) => c.group === "INTELLIGENCE");
      if (intelligence.length > 0) groups.push({ title: "INTELLIGENCE", items: intelligence });

      const navigation = allCommands.filter((c) => c.group === "NAVIGATION");
      if (navigation.length > 0) groups.push({ title: "NAVIGATION", items: navigation });

      const ml = allCommands.filter((c) => c.group === "ML ENGINEERING");
      if (ml.length > 0) groups.push({ title: "ML ENGINEERING", items: ml });

      const enrolled = allCommands.filter((c) => c.group === "ENROLLED COURSES");
      if (enrolled.length > 0) groups.push({ title: "ENROLLED COURSES", items: enrolled });

      const account = allCommands.filter((c) => c.group === "ACCOUNT");
      if (account.length > 0) groups.push({ title: "ACCOUNT", items: account });

      const flat = groups.flatMap((g) => g.items);
      return { groupedResults: groups, flatList: flat };
    }

    // Dynamic AI Ask Item when search query is typed (Section 20 Global Search)
    const aiAskItem: CommandItem = {
      id: "ask-learntrack-ai-query",
      title: `Ask LearnTrack about "${query.trim()}"`,
      description: "Ask your AI tutor to analyze, explain, or find grounded coursework resources",
      group: "INTELLIGENCE",
      categoryTag: "AI Query",
      url: `/assistant?prompt=${encodeURIComponent(query.trim())}`,
      badgeStyle: "bg-purple-50 text-purple-600 border-purple-100",
      icon: <Sparkles className="w-4 h-4 text-purple-600" />,
      keywords: [query.trim(), "ask", "ai", "gemini", "assistant", "explain"],
    };

    const searchPool = [aiAskItem, ...allCommands];

    // When query is present, perform rich fuzzy/keyword search
    const filtered = searchPool.filter((cmd) => {
      const matchTitle = cmd.title.toLowerCase().includes(q);
      const matchDesc = cmd.description.toLowerCase().includes(q);
      const matchGroup = cmd.group.toLowerCase().includes(q);
      const matchCategory = cmd.categoryTag.toLowerCase().includes(q);
      const matchKeywords = cmd.keywords?.some((k) => k.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchGroup || matchCategory || matchKeywords;
    });

    // Group the matching items by section with dynamic priority based on query
    const groupOrder = q.startsWith("/")
      ? [
          "SLASH COMMANDS",
          "ACTIONS",
          "LEARNING",
          "ASSIGNMENTS & TASKS",
          "CAREER & SKILLS",
          "NOTES & SOURCES",
          "PROJECTS",
          "INTELLIGENCE",
          "ML ENGINEERING",
          "NAVIGATION",
          "ENROLLED COURSES",
          "ACCOUNT",
        ]
      : [
          "INTELLIGENCE",
          "SLASH COMMANDS",
          "LEARNING",
          "ASSIGNMENTS & TASKS",
          "CAREER & SKILLS",
          "NOTES & SOURCES",
          "PROJECTS",
          "ACTIONS",
          "NAVIGATION",
          "ML ENGINEERING",
          "ENROLLED COURSES",
          "ACCOUNT",
        ];

    const groups: { title: string; items: CommandItem[] }[] = [];

    groupOrder.forEach((grp) => {
      const grpItems = filtered.filter((c) => c.group === grp);
      if (grpItems.length > 0) {
        groups.push({ title: grp, items: grpItems });
      }
    });

    const flat = groups.flatMap((g) => g.items);
    return { groupedResults: groups, flatList: flat };
  }, [allCommands, query, recentIds]);

  // Adjust selectedIndex if it goes out of range
  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedIndex((prev) => {
        if (flatList.length === 0) return 0;
        if (prev >= flatList.length) return flatList.length - 1;
        return prev;
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [flatList.length]);

  // Auto-scroll selected item into view smoothly
  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  // Keyboard navigation listener
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (flatList.length === 0 ? 0 : (prev + 1) % flatList.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          flatList.length === 0 ? 0 : (prev - 1 + flatList.length) % flatList.length
        );
      } else if (e.key === "Home") {
        e.preventDefault();
        setSelectedIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setSelectedIndex(flatList.length - 1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (flatList[selectedIndex]) {
          handleExecute(flatList[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [flatList, selectedIndex, handleExecute, onClose]
  );

  // Global escape listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  let runningIndex = 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="LearnTrack Command Center"
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[13vh] px-3 sm:px-4"
    >
      {/* 1. Backdrop with gentle SaaS blur */}
      <div
        className="fixed inset-0 bg-[#0F172A]/[0.28] backdrop-blur-[6px] transition-opacity duration-200 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Premium Command Center Surface */}
      <div
        className="relative w-full max-w-[650px] bg-white/[0.98] rounded-[20px] border border-slate-200 shadow-[0_24px_70px_-15px_rgba(15,23,42,0.18),0_0_0_1px_rgba(15,23,42,0.04)] z-10 overflow-hidden flex flex-col max-h-[72vh] sm:max-h-[70vh] animate-in fade-in zoom-in-[0.98] -translate-y-2 duration-180 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Top Indicator Bar */}
        <div className="flex items-center justify-between px-4 py-1.5 bg-slate-50/70 border-b border-slate-100 text-[10.5px] font-semibold tracking-wider uppercase text-slate-400 select-none">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-slate-500 font-medium">LearnTrack Command Center</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 lowercase">
            <span>workspace</span>
            <span>•</span>
            <span className="text-slate-600 font-semibold uppercase text-[9px] tracking-wide">
              {studentProfile?.semester ? `Sem ${studentProfile.semester}` : "Active"}
            </span>
          </div>
        </div>

        {/* 3. Search Header */}
        <div className="flex items-center px-4.5 h-14 border-b border-slate-100/90 bg-white">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages, subjects, actions..."
            style={{ outline: "none", boxShadow: "none" }}
            className="w-full h-full text-[14.5px] text-slate-900 placeholder:text-slate-400 bg-transparent outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 border-0 font-normal shadow-none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />

          {/* Right Action: OS Keyboard Badge & Dismiss */}
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <div className="hidden sm:inline-flex items-center gap-0.5 select-none">
              <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 min-w-[20px] text-[10px] font-mono font-semibold text-slate-400 bg-slate-100/90 rounded border border-slate-200/70 shadow-2xs">
                {isMac ? "⌘" : "Ctrl"}
              </kbd>
              <kbd className="inline-flex items-center justify-center px-1.5 py-0.5 min-w-[18px] text-[10px] font-mono font-semibold text-slate-400 bg-slate-100/90 rounded border border-slate-200/70 shadow-2xs">
                K
              </kbd>
            </div>

            <button
              onClick={onClose}
              aria-label="Close command center"
              className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4. Results List Container */}
        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-2 py-2 divide-y divide-transparent scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
        >
          {flatList.length === 0 ? (
            /* Empty / No Results State */
            <div className="py-10 px-4 text-center select-none animate-in fade-in duration-150">
              <div className="w-10 h-10 rounded-2xl bg-slate-100/80 border border-slate-200/50 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                No results found for &ldquo;<span className="text-blue-600 font-semibold">{query}</span>&rdquo;
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Try searching for pages, intelligence tools, or quick actions.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4">
                {["prediction", "add subject", "analytics", "simulator", "study plan"].map((tip) => (
                  <button
                    key={tip}
                    type="button"
                    onClick={() => {
                      setQuery(tip);
                      inputRef.current?.focus();
                    }}
                    className="text-xs text-slate-600 bg-slate-100/80 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer border border-slate-200/60"
                  >
                    {tip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            groupedResults.map((group) => {
              if (group.items.length === 0) return null;

              return (
                <div key={group.title} className="mb-2 last:mb-0">
                  {/* Group Heading */}
                  <div className="px-3 pt-2.5 pb-1 text-[10px] font-bold text-slate-400 tracking-[0.08em] uppercase select-none flex items-center justify-between">
                    <span>{group.title}</span>
                    {group.title === "RECENT" && (
                      <span className="flex items-center gap-1 text-[9.5px] text-slate-400 font-normal lowercase">
                        <History className="w-3 h-3 text-slate-400" />
                        last used
                      </span>
                    )}
                  </div>

                  {/* Group Items */}
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const itemIndex = runningIndex++;
                      const isSelected = itemIndex === selectedIndex;

                      return (
                        <div
                          key={item.id}
                          ref={(el) => {
                            itemRefs.current[itemIndex] = el;
                          }}
                          onClick={() => handleExecute(item)}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          role="option"
                          tabIndex={0}
                          aria-selected={isSelected}
                          className={`group relative flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all duration-150 select-none ${
                            isSelected
                              ? "bg-blue-50/75 border border-blue-100/80 shadow-2xs"
                              : "hover:bg-slate-50/90 border border-transparent"
                          }`}
                        >
                          {/* Active Indicator Bar */}
                          {isSelected && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-blue-600" />
                          )}

                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Icon Container */}
                            <div
                              className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? "bg-white shadow-2xs text-blue-600 border-blue-200" : item.badgeStyle
                              }`}
                            >
                              {item.icon}
                            </div>

                            {/* Command Text */}
                            <div className="min-w-0 flex-1 pr-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[13.5px] truncate font-medium transition-colors ${
                                    isSelected ? "text-blue-900 font-semibold" : "text-slate-800 group-hover:text-blue-600"
                                  }`}
                                >
                                  <HighlightMatch text={item.title} query={query} />
                                </span>
                              </div>
                              <p className="text-[11.5px] text-slate-400 truncate mt-0.5">
                                <HighlightMatch text={item.description} query={query} />
                              </p>
                            </div>
                          </div>

                          {/* Right Meta Pill & Arrow */}
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span
                              className={`hidden sm:inline-block text-[10px] font-medium px-2 py-0.5 rounded-md border transition-colors ${
                                isSelected
                                  ? "text-blue-700 bg-blue-100/70 border-blue-200/70"
                                  : "text-slate-400 bg-slate-100/70 border-slate-200/40"
                              }`}
                            >
                              {item.categoryTag}
                            </span>
                            <ArrowRight
                              className={`w-3.5 h-3.5 transition-all duration-150 shrink-0 ${
                                isSelected
                                  ? "text-blue-600 translate-x-1 opacity-100"
                                  : "text-slate-300 opacity-60 group-hover:opacity-100 group-hover:text-blue-600 group-hover:translate-x-0.5"
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 5. Minimal Footer Command Bar */}
        <div className="h-9.5 px-4 bg-[#FCFDFE] border-t border-slate-100/90 flex items-center justify-between text-[11px] text-slate-400 select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <kbd className="font-mono bg-slate-100 text-slate-500 px-1 py-0.5 rounded text-[10px] border border-slate-200/60 shadow-2xs">
                ↑↓
              </kbd>
              <span className="text-slate-500">Navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="font-mono bg-slate-100 text-slate-500 px-1 py-0.5 rounded text-[10px] border border-slate-200/60 shadow-2xs">
                ↵
              </kbd>
              <span className="text-slate-500">Open</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="font-mono bg-slate-100 text-slate-500 px-1 py-0.5 rounded text-[10px] border border-slate-200/60 shadow-2xs">
                Esc
              </kbd>
              <span className="text-slate-500">Close</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <span>{flatList.length}</span>
            <span>{flatList.length === 1 ? "command" : "commands"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
