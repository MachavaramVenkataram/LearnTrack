"use client";

import React from "react";
import { History, BookOpen, TrendingUp, Clock, User, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { RecentActivityItem } from "@/lib/academic/service";

export interface RecentActivityCardProps {
  activities: RecentActivityItem[];
}

export function RecentActivityCard({ activities }: RecentActivityCardProps) {
  const getIcon = (type: RecentActivityItem["type"]) => {
    switch (type) {
      case "subject":
        return <BookOpen className="w-3.5 h-3.5 text-blue-600" />;
      case "record":
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />;
      case "study":
        return <Clock className="w-3.5 h-3.5 text-indigo-600" />;
      case "profile":
        return <User className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return "Just now";
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;

      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recent";
    }
  };

  return (
    <Card className="border-slate-200/90 shadow-card flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-4 h-4 text-blue-600" />
          Recent Activity
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 mt-0.5">
          Chronological timeline of changes and submissions
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4">
        {activities.length === 0 ? (
          <div className="py-8 px-4 text-center flex flex-col items-center justify-center space-y-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shadow-2xs">
              <History className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-slate-900 font-sans">No recent activity yet</h4>
              <p className="text-[11.5px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                Coursework logs, study records, and milestone achievements will form a live timeline here.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activities.map((item) => (
              <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate leading-snug">
                    {item.description}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0 mt-0.5">
                  {formatTimestamp(item.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
