"use client";

import type { LineChartProps } from "@/data/huenic-types";

const PADDING = { top: 30, right: 16, bottom: 24, left: 50 };

export default function KpiLineChart({
  title,
  series,
  labels,
  unit = "",
  height = 240,
}: LineChartProps) {
  const allValues = series.flatMap((s) => s.data);
  if (allValues.length === 0) return null;

  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const range = rawMax - rawMin || 1;
  const dataMin = rawMin - range * 0.1;
  const dataMax = rawMax + range * 0.1;
  const dataRange = dataMax - dataMin;

  const chartW = 600;
  const chartH = height;
  const plotW = chartW - PADDING.left - PADDING.right;
  const plotH = chartH - PADDING.top - PADDING.bottom;

  const xStep = labels.length > 1 ? plotW / (labels.length - 1) : 0;

  function toX(i: number) {
    return PADDING.left + i * xStep;
  }
  function toY(v: number) {
    return PADDING.top + plotH - ((v - dataMin) / dataRange) * plotH;
  }

  // Grid lines (4 lines including top and bottom)
  const gridCount = 4;
  const gridLines = Array.from({ length: gridCount }, (_, i) => {
    const val = dataMin + (dataRange * i) / (gridCount - 1);
    return { y: toY(val), label: formatGridLabel(val, unit) };
  });

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${chartW} ${chartH}`}
        className="w-full"
        style={{ height: `${height}px` }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Legend — top-right */}
        <g transform={`translate(${chartW - PADDING.right}, 6)`}>
          {series.map((s, i) => {
            const offsetX = series
              .slice(i + 1)
              .reduce((sum, ss) => sum + ss.label.length * 7.5 + 24, 0);
            const x = -(offsetX + s.label.length * 7.5 + 12);
            return (
              <g key={s.label} transform={`translate(${x}, 0)`}>
                <circle cx={0} cy={6} r={4} fill={s.color} />
                <text
                  x={8}
                  y={10}
                  fontSize={11}
                  fill="#6b7280"
                  fontFamily="sans-serif"
                >
                  {s.label}
                </text>
              </g>
            );
          })}
        </g>

        {/* Grid lines */}
        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={PADDING.left}
              y1={g.y}
              x2={chartW - PADDING.right}
              y2={g.y}
              stroke="#e5e7eb"
              strokeDasharray="4 3"
              strokeWidth={1}
            />
            <text
              x={PADDING.left - 6}
              y={g.y + 4}
              fontSize={10}
              fill="#9ca3af"
              textAnchor="end"
              fontFamily="sans-serif"
            >
              {g.label}
            </text>
          </g>
        ))}

        {/* Lines and dots */}
        {series.map((s) => {
          const points = s.data
            .map((v, i) => `${toX(i)},${toY(v)}`)
            .join(" ");
          return (
            <g key={s.label}>
              <polyline
                points={points}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {s.data.map((v, i) => (
                <circle
                  key={i}
                  cx={toX(i)}
                  cy={toY(v)}
                  r={3}
                  fill={s.color}
                />
              ))}
            </g>
          );
        })}

        {/* X-axis labels */}
        {labels.map((label, i) => (
          <text
            key={i}
            x={toX(i)}
            y={chartH - 4}
            fontSize={10}
            fill="#9ca3af"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            {label}
          </text>
        ))}
      </svg>
    </div>
  );
}

function formatGridLabel(val: number, unit: string): string {
  if (unit === "%") return `${val.toFixed(1)}%`;
  return Math.round(val).toLocaleString("ko-KR");
}
