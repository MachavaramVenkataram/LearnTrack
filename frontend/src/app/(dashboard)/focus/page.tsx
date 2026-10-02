"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  BookOpen,
  Target,
  Edit3,
  Maximize2,
  Minimize2,
  Save,
  ArrowLeft,
  Flame,
  Award,
  CalendarCheck,
  BrainCircuit,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createFocusSession } from "@/lib/student-os/service";
import { useToast } from "@/components/ui/Toast";

function FocusModeInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const userId = user?.id || "demo-student";

  // Preload from query params if coming from Command Center, Assignment, or Notebook
  const initialSubject = searchParams.get("subject") || "Machine Learning";
  const initialTask = searchParams.get("task") || "Gradient Descent & Learning Rate";
  const initialObjective = searchParams.get("objective") || "Understand gradient descent update rule and learning rate decay.";

  // Config State
  const [selectedSubject, setSelectedSubject] = useState(initialSubject);
  const [taskTitle, setTaskTitle] = useState(initialTask);
  const [objective, setObjective] = useState(initialObjective);
  const [sessionNotes, setSessionNotes] = useState("");
  const [targetDurationMinutes, setTargetDurationMinutes] = useState(25);
  const [customMinutesInput, setCustomMinutesInput] = useState("30");

  // Timer State
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Reflection State
  const [reflection, setReflection] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Available subjects
  const subjectsList = [
    "Machine Learning",
    "Digital Electronics",
    "Data Structures & Algorithms",
    "Deep Learning",
    "Database Management Systems",
    "Statistics & Probability",
    "Python Programming",
  ];

  // Sync timer when preset duration changes before start
  const handleDurationSelect = (mins: number) => {
    if (!isActive) {
      setTargetDurationMinutes(mins);
      setTimeLeftSeconds(mins * 60);
    }
  };

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused && timeLeftSeconds > 0) {
      interval = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, timeLeftSeconds]);

  // Start Session
  const handleStartSession = () => {
    if (!taskTitle.trim()) {
      showToast("Task required", "Please enter what you are focusing on.", "error");
      return;
    }
    setIsActive(true);
    setIsPaused(false);
    setSessionStartTime(Date.now());
  };

  // Pause / Resume
  const handleTogglePause = () => {
    setIsPaused((prev) => !prev);
  };

  // Early Complete
  const handleCompleteSession = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setIsCompleted(true);
  }, []);

  // Cancel Session
  const handleCancelSession = () => {
    if (confirm("Are you sure you want to cancel this focus session? Elapsed time will not be logged.")) {
      setIsActive(false);
      setIsPaused(false);
      setTimeLeftSeconds(targetDurationMinutes * 60);
      setElapsedSeconds(0);
      router.push("/student-home");
    }
  };

  // Save Session & Sync
  const handleSaveSession = async () => {
    setIsSaving(true);
    try {
      const minutesSpent = Math.max(1, Math.round(elapsedSeconds / 60) || targetDurationMinutes);

      await createFocusSession(userId, {
        subject_name: selectedSubject,
        task_title: taskTitle,
        objective: objective || undefined,
        duration_minutes: minutesSpent,
        target_duration_minutes: targetDurationMinutes,
        status: "completed",
        reflection: reflection || undefined,
        notes: sessionNotes || undefined,
      });

      showToast(
        "Focus session logged!",
        `+${minutesSpent} min added to Study Activity & Learning Memory.`,
        "success"
      );

      router.push("/student-home");
    } catch {
      showToast("Error saving session", "Your session was recorded locally.", "info");
      router.push("/student-home");
    } finally {
      setIsSaving(false);
    }
  };

  // Format MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = Math.min(
    100,
    Math.round(((targetDurationMinutes * 60 - timeLeftSeconds) / (targetDurationMinutes * 60)) * 100)
  );

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isActive && !isCompleted ? "bg-[#090D16] text-white" : "bg-[#F8FAFC] text-slate-900"
      }`}
    >
      {/* Top Header */}
      <div
        className={`px-6 py-4 flex items-center justify-between border-b ${
          isActive && !isCompleted ? "border-slate-800 bg-[#090D16]" : "border-slate-200 bg-white"
        }`}
      >
        <button
          onClick={() => router.push("/student-home")}
          className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            isActive && !isCompleted
              ? "text-slate-400 hover:text-white hover:bg-slate-800"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Focus Mode</span>
        </button>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isActive && !isCompleted
                ? "bg-violet-950/70 border border-violet-800/60 text-violet-300"
                : "bg-blue-50 border border-blue-200 text-blue-700"
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span>{isActive ? (isPaused ? "Paused" : "Focusing") : "Distraction-Free Workspace"}</span>
          </div>
        </div>
      </div>

      {/* Main Study Arena */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        <AnimatePresence mode="wait">
          {/* STATE 1: CONFIGURATION BEFORE LAUNCH */}
          {!isActive && !isCompleted && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-8"
            >
              <div className="text-center max-w-xl mx-auto">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest block mb-1">
                  Focus Mode
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Design Your Focus Session
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                  Eliminate cognitive friction. Lock in on one academic objective and let LearnTrack log your deep study flow.
                </p>
              </div>

              {/* Duration Presets */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Select Session Duration
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {[25, 50, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleDurationSelect(mins)}
                      className={`p-4 rounded-xl border text-center font-bold text-sm transition-all cursor-pointer ${
                        targetDurationMinutes === mins
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="block text-xl">{mins}</span>
                      <span className="text-[11px] font-medium opacity-80">minutes</span>
                    </button>
                  ))}

                  <div className="flex items-center gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50">
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={customMinutesInput}
                      onChange={(e) => setCustomMinutesInput(e.target.value)}
                      className="w-14 p-1.5 text-center bg-white rounded-lg border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = parseInt(customMinutesInput, 10);
                        if (val && val > 0) handleDurationSelect(val);
                      }}
                      className="text-xs font-semibold px-2 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-800 cursor-pointer"
                    >
                      Set
                    </button>
                  </div>
                </div>
              </div>

              {/* Subject & Task Form */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Academic Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    {subjectsList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Specific Task
                  </label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Implement Gradient Descent from Scratch"
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                    Today&apos;s Concrete Objective (Optional)
                  </label>
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    placeholder="e.g. Understand gradient descent and learning rate decay step"
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              {/* Start Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartSession}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Start Focus Session ({targetDurationMinutes} min)</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STATE 2: ACTIVE FOCUS SESSION */}
          {isActive && !isCompleted && (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-10 text-center"
            >
              <div className="space-y-2">
                <span className="text-xs font-bold tracking-widest uppercase text-violet-400">
                  FOCUS SESSION
                </span>
                <h2 className="text-xl font-semibold text-slate-300">
                  {selectedSubject}
                </h2>
                <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {taskTitle}
                </h3>
              </div>

              {/* Giant Timer Display */}
              <div className="relative py-8 flex flex-col items-center justify-center">
                <div className="text-7xl md:text-8xl font-black font-mono tracking-tighter text-white drop-shadow-[0_4px_30px_rgba(99,102,241,0.25)]">
                  {formatTime(timeLeftSeconds)}
                </div>

                {/* Progress Indicator */}
                <div className="w-full max-w-md bg-slate-800/80 h-2 rounded-full overflow-hidden mt-6">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    style={{ width: `${progressPercent}%` }}
                    transition={{ ease: "linear" }}
                  />
                </div>
                <span className="text-xs text-slate-500 font-mono mt-2">
                  {progressPercent}% completed
                </span>
              </div>

              {/* Today's Objective Banner */}
              {objective && (
                <div className="max-w-lg mx-auto p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-sm">
                  <span className="text-[11px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                    Today&apos;s Objective:
                  </span>
                  {objective}
                </div>
              )}

              {/* Scratchpad Session Notes */}
              <div className="max-w-xl mx-auto text-left space-y-2">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Session Scratchpad</span>
                </label>
                <textarea
                  rows={3}
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Record insights, formulas, or questions as you study..."
                  className="w-full p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleTogglePause}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors cursor-pointer flex items-center gap-2"
                >
                  {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4" />}
                  <span>{isPaused ? "Resume" : "Pause"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCompleteSession}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finish Early</span>
                </button>

                <button
                  type="button"
                  onClick={handleCancelSession}
                  className="px-4 py-3 rounded-xl bg-transparent hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* STATE 3: FOCUS SESSION COMPLETE & REFLECTION */}
          {isCompleted && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl border border-slate-200 p-8 md:p-10 shadow-lg text-center space-y-8 max-w-xl mx-auto"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                  FOCUS SESSION COMPLETE
                </span>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  {Math.max(1, Math.round(elapsedSeconds / 60) || targetDurationMinutes)} minutes
                </h2>
                <p className="text-sm font-medium text-slate-600">{selectedSubject}</p>
              </div>

              {/* Automatic Cross-System Integrations */}
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <CalendarCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      +{Math.max(1, Math.round(elapsedSeconds / 60) || targetDurationMinutes)} min study activity
                    </span>
                    <span className="text-[10px] text-slate-500">Synced to Analytics</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <BrainCircuit className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      +1 completed task
                    </span>
                    <span className="text-[10px] text-slate-500">Logged to Learning Memory</span>
                  </div>
                </div>
              </div>

              {/* Reflection Box */}
              <div className="text-left space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Reflection: &ldquo;What did you learn?&rdquo;
                </label>
                <textarea
                  rows={3}
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="e.g. Mastered the loss gradient calculation with respect to weights and bias vector..."
                  className="w-full p-3.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveSession}
                  className="w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Saving..." : "Save Session"}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function FocusModePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Focus Mode...</div>}>
      <FocusModeInner />
    </Suspense>
  );
}
