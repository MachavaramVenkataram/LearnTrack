/**
 * LearnTrack Local Academic Intelligence Provider
 * Context-aware, deterministic academic intelligence engine.
 * Runs locally without external API dependencies or when remote LLMs are offline.
 * Implements strict non-causal language and academic structuring.
 */

import {
  StudentAIContext,
  StudyPlanGenerationInput,
  GeneratedStudyPlanOutput,
  GeneratedDayPlan,
} from "@/types/academic";
import { AIProvider, ChatMessage, ChatResult } from "./base";

export class LocalEngineProvider implements AIProvider {
  name = "learntrack-local-engine";

  async chat(
    messages: ChatMessage[],
    context?: StudentAIContext
  ): Promise<ChatResult> {
    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === "user")?.content || "";
    const lower = lastUserMessage.toLowerCase();

    // 1. General Educational Concept Explanations
    if (lower.includes("supervised learning")) {
      return {
        model: "learntrack-academic-v1",
        content: `### Supervised Learning in Machine Learning

**Supervised learning** is a category of machine learning where algorithms are trained on labeled datasets. Each training instance consists of an input feature vector $X$ and a corresponding ground-truth target label $y$.

#### Key Principles:
1. **Mathematical Objective**: The algorithm seeks to learn a mapping function $f: X \\to y$ that minimizes an empirical loss function $L(f(X), y)$.
2. **Main Subtypes**:
   - **Regression**: The target $y$ is continuous (e.g., predicting a student's final exam percentage based on internal marks and attendance, like LearnTrack's Ridge model).
   - **Classification**: The target $y$ is discrete/categorical (e.g., classifying a student into Risk tiers: *Low*, *Medium*, or *High*).

#### Common Algorithms:
- **Linear & Regularized Regression** (OLS, Ridge, Lasso)
- **Support Vector Machines** (SVM)
- **Decision Trees & Ensembles** (Random Forest, Gradient Boosting, XGBoost)
- **Neural Networks**

*Note: In LearnTrack, your academic performance projection utilizes regularized Ridge regression to prevent overfitting.*`,
      };
    }

    if (lower.includes("gradient descent")) {
      return {
        model: "learntrack-academic-v1",
        content: `### Gradient Descent Optimization

**Gradient descent** is a fundamental first-order iterative optimization algorithm used to find the local minimum of a differentiable objective function (loss function).

#### Mathematical Formulation:
At each iteration $t$, the model weights $\\theta$ are updated in the direction opposite to the gradient of the loss function $\\nabla J(\\theta)$:

$$\\theta_{t+1} = \\theta_t - \\alpha \\nabla J(\\theta_t)$$

Where:
- $\\theta$: Model parameters (weights and biases).
- $\\alpha$: Learning rate (step size hyperparameter).
- $\\nabla J(\\theta)$: Gradient vector of partial derivatives $\\left[\\frac{\\partial J}{\\partial \\theta_1}, \\dots, \\frac{\\partial J}{\\partial \\theta_n}\\right]$.

#### Variants:
1. **Batch Gradient Descent**: Computes the gradient over the entire dataset before each update (stable but slow on large datasets).
2. **Stochastic Gradient Descent (SGD)**: Updates weights per individual sample (fast, high variance).
3. **Mini-batch Gradient Descent**: Balances stability and computational efficiency by computing gradients over small subsets (e.g., 32, 64, or 128 samples).`,
      };
    }

