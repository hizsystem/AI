"use client";

import type { TabId } from "@/data/client-config";

export type HuenicTab = TabId;

const TAB_LABELS: Record<TabId, string> = {
  calendar: "캘린더",
  moodboard: "무드보드",
  ref: "Ref.",
  guide: "가이드",
  report: "주간 리포트",
  kpi: "KPI",
};

const DEFAULT_TABS: TabId[] = ["calendar", "moodboard", "ref", "guide", "report", "kpi"];

interface TabNavigationProps {
  tabs?: TabId[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  const tabList = tabs ?? DEFAULT_TABS;

  return (
    <div className="flex gap-1 border-b border-gray-200">
      {tabList.map((tabId) => {
        const active = activeTab === tabId;
        return (
          <button
            key={tabId}
            onClick={() => onTabChange(tabId)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              active
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
            }`}
          >
            {TAB_LABELS[tabId] ?? tabId}
          </button>
        );
      })}
    </div>
  );
}
