"use client";

import { useCallback } from "react";
import type { HuenicBrand, WeeklyReport } from "@/data/huenic-types";
import { useWeeklyReport } from "@/hooks/useWeeklyReport";
import MetricsRow from "./MetricsRow";
import TopContent from "./TopContent";
import CoachComment from "./CoachComment";
import NextWeekPlan from "./NextWeekPlan";

interface WeeklyReportTabProps {
  brand: HuenicBrand;
}

/** Parse "2026-4월-1w" → { year, month, week } */
function parseMonthWeek(w: string): { year: number; month: number; week: number } {
  const match = w.match(/^(\d{4})-(\d{1,2})월-(\d)w$/);
  if (!match) return { year: 2026, month: 1, week: 1 };
  return { year: Number(match[1]), month: Number(match[2]), week: Number(match[3]) };
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div className={`bg-gray-100 rounded-xl animate-pulse ${className ?? ""}`} />
  );
}

export default function WeeklyReportTab({ brand }: WeeklyReportTabProps) {
  const { report, loading, error, week, setWeek, saveReport } =
    useWeeklyReport(brand);

  const { month, week: weekNum } = parseMonthWeek(week);

  const handlePrev = () => {
    const match = week.match(/^(\d{4})-(\d{1,2})월-(\d)w$/);
    if (!match) return;
    let [, y, m, w] = match.map(Number);
    w -= 1;
    if (w < 1) { m -= 1; if (m < 1) { m = 12; y -= 1; } w = 4; }
    setWeek(`${y}-${m}월-${w}w`);
  };
  const handleNext = () => {
    const match = week.match(/^(\d{4})-(\d{1,2})월-(\d)w$/);
    if (!match) return;
    let [, y, m, w] = match.map(Number);
    w += 1;
    if (w > 4) { m += 1; if (m > 12) { m = 1; y += 1; } w = 1; }
    setWeek(`${y}-${m}월-${w}w`);
  };

  const handleCoachSave = useCallback(
    async (comment: NonNullable<WeeklyReport["coachComment"]>) => {
      if (!report) return;
      try {
        await saveReport({ ...report, coachComment: comment });
      } catch {
        alert("저장에 실패했습니다. 다시 시도해주세요.");
      }
    },
    [report, saveReport]
  );

  const handlePlanSave = useCallback(
    async (plans: string[]) => {
      if (!report) return;
      try {
        await saveReport({ ...report, nextWeekPlan: plans });
      } catch {
        alert("저장에 실패했습니다. 다시 시도해주세요.");
      }
    },
    [report, saveReport]
  );

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handlePrev}
          className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          aria-label="이전 주"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">
            {month}월 {weekNum}주차
          </p>
          {report?.period && (
            <p className="text-xs text-gray-500">{report.period}</p>
          )}
        </div>
        <button
          onClick={handleNext}
          className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          aria-label="다음 주"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 text-center">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <SkeletonBlock key={i} className="h-24" />
            ))}
          </div>
          <SkeletonBlock className="h-40" />
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-28" />
        </div>
      )}

      {/* Empty */}
      {!loading && !error && !report && (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-gray-400">
            이 주의 리포트가 아직 없습니다.
          </p>
        </div>
      )}

      {/* Report Content */}
      {!loading && !error && report && (
        <>
          {/* Metrics */}
          <MetricsRow metrics={report.metrics} />

          {/* Top Content */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              이번 주 베스트 콘텐츠
            </h2>
            <TopContent items={report.topContent} />
          </section>

          {/* Comment */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              코멘트
            </h2>
            <CoachComment
              comment={report.coachComment}
              onSave={handleCoachSave}
            />
          </section>

          {/* Next Week Plan */}
          <section>
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              다음 주 계획
            </h2>
            <NextWeekPlan
              plans={report.nextWeekPlan}
              onSave={handlePlanSave}
            />
          </section>
        </>
      )}
    </div>
  );
}