    if (lower.includes("confusion matrix")) {
      return {
        model: "learntrack-academic-v1",
        content: `### Understanding the Confusion Matrix

A **confusion matrix** is a structured $N \\times N$ layout used to evaluate the performance of a classification model, where $N$ is the number of target classes.

#### Binary Classification Layout:
| | Predicted Positive | Predicted Negative |
|---|---|---|
| **Actual Positive** | **True Positive (TP)** | **False Negative (FN)** |
| **Actual Negative** | **False Positive (FP)** | **True Negative (TN)** |

#### Derived Performance Metrics:
- **Accuracy**: $\\frac{TP + TN}{TP + TN + FP + FN}$ (Overall proportion of correct classifications).
- **Precision**: $\\frac{TP}{TP + FP}$ (Of all predicted positives, how many were truly positive?).
- **Recall (Sensitivity)**: $\\frac{TP}{TP + FN}$ (Of all actual positives, how many did the model identify?).
- **F1-Score**: $2 \\times \\frac{\\text{Precision} \\times \\text{Recall}}{\\text{Precision} + \\text{Recall}}$ (Harmonic mean of precision and recall).

*In academic risk identification, high Recall is often prioritized so students in need of academic support are not missed (minimizing False Negatives).*`,
      };
    }

    if (lower.includes("reinforcement learning")) {
      return {
        model: "learntrack-academic-v1",
        content: `### Reinforcement Learning (RL)

**Reinforcement Learning** is a computational framework where an autonomous **agent** learns to make a sequence of decisions by interacting with an uncertain **environment** to maximize cumulative numerical reward.

#### Core Components (Markov Decision Process):
1. **State ($S$)**: The current configuration or snapshot of the environment.
2. **Action ($A$)**: Set of possible decisions the agent can execute in state $S$.
3. **Transition Probability ($P$)**: Likelihood of transitioning to state $S'$ after taking action $A$.
4. **Reward ($R$)**: Immediate scalar feedback signal returned from the environment.
5. **Policy ($\\pi$)**: The agent's strategy mapping states to actions: $\\pi(a|s)$.

Unlike supervised learning, there are no explicit correct labels—the agent learns through exploration and exploitation.`,
      };
    }

