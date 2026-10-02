"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Sparkles,
  Save,
  Copy,
  Check,
  ArrowRight,
  AlertTriangle,
  HelpCircle,
  Layers,
  FileText,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { learningService } from "@/lib/learning/service";
import { StudyGuideData, Notebook } from "@/types/learning";
import { useAuth } from "@/lib/auth-context";

const DEFAULT_SAMPLE_GUIDE: StudyGuideData = {
  overview:
    "Gradient Descent is a foundational first-order iterative optimization algorithm used to minimize the cost function in machine learning and deep learning models. By computing the negative gradient of the loss surface with respect to parameters, the algorithm takes incremental steps toward the global or local minimum.",
  key_concepts: [
    "Cost Function Surface: Convex surfaces guarantee global convergence; non-convex surfaces present saddle points and local minima.",
    "Learning Rate (α): Controls the step size; excessively large rates diverge while overly small rates lead to vanishing progress.",
    "Batch vs. Mini-Batch vs. Stochastic: Trade-offs between memory footprint, gradient variance, and convergence trajectory.",
    "Momentum & Acceleration: Exponential moving averages of past gradients dampen oscillations in high-curvature ravines.",
  ],
  definitions: [
    {
      term: "Gradient (∇J)",
      meaning:
        "The vector of partial derivatives representing the direction and rate of fastest increase of the scalar objective function.",
    },
    {
      term: "Learning Rate (α)",
      meaning:
        "A hyperparameter that scales the magnitude of parameter updates at each optimization iteration.",
    },
    {
      term: "Epoch",
      meaning:
        "One complete presentation of the entire training dataset to the learning model during the training cycle.",
    },
    {
      term: "Saddle Point",
      meaning:
        "A point on the loss surface where the first derivative is zero, but which is neither a local minimum nor maximum.",
    },
  ],
  formulas: [
    "\\theta_{t+1} = \\theta_t - \\alpha \\nabla J(\\theta_t)",
    "J(\\theta) = \\frac{1}{2m} \\sum_{i=1}^m (h_\\theta(x^{(i)}) - y^{(i)})^2",
    "v_t = \\beta v_{t-1} + (1 - \\beta) \\nabla J(\\theta_t), \\quad \\theta_{t+1} = \\theta_t - \\alpha v_t",
  ],
  examples: [
    {
      title: "Linear Regression Weight Fitting",
      explanation:
        "Predicting student exam scores based on hours studied. With cost J(w,b) as MSE, gradient descent iteratively updates slope w and intercept b until predictions stabilize within an epsilon tolerance threshold.",
    },
    {
      title: "Logistic Regression Classification",
      explanation:
        "Binary prediction of course completion. The cross-entropy cost gradient drives the decision boundary parameters toward optimal class separation.",
    },
  ],
  common_mistakes: [
    "Failing to standardize or normalize feature scales before running gradient descent, resulting in elongated elliptical contours that slow down convergence.",
    "Setting a fixed learning rate for non-stationary cost landscapes without utilizing learning rate schedulers or adaptive optimizers (Adam/RMSProp).",
    "Confusing Batch Gradient Descent (exact gradient over all m examples) with Stochastic Gradient Descent (noisy update on a single sample).",
    "Stopping optimization prematurely on plateau regions where gradient magnitude temporarily approaches zero.",
  ],
  practice_questions: [
    "Derive the analytical gradient update equation for Simple Linear Regression with Mean Squared Error loss.",
    "Explain how the condition number of the Hessian matrix influences the convergence rate of gradient descent.",
    "Why does Stochastic Gradient Descent frequently escape shallow local minima more effectively than Batch Gradient Descent?",
    "Under what specific mathematical assumptions is gradient descent guaranteed to reach the global optimum?",
  ],
  quick_revision: [
    "Gradient points in direction of steepest ascent; update moves in the negative gradient direction.",
    "Too large learning rate = divergence / numerical explosion (NaN).",
    "Too small learning rate = stagnation / prohibitively slow training.",
    "Always apply feature scaling (Z-score or Min-Max) before gradient-based learning.",
    "Momentum helps power through flat plateaus and dampens perpendicular oscillations.",
  ],
};

