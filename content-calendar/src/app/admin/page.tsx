"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ContentItem } from "@/data/types";

interface ClientSummary {
  slug: string;
  name: string;
  brandColor: string;
  logo: { src: string; alt: string } | null;
  tabs: string[];
  brands?: { id: string; label: string; emoji: string }[];
  currentMonth: string;
  stats: {
    total: number;
    planning: number;
    needsConfirm: number;
    uploaded: number;
  };
  nextContent: { date: string; title: string } | null;
  thisWeekItems: ContentItem[];
}

interface SummaryData {
  summaries: ClientSummary[];
  week: { start: string; end: string };
  currentMonth: string;
}

type StatusFilter = "all" | "planning" | "needs-confirm" | "uploaded";

const STATUS_LABELS: Record<string, string> = {
  planning: "기획",
  "needs-confirm": "컨펌 필요",
  uploaded: "업로드 완료",
};

const STATUS_COLORS: Record<string, string> = {
  planning: "bg-gray-100 text-gray-700",
  "needs-confirm": "bg-amber-50 text-amber-700",
  uploaded: "bg-emerald-50 text-emerald-700",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}(${["일", "월", "화", "수", "목", "금", "토"][d.getDay()]})`;
}

function formatMonthLabel(month: string): string {
  const [y, m] = month.split("-");
  return `${y}년 ${parseInt(m)}월`;
}

export default function AdminDashboard() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [view, setView] = useState<"cards" | "week">("cards");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/summary")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((d) => d && setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Collect all this-week items across clients for week view
  const allWeekItems = data.summaries.flatMap((s) =>
    s.thisWeekItems.map((item) => ({ ...item, clientName: s.name, clientSlug: s.slug, brandColor: s.brandColor }))
  );

  const filteredWeekItems =
    filter === "all"
      ? allWeekItems
      : allWeekItems.filter((i) => (i.status || "planning") === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Content Calendar</h1>
            <p className="text-xs text-gray-400 mt-0.5">{formatMonthLabel(data.currentMonth)}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* View toggle + Status filter */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-white rounded-lg border border-gray-100 p-1">
            <button
              onClick={() => setView("cards")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                view === "cards" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              클라이언트
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                view === "week" ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              이번 주
            </button>
          </div>

          <div className="flex gap-1">
            {(["all", "planning", "needs-confirm", "uploaded"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                  filter === s
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {s === "all" ? "전체" : STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Cards View */}
        {view === "cards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.summaries.map((client) => (
              <div
                key={client.slug}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/clients/${client.slug}`)}
              >
                {/* Color bar */}
                <div className="h-1" style={{ backgroundColor: client.brandColor }} />

                <div className="p-5">
                  {/* Client header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {client.logo ? (
                        <img
                          src={client.logo.src}
                          alt={client.logo.alt}
                          className="h-8 w-8 object-contain rounded"
                        />
                      ) : (
                        <div
                          className="h-8 w-8 rounded flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: client.brandColor }}
                        >
                          {client.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{client.name}</h3>
                        {client.brands && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {client.brands.map((b) => `${b.emoji} ${b.label}`).join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {client.tabs.length}개 탭
                    </span>
                  </div>

                  {/* Stats row */}
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-gray-900">{client.stats.total}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">전체</p>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-gray-500">{client.stats.planning}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">기획</p>
                    </div>
                    <div className="flex-1 bg-amber-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-amber-600">{client.stats.needsConfirm}</p>
                      <p className="text-[10px] text-amber-500 mt-0.5">컨펌 필요</p>
                    </div>
                    <div className="flex-1 bg-emerald-50 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-emerald-600">{client.stats.uploaded}</p>
                      <p className="text-[10px] text-emerald-500 mt-0.5">완료</p>
                    </div>
                  </div>

                  {/* Next content */}
                  {client.nextContent && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="text-gray-300">다음</span>
                      <span className="font-medium text-gray-700">
                        {formatDate(client.nextContent.date)}
                      </span>
                      <span className="truncate">{client.nextContent.title}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Week View */}
        {view === "week" && (
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-900">
                이번 주 콘텐츠
                <span className="ml-2 text-gray-400 font-normal">
                  {formatDate(data.week.start)} — {formatDate(data.week.end)}
                </span>
              </h2>
            </div>

            {filteredWeekItems.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-gray-400">
                {filter === "all"
                  ? "이번 주 예정된 콘텐츠가 없습니다"
                  : `이번 주 "${STATUS_LABELS[filter]}" 상태 콘텐츠가 없습니다`}
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredWeekItems.map((item) => (
                  <div
                    key={`${item.clientSlug}-${item.id}`}
                    className="px-5 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="w-1 h-8 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.brandColor }}
                    />
                    <div className="flex-shrink-0 w-16">
                      <span className="text-xs font-medium text-gray-700">
                        {formatDate(item.date)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{item.title}</p>
                      <p className="text-xs text-gray-400">{item.clientName}</p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${
                        STATUS_COLORS[item.status || "planning"]
                      }`}
                    >
                      {STATUS_LABELS[item.status || "planning"]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
