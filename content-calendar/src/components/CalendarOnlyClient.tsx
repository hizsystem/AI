"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Calendar from "@/components/Calendar";
import TabNavigation from "@/components/huenic/TabNavigation";
import MoodboardTab from "@/components/huenic/MoodboardTab";
import RefTab from "@/components/huenic/RefTab";
import GuideTab from "@/components/huenic/GuideTab";
import WeeklyReportTab from "@/components/huenic/WeeklyReportTab";
import KpiTab from "@/components/huenic/KpiTab";
import { useCalendarData } from "@/hooks/useCalendarData";
import type { ClientConfig, TabId } from "@/data/client-config";

interface Props {
  config: ClientConfig;
  readOnly?: boolean;
}

function CalendarOnlyInner({ config, readOnly = false }: Props) {
  const CLIENT = config.slug;
  const LOGO = config.logo;
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const hasTabs = config.tabs.length > 1;
  const activeTab = (() => {
    const t = searchParams.get("tab");
    if (t && config.tabs.includes(t as TabId)) return t as TabId;
    return "calendar";
  })();

  function setActiveTab(tab: TabId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`);
  }

  const [months, setMonths] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [loadingMonths, setLoadingMonths] = useState(true);

  const fetchMonths = useCallback(async () => {
    try {
      const res = await fetch(`/api/calendar-months/${CLIENT}`);
      if (res.ok) {
        const { months: m } = await res.json();
        setMonths(m);
        if (m.length > 0 && !currentMonth) {
          const now = getCurrentMonth();
          setCurrentMonth(m.includes(now) ? now : m[m.length - 1]);
        }
      }
    } catch { /* fallback */ } finally {
      setLoadingMonths(false);
    }
  }, [CLIENT, currentMonth]);

  useEffect(() => { fetchMonths(); }, [fetchMonths]);

  const handleAddMonth = async () => {
    const latest = months.length > 0 ? months[months.length - 1] : getCurrentMonth();
    const next = getNextMonth(latest);
    try {
      const res = await fetch(`/api/calendar-months/${CLIENT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: next }),
      });
      if (res.ok) { setMonths((prev) => [...prev, next].sort()); setCurrentMonth(next); }
      else if (res.status === 409) { setCurrentMonth(next); }
    } catch { /* ignore */ }
  };

  const { data, loading, error, addItem, updateItem, deleteItem, saveCalendar } =
    useCalendarData(CLIENT, currentMonth);

  // Calendar tab: loading/error states
  if (activeTab === "calendar") {
    if (loadingMonths || (loading && currentMonth)) return <PageLoading />;
    if (!currentMonth || !data || (error && !data)) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-400">{error || "No calendar data."}</p>
        </div>
      );
    }

    return (
      <>
        {hasTabs && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <TabNavigation tabs={config.tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        )}
        <Calendar
          data={data}
          allMonths={months}
          onMonthChange={setCurrentMonth}
          editMode={readOnly ? false : editMode}
          onToggleEditMode={readOnly ? undefined : () => setEditMode((prev) => !prev)}
          onAddItem={readOnly ? undefined : addItem}
          onUpdateItem={readOnly ? undefined : updateItem}
          onDeleteItem={readOnly ? undefined : deleteItem}
          onSaveCalendar={readOnly ? undefined : saveCalendar}
          onAddMonth={readOnly ? undefined : handleAddMonth}
          logo={LOGO ?? undefined}
          contentDefaults={
            config.defaultHashtags || config.defaultMentions
              ? { hashtags: config.defaultHashtags, mentions: config.defaultMentions }
              : undefined
          }
        />
      </>
    );
  }

  // Non-calendar tabs
  // Only huenic brands (veggiet/vinker) may use huenic-specific tabs (guide/report/kpi).
  // Other clients pass CLIENT slug which gets fallback-mapped to "veggiet" by the API,
  // causing data overwrites. Guard against this.
  const isHuenicBrand = CLIENT === "veggiet" || CLIENT === "vinker";
  const brand = CLIENT as any;
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-widest text-gray-400 mb-1">
            {config.dashboardTitle ?? config.name}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{config.name}</h1>
        </div>
        <TabNavigation tabs={config.tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="mt-6">
          {activeTab === "moodboard" && <MoodboardTab brand={brand} />}
          {activeTab === "ref" && <RefTab brand={brand} />}
          {activeTab === "guide" && isHuenicBrand && <GuideTab brand={brand} />}
          {activeTab === "report" && isHuenicBrand && <WeeklyReportTab brand={brand} />}
          {activeTab === "kpi" && isHuenicBrand && <KpiTab brand={brand} />}
          {(activeTab === "guide" || activeTab === "report" || activeTab === "kpi") && !isHuenicBrand && (
            <div className="text-center py-20 text-gray-400 text-sm">
              이 탭은 현재 준비 중입니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PageLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
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

export default function CalendarOnlyClient(props: Props) {
  return (
    <Suspense fallback={<PageLoading />}>
      <CalendarOnlyInner {...props} />
    </Suspense>
  );
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getNextMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const next = m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 };
  return `${next.y}-${String(next.m).padStart(2, "0")}`;
}