    // 2. Personalized Context-Aware Responses
    if (context) {
      const avgScore = context.academic.average_score;
      const attendance = context.academic.average_attendance;
      const studyH = context.study.total_hours;
      const subjects = context.academic.subjects;
      const pred = context.prediction;

      // Find lowest and highest scoring subjects
      const validSubjects = subjects.filter((s) => s.score !== null && s.score !== undefined);
      const lowestSubject = validSubjects.length > 0
        ? [...validSubjects].sort((a, b) => (a.score || 0) - (b.score || 0))[0]
        : null;
      const highestSubject = validSubjects.length > 0
        ? [...validSubjects].sort((a, b) => (b.score || 0) - (a.score || 0))[0]
        : null;

      if (lower.includes("how am i performing") || lower.includes("performance this semester") || lower.includes("overview")) {
        return {
          model: "learntrack-academic-v1",
          content: `### Performance Summary for ${context.studentName || "Current Semester"}

### Observation
Based on your current recorded data in LearnTrack:
- **Coursework Average**: ${avgScore !== null ? `${avgScore.toFixed(1)}%` : "No coursework evaluations recorded"} across ${context.academic.total_records} logged evaluations.
- **Overall Attendance**: ${attendance !== null ? `${attendance.toFixed(1)}%` : "No attendance logs"} (institutional threshold is typically 75%).
- **Logged Study Time**: ${studyH.toFixed(1)} hours of focused activity recorded.
- **Model Projection**: ${pred ? `Estimated score of **${pred.predicted_score.toFixed(1)} pts** (Grade ${pred.predicted_grade}, ${pred.risk_level} Risk indicator)` : "No active prediction computed yet"}.
${highestSubject ? `- **Strongest Area**: ${highestSubject.name} with an evaluation score of ${highestSubject.score}%.` : ""}
${lowestSubject ? `- **Attention Area**: ${lowestSubject.name} currently recorded at ${lowestSubject.score}%.` : ""}

### Why It Matters
${attendance !== null && attendance < 75 ? "Your recorded attendance is currently below the 75% institutional eligibility threshold. In our predictive model, attendance carries significant weight in stabilizing baseline performance projections." : "Maintaining your attendance above institutional thresholds keeps you in good standing and provides a reliable baseline for cumulative semester evaluations."}

### Suggested Action
1. **Targeted Practice**: Allocate dedicated study blocks to ${lowestSubject?.name || "your upcoming coursework modules"}.
2. **Attendance Cadence**: ${attendance !== null && attendance < 75 ? "Prioritize attending the next consecutive lectures to lift your attendance percentage above 75%." : "Maintain your consistent lecture attendance."}
3. **Structured Schedule**: Open the **Study Planner** to generate a week-long revision timetable balanced around your available daily hours.`,
        };
      }

      if (lower.includes("what should i focus on") || lower.includes("focus on improving") || lower.includes("which subjects need")) {
        const targetSub = lowestSubject || (subjects.length > 0 ? subjects[0] : null);
        const subName = targetSub ? targetSub.name : "your foundational subjects";
        const subScore = targetSub && targetSub.score !== null ? `${targetSub.score}%` : "evaluation pending";

        return {
          model: "learntrack-academic-v1",
          content: `### Academic Focus Recommendations

### Observation
An examination of your recorded coursework indicates that **${subName}** has your lowest recorded evaluation at **${subScore}**${avgScore !== null && targetSub?.score ? ` (${(avgScore - targetSub.score).toFixed(1)} points below your overall average of ${avgScore.toFixed(1)}%)` : ""}.
${attendance !== null && attendance < 75 ? `Additionally, your attendance rate is currently **${attendance.toFixed(1)}%**, which is below the recommended 75% benchmark.` : ""}

### Why It Matters
In cumulative university grading, performance deficits in specific subjects carry high downward leverage on your cumulative GPA. In our predictive model, internal assessment scores and consistent attendance exhibit strong positive associations with overall final marks.

### Suggested Action
1. **Focused Review**: Allocate two 60-minute revision sessions this week specifically to core concepts and practice exercises in **${subName}**.
2. **Review Missed Topics**: Review previous coursework rubrics to identify whether theory questions or numerical/code problems were where marks were lost.
3. **Simulation Check**: Visit the **What-If Simulator** to test how lifting your internal marks in ${subName} affects your overall projected score.`,
        };
      }

      if (lower.includes("predicted performance") || lower.includes("prediction changed") || lower.includes("why did learntrack predict")) {
        const topFactor = pred?.key_factors && pred.key_factors.length > 0 ? pred.key_factors[0] : null;

        return {
          model: "learntrack-academic-v1",
          content: `### Model Performance Attribution Analysis

### Observation
The LearnTrack predictive engine currently estimates your final academic score at **${pred ? `${pred.predicted_score.toFixed(1)} pts` : "—"}** (Grade ${pred ? pred.predicted_grade : "—"}, ${pred ? pred.risk_level : "—"} Risk).
${topFactor ? `The model identified **${topFactor.label}** as having the primary influence (${topFactor.impact > 0 ? `+${topFactor.impact.toFixed(1)}` : topFactor.impact.toFixed(1)} points) on your prediction.` : ""}

### Why It Matters
LearnTrack uses regularized Ridge regression trained on empirical academic benchmark cohorts. The model computes Shapley (SHAP) attributions to explain how each feature adjusts your estimate relative to the cohort baseline anchor of ~71.4 points.

### Suggested Action
1. **Inspect Attributions**: Check the SHAP chart on the **Insights** page to see the exact direction (positive vs downward) of each metric.
2. **Simulate Scenarios**: Launch the **What-If Simulator** to evaluate how prospective changes in attendance or internal assessment marks modify the projection.`,
        };
      }

      if (lower.includes("prepare for my upcoming exams") || lower.includes("exam prep") || lower.includes("study plan")) {
        return {
          model: "learntrack-academic-v1",
          content: `### Exam Preparation Strategy

### Observation
Your current academic record reflects ${subjects.length} enrolled subjects with an average evaluation of ${avgScore !== null ? `${avgScore.toFixed(1)}%` : "in progress"} and ${studyH.toFixed(1)} total focused study hours logged.

### Why It Matters
Cognitive psychology research shows that **distributed practice** (spaced repetition) and **active retrieval practice** produce significantly higher exam retention than massed cramming or passive re-reading.

### Suggested Action
1. **Spaced Scheduling**: Head over to the **Study Plan** tab to generate a structured timeline that balances your subjects over 1 to 2 weeks without exceeding your available daily hours.
2. **Active Recall**: Convert lecture summaries into quick flash-quizzes or practice problem sets rather than passive highlighting.
3. **Prioritize Weak Links**: Schedule your first morning study session each day on your lowest-confidence topics when cognitive focus is highest.`,
        };
      }
    }

