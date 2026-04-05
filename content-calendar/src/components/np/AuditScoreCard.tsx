"use client";

import type { NpAuditData, NpCategory } from "@/data/np-types";
import { NP_CATEGORY_CONFIG } from "@/data/np-types";

interface AuditScoreCardProps {
  audit: NpAuditData | null;
}

function gradeColor(grade: string): string {
  const map: Record<string, string> = {
    S: "text-emerald-600",
    A: "text-blue-600",
    B: "text-amber-600",
    C: "text-orange-600",
    D: "text-red-600",
  };
  return map[grade] || "text-gray-600";
}

export default function AuditScoreCard({ audit }: AuditScoreCardProps) {
  if (!audit) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
        <p className="text-4xl font-bold text-gray-200">—</p>
        <p className="text-xs text-gray-300 mt-2">/ 100점</p>
        <p className="text-[11px] text-gray-300 mt-4">
          진단 데이터를 등록하면 점수가 표시됩니다
        </p>
      </div>
    );
  }

  // Group items by category
  const categoryScores: Record<NpCategory, number> = { S: 0, A: 0, B: 0, X: 0 };
  for (const item of audit.items) {
    categoryScores[item.category] += item.score;
  }

  return (
    <div className="space-y-4">
      {/* Total score */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
        <div className="flex items-baseline justify-center gap-2">
          <p className={`text-5xl font-bold ${gradeColor(audit.grade)}`}>
            {audit.totalScore}
          </p>
          <p className="text-lg text-gray-300">/ 100</p>
        </div>
        <p className={`text-sm font-semibold mt-1 ${gradeColor(audit.grade)}`}>
          {audit.grade}등급
        </p>
        <p className="text-[11px] text-gray-400 mt-2">
          {audit.storeName} · {audit.auditDate}
        </p>
      </div>

      {/* Category breakdown */}
      <div className="space-y-2">
        {(["S", "A", "B", "X"] as NpCategory[]).map((cat) => {
          const config = NP_CATEGORY_CONFIG[cat];
          const score = categoryScores[cat];
          const pct = Math.round((score / config.maxScore) * 100);

          return (
            <div key={cat} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">{config.label}</span>
                <span className="text-sm font-bold" style={{ color: config.color }}>
                  {score} / {config.maxScore}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: config.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Item details */}
      <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
        {audit.items.map((item) => (
          <div key={item.id} className="px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-gray-400 w-6">{item.id}</span>
              <span className="text-sm text-gray-700">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">
                {item.score}/{item.maxScore}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  item.status === "good"
                    ? "bg-emerald-400"
                    : item.status === "needs-improve"
                    ? "bg-amber-400"
                    : "bg-red-400"
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
