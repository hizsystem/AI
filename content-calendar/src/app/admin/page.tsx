"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ContentItem } from "@/data/types";
import type { ChannelType, FinanceConfig } from "@/data/client-config";
import AuditScoreCard from "@/components/np/AuditScoreCard";
import WeeklyMissions from "@/components/np/WeeklyMissions";
import AuditInputForm from "@/components/np/AuditInputForm";
import ProjectSettingsPanel from "@/components/admin/ProjectSettingsPanel";
import OnboardingModal from "@/components/admin/OnboardingModal";
import PlaybookPanel from "@/components/admin/PlaybookPanel";
import ArchivePanel from "@/components/admin/ArchivePanel";
import TaskSchedulePanel from "@/components/admin/TaskSchedulePanel";

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
  accessToken?: string;
  brandStats?: Record<string, { total: number; planning: number; needsConfirm: number; confirmed: number; uploaded: number }>;
  currentMonth: string;
  stats: { total: number; planning: number; needsConfirm: number; confirmed: number; uploaded: number };
  nextContent: { date: string; title: string } | null;
  thisWeekItems: ContentItem[];
}

interface SummaryData {
  summaries: ProjectSummary[];
  week: { start: string; end: string };
  currentMonth: string;
}

type ChannelTab = "instagram" | "naver-place" | "blog" | "schedule" | "finance" | "archive";

const CHANNEL_LABELS: Record<string, string> = {
  instagram: "📸 Instagram",
  "naver-place": "📍 Naver Place",
  blog: "📝 Blog",
  schedule: "📅 일정",
  finance: "💰 Finance",
  archive: "📦 Archive",
};

const CHANNEL_ICONS: Record<string, string> = {
  instagram: "IG",
  "naver-place": "NP",
  blog: "BL",
  finance: "FN",
  archive: "AR",
};

const STATUS_LABELS: Record<string, string> = {
  planning: "기획",
  "needs-confirm": "컨펌 필요",
  confirmed: "컨펌 완료",
  uploaded: "업로드 완료",
};

const STATUS_TEXT: Record<string, string> = {
  planning: "text-gray-400",
  "needs-confirm": "text-amber-500",
  confirmed: "text-blue-500",
  uploaded: "text-emerald-500",
};

