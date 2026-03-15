"use client";

import type { WeeklyReport } from "@/data/huenic-types";

interface MetricsRowProps {
  metrics: WeeklyReport["metrics"];
}

interface MetricCardProps {
  label: string;
  value: string;
  change?: number;
  suffix?: string;
}

function MetricCard({ label, value, change, suffix }: MetricCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex-1 min-w-0">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">
        {value}
        {suffix && <span className="text-sm font-normal text-gray-500">{suffix}</span>}
      </p>
      {change !== undefined && change !== 0 && (
        <p
          className="text-xs mt-1 font-medium"
          style={{ color: change > 0 ? "#16a34a" : "#dc2626" }}
        >
          {change > 0 ? "▲" : "▼"} {Math.abs(change).toLocaleString()}
        </p>
      )}
    </div>
  );
}

export default function MetricsRow({ metrics }: MetricsRowProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <MetricCard
        label="팔로워"
        value={metrics.followers.toLocaleString()}
        change={metrics.followersChange}
      />
      <MetricCard
        label="게시물 수"
        value={metrics.postsCount.toLocaleString()}
      />
      <MetricCard
        label="참여율"
        value={metrics.engagementRate.toFixed(1)}
        suffix="%"
        change={metrics.erChange}
      />
      <MetricCard
        label="도달"
        value={metrics.reach.toLocaleString()}
        change={metrics.reachChange}
      />
    </div>
  );
}