export default function StudyGuidesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.id || "demo-user";

  const [subject, setSubject] = useState("Machine Learning");
  const [topic, setTopic] = useState("Gradient Descent & Optimization");
  const [guide, setGuide] = useState<StudyGuideData | null>(DEFAULT_SAMPLE_GUIDE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedToNotebook, setSavedToNotebook] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);

  useEffect(() => {
    learningService.getNotebooks(userId).then(setNotebooks).catch(() => {});
  }, [userId]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setSavedToNotebook(false);

    try {
      const res = await fetch("/api/ai/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_study_guide",
          subject,
          topic,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.study_guide) {
          setGuide(data.study_guide);
        }
      }
    } catch (e) {
      console.error("Failed to generate study guide:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToNotebook = async () => {
    if (!guide) return;
    try {
      let targetNotebookId = notebooks[0]?.id;
      if (!targetNotebookId) {
        const newNb = await learningService.createNotebook(userId, subject || "General Studies");
        targetNotebookId = newNb.id;
      }

      const markdownContent = `
# ${topic} — AI Study Guide
*Generated for ${subject} on ${new Date().toLocaleDateString()}*

## 1. Overview
${guide.overview}

## 2. Key Concepts
${guide.key_concepts.map((k) => `- ${k}`).join("\n")}

## 3. Important Definitions
${guide.definitions.map((d) => `### ${d.term}\n${d.meaning}`).join("\n\n")}

${guide.formulas && guide.formulas.length > 0 ? `## 4. Key Formulas\n${guide.formulas.map((f) => `$$${f}$$`).join("\n\n")}` : ""}

## 5. Practical Examples
${guide.examples.map((e) => `### ${e.title}\n${e.explanation}`).join("\n\n")}

## 6. Common Mistakes to Avoid
${guide.common_mistakes.map((m) => `- ⚠️ ${m}`).join("\n")}

## 7. Exam Practice Questions
${guide.practice_questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

## 8. Quick Revision Checklist
${guide.quick_revision.map((r) => `- [ ] ${r}`).join("\n")}
      `.trim();

      await learningService.createNote(
        userId,
        targetNotebookId,
        `${topic} (Study Guide)`,
        markdownContent
      );

      setSavedToNotebook(true);
      setTimeout(() => setSavedToNotebook(false), 4000);
    } catch (e) {
      console.error("Failed to save to notebook:", e);
    }
  };

  const handleCopyText = () => {
    if (!guide) return;
    const text = `
${topic} — STUDY GUIDE (${subject})

OVERVIEW:
${guide.overview}

KEY CONCEPTS:
${guide.key_concepts.map((k) => `• ${k}`).join("\n")}

DEFINITIONS:
${guide.definitions.map((d) => `• ${d.term}: ${d.meaning}`).join("\n")}

COMMON MISTAKES:
${guide.common_mistakes.map((m) => `• ${m}`).join("\n")}

PRACTICE QUESTIONS:
${guide.practice_questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

QUICK REVISION:
${guide.quick_revision.map((r) => `✓ ${r}`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              Exam & Concept Mastery
            </span>
            <span className="text-xs text-slate-500">• Section 20</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            AI Study Guides
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Generate high-yield revision guides with definitions, formulas, real-world examples, and exam pitfalls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {guide && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyText}
                leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copied ? "Copied" : "Copy Guide"}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveToNotebook}
                leftIcon={savedToNotebook ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Save className="w-3.5 h-3.5" />}
              >
                {savedToNotebook ? "Saved to Notebook!" : "Save to Notebook"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Generation Bar */}
      <Card className="border-slate-200/80 shadow-soft-sm bg-gradient-to-r from-white via-slate-50/40 to-blue-50/20">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-4 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Course / Subject</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Machine Learning, DBMS..."
              />
            </div>
            <div className="sm:col-span-5 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Topic or Concept</label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Gradient Descent, Normalization..."
              />
            </div>
            <div className="sm:col-span-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={handleGenerate}
                isLoading={isGenerating}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                {isGenerating ? "Generating..." : "Generate Guide"}
              </Button>
            </div>
          </div>

          {/* Quick suggestions */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span className="font-medium text-slate-600">Quick topics:</span>
            {[
              { s: "Machine Learning", t: "Bias-Variance Tradeoff" },
              { s: "Digital Electronics", t: "Karnaugh Maps & Minimization" },
              { s: "DBMS", t: "ACID Properties & Transactions" },
              { s: "Algorithms", t: "Dynamic Programming Memoization" },
            ].map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSubject(item.s);
                  setTopic(item.t);
                }}
                className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-700 transition-colors cursor-pointer text-2xs font-medium"
              >
                {item.t}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Structured Guide View */}
      {guide ? (
        <div className="space-y-6">
          {/* Guide Title Banner */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/60 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-soft-sm font-semibold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xs font-semibold text-blue-700 uppercase tracking-wider">
                    {subject}
                  </span>
                  <span className="text-2xs text-slate-400">•</span>
                  <span className="text-2xs text-slate-500 font-medium">8 Structured Sections</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">{topic}</h2>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/notebook")}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="hidden sm:inline-flex text-xs"
            >
              Open Notebook
            </Button>
          </div>

          {/* 1. Overview */}
          <Card className="border-slate-200 shadow-soft-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                <Compass className="w-4 h-4 text-blue-600" />
                1. Executive Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <p className="text-sm text-slate-700 leading-relaxed font-sans">{guide.overview}</p>
            </CardContent>
          </Card>

          {/* 2. Key Concepts */}
          <Card className="border-slate-200 shadow-soft-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                <Layers className="w-4 h-4 text-indigo-600" />
                2. Foundational Key Concepts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {guide.key_concepts.map((concept, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-2xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{concept}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 3. Important Definitions */}
          <Card className="border-slate-200 shadow-soft-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                3. Essential Definitions & Glossary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {guide.definitions.map((def, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-emerald-100/80 bg-emerald-50/20 text-xs"
                  >
                    <p className="font-semibold text-emerald-900 text-xs">{def.term}</p>
                    <p className="text-slate-600 mt-1 leading-relaxed text-xs">{def.meaning}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 4. Formulas */}
          {guide.formulas && guide.formulas.length > 0 && (
            <Card className="border-slate-200 shadow-soft-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                  <span className="font-mono text-purple-600 font-bold text-base">∑</span>
                  4. Mathematical Formulations & Expressions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-3">
                {guide.formulas.map((formula, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-purple-100 bg-purple-50/30 font-mono text-xs sm:text-sm text-purple-950 flex items-center justify-between overflow-x-auto"
                  >
                    <span>$${formula}$$</span>
                    <span className="text-2xs text-purple-500 font-sans font-medium">Equation {idx + 1}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 5. Examples */}
          <Card className="border-slate-200 shadow-soft-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                5. Practical Case Examples
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-3">
              {guide.examples.map((example, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg border border-slate-200/80 bg-white shadow-2xs space-y-1.5"
                >
                  <h4 className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    {example.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{example.explanation}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 6. Common Mistakes */}
          <Card className="border-amber-200 bg-amber-50/20 shadow-soft-sm">
            <CardHeader className="pb-3 border-b border-amber-100">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                6. Common Exam Mistakes & Misconceptions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <ul className="space-y-2.5">
                {guide.common_mistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 7. Practice Questions */}
          <Card className="border-slate-200 shadow-soft-sm">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                7. High-Yield Exam Practice Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-2.5">
              {guide.practice_questions.map((question, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-start gap-3"
                >
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    Q{idx + 1}
                  </span>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">{question}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 8. Quick Revision Checklist */}
          <Card className="border-blue-200 bg-gradient-to-b from-blue-50/40 to-white shadow-soft-sm">
            <CardHeader className="pb-3 border-b border-blue-100">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-900">
                <Check className="w-4 h-4 text-blue-700" />
                8. Last-Minute Cram & Revision Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {guide.quick_revision.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-blue-100/80 bg-white/90 text-xs text-slate-700 flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-medium text-xs">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Empty State */
        <Card className="border-slate-200 border-dashed py-12 text-center">
          <CardContent className="space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">No Study Guide Generated Yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter a subject and concept above, then click &ldquo;Generate Guide&rdquo; to build a structured 8-section revision sheet.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerate}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Generate Demo Guide
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
