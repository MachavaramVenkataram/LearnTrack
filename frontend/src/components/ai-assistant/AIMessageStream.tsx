"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  Bot,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  RefreshCw,
  Sliders,
  CalendarRange,
  Target,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { AIMessage, StudentAIContext } from "@/types/academic";
import { Button } from "@/components/ui/Button";

interface AIMessageStreamProps {
  messages: AIMessage[];
  isThinking: boolean;
  errorMessage: string | null;
  context: StudentAIContext | null;
  onSendPrompt: (promptText: string) => void;
  onRetry: () => void;
  onRegenerate: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function AIMessageStream({
  messages,
  isThinking,
  errorMessage,
  context,
  onSendPrompt,
  onRetry,
  onRegenerate,
  messagesEndRef,
}: AIMessageStreamProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Generate dynamic contextual starter prompts based on real student data
  const starterPrompts = React.useMemo(() => {
    const list: Array<{ title: string; subtitle: string }> = [];

    // 1. Performance prompt
    if (context?.academic.cgpa !== null && context?.academic.cgpa !== undefined) {
      list.push({
        title: "How am I performing this semester?",
        subtitle: `Review your ${context.academic.cgpa.toFixed(2)} CGPA, attendance & course marks`,
      });
    } else {
      list.push({
        title: "How should I start tracking my academics?",
        subtitle: "Key metrics and baseline setup for semester success",
      });
    }

    // 2. Improvement & course focus
    if (context?.academic.subjects && context.academic.subjects.length > 0) {
      list.push({
        title: "Which subjects need more attention?",
        subtitle: "Identify coursework with attendance or marks gaps",
      });
    } else {
      list.push({
        title: "What should I focus on improving?",
        subtitle: "Strategies to optimize your daily study habits",
      });
    }

    // 3. Study plan recommendation
    list.push({
      title: "Create a study plan for this week.",
      subtitle: "Generate an evidence-based revision schedule",
    });

    // 4. ML Model Prediction insight
    if (context?.prediction) {
      list.push({
        title: "Explain my latest performance prediction.",
        subtitle: `Inspect factors influencing your ${context.prediction.predicted_score.toFixed(1)} pts estimate`,
      });
    } else {
      list.push({
        title: "Help me prepare for my upcoming exams.",
        subtitle: "Active recall and spaced repetition revision strategy",
      });
    }

    // 5. Attendance & goals
    if (context?.academic.average_attendance !== null) {
      list.push({
        title: "How much attendance do I need to maintain?",
        subtitle: `Current attendance is ${context?.academic.average_attendance?.toFixed(1)}%`,
      });
    } else {
      list.push({
        title: "How can I set realistic academic goals?",
        subtitle: "Target setting for GPA, study hours, and consistency",
      });
    }

    // 6. Exam strategy
    list.push({
      title: "Suggest active recall techniques for my courses.",
      subtitle: "Effective test-preparation methods for engineering",
    });

    return list.slice(0, 6);
  }, [context]);

  const handleCopyMessage = async (msgId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(msgId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {messages.length === 0 ? (
        /* ============================================================== */
        /* WELCOME STATE / EMPTY CONVERSATION (Requirements #13, #14, #15)*/
        /* ============================================================== */
        <div className="max-w-2xl mx-auto py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto shadow-xs">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-sans">
              What would you like to work on?
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Ask about your coursework, performance, study plan, or academic concepts using your
              verified LearnTrack context.
            </p>

            {/* Quick Action Chips (Requirement #40) */}
            <div className="flex items-center justify-center flex-wrap gap-2 pt-1">
              <button
                onClick={() => onSendPrompt("How am I performing this semester?")}
                className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-[11px] font-medium text-slate-700 transition-colors shadow-2xs"
              >
                📊 Analyze Performance
              </button>
              <button
                onClick={() => onSendPrompt("Create a study plan for this week.")}
                className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-[11px] font-medium text-slate-700 transition-colors shadow-2xs"
              >
                📅 Build Study Plan
              </button>
              <button
                onClick={() => onSendPrompt("Explain my latest performance prediction.")}
                className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-[11px] font-medium text-slate-700 transition-colors shadow-2xs"
              >
                ⚡ Explain Prediction
              </button>
            </div>
          </div>

          {/* Contextual Suggestion Cards Grid (Requirement #14 & #15) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {starterPrompts.map((starter, idx) => (
              <button
                key={idx}
                onClick={() => onSendPrompt(starter.title)}
                className="text-left p-4 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/80 hover:border-blue-300 transition-all duration-150 shadow-xs hover:-translate-y-0.5 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {starter.title}
                  </p>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                  {starter.subtitle}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* ACTIVE CONVERSATION MESSAGE STREAM (Requirements #17 - #23)    */
        /* ============================================================== */
        <div className="space-y-6 max-w-4xl mx-auto">
          {messages.map((msg, index) => {
            const isUser = msg.role === "user";
            const isLastMessage = index === messages.length - 1;

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 group animate-in fade-in duration-200 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
              >
                {/* AI Assistant Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble/Card Container */}
                <div className="space-y-1.5 max-w-[85%] sm:max-w-[78%]">
                  <div
                    className={`rounded-2xl px-5 py-4 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-blue-600 text-white rounded-tr-xs shadow-xs font-medium"
                        : "bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-xs"
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-slate-900 tracking-tight">
                            LearnTrack AI
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            Academic Guidance
                          </span>
                        </div>
                      </div>
                    )}

                    {isUser ? (
                      <p className="whitespace-pre-wrap select-text">{msg.content}</p>
                    ) : (
                      renderRichMarkdown(msg.content)
                    )}
                  </div>

                  {/* Message Actions for AI responses (Copy & Regenerate) */}
                  {!isUser && (
                    <div className="flex items-center gap-2 pl-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 py-0.5 px-1.5 rounded hover:bg-slate-100 transition-colors"
                        title="Copy response to clipboard"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {isLastMessage && !isThinking && (
                        <button
                          onClick={onRegenerate}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 py-0.5 px-1.5 rounded hover:bg-slate-100 transition-colors"
                          title="Regenerate response"
                        >
                          <RotateCcw className="w-3 h-3 text-slate-400" />
                          <span>Regenerate</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* THINKING STATE (Requirement #21)                               */}
      {/* ============================================================== */}
      {isThinking && (
        <div className="flex items-start gap-3 max-w-4xl mx-auto animate-in fade-in duration-200">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <Sparkles className="w-4 h-4 animate-spin" />
          </div>
          <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-75" />
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-150" />
              <span className="text-xs font-semibold text-slate-700 ml-1">
                LearnTrack AI is thinking...
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Evaluating your coursework records, attendance signals, and study plan...
            </p>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ERROR STATE WITH RETRY (Requirement #22)                        */}
      {/* ============================================================== */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <div>
              <p className="font-semibold text-rose-900">Unable to generate a response.</p>
              <p className="text-[11px] text-rose-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-3 h-3" />}
            className="h-8 text-xs bg-white text-rose-700 border-rose-300 hover:bg-rose-50 shrink-0"
          >
            Retry
          </Button>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

/**
 * Rich markdown rendering with support for:
 * - Headings (###, ####)
 * - Lists (bullet, numbered)
 * - Tables (clean bordered tables with #F8FAFC header)
 * - Code blocks & Inline code
 * - Bold / Italics
 */
function renderRichMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLanguage = "";

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Code block toggle
    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        // End of code block
        elements.push(
          <div
            key={`code-${i}`}
            className="my-3 rounded-xl bg-slate-900 text-slate-100 p-3.5 text-xs font-mono overflow-x-auto shadow-inner border border-slate-800"
          >
            {codeLanguage && (
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-sans border-b border-slate-800 pb-1">
                {codeLanguage}
              </div>
            )}
            <pre className="whitespace-pre-wrap">{codeBuffer.join("\n")}</pre>
          </div>
        );
        inCodeBlock = false;
        codeBuffer = [];
        codeLanguage = "";
      } else {
        // Start of code block
        inCodeBlock = true;
        codeLanguage = trimmed.replace(/^```/, "").trim();
        codeBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    // Markdown Table Detection (e.g. | col 1 | col 2 |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      // Gather all consecutive table rows
      const tableLines: string[] = [trimmed];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith("|")) {
        i++;
        tableLines.push(lines[i].trim());
      }

      elements.push(
        <div key={`table-${i}`} className="my-3 overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            {tableLines.map((tLine, rIdx) => {
              // Skip divider line like |---|---|
              if (/^\|[-|\s]+\|$/.test(tLine)) return null;

              const cells = tLine
                .split("|")
                .slice(1, -1)
                .map((c) => c.trim());

              if (rIdx === 0) {
                return (
                  <thead key={`th-${rIdx}`} className="bg-slate-50 font-semibold text-slate-700">
                    <tr>
                      {cells.map((cell, cIdx) => (
                        <th key={cIdx} className="px-3 py-2 border-r last:border-r-0 border-slate-200">
                          <span dangerouslySetInnerHTML={{ __html: formatInline(cell) }} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                );
              }

              return (
                <tbody key={`tb-${rIdx}`} className="divide-y divide-slate-100 bg-white">
                  <tr className="hover:bg-slate-50/50">
                    {cells.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 text-slate-600 border-r last:border-r-0 border-slate-100">
                        <span dangerouslySetInnerHTML={{ __html: formatInline(cell) }} />
                      </td>
                    ))}
                  </tr>
                </tbody>
              );
            })}
          </table>
        </div>
      );
      continue;
    }

    // Heading 3
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h4 key={`h3-${i}`} className="font-bold text-slate-900 text-sm mt-3.5 mb-1.5 font-sans">
          {trimmed.replace(/^###\s+/, "")}
        </h4>
      );
      continue;
    }

    // Heading 4
    if (trimmed.startsWith("#### ")) {
      elements.push(
        <h5 key={`h4-${i}`} className="font-semibold text-slate-800 text-xs mt-2.5 mb-1 font-sans">
          {trimmed.replace(/^####\s+/, "")}
        </h5>
      );
      continue;
    }

    // Bullet item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const bulletText = trimmed.replace(/^[-*]\s+/, "");
      elements.push(
        <li key={`li-${i}`} className="ml-4 list-disc text-slate-700 my-0.5">
          <span dangerouslySetInnerHTML={{ __html: formatInline(bulletText) }} />
        </li>
      );
      continue;
    }

    // Numbered item
    if (/^\d+\.\s+/.test(trimmed)) {
      const numText = trimmed.replace(/^\d+\.\s+/, "");
      elements.push(
        <li key={`ol-${i}`} className="ml-4 list-decimal text-slate-700 my-0.5">
          <span dangerouslySetInnerHTML={{ __html: formatInline(numText) }} />
        </li>
      );
      continue;
    }

    // Empty line
    if (!trimmed) {
      elements.push(<div key={`sp-${i}`} className="h-1.5" />);
      continue;
    }

    // Paragraph
    elements.push(
      <p
        key={`p-${i}`}
        className="text-slate-700 leading-relaxed my-1"
        dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
      />
    );
  }

  return <div className="space-y-1 select-text">{elements}</div>;
}

function formatInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-slate-900'>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em class='italic'>$1</em>")
    .replace(
      /`([^`]+)`/g,
      "<code class='bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded font-mono text-[11px] font-medium'>$1</code>"
    );
}
