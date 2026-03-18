"use client";

import type { KpiData } from "@/data/huenic-types";

interface KpiSummaryCardsProps {
  summary: KpiData["summary"];
}

interface CardDef {
  label: string;
  value: string;
  change: number;
  changePercent?: number;
}

function fmt(n: number): string {
  return n.toLocaleString("ko-KR");
}

function ChangeIndicator({
  change,
  changePercent,
}: {
  change: number;
  changePercent?: number;
}) {
  if (change === 0)
    return <span className="text-xs text-gray-400">vs 전월 -</span>;
  const positive = change > 0;
  const color = positive ? "text-green-600" : "text-red-600";
  const arrow = positive ? "\u25B2" : "\u25BC";
  const pct =
    changePercent !== undefined ? ` (${changePercent.toFixed(1)}%)` : "";
  return (
    <span className={`text-xs ${color}`}>
      {arrow} {fmt(Math.abs(change))}
      {pct} vs 전월
    </span>
  );
}

function Card({ card }: { card: CardDef }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 flex-1 min-w-[120px]">
      <p className="text-xs text-gray-500 mb-1">{card.label}</p>
      <p className="text-2xl font-bold text-gray-900">{card.value}</p>
      <div className="mt-1">
        <ChangeIndicator
          change={card.change}
          changePercent={card.changePercent}
        />
      </div>
    </div>
  );
}

function Operator({ symbol }: { symbol: string }) {
  return (
    <span className="text-gray-300 text-lg font-light flex items-center justify-center shrink-0 hidden sm:flex">
      {symbol}
    </span>
  );
}

export default function KpiSummaryCards({ summary }: KpiSummaryCardsProps) {
  const cards: CardDef[] = [
    {
      label: "팔로워",
      value: fmt(summary.followers.value),
      change: summary.followers.change,
      changePercent: summary.followers.changePercent,
    },
    {
      label: "월간 게시물",
      value: `${summary.monthlyPosts.value}개`,
      change: summary.monthlyPosts.change,
      changePercent: summary.monthlyPosts.changePercent,
    },
    {
      label: "평균 ER",
      value: `${summary.avgER.value.toFixed(1)}%`,
      change: summary.avgER.change,
    },
    {
      label: "월간 도달",
      value: fmt(summary.monthlyReach.value),
      change: summary.monthlyReach.change,
      changePercent: summary.monthlyReach.changePercent,
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
      <Card card={cards[0]} />
      <Operator symbol="x" />
      <Card card={cards[1]} />
      <Operator symbol="x" />
      <Card card={cards[2]} />
      <Operator symbol="=" />
      <Card card={cards[3]} />
    </div>
  );
}
