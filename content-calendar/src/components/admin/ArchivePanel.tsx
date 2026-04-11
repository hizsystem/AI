"use client";

import { useEffect, useState } from "react";
import type { ArchiveItem, ArchiveItemType } from "@/data/types";

interface ProjectInfo {
  slug: string;
  name: string;
  brandColor: string;
  emoji?: string;
}

const TYPE_LABELS: Record<ArchiveItemType, string> = {
  url: "배포 URL",
  html: "HTML 파일",
  external: "외부 링크",
  sheet: "마스터시트",
};

const TYPE_COLORS: Record<ArchiveItemType, string> = {
  url: "bg-blue-50 text-blue-600",
  html: "bg-emerald-50 text-emerald-600",
  external: "bg-violet-50 text-violet-600",
  sheet: "bg-amber-50 text-amber-600",
};

const CATEGORY_PRESETS = [
  "킥오프 덱",
  "월간 보고서",
  "콘텐츠 캘린더",
  "제안서",
  "브랜드 가이드",
  "캠페인 리포트",
  "공유 링크",
  "마스터시트",
  "기타",
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default function ArchivePanel({ projects, filterSlug }: { projects: ProjectInfo[]; filterSlug?: string }) {
  const isEmbedded = !!filterSlug; // true when inside a project's channel tab
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterClient, setFilterClient] = useState<string>(filterSlug || "all");
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    title: "",
    url: "",
    type: "url" as ArchiveItemType,
    clientSlug: filterSlug || projects[0]?.slug || "",
    category: CATEGORY_PRESETS[0],
    customCategory: "",
    date: new Date().toISOString().slice(0, 10),
    description: "",
  });

  useEffect(() => {
    fetch("/api/admin/archive")
      .then((res) => res.ok ? res.json() : [])
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const category = form.category === "기타" && form.customCategory
      ? form.customCategory
      : form.category;
    const res = await fetch("/api/admin/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, category }),
    });
    if (res.ok) {
      const newItem = await res.json();
      setItems((prev) => [newItem, ...prev]);
      setShowForm(false);
      setForm({
        title: "",
        url: "",
        type: "url",
        clientSlug: filterSlug || projects[0]?.slug || "",
        category: CATEGORY_PRESETS[0],
        customCategory: "",
        date: new Date().toISOString().slice(0, 10),
        description: "",
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("이 아카이브를 삭제하시겠습니까?")) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/archive?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
    setDeleting(null);
  }

  const filtered = filterClient === "all"
    ? items
    : items.filter((i) => i.clientSlug === filterClient);

  // Group by client
  const grouped = new Map<string, ArchiveItem[]>();
  for (const item of filtered) {
    const list = grouped.get(item.clientSlug) || [];
    list.push(item);
    grouped.set(item.clientSlug, list);
  }

  const projectMap = new Map(projects.map((p) => [p.slug, p]));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        {!isEmbedded && (
          <div>
            <h2 className="text-lg font-bold text-gray-900">Archive</h2>
            <p className="text-xs text-gray-400 mt-1">클라이언트 납품물 아카이브</p>
          </div>
        )}
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
        >
          {showForm ? "취소" : "+ 등록"}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">제목 *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="예: 휴닉 킥오프 덱 v2"
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">URL *</label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://..."
                required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
              />
            </div>
          </div>

          <div className={`grid gap-4 ${isEmbedded ? "grid-cols-3" : "grid-cols-4"}`}>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">유형</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as ArchiveItemType })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
              >
                <option value="url">배포 URL</option>
                <option value="html">HTML 파일</option>
                <option value="external">외부 링크</option>
                <option value="sheet">마스터시트</option>
              </select>
            </div>
            {!isEmbedded && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">클라이언트 *</label>
                <select
                  value={form.clientSlug}
                  onChange={(e) => setForm({ ...form, clientSlug: e.target.value })}
                  required
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
                >
                  {projects.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.emoji ? `${p.emoji} ` : ""}{p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">카테고리</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
              >
                {CATEGORY_PRESETS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">날짜</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
              />
            </div>
          </div>

          {form.category === "기타" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">커스텀 카테고리</label>
              <input
                type="text"
                value={form.customCategory}
                onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
                placeholder="카테고리명 직접 입력"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">메모 (선택)</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="전달 맥락이나 버전 메모"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              등록
            </button>
          </div>
        </form>
      )}

      {/* Filter — hide in embedded (per-project) mode */}
      {items.length > 0 && !isEmbedded && (
        <div className="flex gap-2">
          <button
            onClick={() => setFilterClient("all")}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
              filterClient === "all"
                ? "bg-gray-900 text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            전체
          </button>
          {projects.map((p) => (
            <button
              key={p.slug}
              onClick={() => setFilterClient(p.slug)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                filterClient === p.slug
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {p.emoji ? `${p.emoji} ` : ""}{p.name}
            </button>
          ))}
        </div>
      )}

      {/* Items grouped by client */}
      {items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <p className="text-sm text-gray-400">아직 아카이브된 항목이 없습니다</p>
          <p className="text-xs text-gray-300 mt-1">위 &quot;+ 등록&quot; 버튼으로 납품물을 추가하세요</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-sm text-gray-400">
          해당 클라이언트의 아카이브가 없습니다
        </div>
      ) : (
        Array.from(grouped.entries()).map(([slug, clientItems]) => {
          const proj = projectMap.get(slug);
          return (
            <div key={slug}>
              {filterClient === "all" && !isEmbedded && (
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: proj?.brandColor || "#888" }}
                  />
                  <h3 className="text-sm font-semibold text-gray-700">
                    {proj?.emoji ? `${proj.emoji} ` : ""}{proj?.name || slug}
                  </h3>
                  <span className="text-xs text-gray-300">{clientItems.length}</span>
                </div>
              )}
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {clientItems.map((item) => (
                  <div key={item.id} className="px-5 py-4 flex items-start gap-4 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors truncate"
                        >
                          {item.title}
                          <span className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" strokeLinecap="round"/>
                              <polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round"/>
                            </svg>
                          </span>
                        </a>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[item.type]}`}>
                          {TYPE_LABELS[item.type]}
                        </span>
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {item.category}
                        </span>
                        {item.description && (
                          <span className="text-xs text-gray-400">{item.description}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-gray-300">{formatDate(item.date)}</span>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleting === item.id}
                        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="3 6 5 6 21 6" strokeLinecap="round"/>
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
