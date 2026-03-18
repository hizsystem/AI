"use client";

export type HuenicTab = "calendar" | "moodboard" | "report" | "kpi";

const TABS: { id: HuenicTab; label: string }[] = [
  { id: "calendar", label: "캘린더" },
  { id: "moodboard", label: "무드보드" },
  { id: "report", label: "주간 리포트" },
  { id: "kpi", label: "KPI" },
];

interface TabNavigationProps {
  activeTab: HuenicTab;
  onTabChange: (tab: HuenicTab) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex gap-1 border-b border-gray-200">
      {TABS.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              active
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
