"use client";

import { useState } from "react";
import {
  NP_AUDIT_TEMPLATE,
  NP_CATEGORY_CONFIG,
  type NpAuditData,
  type NpAuditItem,
  type NpGrade,
  type NpCategory,
  type NpItemStatus,
} from "@/data/np-types";

interface AuditInputFormProps {
  storeId: string;
  storeName: string;
  existing?: NpAuditData | null;
  onSave: (data: NpAuditData) => Promise<void>;
  onClose: () => void;
}

function calcGrade(score: number): NpGrade {
  if (score >= 90) return "S";
  if (score >= 75) return "A";
  if (score >= 55) return "B";
  if (score >= 35) return "C";
  return "D";
}

function calcStatus(score: number, maxScore: number): NpItemStatus {
  const pct = score / maxScore;
  if (pct >= 0.7) return "good";
  if (pct >= 0.4) return "needs-improve";
  return "urgent";
}

export default function AuditInputForm({
  storeId,
  storeName,
  existing,
  onSave,
  onClose,
}: AuditInputFormProps) {
  const [scores, setScores] = useState<Record<string, number>>(() => {
    if (existing) {
      return Object.fromEntries(existing.items.map((i) => [i.id, i.score]));
    }
    return Object.fromEntries(NP_AUDIT_TEMPLATE.map((t) => [t.id, 0]));
  });
  const [saving, setSaving] = useState(false);

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const grade = calcGrade(totalScore);

  function setScore(id: string, value: number, max: number) {
    setScores((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(max, value)),
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const items: NpAuditItem[] = NP_AUDIT_TEMPLATE.map((t) => ({
        ...t,
        score: scores[t.id] || 0,
        status: calcStatus(scores[t.id] || 0, t.maxScore),
      }));

      const data: NpAuditData = {
        storeId,
        storeName,
        auditDate: new Date().toISOString().slice(0, 10),
        totalScore,
        grade,
        items,
      };

      await onSave(data);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  // Group by category
  const categories: NpCategory[] = ["S", "A", "B", "X"];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="bg-white shadow-2xl w-full max-w-[480px] h-full overflow-hidden flex flex-col animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">NP 진단</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">{storeName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Score summary */}
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{totalScore}</span>
            <span className="text-sm text-gray-300">/ 100</span>
          </div>
          <span
            className={`text-lg font-bold ${
              grade === "S" ? "text-emerald-600" :
              grade === "A" ? "text-blue-600" :
              grade === "B" ? "text-amber-600" :
              grade === "C" ? "text-orange-600" : "text-red-600"
            }`}
          >
            {grade}등급
          </span>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {categories.map((cat) => {
            const config = NP_CATEGORY_CONFIG[cat];
            const catItems = NP_AUDIT_TEMPLATE.filter((t) => t.category === cat);
            const catScore = catItems.reduce((a, t) => a + (scores[t.id] || 0), 0);

            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold" style={{ color: config.color }}>
                    {config.label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {catScore} / {config.maxScore}
                  </span>
                </div>

                <div className="space-y-2">
                  {catItems.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 px-3 py-2">
                      <span className="text-[10px] font-mono text-gray-400 w-6 flex-shrink-0">{t.id}</span>
                      <span className="text-sm text-gray-700 flex-1">{t.name}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <input
                          type="number"
                          min={0}
                          max={t.maxScore}
                          value={scores[t.id] || 0}
                          onChange={(e) => setScore(t.id, parseInt(e.target.value) || 0, t.maxScore)}
                          className="w-12 px-2 py-1 text-sm text-center border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-gray-300"
                        />
                        <span className="text-[11px] text-gray-300">/ {t.maxScore}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