    // Default Fallback Response
    return {
      model: "learntrack-academic-v1",
      content: `### LearnTrack Academic Assistant

### Observation
I have reviewed your inquiry regarding: *" ${lastUserMessage} "*.
${context && context.academic.subjects.length > 0 ? `Your academic profile is connected with ${context.academic.subjects.length} registered subjects (average score: ${context.academic.average_score !== null ? `${context.academic.average_score.toFixed(1)}%` : "in progress"}).` : "You are currently exploring LearnTrack's academic intelligence tools."}

### Why It Matters
Keeping your coursework structured, monitoring feature influences, and scheduling active study sessions are key to sustained academic progress.

### Suggested Action
- Ask specific educational questions on any course concept (e.g. *"Explain gradient descent"*, *"What is database normalization?"*).
- Ask about your personalized metrics (e.g. *"Which subject should I focus on?"*, *"How am I performing this semester?"*).
- Or head over to **Study Plan** to generate a balanced study schedule tailored to your daily available time.`,
    };
  }

  async generateStudyPlan(
    input: StudyPlanGenerationInput,
    context: StudentAIContext,
    startDateStr: string
  ): Promise<GeneratedStudyPlanOutput> {
    const durationDaysMap: Record<string, number> = {
      "1_day": 1,
      "3_days": 3,
      "1_week": 7,
      "2_weeks": 14,
      "1_month": 30,
    };

    const totalDays = durationDaysMap[input.duration] || 7;
    const dailyHours = Math.max(1, Math.min(12, input.daily_hours || 3));
    const maxDailyMinutes = dailyHours * 60;

    // Determine subjects list
    const subjects = context.academic.subjects.length > 0
      ? context.academic.subjects
      : [
          { id: "sub-1", name: "Data Structures & Algorithms", credits: 4, score: 72 },
          { id: "sub-2", name: "Database Management Systems", credits: 4, score: 68 },
          { id: "sub-3", name: "Computer Networks", credits: 3, score: 81 },
          { id: "sub-4", name: "Machine Learning Foundations", credits: 4, score: 75 },
        ];

    // Sort by priority or lowest score
    const prioritized = [...subjects].sort((a, b) => {
      const isAPriority = input.priority_subject_ids?.includes(a.id);
      const isBPriority = input.priority_subject_ids?.includes(b.id);
      if (isAPriority && !isBPriority) return -1;
      if (!isAPriority && isBPriority) return 1;
      return (a.score || 70) - (b.score || 70);
    });

    const topicBank: Record<string, string[]> = {
      default: [
        "Core Theory & Fundamental Principles",
        "Problem Solving & Exercise Set A",
        "Analytical Problem Solving & Proofs",
        "Past Examination Questions & Review",
        "Comprehensive Active Recall & Flashcard Drill",
      ],
      "data structures": [
        "Binary Search Trees & Tree Traversals",
        "Graph Algorithms: Dijkstra & BFS/DFS",
        "Dynamic Programming: Memoization Patterns",
        "Hash Tables & Collision Resolution",
        "Sorting Algorithms & Complexity Analysis",
      ],
      database: [
        "Relational Algebra & Advanced SQL Joins",
        "Normalization: 1NF through BCNF",
        "Transaction Management & ACID Properties",
        "B+ Tree Indexing & Query Optimization",
        "Concurrency Control & Two-Phase Locking",
      ],
      machine: [
        "Linear & Regularized Ridge Regression",
        "Gradient Descent & Optimization Dynamics",
        "Classification: Logistic Regression & SVM",
        "Model Evaluation: Confusion Matrix & ROC-AUC",
        "Ensemble Methods: Random Forests & Boosting",
      ],
      network: [
        "OSI & TCP/IP Layer Architectures",
        "Subnetting, CIDR & IP Routing Protocols",
        "TCP Flow & Congestion Control Mechanisms",
        "Application Layer: DNS, HTTP/HTTPS Protocols",
        "Network Security: Public Key Cryptography",
      ],
    };

    const getTopicForSubject = (subName: string, sessionIdx: number) => {
      const lower = subName.toLowerCase();
      let matchedKey = "default";
      if (lower.includes("data") || lower.includes("algorithm")) matchedKey = "data structures";
      else if (lower.includes("database") || lower.includes("dbms") || lower.includes("sql")) matchedKey = "database";
      else if (lower.includes("machine") || lower.includes("ai") || lower.includes("learning")) matchedKey = "machine";
      else if (lower.includes("network")) matchedKey = "network";

      const bank = topicBank[matchedKey] || topicBank.default;
      return bank[sessionIdx % bank.length];
    };

    const days: GeneratedDayPlan[] = [];
    const baseDate = new Date(startDateStr || new Date().toISOString().split("T")[0]);

    // Session duration strategy based on available time
    // If 2 hours -> 2 x 60 min sessions. If 3 hours -> 2 x 90 min sessions. If 4 hours -> 3 sessions.
    const sessionLength = dailyHours >= 4 ? 60 : dailyHours >= 2 ? 60 : 45;
    const sessionsPerDay = Math.max(1, Math.floor(maxDailyMinutes / sessionLength));

    // Preferred time slots
    const timeSlots =
      input.preferred_time === "morning"
        ? ["08:30", "10:00", "11:30", "13:00"]
        : input.preferred_time === "evening"
        ? ["17:30", "19:00", "20:30", "22:00"]
        : ["09:30", "14:00", "16:30", "19:30"];

    let totalSessionsCount = 0;
    let totalPlanMinutes = 0;

    for (let d = 0; d < totalDays; d++) {
      const dayDate = new Date(baseDate);
      dayDate.setDate(baseDate.getDate() + d);
      const isoDate = dayDate.toISOString().split("T")[0];
      const weekdayName = dayDate.toLocaleDateString("en-US", { weekday: "long" });

      const daySessions = [];
      let dailyAccumulatedMinutes = 0;

      for (let s = 0; s < sessionsPerDay; s++) {
        if (dailyAccumulatedMinutes + sessionLength > maxDailyMinutes) break;

        const sub = prioritized[(d * sessionsPerDay + s) % prioritized.length];
        const startTime = timeSlots[s % timeSlots.length];
        const topic = getTopicForSubject(sub.name, d * 2 + s);

        daySessions.push({
          subject: sub.name,
          subject_id: sub.id,
          start_time: startTime,
          duration_minutes: sessionLength,
          topic,
          activity:
            s === 0
              ? "Concept review + key formula derivations"
              : "Problem sets + active recall self-quiz",
        });

        dailyAccumulatedMinutes += sessionLength;
        totalSessionsCount++;
        totalPlanMinutes += sessionLength;
      }

      days.push({
        date: isoDate,
        day_label: `Day ${d + 1} (${weekdayName})`,
        sessions: daySessions,
      });
    }

    return {
      title: `${totalDays}-Day Academic Acceleration Plan`,
      overview: `Personalized ${totalDays}-day study schedule prioritizing your key academic areas (${dailyHours}h/day, ${totalDays * dailyHours}h total). Designed with active recall intervals to maximize concept retention.`,
      total_days: totalDays,
      total_sessions: totalSessionsCount,
      total_study_minutes: totalPlanMinutes,
      days,
    };
  }
}
