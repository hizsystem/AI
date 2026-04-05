"use client";

interface KpiPeriodLabelProps {
  month: string; // "YYYY-MM"
  onMonthChange: (month: string) => void;
}

function parseMonth(m: string): { year: number; month: number } {
  const [y, mo] = m.split("-").map(Number);
  return { year: y, month: mo };
}

function formatMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function prevMonth(m: string): string {
  const { year, month } = parseMonth(m);
  if (month === 1) return formatMonth(year - 1, 12);
  return formatMonth(year, month - 1);
}

function nextMonth(m: string): string {
  const { year, month } = parseMonth(m);
  if (month === 12) return formatMonth(year + 1, 1);
  return formatMonth(year, month + 1);
}

export default function KpiPeriodLabel({
  month,
  onMonthChange,
}: KpiPeriodLabelProps) {
  const { year, month: mo } = parseMonth(month);
  const prev = parseMonth(prevMonth(month));

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onMonthChange(prevMonth(month))}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        aria-label="이전 달"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M10 4L6 8L10 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <span className="text-sm font-medium text-gray-900">
        {year}년 {mo}월
        <span className="text-gray-400 mx-2">|</span>
        <span className="text-gray-500 font-normal">
          비교: {prev.year}년 {prev.month}월
        </span>
      </span>

      <button
        onClick={() => onMonthChange(nextMonth(month))}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        aria-label="다음 달"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M6 4L10 8L6 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
