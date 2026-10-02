"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Network,
  BookOpen,
  FileText,
  Layers,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  GitBranch,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ConceptNode {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "Mastered" | "Learning" | "Review";
  noteCount: number;
  flashcardCount: number;
  practiceCount: number;
  sampleQuestion: string;
}

interface TopicCluster {
  id: string;
  name: string;
  concepts: ConceptNode[];
}

interface SubjectKnowledgeMap {
  subject: string;
  clusters: TopicCluster[];
}

const KNOWLEDGE_GRAPH_DATA: SubjectKnowledgeMap[] = [
  {
    subject: "Machine Learning",
    clusters: [
      {
        id: "ml-supervised",
        name: "Supervised Learning",
        concepts: [
          {
            id: "ml-sup-1",
            name: "Linear & Polynomial Regression",
            category: "Regression",
            description: "Fitting continuous linear and high-degree polynomial functions using least squares cost minimization.",
            status: "Mastered",
            noteCount: 3,
            flashcardCount: 6,
            practiceCount: 8,
            sampleQuestion: "How does feature standardization prevent elongated elliptical contours in MSE loss?",
          },
          {
            id: "ml-sup-2",
            name: "Logistic Regression & Sigmoid",
            category: "Classification",
            description: "Probabilistic binary classification with cross-entropy loss and log-odds decision boundaries.",
            status: "Learning",
            noteCount: 2,
            flashcardCount: 5,
            practiceCount: 6,
            sampleQuestion: "Why is mean squared error unsuitable as a loss function for logistic regression?",
          },
          {
            id: "ml-sup-3",
            name: "Gradient Descent Optimization",
            category: "Optimization",
            description: "First-order iterative optimization over loss gradients with learning rate scheduling and momentum.",
            status: "Review",
            noteCount: 4,
            flashcardCount: 8,
            practiceCount: 10,
            sampleQuestion: "What is the update rule for parameters using mini-batch gradient descent with momentum?",
          },
          {
            id: "ml-sup-4",
            name: "Regularization (L1 & L2)",
            category: "Evaluation",
            description: "Constraining parameter magnitude via Lasso and Ridge penalties to mitigate overfitting.",
            status: "Learning",
            noteCount: 2,
            flashcardCount: 4,
            practiceCount: 5,
            sampleQuestion: "Why does L1 regularization drive parameter weights strictly to zero while L2 does not?",
          },
        ],
      },
      {
        id: "ml-unsupervised",
        name: "Unsupervised Learning",
        concepts: [
          {
            id: "ml-unsup-1",
            name: "K-Means Clustering",
            category: "Clustering",
            description: "Centroid-based partition optimization minimizing intra-cluster inertia with elbow evaluation.",
            status: "Mastered",
            noteCount: 2,
            flashcardCount: 4,
            practiceCount: 6,
            sampleQuestion: "Explain the two iterative steps of Lloyd's algorithm for K-Means.",
          },
          {
            id: "ml-unsup-2",
            name: "Principal Component Analysis (PCA)",
            category: "Dimensionality Reduction",
            description: "Orthogonal linear transformation maximizing variance along eigenvectors of the covariance matrix.",
            status: "Learning",
            noteCount: 3,
            flashcardCount: 6,
            practiceCount: 7,
            sampleQuestion: "How does PCA use the singular value decomposition (SVD) of the data matrix?",
          },
        ],
      },
      {
        id: "ml-reinforcement",
        name: "Reinforcement Learning",
        concepts: [
          {
            id: "ml-rl-1",
            name: "Markov Decision Processes (MDP)",
            category: "Decision Modeling",
            description: "Mathematical framework for modeling decision making where outcomes are partly random and partly under control.",
            status: "Review",
            noteCount: 1,
            flashcardCount: 4,
            practiceCount: 4,
            sampleQuestion: "State the Bellman Expectation Equation for state-value function V(s).",
          },
          {
            id: "ml-rl-2",
            name: "Q-Learning & Policy Gradients",
            category: "Policy Search",
            description: "Model-free temporal difference control algorithm to learn the value of an action in a particular state.",
            status: "Learning",
            noteCount: 2,
            flashcardCount: 5,
            practiceCount: 5,
            sampleQuestion: "What is the key difference between on-policy (SARSA) and off-policy (Q-Learning)?",
          },
        ],
      },
    ],
  },
  {
    subject: "Digital Electronics",
    clusters: [
      {
        id: "de-combinational",
        name: "Combinational Logic",
        concepts: [
          {
            id: "de-comb-1",
            name: "Boolean Algebra & K-Maps",
            category: "Simplification",
            description: "Graphic minimization of sum-of-products Boolean expressions avoiding static and dynamic hazards.",
            status: "Mastered",
            noteCount: 3,
            flashcardCount: 6,
            practiceCount: 8,
            sampleQuestion: "How do don't-care conditions assist in expanding prime implicant groupings in 4-variable K-maps?",
          },
          {
            id: "de-comb-2",
            name: "Multiplexers & Decoders",
            category: "Routing",
            description: "Data selectors and line routing circuits used for bus arbitration and universal logic implementation.",
            status: "Learning",
            noteCount: 2,
            flashcardCount: 4,
            practiceCount: 5,
            sampleQuestion: "How can an 8-to-1 multiplexer implement any 4-variable Boolean function?",
          },
        ],
      },
      {
        id: "de-sequential",
        name: "Sequential Circuits",
        concepts: [
          {
            id: "de-seq-1",
            name: "Flip-Flops & Latches",
            category: "Bistable Elements",
            description: "SR, JK, D, and T flip-flops with setup/hold timing characteristics and race-around condition prevention.",
            status: "Review",
            noteCount: 3,
            flashcardCount: 7,
            practiceCount: 8,
            sampleQuestion: "How does a Master-Slave JK Flip-Flop eliminate the race-around condition when J=1 and K=1?",
          },
        ],
      },
    ],
  },
];

