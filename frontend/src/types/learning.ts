/**
 * LearnTrack - Student Learning OS Type Definitions
 * Unifies Notebook, Knowledge Base, Smart Notes, Flashcards, Practice Lab,
 * AI Tutor, Exam Prep, Study Guides, and Resource Library.
 */

export interface Notebook {
  id: string;
  user_id: string;
  student_id?: string | null;
  title: string;
  description?: string | null;
  icon?: string;
  color?: string;
  subject_id?: string | null;
  is_favorite?: boolean;
  notes_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  notebook_id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  is_pinned?: boolean;
  word_count?: number;
  created_at: string;
  updated_at: string;
}

export type SourceType = "pdf" | "docx" | "txt" | "markdown" | "url";
export type ProcessingStatus = "uploading" | "processing" | "extracting" | "indexing" | "ready" | "failed";

export interface AISummary {
  tldr: string;
  key_concepts: string[];
  important_terms: { term: string; definition: string }[];
  important_formulas?: string[];
  questions_to_review: string[];
}

export interface KnowledgeSource {
  id: string;
  user_id: string;
  notebook_id?: string | null;
  subject_id?: string | null;
  title: string;
  source_type: SourceType;
  file_size?: string | null;
  file_path?: string | null;
  url?: string | null;
  processing_status: ProcessingStatus;
  extracted_text?: string | null;
  summary?: AISummary | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export type FlashcardState = "new" | "learning" | "review" | "mastered";
export type FlashcardRating = "again" | "hard" | "good" | "easy" | "review" | "know";
export type FlashcardDifficulty = "easy" | "medium" | "hard";
export type FlashcardType =
  | "concept"
  | "definition"
  | "application"
  | "comparison"
  | "problem_solving"
  | "cause_effect"
  | "scenario"
  | "formula"
  | "exam_style"
  | "code"
  | "mixed";

export interface Flashcard {
  id: string;
  user_id: string;
  deck_id?: string | null;
  notebook_id?: string | null;
  subject_id?: string | null;
  source_id?: string | null;
  subject?: string;
  topic: string;
  difficulty?: FlashcardDifficulty;
  card_type?: FlashcardType;

  // Question & Answer (front & back preserved for backwards compatibility)
  front: string; // Question
  back: string;  // Answer
  question?: string; // alias
  answer?: string;   // alias

  // Pedagogical depth
  explanation?: string;
  example?: string;
  hint?: string;

  // Source grounding
  source_note_id?: string | null;
  source_document_id?: string | null;
  source_reference?: string;
  tags?: string[];

  // Spaced Repetition State
  state: FlashcardState;
  interval_days: number;
  ease_factor: number;
  reps: number;
  lapses?: number;
  due_date: string; // YYYY-MM-DD
  due_at?: string;
  last_reviewed_at?: string | null;

  created_at: string;
  updated_at: string;
}

export interface FlashcardDeck {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  subject?: string | null;
  color?: string | null;
  card_count?: number;
  due_count?: number;
  mastered_count?: number;
  learning_count?: number;
  review_count?: number;
  retention_rate?: number;
  avg_interval_days?: number;
  created_at: string;
  updated_at: string;
}

export interface FlashcardReviewLog {
  id: string;
  user_id: string;
  card_id: string;
  deck_id?: string | null;
  rating: "again" | "hard" | "good" | "easy";
  interval_days: number;
  ease_factor: number;
  repetition: number;
  duration_ms?: number;
  reviewed_at: string;
}

export interface FlashcardAnalytics {
  total_cards: number;
  cards_reviewed_count: number;
  review_streak_days: number;
  mastered_count: number;
  due_count: number;
  learning_count: number;
  review_stage_count: number;
  avg_interval_days: number;
  retention_rate: number;
  most_reviewed_topic: string | null;
  most_difficult_topic: string | null;
  strongest_topic: string | null;
  recent_activity_count: number;
}

export type QuestionType = "mcq" | "true_false" | "short_answer";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  source_citation?: string;
  type: QuestionType;
}

export interface Quiz {
  id: string;
  user_id: string;
  notebook_id?: string | null;
  subject_id?: string | null;
  source_id?: string | null;
  title: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  question_count: number;
  questions: QuizQuestion[];
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_questions: number;
  accuracy: number;
  time_seconds: number;
  user_answers: number[];
  weak_topics: string[];
  created_at: string;
}

export type TutorMode =
  | "Explain"
  | "Teach"
  | "Quiz Me"
  | "Give Hint"
  | "Solve Step-by-Step"
  | "Check My Answer"
  | "Exam Mode";

export type ExplainStyle =
  | "Simply"
  | "for Exam"
  | "with Example"
  | "with Analogy"
  | "Deep Dive";

export interface TutorMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: string;
  created_at?: string;
}

export interface TutorConversation {
  id: string;
  user_id: string;
  subject: string;
  topic: string;
  mode: TutorMode;
  is_socratic: boolean;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: TutorMessage[];
}

export interface ExamTopicItem {
  id: string;
  name: string;
  completed: boolean;
  weak?: boolean;
}

export interface ExamPlan {
  id: string;
  user_id: string;
  subject_id?: string | null;
  subject_name: string;
  exam_date: string;
  confidence_level: "Low" | "Medium" | "High";
  target_score?: number | null;
  topics: ExamTopicItem[];
  status: "active" | "completed" | "archived";
  created_at: string;
  updated_at: string;
}

export interface StudyGuideData {
  overview: string;
  key_concepts: string[];
  definitions: { term: string; meaning: string }[];
  formulas?: string[];
  examples: { title: string; explanation: string }[];
  common_mistakes: string[];
  practice_questions: string[];
  quick_revision: string[];
}

export interface StudyGuide {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  topic: string;
  guide_data: StudyGuideData;
  created_at: string;
}

export type ResourceCategory =
  | "Notes"
  | "Documents"
  | "Books"
  | "Links"
  | "Videos"
  | "Question Papers"
  | "Assignments";

export interface StudentResource {
  id: string;
  user_id: string;
  subject_id?: string | null;
  title: string;
  category: ResourceCategory;
  url?: string | null;
  description?: string | null;
  tags: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface PaperTopicCluster {
  topic: string;
  frequency: number;
  questions: string[];
}

export interface QuestionPaperAnalysis {
  paper_title: string;
  subject: string;
  examination_term?: string;
  extracted_questions_count: number;
  topic_clusters: PaperTopicCluster[];
  frequently_observed_topics: string[];
  suggested_revision_checklist: string[];
}
