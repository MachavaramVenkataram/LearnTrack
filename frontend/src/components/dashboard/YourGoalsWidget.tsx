"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Target, ArrowRight, CheckCircle2, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AcademicGoal } from "@/types/academic";
import { getAcademicGoals } from "@/lib/academic/service";
import { useAuth } from "@/lib/auth-context";

export function YourGoalsWidget() {
  const { studentProfile } = useAuth();
  const [goals, setGoals] = useState<AcademicGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!studentProfile) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await getAcademicGoals(studentProfile.id);
        const activeGoals = data.filter((g) => g.status === "active").slice(0, 3);
        setGoals(activeGoals);
      } catch (err) {
        console.error("Failed to load goals for widget:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [studentProfile]);

  return (
    <Card className="h-full flex flex-col justify-between border-slate-200">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-base text-slate-900">Your Goals</CardTitle>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Active targets tracked against academic records
          </CardDescription>
        </div>
        <Link href="/goals">
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            View All Goals
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-3">
        {isLoading ? (
          <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
            Loading active goals...
          </div>
        ) : goals.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <p className="text-xs text-slate-500">
              No active academic targets currently set.
            </p>
            <Link href="/goals">
              <Button variant="outline" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Create a Goal
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {goals.map((goal) => {
              const progress =
                goal.target_value > 0
                  ? Math.min(100, Math.round((goal.current_value / goal.target_value) * 100))
                  : 0;

              return (
                <div
                  key={goal.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                      {goal.title}
                    </span>
                    <span className="font-bold text-slate-900 font-sans">
                      {goal.current_value} / {goal.target_value}
                      {goal.unit || ""}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Progress</span>
                      <span className={progress >= 100 ? "text-emerald-600 font-bold" : "text-blue-600 font-bold"}>
                        {progress}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progress >= 100 ? "bg-emerald-500" : "bg-blue-600"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Synced with coursework data</span>
          <Link href="/goals" className="text-blue-600 hover:underline font-medium">
            Manage &rarr;
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
