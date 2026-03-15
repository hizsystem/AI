"use client";

import type { HuenicBrand } from "@/data/huenic-types";
import { useKpiData } from "@/hooks/useKpiData";
import KpiPeriodLabel from "./KpiPeriodLabel";
import KpiSummaryCards from "./KpiSummaryCards";
import KpiLineChart from "./KpiLineChart";
import KpiMetricBreakdown from "./KpiMetricBreakdown";

interface KpiTabProps {
  brand: HuenicBrand;
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-100 rounded w-64" />
      <div className="flex gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 h-24 bg-gray-100 rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-gray-100 rounded-xl" />
      <div className="h-64 bg-gray-100 rounded-xl" />
    </div>
  );
}

function ChartSection({
  title,
  breakdownItems,
  breakdownUnit,
  chartProps,
}: {
  title: string;
  breakdownItems: {
    label: string;
    value: number;
    change?: number;
    changePercent?: number;
    color: string;
  }[];
  breakdownUnit?: string;
  chartProps: React.ComponentProps<typeof KpiLineChart>;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <h3 className="text-sm font-bold text-gray-900 mb-4">{title}</h3>
      <div className="flex flex-col md:flex-row gap-5">
        <div className="md:w-1/3">
          <KpiMetricBreakdown items={breakdownItems} unit={breakdownUnit} />
        </div>
        <div className="md:w-2/3">
          <KpiLineChart {...chartProps} />
        </div>
      </div>
    </div>
  );
}

export default function KpiTab({ brand }: KpiTabProps) {
  const { kpi, loading, month, setMonth } = useKpiData(brand);

  if (loading) return <Skeleton />;

  if (!kpi) {
    return (
      <div className="space-y-6">
        <KpiPeriodLabel month={month} onMonthChange={setMonth} />
        <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
          KPI 데이터가 아직 없습니다.
        </div>
      </div>
    );
  }

  const { summary, followerTrend, erTrend } = kpi;

  // Get latest values for breakdown (last element in arrays)
  const lastIdx = (arr: number[]) => arr[arr.length - 1] ?? 0;
  const secondLast = (arr: number[]) => arr[arr.length - 2] ?? 0;
  const diff = (arr: number[]) => lastIdx(arr) - secondLast(arr);

  const followerBreakdown = [
    {
      label: "전체",
      value: lastIdx(followerTrend.total),
      change: diff(followerTrend.total),
      color: "#10b981",
    },
    {
      label: "자연유입",
      value: lastIdx(followerTrend.organic),
      change: diff(followerTrend.organic),
      color: "#3b82f6",
    },
    {
      label: "광고",
      value: lastIdx(followerTrend.paid),
      change: diff(followerTrend.paid),
      color: "#f97316",
    },
  ];

  const erBreakdown = [
    {
      label: "전체",
      value: lastIdx(erTrend.total),
      change: diff(erTrend.total),
      color: "#10b981",
    },
    {
      label: "피드",
      value: lastIdx(erTrend.feed),
      change: diff(erTrend.feed),
      color: "#3b82f6",
    },
    {
      label: "릴스",
      value: lastIdx(erTrend.reels),
      change: diff(erTrend.reels),
      color: "#f97316",
    },
    {
      label: "스토리",
      value: lastIdx(erTrend.story),
      change: diff(erTrend.story),
      color: "#8b5cf6",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Period navigation */}
      <KpiPeriodLabel month={month} onMonthChange={setMonth} />

      {/* Summary cards */}
      <KpiSummaryCards summary={summary} />

      {/* Follower trend */}
      <ChartSection
        title="팔로워 추이"
        breakdownItems={followerBreakdown}
        chartProps={{
          title: "팔로워 추이",
          labels: followerTrend.labels,
          series: [
            { label: "전체", data: followerTrend.total, color: "#10b981" },
            { label: "자연유입", data: followerTrend.organic, color: "#3b82f6" },
            { label: "광고", data: followerTrend.paid, color: "#f97316" },
          ],
        }}
      />

      {/* ER trend */}
      <ChartSection
        title="참여율(ER) 추이"
        breakdownItems={erBreakdown}
        breakdownUnit="%"
        chartProps={{
          title: "참여율(ER) 추이",
          labels: erTrend.labels,
          unit: "%",
          series: [
            { label: "전체", data: erTrend.total, color: "#10b981" },
            { label: "피드", data: erTrend.feed, color: "#3b82f6" },
            { label: "릴스", data: erTrend.reels, color: "#f97316" },
            { label: "스토리", data: erTrend.story, color: "#8b5cf6" },
          ],
        }}
      />
    </div>
  );
}