const STATUS_DOT: Record<string, string> = {
  planning: "bg-gray-300",
  "needs-confirm": "bg-amber-400",
  confirmed: "bg-blue-400",
  uploaded: "bg-emerald-400",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()}(${["일", "월", "화", "수", "목", "금", "토"][d.getDay()]})`;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

function formatDateKorean(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
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
    .filter((s) => s.finance && s.finance.model !== "expense-only" && s.finance.model !== "tbd")
    .map((s) => ({
      name: s.name,
      model: s.finance!.model,
      amount: s.finance!.monthlyFee || s.finance!.monthlyBudget || 0,
      invoiceDay: s.finance!.invoiceDay,
    }));

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div>
        <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
          {formatMonthLabel(data.currentMonth)} 콘텐츠 현황
        </h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-4xl font-bold text-gray-900">{totalStats.total}</p>
            <p className="text-xs text-gray-400 mt-2">전체</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-4xl font-bold text-gray-400">{totalStats.planning}</p>
            <p className="text-xs text-gray-400 mt-2">기획</p>
          </div>
          <div className="bg-white rounded-xl border border-dashed border-amber-300 p-5">
            <p className="text-4xl font-bold text-amber-600">{totalStats.needsConfirm}</p>
            <p className="text-xs text-amber-500 mt-2">컨펌 필요</p>
          </div>
          <div className="bg-white rounded-xl border border-dashed border-emerald-300 p-5">
            <p className="text-4xl font-bold text-emerald-600">{totalStats.uploaded}</p>
            <p className="text-xs text-emerald-500 mt-2">완료</p>
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
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {needsAction.map((item) => (
              <div key={`${item.clientSlug}-${item.id}`} className="px-5 py-4 flex items-center gap-4">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[item.status || "planning"]}`} />
                <span className="text-sm font-medium text-gray-500 w-10 flex-shrink-0">{formatDateShort(item.date)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.clientName}</p>
                </div>
                <span className={`text-xs font-medium flex-shrink-0 ${STATUS_TEXT[item.status || "planning"]}`}>
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
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {active.map((s) => (
            <div key={s.slug} className="px-5 py-4 flex items-center gap-4">
              <span className="text-base flex-shrink-0">{s.emoji || "📁"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{s.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {s.channels.map((ch) => CHANNEL_LABELS[ch]).join(" · ")}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-gray-900">{s.stats.total}개</p>
                <p className="text-xs text-gray-400">{s.stats.uploaded} 완료</p>
              </div>
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
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">{inv.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                    {MODEL_LABELS[inv.model]}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  {inv.invoiceDay && <span className="text-xs text-gray-400">매월 {inv.invoiceDay}일</span>}
                  {inv.amount > 0 && <span className="text-sm font-medium text-gray-900">{formatBudget(inv.amount)}원</span>}
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

const STATUS_CYCLE: Record<string, string> = {
  planning: "needs-confirm",
  "needs-confirm": "confirmed",
  confirmed: "uploaded",
  uploaded: "planning",
};

type IgSubView = "summary" | "moodboard" | "data" | "playbook";

function InstagramPanel({ project, onStatusChange, onRefresh }: { project: ProjectSummary; onStatusChange?: (item: ContentItem, newStatus: string) => void; onRefresh?: () => void }) {
  const [activeBrand, setActiveBrand] = useState(project.brands?.[0]?.id || "");
  const [subView, setSubView] = useState<IgSubView>("summary");
  const [initializing, setInitializing] = useState(false);
  const [calendarExists, setCalendarExists] = useState(false);

  // Reset brand when project changes
  useEffect(() => {
    setActiveBrand(project.brands?.[0]?.id || "");
    setSubView("summary");
    setCalendarExists(false);
  }, [project.slug, project.brands]);

  async function handleInitCalendar() {
    setInitializing(true);
    try {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const res = await fetch("/api/calendar/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientKey: project.slug,
          month,
          title: `${project.name} ${now.getMonth() + 1}월 콘텐츠 캘린더`,
        }),
      });
      // ok = 새로 생성됨, 409 = 이미 존재함 → 둘 다 캘린더 뷰 진입
      if (res.ok || res.status === 409) {
        setCalendarExists(true);
        onRefresh?.();
      }
    } finally {
      setInitializing(false);
    }
  }

  // For brands without sub-brands and no data
  if (!calendarExists && project.stats.total === 0 && !project.brands && !initializing) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-400 text-sm mb-4">아직 이번 달 캘린더가 없습니다</p>
          <button
            onClick={handleInitCalendar}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            캘린더 시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Brand switcher (for multi-brand like HUENIC) */}
      {project.brands && project.brands.length > 1 && (
        <div className="flex gap-2">
          {project.brands.map((b) => (
            <button
              key={b.id}
              onClick={() => setActiveBrand(b.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeBrand === b.id
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {b.emoji} {b.label}
            </button>
          ))}
        </div>
      )}

      {/* Sub-view tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(["summary", "moodboard", "data", "playbook"] as IgSubView[]).map((v) => (
          <button
            key={v}
            onClick={() => setSubView(v)}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors -mb-px ${
              subView === v
                ? v === "playbook" ? "border-violet-500 text-violet-600" : "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {v === "summary" ? "요약" : v === "moodboard" ? "무드보드" : v === "data" ? "📊 DATA" : "📋 플레이북"}
          </button>
        ))}
      </div>

      {/* Summary view */}
      {subView === "summary" && (() => {
        // Use brand-specific stats if available
        const displayStats = (activeBrand && project.brandStats?.[activeBrand]) || project.stats;
        const brandItems = activeBrand
          ? project.thisWeekItems.filter((i: any) => i._brandId === activeBrand || !i._brandId)
          : project.thisWeekItems;
        return <>
          {/* Stats */}
          <div className="grid grid-cols-5 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-3xl font-bold text-gray-900">{displayStats.total}</p>
              <p className="text-[11px] text-gray-400 mt-1.5">전체</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-3xl font-bold text-gray-400">{displayStats.planning}</p>
              <p className="text-[11px] text-gray-400 mt-1.5">기획</p>
            </div>
            <div className="bg-white rounded-xl border border-dashed border-amber-300 p-4">
              <p className="text-3xl font-bold text-amber-600">{displayStats.needsConfirm}</p>
              <p className="text-[11px] text-amber-500 mt-1.5">컨펌 필요</p>
            </div>
            <div className="bg-white rounded-xl border border-dashed border-blue-300 p-4">
              <p className="text-3xl font-bold text-blue-600">{displayStats.confirmed}</p>
              <p className="text-[11px] text-blue-500 mt-1.5">컨펌 완료</p>
            </div>
            <div className="bg-white rounded-xl border border-dashed border-emerald-300 p-4">
              <p className="text-3xl font-bold text-emerald-600">{displayStats.uploaded}</p>
              <p className="text-[11px] text-emerald-500 mt-1.5">업로드 완료</p>
            </div>
          </div>

          {/* Next content */}
          {project.nextContent && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <p className="text-xs text-gray-400 mb-2">다음 콘텐츠</p>
              <p className="text-base font-semibold text-gray-900">{project.nextContent.title}</p>
              <p className="text-sm text-gray-500 mt-1">{formatDateKorean(project.nextContent.date)}</p>
            </div>
          )}

          {/* This week content */}
          <div>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">이번 주 콘텐츠</h3>
            {brandItems.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
                이번 주 콘텐츠가 없습니다
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {brandItems.sort((a, b) => a.date.localeCompare(b.date)).map((item) => (
                  <div key={item.id} className="px-5 py-4 flex items-center gap-4">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[item.status || "planning"]}`} />
                    <span className="text-sm font-medium text-gray-500 w-10 flex-shrink-0">{formatDateShort(item.date)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                      {item.subtitle && <p className="text-xs text-gray-400 mt-0.5">{item.subtitle}</p>}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const current = item.status || "planning";
                        const next = STATUS_CYCLE[current] || "planning";
                        onStatusChange?.(item, next);
                      }}
                      className={`text-xs font-medium flex-shrink-0 hover:underline cursor-pointer ${STATUS_TEXT[item.status || "planning"]}`}
                      title="클릭하여 상태 변경"
                    >
                      {STATUS_LABELS[item.status || "planning"]}
                    </button>
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
            className="block bg-white rounded-xl border border-gray-200 p-4 text-center text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
          >
            캘린더 전체 보기 &rarr;
          </a>
        </>;
      })()}

      {/* Moodboard view */}
      {subView === "moodboard" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-500 mb-4">무드보드에서 이번 달 비주얼 톤앤매너를 확인하세요</p>
            <a
              href={`/clients/${project.slug}?tab=moodboard&brand=${activeBrand}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              무드보드 열기 &rarr;
            </a>
          </div>
        </div>
      )}

      {/* DATA view — KPI + Report combined */}
      {subView === "data" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <a
              href={`/clients/${project.slug}?tab=kpi&brand=${activeBrand}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors group"
            >
              <h3 className="text-sm font-semibold text-gray-900 mb-1">📈 KPI</h3>
              <p className="text-xs text-gray-400 mb-3">팔로워, 도달, 참여율 등 핵심 지표</p>
              <span className="text-xs text-gray-400 group-hover:text-gray-600">상세 보기 &rarr;</span>
            </a>
            <a
              href={`/clients/${project.slug}?tab=report&brand=${activeBrand}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors group"
            >
              <h3 className="text-sm font-semibold text-gray-900 mb-1">📋 주간 리포트</h3>
              <p className="text-xs text-gray-400 mb-3">이번 주 성과 요약 및 인사이트</p>
              <span className="text-xs text-gray-400 group-hover:text-gray-600">상세 보기 &rarr;</span>
            </a>
          </div>
        </div>
      )}

      {/* Playbook view */}
      {subView === "playbook" && (
        <PlaybookPanel clientSlug={project.slug} blockType="instagram" blockLabel="Instagram" />
      )}
    </div>
  );
}

// ─── Naver Place Panel ───

type NpSubView = "summary" | "playbook";

function NaverPlacePanel({ project }: { project: ProjectSummary }) {
  const [audit, setAudit] = useState<import("@/data/np-types").NpAuditData | null>(null);
  const [missions, setMissions] = useState<import("@/data/np-types").NpMissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuditForm, setShowAuditForm] = useState(false);
  const [npSubView, setNpSubView] = useState<NpSubView>("summary");

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
      {/* NP sub-tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(["summary", "playbook"] as NpSubView[]).map((v) => (
          <button
            key={v}
            onClick={() => setNpSubView(v)}
            className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors -mb-px ${
              npSubView === v
                ? v === "playbook" ? "border-violet-500 text-violet-600" : "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {v === "summary" ? "진단/미션" : "📋 플레이북"}
          </button>
        ))}
      </div>

      {npSubView === "summary" && (
        <>
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
        </>
      )}

      {npSubView === "playbook" && (
        <PlaybookPanel clientSlug={project.slug} blockType="naver-place" blockLabel="Naver Place" />
      )}

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

// ─── Schedule Panel ───

function SchedulePanel({ project }: { project: ProjectSummary }) {
  const [items, setItems] = useState<import("@/data/schedule-types").ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newType, setNewType] = useState<import("@/data/schedule-types").ScheduleType>("meeting");

  useEffect(() => {
    fetch(`/api/schedule/${project.slug}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.items) setItems(d.items); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [project.slug]);

  async function saveItems(updated: import("@/data/schedule-types").ScheduleItem[]) {
    setItems(updated);
    await fetch(`/api/schedule/${project.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientSlug: project.slug, items: updated }),
    });
  }

  async function handleAdd() {
    if (!newTitle.trim() || !newDate) return;
    const item: import("@/data/schedule-types").ScheduleItem = {
      id: `sch-${Date.now()}`,
      date: newDate,
      title: newTitle.trim(),
      type: newType,
      completed: false,
    };
    await saveItems([...items, item].sort((a, b) => a.date.localeCompare(b.date)));
    setNewTitle("");
    setNewDate("");
    setShowAdd(false);
  }

  async function toggleComplete(id: string) {
    const updated = items.map((i) => i.id === id ? { ...i, completed: !i.completed } : i);
    await saveItems(updated);
  }

  async function deleteItem(id: string) {
    await saveItems(items.filter((i) => i.id !== id));
  }

  const TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
    meeting: { label: "미팅", emoji: "📅", color: "#6366f1" },
    campaign: { label: "체험단/캠페인", emoji: "📣", color: "#f59e0b" },
    milestone: { label: "마일스톤", emoji: "🎯", color: "#10b981" },
    deadline: { label: "마감", emoji: "⏰", color: "#ef4444" },
    other: { label: "기타", emoji: "📌", color: "#6b7280" },
  };

  if (loading) return <div className="text-center py-12 text-sm text-gray-400">로딩 중...</div>;

  const upcoming = items.filter((i) => !i.completed).sort((a, b) => a.date.localeCompare(b.date));
  const completed = items.filter((i) => i.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider">예정 일정</h3>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="text-xs font-medium text-gray-500 hover:text-gray-700"
        >
          + 일정 추가
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="일정 제목"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            autoFocus
          />
          <div className="flex gap-3">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
            >
              {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.emoji} {v.label}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-xs text-gray-500">취소</button>
            <button
              onClick={handleAdd}
              disabled={!newTitle.trim() || !newDate}
              className="px-4 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg disabled:opacity-50"
            >
              추가
            </button>
          </div>
        </div>
      )}

      {/* Upcoming items */}
      {upcoming.length === 0 && !showAdd ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
          예정된 일정이 없습니다
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {upcoming.map((item) => {
            const tc = TYPE_CONFIG[item.type] || TYPE_CONFIG.other;
            return (
              <div key={item.id} className="px-5 py-4 flex items-center gap-4">
                <button onClick={() => toggleComplete(item.id)} className="flex-shrink-0">
                  <div className="w-4 h-4 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors" />
                </button>
                <span className="text-sm font-medium text-gray-500 w-10 flex-shrink-0">{formatDateShort(item.date)}</span>
                <span className="text-base flex-shrink-0">{tc.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                  {item.description && <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>}
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded text-white flex-shrink-0" style={{ backgroundColor: tc.color }}>
                  {tc.label}
                </span>
                <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-red-400 flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wider mb-3">완료 ({completed.length})</h3>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {completed.map((item) => (
              <div key={item.id} className="px-5 py-3 flex items-center gap-4 opacity-50">
                <button onClick={() => toggleComplete(item.id)} className="flex-shrink-0">
                  <div className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
                <span className="text-xs text-gray-400 w-10 flex-shrink-0">{formatDateShort(item.date)}</span>
                <p className="text-sm text-gray-400 line-through truncate flex-1">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Finance Panel ───

const MODEL_LABELS: Record<string, string> = {
  retainer: "연간 리테이너",
  monthly: "월 정산",
  "expense-only": "지출 기록",
  tbd: "미정",
};

function FinancePanel({ project }: { project: ProjectSummary }) {
  const f = project.finance;
  if (!f) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-400">
        재무 정보가 설정되지 않았습니다
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Model badge */}
      <div className="flex items-center gap-2">
        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
          {MODEL_LABELS[f.model] || f.model}
        </span>
        {f.notes && <span className="text-xs text-gray-400">{f.notes}</span>}
      </div>

      {/* Retainer model (휴닉) */}
      {f.model === "retainer" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {f.annualQuote && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-xs text-gray-400 mb-2">연간 견적</p>
                <p className="text-xl font-bold text-gray-900">{(f.annualQuote / 10000).toLocaleString()}만원</p>
              </div>
            )}
            {f.monthlyBudget && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-xs text-gray-400 mb-2">월 예산</p>
                <p className="text-xl font-bold text-gray-900">{(f.monthlyBudget / 10000).toLocaleString()}만원</p>
              </div>
            )}
          </div>
          {f.recurringCosts && f.recurringCosts.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">반복 비용</h3>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {f.recurringCosts.map((cost, i) => (
                  <div key={i} className="px-5 py-3 flex items-center justify-between">
                    <span className="text-sm text-gray-700">{cost.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{cost.amount.toLocaleString()}원</span>
                      <span className="text-xs text-gray-400">/ {cost.frequency}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monthly model (위드런) */}
      {f.model === "monthly" && (
        <div className="grid grid-cols-2 gap-4">
          {f.monthlyFee && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs text-gray-400 mb-2">월 비용</p>
              <p className="text-xl font-bold text-gray-900">{(f.monthlyFee / 10000).toLocaleString()}만원</p>
            </div>
          )}
          {f.advanceRate && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs text-gray-400 mb-2">정산 구조</p>
              <p className="text-sm font-medium text-gray-900">
                선금 {Math.round(f.advanceRate * 100)}% / 잔금 {Math.round((1 - f.advanceRate) * 100)}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* Expense-only model */}
      {f.model === "expense-only" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-sm text-gray-400">
          구글시트에서 지출 기록 관리 중
        </div>
      )}

      {/* TBD model */}
      {f.model === "tbd" && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
          재무 모델 미확정
        </div>
      )}

      {/* Invoice day */}
      {f.invoiceDay && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-400 mb-2">세금계산서</p>
          <p className="text-sm font-medium text-gray-900">매월 {f.invoiceDay}일 발행</p>
        </div>
      )}
    </div>
  );
}

// ─── Client Panel with Channel Tabs ───

function ClientPanel({ project, onRefresh }: { project: ProjectSummary; onRefresh: () => void }) {
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  function handleCopyShareLink() {
    const url = `${window.location.origin}/${project.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleSaveSettings(config: import("@/data/client-config").ProjectConfig) {
    const res = await fetch("/api/admin/project", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (res.ok) onRefresh();
  }
  const availableTabs: ChannelTab[] = [];
  if (project.channels.includes("instagram")) availableTabs.push("instagram");
  if (project.channels.includes("naver-place")) availableTabs.push("naver-place");
  if (project.channels.includes("blog")) availableTabs.push("blog");
  if (project.finance) availableTabs.push("finance");
  availableTabs.push("archive"); // 모든 프로젝트에 아카이브 탭

  const [channelTab, setChannelTab] = useState<ChannelTab>(availableTabs[0] || "instagram");

  // Reset tab when project changes
  useEffect(() => {
    setChannelTab(availableTabs[0] || "instagram");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.slug]);

  return (
    <div className="space-y-8">
      {/* Client header */}
      <div className="flex items-center gap-4">
        {project.logo ? (
          <img src={project.logo.src} alt={project.logo.alt} className="h-10 w-10 object-contain rounded-lg" />
        ) : project.emoji ? (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ backgroundColor: `${project.brandColor}15` }}
          >
            {project.emoji}
          </div>
        ) : null}
        <div>
          <h2 className="text-lg font-bold text-gray-900">{project.name}</h2>
          {project.brands && (
            <p className="text-xs text-gray-400 mt-0.5">
              {project.brands.map((b) => `${b.emoji} ${b.label}`).join(" · ")}
            </p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={handleCopyShareLink}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" strokeLinecap="round"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round"/>
            </svg>
            {copied ? "복사됨!" : "공유 링크"}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" strokeLinecap="round"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round"/>
            </svg>
            설정
          </button>
        </div>
      </div>

      {/* Channel sub-tabs */}
      <div className="flex gap-0 border-b border-gray-200">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setChannelTab(tab)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              channelTab === tab
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {CHANNEL_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Channel content */}
      {channelTab === "instagram" && (
        <InstagramPanel
          project={project}
          onRefresh={onRefresh}
          onStatusChange={async (item, newStatus) => {
            // Determine calendarKey and month from item
            const calKey = (item as ContentItem & { _calendarKey?: string })._calendarKey || project.slug;
            const month = item.date.slice(0, 7);
            try {
              await fetch(`/api/calendar/${calKey}/${month}/items/${item.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
              });
              // Update local state
              item.status = newStatus as ContentItem["status"];
              onRefresh();
            } catch (e) {
              console.error("Status update failed:", e);
            }
          }}
        />
      )}
      {channelTab === "naver-place" && <NaverPlacePanel project={project} />}
      {channelTab === "blog" && <BlogPanel project={project} />}
      {channelTab === "schedule" && <SchedulePanel project={project} />}
      {channelTab === "finance" && <FinancePanel project={project} />}
      {channelTab === "archive" && (
        <ArchivePanel
          projects={[{ slug: project.slug, name: project.name, brandColor: project.brandColor, emoji: project.emoji }]}
          filterSlug={project.slug}
        />
      )}

      {/* Settings panel */}
      {showSettings && (
        <ProjectSettingsPanel
          slug={project.slug}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

// ─── Main ───

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-400">로딩 중...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}

function AdminDashboard() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") || "overview");
  const [fetchKey, setFetchKey] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [wideMode, setWideMode] = useState(false);
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
  }, [router, fetchKey]);

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
      <aside className={`w-56 bg-white border-r border-gray-100 flex flex-col fixed h-screen transition-transform ${wideMode ? "-translate-x-full" : ""}`}>
        <div className="px-6 py-6">
          <h1 className="text-base font-bold text-gray-900">Brand Dashboard</h1>
          <p className="text-xs text-gray-400 mt-1">{formatMonthLabel(data.currentMonth)}</p>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {/* Overview */}
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full px-6 py-3 flex items-center gap-3 text-left text-sm transition-colors ${
              activeTab === "overview"
                ? "bg-gray-50 text-gray-900 font-medium"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            <span>전체</span>
          </button>

          {/* Tasks */}
          <button
            onClick={() => setActiveTab("tasks")}
            className={`w-full px-6 py-3 flex items-center gap-3 text-left text-sm transition-colors ${
              activeTab === "tasks"
                ? "bg-gray-50 text-gray-900 font-medium"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>Tasks</span>
          </button>

          {/* Archive */}
          <button
            onClick={() => setActiveTab("archive")}
            className={`w-full px-6 py-3 flex items-center gap-3 text-left text-sm transition-colors ${
              activeTab === "archive"
                ? "bg-gray-50 text-gray-900 font-medium"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span>Archive</span>
          </button>

          <div className="mx-6 my-3 border-t border-gray-100" />
          <p className="px-6 py-1.5 text-[10px] text-gray-300 font-semibold uppercase tracking-wider">Active</p>

          {activeProjects.map((project) => (
            <button
              key={project.slug}
              onClick={() => setActiveTab(project.slug)}
              className={`w-full px-6 py-3 flex items-center gap-3 text-left text-sm transition-colors ${
                activeTab === project.slug
                  ? "bg-gray-50 text-gray-900 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: project.brandColor }}
              />
              <span className="truncate flex-1">{project.name}</span>
              {project.stats.needsConfirm > 0 && (
                <span className="text-[11px] font-semibold text-amber-500 flex-shrink-0">
                  {project.stats.needsConfirm}
                </span>
              )}
            </button>
          ))}

          {/* Completed */}
          {completedProjects.length > 0 && (
            <>
              <div className="mx-6 my-3 border-t border-gray-100" />
              <p className="px-6 py-1.5 text-[10px] text-gray-300 font-semibold uppercase tracking-wider">완료</p>
              {completedProjects.map((project) => (
                <button
                  key={project.slug}
                  onClick={() => setActiveTab(project.slug)}
                  className={`w-full px-6 py-3 flex items-center gap-3 text-left text-sm transition-colors ${
                    activeTab === project.slug
                      ? "bg-gray-50 text-gray-700 font-medium"
                      : "text-gray-300 hover:bg-gray-50 hover:text-gray-500"
                  }`}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0 opacity-40"
                    style={{ backgroundColor: project.brandColor }}
                  />
                  <span className="truncate">{project.name}</span>
                </button>
              ))}
            </>
          )}
        </nav>

        <div className="px-6 py-4 border-t border-gray-100 space-y-2">
          <button
            onClick={() => setShowOnboarding(true)}
            className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors text-left"
          >
            + 새 프로젝트
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-xs text-gray-300 hover:text-gray-500 transition-colors text-left"
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`flex-1 px-10 py-8 transition-all ${wideMode ? "ml-0" : "ml-56"} ${activeTab === "tasks" && !wideMode ? "max-w-6xl" : activeTab === "tasks" && wideMode ? "" : "max-w-4xl"}`}>
        {activeTab === "overview" ? (
          <OverviewPanel data={data} />
        ) : activeTab === "tasks" ? (
          <TaskSchedulePanel
            projects={data.summaries
              .filter((s) => s.status === "active")
              .map((s) => ({ slug: s.slug, name: s.name, emoji: s.emoji, brandColor: s.brandColor }))}
            onToggleWide={() => setWideMode((w) => !w)}
            isWide={wideMode}
          />
        ) : activeTab === "archive" ? (
          <ArchivePanel
            projects={data.summaries.map((s) => ({
              slug: s.slug,
              name: s.name,
              brandColor: s.brandColor,
              emoji: s.emoji,
            }))}
          />
        ) : activeProject ? (
          <ClientPanel project={activeProject} onRefresh={() => setFetchKey((n) => n + 1)} />
        ) : null}
      </main>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          onComplete={async (config) => {
            const res = await fetch("/api/admin/project", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(config),
            });
            if (res.ok) {
              setShowOnboarding(false);
              setFetchKey((n) => n + 1);
              setActiveTab(config.slug);
            }
          }}
          onClose={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}
