"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./Card";
import { Tabs } from "./Tabs";
import { cn } from "@/lib/utils";

export interface ChartCardProps {
  title: string;
  description?: string;
  periods?: string[];
  activePeriod?: string;
  onPeriodChange?: (period: string) => void;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  description,
  periods = ["1M", "3M", "6M", "1Y"],
  activePeriod,
  onPeriodChange,
  headerAction,
  children,
  className,
}: ChartCardProps) {
  const periodTabs = periods.map((p) => ({ id: p, label: p }));

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-100">
        <div>
          <CardTitle className="text-base text-slate-900">{title}</CardTitle>
          {description && (
            <CardDescription className="mt-0.5">{description}</CardDescription>
          )}
        </div>
        <div className="flex items-center gap-3">
          {headerAction}
          {onPeriodChange && activePeriod && (
            <Tabs
              size="sm"
              tabs={periodTabs}
              activeTab={activePeriod}
              onChange={onPeriodChange}
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
}
