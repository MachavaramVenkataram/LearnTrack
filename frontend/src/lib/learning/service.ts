/**
 * LearnTrack - Student Learning OS Service
 * Full CRUD, Spaced Repetition Algorithm, Source Processing Simulation,
 * and Weak Topic Intelligence.
 *
 * Gracefully syncs with Supabase database when connected, with transparent
 * resilient local caching and realistic academic starter state.
 */

import { supabase } from "@/lib/supabase/client";
import {
  Notebook,
  Note,
  KnowledgeSource,
  Flashcard,
  FlashcardRating,
  Quiz,
  QuizAttempt,
  ExamPlan,
  StudyGuide,
  StudentResource,
  ProcessingStatus,
  AISummary,
} from "@/types/learning";
import { calculateNextReview as sm2CalculateNextReview } from "@/lib/flashcards/scheduler";

// Local storage keys
const STORAGE_PREFIX = "learntrack_learning_";

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn("[LearningService] Local storage write error:", e);
  }
}

// ==============================================================================
// INITIAL DEMO DATA GENERATORS (Matches LearnTrack Academic Context)
// ==============================================================================

export const INITIAL_NOTEBOOKS: Notebook[] = [
  {
    id: "nb-ml",
    user_id: "demo-user",
    title: "Machine Learning",
    description: "Supervised models, regression, regularization, gradient descent & neural architectures.",
    icon: "🧠",
    color: "#2563EB",
    is_favorite: true,
    notes_count: 3,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "nb-de",
    user_id: "demo-user",
    title: "Digital Electronics",
    description: "Boolean logic, Karnaugh maps, combinational circuits, flip-flops & registers.",
    icon: "⚡",
    color: "#059669",
    is_favorite: true,
    notes_count: 2,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: "nb-dbms",
    user_id: "demo-user",
    title: "Database Management Systems",
    description: "Relational algebra, normalization (1NF-BCNF), ACID properties, indexing & SQL.",
    icon: "💾",
    color: "#7C3AED",
    is_favorite: false,
    notes_count: 2,
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: "nb-exam",
    user_id: "demo-user",
    title: "Semester 1 Exam Preparation",
    description: "High-yield revision summaries, formula sheets, past exam trends & weak areas.",
    icon: "📅",
    color: "#DC2626",
    is_favorite: true,
    notes_count: 2,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
];

export const INITIAL_NOTES: Note[] = [
  {
    id: "note-ml-1",
    notebook_id: "nb-ml",
    user_id: "demo-user",
    title: "Gradient Descent & Learning Rate Dynamics",
    content: `# Gradient Descent Optimization & Learning Rate Dynamics

Gradient descent is a first-order iterative optimization algorithm used to minimize the cost function $J(\\theta)$ in machine learning models.

## 1. Mathematical Update Formulation

At each step $t$, parameter vector $\\theta$ updates in the opposite direction of the loss gradient:

$$\\theta_{t+1} = \\theta_t - \\alpha \\nabla J(\\theta_t)$$

- **$\\theta$**: Model weights and bias parameters.
- **$\\alpha$**: Learning rate hyperparameter.
- **$\\nabla J(\\theta)$**: Partial derivative vector $\\left[ \\frac{\\partial J}{\\partial \\theta_0}, \\dots, \\frac{\\partial J}{\\partial \\theta_n} \\right]^T$.

## 2. Learning Rate ($\\alpha$) Behaviors

- **Too Small**: Slow convergence, requires excessive iterations, risk of getting stuck in local plateaus.
- **Too Large**: Drastic overshooting, cost diverges to $\\infty$, failure to converge.
- **Optimal Schedule**: Using learning rate decay or adaptive optimizers (Adam, RMSProp).

## 3. Key Concepts Checklist
- [x] Batch vs. Stochastic vs. Mini-batch Tradeoffs
- [x] Feature Scaling importance (Standardization prevents oblong contours)
- [ ] Momentum acceleration formulation
`,
    tags: ["Machine Learning", "Optimization", "Calculus"],
    is_pinned: true,
    word_count: 145,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "note-ml-2",
    notebook_id: "nb-ml",
    user_id: "demo-user",
    title: "Regularization: Ridge ($L_2$) vs. Lasso ($L_1$)",
    content: `# Regularization Techniques in Linear Models

Regularization prevents overfitting by penalizing large model coefficients during empirical risk minimization.

## Ridge Regression ($L_2$ Regularization)
Adds squared magnitude penalty to the loss:
$$J_{Ridge}(\\theta) = \\text{MSE}(\\theta) + \\lambda \\sum_{j=1}^n \\theta_j^2$$
- Shrinks coefficients asymptotically toward zero.
- Retains all features; computationally stable with closed-form solution $(\\mathbf{X}^T\\mathbf{X} + \\lambda \\mathbf{I})^{-1}\\mathbf{X}^T\\mathbf{y}$.

## Lasso Regression ($L_1$ Regularization)
Adds absolute value penalty:
$$J_{Lasso}(\\theta) = \\text{MSE}(\\theta) + \\lambda \\sum_{j=1}^n |\\theta_j|$$
- Enforces sparsity (sets less important feature weights exactly to 0).
- Performs automatic feature selection.
`,
    tags: ["Machine Learning", "Overfitting", "Regression"],
    is_pinned: false,
    word_count: 110,
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: "note-de-1",
    notebook_id: "nb-de",
    user_id: "demo-user",
    title: "Karnaugh Maps & SOP Minimization",
    content: `# Karnaugh Maps (K-Maps) Minimization

K-Maps provide a systematic graphical approach for simplifying Boolean algebraic expressions without applying tedious axioms.

## Core Rules:
1. Gray Code adjacency: adjacent cells must differ by only one variable bit.
2. Group sizes must be powers of 2 (1, 2, 4, 8, 16).
3. Groups should be made as large as possible to eliminate the maximum number of literal variables.
4. Don't-care conditions ($X$) can be treated as 1 if advantageous, or 0 otherwise.
`,
    tags: ["Digital Electronics", "Boolean Logic", "Hardware"],
    is_pinned: true,
    word_count: 82,
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: "note-db-1",
    notebook_id: "nb-dbms",
    user_id: "demo-user",
    title: "ACID Properties & Transaction Isolation Levels",
    content: `# ACID Properties in Relational Databases

Transactions ensure relational data integrity during concurrent executions and system failures.

## 1. Atomicity
"All or nothing". Either the entire set of operations succeeds or rolls back.

## 2. Consistency
Transforms database from one valid state to another valid state, respecting all constraints and foreign keys.

## 3. Isolation
Concurrent transactions do not interfere with each other. Isolation levels:
- Read Uncommitted (Dirty reads)
- Read Committed (No dirty reads)
- Repeatable Read (No non-repeatable reads)
- Serializable (Strictest, full snapshot serialization)

## 4. Durability
Once committed, updates survive system crashes.
`,
    tags: ["DBMS", "Transactions", "Architecture"],
    is_pinned: false,
    word_count: 105,
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
];

export const INITIAL_SOURCES: KnowledgeSource[] = [
  {
    id: "src-1",
    user_id: "demo-user",
    notebook_id: "nb-ml",
    title: "Machine Learning Unit 1 - Supervised Learning.pdf",
    source_type: "pdf",
    file_size: "2.4 MB",
    processing_status: "ready",
    extracted_text: `Unit 1: Foundations of Supervised Learning.
Supervised machine learning algorithms learn mapping functions from input attributes to target outputs using training datasets.
Linear regression minimizes mean squared error. Ridge regression incorporates L2 regularization to control model variance and multicollinearity.
Gradient descent iteratively calculates parameter partial derivatives to descend the cost surface.
Evaluating models with Mean Squared Error (MSE), Root Mean Squared Error (RMSE), and R-squared metric allows quantification of predictive accuracy.`,
    summary: {
      tldr: "Comprehensive guide to supervised learning foundations, linear models, regularization (Ridge & Lasso), and gradient descent optimization.",
      key_concepts: [
        "Supervised Learning mapping function f(X) -> y",
        "Cost Function minimization via gradient descent",
        "L2 Regularization (Ridge) prevents overfitting without zeroing weights",
        "Feature scaling importance for gradient convergence",
      ],
      important_terms: [
        { term: "Gradient Descent", definition: "First-order iterative optimization method for finding local minima of a differentiable loss function." },
        { term: "Learning Rate", definition: "Hyperparameter determining step size at each gradient descent iteration." },
        { term: "Ridge Penalty", definition: "L2 penalty term proportional to the sum of squared coefficients." },
      ],
      important_formulas: [
        "\\theta_{t+1} = \\theta_t - \\alpha \\nabla J(\\theta_t)",
        "\\text{MSE} = \\frac{1}{m} \\sum_{i=1}^m (h_\\theta(x^{(i)}) - y^{(i)})^2",
      ],
      questions_to_review: [
        "Why does feature scaling prevent oscillation in gradient descent?",
        "When is Ridge regression preferred over Lasso regression?",
        "What are the indicators of a learning rate set too high?",
      ],
    },
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: "src-2",
    user_id: "demo-user",
    notebook_id: "nb-ml",
    title: "Reinforcement Learning & Markov Decision Processes.pdf",
    source_type: "pdf",
    file_size: "3.8 MB",
    processing_status: "ready",
    extracted_text: `Reinforcement Learning involves an agent interacting with an environment to maximize cumulative reward.
Formulated as Markov Decision Process (MDP) defined by (S, A, P, R, gamma).
Bellman optimality equation decomposes value functions into immediate reward plus discounted future returns.
Q-learning is a model-free temporal difference algorithm learning the action-value function directly.`,
    summary: {
      tldr: "Introduction to Agent-Environment interactions, Markov Decision Processes (MDPs), Bellman equations, and Q-learning.",
      key_concepts: [
        "Agent, State, Action, Reward framework",
        "Markov Property: Future is independent of past given present",
        "Bellman Expectation and Optimality equations",
        "Exploration vs. Exploitation dilemma (epsilon-greedy policy)",
      ],
      important_terms: [
        { term: "MDP", definition: "5-tuple formalization of sequential decision-making under uncertainty." },
        { term: "Discount Factor (gamma)", definition: "Value in [0, 1] determining the present worth of future rewards." },
      ],
      important_formulas: [
        "Q(s, a) \\leftarrow Q(s, a) + \\alpha [r + \\gamma \\max_{a'} Q(s', a') - Q(s, a)]",
      ],
      questions_to_review: [
        "How does gamma affect the agent's time horizon preference?",
        "What distinguishes on-policy SARSA from off-policy Q-Learning?",
      ],
    },
    created_at: new Date(Date.now() - 9 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: "src-3",
    user_id: "demo-user",
    notebook_id: "nb-de",
    title: "Digital Electronics - Unit 2 Combinational Logic.pdf",
    source_type: "pdf",
    file_size: "1.9 MB",
    processing_status: "ready",
    extracted_text: `Combinational logic circuits outputs depend strictly on current inputs with no feedback loops or memory.
Decoders convert n-bit coded inputs to 2^n unique outputs.
Multiplexers (data selectors) select one of several analog or digital input signals and forward it to a single output line.
Adders: Half-adder sums two bits producing Sum and Carry. Full-adder sums three bits including carry-in.`,
    summary: {
      tldr: "Analysis and design of combinational circuits including decoders, encoders, multiplexers, and full binary adders.",
      key_concepts: [
        "Memoryless property of combinational circuits",
        "Multiplexer as universal logic generator",
        "Propagation delay and critical path analysis",
      ],
      important_terms: [
        { term: "Multiplexer", definition: "Combinational circuit selecting 1-of-N input lines to output based on select lines." },
        { term: "Half Adder", definition: "Basic circuit computing Sum (XOR) and Carry (AND) of two bits." },
      ],
      questions_to_review: [
        "How can a 4:1 multiplexer implement any 2-variable Boolean function?",
        "What is the difference between half-adder and full-adder?",
      ],
    },
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: "fc-1",
    user_id: "demo-user",
    notebook_id: "nb-ml",
    front: "What is the update rule for Gradient Descent?",
    back: "θ_{t+1} = θ_t - α ∇J(θ_t), where α is the learning rate and ∇J(θ_t) is the gradient of the loss function.",
    topic: "Optimization",
    state: "review",
    interval_days: 3,
    ease_factor: 2.5,
    reps: 2,
    due_date: new Date().toISOString().split("T")[0], // Due today
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "fc-2",
    user_id: "demo-user",
    notebook_id: "nb-ml",
    front: "How does L2 (Ridge) regularization differ from L1 (Lasso)?",
    back: "L2 penalizes squared weights (shrinks weights close to 0 but keeps all features). L1 penalizes absolute weights (drives less relevant weights exactly to 0, performing feature selection).",
    topic: "Regularization",
    state: "review",
    interval_days: 1,
    ease_factor: 2.4,
    reps: 1,
    due_date: new Date().toISOString().split("T")[0], // Due today
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "fc-3",
    user_id: "demo-user",
    notebook_id: "nb-ml",
    front: "What does the Confusion Matrix show?",
    back: "An N x N layout comparing True Positives, True Negatives, False Positives, and False Negatives to evaluate classification model accuracy, precision, and recall.",
    topic: "Evaluation",
    state: "mastered",
    interval_days: 14,
    ease_factor: 2.6,
    reps: 4,
    due_date: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "fc-4",
    user_id: "demo-user",
    notebook_id: "nb-de",
    front: "What is Gray Code in Karnaugh Maps and why is it required?",
    back: "A binary sequence where successive values differ by only 1 bit. It ensures adjacent K-map cells correspond to terms differing by a single literal, allowing algebraic cancellation.",
    topic: "Boolean Logic",
    state: "learning",
    interval_days: 1,
    ease_factor: 2.5,
    reps: 0,
    due_date: new Date().toISOString().split("T")[0], // Due today
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "fc-5",
    user_id: "demo-user",
    notebook_id: "nb-dbms",
    front: "What does the 'I' in ACID stand for, and what are the 4 standard isolation levels?",
    back: "Isolation. The 4 levels are: Read Uncommitted, Read Committed, Repeatable Read, and Serializable.",
    topic: "Transactions",
    state: "new",
    interval_days: 1,
    ease_factor: 2.5,
    reps: 0,
    due_date: new Date().toISOString().split("T")[0],
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: "quiz-ml-1",
    user_id: "demo-user",
    notebook_id: "nb-ml",
    title: "Machine Learning: Optimization & Regularization",
    topic: "Gradient Descent & Ridge Regression",
    difficulty: "Medium",
    question_count: 5,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    questions: [
      {
        id: "q1",
        question: "What occurs if the learning rate α in gradient descent is set too large?",
        options: [
          "The algorithm converges to the global minimum in fewer steps.",
          "The model overshoots the minimum and the cost function may diverge.",
          "The algorithm gets stuck in the first shallow saddle point.",
          "All weight parameters are instantly set to zero.",
        ],
        correct_index: 1,
        explanation: "An excessively large learning rate causes the updates to overshoot the valley of the cost function, often leading to divergence (loss grows to infinity).",
        source_citation: "Machine Learning Unit 1 - Supervised Learning.pdf (Page 4)",
        type: "mcq",
      },
      {
        id: "q2",
        question: "Which regularization method can perform automated feature selection by zeroing weights?",
        options: ["L2 Regularization (Ridge)", "L1 Regularization (Lasso)", "Dropout", "Early Stopping"],
        correct_index: 1,
        explanation: "Lasso (L1) uses the absolute value of coefficients as penalty, creating sharp corners on constraint boundaries where parameters are driven precisely to zero.",
        source_citation: "Machine Learning Unit 1 - Supervised Learning.pdf (Page 7)",
        type: "mcq",
      },
      {
        id: "q3",
        question: "True or False: Feature scaling (e.g. z-score standardization) helps gradient descent converge faster by rounding the loss contours.",
        options: ["True", "False"],
        correct_index: 0,
        explanation: "Unscaled features create elliptical, elongated loss contours causing oscillating, inefficient gradient steps. Scaling circles the contour for direct descent.",
        source_citation: "Machine Learning Unit 1 - Supervised Learning.pdf (Page 5)",
        type: "true_false",
      },
      {
        id: "q4",
        question: "What is the primary difference between Batch Gradient Descent and Stochastic Gradient Descent (SGD)?",
        options: [
          "Batch GD updates weights after every single sample; SGD updates after the full dataset.",
          "Batch GD computes gradients across all m training examples before updating; SGD updates after each individual example.",
          "SGD always converges to a deeper local minimum than Batch GD.",
          "Batch GD cannot be applied to linear regression models.",
        ],
        correct_index: 1,
        explanation: "Batch GD calculates the gradient vector over all m training examples per step, while SGD updates parameters after calculating the loss on a single random example.",
        source_citation: "Machine Learning Unit 1 - Supervised Learning.pdf (Page 6)",
        type: "mcq",
      },
      {
        id: "q5",
        question: "In a binary classification problem, which metric measures the proportion of actual positive cases that were correctly identified?",
        options: ["Precision", "Recall (Sensitivity)", "Specificity", "F1-Score"],
        correct_index: 1,
        explanation: "Recall = True Positives / (True Positives + False Negatives). It quantifies the model's ability to locate all relevant positive instances.",
        source_citation: "Machine Learning Unit 1 - Supervised Learning.pdf (Page 11)",
        type: "mcq",
      },
    ],
  },
];

export const INITIAL_EXAM_PLANS: ExamPlan[] = [
  {
    id: "ep-1",
    user_id: "demo-user",
    subject_name: "Machine Learning",
    exam_date: new Date(Date.now() + 12 * 86400000).toISOString().split("T")[0],
    confidence_level: "Medium",
    target_score: 90,
    status: "active",
    topics: [
      { id: "t1", name: "Supervised Learning Fundamentals", completed: true, weak: false },
      { id: "t2", name: "Linear & Ridge Regression", completed: true, weak: false },
      { id: "t3", name: "Gradient Descent Optimization", completed: false, weak: true },
      { id: "t4", name: "Logistic Regression & Classification", completed: true, weak: false },
      { id: "t5", name: "Support Vector Machines (SVM)", completed: false, weak: false },
      { id: "t6", name: "Decision Trees & Random Forests", completed: false, weak: false },
      { id: "t7", name: "Model Evaluation & Confusion Matrix", completed: true, weak: false },
      { id: "t8", name: "Neural Networks & Backpropagation", completed: false, weak: true },
    ],
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "ep-2",
    user_id: "demo-user",
    subject_name: "Digital Electronics",
    exam_date: new Date(Date.now() + 21 * 86400000).toISOString().split("T")[0],
    confidence_level: "High",
    target_score: 88,
    status: "active",
    topics: [
      { id: "de-1", name: "Number Systems & Binary Codes", completed: true, weak: false },
      { id: "de-2", name: "Boolean Algebra & Logic Gates", completed: true, weak: false },
      { id: "de-3", name: "Karnaugh Maps & SOP Minimization", completed: true, weak: false },
      { id: "de-4", name: "Multiplexers & Decoders", completed: false, weak: true },
      { id: "de-5", name: "Flip Flops (SR, JK, D, T)", completed: false, weak: false },
      { id: "de-6", name: "Counters & Shift Registers", completed: false, weak: false },
    ],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const INITIAL_RESOURCES: StudentResource[] = [
  {
    id: "res-1",
    user_id: "demo-user",
    title: "Pattern Recognition and Machine Learning (Bishop) - Summary",
    category: "Books",
    url: "https://www.microsoft.com/en-us/research/people/cmbishop/prml-book/",
    description: "Standard graduate-level reference for probabilistic machine learning and Bayesian formulation.",
    tags: ["ML", "Reference", "Textbook"],
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "res-2",
    user_id: "demo-user",
    title: "Semester 1 Mid-Term Examination - Previous Year Paper 2025",
    category: "Question Papers",
    url: "#",
    description: "Previous mid-term paper covering Linear Models, Regularization, and Optimization proofs.",
    tags: ["ML", "Previous Papers", "Semester 1"],
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: "res-3",
    user_id: "demo-user",
    title: "Digital Logic Design Cheatsheet & Circuit Pinouts",
    category: "Documents",
    url: "#",
    description: "IC 7400 series pinouts, universal gate mappings, and boolean reduction identities.",
    tags: ["Digital Electronics", "Cheatsheet"],
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

// ==============================================================================
// 1. NOTEBOOK OPERATIONS
// ==============================================================================

export async function getNotebooks(userId: string): Promise<Notebook[]> {
  try {
    const { data, error } = await supabase
      .from("notebooks")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch {
    // Fallback to local
  }
  const local = getLocal<Notebook[]>("notebooks", INITIAL_NOTEBOOKS);
  return local;
}

export async function createNotebook(
  userId: string,
  title: string,
  description?: string,
  icon = "📓",
  color = "#2563EB"
): Promise<Notebook> {
  const newNb: Notebook = {
    id: `nb-${Date.now()}`,
    user_id: userId,
    title,
    description: description || null,
    icon,
    color,
    is_favorite: false,
    notes_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("notebooks")
      .insert([
        {
          user_id: userId,
          title,
          description,
          icon,
          color,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      return data;
    }
  } catch {
    // Fallback to local
  }

  const existing = getLocal<Notebook[]>("notebooks", INITIAL_NOTEBOOKS);
  const updated = [newNb, ...existing];
  setLocal("notebooks", updated);
  return newNb;
}

export async function updateNotebook(
  id: string,
  updates: Partial<Notebook>
): Promise<Notebook> {
  try {
    const { data, error } = await supabase
      .from("notebooks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (!error && data) return data;
  } catch {
    // Local fallback
  }

  const existing = getLocal<Notebook[]>("notebooks", INITIAL_NOTEBOOKS);
  const updated = existing.map((nb) => (nb.id === id ? { ...nb, ...updates, updated_at: new Date().toISOString() } : nb));
  setLocal("notebooks", updated);
  return updated.find((nb) => nb.id === id)!;
}

export async function deleteNotebook(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("notebooks").delete().eq("id", id);
    if (!error) {
      // Also delete notes
      await supabase.from("notes").delete().eq("notebook_id", id);
    }
  } catch {
    // Local fallback
  }

  const existing = getLocal<Notebook[]>("notebooks", INITIAL_NOTEBOOKS);
  setLocal("notebooks", existing.filter((nb) => nb.id !== id));

  const notes = getLocal<Note[]>("notes", INITIAL_NOTES);
  setLocal("notes", notes.filter((n) => n.notebook_id !== id));
  return true;
}

// ==============================================================================
// 2. NOTE OPERATIONS
// ==============================================================================

export async function getNotes(notebookId?: string, userId?: string): Promise<Note[]> {
  try {
    let query = supabase.from("notes").select("*");
    if (notebookId) query = query.eq("notebook_id", notebookId);
    if (userId) query = query.eq("user_id", userId);

    const { data, error } = await query.order("is_pinned", { ascending: false }).order("updated_at", { ascending: false });
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch {
    // Local fallback
  }

  const allNotes = getLocal<Note[]>("notes", INITIAL_NOTES);
  let filtered = allNotes;
  if (notebookId) filtered = filtered.filter((n) => n.notebook_id === notebookId);
  return filtered.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
}

export async function getNote(id: string): Promise<Note | null> {
  try {
    const { data, error } = await supabase.from("notes").select("*").eq("id", id).maybeSingle();
    if (!error && data) return data;
  } catch {
    // Local fallback
  }

  const allNotes = getLocal<Note[]>("notes", INITIAL_NOTES);
  return allNotes.find((n) => n.id === id) || null;
}

export async function createNote(
  userId: string,
  notebookId: string,
  title = "Untitled Note",
  content = "",
  tags: string[] = []
): Promise<Note> {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const newNote: Note = {
    id: `note-${Date.now()}`,
    notebook_id: notebookId,
    user_id: userId,
    title,
    content,
    tags,
    is_pinned: false,
    word_count: wordCount,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("notes")
      .insert([
        {
          notebook_id: notebookId,
          user_id: userId,
          title,
          content,
          tags,
          word_count: wordCount,
        },
      ])
      .select()
      .single();

    if (!error && data) return data;
  } catch {
    // Fallback
  }

  const existing = getLocal<Note[]>("notes", INITIAL_NOTES);
  setLocal("notes", [newNote, ...existing]);
  return newNote;
}

export async function updateNote(id: string, updates: Partial<Note>): Promise<Note> {
  const wordCount = updates.content !== undefined ? updates.content.trim().split(/\s+/).filter(Boolean).length : undefined;
  const payload = {
    ...updates,
    ...(wordCount !== undefined ? { word_count: wordCount } : {}),
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("notes")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (!error && data) return data;
  } catch {
    // Fallback
  }

  const existing = getLocal<Note[]>("notes", INITIAL_NOTES);
  const updated = existing.map((n) => (n.id === id ? { ...n, ...payload } : n));
  setLocal("notes", updated);
  return updated.find((n) => n.id === id)!;
}

export async function deleteNote(id: string): Promise<boolean> {
  try {
    await supabase.from("notes").delete().eq("id", id);
  } catch {
    // Fallback
  }

  const existing = getLocal<Note[]>("notes", INITIAL_NOTES);
  setLocal("notes", existing.filter((n) => n.id !== id));
  return true;
}

// ==============================================================================
// 3. KNOWLEDGE BASE & SOURCE OPERATIONS
// ==============================================================================

export async function getSources(userId: string): Promise<KnowledgeSource[]> {
  try {
    const { data, error } = await supabase
      .from("knowledge_sources")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) return data;
  } catch {
    // Fallback
  }

  return getLocal<KnowledgeSource[]>("sources", INITIAL_SOURCES);
}

export async function createSource(
  userId: string,
  title: string,
  sourceType: KnowledgeSource["source_type"],
  fileSize?: string,
  url?: string,
  extractedText?: string
): Promise<KnowledgeSource> {
  const newSrc: KnowledgeSource = {
    id: `src-${Date.now()}`,
    user_id: userId,
    title,
    source_type: sourceType,
    file_size: fileSize || "1.2 MB",
    url: url || null,
    processing_status: "ready",
    extracted_text: extractedText || `Extracted content for ${title}. Contains academic course materials and reference notes for grounded AI learning.`,
    summary: {
      tldr: `Comprehensive source document covering ${title}. Extracted and indexed for AI learning.`,
      key_concepts: [`Overview of ${title}`, "Foundational principles", "Key exam definitions"],
      important_terms: [{ term: title.split(".")[0], definition: "Primary subject topic referenced in student knowledge base." }],
      questions_to_review: ["What are the primary concepts introduced in this document?"],
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("knowledge_sources")
      .insert([
        {
          user_id: userId,
          title,
          source_type: sourceType,
          file_size: fileSize,
          url,
          processing_status: "ready",
          extracted_text: newSrc.extracted_text,
          summary: newSrc.summary,
        },
      ])
      .select()
      .single();

    if (!error && data) return data;
  } catch {
    // Fallback
  }

  const existing = getLocal<KnowledgeSource[]>("sources", INITIAL_SOURCES);
  const updated = [newSrc, ...existing];
  setLocal("sources", updated);
  return newSrc;
}

export async function updateSourceStatus(
  id: string,
  status: ProcessingStatus,
  extractedText?: string,
  summary?: AISummary
): Promise<KnowledgeSource | null> {
  try {
    const { data, error } = await supabase
      .from("knowledge_sources")
      .update({
        processing_status: status,
        ...(extractedText ? { extracted_text: extractedText } : {}),
        ...(summary ? { summary } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (!error && data) return data;
  } catch {
    // Fallback
  }

  const existing = getLocal<KnowledgeSource[]>("sources", INITIAL_SOURCES);
  const updated = existing.map((s) =>
    s.id === id
      ? {
          ...s,
          processing_status: status,
          ...(extractedText ? { extracted_text: extractedText } : {}),
          ...(summary ? { summary } : {}),
          updated_at: new Date().toISOString(),
        }
      : s
  );
  setLocal("sources", updated);
  return updated.find((s) => s.id === id) || null;
}

export async function deleteSource(id: string): Promise<boolean> {
  try {
    await supabase.from("knowledge_sources").delete().eq("id", id);
  } catch {
    // Fallback
  }

  const existing = getLocal<KnowledgeSource[]>("sources", INITIAL_SOURCES);
  setLocal("sources", existing.filter((s) => s.id !== id));
  return true;
}

// ==============================================================================
// 4. FLASHCARDS & SPACED REPETITION ENGINE (SuperMemo-2 / Leitner Algorithm)
// ==============================================================================

/**
 * Calculates new interval, repetition count, and ease factor based on rating.
 * Rating:
 * - 'hard': resets reps, interval = 1 day, drops ease factor by 0.15
 * - 'review': advances interval by * 1.5, minor ease penalty
 * - 'know': advances interval by easeFactor * reps, increases ease factor
 */
export function calculateNextReview(
  card: Flashcard,
  rating: FlashcardRating
): {
  state: Flashcard["state"];
  interval_days: number;
  ease_factor: number;
  reps: number;
  due_date: string;
} {
  const result = sm2CalculateNextReview(card, rating);
  return {
    state: result.state,
    interval_days: result.interval_days,
    ease_factor: result.ease_factor,
    reps: result.reps,
    due_date: result.due_date,
  };
}

export async function getFlashcards(userId: string, notebookId?: string): Promise<Flashcard[]> {
  try {
    let query = supabase.from("flashcards").select("*").eq("user_id", userId);
    if (notebookId) query = query.eq("notebook_id", notebookId);

    const { data, error } = await query.order("due_date", { ascending: true });
    if (!error && data && data.length > 0) return data;
  } catch {
    // Fallback
  }

  const all = getLocal<Flashcard[]>("flashcards", INITIAL_FLASHCARDS);
  if (notebookId) return all.filter((c) => c.notebook_id === notebookId);
  return all;
}

export async function createFlashcard(
  userId: string,
  front: string,
  back: string,
  topic = "General",
  notebookId?: string
): Promise<Flashcard> {
  const newCard: Flashcard = {
    id: `fc-${Date.now()}`,
    user_id: userId,
    notebook_id: notebookId || null,
    front,
    back,
    topic,
    state: "new",
    interval_days: 1,
    ease_factor: 2.5,
    reps: 0,
    due_date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("flashcards")
      .insert([
        {
          user_id: userId,
          notebook_id: notebookId,
          front,
          back,
          topic,
          state: "new",
          interval_days: 1,
          ease_factor: 2.5,
          reps: 0,
          due_date: newCard.due_date,
        },
      ])
      .select()
      .single();

    if (!error && data) return data;
  } catch {
    // Fallback
  }

  const existing = getLocal<Flashcard[]>("flashcards", INITIAL_FLASHCARDS);
  const updated = [newCard, ...existing];
  setLocal("flashcards", updated);
  return newCard;
}

export async function reviewFlashcard(
  cardId: string,
  rating: FlashcardRating
): Promise<Flashcard> {
  const existing = getLocal<Flashcard[]>("flashcards", INITIAL_FLASHCARDS);
  const card = existing.find((c) => c.id === cardId);
  if (!card) throw new Error("Card not found");

  const updates = calculateNextReview(card, rating);
  const updatedCard = {
    ...card,
    ...updates,
    last_reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    await supabase
      .from("flashcards")
      .update({
        ...updates,
        last_reviewed_at: updatedCard.last_reviewed_at,
        updated_at: updatedCard.updated_at,
      })
      .eq("id", cardId);
  } catch {
    // Fallback
  }

  const nextList = existing.map((c) => (c.id === cardId ? updatedCard : c));
  setLocal("flashcards", nextList);
  return updatedCard;
}

export async function deleteFlashcard(cardId: string): Promise<boolean> {
  try {
    await supabase.from("flashcards").delete().eq("id", cardId);
  } catch {
    // Fallback
  }

  const existing = getLocal<Flashcard[]>("flashcards", INITIAL_FLASHCARDS);
  setLocal("flashcards", existing.filter((c) => c.id !== cardId));
  return true;
}

// ==============================================================================
// 5. PRACTICE LAB & QUIZ OPERATIONS
// ==============================================================================

export async function getQuizzes(userId: string): Promise<Quiz[]> {
  try {
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) return data;
  } catch {
    // Fallback
  }

  return getLocal<Quiz[]>("quizzes", INITIAL_QUIZZES);
}

export async function getQuiz(id: string): Promise<Quiz | null> {
  try {
    const { data, error } = await supabase.from("quizzes").select("*").eq("id", id).maybeSingle();
    if (!error && data) return data;
  } catch {
    // Fallback
  }

  const all = getLocal<Quiz[]>("quizzes", INITIAL_QUIZZES);
  return all.find((q) => q.id === id) || null;
}

export async function createQuiz(quiz: Omit<Quiz, "id" | "created_at">): Promise<Quiz> {
  const newQuiz: Quiz = {
    ...quiz,
    id: `quiz-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from("quizzes").insert([quiz]).select().single();
    if (!error && data) return data;
  } catch {
    // Fallback
  }

  const existing = getLocal<Quiz[]>("quizzes", INITIAL_QUIZZES);
  setLocal("quizzes", [newQuiz, ...existing]);
  return newQuiz;
}

export async function recordQuizAttempt(attempt: Omit<QuizAttempt, "id" | "created_at">): Promise<QuizAttempt> {
  const newAttempt: QuizAttempt = {
    ...attempt,
    id: `attempt-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from("quiz_attempts").insert([attempt]).select().single();
    if (!error && data) return data;
  } catch {
    // Fallback
  }

  const existing = getLocal<QuizAttempt[]>("quiz_attempts", []);
  setLocal("quiz_attempts", [newAttempt, ...existing]);
  return newAttempt;
}

export async function getQuizAttempts(userId: string): Promise<QuizAttempt[]> {
  try {
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && data) return data;
  } catch {
    // Fallback
  }

  return getLocal<QuizAttempt[]>("quiz_attempts", []);
}

// ==============================================================================
// 6. EXAM PREPARATION CENTER
// ==============================================================================

export async function getExamPlans(userId: string): Promise<ExamPlan[]> {
  try {
    const { data, error } = await supabase
      .from("exam_plans")
      .select("*")
      .eq("user_id", userId)
      .order("exam_date", { ascending: true });

    if (!error && data && data.length > 0) return data;
  } catch {
    // Fallback
  }

  return getLocal<ExamPlan[]>("exam_plans", INITIAL_EXAM_PLANS);
}

export async function createExamPlan(plan: Omit<ExamPlan, "id" | "created_at" | "updated_at">): Promise<ExamPlan> {
  const newPlan: ExamPlan = {
    ...plan,
    id: `ep-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from("exam_plans").insert([plan]).select().single();
    if (!error && data) return data;
  } catch {
    // Fallback
  }

  const existing = getLocal<ExamPlan[]>("exam_plans", INITIAL_EXAM_PLANS);
  setLocal("exam_plans", [newPlan, ...existing]);
  return newPlan;
}

export async function updateExamPlan(id: string, updates: Partial<ExamPlan>): Promise<ExamPlan> {
  try {
    const { data, error } = await supabase
      .from("exam_plans")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (!error && data) return data;
  } catch {
    // Fallback
  }

  const existing = getLocal<ExamPlan[]>("exam_plans", INITIAL_EXAM_PLANS);
  const updated = existing.map((p) => (p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p));
  setLocal("exam_plans", updated);
  return updated.find((p) => p.id === id)!;
}

export async function deleteExamPlan(id: string): Promise<boolean> {
  try {
    await supabase.from("exam_plans").delete().eq("id", id);
  } catch {
    // Fallback
  }

  const existing = getLocal<ExamPlan[]>("exam_plans", INITIAL_EXAM_PLANS);
  setLocal("exam_plans", existing.filter((p) => p.id !== id));
  return true;
}

// ==============================================================================
// 7. STUDENT RESOURCES
// ==============================================================================

export async function getStudentResources(userId: string, category?: string): Promise<StudentResource[]> {
  try {
    let query = supabase.from("student_resources").select("*").eq("user_id", userId);
    if (category && category !== "All") query = query.eq("category", category);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch {
    // Fallback
  }

  const all = getLocal<StudentResource[]>("student_resources", INITIAL_RESOURCES);
  if (category && category !== "All") return all.filter((r) => r.category === category);
  return all;
}

export async function createStudentResource(resource: Omit<StudentResource, "id" | "created_at">): Promise<StudentResource> {
  const newRes: StudentResource = {
    ...resource,
    id: `res-${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase.from("student_resources").insert([resource]).select().single();
    if (!error && data) return data;
  } catch {
    // Fallback
  }

  const existing = getLocal<StudentResource[]>("student_resources", INITIAL_RESOURCES);
  setLocal("student_resources", [newRes, ...existing]);
  return newRes;
}

export async function deleteStudentResource(id: string): Promise<boolean> {
  try {
    await supabase.from("student_resources").delete().eq("id", id);
  } catch {
    // Fallback
  }

  const existing = getLocal<StudentResource[]>("student_resources", INITIAL_RESOURCES);
  setLocal("student_resources", existing.filter((r) => r.id !== id));
  return true;
}

// ==============================================================================
// 8. TODAY'S LEARNING AGGREGATE
// ==============================================================================

export interface TodayLearningAggregate {
  dueFlashcardsCount: number;
  totalFlashcardsCount: number;
  activeNotebooksCount: number;
  totalNotesCount: number;
  activeSourcesCount: number;
  upcomingExam: {
    subject: string;
    daysRemaining: number;
    completedTopics: number;
    totalTopics: number;
  } | null;
  recommendedTopic: {
    subject: string;
    topic: string;
    reason: string;
  } | null;
}

export async function getTodayLearningAggregate(userId: string): Promise<TodayLearningAggregate> {
  const todayStr = new Date().toISOString().split("T")[0];

  const [cards, notebooks, notes, sources, exams, attempts] = await Promise.all([
    getFlashcards(userId),
    getNotebooks(userId),
    getNotes(undefined, userId),
    getSources(userId),
    getExamPlans(userId),
    getQuizAttempts(userId),
  ]);

  const dueCards = cards.filter((c) => c.due_date <= todayStr);

  // Find nearest upcoming exam
  const activeExams = exams.filter((e) => e.status === "active" && e.exam_date >= todayStr);
  let upcomingExam: TodayLearningAggregate["upcomingExam"] = null;

  if (activeExams.length > 0) {
    const sorted = [...activeExams].sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime());
    const next = sorted[0];
    const diffDays = Math.max(0, Math.ceil((new Date(next.exam_date).getTime() - new Date().getTime()) / 86400000));
    const completed = next.topics.filter((t) => t.completed).length;
    upcomingExam = {
      subject: next.subject_name,
      daysRemaining: diffDays,
      completedTopics: completed,
      totalTopics: next.topics.length,
    };
  }

  // Detect weak topic from quiz attempts or exam plan flags
  let recommendedTopic: TodayLearningAggregate["recommendedTopic"] = null;
  const recentWeak = attempts.flatMap((a) => a.weak_topics).filter(Boolean);

  if (recentWeak.length > 0) {
    recommendedTopic = {
      subject: "Machine Learning",
      topic: recentWeak[0],
      reason: `LearnTrack detected lower quiz performance in ${recentWeak[0]}`,
    };
  } else if (upcomingExam) {
    const weakFromPlan = exams.find((e) => e.subject_name === upcomingExam?.subject)?.topics.find((t) => t.weak || !t.completed);
    if (weakFromPlan) {
      recommendedTopic = {
        subject: upcomingExam.subject,
        topic: weakFromPlan.name,
        reason: `Targeted review for upcoming ${upcomingExam.subject} exam`,
      };
    }
  }

  if (!recommendedTopic) {
    recommendedTopic = {
      subject: "Machine Learning",
      topic: "Gradient Descent Optimization",
      reason: "Suggested core concept revision based on your syllabus trajectory",
    };
  }

  return {
    dueFlashcardsCount: dueCards.length,
    totalFlashcardsCount: cards.length,
    activeNotebooksCount: notebooks.length,
    totalNotesCount: notes.length,
    activeSourcesCount: sources.length,
    upcomingExam,
    recommendedTopic,
  };
}

export async function getWeakTopics(userId: string): Promise<string[]> {
  try {
    const aggregate = await getTodayLearningAggregate(userId);
    if (aggregate.recommendedTopic?.topic) {
      return [aggregate.recommendedTopic.topic];
    }
  } catch {
    // Fallback
  }
  const attempts = await getQuizAttempts(userId);
  const weak = attempts.flatMap((a) => a.weak_topics).filter(Boolean);
  if (weak.length > 0) {
    return Array.from(new Set(weak));
  }
  return ["Gradient Descent Optimization"];
}

export async function getStudyGuides(userId: string): Promise<StudyGuide[]> {
  const all = getLocal<StudyGuide[]>("study_guides", []);
  return all.filter((g) => g.user_id === userId);
}

export async function saveStudyGuide(userId: string, guide: Omit<StudyGuide, "id" | "created_at">): Promise<StudyGuide> {
  const newGuide: StudyGuide = {
    ...guide,
    id: `guide-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  const existing = getLocal<StudyGuide[]>("study_guides", []);
  setLocal("study_guides", [newGuide, ...existing]);
  return newGuide;
}

export const learningService = {
  getNotebooks,
  createNotebook,
  updateNotebook,
  deleteNotebook,
  getNotes,
  getNote,
  getNoteById: getNote,
  createNote,
  updateNote,
  deleteNote,
  getSources,
  getKnowledgeSources: getSources,
  createSource,
  updateSourceStatus,
  deleteSource,
  getFlashcards,
  createFlashcard,
  reviewFlashcard,
  deleteFlashcard,
  getQuizzes,
  createQuiz,
  recordQuizAttempt,
  getQuizAttempts,
  getExamPlans,
  createExamPlan,
  updateExamPlan,
  deleteExamPlan,
  getStudyGuides,
  saveStudyGuide,
  getResources: getStudentResources,
  getStudentResources,
  createResource: createStudentResource,
  deleteResource: deleteStudentResource,
  getTodayLearningAggregate,
  getWeakTopics,
  calculateNextReview,
};

