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

const STATUS_LABELS: Record<string, string> = {
  planning: "기획",
  "needs-confirm": "컨펌 필요",
  uploaded: "업로드 완료",
};

const STATUS_DOT: Record<string, string> = {
  planning: "bg-gray-300",
  "needs-confirm": "bg-amber-400",
  uploaded: "bg-emerald-400",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}(${["일", "월", "화", "수", "목", "금", "토"][d.getDay()]})`;
}

function formatMonthLabel(month: string): string {
  const [, m] = month.split("-");
  return `${parseInt(m)}월`;
}

// ─── Overview Panel ───
function OverviewPanel({ data }: { data: SummaryData }) {
  const allWeekItems = data.summaries.flatMap((s) =>
    s.thisWeekItems.map((item) => ({
      ...item,
      clientName: s.name,
      clientSlug: s.slug,
      brandColor: s.brandColor,
    }))
  );

  const totalStats = data.summaries.reduce(
    (acc, s) => ({
      total: acc.total + s.stats.total,
      planning: acc.planning + s.stats.planning,
      needsConfirm: acc.needsConfirm + s.stats.needsConfirm,
      uploaded: acc.uploaded + s.stats.uploaded,
    }),
    { total: 0, planning: 0, needsConfirm: 0, uploaded: 0 }
  );

  const needsAction = allWeekItems.filter(
    (i) => (i.status || "planning") !== "uploaded"
  );

  return (
    <div className="space-y-6">
      {/* Stats summary */}
      <div>
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          {formatMonthLabel(data.currentMonth)} 현황
        </h2>
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalStats.total}</p>
            <p className="text-[11px] text-gray-400 mt-1">전체</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gray-500">{totalStats.planning}</p>
            <p className="text-[11px] text-gray-400 mt-1">기획</p>
          </div>
          <div className="bg-white rounded-xl border border-amber-100 p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{totalStats.needsConfirm}</p>
            <p className="text-[11px] text-amber-500 mt-1">컨펌 필요</p>
          </div>
          <div className="bg-white rounded-xl border border-emerald-100 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{totalStats.uploaded}</p>
            <p className="text-[11px] text-emerald-500 mt-1">완료</p>
          </div>
        </div>
      </div>

      {/* Action items - things that need attention */}
      <div>
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          이번 주 체크리스트
          <span className="ml-2 text-gray-300 font-normal normal-case">
            {formatDate(data.week.start)} — {formatDate(data.week.end)}
          </span>
        </h2>
        {needsAction.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-gray-400">
            이번 주 처리할 콘텐츠가 없습니다
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {needsAction.map((item) => (
              <div
                key={`${item.clientSlug}-${item.id}`}
                className="px-4 py-3 flex items-center gap-3"
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[item.status || "planning"]}`}
                />
                <div className="flex-shrink-0 w-20">
                  <span className="text-xs text-gray-500">{formatDate(item.date)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{item.title}</p>
                </div>
                <span className="text-[11px] text-gray-400 flex-shrink-0">
                  {item.clientName}
                </span>
                <span className="text-[10px] text-gray-400 flex-shrink-0">
                  {STATUS_LABELS[item.status || "planning"]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming schedule per client */}
      <div>
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          다음 일정
        </h2>
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {data.summaries.map((client) => (
            <div key={client.slug} className="px-4 py-3 flex items-center gap-3">
              <div
                className="w-2 h-6 rounded-full flex-shrink-0"
                style={{ backgroundColor: client.brandColor }}
              />
              <span className="text-sm font-medium text-gray-700 w-32 flex-shrink-0 truncate">
                {client.name}
              </span>
              {client.nextContent ? (
                <>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatDate(client.nextContent.date)}
                  </span>
                  <span className="text-xs text-gray-400 truncate">
                    {client.nextContent.title}
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-300">예정된 콘텐츠 없음</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Full week timeline */}
      <div>
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          이번 주 전체 콘텐츠
        </h2>
        {allWeekItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-gray-400">
            이번 주 콘텐츠가 없습니다
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {allWeekItems
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((item) => (
                <div
                  key={`${item.clientSlug}-${item.id}`}
                  className="px-4 py-3 flex items-center gap-3"
                >
                  <div
                    className="w-1 h-8 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.brandColor }}
                  />
                  <span className="text-xs font-medium text-gray-600 w-20 flex-shrink-0">
                    {formatDate(item.date)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{item.title}</p>
                    <p className="text-[11px] text-gray-400">{item.clientName}</p>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[item.status || "planning"]}`}
                  />
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Client Detail Panel ───
function ClientPanel({ client }: { client: ClientSummary }) {
  return (
    <div className="space-y-6">
      {/* Client header */}
      <div className="flex items-center gap-3">
        {client.logo ? (
          <img src={client.logo.src} alt={client.logo.alt} className="h-10 w-10 object-contain rounded-lg" />
        ) : (
          <div
            className="h-10 w-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: client.brandColor }}
          >
            {client.name.charAt(0)}
          </div>
        )}
        <div>
          <h2 className="text-base font-semibold text-gray-900">{client.name}</h2>
          {client.brands && (
            <p className="text-xs text-gray-400">
              {client.brands.map((b) => `${b.emoji} ${b.label}`).join(" · ")}
            </p>
          )}
        </div>
        <a
          href={`/clients/${client.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          캘린더 열기 &rarr;
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{client.stats.total}</p>
          <p className="text-[11px] text-gray-400 mt-1">전체</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-500">{client.stats.planning}</p>
          <p className="text-[11px] text-gray-400 mt-1">기획</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{client.stats.needsConfirm}</p>
          <p className="text-[11px] text-amber-500 mt-1">컨펌 필요</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{client.stats.uploaded}</p>
          <p className="text-[11px] text-emerald-500 mt-1">완료</p>
        </div>
      </div>

      {/* Next content */}
      {client.nextContent && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-1">다음 콘텐츠</p>
          <p className="text-sm font-medium text-gray-900">{client.nextContent.title}</p>
          <p className="text-xs text-gray-500 mt-1">{formatDate(client.nextContent.date)}</p>
        </div>
      )}

      {/* This week's content for this client */}
      <div>
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          이번 주 콘텐츠
        </h3>
        {client.thisWeekItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-gray-400">
            이번 주 콘텐츠가 없습니다
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {client.thisWeekItems
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((item) => (
                <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[item.status || "planning"]}`}
                  />
                  <span className="text-xs text-gray-500 w-20 flex-shrink-0">
                    {formatDate(item.date)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-[11px] text-gray-400">{item.subtitle}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">
                    {STATUS_LABELS[item.status || "planning"]}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ───
export default function AdminDashboard() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
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

  const activeClient = data.summaries.find((s) => s.slug === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-screen">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-50">
          <h1 className="text-sm font-semibold text-gray-900">Brand Dashboard</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">{formatMonthLabel(data.currentMonth)}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {/* Overview */}
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full px-5 py-2.5 flex items-center gap-3 text-left text-sm transition-colors ${
              activeTab === "overview"
                ? "bg-gray-50 text-gray-900 font-medium"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            <div className="w-5 h-5 rounded bg-gray-900 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <span>전체</span>
          </button>

          {/* Divider */}
          <div className="mx-5 my-2 border-t border-gray-100" />

          {/* Client tabs */}
          <p className="px-5 py-1 text-[10px] text-gray-300 uppercase tracking-wider">Clients</p>
          {data.summaries.map((client) => (
            <button
              key={client.slug}
              onClick={() => setActiveTab(client.slug)}
              className={`w-full px-5 py-2.5 flex items-center gap-3 text-left text-sm transition-colors ${
                activeTab === client.slug
                  ? "bg-gray-50 text-gray-900 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <div
                className="w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                style={{ backgroundColor: client.brandColor }}
              >
                {client.name.charAt(0)}
              </div>
              <span className="truncate">{client.name}</span>
              {client.stats.needsConfirm > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-[10px] flex items-center justify-center font-medium flex-shrink-0">
                  {client.stats.needsConfirm}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-50">
          <button
            onClick={handleLogout}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 p-6 max-w-4xl">
        {activeTab === "overview" ? (
          <OverviewPanel data={data} />
        ) : activeClient ? (
          <ClientPanel client={activeClient} />
        ) : null}
      </main>
    </div>
  );
}
