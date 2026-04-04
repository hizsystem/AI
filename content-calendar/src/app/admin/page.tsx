"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ContentItem } from "@/data/types";
import type { ChannelType, FinanceConfig } from "@/data/client-config";
import AuditScoreCard from "@/components/np/AuditScoreCard";
import WeeklyMissions from "@/components/np/WeeklyMissions";
import AuditInputForm from "@/components/np/AuditInputForm";

// ─── Types ───

interface ProjectSummary {
  slug: string;
  name: string;
  emoji?: string;
  brandColor: string;
  logo: { src: string; alt: string } | null;
  status: "active" | "paused" | "completed";
  channels: ChannelType[];
  npStoreId?: string;
  brands?: { id: string; label: string; emoji: string }[];
  finance?: FinanceConfig;
  currentMonth: string;
  stats: { total: number; planning: number; needsConfirm: number; uploaded: number };
  nextContent: { date: string; title: string } | null;
  thisWeekItems: ContentItem[];
}

interface SummaryData {
  summaries: ProjectSummary[];
  week: { start: string; end: string };
  currentMonth: string;
}

type ChannelTab = "instagram" | "naver-place" | "blog" | "finance";

const CHANNEL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  "naver-place": "Naver Place",
  blog: "Blog",
  finance: "Finance",
};

const CHANNEL_ICONS: Record<string, string> = {
  instagram: "IG",
  "naver-place": "NP",
  blog: "BL",
  finance: "FN",
};

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

function formatBudget(amount: number): string {
  if (amount >= 10000) return `${(amount / 10000).toFixed(0)}만`;
  return amount.toLocaleString();
}

// ─── Overview Panel ───

