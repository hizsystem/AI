"use client";

interface BreakdownItem {
  label: string;
  value: number;
  change?: number;
  changePercent?: number;
  color: string;
}

interface KpiMetricBreakdownProps {
  items: BreakdownItem[];
  unit?: string;
}

function fmt(n: number, unit?: string): string {
  if (unit === "%") return `${n.toFixed(1)}%`;
  return n.toLocaleString("ko-KR");
}

export default function KpiMetricBreakdown({
  items,
  unit,
}: KpiMetricBreakdownProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const positive = (item.change ?? 0) > 0;
        const negative = (item.change ?? 0) < 0;
        return (
          <div key={item.label} className="flex items-start gap-2">
            <span
              className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs text-gray-500">{item.label}</span>
                <span className="text-sm font-semibold text-gray-900 tabular-nums">
                  {fmt(item.value, unit)}
                </span>
              </div>
              {item.change !== undefined && item.change !== 0 && (
                <p
                  className={`text-xs mt-0.5 ${positive ? "text-green-600" : ""} ${negative ? "text-red-600" : ""}`}
                >
                  {positive ? "\u25B2" : "\u25BC"}
                  {fmt(Math.abs(item.change), unit)}
                  {item.changePercent !== undefined &&
                    ` (${item.changePercent.toFixed(1)}%)`}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