export default function KnowledgeMapPage() {
  const router = useRouter();

  const [selectedSubject, setSelectedSubject] = useState("Machine Learning");
  const [selectedConcept, setSelectedConcept] = useState<ConceptNode | null>(
    KNOWLEDGE_GRAPH_DATA[0].clusters[0].concepts[2]
  );

  const currentMap =
    KNOWLEDGE_GRAPH_DATA.find((m) => m.subject === selectedSubject) || KNOWLEDGE_GRAPH_DATA[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              Interactive Concept Topology
            </span>
            <span className="text-xs text-slate-500">• Section 27</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Knowledge Map
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Visualize the hierarchical relationship from Course Subjects → Topics → Core Concepts → Linked Notes, Flashcards & Questions.
          </p>
        </div>

        {/* Subject Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          {KNOWLEDGE_GRAPH_DATA.map((map) => (
            <button
              key={map.subject}
              onClick={() => {
                setSelectedSubject(map.subject);
                setSelectedConcept(map.clusters[0]?.concepts[0] || null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedSubject === map.subject
                  ? "bg-white text-blue-600 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {map.subject}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Graph Tree (2/3) + Linked Content Inspector (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Hierarchical Knowledge Tree */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-slate-200 shadow-soft-sm overflow-hidden">
            <CardHeader className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    {selectedSubject} Hierarchy
                  </CardTitle>
                  <p className="text-2xs text-slate-500">Click any concept node to inspect linked notes & questions</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-2xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Mastered
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Learning
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Review
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-6">
              {currentMap.clusters.map((cluster) => (
                <div key={cluster.id} className="space-y-3">
                  {/* Topic Header Node */}
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-700 uppercase tracking-wider bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/60 w-fit">
                    <GitBranch className="w-3.5 h-3.5 text-blue-600" />
                    <span>{cluster.name}</span>
                  </div>

                  {/* Concept Nodes in Topic */}
                  <div className="pl-4 border-l-2 border-slate-200 space-y-2.5">
                    {cluster.concepts.map((concept) => {
                      const isSelected = selectedConcept?.id === concept.id;
                      const statusColor =
                        concept.status === "Mastered"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : concept.status === "Learning"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-rose-50 text-rose-700 border-rose-200";

                      return (
                        <div
                          key={concept.id}
                          onClick={() => setSelectedConcept(concept)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                            isSelected
                              ? "bg-blue-50/60 border-blue-300 shadow-soft-xs"
                              : "bg-white hover:bg-slate-50/80 border-slate-200/80 hover:border-slate-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-blue-600" />
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900">{concept.name}</h4>
                              <span className="text-2xs text-slate-400 font-medium">({concept.category})</span>
                            </div>

                            <span className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                              {concept.status}
                            </span>
                          </div>

                          <p className="text-2xs text-slate-600 mt-1 line-clamp-1 leading-relaxed">
                            {concept.description}
                          </p>

                          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-100 text-2xs text-slate-500">
                            <span className="flex items-center gap-1 font-medium">
                              <FileText className="w-3 h-3 text-blue-600" /> {concept.noteCount} Notes
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                              <Layers className="w-3 h-3 text-amber-600" /> {concept.flashcardCount} Flashcards
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                              <CheckCircle2 className="w-3 h-3 text-cyan-600" /> {concept.practiceCount} Questions
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right: Linked Learning Content Inspector */}
        <div className="lg:col-span-5 space-y-4">
          {selectedConcept ? (
            <Card className="border-blue-200/90 bg-gradient-to-b from-white to-blue-50/20 shadow-soft-sm sticky top-6">
              <CardHeader className="p-4 sm:p-5 border-b border-blue-100/70 bg-white/70">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    Active Node Details
                  </span>
                  <span className="text-2xs text-slate-400 font-medium">{selectedConcept.category}</span>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 mt-1">
                  {selectedConcept.name}
                </CardTitle>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">
                  {selectedConcept.description}
                </p>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* 1. Linked Notes */}
                <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      Course Notes ({selectedConcept.noteCount})
                    </span>
                    <Link href={`/notebook`}>
                      <span className="text-2xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                        Open in Notebook <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </Link>
                  </div>
                  <p className="text-2xs text-slate-500">
                    Comprehensive formulas and derivations recorded for {selectedConcept.name}.
                  </p>
                </div>

                {/* 2. Linked Flashcards */}
                <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-amber-600" />
                      Flashcards ({selectedConcept.flashcardCount})
                    </span>
                    <Link href={`/flashcards`}>
                      <span className="text-2xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-0.5">
                        Practice Cards <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </Link>
                  </div>
                  <p className="text-2xs text-slate-500">
                    Spaced repetition deck active with interval reviews scheduled.
                  </p>
                </div>

                {/* 3. Sample Practice Question */}
                <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                      Exam Practice ({selectedConcept.practiceCount} Qs)
                    </span>
                    <Link href={`/practice`}>
                      <span className="text-2xs font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-0.5">
                        Start Quiz <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    </Link>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800 leading-relaxed">
                    &ldquo;{selectedConcept.sampleQuestion}&rdquo;
                  </div>
                </div>

                {/* 4. Action Buttons */}
                <div className="pt-2 space-y-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => router.push(`/tutor?q=${encodeURIComponent("Explain " + selectedConcept.name + " step by step")}`)}
                    leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  >
                    Teach with AI Tutor
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => router.push(`/study-guides`)}
                    leftIcon={<BookOpen className="w-3.5 h-3.5" />}
                  >
                    Generate Study Guide
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 text-center py-12">
              <CardContent className="space-y-2">
                <Network className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500">Select any concept node to inspect its linked content.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