function OverviewPanel({ data }: { data: SummaryData }) {
  const active = data.summaries.filter((s) => s.status === "active");

  const allWeekItems = active.flatMap((s) =>
    s.thisWeekItems.map((item) => ({
      ...item,
      clientName: s.name,
      clientSlug: s.slug,
      brandColor: s.brandColor,
    }))
  );

  const totalStats = active.reduce(
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

  // Finance summary
  const invoices = active
    .filter((s) => s.finance)
    .map((s) => ({ name: s.name, day: s.finance!.invoiceDay, budget: s.finance!.monthlyBudget }));

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div>
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          {formatMonthLabel(data.currentMonth)} 콘텐츠 현황
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

      {/* This week checklist */}
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
              <div key={`${item.clientSlug}-${item.id}`} className="px-4 py-3 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[item.status || "planning"]}`} />
                <span className="text-xs text-gray-500 w-20 flex-shrink-0">{formatDate(item.date)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{item.title}</p>
                </div>
                <span className="text-[11px] text-gray-400 flex-shrink-0">{item.clientName}</span>
                <span className="text-[10px] text-gray-400 flex-shrink-0">
                  {STATUS_LABELS[item.status || "planning"]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming per client */}
      <div>
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          브랜드별 현황
        </h2>
        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
          {active.map((s) => (
            <div key={s.slug} className="px-4 py-3 flex items-center gap-3">
              <span className="text-sm flex-shrink-0 w-5 text-center">{s.emoji || "📁"}</span>
              <span className="text-sm font-medium text-gray-700 w-28 flex-shrink-0 truncate">{s.name}</span>
              <div className="flex gap-1 flex-shrink-0">
                {s.channels.map((ch) => (
                  <span key={ch} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                    {CHANNEL_ICONS[ch]}
                  </span>
                ))}
              </div>
              <div className="flex-1 min-w-0 text-right">
                <span className="text-xs text-gray-400">
                  {s.stats.total}개 ({s.stats.uploaded} 완료)
                </span>
              </div>
              {s.nextContent && (
                <span className="text-[11px] text-gray-400 flex-shrink-0 truncate max-w-40">
                  {formatDate(s.nextContent.date)} {s.nextContent.title}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Finance schedule */}
      {invoices.length > 0 && (
        <div>
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            세금계산서 / 예산
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {invoices.map((inv) => (
              <div key={inv.name} className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-700">{inv.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-400">매월 {inv.day}일 발행</span>
                  <span className="text-sm font-medium text-gray-900">{formatBudget(inv.budget)}원</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Instagram Panel ───

function InstagramPanel({ project }: { project: ProjectSummary }) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{project.stats.total}</p>
          <p className="text-[11px] text-gray-400 mt-1">전체</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-500">{project.stats.planning}</p>
          <p className="text-[11px] text-gray-400 mt-1">기획</p>
        </div>
        <div className="bg-white rounded-xl border border-amber-100 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{project.stats.needsConfirm}</p>
          <p className="text-[11px] text-amber-500 mt-1">컨펌 필요</p>
        </div>
        <div className="bg-white rounded-xl border border-emerald-100 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{project.stats.uploaded}</p>
          <p className="text-[11px] text-emerald-500 mt-1">완료</p>
        </div>
      </div>

      {/* Next content */}
      {project.nextContent && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 mb-1">다음 콘텐츠</p>
          <p className="text-sm font-medium text-gray-900">{project.nextContent.title}</p>
          <p className="text-xs text-gray-500 mt-1">{formatDate(project.nextContent.date)}</p>
        </div>
      )}

      {/* This week content */}
      <div>
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">이번 주 콘텐츠</h3>
        {project.thisWeekItems.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-gray-400">
            이번 주 콘텐츠가 없습니다
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50">
            {project.thisWeekItems.sort((a, b) => a.date.localeCompare(b.date)).map((item) => (
              <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[item.status || "planning"]}`} />
                <span className="text-xs text-gray-500 w-20 flex-shrink-0">{formatDate(item.date)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{item.title}</p>
                  {item.subtitle && <p className="text-[11px] text-gray-400">{item.subtitle}</p>}
                </div>
                <span className="text-[10px] text-gray-400 flex-shrink-0">{STATUS_LABELS[item.status || "planning"]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Link to full calendar */}
      <a
        href={`/clients/${project.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-white rounded-xl border border-gray-100 p-4 text-center text-sm text-gray-500 hover:text-gray-700 hover:border-gray-200 transition-colors"
      >
        캘린더 전체 보기 &rarr;
      </a>
    </div>
  );
}

// ─── Naver Place Panel ───

function NaverPlacePanel({ project }: { project: ProjectSummary }) {
  const [audit, setAudit] = useState<import("@/data/np-types").NpAuditData | null>(null);
  const [missions, setMissions] = useState<import("@/data/np-types").NpMissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuditForm, setShowAuditForm] = useState(false);

  useEffect(() => {
    if (!project.npStoreId) { setLoading(false); return; }
    const storeId = project.npStoreId;
    Promise.all([
      fetch(`/api/np/${storeId}/audit`).then((r) => r.ok ? r.json() : null),
      fetch(`/api/np/${storeId}/missions`).then((r) => r.ok ? r.json() : null),
    ])
      .then(([a, m]) => { setAudit(a); setMissions(m); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [project.npStoreId]);

  async function handleSaveAudit(data: import("@/data/np-types").NpAuditData) {
    if (!project.npStoreId) return;
    const res = await fetch(`/api/np/${project.npStoreId}/audit`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) setAudit(data);
  }

  if (loading) {
    return <div className="text-center py-12 text-sm text-gray-400">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">진단 점수</h3>
          <button
            onClick={() => setShowAuditForm(true)}
            className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            {audit ? "재진단" : "진단하기"}
          </button>
        </div>
        <AuditScoreCard audit={audit} />
      </div>

      <div>
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">주간 미션</h3>
        <WeeklyMissions missions={missions} />
      </div>

      {showAuditForm && project.npStoreId && (
        <AuditInputForm
          storeId={project.npStoreId}
          storeName={project.name}
          existing={audit}
          onSave={handleSaveAudit}
          onClose={() => setShowAuditForm(false)}
        />
      )}
    </div>
  );
}

// ─── Blog Panel ───

function BlogPanel({ project }: { project: ProjectSummary }) {
  return (
    <div className="space-y-6">
      {/* Blog uses same calendar structure as Instagram, just different data key */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <p className="text-xs text-gray-400 mb-1">블로그 콘텐츠</p>
        <p className="text-sm text-gray-600">
          블로그 콘텐츠 캘린더는 클라이언트 캘린더 뷰에서 관리됩니다.
        </p>
      </div>

      <a
        href={`/clients/${project.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-white rounded-xl border border-gray-100 p-4 text-center text-sm text-gray-500 hover:text-gray-700 hover:border-gray-200 transition-colors"
      >
        블로그 캘린더 열기 &rarr;
      </a>
    </div>
  );
}

// ─── Finance Panel ───

function FinancePanel({ project }: { project: ProjectSummary }) {
  if (!project.finance) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-gray-400">
        재무 정보가 설정되지 않았습니다
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 mb-2">월 예산</p>
          <p className="text-xl font-bold text-gray-900">{project.finance.monthlyBudget.toLocaleString()}원</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs text-gray-400 mb-2">세금계산서</p>
          <p className="text-xl font-bold text-gray-900">매월 {project.finance.invoiceDay}일</p>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">지출 현황</h3>
        <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-sm text-gray-400">
          지출 데이터를 등록하면 현황이 표시됩니다
        </div>
      </div>
    </div>
  );
}

// ─── Client Panel with Channel Tabs ───

function ClientPanel({ project }: { project: ProjectSummary }) {
  const availableTabs: ChannelTab[] = [];
  if (project.channels.includes("instagram")) availableTabs.push("instagram");
  if (project.channels.includes("naver-place")) availableTabs.push("naver-place");
  if (project.channels.includes("blog")) availableTabs.push("blog");
  if (project.finance) availableTabs.push("finance");

  const [channelTab, setChannelTab] = useState<ChannelTab>(availableTabs[0] || "instagram");

  // Reset tab when project changes
  useEffect(() => {
    setChannelTab(availableTabs[0] || "instagram");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.slug]);

  return (
    <div className="space-y-6">
      {/* Client header */}
      <div className="flex items-center gap-3">
        {project.logo ? (
          <img src={project.logo.src} alt={project.logo.alt} className="h-10 w-10 object-contain rounded-lg" />
        ) : (
          <span className="text-2xl flex-shrink-0">{project.emoji || "📁"}</span>
        )}
        <div>
          <h2 className="text-base font-semibold text-gray-900">{project.name}</h2>
          {project.brands && (
            <p className="text-xs text-gray-400">
              {project.brands.map((b) => `${b.emoji} ${b.label}`).join(" · ")}
            </p>
          )}
        </div>
        {project.status === "paused" && (
          <span className="ml-auto text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-400">PAUSED</span>
        )}
      </div>

      {/* Channel sub-tabs */}
      {availableTabs.length > 1 && (
        <div className="flex gap-1 border-b border-gray-100 pb-0">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setChannelTab(tab)}
              className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors -mb-px ${
                channelTab === tab
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {CHANNEL_LABELS[tab]}
            </button>
          ))}
        </div>
      )}

      {/* Channel content */}
      {channelTab === "instagram" && <InstagramPanel project={project} />}
      {channelTab === "naver-place" && <NaverPlacePanel project={project} />}
      {channelTab === "blog" && <BlogPanel project={project} />}
      {channelTab === "finance" && <FinancePanel project={project} />}
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

  const activeProjects = data.summaries.filter((s) => s.status === "active");
  const completedProjects = data.summaries.filter((s) => s.status === "paused" || s.status === "completed");
  const activeProject = data.summaries.find((s) => s.slug === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-screen">
        <div className="px-5 py-5 border-b border-gray-50">
          <h1 className="text-sm font-semibold text-gray-900">Brand Dashboard</h1>
          <p className="text-[11px] text-gray-400 mt-0.5">{formatMonthLabel(data.currentMonth)}</p>
        </div>

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

          <div className="mx-5 my-2 border-t border-gray-100" />
          <p className="px-5 py-1 text-[10px] text-gray-300 uppercase tracking-wider">Active</p>

          {activeProjects.map((project) => (
            <button
              key={project.slug}
              onClick={() => setActiveTab(project.slug)}
              className={`w-full px-5 py-2.5 flex items-center gap-3 text-left text-sm transition-colors ${
                activeTab === project.slug
                  ? "bg-gray-50 text-gray-900 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <span className="text-base flex-shrink-0 w-5 text-center">{project.emoji || "📁"}</span>
              <span className="truncate flex-1">{project.name}</span>
              {project.stats.needsConfirm > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-[10px] flex items-center justify-center font-medium flex-shrink-0">
                  {project.stats.needsConfirm}
                </span>
              )}
            </button>
          ))}

          {/* Completed */}
          {completedProjects.length > 0 && (
            <>
              <div className="mx-5 my-2 border-t border-gray-100" />
              <p className="px-5 py-1 text-[10px] text-gray-300 uppercase tracking-wider">완료</p>
              {completedProjects.map((project) => (
                <button
                  key={project.slug}
                  onClick={() => setActiveTab(project.slug)}
                  className={`w-full px-5 py-2.5 flex items-center gap-3 text-left text-sm transition-colors opacity-50 ${
                    activeTab === project.slug
                      ? "bg-gray-50 text-gray-900 font-medium opacity-100"
                      : "text-gray-400 hover:bg-gray-50 hover:opacity-75"
                  }`}
                >
                  <span className="text-base flex-shrink-0 w-5 text-center grayscale">{project.emoji || "📁"}</span>
                  <span className="truncate">{project.name}</span>
                </button>
              ))}
            </>
          )}
        </nav>

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
        ) : activeProject ? (
          <ClientPanel project={activeProject} />
        ) : null}
      </main>
    </div>
  );
}
