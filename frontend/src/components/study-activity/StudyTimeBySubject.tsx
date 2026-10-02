"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { BookOpen, ArrowUpRight, Clock } from "lucide-react";
import { StudyActivity, Subject } from "@/types/academic";

export interface StudyTimeBySubjectProps {
  activities: StudyActivity[];
  subjects: Subject[];
}

interface SubjectStudyAggregate {
  subjectId?: string;
  subjectName: string;
  subjectCode?: string;
  totalHours: number;
  sessionsCount: number;
  percentage: number;
}

export function StudyTimeBySubject({ activities, subjects }: StudyTimeBySubjectProps) {
  const aggregates = useMemo(() => {
    if (!activities || activities.length === 0) return [];

    const totalHours = activities.reduce((acc, a) => acc + (Number(a.study_hours) || 0), 0);
    if (totalHours <= 0) return [];

    // Map subjects by normalized lowercase name
    const subjectLookup = new Map<string, Subject>();
    subjects.forEach((s) => {
      subjectLookup.set(s.subject_name.toLowerCase().trim(), s);
      if (s.subject_code) {
        subjectLookup.set(s.subject_code.toLowerCase().trim(), s);
      }
    });

    const groupMap = new Map<string, { subject?: Subject; hours: number; sessions: number }>();

    activities.forEach((act) => {
      const hours = Number(act.study_hours) || 0;
      const notes = (act.notes || "").trim();

      // Check if notes has [Subject Name] format or mentions subject
      let matchedSubject: Subject | undefined;

      const tagMatch = notes.match(/^\[(.*?)\]/);
      if (tagMatch && tagMatch[1]) {
        matchedSubject = subjectLookup.get(tagMatch[1].toLowerCase().trim());
      }

      if (!matchedSubject) {
        const lowerNotes = notes.toLowerCase();
        for (const [key, sub] of subjectLookup.entries()) {
          if (lowerNotes.includes(key)) {
            matchedSubject = sub;
            break;
          }
        }
      }

      const groupKey = matchedSubject ? matchedSubject.id : "general-study";
      const existing = groupMap.get(groupKey) || {
        subject: matchedSubject,
        hours: 0,
        sessions: 0,
      };

      existing.hours += hours;
      existing.sessions += 1;
      groupMap.set(groupKey, existing);
    });

    const result: SubjectStudyAggregate[] = [];
    groupMap.forEach((val) => {
      const roundedHours = Math.round(val.hours * 10) / 10;
      const pct = totalHours > 0 ? Math.round((roundedHours / totalHours) * 100) : 0;

      result.push({
        subjectId: val.subject?.id,
        subjectName: val.subject ? val.subject.subject_name : "General Coursework",
        subjectCode: val.subject?.subject_code,
        totalHours: roundedHours,
        sessionsCount: val.sessions,
        percentage: pct,
      });
    });

    // Sort descending by hours
    return result.sort((a, b) => b.totalHours - a.totalHours);
  }, [activities, subjects]);

  const hasData = aggregates.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#0F172A] tracking-tight flex items-center gap-2">
            <span>STUDY TIME BY SUBJECT</span>
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Focus allocation across academic coursework.
          </p>
        </div>

        {hasData && (
          <span className="text-[11px] font-semibold text-[#64748B] bg-slate-100 px-2 py-0.5 rounded-md">
            {aggregates.length} subject{aggregates.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {!hasData ? (
        <div className="py-8 px-4 text-center rounded-xl bg-[#F8FAFC] border border-dashed border-[#E2E8F0] space-y-1.5">
          <BookOpen className="w-5 h-5 text-slate-400 mx-auto" />
          <p className="text-xs font-semibold text-[#0F172A]">No subject breakdown yet</p>
          <p className="text-[11px] text-[#64748B] max-w-xs mx-auto leading-relaxed">
            Tag subjects when logging study sessions to visualize your focus distribution.
          </p>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {aggregates.map((item) => {
            const wholeHours = Math.floor(item.totalHours);
            const minutes = Math.round((item.totalHours - wholeHours) * 60);
            const durationStr =
              wholeHours > 0 && minutes > 0
                ? `${wholeHours}h ${minutes}m`
                : wholeHours > 0
                ? `${wholeHours}h`
                : `${minutes}m`;

            const content = (
              <div className="space-y-2 p-2.5 -mx-2.5 rounded-xl hover:bg-[#F8FAFC] transition-colors duration-150 group">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-[#0F172A] group-hover:text-[#2563EB] transition-colors truncate">
                      {item.subjectName}
                    </span>
                    {item.subjectCode && (
                      <span className="text-[10px] font-mono text-[#64748B] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60 shrink-0">
                        {item.subjectCode}
                      </span>
                    )}
                    {item.subjectId && (
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 text-right">
                    <span className="font-bold text-[#0F172A]">{durationStr}</span>
                    <span className="text-[11px] text-[#64748B] w-8 text-right font-medium">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-[#2563EB] rounded-full transition-all duration-500 ease-out group-hover:bg-[#1D4ED8]"
                    style={{ width: `${Math.min(item.percentage, 100)}%` }}
                  />
                </div>
              </div>
            );

            return item.subjectId ? (
              <Link key={item.subjectName} href={`/subjects/${item.subjectId}`} className="block">
                {content}
              </Link>
            ) : (
              <div key={item.subjectName}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
