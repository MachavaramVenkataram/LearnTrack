"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2, AlertTriangle, Info, Lightbulb, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AcademicInsight } from "@/lib/academic/calculations";

export interface DataInsightsCardProps {
  insights: AcademicInsight[];
}

export function DataInsightsCard({ insights }: DataInsightsCardProps) {
  // Show up to 3 relevant insights (Section 23)
  const displayInsights = insights.slice(0, 3);

  const getIcon = (type: AcademicInsight["type"]) => {
    switch (type) {
      case "positive":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />;
      case "info":
      default:
        return <Lightbulb className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />;
    }
  };

  const getContainerStyle = (type: AcademicInsight["type"]) => {
    switch (type) {
      case "positive":
        return "bg-emerald-50/50 border-emerald-100/80 text-emerald-950";
      case "warning":
        return "bg-amber-50/50 border-amber-100/80 text-amber-950";
      case "info":
      default:
        return "bg-blue-50/50 border-blue-100/80 text-blue-950";
    }
  };

  return (
    <Card className="border-slate-200/90 shadow-card flex flex-col justify-between h-full">
      <div>
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              AI Performance Insights
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Automated pattern detection from continuous academic activity
            </CardDescription>
          </div>

          <Badge variant="secondary" size="sm">
            Top {displayInsights.length}
          </Badge>
        </CardHeader>

        <CardContent className="pt-4 space-y-2.5">
          {displayInsights.length > 0 ? (
            displayInsights.map((insight) => (
              <div
                key={insight.id}
                className={`p-3 rounded-xl border flex items-start gap-3 transition-all hover:border-slate-300 ${getContainerStyle(
                  insight.type
                )}`}
              >
                {getIcon(insight.type)}
                <div className="space-y-0.5 text-xs flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-slate-900 leading-tight">
                      {insight.title}
                    </h5>
                    <Link
                      href="/insights"
                      className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 hidden sm:inline-block"
                    >
                      View Insight →
                    </Link>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {insight.description}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 px-4 text-center flex flex-col items-center justify-center space-y-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-900 font-sans">No automated insights yet</h4>
                <p className="text-[11.5px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Log coursework evaluations and study hours to trigger intelligent performance feedback.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </div>

      {/* Button: View All Insights (Section 23) */}
      <CardFooter className="pt-2 pb-4 px-5 border-t border-slate-100 bg-slate-50/30 rounded-b-2xl">
        <Link href="/insights" className="w-full">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-center text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50/60 bg-white"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View All Insights
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
